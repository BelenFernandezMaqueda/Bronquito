import { useState } from 'react'
import { Header } from './components/layout/Header'
import { PatientDashboard } from './pages/paciente/PatientDashboard'
import { DoctorView } from './pages/medico/DoctorView'
import type { Role } from './types'

/**
 * Para esta etapa de demo la navegación entre roles es un toggle (igual que
 * en el mockup): no hay login real todavía, pero el modelo de datos ya
 * distingue Paciente de Médico, así que conectar un login real más adelante
 * sólo implica reemplazar este estado por la sesión autenticada.
 */
export default function App() {
  const [rol, setRol] = useState<Role>('paciente')

  return (
    <>
      <Header rol={rol} onCambiarRol={setRol} />
      <main>{rol === 'paciente' ? <PatientDashboard /> : <DoctorView />}</main>
    </>
  )
}
