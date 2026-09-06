/**
 * Tipos que reflejan lo que la API de Bronquito recibe y devuelve.
 * Mantener en sync con `backend/app/schemas/`.
 */

export type Rol = 'medico' | 'paciente'

export type Sexo = 'F' | 'M' | 'X'

export interface TokenOut {
  access_token: string
  token_type: 'bearer'
  rol: Rol
}

export interface RecuperacionOut {
  mensaje: string
}

export interface MedicoPerfil {
  id_medico: number
  usuario: string
  nombre: string
  apellido: string
  fecha_registro: string
}

export interface PacientePerfil {
  id_paciente: number
  dni: string
  nombre: string | null
  apellido: string | null
  email: string | null
  altura_cm: number
  peso_kg: number
  fecha_nacimiento: string
  sexo: string
  fumador: boolean
  fecha_registro: string
  origen: 'DISPOSITIVO' | 'WEB'
  acepto_terminos: boolean
  /** false mientras al paciente le falte mail o aceptar términos. */
  perfil_completo: boolean
}

// --- Request bodies -------------------------------------------------------

export interface MedicoLoginBody {
  usuario: string
  contrasena: string
}

export interface MedicoRegistroBody {
  usuario: string
  contrasena: string
  nombre: string
  apellido: string
  acepto_terminos: boolean
}

export interface PacienteLoginBody {
  dni: string
  pin: string
}

export interface PacienteRegistroBody {
  dni: string
  pin: string
  nombre: string
  apellido: string
  email: string
  altura_cm: number
  peso_kg: number
  fecha_nacimiento: string
  sexo: Sexo
  fumador: boolean
  acepto_terminos: boolean
}

export interface PacientePerfilUpdateBody {
  nombre?: string
  apellido?: string
  email?: string
  altura_cm?: number
  peso_kg?: number
  fecha_nacimiento?: string
  sexo?: Sexo
  fumador?: boolean
  acepto_terminos?: boolean
}
