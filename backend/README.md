# Bronquito API (FastAPI + MySQL)

Backend de la plataforma Bronquito. Modela las 9 tablas del documento de arquitectura
(pacientes, médicos, vínculo médico-paciente, evaluaciones, entrenamientos, rutina activa,
notas médicas) y expone login real:

- **Médicos**: se registran con mail + contraseña.
- **Pacientes**: inician sesión con DNI + PIN. Su cuenta puede haber nacido de dos lados
  (columna `origen`): del **dispositivo** (la OLED genera DNI + PIN; puede llegar sin mail,
  que el paciente completa después) o de la **web** (registro con el formulario completo,
  mail incluido). El vínculo con un médico se crea siempre después, desde la cuenta del
  médico — nunca al registrarse.

Recuperar la credencial ("olvidé mi contraseña" del médico / "olvidé mi PIN" del paciente)
usa el mismo mecanismo de token para los dos roles.

## Estructura

```
app/
  main.py             Arranca FastAPI, configura CORS, crea las tablas y carga datos
                       de ejemplo al iniciar.
  seed.py              Datos de ejemplo — un médico y tres pacientes de prueba, con
                       credenciales documentadas ahí mismo para poder probar el login.
  core/
    config.py          Lee la configuración (MySQL, CORS, JWT, SMTP) desde variables
                        de entorno / .env.
    database.py         Motor de SQLAlchemy + sesión por request.
    security.py          Hashing de contraseñas/PIN (bcrypt) + creación/lectura de
                        tokens de sesión (JWT). Acá vive toda la lógica de "probar
                        quién sos".
    email.py             Envío de mails (smtplib). En dev van a Mailpit; en prod, a
                        un SMTP real. Ver sección "Mails" abajo.
    email_templates.py   El HTML de los mails, con la estética de la web (patito,
                        colores teal, botón pill). Tablas + estilos inline.
    deps.py               Dependencias de FastAPI (`get_current_medico`,
                        `get_current_paciente`) para proteger endpoints con un token.
  models/                Modelos de SQLAlchemy (una clase = una tabla).
  schemas/               Modelos de Pydantic: qué forma tiene lo que la API recibe y
                        devuelve. Sirven además para que FastAPI valide automáticamente
                        los requests (por ejemplo, que el PIN tenga 4 dígitos).
  routers/
    auth.py               Médico: registro, login, olvidé contraseña / resetearla.
                        Paciente: registro web, login (DNI+PIN), olvidé PIN /
                        resetearlo.
    medicos.py             Perfil del médico logueado, sus pacientes vinculados,
                        vincular un paciente existente por DNI.
    pacientes.py            Perfil del paciente logueado y `PATCH /pacientes/me`
                        para completar/editar su mail y datos (pantalla
                        "completá tu perfil" de las cuentas que vienen sin mail).
```

## Las 9 tablas (y qué clase de Python es cada una)

| Tabla MySQL | Clase Python | Archivo |
|---|---|---|
| `usuarios` | `Paciente` | `models/paciente.py` |
| `medicos` | `Medico` | `models/medico.py` |
| `medico_paciente` | `MedicoPaciente` | `models/medico_paciente.py` |
| `evaluaciones` | `Evaluacion` | `models/evaluacion.py` |
| `evaluaciones_muestras` | `EvaluacionMuestra` | `models/evaluacion.py` |
| `entrenamientos` | `Entrenamiento` | `models/entrenamiento.py` |
| `entrenamientos_graficar` | `EntrenamientoGraficar` | `models/entrenamiento.py` |
| `rutina` | `Rutina` | `models/rutina.py` |
| `notas_medicas` | `NotaMedica` | `models/nota_medica.py` |

La tabla de pacientes se llama `usuarios` en MySQL (así la nombraron en el documento de
arquitectura) pero la clase de Python se llama `Paciente`, más claro para el resto del
código — es lo que dice `__tablename__ = "usuarios"` arriba de la clase.

## ⚠️ Si ya habías levantado el proyecto antes de este cambio

Las tablas `usuarios` y `medicos` sumaron columnas (`usuarios`: `nombre`, `apellido`,
`email`, `origen`, `acepto_terminos`, `fecha_aceptacion_terminos`, `reset_token`,
`reset_token_expira`; `medicos`: `nombre`, `apellido`, y los mismos de reset/términos).
Como `create_all()` sólo crea tablas que no existen — no actualiza las que ya existen —
necesitás borrar la base vieja una vez antes de levantar de nuevo:

```bash
docker compose down -v
docker compose up --build
```

El `-v` borra también el volumen de MySQL (los datos guardados). Como hasta ahora sólo
había datos de prueba, no se pierde nada real.

## Credenciales de prueba (cargadas por seed.py)

**Médico:** `belen.fernandez@bronquito.app` / `medico1234` (Belén Fernández)

**Pacientes (DNI / PIN):**

- `45819569` / `1234` — Malena Salerno, perfil completo (con nombre y mail)
- `38123456` / `5678` — Tomás Herrera, perfil completo (con nombre y mail)
- `29987654` / `4321` — Rocío Fernández, **sin mail**: al loguearse, el front lo manda a la
  pantalla "completá tu perfil" (`perfil_completo: false` en `GET /pacientes/me`). Sirve
  para probar ese flujo y el `PATCH /pacientes/me`.

Todos los pacientes de `seed.py` tienen `origen: "DISPOSITIVO"`. Para probar el registro
web, usá `POST /auth/pacientes/registro` con un DNI y un mail nuevos.

## Probar el login desde /docs

1. Entrá a http://localhost:8000/docs
2. Abrí `POST /auth/medicos/login`, "Try it out", pegá el usuario/contraseña de arriba,
   "Execute". La respuesta trae un `access_token`.
