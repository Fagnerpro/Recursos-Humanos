#!/usr/bin/env python3
"""
Sistema de Entrevista por Áudio Bidirecional
Simula entrevista presencial real com IA
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import openai
import os
import json
import uuid
import tempfile
import io
import base64
from datetime import datetime
from advanced_voice_analysis import analyze_interview_audio

app = Flask(__name__)
CORS(app)

# Configuração OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

class AudioInterviewEngine:
    def __init__(self):
        self.active_interviews = {}
        self.interview_data = {}
        
    def create_interview_session(self, candidate_name, position):
        """Cria nova sessão de entrevista"""
        session_id = str(uuid.uuid4())
        
        # Perguntas específicas por posição
        questions_by_position = {
            "Desenvolvedor Python": [
                "Olá {name}, é um prazer conhecê-lo. Pode me contar um pouco sobre sua experiência com Python?",
                "Que frameworks Python você já utilizou em projetos reais?",
                "Como você lidaria com um problema de performance em uma aplicação Django?",
                "Conte-me sobre um projeto desafiador que você desenvolveu recentemente.",
                "Quais são seus pontos fortes como desenvolvedor?"
            ],
            "Analista de RH": [
                "Olá {name}, bem-vindo à nossa entrevista. Pode me falar sobre sua experiência em recursos humanos?",
                "Como você conduziria um processo de recrutamento e seleção?",
                "Qual sua experiência com ferramentas de RH e People Analytics?",
                "Como você lidaria com um conflito entre colaboradores?",
                "O que te motiva a trabalhar na área de recursos humanos?"
            ],
            "Gerente de Projetos": [
                "Olá {name}, prazer em conhecê-lo. Conte-me sobre sua experiência em gestão de projetos.",
                "Quais metodologias ágeis você já utilizou?",
                "Como você gerencia prazos e recursos em projetos complexos?",
                "Descreva uma situação onde teve que lidar com mudanças de escopo.",
                "Como você motiva e lidera equipes multidisciplinares?"
            ]
        }
        
        # Seleciona perguntas baseadas na posição
        questions = questions_by_position.get(position, questions_by_position["Desenvolvedor Python"])
        formatted_questions = [q.format(name=candidate_name.split()[0]) for q in questions]
        
        self.active_interviews[session_id] = {
            "candidate_name": candidate_name,
            "position": position,
            "questions": formatted_questions,
            "current_question": 0,
            "responses": [],
            "audio_responses": [],
            "start_time": datetime.now(),
            "status": "active"
        }
        
        return session_id
    
    def get_current_question_audio(self, session_id):
        """Gera áudio da pergunta atual"""
        if session_id not in self.active_interviews:
            return None
            
        interview = self.active_interviews[session_id]
        current_q = interview["current_question"]
        
        if current_q >= len(interview["questions"]):
            return None
            
        question_text = interview["questions"][current_q]
        
        # Gera áudio da pergunta usando OpenAI TTS
        try:
            response = openai.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=question_text,
                response_format="mp3"
            )
            
            # Salva áudio temporário
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            temp_file.write(response.content)
            temp_file.close()
            
            return {
                "audio_file": temp_file.name,
                "question_text": question_text,
                "question_number": current_q + 1,
                "total_questions": len(interview["questions"])
            }
            
        except Exception as e:
            print(f"Erro ao gerar áudio: {e}")
            return None
    
    def process_audio_response(self, session_id, audio_data):
        """Processa resposta em áudio do candidato"""
        if session_id not in self.active_interviews:
            return None
            
        try:
            # Salva áudio recebido
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            temp_audio.write(audio_data)
            temp_audio.close()
            temp_path = temp_audio.name
            
            # Análise avançada de voz
            voice_analysis = analyze_interview_audio(temp_path)
            
            # Extrai transcript da análise ou faz transcrição separada
            try:
                with open(temp_path, "rb") as audio_file:
                    transcript_response = openai.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language="pt"
                    )
                transcript = transcript_response.text
            except Exception as e:
                transcript = "Erro na transcrição"
                print(f"Erro na transcrição: {e}")
            
            # Combina análise de voz com análise de conteúdo
            analysis = {
                'transcript': transcript,
                'voice_analysis': voice_analysis,
                'score': voice_analysis['scores']['final_score'],
                'behavioral_insights': voice_analysis['insights'],
                'recommendations': voice_analysis['recommendations'],
                'interview_assessment': voice_analysis['interview_simulation']
            }
            
            interview = self.active_interviews[session_id]
            
            # Salva resposta
            interview["responses"].append({
                "question": interview["questions"][interview["current_question"]],
                "transcript": transcript,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat()
            })
            
            # Avança para próxima pergunta
            interview["current_question"] += 1
            
            # Remove arquivo temporário
            os.unlink(temp_path)
            
            return {
                "transcript": transcript,
                "analysis": analysis,
                "next_question_available": interview["current_question"] < len(interview["questions"])
            }
            
        except Exception as e:
            print(f"Erro no processamento de áudio: {e}")
            return None
    
    def analyze_response(self, question, response, position):
        """Analisa resposta do candidato com IA"""
        try:
            prompt = f"""
            Analise esta resposta de entrevista para a posição de {position}:
            
            Pergunta: {question}
            Resposta: {response}
            
            Forneça uma análise estruturada em JSON com:
            - score (0-100): pontuação da resposta
            - pontos_fortes: lista de pontos positivos
            - areas_melhoria: lista de áreas para melhoria
            - relevancia: quão relevante é a resposta (0-10)
            - clareza: clareza da comunicação (0-10)
            - experiencia: demonstração de experiência (0-10)
            """
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Erro na análise: {e}")
            return {
                "score": 70,
                "pontos_fortes": ["Resposta coerente"],
                "areas_melhoria": ["Mais detalhes técnicos"],
                "relevancia": 7,
                "clareza": 7,
                "experiencia": 7
            }
    
    def finalize_interview(self, session_id):
        """Finaliza entrevista e gera relatório completo"""
        if session_id not in self.active_interviews:
            return None
            
        interview = self.active_interviews[session_id]
        
        # Análise final com todas as respostas
        final_analysis = self.generate_final_report(interview)
        
        # Marca como finalizada
        interview["status"] = "completed"
        interview["end_time"] = datetime.now()
        interview["final_analysis"] = final_analysis
        
        return final_analysis
    
    def generate_final_report(self, interview):
        """Gera relatório final da entrevista"""
        try:
            all_responses = "\n\n".join([
                f"P{i+1}: {q}\nR{i+1}: {r}" 
                for i, (q, r) in enumerate(zip(interview["questions"], interview["responses"]))
            ])
            
            prompt = f"""
            Analise esta entrevista completa para {interview["position"]}:
            
            Candidato: {interview["candidate_name"]}
            Posição: {interview["position"]}
            
            Entrevista:
            {all_responses}
            
            Gere um relatório final em JSON com:
            - score_final (0-100): pontuação geral
            - recomendacao: "CONTRATAR", "CONSIDERAR" ou "REJEITAR"
            - resumo_executivo: resumo em 2-3 frases
            - competencias_tecnicas: avaliação (0-10)
            - competencias_comportamentais: avaliação (0-10)
            - fit_cultural: adequação à cultura (0-10)
            - pontos_fortes: lista dos principais pontos fortes
            - areas_desenvolvimento: áreas para desenvolvimento
            - proximos_passos: recomendações para próximas etapas
            """
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Erro no relatório final: {e}")
            return {
                "score_final": 75,
                "recomendacao": "CONSIDERAR",
                "resumo_executivo": "Candidato demonstrou conhecimentos adequados para a posição.",
                "competencias_tecnicas": 7,
                "competencias_comportamentais": 8,
                "fit_cultural": 7,
                "pontos_fortes": ["Comunicação clara", "Experiência relevante"],
                "areas_desenvolvimento": ["Conhecimentos técnicos específicos"],
                "proximos_passos": ["Entrevista técnica", "Verificação de referências"]
            }

# Instância global do engine
interview_engine = AudioInterviewEngine()

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Inicia nova entrevista por áudio"""
    data = request.json
    candidate_name = data.get('candidate_name')
    position = data.get('position')
    
    if not candidate_name or not position:
        return jsonify({"error": "Nome e posição são obrigatórios"}), 400
    
    session_id = interview_engine.create_interview_session(candidate_name, position)
    
    return jsonify({
        "session_id": session_id,
        "message": "Entrevista iniciada com sucesso",
        "candidate_name": candidate_name,
        "position": position
    })

