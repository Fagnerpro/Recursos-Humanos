import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from src.models import db
from src.routes.health import bp as health_bp
from src.routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@db:5432/postgres",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    Migrate(app, db)

    # Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(admin_bp)

    return app

app = create_app()
