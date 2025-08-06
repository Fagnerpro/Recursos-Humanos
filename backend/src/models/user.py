"""
Modelo de usuário com autenticação e controle de acesso
"""
from sqlalchemy import Column, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os
from .base import BaseModel

class User(BaseModel):
    """Modelo de usuário do sistema"""
    __tablename__ = 'users'
    
    # Dados básicos
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Controle de acesso
    role = Column(Enum('admin', 'recruiter', 'manager', 'analyst', 'viewer', name='user_roles'), 
                  default='viewer', nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    
    # Auditoria de login
    last_login = Column(DateTime)
    login_attempts = Column(String(10), default='0')
    locked_until = Column(DateTime)
    
    # Configurações
    timezone = Column(String(50), default='America/Sao_Paulo')
    language = Column(String(10), default='pt-BR')
    
    # Relacionamentos
    # interviews = relationship("Interview", back_populates="interviewer")
    
    def set_password(self, password):
        """Define a senha do usuário"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica a senha do usuário"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self, expires_in=3600):
        """Gera token JWT para o usuário"""
        payload = {
            'user_id': self.id,
            'email': self.email,
            'role': self.role,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        
        secret_key = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    @staticmethod
    def verify_token(token):
        """Verifica e decodifica token JWT"""
        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def has_permission(self, permission):
        """Verifica se o usuário tem uma permissão específica"""
        permissions = {
            'admin': ['create', 'read', 'update', 'delete', 'manage_users', 'view_analytics'],
            'recruiter': ['create', 'read', 'update', 'conduct_interviews', 'view_candidates'],
            'manager': ['read', 'update', 'view_analytics', 'approve_candidates'],
            'analyst': ['read', 'view_analytics', 'generate_reports'],
            'viewer': ['read']
        }
        
        user_permissions = permissions.get(self.role, [])
        return permission in user_permissions
    
    def record_login(self):
        """Registra login bem-sucedido"""
        self.last_login = datetime.utcnow()
        self.login_attempts = '0'
        self.locked_until = None
    
    def record_failed_login(self):
        """Registra tentativa de login falhada"""
        attempts = int(self.login_attempts or '0') + 1
        self.login_attempts = str(attempts)
        
        if attempts >= 5:
            self.is_locked = True
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)
    
    def is_account_locked(self):
        """Verifica se a conta está bloqueada"""
        if not self.is_locked:
            return False
        
        if self.locked_until and datetime.utcnow() > self.locked_until:
            self.is_locked = False
            self.locked_until = None
            self.login_attempts = '0'
            return False
        
        return True
    
    def to_dict(self, include_sensitive=False):
        """Converte usuário para dicionário"""
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_verified': self.is_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'timezone': self.timezone,
            'language': self.language,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
        
        if include_sensitive:
            data.update({
                'is_locked': self.is_locked,
                'login_attempts': self.login_attempts,
                'locked_until': self.locked_until.isoformat() if self.locked_until else None
            })
        
        return data

