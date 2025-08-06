"""
Inicialização dos modelos do sistema
"""
from .base import Base, BaseModel, get_db, create_tables
from .user import User
from .candidate import Candidate
from .interview import Interview

__all__ = [
    'Base',
    'BaseModel', 
    'get_db',
    'create_tables',
    'User',
    'Candidate', 
    'Interview'
]

