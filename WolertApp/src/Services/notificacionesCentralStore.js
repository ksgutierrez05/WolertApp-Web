import { cargarNotificacionesCentral } from "./notificacionesCentralService";

const estadoVacio = () => ({ lista: [], cargando: false, error: "", cargado: false });
let estado = estadoVacio();
let solicitud = null;
let controlador = null;
let sesionActual = null;
let generacion = 0;
let intervalo = null;
const suscriptores = new Set();

function publicar(cambios) {
  estado = { ...estado, ...cambios };
  suscriptores.forEach((suscriptor) => suscriptor(estado));
}

function sincronizarSesion() {
  const firma = `${localStorage.getItem("idUsuario") || ""}:${localStorage.getItem("token") || ""}`;
  if (firma === sesionActual) return;
  sesionActual = firma;
  generacion += 1;
  controlador?.abort();
  controlador = null;
  solicitud = null;
  estado = estadoVacio();
  suscriptores.forEach((suscriptor) => suscriptor());
}

function cargar() {
  sincronizarSesion();
  if (solicitud) return solicitud;
  controlador = new AbortController();
  const signal = controlador.signal;
  const generacionSolicitud = generacion;
  publicar({ cargando: true, error: "" });
  const actual = cargarNotificacionesCentral(signal)
    .then((lista) => {
      if (!signal.aborted && generacionSolicitud === generacion) publicar({ lista, cargando: false, error: "", cargado: true });
    })
    .catch((error) => {
      if (!signal.aborted && generacionSolicitud === generacion) publicar({ cargando: false, error: error.message, cargado: true });
    })
    .finally(() => {
      if (solicitud === actual) {
        solicitud = null;
        controlador = null;
        if (suscriptores.size && signal.aborted) cargar();
      }
    });
  solicitud = actual;
  return actual;
}

export function obtenerEstadoNotificacionesCentral() {
  return estado;
}

export function suscribirNotificacionesCentral(suscriptor) {
  sincronizarSesion();
  suscriptores.add(suscriptor);
  if (!intervalo) {
    if (!estado.cargado) cargar();
    intervalo = window.setInterval(cargar, 30000);
  }
  return () => {
    suscriptores.delete(suscriptor);
    if (!suscriptores.size) {
      window.clearInterval(intervalo);
      intervalo = null;
      controlador?.abort();
    }
  };
}
