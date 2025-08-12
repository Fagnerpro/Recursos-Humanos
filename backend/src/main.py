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
    app.register_blueprint(health_bp)

    return app

app = create_app()
