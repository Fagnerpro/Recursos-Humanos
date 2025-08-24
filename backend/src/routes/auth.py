# backend/src/routes/auth.py
"""
Rotas de autenticação e autorização
"""
from functools import wraps
from flask import request, jsonify, Blueprint  # <-- adicionamos Blueprint
from datetime import datetime, timezone
import os
import logging

import jwt  # pyjwt
from jwt import InvalidTokenError, ExpiredSignatureError
from flask import Blueprint, jsonify
from src.models import db
from src.models.user import User

# Lê do compose: JWT_SECRET (com fallback seguro para dev)
JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", "dev-secret-change-me"))
JWT_ALG = "HS256"


def _decode_token(token: str):
    """
    Tenta decodificar o token. Se o modelo User tiver verify_token, usa-o.
    Caso contrário, usa pyjwt diretamente.
    """
    # Caminho preferencial: método do modelo (quando implementado)
    if hasattr(User, "verify_token") and callable(getattr(User, "verify_token")):
        try:
            user = User.verify_token(token)
            if user is None:
                return None, {"message": "Token inválido"}
            return user, None
        except Exception as e:
            logging.exception("Falha ao verificar token via User.verify_token")
            return None, {"message": "Token inválido"}

    # Fallback: pyjwt
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except ExpiredSignatureError:
        return None, {"message": "Token expirado"}
    except InvalidTokenError:
        return None, {"message": "Token inválido"}

    user_id = payload.get("sub")
    if not user_id:
        return None, {"message": "Token sem subject"}

    # Busca usuário ativo
    user = db.session.get(User, user_id)  # SQLAlchemy 2.x style; se usar 1.x, troque para query(User).get(...)
    if not user or (hasattr(user, "is_active") and not user.is_active):
        return None, {"message": "Usuário inválido/inativo"}

    return user, None


def require_auth(fn):
    """
    Decorator que exige Authorization: Bearer <token>
    Injeta `current_user` no handler:
        @require_auth
        def rota(current_user):
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"success": False, "message": "Credenciais ausentes"}), 401

        token = auth.replace("Bearer ", "").strip()
        user, err = _decode_token(token)
        if err:
            return jsonify({"success": False, "message": err["message"]}), 401

        # Opcional: política de lock/consent/etc.
        if hasattr(user, "is_account_locked") and callable(user.is_account_locked) and user.is_account_locked():
            return jsonify({"success": False, "message": "Conta temporariamente bloqueada"}), 423

        try:
            # injeta current_user como 1º argumento nomeado
            return fn(current_user=user, *args, **kwargs)
        except Exception:
            logging.exception("Erro interno em rota protegida")
            return jsonify({"success": False, "message": "Erro interno do servidor"}), 500

    return wrapper


def generate_jwt_for_user(user, expires_in: int = 86400) -> str:
    """
    Utilitário para gerar token quando o modelo não oferece generate_token.
    Preferencialmente use user.generate_token(expires_in).
    """
    if hasattr(user, "generate_token") and callable(getattr(user, "generate_token")):
        return user.generate_token(expires_in=expires_in)

    now = datetime.now(tz=timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": getattr(user, "email", None),
        "role": getattr(user, "role", "user"),
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + int(expires_in),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


# =========================
# ✅ Blueprint público aqui
# =========================
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.get("/health")
def health():
    return jsonify(success=True, status="ok")


@auth_bp.get("/me")
@require_auth
def me(current_user):
    # Retorna um payload simples do usuário autenticado
    return jsonify(
        success=True,
        user={
            "id": getattr(current_user, "id", None),
            "email": getattr(current_user, "email", None),
            "role": getattr(current_user, "role", None),
            "active": getattr(current_user, "is_active", True),
        },
    )



