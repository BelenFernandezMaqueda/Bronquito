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

    # --- Envío de mails -------------------------------------------------------
    # Por defecto apunta a Mailpit (servicio del docker-compose): un servidor
    # SMTP falso que atrapa los mails SIN mandarlos y los muestra en
    # http://localhost:8025. Para mandar mails de verdad (Gmail u otro
    # proveedor), se cambian estos valores en el .env — ver .env.example.
    smtp_host: str = "mailpit"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    # STARTTLS = puerto 587 (Gmail). SSL directo = puerto 465. Ninguno de los
    # dos = sin cifrar (Mailpit en dev). Poné como mucho uno en True.
    smtp_starttls: bool = False
    smtp_ssl: bool = False
    # Remitente que ve el destinatario. Con Gmail tiene que ser la misma
    # cuenta autenticada (o un alias verificado de esa cuenta).
    email_from: str = "Bronquito <no-reply@bronquito.local>"
    # Si es False, `enviar_email` no intenta conectarse a ningún SMTP: sólo
    # loguea lo que hubiera mandado. Útil para tests y para apagar el envío
    # sin tocar código.
    email_enabled: bool = True

    # URL pública del frontend, para armar los links de los mails (verificar
    # dirección de mail, resetear contraseña/PIN).
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )


settings = Settings()
