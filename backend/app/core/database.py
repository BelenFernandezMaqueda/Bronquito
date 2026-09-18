"""
Conexión a MySQL con SQLAlchemy. `SessionLocal` es lo que cada request usa
para hablar con la base; `Base` es la clase de la que heredan todos los
modelos en `app/models/`.
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency de FastAPI: abre una sesión de DB por request y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrar_esquema_existente() -> None:
    """Agrega columnas nuevas a tablas creadas antes del cambio de modelo."""
    inspector = inspect(engine)
    if "usuarios" not in inspector.get_table_names():
        return

    enfermedades = next(
        (columna for columna in inspector.get_columns("usuarios") if columna["name"] == "enfermedades"),
        None,
    )
    if enfermedades is None:
        with engine.begin() as conexion:
            conexion.execute(text("ALTER TABLE usuarios ADD COLUMN enfermedades VARCHAR(160) NULL"))
    elif getattr(enfermedades["type"], "length", 0) < 160:
        with engine.begin() as conexion:
            conexion.execute(text("ALTER TABLE usuarios MODIFY COLUMN enfermedades VARCHAR(160) NULL"))
