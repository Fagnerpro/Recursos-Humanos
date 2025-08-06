"""
Modelo de candidato com conformidade LGPD
"""
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import json
from .base import BaseModel

class Candidate(BaseModel):
    """Modelo de candidato"""
    __tablename__ = 'candidates'
    
    # Dados pessoais
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20))
    
    # Dados profissionais
    position_applied = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0)
    current_company = Column(String(255))
    current_position = Column(String(255))
    skills = Column(Text)  # JSON string com habilidades
    
    # Dados de recrutamento
    source = Column(String(100))  # LinkedIn, site, indicação, etc.
    recruiter_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(50), default='novo')  # novo, triagem, entrevista, aprovado, rejeitado
    
    # Scoring e avaliação
    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    behavioral_score = Column(Float, default=0.0)
    cultural_fit_score = Column(Float, default=0.0)
    
    # Dados da entrevista
    interview_scheduled = Column(DateTime)
    interview_completed = Column(DateTime)
    interview_notes = Column(Text)
    interview_recording_path = Column(String(500))
    
    # Análise de IA
    ai_analysis = Column(Text)  # JSON com análise detalhada
    ai_recommendation = Column(String(50))  # CONTRATAR, CONSIDERAR, REJEITAR
    ai_confidence = Column(Float, default=0.0)
    
    # Dados LGPD específicos
    cv_file_path = Column(String(500))
    portfolio_url = Column(String(500))
    linkedin_url = Column(String(500))
    
    # Relacionamentos
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    # interviews = relationship("Interview", back_populates="candidate")
    
    def calculate_overall_score(self):
        """Calcula score geral baseado nos scores específicos"""
        weights = {
            'technical': 0.4,
            'behavioral': 0.3,
            'cultural_fit': 0.3
        }
        
        self.overall_score = (
            self.technical_score * weights['technical'] +
            self.behavioral_score * weights['behavioral'] +
            self.cultural_fit_score * weights['cultural_fit']
        )
        
        return self.overall_score
    
    def get_skills_list(self):
        """Retorna lista de habilidades"""
        if not self.skills:
            return []
        try:
            return json.loads(self.skills)
        except:
            return self.skills.split(',') if self.skills else []
    
    def set_skills_list(self, skills_list):
        """Define lista de habilidades"""
        if isinstance(skills_list, list):
            self.skills = json.dumps(skills_list)
        else:
            self.skills = str(skills_list)
    
    def get_ai_analysis_dict(self):
        """Retorna análise de IA como dicionário"""
        if not self.ai_analysis:
            return {}
        try:
            return json.loads(self.ai_analysis)
        except:
            return {}
    
    def set_ai_analysis_dict(self, analysis_dict):
        """Define análise de IA"""
        self.ai_analysis = json.dumps(analysis_dict, ensure_ascii=False)
    
    def anonymize(self):
        """Anonimiza dados pessoais do candidato (LGPD)"""
        super().anonymize()
        
        # Anonimizar dados pessoais
        self.full_name = f"Candidato_{self.id}"
        self.email = f"anonimo_{self.id}@example.com"
        self.phone = None
        self.current_company = "Empresa Anônima"
        self.linkedin_url = None
        
        # Manter apenas dados estatísticos
        # technical_score, behavioral_score, etc. podem ser mantidos para análises
    
    def get_retention_date(self):
        """Calcula data de retenção dos dados"""
        # LGPD: dados podem ser mantidos por até 5 anos para fins estatísticos
        return self.created_at + timedelta(days=5*365)
    
    def should_be_anonymized(self):
        """Verifica se os dados devem ser anonimizados"""
        if self.anonymized:
            return False
        
        # Anonimizar após 2 anos se não contratado
        if self.status in ['rejeitado', 'desistiu']:
            return datetime.utcnow() > (self.created_at + timedelta(days=2*365))
        
        return False
    
    def get_status_display(self):
        """Retorna status em formato legível"""
        status_map = {
            'novo': 'Novo',
            'triagem': 'Em Triagem',
            'entrevista': 'Entrevista Agendada',
            'entrevista_realizada': 'Entrevista Realizada',
            'aprovado': 'Aprovado',
            'rejeitado': 'Rejeitado',
            'contratado': 'Contratado',
            'desistiu': 'Desistiu'
        }
        return status_map.get(self.status, self.status)
    
    def to_dict(self, include_sensitive=False):
        """Converte candidato para dicionário"""
        data = {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email if not self.anonymized else None,
            'position_applied': self.position_applied,
            'experience_years': self.experience_years,
            'skills': self.get_skills_list(),
            'status': self.status,
            'status_display': self.get_status_display(),
            'overall_score': round(self.overall_score, 1) if self.overall_score else 0,
            'technical_score': round(self.technical_score, 1) if self.technical_score else 0,
            'behavioral_score': round(self.behavioral_score, 1) if self.behavioral_score else 0,
            'cultural_fit_score': round(self.cultural_fit_score, 1) if self.cultural_fit_score else 0,
            'ai_recommendation': self.ai_recommendation,
            'ai_confidence': round(self.ai_confidence, 2) if self.ai_confidence else 0,
            'created_at': self.created_at.isoformat(),
            'interview_scheduled': self.interview_scheduled.isoformat() if self.interview_scheduled else None,
            'interview_completed': self.interview_completed.isoformat() if self.interview_completed else None,
            'anonymized': self.anonymized
        }
        
        if include_sensitive and not self.anonymized:
            data.update({
                'phone': self.phone,
                'current_company': self.current_company,
                'current_position': self.current_position,
                'linkedin_url': self.linkedin_url,
                'interview_notes': self.interview_notes,
                'ai_analysis': self.get_ai_analysis_dict()
            })
        
        return data

