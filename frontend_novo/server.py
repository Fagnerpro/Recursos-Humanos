#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler ):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    PORT = 8080
    
    # Mudar para o diretório do frontend
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    Handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Servidor Enterprise iniciado!" )
        print(f"📍 URL: http://localhost:{PORT}" )
        print(f"📁 Servindo: {frontend_dir}")
        print(f"🎯 Pressione Ctrl+C para parar")
        
        # Abrir automaticamente no navegador
        webbrowser.open(f'http://localhost:{PORT}' )
        
        try:
            httpd.serve_forever( )
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado")

if __name__ == "__main__":
    start_server()