@app.route('/api/interview/<session_id>/question', methods=['GET'])
def get_question_audio(session_id):
    """Retorna áudio da pergunta atual"""
    question_data = interview_engine.get_current_question_audio(session_id)
    
    if not question_data:
        return jsonify({"error": "Sessão não encontrada ou entrevista finalizada"}), 404
    
    return send_file(
        question_data["audio_file"],
        mimetype="audio/mpeg",
        as_attachment=True,
        download_name=f"question_{question_data['question_number']}.mp3"
    )

@app.route('/api/interview/<session_id>/question/info', methods=['GET'])
def get_question_info(session_id):
    """Retorna informações da pergunta atual"""
    if session_id not in interview_engine.active_interviews:
        return jsonify({"error": "Sessão não encontrada"}), 404
    
    interview = interview_engine.active_interviews[session_id]
    current_q = interview["current_question"]
    
    if current_q >= len(interview["questions"]):
        return jsonify({
            "finished": True,
            "message": "Entrevista finalizada"
        })
    
    return jsonify({
        "question_text": interview["questions"][current_q],
        "question_number": current_q + 1,
        "total_questions": len(interview["questions"]),
        "finished": False
    })

@app.route('/api/interview/<session_id>/respond', methods=['POST'])
def submit_audio_response(session_id):
    """Recebe resposta em áudio do candidato"""
    if 'audio' not in request.files:
        return jsonify({"error": "Arquivo de áudio não encontrado"}), 400
    
    audio_file = request.files['audio']
    audio_data = audio_file.read()
    
    result = interview_engine.process_audio_response(session_id, audio_data)
    
    if not result:
        return jsonify({"error": "Erro ao processar áudio"}), 500
    
    return jsonify(result)

