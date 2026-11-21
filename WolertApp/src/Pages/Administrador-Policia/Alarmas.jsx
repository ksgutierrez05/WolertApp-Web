
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Administrador-policia/Topbar";
import { listarAlarmas } from "../../Services/AlarmasAdminService";

import "../../css/Policia/administrador-policia/css/alarmas.css";

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const obtenerId = (alarma) =>
  alarma.idAlarma ??
  alarma.IdAlarma ??
  alarma.ID_ALARMA;

const obtenerNombre = (alarma) =>
  alarma.nombre ??
  alarma.Nombre ??
  alarma.NOMBRE ??
  "";

const obtenerBarrio = (alarma) =>
  alarma.nombreBarrio ??
  alarma.barrioNombre ??
  alarma.barrio?.nombre ??
  alarma.NombreBarrio ??
  (alarma.idBarrio != null
    ? `Barrio #${alarma.idBarrio}`
    : "Sin barrio");

const obtenerEstado = (alarma) =>
  normalizar(
    alarma.estado ??
    alarma.Estado ??
    alarma.ESTADO
  );

const obtenerRadio = (alarma) =>
  alarma.radioCobertura ??
  alarma.RadioCobertura ??
  alarma.radio_cobertura ??
  null;

const obtenerLatitud = (alarma) =>
  alarma.latitud ?? alarma.Latitud ?? null;

const obtenerLongitud = (alarma) =>
  alarma.longitud ?? alarma.Longitud ?? null;

