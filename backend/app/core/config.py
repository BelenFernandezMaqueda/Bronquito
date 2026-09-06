"""
Configuración de la app, leída desde variables de entorno (ver .env.example
en la raíz del proyecto). Usar variables de entorno en vez de escribir la
contraseña de MySQL a mano en el código es la práctica estándar: así el
mismo código sirve para tu máquina, para el contenedor Docker, o para un
servidor real, cambiando sólo el archivo `.env`.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "bronquito"
    mysql_password: str = "bronquito"
    mysql_database: str = "bronquito"

    # Orígenes permitidos para CORS (el frontend corriendo en Vite).
    cors_origins: list[str] = ["http://localhost:5173"]

    # Usada para firmar los tokens de login (JWT). Es lo que garantiza que
    # nadie pueda fabricarse un token falso sin conocer este valor — por
    # eso en un ambiente real tiene que ser un valor largo y secreto, nunca
    # el de ejemplo. Ver .env.example.
    jwt_secret_key: str = "changeme_jwt_secret"
    jwt_algorithm: str = "HS256"
    # Cuánto dura una sesión (token) antes de tener que loguearse de nuevo.
    jwt_expire_minutes: int = 60 * 24  # 1 día
    # Cuánto dura válido el link/token de "olvidé mi contraseña".
    reset_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )


settings = Settings()
