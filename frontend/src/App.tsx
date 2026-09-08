import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { Header } from './components/layout/Header'
import { DuckLogo } from './components/ui/DuckLogo'
import { useSession } from './auth/session'
import type { Perfil } from './auth/session'
import { LoginPage } from './pages/auth/LoginPage'
import { RegistroMedicoPage } from './pages/auth/RegistroMedicoPage'
import { RegistroPacientePage } from './pages/auth/RegistroPacientePage'
import { RecuperarPage } from './pages/auth/RecuperarPage'
import { ResetearPage } from './pages/auth/ResetearPage'
import { CompletarPerfilPage } from './pages/paciente/CompletarPerfilPage'
import { PatientDashboard } from './pages/paciente/PatientDashboard'
import { DoctorView } from './pages/medico/DoctorView'

/** ¿El paciente logueado todavía tiene que completar su perfil? */
function pacienteIncompleto(perfil: Perfil | null): boolean {
  return perfil?.rol === 'paciente' && !perfil.datos.perfil_completo
}

/** Rutas públicas: si ya hay sesión, redirige al dashboard. */
function SoloAnonimos({ children }: { children: ReactNode }) {
  const { estado } = useSession()
  if (estado === 'autenticado') return <Navigate to="/" replace />
  return <>{children}</>
}

/** Rutas privadas: exige sesión y perfil completo. */
function SoloAutenticados({ children }: { children: ReactNode }) {
  const { estado, perfil } = useSession()
  if (estado !== 'autenticado') return <Navigate to="/login" replace />
  if (pacienteIncompleto(perfil)) return <Navigate to="/completar-perfil" replace />
  return <>{children}</>
}

function Dashboard() {
  const { perfil } = useSession()
  return (
    <>
      <Header />
      <main>{perfil?.rol === 'medico' ? <DoctorView /> : <PatientDashboard />}</main>
    </>
  )
}

export default function App() {
  const { estado, perfil } = useSession()

  if (estado === 'cargando') {
    return (
      <div className="auth-loading">
        <DuckLogo spinning />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <SoloAnonimos>
            <LoginPage />
          </SoloAnonimos>
        }
      />
      <Route
        path="/registro/medico"
        element={
          <SoloAnonimos>
            <RegistroMedicoPage />
          </SoloAnonimos>
        }
      />
      <Route
        path="/registro/paciente"
        element={
          <SoloAnonimos>
            <RegistroPacientePage />
          </SoloAnonimos>
        }
      />
      <Route
        path="/recuperar"
        element={
          <SoloAnonimos>
            <RecuperarPage />
          </SoloAnonimos>
        }
      />
      {/* Los links de reseteo llegan por mail: accesibles siempre. */}
      <Route path="/resetear/contrasena" element={<ResetearPage modo="contrasena" />} />
      <Route path="/resetear/pin" element={<ResetearPage modo="pin" />} />

      <Route
        path="/completar-perfil"
        element={
          estado === 'autenticado' && pacienteIncompleto(perfil) ? (
            <CompletarPerfilPage />
          ) : estado === 'autenticado' ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/"
        element={
          <SoloAutenticados>
            <Dashboard />
          </SoloAutenticados>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
