from flask import Blueprint, request, jsonify
import os, tempfile
from contextlib import contextmanager

from ..services.interview_service import InterviewService

DATABASE_URL = os.getenv("DATABASE_URL")
SessionLocal = None
if DATABASE_URL:
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
    except Exception as e:
        print(f"[interviews] Aviso: SessionLocal não inicializado: {e}")

@contextmanager
def get_session():
    if SessionLocal is None:
        yield None
        return
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

bp = Blueprint("interviews", __name__, url_prefix="/api/interview")
svc = InterviewService()

@bp.post("/start")
def start():
    data = request.json or {}
    candidate_id = data.get("candidate_id")
    interviewer_id = data.get("interviewer_id", 1)
    position = data.get("position")
    if not candidate_id or not position:
        return jsonify({"error": "candidate_id e position são obrigatórios"}), 400

    with get_session() as db:
        if db is None:
            return jsonify({"error": "DATABASE_URL não configurada ou indisponível"}), 503
        interview = svc.create_interview(db, candidate_id, interviewer_id, position, interview_type="audio")
        payload = svc.start_interview(db, interview.id)
        return jsonify(payload), 201

@bp.get("/<int:interview_id>/next")
def next_question(interview_id: int):
    with get_session() as db:
        if db is None:
            return jsonify({"error": "DATABASE_URL não configurada ou indisponível"}), 503
        payload = svc.get_next_question(db, interview_id)
        if not payload:
            return jsonify({"finished": True, "message": "Entrevista finalizada"}), 200
        return jsonify(payload)

@bp.post("/<int:interview_id>/respond")
def respond(interview_id: int):
    response_text = request.form.get("text", "")
    audio_path = None
    if "audio" in request.files:
        f = request.files["audio"]
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        f.save(tmp.name)
        tmp.close()
        audio_path = tmp.name

    try:
        with get_session() as db:
            if db is None:
                return jsonify({"error": "DATABASE_URL não configurada ou indisponível"}), 503
            payload = svc.process_response(db, interview_id, response_text=response_text, audio_file_path=audio_path)
            return jsonify(payload)
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.unlink(audio_path)
            except Exception:
                pass

@bp.post("/<int:interview_id>/finalize")
def finalize(interview_id: int):
    with get_session() as db:
        if db is None:
            return jsonify({"error": "DATABASE_URL não configurada ou indisponível"}), 503
        payload = svc.finalize_interview(db, interview_id)
        return jsonify(payload)

@bp.get("/<int:interview_id>/status")
def status(interview_id: int):
    from ..models import Interview
    with get_session() as db:
        if db is None:
            return jsonify({"error": "DATABASE_URL não configurada ou indisponível"}), 503
        itv = db.query(Interview).filter(Interview.id == interview_id).first()
        if not itv:
            return jsonify({"error": "Entrevista não encontrada"}), 404
        qs = itv.get_questions_list() or []
        return jsonify({
            "interview_id": interview_id,
            "position": itv.position,
            "current_index": itv.current_question_index,
            "total_questions": len(qs),
            "status": itv.status,
        })
