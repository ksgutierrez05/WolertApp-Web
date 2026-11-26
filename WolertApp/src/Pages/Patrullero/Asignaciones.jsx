import SolicitarApoyoPatrullero from "../../Components/Patrullero/SolicitarApoyoPatrullero";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../Components/Patrullero/Pageheader";
import Kpis from "../../Components/Patrullero/Kpicard";
import SelectBonito from "../../Components/Administrador-policia/SelectBonito";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import usePatrullero from "../../Utils/usePatrullero";

import {
  EsHoy,
  FinalizarAsignacion,
  FormatearFecha,
  RegistrarLlegada,
} from "../../Services/PoliciaService";

import "../../css/Policia/Patrullero/css/asignaciones.css";

export default function MisAsignaciones() {
  const location = useLocation();
  const navigate = useNavigate();
  const { datos, cargando, error, recargar } = usePatrullero();
  const { confirm, toast } = useFeedback();

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudieron cargar las asignaciones.", "Error al cargar asignaciones");
  }, [error, toast]);

  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [pagina, setPagina] = useState(null);
  const [seleccionId, setSeleccionId] = useState(() => location.state?.asignacionId ?? null);
  const [ocupado, setOcupado] = useState(false);
  const porPagina = 5;

  const asignaciones = useMemo(() => datos?.asignaciones || [], [datos?.asignaciones]);

  useEffect(() => {
    const idSolicitado = location.state?.asignacionId;
    if (idSolicitado == null || asignaciones.length === 0) return;

    const existe = asignaciones.some(
      (asignacion) => String(asignacion.idAsignacion ?? asignacion.IdAsignacion) === String(idSolicitado)
    );
    if (!existe) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [asignaciones, location.pathname, location.state?.asignacionId, navigate]);

  const alertasPorId = useMemo(
    () =>
      new Map(
        (datos?.alertas || []).map((a) => [
          Number(a.idAlerta),
          a,
        ])
      ),
    [datos]
  );

  const seleccion =
    asignaciones.find(
      (a) => String(a.idAsignacion ?? a.IdAsignacion) === String(seleccionId)
    ) || null;

  const alertaSeleccionada = seleccion
    ? alertasPorId.get(Number(seleccion.idAlerta))
    : null;

  const opciones = [
    ["todas", "Todas"],
    ["activas", "Activas"],
    ["asignadas", "Asignadas"],
    ["resueltas", "Finalizadas"],
  ];

  const filtradas = asignaciones.filter((a) => {
    const estado = String(a.estadoAsignacion || a.EstadoAsignacion || "").trim().toUpperCase().replace(/[\s-]+/g, "_");

    if (filtro === "activas" && estado !== "EN_ATENCION")
      return false;

    if (filtro === "asignadas" && estado !== "ASIGNADA")
      return false;

    if (filtro === "resueltas" && estado !== "FINALIZADA")
      return false;

    if (
      busqueda &&
      !String(a.idAlerta).includes(busqueda) &&
      !String(a.idAsignacion).includes(busqueda)
    ) {
      return false;
    }

    if (
      tipo &&
      alertasPorId.get(Number(a.idAlerta))?.tipo !== tipo
    ) {
      return false;
    }

    if (fecha) {
      if (!a.fecha) return false;

      const f = new Date(a.fecha);
      if (Number.isNaN(f.getTime())) return false;

      const fechaAsignacion = [
        f.getFullYear(),
        String(f.getMonth() + 1).padStart(2, "0"),
        String(f.getDate()).padStart(2, "0"),
      ].join("-");

      if (fechaAsignacion !== fecha) return false;
    }

    return true;
  });

  const tipos = [
    ...new Set(
      (datos?.alertas || [])
        .map((a) => a.tipo)
        .filter(Boolean)
    ),
  ];

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const indiceSeleccionado = filtradas.findIndex(
    (asignacion) => String(asignacion.idAsignacion ?? asignacion.IdAsignacion) === String(seleccionId)
  );
  const paginaSeleccionada = indiceSeleccionado >= 0
    ? Math.floor(indiceSeleccionado / porPagina) + 1
    : 1;
  const paginaActual = Math.min(pagina ?? paginaSeleccionada, totalPaginas);
  const asignacionesPagina = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  const valores = {
    total: asignaciones.filter(
      (a) => a.estadoAsignacion === "EN_ATENCION"
    ).length,
    enCamino: "—",
    enSitio: "—",
    resueltasHoy: (datos?.atenciones || []).filter(
      (a) =>
        a.estadoFinal === "FINALIZADA" &&
        EsHoy(a.fechaAtencion)
    ).length,
  };

  async function ejecutar(accion) {
    if (!seleccion || ocupado) return;

    const id = seleccion.idAsignacion;
    const esLlegada = accion === "llegada";
    await confirm({
      title: esLlegada ? "¿Registrar llegada?" : "¿Finalizar participación?",
      description: esLlegada
        ? `Confirma que tu unidad llegó al sitio de la alerta #${seleccion.idAlerta}.`
        : `Confirma que deseas finalizar tu participación en la asignación #${id}.`,
      confirmLabel: esLlegada ? "Registrar llegada" : "Finalizar",
      failureMessage: "No se pudo actualizar la asignación. Revisa su estado e inténtalo de nuevo.",
      onConfirm: async () => {
        setOcupado(true);
        try {
          if (esLlegada) await RegistrarLlegada(id);
          else await FinalizarAsignacion(id);
          toast.success(
            esLlegada ? "La llegada quedó registrada." : "Tu participación se finalizó correctamente.",
            esLlegada ? "Llegada registrada" : "Participación finalizada"
          );
          await recargar().catch((errorCarga) => {
            toast.errorFrom(errorCarga, "La operación se completó, pero no se pudieron actualizar los datos.");
          });
        } finally {
          setOcupado(false);
        }
      },
    });
  }

  const estadoSeleccion = String(
    seleccion?.estadoAsignacion || seleccion?.EstadoAsignacion || ""
  ).trim().toUpperCase().replace(/[\s-]+/g, "_");

  const pasoActual =
    estadoSeleccion === "FINALIZADA"
      ? 3
      : estadoSeleccion === "EN_ATENCION"
      ? 2
      : estadoSeleccion === "ASIGNADA"
      ? 1
      : 0;

  return (
    <div className="container-fluid mis-asignaciones-patrullero">
      <PageHeader
        titulo="Mis Asignaciones"
        descripcion="Asignaciones que la Central de Radio dio a tu unidad."
      />

      <section aria-label="Indicadores de asignaciones">
        <Kpis grupo="atenciones" valores={valores} />
      </section>

      {cargando && (
        <p role="status">Cargando asignaciones...</p>
      )}

      {error && (
        <button type="button" className="btn btn-link btn-sm px-0" onClick={recargar}>Reintentar carga</button>
      )}

      <div className="row g-4 align-items-start">
        <section
          className="col-lg-5"
          aria-label="Lista de asignaciones"
        >
          <div className="card-panel-dash as-panel">
            <div className="as-filterbar" role="group">
              {opciones.map(([clave, etiqueta]) => (
                <button
                  type="button"
                  key={clave}
                  className={`as-chip ${
                    filtro === clave ? "active" : ""
                  }`}
                  onClick={() => { setFiltro(clave); setPagina(1); }}
                  aria-pressed={filtro === clave}
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            <div className="as-buscador">
              <i className="bi bi-search" />
              <input
                type="text"
                className="as-campo"
                placeholder="Buscar por número de caso..."
                aria-label="Buscar por número de caso"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>

            <div className="as-filtros-extra">
              <SelectBonito
                id="asignacion-filtro-tipo"
                ariaLabel="Filtrar por tipo de alerta"
                valor={tipo}
                onChange={(valor) => { setTipo(valor); setPagina(1); }}
                opciones={tipos.map((t) => ({ valor: t, etiqueta: String(t).replaceAll("_", " ") }))}
                placeholder="Todos los tipos"
                icono="bi-exclamation-circle"
              />

              <input
                type="date"
                className="as-campo"
                aria-label="Filtrar por fecha"
                value={fecha}
                onChange={(e) => { setFecha(e.target.value); setPagina(1); }}
              />
            </div>

            {!cargando && !error && (
              filtradas.length === 0 ? (
                <div className="as-vacio">
                  <span className="as-vacio-icono">
                    <i className="bi bi-clipboard2-check" />
                  </span>
                  <h3>No hay asignaciones</h3>
                  <p>
                    La Central todavía no ha asignado casos
                    con esos filtros.
                  </p>
                </div>
              ) : (
                <div className="as-lista">
                  {asignacionesPagina.map((a) => {
                    const seleccionada =
                      String(seleccionId) ===
                      String(a.idAsignacion);

                    return (
                      <button
                        type="button"
                        key={a.idAsignacion}
                        className={`as-item ${
                          seleccionada ? "as-item-activo" : ""
                        }`}
                        onClick={() => {
                          setSeleccionId(a.idAsignacion ?? a.IdAsignacion);
                          setPagina(null);
                        }}
                      >
                        <div className="as-item-cabecera">
                          <strong>
                            Asignación #{a.idAsignacion}
                          </strong>
                          <span className="as-item-estado">
                            {String(
                              a.estadoAsignacion || "Sin estado"
                            ).replaceAll("_", " ")}
                          </span>
                        </div>

                        <p>
                          Alerta #{a.idAlerta} ·{" "}
                          {String(
                            alertasPorId.get(Number(a.idAlerta))
                              ?.tipo || "Sin tipo"
                          ).replaceAll("_", " ")}
                        </p>

                        <small>
                          <i className="bi bi-clock me-1" />
                          {FormatearFecha(a.fecha)}
                        </small>
                      </button>
                    );
                  })}
                </div>
              )
            )}
            {!cargando && !error && filtradas.length > 0 && (
              <nav className="as-paginacion" aria-label="Paginacion de asignaciones">
                <span>{(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, filtradas.length)} de {filtradas.length}</span>
                <div>
                  <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(Math.max(1, paginaActual - 1))}>Anterior</button>
                  {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((numero) => (
                    <button key={numero} type="button" className={paginaActual === numero ? "active" : ""} aria-current={paginaActual === numero ? "page" : undefined} onClick={() => setPagina(numero)}>{numero}</button>
                  ))}
                  <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina(Math.min(totalPaginas, paginaActual + 1))}>Siguiente</button>
                </div>
              </nav>
            )}
          </div>
        </section>

        <section
          className="col-lg-7"
          aria-label="Detalle de la asignación"
        >
          <div className="card-panel-dash as-detalle">
            <div className="as-detalle-cabecera">
              <h2 className="as-detalle-titulo">
                <i className="bi bi-info-circle" />
                Detalle de la asignación
              </h2>

              <span className="as-estado-vacio">
                {seleccion
                  ? estadoSeleccion.replaceAll("_", " ")
                  : "Sin selección"}
              </span>
            </div>

            {!seleccion ? (
              <div className="as-detalle-vacio">
                <span className="as-vacio-icono as-vacio-icono--grande">
                  <i className="bi bi-cursor" />
                </span>
                <h3>Selecciona una asignación</h3>
                <p>
                  Elige una de la lista para consultar sus
                  detalles y actualizar su estado.
                </p>
              </div>
            ) : (
              <div className="as-detalle-info">
                <h3>Asignación #{seleccion.idAsignacion} · Alerta #{seleccion.idAlerta}</h3>
                <div className="as-datos-grid">
                  <div className="as-dato"><span><i className="bi bi-car-front" aria-hidden="true" /> Unidad policial</span><strong>{seleccion.unidadNombre || "—"}</strong></div>
                  <div className="as-dato"><span><i className="bi bi-calendar3" aria-hidden="true" /> Fecha de asignación</span><strong>{FormatearFecha(seleccion.fecha)}</strong></div>
                  <div className="as-dato"><span><i className="bi bi-exclamation-circle" aria-hidden="true" /> Tipo de alerta</span><strong>{String(alertaSeleccionada?.tipo || "—").replaceAll("_", " ")}</strong></div>
                  <div className="as-dato"><span><i className="bi bi-flag" aria-hidden="true" /> Prioridad</span><strong>{alertaSeleccionada?.prioridad || "—"}</strong></div>
                  <div className="as-dato"><span><i className="bi bi-geo-alt" aria-hidden="true" /> Barrio</span><strong>{alertaSeleccionada?.barrioNombre || alertaSeleccionada?.nombreBarrio || alertaSeleccionada?.barrio?.nombre || "No disponible"}</strong></div>
                  <div className="as-dato"><span><i className="bi bi-activity" aria-hidden="true" /> Estado</span><strong>{estadoSeleccion.replaceAll("_", " ")}</strong></div>
                  <div className="as-dato as-dato-ancho"><span><i className="bi bi-chat-left-text" aria-hidden="true" /> Observación</span><strong>{seleccion.observacion || "Sin observaciones"}</strong></div>
                  <div className="as-dato as-dato-ancho"><span><i className="bi bi-card-text" aria-hidden="true" /> Descripción</span><strong>{alertaSeleccionada?.descripcion || "Descripción no disponible"}</strong></div>
                </div>
              </div>
            )}

            <SolicitarApoyoPatrullero asignacion={seleccion} onCreada={recargar} />

            {seleccion && (
              <div
                className="as-pasos"
                aria-label="Avance de la asignación"
              >
                {[
                  ["bi-send", "Asignada"],
                  ["bi-geo-alt", "En atención"],
                  ["bi-check2-circle", "Finalizada"],
                ].map(([icono, texto], indice) => (
                  <div
                    className={`as-paso ${
                      indice < pasoActual
                        ? "as-paso-completado"
                        : ""
                    }`}
                    key={texto}
                  >
                    <span className="as-paso-punto">
                      <i className={`bi ${icono}`} />
                    </span>
                    <span className="as-paso-texto">
                      {texto}
                    </span>
                  </div>
                ))}
              </div>
            )}
<div className="as-acciones">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled
                title="No existe una operación disponible para marcar En camino"
              >
                <i className="bi bi-signpost-split me-1" />
                Voy en camino
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={
                  !seleccion ||
                  estadoSeleccion !== "ASIGNADA" ||
                  ocupado
                }
                onClick={() => ejecutar("llegada")}
              >
                <i className="bi bi-geo-alt me-1" />
                Llegué al sitio
              </button>

              <button
                type="button"
                className="btn btn-cv-azul btn-sm"
                disabled={
                  !seleccion ||
                  estadoSeleccion !== "EN_ATENCION" ||
                  ocupado
                }
                onClick={() => ejecutar("finalizar")}
                title="Requiere una atención finalizada registrada"
              >
                <i className="bi bi-check2-circle me-1" />
                Finalizar participación
              </button>
            </div>

            <small className="as-ayuda">
              Para finalizar la participación debe existir
              una atención FINALIZADA. El backend valida
              esta condición.
            </small>
          </div>
        </section>
      </div>
    </div>
  );
}
