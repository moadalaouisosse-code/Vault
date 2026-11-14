import os, sys, subprocess, json, hashlib, secrets, socket, time, shutil, threading
from pathlib import Path
import base64
import webview
import keyring
import hmac
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
from urllib.parse import quote
from keyring.errors import PasswordDeleteError


# Paths

def resource_path(name):
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, name)


def app_data_dir():
    base = os.environ.get('APPDATA') or Path.home() / 'AppData' / 'Roaming'
    d = Path(base) / 'Vault'
    d.mkdir(parents=True, exist_ok=True)
    return d


RCLONE = resource_path('rclone.exe')
STORE_PATH = app_data_dir() / 'vault.dat'
EMPTY_CONF = app_data_dir() / 'empty.conf'
SETTINGS_PATH = app_data_dir() / 'settings.dat'
EMPTY_CONF.touch(exist_ok = True)           
NO_WINDOW = getattr(subprocess, 'CREATE_NO_WINDOW', 0) #passing create_no_window to windows app, default to 0 on others
REMOTE = 'vault'


# Encryption helpers


def get_key():
    k = keyring.get_password('Vault', 'encryption-key')
    if not k:
        key = AESGCM.generate_key(bit_length=256)
        keyring.set_password('Vault', 'encryption-key', base64.b64encode(key).decode())
        return key
    return base64.b64decode(k)


def encrypt(data: bytes) -> bytes:
    nonce = os.urandom(12)  # new random nonce on every encryption
    return nonce + AESGCM(get_key()).encrypt(nonce, data, None)


def decrypt(blob: bytes) -> bytes:
    return AESGCM(get_key()).decrypt(blob[:12], blob[12:], None)

#crypt files

def load_store():
    if not STORE_PATH.exists():
        return{}
    return json.loads(decrypt(STORE_PATH.read_bytes()).decode('utf-8'))
    
def save_store(store):
    part = STORE_PATH.with_suffix('.part')
    part.write_bytes(encrypt(json.dumps(store).encode('utf-8')))
    os.replace(part, STORE_PATH)
    
def load_settings():
    try:
        if not SETTINGS_PATH.exists():
            return {}
        return json.loads(decrypt(SETTINGS_PATH.read_bytes()).decode('utf-8'))
    except (OSError, ValueError, InvalidTag):
        return {}

        
def save_settings(s):
    part = SETTINGS_PATH.with_suffix('.part')
    part.write_bytes(encrypt(json.dumps(s).encode('utf-8')))
    os.replace(part, SETTINGS_PATH)
    
    
#rclone helpers

def rclone_cmd(*args):
    return[RCLONE, '--config', str(EMPTY_CONF), *args]
    
def rclone_env(account_id, app_key):
    env = os.environ.copy()
    env['RCLONE_CONFIG_VAULT_TYPE'] = 'b2'
    env['RCLONE_CONFIG_VAULT_ACCOUNT'] = account_id
    env['RCLONE_CONFIG_VAULT_KEY'] = app_key
    env['RCLONE_CONFIG_VAULT_HARD_DELETE'] = 'true'
    return env
    

def drop_password(bucket):
    try:
        keyring.delete_password('Vault', f'{bucket}_password')
    except PasswordDeleteError:
        pass


# API -- communicates with the frontend


