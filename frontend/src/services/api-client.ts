import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Genera un UUID v4 para propagación de correlation-ID.
 * Usa crypto.randomUUID cuando está disponible, con fallback manual.
 */
function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Instancia de Axios configurada para toda la comunicación con la API.
 * - Agrega header X-Correlation-ID a cada solicitud
 * - Maneja redirecciones 401 y mensajes genéricos para 5xx
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/** Interceptor de solicitud: agrega correlation-ID a cada request saliente */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set('X-Correlation-ID', generateCorrelationId());
    return config;
  },
  (error) => Promise.reject(error)
);

/** Interceptor de respuesta: manejo de errores HTTP comunes */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        window.location.href = '/login';
        return Promise.reject(new Error('Sesión expirada. Redirigiendo al login.'));
      }

      if (status >= 500) {
        return Promise.reject(new Error('Error interno del servidor. Intente nuevamente.'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
