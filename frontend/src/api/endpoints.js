export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/demuna/api' : 'http://localhost:8000/api');

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_RESET_CODE: '/auth/verify-reset-code',
  RESET_PASSWORD: '/auth/reset-password',

  // Expedientes
  EXPEDIENTES: '/expedientes',
  EXPEDIENTE_NEXT_CODE: '/expedientes/next-code',
  EXPEDIENTE_DETAIL: (id) => `/expedientes/${id}`,
  EXPEDIENTE_STATUS: (id) => `/expedientes/${id}/status`,

  // Fichas de Atención y Seguimiento
  FICHAS: '/fichas',
  FICHA_STATS: '/fichas/stats',
  FICHA_DETAIL: (id, source = 'acta_ficha') => `/fichas/${id}?source=${source}`,
  FICHA_DELETE: (id, source = 'acta_ficha') => `/fichas/${id}?source=${source}`,

  // Actas y Conciliación
  ACTAS: '/actas',
  ACTA_STATS: '/actas/stats',
  ACTA_TYPES: '/actas/types',
  ACTAS_BY_EXPEDIENTE: (id) => `/actas/expediente/${id}`,
  ACTA_DETAIL: (id) => `/actas/${id}`,
  ACTAS_STORE: '/actas',
  ACTA_DELETE: (id) => `/actas/${id}`,

  // Pagos / Pensiones
  PAGOS: '/pagos',
  PAGO_PAY: (id) => `/pagos/${id}/pay`,
  PAGO_REVERT: (id) => `/pagos/${id}/revert`,

  // Agenda & Notificaciones
  AGENDA_EVENTS: '/agenda/events',
  AGENDA_STATS: '/agenda/stats',
  AGENDA_EVENT_STATUS: (id) => `/agenda/events/${id}/status`,
  AGENDA_EVENT_DELETE: (id) => `/agenda/events/${id}`,
  AGENDA_NOTIFICATIONS: '/agenda/notifications',
  AGENDA_NOTIF_READ: (id) => `/agenda/notifications/${id}/read`,

  // Notificaciones Modulares
  NOTIFICACIONES: '/notificaciones',
  NOTIFICACIONES_STATS: '/notificaciones/stats',
  NOTIFICACION_DETAIL: (id) => `/notificaciones/${id}`,
  NOTIFICACION_READ: (id) => `/notificaciones/${id}/read`,
  NOTIFICACION_UNREAD: (id) => `/notificaciones/${id}/unread`,
  NOTIFICACIONES_READ_ALL: '/notificaciones/read-all',
  NOTIFICACIONES_CLEAR_READ: '/notificaciones/clear-read',
  NOTIFICACION_DELETE: (id) => `/notificaciones/${id}`,

  // Estadísticas
  KPIS: '/estadisticas/kpis',
  MIMP_REPORT: '/estadisticas/mimp',
  MIMP_REPORT_SAVE: '/estadisticas/mimp/save',

  // Personas & Orientaciones
  PERSONAS_SEARCH: '/personas/search',
  PERSONA_DNI: (dni) => `/personas/lookup-dni/${dni}`,
  ORIENTACIONES: '/orientaciones',

  // Usuarios y Personal
  USUARIOS: '/usuarios',
  USUARIOS_STATS: '/usuarios/stats',
  USUARIOS_ROLES: '/usuarios/roles',
  USUARIO_DETAIL: (id) => `/usuarios/${id}`,
  USUARIO_UPDATE: (id) => `/usuarios/${id}`,
  USUARIO_PASSWORD: (id) => `/usuarios/${id}/password`,
  USUARIO_STATUS: (id) => `/usuarios/${id}/status`,
  USUARIO_DELETE: (id) => `/usuarios/${id}`,

  // Configuración del Sistema y Entidades
  CONFIGURACION: '/configuracion',
  CONFIGURACION_UPDATE: '/configuracion',
  CONFIGURACION_ENTIDADES: '/configuracion/entidades',
  CONFIGURACION_ENTIDAD_STORE: '/configuracion/entidades',
  CONFIGURACION_ENTIDAD_UPDATE: (id) => `/configuracion/entidades/${id}`,
  CONFIGURACION_ENTIDAD_DELETE: (id) => `/configuracion/entidades/${id}`,
  CONFIGURACION_TIPOS_ENTIDAD: '/configuracion/tipos-entidad',
  CONFIGURACION_TEST_EMAIL: '/configuracion/test-email',
  CONFIGURACION_BACKUP: '/configuracion/backup',
};

