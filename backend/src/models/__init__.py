from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importe os modelos após definir `db` para evitar import circular.
# Se ainda não existirem, deixe comentado.
try:
    from .candidate import Candidate  # noqa: F401
    from .interview import Interview  # noqa: F401
    from .user import User            # noqa: F401
except Exception:
    # Em desenvolvimento pode não existir tudo ainda; siga sem falhar.
    pass
