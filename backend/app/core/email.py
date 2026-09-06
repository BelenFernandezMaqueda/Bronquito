"""
Envío de mails.

Se va a usar para:
  - verificar la dirección de mail del usuario (parte 2)
  - "olvidé mi contraseña / PIN" (reemplazar el `reset_token_dev` de dev por
    un mail real)

Usa `smtplib` de la librería estándar — no hace falta ninguna dependencia
extra. En desarrollo apunta a Mailpit (ver `docker-compose.yml`), que atrapa
los mails sin mandarlos y los muestra en http://localhost:8025. Para mandar
mails de verdad, se configura un SMTP real en el `.env` (ver `.env.example`).

`enviar_email` está pensada para llamarse desde un `BackgroundTasks` de
FastAPI, para que la respuesta HTTP no espere a que termine el SMTP:

    from fastapi import BackgroundTasks

    def registrar(..., background_tasks: BackgroundTasks):
        ...
        background_tasks.add_task(
            enviar_email,
            destinatario=paciente.email,
            asunto="Verificá tu mail",
            html="<p>...</p>",
        )
        return ...
"""

import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger("bronquito.email")


class EmailNoEnviado(Exception):
    """No se pudo entregar el mail al servidor SMTP."""


def enviar_email(
    *,
    destinatario: str,
    asunto: str,
    html: str,
    texto: str | None = None,
    imagenes_inline: dict[str, Path] | None = None,
) -> None:
    """
    Manda un mail (HTML + fallback de texto plano).

    `imagenes_inline` = { "cid": ruta_al_archivo }. Cada imagen se adjunta
    "embebida" y el HTML la referencia con `<img src="cid:LA_CID">` — así el
    logo viaja dentro del mail y no depende de un servidor de imágenes.

    - Si `settings.email_enabled` es False: sólo lo loguea, no envía.
    - Si el envío falla: loguea el error y levanta `EmailNoEnviado`. En un
      BackgroundTask esa excepción no rompe nada (ya se respondió al cliente);
      queda registrada en los logs para poder revisarla.
    """
    mensaje = EmailMessage()
    mensaje["From"] = settings.email_from
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto
    mensaje.set_content(texto or _html_a_texto(html))
    mensaje.add_alternative(html, subtype="html")

    if imagenes_inline:
        parte_html = mensaje.get_payload()[1]  # el alternative text/html
        for cid, ruta in imagenes_inline.items():
            ruta = Path(ruta)
            parte_html.add_related(
                ruta.read_bytes(),
                maintype="image",
                subtype=ruta.suffix.lstrip(".").lower() or "png",
                cid=f"<{cid}>",
            )

    if not settings.email_enabled:
        logger.info("EMAIL_ENABLED=false — no se envía a %s (asunto: %r)", destinatario, asunto)
        return

    try:
        if settings.smtp_ssl:
            contexto = ssl.create_default_context()
            with smtplib.SMTP_SSL(
                settings.smtp_host, settings.smtp_port, context=contexto, timeout=15
            ) as servidor:
                _autenticar_y_mandar(servidor, mensaje)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as servidor:
                if settings.smtp_starttls:
                    servidor.starttls(context=ssl.create_default_context())
                _autenticar_y_mandar(servidor, mensaje)
    except (smtplib.SMTPException, OSError) as exc:
        logger.error("no se pudo enviar el mail a %s: %s", destinatario, exc)
        raise EmailNoEnviado(str(exc)) from exc

    logger.info("mail enviado a %s (asunto: %r)", destinatario, asunto)


def _autenticar_y_mandar(servidor: smtplib.SMTP, mensaje: EmailMessage) -> None:
    # Mailpit no pide auth (smtp_user vacío). Gmail y los proveedores reales sí.
    if settings.smtp_user:
        servidor.login(settings.smtp_user, settings.smtp_password)
    servidor.send_message(mensaje)


def _html_a_texto(html: str) -> str:
    """Fallback mínimo de texto plano para clientes que no renderizan HTML."""
    sin_tags = re.sub(r"<[^>]+>", "", html)
    return re.sub(r"\n\s*\n+", "\n\n", sin_tags).strip()
