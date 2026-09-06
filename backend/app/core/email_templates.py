"""
Plantillas HTML de los mails, con la misma estética que la web (paleta
teal/rosa, patito, tipografía redondeada — ver frontend/src/styles/theme.css).

HTML para mail no es HTML normal: los clientes de correo (sobre todo Gmail y
Outlook) no soportan flexbox, grid, ni `<style>` completo. Por eso todo va con
tablas y estilos inline, y el ancho se limita a 600px.
"""

from pathlib import Path

from app.core.config import settings

# El logo viaja embebido en el mail (no depende de un servidor de imágenes).
# `enviar_email(..., imagenes_inline={DUCK_CID: DUCK_PNG})` lo adjunta y el
# HTML lo referencia con <img src="cid:...">.
DUCK_PNG = Path(__file__).parent / "assets" / "bronquito-duck.png"
DUCK_CID = "bronquito-duck"

# Paleta, tomada de frontend/src/styles/theme.css
_TEAL = "#12a8c4"
_TEAL_DEEP = "#0a7e96"
_TEAL_BRIGHT = "#1fc1de"
_TEAL_PALE = "#e6f8fb"
_INK = "#0c3a44"
_INK_SOFT = "#5c7c82"
_BG = "#f7fcfc"

_FUENTE = "'Nunito', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
_FUENTE_TITULO = "'Baloo 2', 'Trebuchet MS', Verdana, sans-serif"


def _boton(texto: str, url: str) -> str:
    """Botón 'a prueba de balas' (tabla, no <button>) con el pill teal de la web."""
    return f"""
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
        <tr><td style="border-radius:999px;background:{_TEAL};">
          <a href="{url}" style="display:inline-block;padding:14px 30px;font-family:{_FUENTE_TITULO};
             font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
            {texto}</a>
        </td></tr>
      </table>"""


def _layout(*, preheader: str, titulo: str, cuerpo_html: str) -> str:
    """El marco común: banda teal con el patito arriba, tarjeta blanca, footer."""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:{_BG};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:{_BG};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;">

        <tr><td style="background-color:{_TEAL};background-image:linear-gradient(135deg,{_TEAL_BRIGHT},{_TEAL});
                       border-radius:22px 22px 0 0;padding:22px 32px;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:middle;padding-right:12px;">
                <img src="cid:{DUCK_CID}" width="42" height="34" alt="" style="display:block;border:0;">
              </td>
              <td style="vertical-align:middle;">
                <div style="font-family:{_FUENTE_TITULO};font-size:23px;font-weight:800;color:#ffffff;line-height:1.1;">
                  Bronquito</div>
                <div style="font-family:{_FUENTE};font-size:12px;font-weight:700;color:{_TEAL_PALE};margin-top:3px;">
                  La vía para respirar mejor</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="background:#ffffff;padding:34px 32px 28px;border-radius:0 0 22px 22px;
                       font-family:{_FUENTE};font-size:15px;line-height:1.55;color:{_INK};">
          <h1 style="font-family:{_FUENTE_TITULO};font-size:21px;font-weight:800;color:{_INK};margin:0 0 14px;">
            {titulo}</h1>
          {cuerpo_html}
        </td></tr>

        <tr><td style="padding:20px 32px;text-align:center;font-family:{_FUENTE};font-size:12px;
                       color:{_INK_SOFT};line-height:1.5;">
          Este mail es automático, no respondas.<br>
          Bronquito · dispositivo de entrenamiento de músculos inspiratorios
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def recuperar_credencial(*, nombre: str | None, url: str, tipo: str) -> tuple[str, str, str]:
    """
    Mail de "olvidé mi contraseña / PIN".

    `tipo` = "contrasena" | "pin". Devuelve (asunto, html, texto_plano).
    """
    es_pin = tipo == "pin"
    credencial = "PIN" if es_pin else "contraseña"
    uno_nuevo = "uno nuevo" if es_pin else "una nueva"
    saludo = f"Hola {nombre}," if nombre else "Hola,"
    minutos = settings.reset_token_expire_minutes
    asunto = f"Recuperá tu {credencial} de Bronquito"

    cuerpo = f"""
      <p style="margin:0 0 14px;">{saludo}</p>
      <p style="margin:0 0 14px;">
        Pediste recuperar tu {credencial}. Tocá el botón para elegir {uno_nuevo}:</p>
      {_boton(f"Cambiar mi {credencial}", url)}
      <p style="margin:14px 0 0;font-size:13px;color:{_INK_SOFT};">
        El link vence en {minutos} minutos. Si el botón no funciona, copiá y pegá esto
        en tu navegador:<br>
        <span style="color:{_TEAL_DEEP};word-break:break-all;">{url}</span></p>
      <p style="margin:18px 0 0;font-size:13px;color:{_INK_SOFT};">
        Si no pediste esto, ignorá este mail — tu {credencial} no cambió.</p>"""

    html = _layout(
        preheader=f"Link para cambiar tu {credencial} (vence en {minutos} minutos)",
        titulo=f"Recuperá tu {credencial}",
        cuerpo_html=cuerpo,
    )
    texto = (
        f"{saludo}\n\n"
        f"Pediste recuperar tu {credencial}. Abrí este link para elegir {uno_nuevo} "
        f"(vence en {minutos} minutos):\n\n{url}\n\n"
        f"Si no pediste esto, ignoralo: tu {credencial} no cambió.\n"
    )
    return asunto, html, texto
