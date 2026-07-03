/**
 * Configuración de la aplicación cargada desde variables de entorno.
 * Todas las variables deben tener prefijo VITE_ para estar disponibles en el frontend.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  appName: 'Rastreador de Costos IA — Cockpit Estratégico',
} as const;
