
import { useEffect, useState } from "react";
import PageHeader from "../../Components/Patrullero/Pageheader";
import Kpis from "../../Components/Patrullero/Kpicard";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import usePatrullero from "../../Utils/usePatrullero";
import { FormatearFecha } from "../../Services/PoliciaService";
import "../../css/Policia/Patrullero/css/alertas.css";

const normalizarEstado = (valor) => String(valor || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
const prioridadAlerta = (alerta) => alerta.prioridad ?? alerta.Prioridad;
const estadoAlerta = (alerta) => alerta.estado ?? alerta.Estado ?? alerta.estadoAlerta ?? alerta.EstadoAlerta;

export default function Alertas() {
  const [filtro, setFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const { datos, cargando, error, recargar } = usePatrullero();
  const { toast } = useFeedback();
  const porPagina = 6;

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudieron cargar las alertas.", "Error al cargar alertas");
  }, [error, toast]);

  const orden = { ALTA: 0, MEDIA: 1, BAJA: 2 };

  const alertas = [...(datos?.alertas || [])].sort(
    (a, b) =>
      (orden[normalizarEstado(prioridadAlerta(a))] ?? 3) -
      (orden[normalizarEstado(prioridadAlerta(b))] ?? 3)
  );

  const filtradas =
    filtro === "todas"
      ? alertas
      : alertas.filter(
          (a) => normalizarEstado(prioridadAlerta(a)).toLowerCase() === filtro
        );

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginaAlertas = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  const nuevas = alertas.filter((a) =>
    (datos?.asignaciones || []).some(
      (x) =>
        Number(x.idAlerta) === Number(a.idAlerta) &&
        x.estadoAsignacion === "ASIGNADA"
    )
  );

  const valores = {
    total: alertas.length,
    prioridadAlta: alertas.filter(
      (a) => normalizarEstado(prioridadAlerta(a)) === "ALTA"
    ).length,
    nuevas: nuevas.length,
    resueltas: alertas.filter(
      (a) => normalizarEstado(estadoAlerta(a)) === "RESUELTA"
    ).length,
  };

  return (
    <div className="container-fluid mis-alertas-patrullero">
      <PageHeader
        titulo="Mis Alertas"
        descripcion="Alertas relacionadas con las asignaciones de tu unidad, ordenadas por prioridad."
      />

      <section aria-label="Indicadores de alertas">
        <Kpis grupo="alertas" valores={valores} />
      </section>

      <div className="al-filterbar" role="group">
        {["todas", "alta", "media", "baja"].map((op) => (
          <button
            key={op}
            type="button"
            className={`al-chip ${filtro === op ? "active" : ""}`}
            onClick={() => { setFiltro(op); setPagina(1); }}
            aria-pressed={filtro === op}
          >
            {op === "todas"
              ? "Todas"
              : op[0].toUpperCase() + op.slice(1)}
          </button>
        ))}
      </div>

      {cargando && <p role="status">Cargando alertas...</p>}

      {error && (
        <button type="button" className="btn btn-link btn-sm px-0" onClick={recargar}>Reintentar carga</button>
      )}

      {!cargando && !error && (
        <div className="al-list">
          {filtradas.length === 0 ? (
            <div className="card-panel-dash al-vacio">
              <span className="al-vacio-icono">
                <i className="bi bi-inbox" />
              </span>
              <h3>No hay alertas para mostrar</h3>
              <p>No hay alertas de tu unidad con este filtro.</p>
            </div>
          ) : (
            paginaAlertas.map((a) => (
              <article
                key={a.idAlerta}
                className={`card-panel-dash al-card al-card--${normalizarEstado(prioridadAlerta(a)).toLowerCase()}`}
              >
                <div className="al-card-head">
                  <h3 className="al-card-title">
                    Alerta #{a.idAlerta} ·{" "}
                    {String(a.tipo || "Sin tipo").replaceAll("_", " ")}
                  </h3>

                  <span className="al-prioridad">
                    {prioridadAlerta(a) || "Sin prioridad"}
                  </span>
                </div>

                <p className="al-descripcion">
                  {a.descripcion || "Sin descripción"}
                </p>

                <div className="al-card-meta">
                  <span><i className="bi bi-geo-alt" aria-hidden="true" /> {a.barrioNombre || a.nombreBarrio || a.barrio?.nombre || "Barrio no registrado"}</span>
                  <span className={`al-estado al-estado--${normalizarEstado(estadoAlerta(a)).toLowerCase().replace(/_/g, "-")}`}>
                    <i className="bi bi-activity" aria-hidden="true" /> {String(estadoAlerta(a) || "Sin estado").replaceAll("_", " ")}
                  </span>
                  <span><i className="bi bi-calendar3" aria-hidden="true" /> {FormatearFecha(a.fecha)}</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {!cargando && !error && filtradas.length > 0 && (
        <nav className="al-pagination" aria-label="Paginacion de alertas">
          <span>Mostrando {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, filtradas.length)} de {filtradas.length}</span>
          <div>
            <button type="button" disabled={paginaActual === 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}>Anterior</button>
            {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((numero) => (
              <button key={numero} type="button" className={paginaActual === numero ? "active" : ""} aria-current={paginaActual === numero ? "page" : undefined} onClick={() => setPagina(numero)}>{numero}</button>
            ))}
            <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}>Siguiente</button>
          </div>
        </nav>
      )}
    </div>
  );
}
