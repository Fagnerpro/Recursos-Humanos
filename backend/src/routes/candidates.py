from flask import Blueprint, request, jsonify
from src.models import db
from src.models.candidate import Candidate

bp = Blueprint("candidates", __name__, url_prefix="/candidates")

@bp.get("/ping")
def ping_candidates():
    return jsonify({"message": "candidates blueprint ativo"})


def _candidate_from_json(data):
    c = Candidate(
        full_name=data["full_name"],
        email=data["email"],
        position_applied=data.get("position_applied", ""),
        experience_years=data.get("experience_years", 0),
        current_company=data.get("current_company"),
        current_position=data.get("current_position"),
        source=data.get("source"),
        technical_score=data.get("technical_score", 0.0),
        behavioral_score=data.get("behavioral_score", 0.0),
        cultural_fit_score=data.get("cultural_fit_score", 0.0),
        ai_recommendation=data.get("ai_recommendation"),
        ai_confidence=data.get("ai_confidence", 0.0),
        linkedin_url=data.get("linkedin_url"),
        portfolio_url=data.get("portfolio_url"),
        phone=data.get("phone"),
        status=data.get("status", "novo"),
    )
    # skills: aceita lista ou string
    skills = data.get("skills")
    if isinstance(skills, list):
        c.set_skills_list(skills)
    elif isinstance(skills, str):
        c.skills = skills
    c.calculate_overall_score()
    return c

@bp.post("")
def create_candidate():
    data = request.get_json(force=True, silent=True) or {}
    required = ["full_name", "email", "position_applied"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400
    c = _candidate_from_json(data)
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict(include_sensitive=True)), 201

@bp.get("")
def list_candidates():
    q = Candidate.query.filter_by(is_active=True)
    return jsonify([c.to_dict() for c in q.order_by(Candidate.id.desc()).all()])

@bp.get("/<int:candidate_id>")
def get_candidate(candidate_id):
    c = Candidate.query.get_or_404(candidate_id)
    return jsonify(c.to_dict(include_sensitive=True))

@bp.patch("/<int:candidate_id>")
def update_candidate(candidate_id):
    c = Candidate.query.get_or_404(candidate_id)
    data = request.get_json(force=True, silent=True) or {}
    for field in [
        "full_name","email","phone","position_applied","experience_years",
        "current_company","current_position","source","status",
        "technical_score","behavioral_score","cultural_fit_score",
        "ai_recommendation","ai_confidence","linkedin_url","portfolio_url"
    ]:
        if field in data:
            setattr(c, field, data[field])
    if "skills" in data:
        if isinstance(data["skills"], list):
            c.set_skills_list(data["skills"])
        elif isinstance(data["skills"], str):
            c.skills = data["skills"]
    c.calculate_overall_score()
    db.session.commit()
    return jsonify(c.to_dict(include_sensitive=True))

@bp.delete("/<int:candidate_id>")
def delete_candidate(candidate_id):
    c = Candidate.query.get_or_404(candidate_id)
    c.soft_delete()
    db.session.commit()
    return jsonify({"status": "deleted", "id": c.id})

