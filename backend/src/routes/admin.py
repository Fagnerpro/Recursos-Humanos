import os
from flask import Blueprint, jsonify
from src.models import db
from src.models.user import User
from src.models.candidate import Candidate

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

def _ensure_bool_env(name: str) -> bool:
    return (os.getenv(name, "") or "").strip().lower() == "true"

@admin_bp.post("/seed")
def seed():
    # Segurança: só roda se ALLOW_SEED=true
    if not _ensure_bool_env("ALLOW_SEED"):
        return jsonify({"error": "Seed desabilitado (defina ALLOW_SEED=true)"}), 403

    created = {"users": 0, "candidates": 0}
    updated = {"users": 0, "candidates": 0}

    # --- SEED USERS ---
    users_seed = [
        {"email": "admin@empresa.com",      "full_name": "Admin",       "role": "admin",     "password": "123456"},
        {"email": "recrutador@empresa.com", "full_name": "Recrutador",  "role": "recruiter", "password": "123456"},
        {"email": "gestor@empresa.com",     "full_name": "Gestor",      "role": "manager",   "password": "123456"},
    ]

    for u in users_seed:
        user = db.session.execute(db.select(User).filter_by(email=u["email"])).scalar()
        if user:
            # atualiza campos relevantes e garante ativo
            user.full_name = u["full_name"]
            user.role = u["role"]
            user.is_active = True
            user.set_password(u["password"])
            updated["users"] += 1
        else:
            user = User(email=u["email"], full_name=u["full_name"], role=u["role"])
            user.set_password(u["password"])
            db.session.add(user)
            created["users"] += 1

    # --- SEED CANDIDATES ---
    candidates_seed = [
        {
            "full_name": "Maria Silva",
            "email": "maria@exemplo.com",
            "position_applied": "Analista de Dados",
            "experience_years": 3,
            "skills": ["Python", "SQL", "Power BI"],
            "status": "triagem",
        },
        {
            "full_name": "João Souza",
            "email": "joao@exemplo.com",
            "position_applied": "Desenvolvedor Backend",
            "experience_years": 5,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "status": "entrevista",
        },
        {
            "full_name": "Ana Costa",
            "email": "ana@exemplo.com",
            "position_applied": "Product Manager",
            "experience_years": 7,
            "skills": ["Product Discovery", "Scrum", "OKRs"],
            "status": "aprovado",
        },
    ]

    for c in candidates_seed:
        cand = db.session.execute(db.select(Candidate).filter_by(email=c["email"])).scalar()
        if cand:
            cand.full_name = c["full_name"]
            cand.position_applied = c["position_applied"]
            cand.experience_years = c["experience_years"]
            cand.status = c["status"]
            if hasattr(cand, "set_skills_list"):
                cand.set_skills_list(c["skills"])
            updated["candidates"] += 1
        else:
            cand = Candidate(
                full_name=c["full_name"],
                email=c["email"],
                position_applied=c["position_applied"],
                experience_years=c["experience_years"],
                status=c["status"],
            )
            if hasattr(cand, "set_skills_list"):
                cand.set_skills_list(c["skills"])
            db.session.add(cand)
            created["candidates"] += 1

    db.session.commit()

    return jsonify({
        "message": "Seed executado com sucesso",
        "created": created,
        "updated": updated
    })
