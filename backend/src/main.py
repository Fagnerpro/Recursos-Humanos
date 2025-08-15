import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from src.models import db

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@db:5432/postgres"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    Migrate(app, db)

    # Blueprints
    from src.routes.health import bp as health_bp
from src.routes.admin import admin_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(admin_bp)
    from src.routes.users import bp as users_bp
    app.register_blueprint(users_bp)
    from src.routes.candidates import bp as candidates_bp
    app.register_blueprint(candidates_bp)

    return app

app = create_app()


