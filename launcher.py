"""Inicializador local do ClassiQuiz. Usa apenas a biblioteca padrão do Python."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import sys
import webbrowser
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    url = 'http://127.0.0.1:8765/'
    try:
        httpd = ThreadingHTTPServer(('127.0.0.1', 8765), QuietHandler)
    except OSError:
        try:
            with urlopen(url, timeout=2) as response:
                content = response.read(4000).decode('utf-8', errors='ignore')
            if 'ClassiQuiz' in content:
                print('O ClassiQuiz já está aberto neste computador.')
                webbrowser.open(url)
            else:
                print('A porta 8765 está em uso por outro programa.')
                sys.exit(1)
        except Exception:
            print('Não foi possível abrir a porta local 8765. Feche o programa que a utiliza.')
            sys.exit(1)
    else:
        with httpd:
            print('ClassiQuiz 2.0.8: ' + url)
            print('Deixe esta janela aberta enquanto joga. Ctrl+C para encerrar.')
            threading.Timer(0.7, lambda: webbrowser.open(url)).start()
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                pass