@app.route('/api/interview/<session_id>/finalize', methods=['POST'])
def finalize_interview(session_id):
    """Finaliza entrevista e gera relatório"""
    final_report = interview_engine.finalize_interview(session_id)
    
    if not final_report:
        return jsonify({"error": "Sessão não encontrada"}), 404
    
    return jsonify({
        "message": "Entrevista finalizada com sucesso",
        "report": final_report
    })

@app.route('/api/interview/<session_id>/status', methods=['GET'])
def get_interview_status(session_id):
    """Retorna status da entrevista"""
    if session_id not in interview_engine.active_interviews:
        return jsonify({"error": "Sessão não encontrada"}), 404
    
    interview = interview_engine.active_interviews[session_id]
    
    return jsonify({
        "session_id": session_id,
        "candidate_name": interview["candidate_name"],
        "position": interview["position"],
        "current_question": interview["current_question"] + 1,
        "total_questions": len(interview["questions"]),
        "status": interview["status"],
        "responses_count": len(interview["responses"])
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check do sistema"""
    return jsonify({
        "status": "online",
        "service": "Audio Interview System",
        "active_interviews": len(interview_engine.active_interviews),
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🎤 Sistema de Entrevista por Áudio Iniciado!")
    print("🔊 Funcionalidades:")
    print("   - Perguntas em áudio geradas por IA")
    print("   - Respostas em áudio do candidato")
    print("   - Transcrição automática com Whisper")
    print("   - Análise comportamental avançada")
    print("   - Relatório final completo")
    print("\n🌐 Servidor rodando em: http://0.0.0.0:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

