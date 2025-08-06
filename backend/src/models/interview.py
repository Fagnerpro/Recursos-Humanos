"""
Modelo de entrevista com análise de áudio e IA
"""
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .base import BaseModel

class Interview(BaseModel):
    """Modelo de entrevista"""
    __tablename__ = 'interviews'
    
    # Relacionamentos
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    interviewer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Dados da entrevista
    interview_type = Column(String(50), default='audio')  # audio, video, presencial
    position = Column(String(255), nullable=False)
    scheduled_at = Column(DateTime)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_minutes = Column(Integer, default=0)
    
    # Status
    status = Column(String(50), default='agendada')  # agendada, em_andamento, concluida, cancelada
    
    # Dados de áudio
    audio_file_path = Column(String(500))
    transcription = Column(Text)
    audio_quality_score = Column(Float, default=0.0)
    
    # Perguntas e respostas
    questions_data = Column(Text)  # JSON com perguntas e respostas
    current_question_index = Column(Integer, default=0)
    total_questions = Column(Integer, default=5)
    
    # Análise comportamental
    confidence_score = Column(Float, default=0.0)
    enthusiasm_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    nervousness_score = Column(Float, default=0.0)
    
    # Análise técnica de voz
    voice_analysis = Column(Text)  # JSON com análise detalhada de voz
    speech_rate = Column(Float, default=0.0)  # palavras por minuto
    pause_frequency = Column(Float, default=0.0)
    voice_stability = Column(Float, default=0.0)
    
    # Análise de conteúdo
    content_relevance = Column(Float, default=0.0)
    technical_accuracy = Column(Float, default=0.0)
    communication_skills = Column(Float, default=0.0)
    
    # Scores finais
    overall_score = Column(Float, default=0.0)
    recommendation = Column(String(50))  # CONTRATAR, CONSIDERAR, REJEITAR
    confidence_level = Column(Float, default=0.0)
    
    # Observações
    interviewer_notes = Column(Text)
    ai_insights = Column(Text)  # JSON com insights da IA
    next_steps = Column(Text)
    
    # Relacionamentos
    candidate = relationship("Candidate", foreign_keys=[candidate_id])
    interviewer = relationship("User", foreign_keys=[interviewer_id])
    
    def get_questions_list(self):
        """Retorna lista de perguntas e respostas"""
        if not self.questions_data:
            return []
        try:
            return json.loads(self.questions_data)
        except:
            return []
    
    def set_questions_list(self, questions_list):
        """Define lista de perguntas e respostas"""
        self.questions_data = json.dumps(questions_list, ensure_ascii=False)
        self.total_questions = len(questions_list)
    
    def add_question_response(self, question, response, audio_path=None):
        """Adiciona pergunta e resposta à entrevista"""
        questions = self.get_questions_list()
        
        question_data = {
            'question': question,
            'response': response,
            'audio_path': audio_path,
            'timestamp': datetime.utcnow().isoformat(),
            'question_index': len(questions)
        }
        
        questions.append(question_data)
        self.set_questions_list(questions)
        self.current_question_index = len(questions)
    
    def get_voice_analysis_dict(self):
        """Retorna análise de voz como dicionário"""
        if not self.voice_analysis:
            return {}
        try:
            return json.loads(self.voice_analysis)
        except:
            return {}
    
    def set_voice_analysis_dict(self, analysis_dict):
        """Define análise de voz"""
        self.voice_analysis = json.dumps(analysis_dict, ensure_ascii=False)
    
    def get_ai_insights_dict(self):
        """Retorna insights da IA como dicionário"""
        if not self.ai_insights:
            return {}
        try:
            return json.loads(self.ai_insights)
        except:
            return {}
    
    def set_ai_insights_dict(self, insights_dict):
        """Define insights da IA"""
        self.ai_insights = json.dumps(insights_dict, ensure_ascii=False)
    
    def calculate_overall_score(self):
        """Calcula score geral da entrevista"""
        weights = {
            'behavioral': 0.3,  # confiança, entusiasmo, clareza
            'technical': 0.4,   # precisão técnica, relevância
            'communication': 0.3  # habilidades de comunicação
        }
        
        # Score comportamental
        behavioral_score = (
            self.confidence_score * 0.4 +
            self.enthusiasm_score * 0.3 +
            self.clarity_score * 0.3
        )
        
        # Score técnico
        technical_score = (
            self.technical_accuracy * 0.6 +
            self.content_relevance * 0.4
        )
        
        # Score de comunicação
        communication_score = self.communication_skills
        
        # Score geral
        self.overall_score = (
            behavioral_score * weights['behavioral'] +
            technical_score * weights['technical'] +
            communication_score * weights['communication']
        )
        
        # Determinar recomendação
        if self.overall_score >= 80:
            self.recommendation = 'CONTRATAR'
            self.confidence_level = 0.9
        elif self.overall_score >= 60:
            self.recommendation = 'CONSIDERAR'
            self.confidence_level = 0.7
        else:
            self.recommendation = 'REJEITAR'
            self.confidence_level = 0.8
        
        return self.overall_score
    
    def start_interview(self):
        """Inicia a entrevista"""
        self.started_at = datetime.utcnow()
        self.status = 'em_andamento'
    
    def complete_interview(self):
        """Finaliza a entrevista"""
        self.completed_at = datetime.utcnow()
        self.status = 'concluida'
        
        if self.started_at:
            duration = self.completed_at - self.started_at
            self.duration_minutes = int(duration.total_seconds() / 60)
        
        # Calcular score final
        self.calculate_overall_score()
    
    def get_progress_percentage(self):
        """Retorna progresso da entrevista em porcentagem"""
        if self.total_questions == 0:
            return 0
        return min(100, (self.current_question_index / self.total_questions) * 100)
    
    def get_status_display(self):
        """Retorna status em formato legível"""
        status_map = {
            'agendada': 'Agendada',
            'em_andamento': 'Em Andamento',
            'concluida': 'Concluída',
            'cancelada': 'Cancelada'
        }
        return status_map.get(self.status, self.status)
    
    def to_dict(self, include_detailed=False):
        """Converte entrevista para dicionário"""
        data = {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'interviewer_id': self.interviewer_id,
            'position': self.position,
            'interview_type': self.interview_type,
            'status': self.status,
            'status_display': self.get_status_display(),
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'duration_minutes': self.duration_minutes,
            'current_question_index': self.current_question_index,
            'total_questions': self.total_questions,
            'progress_percentage': self.get_progress_percentage(),
            'overall_score': round(self.overall_score, 1) if self.overall_score else 0,
            'recommendation': self.recommendation,
            'confidence_level': round(self.confidence_level, 2) if self.confidence_level else 0,
            'created_at': self.created_at.isoformat()
        }
        
        if include_detailed:
            data.update({
                'questions_data': self.get_questions_list(),
                'confidence_score': round(self.confidence_score, 1) if self.confidence_score else 0,
                'enthusiasm_score': round(self.enthusiasm_score, 1) if self.enthusiasm_score else 0,
                'clarity_score': round(self.clarity_score, 1) if self.clarity_score else 0,
                'nervousness_score': round(self.nervousness_score, 1) if self.nervousness_score else 0,
                'content_relevance': round(self.content_relevance, 1) if self.content_relevance else 0,
                'technical_accuracy': round(self.technical_accuracy, 1) if self.technical_accuracy else 0,
                'communication_skills': round(self.communication_skills, 1) if self.communication_skills else 0,
                'voice_analysis': self.get_voice_analysis_dict(),
                'ai_insights': self.get_ai_insights_dict(),
                'interviewer_notes': self.interviewer_notes,
                'next_steps': self.next_steps,
                'transcription': self.transcription
            })
        
        return data

