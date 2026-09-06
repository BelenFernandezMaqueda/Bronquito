# Bronquito — Plataforma web (demo funcional)

Aplicación web de **Bronquito**, dispositivo portátil de entrenamiento y evaluación de
músculos inspiratorios (IMT), para el proyecto de Instrumentación Biomédica. Construida
con **React + TypeScript + Vite**, sobre datos mock, respetando la identidad visual del
mockup original (paleta cian/rosa/amarillo, tipografía Baloo 2 + Nunito, motivo de olas y
patito).

## Cómo correrla

Este proyecto se armó en un entorno sin acceso a internet, así que **no se pudo ejecutar
`npm install` ni probar el build acá**. Corré esto en tu máquina:

```bash
npm install
npm run dev      # entorno de desarrollo, con recarga en caliente
npm run build    # build de producción (chequea tipos con tsc y luego empaqueta)
npm run preview  # sirve el build de producción para revisarlo
```

## Cómo correrla con Docker

Este proyecto ahora es parte de un monorepo (`bronquito/`) que también incluye el backend
en Python y MySQL. El `docker-compose.yml` que levanta las tres partes juntas (frontend,
API y base de datos) está en la **raíz** del repo, no acá — ver `../README.md` y
`../DOCKER.md`. Este `Dockerfile` local se sigue usando (el compose de la raíz lo referencia
con `build: ./frontend`), pero ya no hace falta correr `docker compose` desde esta carpeta.

Requiere Node 18+. Las dependencias son las típicas de un proyecto Vite + React (ver
`package.json`): `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript` y sus
`@types`. Al ser un proyecto chico armado a mano (sin poder correr el scaffolding oficial
de Vite ni el compilador acá), es buena idea que la primera vez que lo abras corras
`npm run build` para que TypeScript valide todo el código antes de seguir iterando.

## Estructura

```
src/
  types/index.ts          Modelo de datos (Paciente, Médico, vínculo médico-paciente,
                           sesiones de calibración y entrenamiento, etc.) — pensado para
                           mapear directo a un backend real más adelante.
  data/mockData.ts         Datos mock + funciones derivadas (racha, adherencia, resumen
                           de progreso, filtrar pacientes de un médico, etc.). Es la única
                           "capa de datos" de la app: el día que haya backend, alcanza con
                           reemplazar estas funciones por llamadas a la API sin tocar los
                           componentes.
  styles/theme.css          Variables de color/tipografía y todas las clases visuales,
                           portadas del mockup HTML y ampliadas para los componentes nuevos.
  components/
    layout/Header.tsx       Header con olas, logo, toggle de rol y usuario actual.
    ui/                     Piezas reutilizables: DuckLogo, WaveBottom, Modal, StatCard,
                           Badge (estado de sesión / adherencia), MonthCalendar,
                           FlowVolumeChart, PimTrendChart y DeviceSessionModal (simulador
                           del flujo "operar el dispositivo": conectando → sesión en curso
                           → resultado).
  pages/
    paciente/PatientDashboard.tsx   Vista paciente: hero + botón "iniciar sesión de hoy",
                           3 stat cards, racha semanal, sesiones recientes, calendario
                           completo e historial (como sub-vistas dentro de la misma página).
    medico/
      DoctorView.tsx        Arma el layout de dos columnas (lista + detalle).
      PatientListPanel.tsx  Buscador + lista de pacientes con adherencia + invitar paciente.
      InvitePatientModal.tsx Flujo de alta de paciente (solicitud pendiente de aceptación).
      PatientDetail.tsx     Tabs Calibraciones / Entrenamiento / Calendario + botones para
                           iniciar calibración/entrenamiento "en consultorio".
      FrequencyModal.tsx    Modal para modificar manualmente la frecuencia recomendada.
  App.tsx                    Estado de rol (paciente/médico) + Header + página activa.
  main.tsx                   Punto de entrada de React.
```

## Decisiones de diseño

- **Navegación por toggle, no login real (por ahora).** Como se charló en el pedido, para
  esta etapa de demo se mantuvo el toggle de rol del mockup en vez de armar un login. El
  modelo de datos ya distingue `Paciente` de `Medico` como entidades separadas, así que
  cuando haya backend, el toggle se reemplaza por la sesión autenticada sin tocar el resto
  de los componentes.
- **Sin React Router.** Al no depender de rutas de navegación complejas (todo vive dentro
  de "vista paciente" o "vista médico", con sub-vistas manejadas por estado local), se
  evitó agregar `react-router-dom` como dependencia extra. Si en el futuro cada vista
  necesita URL propia (por ejemplo, para compartir el link del detalle de un paciente),
  es un buen momento para sumarlo.
- **Datos mock centralizados en `mockData.ts`.** Todas las pantallas leen de ahí a través
  de funciones (`pacientesDeMedico`, `calibracionesDe`, `resumenProgresoDe`, etc.) en vez
  de tener los datos hardcodeados en cada componente. Esas funciones son el punto exacto
  donde después se conecta el fetch a la API real.
- **"Iniciar sesión" / "Iniciar en consultorio" son simulaciones visuales.** El
  `DeviceSessionModal` simula el paso de "conectando → sesión en curso → resultado" con
  timers cortos, para poder mostrar el flujo sin hardware real. Los datos que se
  sincronizan de verdad desde el dispositivo (offline → wifi → base de datos) quedan fuera
  del alcance de esta web, tal como se aclaró en el pedido.
- **Vínculo médico-paciente explícito.** `pacientesDeMedico()` sólo devuelve pacientes con
  un vínculo en estado `aceptada`; hay además una invitación en estado `pendiente` mockeada
  para mostrar cómo se ve mientras el paciente todavía no aceptó.

## Qué falta para producción

- Reemplazar `mockData.ts` por llamadas a una API real (lectura de datos ya sincronizados
  desde el dispositivo).
- Login real con roles (paciente/médico) en vez del toggle de demo.
- Persistencia real de acciones que hoy sólo cambian estado en memoria: enviar invitación,
  modificar frecuencia, resultado de una sesión en consultorio.
- Tests (unitarios de las funciones de `mockData.ts` y de componentes clave).
