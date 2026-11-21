
import { useMemo, useState } from "react";
import PageHeader from "../../Components/Patrullero/Pageheader";
import Kpis from "../../Components/Patrullero/Kpicard";
import usePatrullero from "../../Utils/usePatrullero";

import {
  EsHoy,
  FinalizarAsignacion,
  FormatearFecha,
  RegistrarLlegada,
} from "../../Services/PoliciaService";

import "../../css/Policia/Patrullero/css/asignaciones.css";

export default function MisAsignaciones() {
  const { datos, cargando, error, recargar } = usePatrullero();

  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [seleccionId, setSeleccionId] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [accionError, setAccionError] = useState("");
  const [accionOk, setAccionOk] = useState("");

  const asignaciones = datos?.asignaciones || [];

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
      (a) => String(a.idAsignacion) === String(seleccionId)
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
    const estado = String(a.estadoAsignacion || "").toUpperCase();

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
    setOcupado(true);
    setAccionError("");
    setAccionOk("");

    try {
      if (accion === "llegada") {
        await RegistrarLlegada(id);
      } else if (accion === "finalizar") {
        await FinalizarAsignacion(id);
      } else {
        return;
      }

      await recargar();

      setAccionOk(
        accion === "llegada"
          ? "Llegada registrada correctamente."
          : "Participación finalizada correctamente."
      );
    } catch (e) {
      setAccionError(
        e?.message || "No se pudo actualizar la asignación."
      );
    } finally {
      setOcupado(false);
    }
  }

  const estadoSeleccion = String(
    seleccion?.estadoAsignacion || ""
  ).toUpperCase();

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
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" onClick={recargar}>
            Reintentar
          </button>
        </div>
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
                  onClick={() => setFiltro(clave)}
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
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="as-filtros-extra">
              <select
                className="as-campo"
                aria-label="Tipo de alerta"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Tipo de alerta</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {String(t).replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="as-campo"
                aria-label="Filtrar por fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
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
                  {filtradas.map((a) => {
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
                          setSeleccionId(a.idAsignacion);
                          setAccionError("");
                          setAccionOk("");
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
                <h3>
                  Asignación #{seleccion.idAsignacion}
                  {" · "}
                  Alerta #{seleccion.idAlerta}
                </h3>

                <p>
                  <strong>Unidad policial</strong>
                  {seleccion.unidadNombre || "—"}
                </p>

                <p>
                  <strong>Fecha de asignación</strong>
                  {FormatearFecha(seleccion.fecha)}
                </p>

                <p>
                  <strong>Tipo de alerta</strong>
                  {String(
                    alertaSeleccionada?.tipo || "—"
                  ).replaceAll("_", " ")}
                </p>

                <p>
                  <strong>Prioridad</strong>
                  {alertaSeleccionada?.prioridad || "—"}
                </p>

                <p className="as-detalle-ancho">
                  <strong>Observación</strong>
                  {seleccion.observacion ||
                    "Sin observaciones"}
                </p>

                <p className="as-detalle-ancho">
                  <strong>Descripción de la alerta</strong>
                  {alertaSeleccionada?.descripcion ||
                    "Descripción no disponible"}
                </p>
              </div>
            )}

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

            {accionError && (
              <p className="alert alert-danger" role="alert">
                {accionError}
              </p>
            )}

            {accionOk && (
              <p className="alert alert-success" role="status">
                {accionOk}
              </p>
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
