import { useEffect, useState } from "react";
import Layout from "../../Components/transito/Layout";
import {
  obtenerGrupoAgente,
  obtenerAtencionesAgente,
  fechaAtencion,
} from "../../Services/agenteTransitoService";

const PASOS = [
  { id: "recibido", label: "Recibido", icono: "bi-check-circle-fill" },
  { id: "camino", label: "En camino", icono: "bi-check-circle-fill" },
  { id: "sitio", label: "En el sitio", icono: "bi-geo-alt-fill" },
  { id: "atendido", label: "Atendido", icono: "bi-flag-fill" },
];

const normalizar = (valor) => String(valor ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

function pasoDesdeEstado(estado) {
  const valor = normalizar(estado);
  if (["ATENDIDO", "ATENDIDA", "FINALIZADA", "FINALIZADO", "RESUELTA", "RESUELTO"].includes(valor)) return 3;
  if (["EN_SITIO", "EN_EL_SITIO", "EN LUGAR", "EN_LUGAR"].includes(valor)) return 2;
  if (["EN_CAMINO", "EN CAMINO", "EN_RUTA"].includes(valor)) return 1;
  return 0;
}

function iniciales(nombre) {
  return String(nombre || "A").trim().split(/\s+/).slice(0, 2)
    .map((parte) => parte.charAt(0)).join("").toUpperCase();
}

function nombreIntegrante(integrante) {
  return integrante.nombreUsuario || integrante.nombreCompleto ||
    integrante.nombreAgente || integrante.username ||
    `Agente #${integrante.idUsuario ?? "—"}`;
}

function esFinalizada(atencion) {
  return ["FINALIZADA", "FINALIZADO", "ATENDIDA", "ATENDIDO", "RESUELTA", "RESUELTO", "CERRADA", "CERRADO"]
    .includes(normalizar(atencion.estadoFinal ?? atencion.estado));
}

export default function Grupo() {
  const [grupo, setGrupo] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let montado = true;
    Promise.allSettled([obtenerGrupoAgente(), obtenerAtencionesAgente()])
      .then(([resultadoGrupo, resultadoAtenciones]) => {
        if (!montado) return;
        if (resultadoGrupo.status === "fulfilled") setGrupo(resultadoGrupo.value);
        if (resultadoAtenciones.status === "fulfilled") {
          setAtenciones(Array.isArray(resultadoAtenciones.value) ? resultadoAtenciones.value : []);
        }
        const fallos = [resultadoGrupo, resultadoAtenciones].filter((r) => r.status === "rejected");
        if (fallos.length) setError(fallos.map((r) => r.reason?.message || "Error de conexión").join(" | "));
      })
      .finally(() => { if (montado) setCargando(false); });
    return () => { montado = false; };
  }, []);

  const unidad = grupo?.unidad;
  const integrantes = grupo?.integrantes ?? [];
  const activas = atenciones.filter((atencion) => !esFinalizada(atencion));
  const nombreUnidad = unidad?.nombre || unidad?.nombreUnidad || "Mi grupo";
  const zona = unidad?.nombreBarrio || unidad?.nombreComuna || unidad?.zona || "Zona no registrada";
  const estadoUnidad = unidad?.estado || "Estado no disponible";

  return (
    <Layout rol="agente" titulo="Mi grupo" activo="grupo" busqueda={{ placeholder: "Buscar..." }}>
      <div className="hero-page-dash hero-page-img-dash mb-4">
        <div className="eyebrow-page-img-dash">
          <i className="bi bi-people-fill me-2" />
          <span>{nombreUnidad.toUpperCase()} · {zona.toUpperCase()}</span>
        </div>
        <h1 className="hero-page-title-dash">Buenos días,<br />{nombreUnidad}</h1>
        <p className="hero-page-text-dash mb-0">
          {cargando ? "Consultando casos asignados..." :
            `Tienen ${activas.length} ${activas.length === 1 ? "caso asignado" : "casos asignados"} en este momento.`}
        </p>
        <div className="chips-page-img-dash">
          <span className="chip-page-img-dash">
            <span className="punto-vivo-dash" /> {estadoUnidad}
          </span>
          <span className="chip-page-img-dash">
            <i className="bi bi-person-check" /> {integrantes.length} integrantes
          </span>
        </div>
      </div>

      {cargando && <div className="alert alert-info" role="status">Cargando grupo...</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="panel-card-dash mb-4">
        <p className="caso-label-dash mb-2">CASOS ASIGNADOS A TU GRUPO</p>
        {!cargando && activas.length === 0 && (
          <p className="config-text-dash mb-0">No hay atenciones en proceso para tu unidad.</p>
        )}
        {activas.map((atencion, indice) => {
          const estado = atencion.estadoEtapa || atencion.etapa || atencion.estadoAtencion || atencion.estadoFinal;
          const pasoActual = pasoDesdeEstado(estado);
          return (
            <div key={atencion.idAtencionTransito ?? indice} className="mb-4">
              <span className="badge-tipo-dash tipo-accidente-dash mb-2 d-inline-block">
                {atencion.nombreTipoAlerta || atencion.tipoCaso || `Atención #${atencion.idAtencionTransito ?? "—"}`}
              </span>
              <h2 className="caso-titulo-dash">
                {atencion.nombreReportante || atencion.nombreUsuario || `Alerta #${atencion.idAlerta ?? "—"}`}
              </h2>
              <p className="config-text-dash mb-3">
                {fechaAtencion(atencion.fechaAtencion)}
                {atencion.descripcion ? ` · ${atencion.descripcion}` : ""}
              </p>
              <div className="progreso-caso-dash">
                <div className="progreso-linea-dash">
                  {PASOS.map((paso, i) => (
                    <div key={paso.id} className={`progreso-paso-dash ${
                      i < pasoActual ? "paso-completado-dash" :
                      i === pasoActual ? "paso-actual-dash" : "paso-pendiente-dash"
                    }`} aria-current={i === pasoActual ? "step" : undefined}>
                      <span className="progreso-circulo-dash">
                        <i className={`bi ${i < pasoActual ? "bi-check-lg" : paso.icono}`} />
                      </span>
                      <span className="progreso-label-dash">{paso.label}</span>
                    </div>
                  ))}
                </div>
                <div className="progreso-accion-dash">
                  <span className="progreso-ayuda-dash">
                    {estado ? `Estado reportado: ${String(estado).replaceAll("_", " ")}` : "Etapa no informada por la API"}
                  </span>
                  <span className="badge-estado-dash estado-atencion-dash">En proceso</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-card-dash">
        <h2 className="panel-title-dash">Integrantes de {nombreUnidad}</h2>
        {integrantes.map((integrante, indice) => {
          const nombre = nombreIntegrante(integrante);
          const estado = integrante.estadoAgente || integrante.estado || "Sin estado";
          const disponible = ["ACTIVO", "DISPONIBLE", "EN_SERVICIO"].includes(normalizar(estado));
          return (
            <div key={integrante.idUsuario ?? indice} className="miembro-row-dash">
              <div className="d-flex align-items-center gap-2">
                <span className={`avatar-icon-dash ${disponible ? "avatar-green-dash" : "avatar-amber-dash"}`}>
                  {iniciales(nombre)}
                </span>
                <div className="fw-semibold">{nombre}</div>
              </div>
              <span className={`badge-estado-dash ${disponible ? "estado-resuelta-dash" : "estado-atencion-dash"}`}>
                {estado.replaceAll("_", " ")}
              </span>
            </div>
          );
        })}
        {!cargando && integrantes.length === 0 && (
          <p className="config-text-dash mb-0">No hay integrantes registrados para esta unidad.</p>
        )}
      </div>
    </Layout>
  );
}
