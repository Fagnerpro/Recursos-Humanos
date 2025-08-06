"""
Rotas de autenticação e autorização
"""
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from datetime import datetime
from ..models import get_db, User
from ..utils.auth import require_auth, hash_password
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint de login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuário no banco
        db = next(get_db())
        user = db.query(User).filter(User.email == email, User.is_active == True).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Verificar se conta está bloqueada
        if user.is_account_locked():
            return jsonify({
                'success': False,
                'message': 'Conta temporariamente bloqueada. Tente novamente mais tarde.'
            }), 423
        
        # Verificar senha
        if not user.check_password(password):
            user.record_failed_login()
            db.commit()
            
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Login bem-sucedido
        user.record_login()
        db.commit()
        
        # Gerar token
        token = user.generate_token(expires_in=86400)  # 24 horas
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'data': {
                'token': token,
                'user': user.to_dict(),
                'expires_in': 86400
            }
        }), 200
        
    except Exception as e:
        logging.error(f"Erro no login: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint de registro de usuário"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Campo {field} é obrigatório'
                }), 400
        
        email = data['email'].lower().strip()
        
        # Verificar se email já existe
        db = next(get_db())
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email já cadastrado'
            }), 409
        
        # Criar novo usuário
        user = User(
            email=email,
            full_name=data['full_name'].strip(),
            role=data.get('role', 'viewer'),
            timezone=data.get('timezone', 'America/Sao_Paulo'),
            language=data.get('language', 'pt-BR'),
            consent_given=data.get('consent_given', False),
            consent_date=datetime.utcnow() if data.get('consent_given') else None
        )
        
        user.set_password(data['password'])
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'data': {
                'user': user.to_dict()
            }
        }), 201
        
    except Exception as e:
        logging.error(f"Erro no registro: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user(current_user):
    """Retorna dados do usuário atual"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'user': current_user.to_dict()
            }
        }), 200
        
    except Exception as e:
        logging.error(f"Erro ao buscar usuário atual: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@require_auth
def refresh_token(current_user):
    """Renova token de acesso"""
    try:
        # Gerar novo token
        new_token = current_user.generate_token(expires_in=86400)
        
        return jsonify({
            'success': True,
            'message': 'Token renovado com sucesso',
            'data': {
                'token': new_token,
                'expires_in': 86400
            }
        }), 200
        
    except Exception as e:
        logging.error(f"Erro ao renovar token: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout(current_user):
    """Endpoint de logout"""
    try:
        # Em uma implementação completa, você poderia invalidar o token
        # adicionando-o a uma blacklist no Redis
        
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        }), 200
        
    except Exception as e:
        logging.error(f"Erro no logout: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password(current_user):
    """Alterar senha do usuário"""
    try:
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'Senha atual e nova senha são obrigatórias'
            }), 400
        
        # Verificar senha atual
        if not current_user.check_password(data['current_password']):
            return jsonify({
                'success': False,
                'message': 'Senha atual incorreta'
            }), 401
        
        # Definir nova senha
        current_user.set_password(data['new_password'])
        
        db = next(get_db())
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso'
        }), 200
        
    except Exception as e:
        logging.error(f"Erro ao alterar senha: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