class Api:

    def __init__(self):
        self._window = None
        self.active_remote = None
        self._proc = None
        self._abort_requested = False
        self._cancel_requested = False
        self._stream_proc = None
        self._stream_base = None
        self._stream_bucket = None
        self._is_fs = False
        self._renaming = False
        self._rename_proc = None
        self._uploading = False
        self._downloading = False
        self._close_confirmed = False
        self._stream_lock = threading.RLock()
        
    # local server methods    
        
    def set_window_fullscreen(self, make_fullscreen):
        if self._window and self._is_fs != make_fullscreen:
            self._window.toggle_fullscreen()
            self._is_fs = make_fullscreen
        
    
    def _free_port(self):
        s = socket.socket()
        s.bind(('127.0.0.1', 0)) #port 0 simply asks the os for a free port, so you assign dynamically without binding the local server to a specific port.
        port = s.getsockname()[1]
        s.close()
        return port
        
    def start_stream(self):
        
        with self._stream_lock:
            env = self._active_env()
            if env is None:
                return {'ok':False, 'error': 'Not connected.'}
                
            if(self._stream_proc and self._stream_proc.poll() is None
                    and self._stream_bucket == self.active_remote):
                return {'ok':True, 'base': self._stream_base}
                
            self.stop_stream() #clean up any stale server
            
            port = self._free_port()
            token = secrets.token_urlsafe(16)
            
            self._stream_proc = subprocess.Popen(
                                rclone_cmd('serve', 'http', f'{REMOTE}:{self.active_remote}',
                                '--addr', f'127.0.0.1:{port}', '--baseurl', f'/{token}',
                                '--read-only', '--vfs-read-chunk-size', '20M',
                                '--vfs-read-chunk-size-limit', '20M',
                                '--dir-cache-time', '10s'
                                ),
                                env=env,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                creationflags=NO_WINDOW
            )
            
            for _ in range(50): #5 secs loop
                if self._stream_proc.poll() is not None:
                    self._stream_proc = None
                    return {'ok':False, 'error':'Stream server failed to start.'}
                try:
                    socket.create_connection(('127.0.0.1', port), timeout=0.2).close()
                    break
                except OSError:
                    time.sleep(0.1)
                    
            else:
                self.stop_stream()
                return {'ok':False, 'error':'Stream server did not respond.'}
                
            self._stream_bucket = self.active_remote
            self._stream_base = f'http://127.0.0.1:{port}/{token}'
            return {'ok': True, 'base':self._stream_base}
        
        
    def stop_stream(self):
        
        with self._stream_lock:
            p = self._stream_proc
            self._stream_proc = None
            self._stream_base = None
            self._stream_bucket = None
            if p and p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    p.kill()
            return {'ok':True}
        
    
    # local server methods end.
    
    # external player
    
    def _find_player(self):
        saved = load_settings().get('player')
        if saved and os.path.exists(saved):
            return [saved]
            
        for exe in ('vlc', 'mpv'):
            p = shutil.which(exe)
            if p:
                return [p]
        if os.name == 'nt':
            for base in filter(None, (os.environ.get('ProgramFiles'),
                                    os.environ.get('ProgramFiles(x86)'))):
                p = os.path.join(base, 'VideoLAN', 'VLC', 'vlc.exe')
                if os.path.exists(p):
                    return [p]
                    
        elif shutil.which('flatpak'):
            r = subprocess.run(['flatpak', 'info', 'org.videolan.VLC'], 
                            capture_output=True
                            )
            if r.returncode == 0:
                return ['flatpak', 'run', 'org.videolan.VLC']
        return None
        
        
        
    def open_external(self, name):
        if not self._valid_names([name]):
            return {'ok':False,'error':'Invalid file name.'}
            
        player = self._find_player()
        if player is None:
            return {'ok':False, 'no_player':True, 'error': 'No video player found.'}
            
        s = self.start_stream()
        if not s['ok']:
            return s
            
        url = f"{s['base']}/{quote(name, safe='/')}"
        kwargs = {'creationflags': NO_WINDOW} if os.name == 'nt' else {'start_new_session': True}
        try:
            subprocess.Popen([*player, url],
                        stdin=subprocess.DEVNULL,
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        **kwargs
                        )
                        
        except OSError as e:
            return {'ok':False, 'error':str(e)}
        return {'ok':True}
        
        
    def pick_player(self):
        paths = self._window.create_file_dialog(webview.FileDialog.OPEN)
        if not paths:
            return {'ok':False}
        s = load_settings()
        s['player'] = paths[0]
        save_settings(s)
        return {'ok':True}
        
    # external player end
    
        
    def _active_env(self):
        if not self.active_remote:
            return None
        try:
            creds = load_store().get(self.active_remote)
        except InvalidTag:
            return None
            
        if not creds:
            return None
        return rclone_env(creds['account'], creds['key'])
        

    def get_status(self):
        try:
            store = load_store()
        except InvalidTag:
            return {'ok': False, 'remotes': [], 'bucket': None,
                    'error': 'Config could not be decrypted (wrong key or file changed).'}

        return {
            'ok': True,
            'remotes': [
                    {'name': b, 'has_password': keyring.get_password('Vault', f'{b}_password') is not None}
                    for b in store.keys()],
            'bucket': self.active_remote
        }
        
        
    def _valid_names(self, names):
        return (
            isinstance(names, list) and len(names) > 0 and
            all(
                isinstance(n, str) and n.strip()
                and not n.startswith('/')
                and not any(c in n for c in '\r\n\0')
                and all(seg not in ('', '.', '..') for seg in n.split('/'))
                for n in names
            )
        )
        
        

    def _item(self, path):
        is_dir = os.path.isdir(path)
        return {
            'path': path,
            'name': os.path.basename(path),
            'is_dir': is_dir,
            'size': None if is_dir else os.path.getsize(path),
        }

    def pick_files(self):
        paths = self._window.create_file_dialog(webview.FileDialog.OPEN, allow_multiple=True)
        return {'ok': True, 'items': [self._item(p) for p in (paths or [])]}

    def pick_folder(self):
        paths = self._window.create_file_dialog(webview.FileDialog.FOLDER)
        return {'ok': True, 'items': [self._item(p) for p in (paths or [])]}

    def add_remote(self, account_id, app_key, bucket, pw):
        try:
            store = load_store()
        except InvalidTag:
            return {'ok':False, 'error': 'Saved buckets could not be decrypted.'}
            
        if bucket in store:
            return {'ok':False, 'error': 'Bucket is already saved.'}

        try:
            verify = subprocess.run(rclone_cmd('lsd', f'{REMOTE}:{bucket}'), timeout=120,
                                    env=rclone_env(account_id, app_key),
                                    capture_output=True,
                                    creationflags=NO_WINDOW)
        except subprocess.TimeoutExpired:
            return {'ok': False, 'error': 'Connection timed out.'}

        if verify.returncode != 0:
            return {'ok': False, 'error': 'Could not connect, check your credentials.'}
        
        store[bucket] = {'account': account_id, 'key': app_key}
        save_store(store)
        
        if pw:
            salt = os.urandom(16)
            raw_hash = hashlib.scrypt(
                pw.encode(),
                salt=salt,
                n=2**14, #cpu memory required for the hash, higher is more secure, appearently
                r=8, #size of memory blocks mid calculation
                p=1, #parallelization param. in our case 1 thread.
                
            )
            
            salt_str = salt.hex()
            hash_str = raw_hash.hex()
            keyring.set_password('Vault', f'{bucket}_password', f'{salt_str}:{hash_str}')    
        else:
            drop_password(bucket)
        
        return {'ok': True}

    def connect_remote(self, bucket, password):
        get_pw = keyring.get_password('Vault', f'{bucket}_password')
        
        if get_pw is None:
            self.stop_stream()
            self.active_remote = bucket
            return {'ok': True}
        else:
            salt_str, hash_str = get_pw.split(':')
            salt_raw = bytes.fromhex(salt_str)
            login_hash = hashlib.scrypt(
                password.encode(),
                salt=salt_raw,
                n=2**14,
                r=8,
                p=1
            )
            
            if hmac.compare_digest(hash_str, login_hash.hex()):
                self.stop_stream()
                self.active_remote = bucket
                return {'ok': True}
            else:
                return {'ok': False, 'error':'Password does not match'}

    def disconnect(self):
        self.active_remote = None
        self.stop_stream()
        return {'ok': True}

    def delete_remote(self, bucket):
        if self.active_remote == bucket:
            self.active_remote = None
            self.stop_stream()
        
        try:
            store = load_store()
        except InvalidTag:
            return {'ok': False, 'error': f'Could not delete {bucket}'}
            
        store.pop(bucket, None)
        save_store(store)
        drop_password(bucket)
        return {'ok': True}

