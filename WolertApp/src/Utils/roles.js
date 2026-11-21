export function normalizarRol(rol = '') {
  return String(rol).replace(/[\s_-]/g, '').toUpperCase();
}

const RUTA_POR_ROL = {
  ADMIN: '/admin',
  CIUDADANO: '/ciudadano',
  ADMINPOLICIA: '/Administrador-Policia',
  CENTRALPOLICIA: '/Central-Policia',
  POLICIA: '/Patrullero',
  ADMINTRANSITO: '/transito/director/panel',
  DIRECTORTRANSITO: '/transito/director/panel',
  CENTRALTRANSITO: '/transito/central/panel',
  AGENTETRANSITO: '/transito/agente/panel',
};

export function rutaDelRol(rol) {
  return RUTA_POR_ROL[normalizarRol(rol)] || '/login';
}