function Alarmas() {
  const [alarmas, setAlarmas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("TODAS");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listarAlarmas(controller.signal)
      .then((datos) => {
        if (controller.signal.aborted) return;

        setAlarmas(datos);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setError(
          err.message ||
          "No se pudieron consultar las alarmas."
        );
        setAlarmas([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const resumen = useMemo(() => ({
    total: alarmas.length,

    activas: alarmas.filter(
      (a) => obtenerEstado(a) === "ACTIVA"
    ).length,

    inactivas: alarmas.filter(
      (a) => obtenerEstado(a) === "INACTIVA"
    ).length,

    mantenimiento: alarmas.filter(
      (a) => obtenerEstado(a) === "MANTENIMIENTO"
    ).length,
  }), [alarmas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alarmas.filter((alarma) => {
      const coincideEstado =
        filtro === "TODAS" ||
        obtenerEstado(alarma) === filtro;

      const contenido = [
        obtenerId(alarma),
        obtenerNombre(alarma),
        obtenerBarrio(alarma),
        obtenerEstado(alarma),
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideEstado &&
        contenido.includes(texto)
      );
    });
  }, [alarmas, busqueda, filtro]);

  const indicadores = [
    {
      titulo: "Total de alarmas",
      valor: resumen.total,
      icono: "bi-broadcast-pin",
      tono: "azul",
    },
    {
      titulo: "Activas",
      valor: resumen.activas,
      icono: "bi-check-circle-fill",
      tono: "verde",
    },
    {
      titulo: "Inactivas",
      valor: resumen.inactivas,
      icono: "bi-slash-circle-fill",
      tono: "rojo",
    },
    {
      titulo: "En mantenimiento",
      valor: resumen.mantenimiento,
      icono: "bi-tools",
      tono: "ambar",
    },
  ];

  const filtros = [
    {
      clave: "TODAS",
      titulo: "Todas",
      cantidad: resumen.total,
    },
    {
      clave: "ACTIVA",
      titulo: "Activas",
      cantidad: resumen.activas,
    },
    {
      clave: "INACTIVA",
      titulo: "Inactivas",
      cantidad: resumen.inactivas,
    },
    {
      clave: "MANTENIMIENTO",
      titulo: "En mantenimiento",
      cantidad: resumen.mantenimiento,
    },
  ];

  function actualizar() {
    if (cargando) return;

    setCargando(true);
    setError("");
    setRecarga((actual) => actual + 1);
  }

  return (
    <>
      <Topbar
        iniciales="SG"
        placeholder="Buscar por nombre o barrio..."
        valor={busqueda}
        onCambio={setBusqueda}
      />

      <section className="alarmas-vista">

        {/* ENCABEZADO */}

        <div className="alarmas-encabezado">
          <div className="alarmas-encabezado-texto">
            <h1>Alarmas</h1>
            <p>
              Consulta y monitorea las alarmas
              comunitarias registradas por barrio.
            </p>
          </div>

          <button
            type="button"
            className="alarmas-btn-actualizar"
            onClick={actualizar}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando
              ? "Actualizando..."
              : "Actualizar"}
          </button>
        </div>

        {/* ERRORES */}

        {error && (
          <div
            className="alert alert-danger mb-4"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        {/* TARJETAS */}

        <div className="row g-3 mb-4">
          {indicadores.map((item) => (
            <div
              className="col-6 col-xl-3"
              key={item.titulo}
            >
              <article
                className={`alarmas-kpi tono-${item.tono}`}
              >
                <div className="alarmas-kpi-icono">
                  <i
                    className={`bi ${item.icono}`}
                    aria-hidden="true"
                  />
                </div>

                <div className="alarmas-kpi-info">
                  <span className="alarmas-kpi-titulo">
                    {item.titulo}
                  </span>

                  <strong className="alarmas-kpi-valor">
                    {cargando ? "..." : item.valor}
                  </strong>
                </div>

                <i
                  className="bi bi-chevron-right alarmas-kpi-flecha"
                  aria-hidden="true"
                />
              </article>
            </div>
          ))}
        </div>

        {/* FILTROS */}

        <div className="alarmas-filtros">
          {filtros.map((item) => (
            <button
              type="button"
              key={item.clave}
              className={`chip-filtro-dash ${
                filtro === item.clave
                  ? "active"
                  : ""
              }`}
              onClick={() => setFiltro(item.clave)}
            >
              {item.titulo}

              <span className="chip-count-dash">
                {cargando
                  ? "..."
                  : item.cantidad}
              </span>
            </button>
          ))}
        </div>

        {/* PANEL DE TABLA */}

        <section className="alarmas-panel-tabla">

          <div className="alarmas-tabla-encabezado">
            <div className="alarmas-tabla-titulo">
              <span className="alarmas-tabla-icono">
                <i className="bi bi-broadcast-pin" />
              </span>

              <div>
                <h2>Alarmas registradas</h2>
                <p>
                  Consulta las alarmas comunitarias
                  por barrio.
                </p>
              </div>
            </div>

            <span className="alarmas-total-registros">
              {cargando
                ? "Cargando..."
                : `${filtradas.length} registros`}
            </span>
          </div>

          <div className="table-responsive">
            <table className="alarmas-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Barrio</th>
                  <th>Estado</th>
                  <th>Radio (m)</th>
                  <th>Coordenadas</th>
                </tr>
              </thead>

              <tbody>
                {!cargando &&
                  filtradas.map((alarma, indice) => {
                    const estado =
                      obtenerEstado(alarma);

                    const latitud =
                      obtenerLatitud(alarma);

                    const longitud =
                      obtenerLongitud(alarma);

                    const radio =
                      obtenerRadio(alarma);

                    return (
                      <tr
                        key={
                          obtenerId(alarma) ??
                          indice
                        }
                      >
                        <td>
                          <div className="alarmas-nombre">
                            {obtenerNombre(alarma) ||
                              "Sin nombre"}
                          </div>

                          <span className="alarmas-codigo">
                            Código:{" "}
                            {obtenerId(alarma) ?? "—"}
                          </span>
                        </td>

                        <td>
                          <span className="alarmas-barrio">
                            {obtenerBarrio(alarma)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`alarma-estado alarma-estado-${estado.toLowerCase()}`}
                          >
                            <span className="alarma-estado-punto" />
                            {estado || "SIN ESTADO"}
                          </span>
                        </td>

                        <td>
                          <span className="alarmas-radio">
                            {radio != null
                              ? radio
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <span className="alarmas-coordenadas">
                            {latitud != null &&
                            longitud != null
                              ? `${latitud}, ${longitud}`
                              : "No disponibles"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {cargando && (
            <div className="alarmas-tabla-vacia">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />
              <span>Cargando alarmas...</span>
            </div>
          )}

          {!cargando &&
            !error &&
            filtradas.length === 0 && (
              <div className="alarmas-tabla-vacia">
                <span className="alarmas-vacio-icono">
                  <i className="bi bi-broadcast-pin" />
                </span>

                <h3>No se encontraron alarmas</h3>

                <p>
                  {busqueda ||
                  filtro !== "TODAS"
                    ? "Prueba con otro filtro o búsqueda."
                    : "Todavía no hay alarmas registradas."}
                </p>
              </div>
            )}
        </section>
      </section>
    </>
  );
}

export default Alarmas;