#    def get_folders(self):
#        env = self._active_env()
#        if env is None:
#           return {'ok': False, 'error': 'Not connected.'}

#        try:
#            result = subprocess.run(
#                rclone_cmd('lsf', f'{REMOTE}:{self.active_remote}', '--dirs-only'), timeout=120,
#                env=env,
#                capture_output=True, text=True,
#                encoding='utf-8',
#                creationflags=NO_WINDOW
#            )
#        except subprocess.TimeoutExpired:
#            return {'ok': False, 'error': 'Connection timed out.'}
        
#        if result.returncode != 0:
#            return {'ok': False, 'error': 'Could not list folders.'}

#        folders = [r.strip() for r in result.stdout.splitlines() if r.strip()]
#        return {'ok': True, 'folders': folders}
    
    
    def upload(self, local_path, prefix=''):
        self._uploading = True
        try:
            return self._upload(local_path, prefix)
        finally:
            self._uploading = False
    
    def _upload(self, local_path, prefix=''):
        env = self._active_env()
        if env is None:
            return {'ok': False, 'error': 'Not connected.'}
            
        if not os.path.exists(local_path):
            return {'ok': False, 'error': f'File not found: {local_path}'}

        if not isinstance(prefix, str) or (prefix and (not prefix.endswith('/') or not self._valid_names([prefix[:-1]]))):
            return {'ok': False, 'error': 'Invalid folder name.'}

        self._abort_requested = False

        if os.path.isdir(local_path):
            name = os.path.basename(local_path)
            dest = f'{REMOTE}:{self.active_remote}/{prefix}{name}'
        else:
            dest = f'{REMOTE}:{self.active_remote}/{prefix}'

        proc = subprocess.Popen(
            rclone_cmd('copy', local_path, dest, '--use-json-log', '--stats', '1s', '-v'),
            env=env,
            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
            creationflags=NO_WINDOW,
            text=True,
            encoding='utf-8'
        )
        
        self._proc = proc # entry point to the pipe, allowing confirm_close to shut this one down via terminate

        last_error = ''
        for line in proc.stderr:
            if self._abort_requested:
                proc.terminate()
                proc.wait()
                proc = None
                clean_up = subprocess.run(
                    rclone_cmd('cleanup', f'{REMOTE}:{self.active_remote}'),
                    env=env, capture_output=True, creationflags=NO_WINDOW)
                if clean_up.returncode != 0:
                    return {'ok': False, 'error': 'Aborted but failed to clean up!'}
                return {'ok': False, 'aborted': True}

            try:
                data = json.loads(line)
            except ValueError:
                continue

            stats = data.get('stats')
            if stats and stats.get('totalBytes'):
                pct = int(stats['bytes'] / stats['totalBytes'] * 100)
                self._window.evaluate_js(f'updateProgress({pct})')
            elif data.get('level') == 'error':
                last_error = data.get('msg', '')

        proc.wait()
        returncode = proc.returncode

        if returncode != 0:
            return {'ok': False, 'error': last_error or 'Upload failed.'}
        return {'ok': True}

    def abort_upload(self):
        self._abort_requested = True
        return {'ok': True}
        
    def list_files(self):
        env = self._active_env()
        if env is None:
            return {'ok': False, 'error': 'Not connected.'}
        
        try:
            result = subprocess.run(
                                        rclone_cmd('lsf', '-R', '--files-only', '--format', 'pst', f'{REMOTE}:{self.active_remote}'),
                                        timeout=120, env=env,
                                        capture_output=True,
                                        text=True,
                                        encoding='utf-8',
                                        creationflags=NO_WINDOW
                )
        except subprocess.TimeoutExpired:
            return {'ok': False, 'error': 'Connection timed out.'}
        
        if result.returncode != 0:
            return {'ok':False, 'error': 'Unable to fetch the file list from the bucket.'}
            
        files_list = [r.strip() for r in result.stdout.splitlines() if r.strip()]
        return {'ok':True, 'files': files_list}
    
    
    def pick_download_dir(self):
        paths = self._window.create_file_dialog(webview.FileDialog.FOLDER)
        return {'ok': True, 'path': paths[0] if paths else None}
    
    
    def download(self, names, local_path):
        self._downloading = True
        try:
            return self._download(names, local_path)
        finally:
            self._downloading = False
    
    
    def _download(self, names, local_path):
        env = self._active_env()
        if env is None:
            return {'ok': False, 'error': 'Not connected.'}
            
        if not os.path.exists(local_path):
            return {'ok': False, 'error': f'directory not found: {local_path}'}
        
        if isinstance(names, str):
            names = [names]
        
        if not self._valid_names(names):
            return {'ok': False, 'error': 'Invalid file list.'}        
            
        self._cancel_requested = False
        total = len(names)
        
        for current_index, name in enumerate(names):

            if self._cancel_requested:
                return {'ok': False, 'canceled': True}
                
            filename = os.path.basename(name)
            base, ext = os.path.splitext(filename)
            counter = 1
            
            while os.path.exists(os.path.join(local_path, filename)):
                filename = f"{base}({counter}){ext}"
                counter += 1
            
            self._window.evaluate_js(f'updateDownloadProgress(0, {current_index}, {total})')
            proc = subprocess.Popen(
                rclone_cmd('copyto', f'{REMOTE}:{self.active_remote}/{name}', os.path.join(local_path, filename), '--use-json-log', '--stats', '1s', '-v'),
                env=env,
                stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                creationflags=NO_WINDOW,
                text=True,
                encoding='utf-8'
            )
            
            self._proc = proc #aanother entry point

            last_error = ''
            
            for line in proc.stderr:
                if self._cancel_requested:
                    proc.terminate()
                    proc.wait()
                    proc = None
                    return {'ok': False, 'canceled': True}

                try:
                    data = json.loads(line)
                except ValueError:
                    continue

                stats = data.get('stats')
                if stats and stats.get('totalBytes'):
                    pct = int(stats['bytes'] / stats['totalBytes'] * 100)
                    self._window.evaluate_js(f'updateDownloadProgress({pct})')
                elif data.get('level') == 'error':
                    last_error = data.get('msg', '')

            proc.wait()
            returncode = proc.returncode
            proc = None

            if returncode != 0:
                return {'ok': False, 'error': last_error or 'Download failed.'}

        return {'ok':True}
        
    def cancel_download(self):
        self._cancel_requested = True
        return {'ok': True}
        
        
    def delete_files(self, names):
        env = self._active_env()
        if env is None:
            return {'ok': False, 'error': 'Not connected.'}
        
        if isinstance(names, str):
            names = [names]
        
        #ensures rclone is NEVER handed an empty or odd list that may result in nuking the bucket. VERY IMPORTANT STEP!
        if not self._valid_names(names):
            return{'ok':False,'error':'Invalid file list.'}
        
        file_list = "\n".join(names)
        
        def run(*extra):
            return subprocess.run(rclone_cmd('delete', f'{REMOTE}:{self.active_remote}', '--files-from-raw', '-',
                                    *extra),
                                    env=env,
                                    input=file_list,
                                    capture_output=True,
                                    text=True,
                                    encoding='utf-8',
                                    creationflags=NO_WINDOW
            )
            
        preview = run('--dry-run')
        would = preview.stderr.count('Skipped delete as --dry-run')

        if preview.returncode == 0 and int(would) == int(len(names)):
            run_delete = run()
            if run_delete.returncode != 0:
                return {'ok':False, 'error':'Unable to delete files, please try again later.'}
            return {'ok':True,'msg':f'{len(names)} file(s) deleted from the bucket.'}
            
        return {'ok':False, 'error':'file list to delete does not match, skipped for safety!'}
        
        
    def rename_file(self, old_name, new_name):
        self._renaming = True
        
        try:
            env = self._active_env()
            if env is None:
                return {'ok': False, 'error': 'Not connected.'}
                
            if old_name == new_name or not self._valid_names([old_name, new_name]):
                return{'ok':False,'error':'Invalid file name.','code':'invalid'}
            
            parent, _, base = new_name.rpartition('/')
            file_path = f'{REMOTE}:{self.active_remote}/{parent}' if parent else f'{REMOTE}:{self.active_remote}'
            find = subprocess.run(
                            rclone_cmd('lsf', file_path,
                            '--max-depth', '1'),
                            env = env,
                            capture_output=True,
                            text=True,
                            encoding='utf-8',
                            creationflags=NO_WINDOW
            )
            
            if find.returncode not in (0, 3):
                return{'ok':False,'error':'Unable to verify before proceeding.'}
            
            if find.returncode == 0 and base in [f.rstrip('/') for f in find.stdout.splitlines()]:
                return{'ok':False,'error':'File already exists', 'code':'exists'}

            
            rename = subprocess.Popen(
                                rclone_cmd('moveto', f'{REMOTE}:{self.active_remote}/{old_name}',
                                f'{REMOTE}:{self.active_remote}/{new_name}', '--ignore-existing',
                                '--immutable', '-vv'),
                                env=env,
                                stdout = subprocess.PIPE,
                                stderr = subprocess.PIPE,
                                text=True,
                                encoding='utf-8',
                                creationflags=NO_WINDOW
            )
            self._rename_proc = rename
            _, err = rename.communicate()
                
            if 'Destination exists, skipping' in err:
                return {'ok': False, 'error': 'File already exists.', 'code': 'exists'}
            if rename.returncode != 0:
                if 'not found' in err.lower():
                    return {'ok': False, 'error': 'File no longer exists.', 'code': 'not_found'}
                return {'ok': False, 'error': 'Operation failed.'}
            return {'ok': True, 'name': new_name}
        finally:
            self._rename_proc = None
            self._renaming = False
        
        
    def is_busy(self):
        return self._renaming or self._uploading or self._downloading
        
    
    def confirm_close(self):
        self._close_confirmed = True
        self._cancel_requested = True
        was_writing = self._renaming or self._uploading
        
        try:
            for p in (self._rename_proc, self._proc):
                if p and p.poll() is None:
                    p.terminate()
                    try:
                        p.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        p.kill()
            env = self._active_env()
            if was_writing and env:
                try:
                    subprocess.run(rclone_cmd('cleanup', f'{REMOTE}:{self.active_remote}'),
                                env=env,
                                capture_output=True,
                                timeout=60,
                                creationflags=NO_WINDOW
                    )
                except subprocess.TimeoutExpired:
                    pass
                    
        finally:
            self._window.destroy()
        return {'ok':True}