3. Para probar un endpoint protegido (por ejemplo `GET /medicos/me`), hacé clic en el
   botón verde "Authorize" arriba a la derecha de toda la página, pegá ahí el
   `access_token` que te devolvió el login, y confirmá. A partir de ahí, todos los
   endpoints protegidos que pruebes desde /docs van a mandar ese token solos.

## Correr en Docker (recomendado)

Ver `../DOCKER.md` en la raíz del repo.

## Correr sin Docker (si querés depurar el backend solo)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # completá según tu MySQL local
uvicorn app.main:app --reload
```

## Mails

`app/core/email.py` manda los mails (verificación de dirección, recuperar contraseña/PIN)
con `smtplib` — sin dependencias extra. Adónde los manda depende de las variables `SMTP_*`
del `.env` (ver `../.env.example`):

- **Desarrollo (default):** van a **Mailpit**, un servidor SMTP falso que corre como un
  servicio más del `docker-compose`. No sale nada a direcciones reales: los ves en
  **http://localhost:8025**. No hay que configurar nada.
- **Mails reales:** completás `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` /
  `SMTP_STARTTLS` / `EMAIL_FROM` en el `.env` con los datos de un proveedor (Gmail con una
  "App Password", o Resend/Brevo/SES). El `.env.example` trae el bloque de Gmail listo para
  descomentar.
- `EMAIL_ENABLED=false` apaga el envío: `enviar_email` sólo loguea lo que hubiera mandado.

`enviar_email` está pensada para llamarse desde un `BackgroundTasks` de FastAPI, así la
respuesta HTTP no espera al SMTP. Si el envío falla, queda en los logs y no rompe el
request. El HTML lo arma `app/core/email_templates.py` con la estética de la web (el
patito viaja embebido en el mail como imagen inline, no depende de un servidor externo).

**Ya enchufado:** "olvidé mi contraseña / PIN" manda un mail real con el link
`FRONTEND_URL/resetear/{contrasena,pin}?token=...`. La respuesta HTTP ya no devuelve el
token (antes había un `reset_token_dev` de dev — se eliminó). En desarrollo, el mail cae en
Mailpit: http://localhost:8025.

Probar el envío a mano (con el stack levantado):

```bash
docker compose exec api python -c "from app.core.email import enviar_email; \
enviar_email(destinatario='test@x.com', asunto='Prueba', html='<p>Hola</p>')"
# abrí http://localhost:8025 y fijate que llegó
```

## Decisiones a propósito (para que no parezcan olvidos)

- **No hay bloqueo de cuenta por intentos fallidos** (ni de PIN ni de contraseña) — lo
  charlamos y se decidió no incluirlo en esta primera versión.
- **Los pacientes se registran de dos formas, nunca vía un médico.** O los crea el
  dispositivo (`origen: "DISPOSITIVO"`, llegan por sync de la micro SD — por ahora,
  `seed.py`), o los crea el propio paciente desde la web (`POST /auth/pacientes/registro`,
  `origen: "WEB"`, formulario con perfil clínico completo). El médico sólo puede
  **vincularse** a un paciente que ya existe.
- **Nombre, apellido y mail del paciente son opcionales en la base pero obligatorios para
  entrar a la web.** Las cuentas del dispositivo pueden llegar sin ninguno de los tres
  (sólo DNI + PIN); `GET /pacientes/me` devuelve `perfil_completo: false` mientras falte
  alguno o no haya aceptado los términos, y el front las frena en "completá tu perfil"
  hasta que los carguen vía `PATCH /pacientes/me`. Sin mail no hay forma de recuperar el
  PIN. El médico necesita el nombre para identificar a sus pacientes (no alcanza el DNI).
  El médico, en cambio, siempre carga nombre y apellido al registrarse.
- **"Olvidé mi contraseña / PIN" manda el link por mail** (branded, ver sección "Mails")
  en un `BackgroundTask`. La respuesta HTTP es siempre el mismo mensaje genérico ("si la
  cuenta existe...") y nunca incluye el token — no se puede usar este endpoint para
  averiguar qué mails/DNIs están registrados.
- **El paciente puede identificarse por mail o por DNI** al pedir el reset de PIN; el médico
  siempre por mail. El mecanismo interno (token, vencimiento) es el mismo.
- **La vinculación médico-paciente es directa** (buscar por DNI + botón "Vincular"), sin
  paso de aceptación por parte del paciente — así lo definieron para esta versión.

## Qué falta (para las próximas etapas, no de esta)

- Endpoints de evaluaciones, entrenamientos, rutina y notas médicas (hoy sólo están las
  tablas y el login; leer/crear esos registros es el siguiente paso).
- Migraciones con Alembic en vez de `create_all()` (relevante recién cuando haya datos
  reales que no se puedan simplemente borrar y recrear).
- Cambiar el PIN desde la vista de paciente estando logueado (hoy sólo se puede vía el
  flujo de "olvidé mi PIN"). Editar el perfil ya está (`PATCH /pacientes/me`).
- **Verificación de la dirección de mail** (columna `email_verificado` + token + endpoints
  `verificar-email` / `reenviar-verificacion` + página en el front). La infra de envío
  (`app/core/email.py` + `email_templates.py`) ya está lista y probada con el flujo de reset.
- Sincronización dispositivo → base. Cuando se defina, la sync tiene que correr **antes**
  del login (así el paciente ya existe en la web cuando intenta entrar).
- Que el paciente y el médico también puedan resetear con el mismo endpoint unificado (hoy
  son dos rutas paralelas que comparten la lógica interna).
