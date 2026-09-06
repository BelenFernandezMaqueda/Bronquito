/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API de Bronquito. La setea docker-compose (ver docker-compose.yml). */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
