import os
import logging
from flask import Flask, request, g
from flask_migrate import Migrate

from src.models import db
from src.routes.health import bp as health_bp
from src.routes.admin import admin_bp
from src.routes.users import bp as users_bp
from src.routes.candidates import bp as candidates_bp
from src.routes.auth import auth_bp
from src.routes.health_advanced import health_bp as health_advanced_bp

# Importar sistemas de monitoramento e segurança
from src.monitoring.logging_config import setup_logging
from src.monitoring.metrics import metrics_collector, monitor_request
from src.security.middleware import setup_security_middleware

def create_app():
    """Cria e configura a aplicação Flask para produção"""
    app = Flask(__name__)
    
    # Configurações de segurança
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', os.urandom(32)),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', os.urandom(32)),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:postgres@db:5432/postgres",
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={
            'pool_size': int(os.getenv('DB_POOL_SIZE', '10')),
            'pool_timeout': int(os.getenv('DB_POOL_TIMEOUT', '30')),
            'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', '3600')),
            'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', '20'))
        },
        
        # Configurações de upload
        MAX_CONTENT_LENGTH=int(os.getenv('MAX_UPLOAD_SIZE', '50')) * 1024 * 1024,  # 50MB default
        UPLOAD_FOLDER=os.getenv('UPLOAD_FOLDER', '/app/uploads'),
        
        # Configurações de sessão
        SESSION_COOKIE_SECURE=os.getenv('ENVIRONMENT') == 'production',
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=3600,  # 1 hora
        
        # Configurações de cache
        REDIS_URL=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
        
        # Configurações de produção
        TESTING=os.getenv('TESTING', 'false').lower() == 'true',
        DEBUG=os.getenv('DEBUG', 'false').lower() == 'true',
        ENVIRONMENT=os.getenv('ENVIRONMENT', 'development')
    )
    
    # Configurar strict slashes
    app.url_map.strict_slashes = False
    
    # Configurar logging estruturado
    logger = setup_logging(app)
    logger.info(f"Starting application in {app.config['ENVIRONMENT']} mode")
    
    # Inicializar banco de dados
    db.init_app(app)
    Migrate(app, db)
    
    # Configurar middleware de segurança
    setup_security_middleware(app)
    
    # Middleware de monitoramento
    @app.before_request
    def before_request():
        """Middleware executado antes de cada requisição"""
        g.start_time = time.time()
        metrics_collector.active_connections += 1
        
        # Log da requisição
        logger.info(f"Request started: {request.method} {request.path}")
    
    @app.after_request
    def after_request(response):
        """Middleware executado após cada requisição"""
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            
            # Registrar métricas
            metrics_collector.record_request(
                request.method,
                request.endpoint or 'unknown',
                response.status_code,
                duration
            )
            
            # Adicionar headers de performance
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
            if hasattr(g, 'request_id'):
                response.headers['X-Request-ID'] = g.request_id
        
        metrics_collector.active_connections = max(0, metrics_collector.active_connections - 1)
        return response
    
    # Handler de erro global
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handler global para exceções não tratadas"""
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        
        # Em produção, não expor detalhes do erro
        if app.config['ENVIRONMENT'] == 'production':
            return {'error': 'Erro interno do servidor'}, 500
        else:
            return {'error': str(e)}, 500
    
    @app.errorhandler(404)
    def handle_404(e):
        """Handler para erro 404"""
        return {'error': 'Endpoint não encontrado'}, 404
    
    @app.errorhandler(429)
    def handle_rate_limit(e):
        """Handler para rate limit"""
        return {
            'error': 'Muitas requisições',
            'message': 'Tente novamente em alguns minutos'
        }, 429
    
    # Registrar blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(health_advanced_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(auth_bp)
    
    # Criar diretórios necessários
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('/app/logs', exist_ok=True)
    
    # Endpoint de informações da aplicação
    @app.route('/info')
    def app_info():
        """Informações básicas da aplicação"""
        return {
            'name': 'Assistente de RH',
            'version': '1.0.0',
            'environment': app.config['ENVIRONMENT'],
            'status': 'running'
        }
    
    logger.info("Application created successfully")
    return app

# Criar aplicação
app = create_app()

# Importar time para o middleware
import time

if __name__ == '__main__':
    # Configuração para desenvolvimento
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )

