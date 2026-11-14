import os
import atexit
import webview
import threading
from api import Api

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(ROOT_DIR, 'index.html')

def on_start(window):
    window.maximize()

if __name__ == '__main__':
    api = Api()
    window = webview.create_window('Vault', INDEX_PATH, js_api=api,
                        width=500, height=500)
    api._window = window

    def _shutdown():
        api.stop_stream()
        
    def _on_closing():
        if api._close_confirmed or not api.is_busy():
            return True
            
        threading.Thread(
                target = lambda: window.evaluate_js('onCloseRequested()'), daemon = True
        ).start()
        return False

    window.events.closing += _on_closing
    window.events.closed += _shutdown
    atexit.register(_shutdown)

    webview.start(on_start, window)            