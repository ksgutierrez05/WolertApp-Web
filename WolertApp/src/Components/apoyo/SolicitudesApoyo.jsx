
import { useCallback, useEffect, useState } from "react";

import {
  listarSolicitudesApoyo,
  responderSolicitudApoyo,
  asignarUnidadApoyo,
} from "../../Services/solicitudesApoyoService";

import "../../css/apoyo/solicitudes-apoyo.css";

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const ESTADOS = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  EN_CAMINO: "En camino",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

const nombreCentral = (valor) =>
  normalizar(valor) === "POLICIA" ? "Policía" : "Tránsito";

function formatoFecha(valor) {
  if (!valor) return "Sin registrar";

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? "Sin registrar"
    : fecha.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function Kpi({ valor, texto, icono, color }) {
  return (
    <div className={`sap-kpi sap-${color}`}>
      <i className={`bi ${icono} sap-kpi-icono`} />
      <strong>{valor}</strong>
      <span>{texto}</span>
    </div>
  );
}

export default function SolicitudesApoyo({
  central = "TRANSITO",
}) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [pestana, setPestana] = useState("RECIBIDAS");
  const [filtro, setFiltro] = useState("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);
  const [accion, setAccion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    try {
      const datos = await listarSolicitudesApoyo();

      if (!Array.isArray(datos)) {
        throw new Error("La respuesta del servidor no es válida.");
      }

      setSolicitudes(
        datos.filter(
          (s) =>
            normalizar(s.centralOrigen) === central ||
            normalizar(s.centralDestino) === central
        )
      );

      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [central]);

 useEffect(() => {
  const inicial = setTimeout(() => {
    void cargar();
  }, 0);

  const intervalo = setInterval(() => {
    void cargar();
  }, 10000);

  return () => {
    clearTimeout(inicial);
    clearInterval(intervalo);
  };
}, [cargar]);

  const recibidas = solicitudes.filter(
    (s) => normalizar(s.centralDestino) === central
  );

  const enviadas = solicitudes.filter(
    (s) => normalizar(s.centralOrigen) === central
  );

  const pendientes = recibidas.filter(
    (s) => normalizar(s.estado) === "PENDIENTE"
  ).length;

  const aceptadas = solicitudes.filter((s) =>
    ["ACEPTADA", "EN_CAMINO", "FINALIZADA"].includes(
      normalizar(s.estado)
    )
  ).length;

  const rechazadas = solicitudes.filter(
    (s) => normalizar(s.estado) === "RECHAZADA"
  ).length;

  const lista =
    pestana === "RECIBIDAS" ? recibidas : enviadas;

  const visibles = lista.filter((s) => {
    const coincideEstado =
      filtro === "TODAS" ||
      normalizar(s.estado) === filtro;

    const contenido = [
      s.idSolicitudApoyo,
      s.idAlerta,
      s.motivo,
      s.centralOrigen,
      s.centralDestino,
      s.estado,
    ]
      .join(" ")
      .toLowerCase();

    return (
      coincideEstado &&
      contenido.includes(busqueda.toLowerCase().trim())
    );
  });

  const detalle = seleccionada
    ? solicitudes.find(
        (s) =>
          s.idSolicitudApoyo === seleccionada.idSolicitudApoyo
      ) ?? seleccionada
    : null;

  const esRecibida =
    normalizar(detalle?.centralDestino) === central;

  function abrir(solicitud) {
    setSeleccionada(solicitud);
    setAccion("");
    setObservacion("");
    setMensaje("");
  }

  function cerrar() {
    if (procesando) return;

    setSeleccionada(null);
    setAccion("");
    setObservacion("");
    setMensaje("");
  }

  useEffect(() => {
    if (!seleccionada) return;

    function manejarTecla(e) {
      if (e.key === "Escape" && !procesando) {
        setSeleccionada(null);
        setAccion("");
        setMensaje("");
      }
    }

    document.addEventListener("keydown", manejarTecla);

    return () =>
      document.removeEventListener("keydown", manejarTecla);
  }, [seleccionada, procesando]);

  async function ejecutarAccion() {
    if (!detalle || !esRecibida || procesando) return;

    const estado = normalizar(detalle.estado);

    if (
      accion === "ASIGNAR"
        ? estado !== "ACEPTADA"
        : estado !== "PENDIENTE"
    ) {
      setMensaje("La solicitud ya cambió de estado.");
      return;
    }

    if (
      accion === "RECHAZADA" &&
      !observacion.trim()
    ) {
      setMensaje("Debes indicar el motivo del rechazo.");
      return;
    }

    if (
      !["ASIGNAR", "ACEPTADA", "RECHAZADA"].includes(accion)
    ) {
      return;
    }

    setProcesando(true);
    setMensaje("");

    try {
      let actualizada;

      if (accion === "ASIGNAR") {
        actualizada = await asignarUnidadApoyo(
          detalle.idSolicitudApoyo
        );
      } else {
        actualizada = await responderSolicitudApoyo(
          detalle.idSolicitudApoyo,
          accion,
          observacion.trim() || null
        );
      }

      if (actualizada?.idSolicitudApoyo) {
        setSolicitudes((anteriores) =>
          anteriores.map((s) =>
            s.idSolicitudApoyo === actualizada.idSolicitudApoyo
              ? actualizada
              : s
          )
        );
      }

      setAccion("");
      setObservacion("");
      setMensaje("Operación realizada correctamente.");

      await cargar();
    } catch (e) {
      setMensaje(e.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <section
      className={`sap ${
        central === "POLICIA" ? "sap-policia" : "sap-transito"
      }`}
    >
      <header className="sap-header" style={{ paddingTop: "24px" }}>
        <div className="sap-eyebrow">
          CENTRAL DE {nombreCentral(central).toUpperCase()}
        </div>

        <h1>Solicitudes de apoyo</h1>

        <p>
          Gestiona y consulta la coordinación de apoyo entre
          las centrales de Policía y Tránsito.
        </p>
      </header>

      <div className="sap-kpis">
        <Kpi
          valor={pendientes}
          texto="Pendientes de respuesta"
          icono="bi-clock"
          color="amber"
        />

        <Kpi
          valor={aceptadas}
          texto="Solicitudes aceptadas"
          icono="bi-check-circle"
          color="green"
        />

        <Kpi
          valor={rechazadas}
          texto="Solicitudes rechazadas"
          icono="bi-x-circle"
          color="red"
        />

        <Kpi
          valor={solicitudes.length}
          texto="Total de solicitudes"
          icono="bi-arrow-left-right"
          color="blue"
        />
      </div>

      <div className="sap-panel">
        <h2>Gestión de solicitudes</h2>

        <div className="sap-tabs">
          <button
            type="button"
            className={pestana === "RECIBIDAS" ? "activo" : ""}
            onClick={() => {
              setPestana("RECIBIDAS");
              setFiltro("TODAS");
            }}
          >
            <i className="bi bi-inbox me-2" />
            Recibidas ({recibidas.length})
          </button>

          <button
            type="button"
            className={pestana === "ENVIADAS" ? "activo" : ""}
            onClick={() => {
              setPestana("ENVIADAS");
              setFiltro("TODAS");
            }}
          >
            <i className="bi bi-send me-2" />
            Enviadas ({enviadas.length})
          </button>
        </div>

        <div className="sap-herramientas">
          <div className="sap-buscador">
            <i className="bi bi-search" />

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar solicitud o alerta..."
              aria-label="Buscar solicitud"
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="TODAS">Todos los estados</option>

            {Object.entries(ESTADOS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="sap-error" role="alert">
            {error}
            <button type="button" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="sap-vacio">
            <span className="sap-spinner" />
            <p>Consultando solicitudes...</p>
          </div>
        ) : visibles.length === 0 ? (
          <div className="sap-vacio">
            <i className="bi bi-inbox" />
            <strong>No hay solicitudes</strong>
            <p>No se encontraron registros para esta consulta.</p>
          </div>
        ) : (
          <div className="sap-tabla-scroll">
            <table className="sap-tabla">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Central</th>
                  <th>Motivo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {visibles.map((s) => (
                  <tr key={s.idSolicitudApoyo}>
                    <td>
                      <strong>#{s.idSolicitudApoyo}</strong>
                      <small>Alerta #{s.idAlerta}</small>
                    </td>

                    <td>
                      {nombreCentral(
                        pestana === "RECIBIDAS"
                          ? s.centralOrigen
                          : s.centralDestino
                      )}
                    </td>

                    <td>{s.motivo}</td>

                    <td>
                      <span className="sap-fecha">
                        {formatoFecha(s.fechaSolicitud)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`sap-estado sap-estado-${normalizar(
                          s.estado
                        ).toLowerCase()}`}
                      >
                        {ESTADOS[normalizar(s.estado)] ?? s.estado}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="sap-ver"
                        onClick={() => abrir(s)}
                      >
                        <i className="bi bi-eye me-1" />
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalle && (
        <div
          className="sap-overlay"
          onClick={cerrar}
        >
          <div
            className="sap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sap-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sap-modal-header">
              <div>
                <div className="sap-eyebrow">
                  APOYO INTERINSTITUCIONAL
                </div>

                <h2 id="sap-modal-titulo">
                  Solicitud #{detalle.idSolicitudApoyo}
                </h2>

                <p>Alerta relacionada #{detalle.idAlerta}</p>
              </div>

              <button
                type="button"
                className="sap-cerrar"
                aria-label="Cerrar"
                disabled={procesando}
                onClick={cerrar}
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="sap-modal-body">
              <div className="sap-datos">
                <div>
                  <small>Central de origen</small>
                  <strong>
                    {nombreCentral(detalle.centralOrigen)}
                  </strong>
                </div>

                <div>
                  <small>Central de destino</small>
                  <strong>
                    {nombreCentral(detalle.centralDestino)}
                  </strong>
                </div>

                <div>
                  <small>Fecha de solicitud</small>
                  <strong>
                    {formatoFecha(detalle.fechaSolicitud)}
                  </strong>
                </div>

                <div>
                  <small>Estado actual</small>
                  <span
                    className={`sap-estado sap-estado-${normalizar(
                      detalle.estado
                    ).toLowerCase()}`}
                  >
                    {ESTADOS[normalizar(detalle.estado)] ??
                      detalle.estado}
                  </span>
                </div>
              </div>

              <div className="sap-motivo">
                <strong>Motivo de la solicitud</strong>
                <p>{detalle.motivo}</p>
              </div>

              {detalle.fechaRespuesta && (
                <div className="sap-motivo">
                  <strong>Respuesta registrada</strong>
                  <p>{formatoFecha(detalle.fechaRespuesta)}</p>
                  <p>
                    {detalle.observacion || "Sin observaciones."}
                  </p>
                </div>
              )}

              {esRecibida &&
                normalizar(detalle.estado) === "PENDIENTE" &&
                !accion && (
                  <div className="sap-acciones">
                    <button
                      className="sap-btn-rechazar"
                      onClick={() => setAccion("RECHAZADA")}
                    >
                      Rechazar
                    </button>

                    <button
                      className="sap-btn-principal"
                      onClick={() => setAccion("ACEPTADA")}
                    >
                      Aceptar solicitud
                    </button>
                  </div>
                )}

              {esRecibida &&
                normalizar(detalle.estado) === "ACEPTADA" &&
                !accion && (
                  <button
                    className="sap-btn-principal"
                    onClick={() => setAccion("ASIGNAR")}
                  >
                    <i className="bi bi-car-front me-2" />
                    Asignar unidad de apoyo
                  </button>
                )}

              {accion && (
                <div className="sap-confirmacion">
                  <strong>
                    {accion === "ASIGNAR"
                      ? "Asignar unidad de apoyo"
                      : accion === "ACEPTADA"
                      ? "Aceptar solicitud"
                      : "Rechazar solicitud"}
                  </strong>

                  {accion !== "ASIGNAR" ? (
                    <>
                      <label htmlFor="sap-observacion">
                        {accion === "RECHAZADA"
                          ? "Motivo del rechazo *"
                          : "Observación (opcional)"}
                      </label>

                      <textarea
                        id="sap-observacion"
                        value={observacion}
                        maxLength={200}
                        rows={4}
                        disabled={procesando}
                        onChange={(e) =>
                          setObservacion(e.target.value)
                        }
                      />

                      <small>{observacion.length}/200</small>
                    </>
                  ) : (
                    <p>
                      El sistema buscará una unidad de apoyo
                      disponible.
                    </p>
                  )}

                  <div className="sap-acciones">
                    <button
                      className="sap-btn-secundario"
                      disabled={procesando}
                      onClick={() => setAccion("")}
                    >
                      Volver
                    </button>

                    <button
                      className="sap-btn-principal"
                      disabled={procesando}
                      onClick={ejecutarAccion}
                    >
                      {procesando ? "Procesando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              )}

              {mensaje && (
                <div className="sap-mensaje" role="status">
                  {mensaje}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
