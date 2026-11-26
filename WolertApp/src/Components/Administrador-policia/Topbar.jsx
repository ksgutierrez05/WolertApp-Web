import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "../Feedback/useFeedback";
import {
  cargarNotificacionesCentral,
  idNotificacion,
  mensajeNotificacion,
  fechaDe,
  fechaLegible,
} from "../../Services/notificacionesCentralService";
import {
  leerIdsLeidos,
  guardarIdsLeidos,
} from "../../Services/notificacionesEstado";
import "../../css/Policia/administrador-policia/css/topbar.css";

const raiz = "/Administrador-Policia";
const modulos = [
  ["Centro de Operaciones", ""],
  ["Alertas", "/Alertas"],
  ["Alarmas", "/Alarmas"],
  ["Tipos de Alertas", "/Tipos-Alertas"],
  ["Unidades", "/Unidades"],
  ["Policías", "/Policias"],
  ["Historial", "/Historial"],
  ["Estadísticas", "/Estadisticas"],
  ["Reportes", "/Reportes"],
  ["Notificaciones", "/Notificaciones"],
  ["Configuración", "/Configuracion"],
];
const normalizar = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export default function Topbar({
  iniciales = "",
  children,
  placeholder,
  valor,
  onCambio,
}) {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const ref = useRef(null);
  const ultimoErrorNotificaciones = useRef("");
  const [panel, setPanel] = useState("");
  const [texto, setTexto] = useState("");
  const [lista, setLista] = useState([]);
  const [leidas, setLeidas] = useState(leerIdsLeidos);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const controlado = typeof onCambio === "function";
  useEffect(() => {
    const c = new AbortController();
    let ocupado = false;
    async function cargar() {
      if (ocupado) return;
      ocupado = true;
      try {
        const datos = await cargarNotificacionesCentral(c.signal);
        if (!c.signal.aborted) {
          setLista(datos);
          setError("");
          ultimoErrorNotificaciones.current = "";
        }
      } catch (e) {
        if (!c.signal.aborted) {
          setError(e.message);
          if (ultimoErrorNotificaciones.current !== e.message) {
            ultimoErrorNotificaciones.current = e.message;
            toast.errorFrom(e, "No se pudieron cargar las notificaciones.", "Error de conexión");
          }
        }
      } finally {
        ocupado = false;
        if (!c.signal.aborted) setCargando(false);
      }
    }
    const sincronizar = () => setLeidas(leerIdsLeidos());
    cargar();
    const timer = setInterval(cargar, 30000);
    window.addEventListener("wolertapp:notificaciones", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      c.abort();
      clearInterval(timer);
      window.removeEventListener("wolertapp:notificaciones", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, [toast]);
  useEffect(() => {
    const fuera = (e) => {
      if (!ref.current?.contains(e.target)) setPanel("");
    };
    const tecla = (e) => {
      if (e.key === "Escape") setPanel("");
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, []);
  const pendientes = lista.filter(
    (n) => !leidas.includes(String(idNotificacion(n))),
  );
  const marcar = (ids) =>
    setLeidas(guardarIdsLeidos([...leerIdsLeidos(), ...ids.map(String)]));
  const ir = (ruta) => {
    setPanel("");
    setTexto("");
    navigate(raiz + ruta);
  };
  const resultados = modulos.filter(([nombre]) =>
    normalizar(nombre).includes(normalizar(texto.trim())),
  );
  return (
    <div ref={ref} className="d-flex align-items-center gap-3 mb-4 ap-topbar">
      <div className="search-dash flex-grow-1 d-flex align-items-center input-group ap-search">
        <span className="input-group-text bg-transparent border-0">
          <i className="bi bi-search" />
        </span>
        <input
          type="text"
          className="form-control border-0 bg-transparent"
          placeholder={
            placeholder || (controlado ? "Buscar..." : "Buscar módulo...")
          }
          value={controlado ? (valor ?? "") : texto}
          onFocus={() => !controlado && setPanel("buscar")}
          onChange={(e) => {
            if (controlado) onCambio(e.target.value);
            else {
              setTexto(e.target.value);
              setPanel("buscar");
            }
          }}
          onKeyDown={(e) => {
            if (!controlado && e.key === "Enter" && resultados.length)
              ir(resultados[0][1]);
          }}
        />
        {panel === "buscar" && !controlado && (
          <div className="ap-pop ap-resultados">
            {resultados.length ? (
              resultados.map(([nombre, ruta]) => (
                <button key={ruta} onClick={() => ir(ruta)}>
                  {nombre}
                  <i className="bi bi-chevron-right" />
                </button>
              ))
            ) : (
              <p>Sin resultados</p>
            )}
          </div>
        )}
      </div>
      <div className="ap-anchor">
        <button
          type="button"
          className="icon-btn-dash btn btn-light rounded-circle position-relative"
          aria-label={`Notificaciones: ${pendientes.length} sin leer`}
          aria-expanded={panel === "avisos"}
          onClick={() => setPanel(panel === "avisos" ? "" : "avisos")}
        >
          <i className="bi bi-bell" />
          {pendientes.length > 0 && (
            <span className="ap-count">
              {pendientes.length > 99 ? "99+" : pendientes.length}
            </span>
          )}
        </button>
        {panel === "avisos" && (
          <section className="ap-pop ap-avisos">
            <header>
              <strong>Notificaciones</strong>
              <button
                disabled={!pendientes.length}
                onClick={() => marcar(pendientes.map(idNotificacion))}
              >
                Marcar todas como leídas
              </button>
            </header>
            <div className="ap-lista">
              {error && <p role="alert">{error}</p>}
              {cargando ? (
                <p>Cargando...</p>
              ) : !lista.length && !error ? (
                <p>No tienes notificaciones.</p>
              ) : (
                lista.slice(0, 6).map((n) => (
                  <button
                    key={idNotificacion(n)}
                    className={`ap-aviso ${leidas.includes(String(idNotificacion(n))) ? "" : "ap-nueva"}`}
                    onClick={() => marcar([idNotificacion(n)])}
                  >
                    <span className="ap-icon">
                      <i className="bi bi-bell" />
                    </span>
                    <span>
                      <strong>Notificación #{idNotificacion(n)}</strong>
                      <span>{mensajeNotificacion(n)}</span>
                      <small>{fechaLegible(fechaDe(n))}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
            <button className="ap-ver" onClick={() => ir("/Notificaciones")}>
              Ver todas las notificaciones
            </button>
          </section>
        )}
      </div>
      {children}
      <div className="ap-anchor">
        <button
          type="button"
          className="avatar-dash ap-avatar"
          aria-label="Menú de usuario"
          aria-expanded={panel === "perfil"}
          onClick={() => setPanel(panel === "perfil" ? "" : "perfil")}
        >
          {iniciales || "AP"}
        </button>
        {panel === "perfil" && (
          <div className="ap-pop ap-perfil">
            <strong>Administrador de Policía</strong>
            <button onClick={() => ir("/Configuracion")}>Configuración</button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("idUsuario");
                navigate("/", { replace: true });
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
