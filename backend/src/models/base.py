"""
Modelo base com funcionalidades de auditoria e conformidade LGPD
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, String, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

Base = declarative_base()

class AuditMixin:
    """Mixin para auditoria de modelos"""
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(String(100))
    updated_by = Column(String(100))
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Campos LGPD
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime)
    data_retention_date = Column(DateTime)
    anonymized = Column(Boolean, default=False, nullable=False)
    anonymized_date = Column(DateTime)

class BaseModel(Base, AuditMixin):
    """Modelo base para todas as entidades"""
    __abstract__ = True
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def anonymize(self):
        """Anonimiza os dados pessoais do modelo"""
        self.anonymized = True
        self.anonymized_date = datetime.utcnow()
        # Implementar lógica específica de anonimização em cada modelo
    
    def soft_delete(self):
        """Exclusão lógica do registro"""
        self.is_active = False
        self.updated_at = datetime.utcnow()

# Configuração do banco de dados
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://assistente_rh_user:secure_password@localhost:5432/assistente_rh')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency para obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Cria todas as tabelas no banco"""
    Base.metadata.create_all(bind=engine)

