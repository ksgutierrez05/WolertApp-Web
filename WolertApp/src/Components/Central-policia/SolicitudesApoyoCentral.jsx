import { useEffect, useState } from "react";

import {
  listarSolicitudesApoyo,
  responderSolicitudApoyo,
  asignarUnidadApoyo,
} from "../../Services/solicitudesApoyoService";

import "../../css/Policia/Patrullero/css/apoyo-solicitudes.css";


const ESTADOS = [
  "TODAS",
  "PENDIENTE",
  "ACEPTADA",
  "RECHAZADA",
  "EN_CAMINO",
  "CANCELADA",
];

export default function SolicitudesApoyoCentral() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [filtro, setFiltro] = useState("PENDIENTE");
  const [abierto, setAbierto] = useState(false);
  const [procesando, setProcesando] = useState(null);

  async function cargar() {
    setCargando(true);

    try {
      const res = await listarSolicitudesApoyo();

      setDatos(Array.isArray(res) ? res : []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function actuar(id, accion) {
    let observacion = "";

    if (accion === "RECHAZADA") {
      observacion =
        window.prompt("Motivo del rechazo:") ?? "";

      if (!observacion.trim()) return;
    }

    if (
      accion === "ACEPTADA" &&
      !window.confirm(
        "¿Aceptar esta solicitud de apoyo?"
      )
    ) {
      return;
    }

    if (
      accion === "ASIGNAR" &&
      !window.confirm(
        "¿Asignar automáticamente una unidad de apoyo disponible?"
      )
    ) {
      return;
    }

    setProcesando(id);
    setError("");
    setOk("");

    try {
      if (accion === "ASIGNAR") {
        await asignarUnidadApoyo(id);
      } else {
        await responderSolicitudApoyo(
          id,
          accion,
          observacion
        );
      }

      setOk("Solicitud actualizada.");
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(null);
    }
  }

  const visibles = datos.filter(
    (s) =>
      (s.centralDestino || "").toUpperCase() ===
        "POLICIA" &&
      (filtro === "TODAS" || s.estado === filtro)
  );

  const pendientes = datos.filter(
    (s) =>
      s.centralDestino === "POLICIA" &&
      s.estado === "PENDIENTE"
  ).length;

  return (
    <section className="sa-box sa-central">
      <div className="sa-head">
        <div>
          <strong>Solicitudes de apoyo recibidas</strong>
          <small>
            Solicitudes dirigidas a Central de Policía
          </small>
        </div>

        <div className="sa-actions">
          <button
            type="button"
            onClick={cargar}
            disabled={cargando}
          >
            Actualizar
          </button>

          <button
            type="button"
            className="sa-primary"
            onClick={() => setAbierto(!abierto)}
          >
            {abierto ? "Ocultar" : "Ver solicitudes"} (
            {pendientes})
          </button>
        </div>
      </div>

      {abierto && (
        <>
          <div className="sa-filtros">
            <label>
              Estado
              <select
                value={filtro}
                onChange={(e) =>
                  setFiltro(e.target.value)
                }
              >
                {ESTADOS.map((estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {estado === "TODAS"
                      ? "Todos"
                      : estado.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {cargando && (
            <p className="sa-muted">Cargando...</p>
          )}

          {error && (
            <p className="sa-error" role="alert">
              {error}
            </p>
          )}

          {ok && (
            <p className="sa-ok" role="status">
              {ok}
            </p>
          )}

          {!cargando && visibles.length === 0 && (
            <p className="sa-muted">
              No hay solicitudes para este filtro.
            </p>
          )}

          <div className="sa-items">
            {visibles.map((solicitud) => (
              <article
                className="sa-item"
                key={solicitud.idSolicitudApoyo}
              >
                <div>
                  <strong>
                    Solicitud #
                    {solicitud.idSolicitudApoyo}
                    {" · "}
                    Alerta #{solicitud.idAlerta}
                  </strong>

                  <span className="sa-tag">
                    {solicitud.estado}
                  </span>

                  <p>{solicitud.motivo}</p>

                  <small>
                    Origen: {solicitud.centralOrigen}
                    {" · "}
                    Destino: {solicitud.centralDestino}
                  </small>
                </div>

                <div className="sa-actions">
                  {solicitud.estado === "PENDIENTE" && (
                    <>
                      <button
                        type="button"
                        className="sa-primary"
                        disabled={
                          procesando ===
                          solicitud.idSolicitudApoyo
                        }
                        onClick={() =>
                          actuar(
                            solicitud.idSolicitudApoyo,
                            "ACEPTADA"
                          )
                        }
                      >
                        Aceptar
                      </button>

                      <button
                        type="button"
                        disabled={
                          procesando ===
                          solicitud.idSolicitudApoyo
                        }
                        onClick={() =>
                          actuar(
                            solicitud.idSolicitudApoyo,
                            "RECHAZADA"
                          )
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {solicitud.estado === "ACEPTADA" && (
                    <button
                      type="button"
                      className="sa-primary"
                      disabled={
                        procesando ===
                        solicitud.idSolicitudApoyo
                      }
                      onClick={() =>
                        actuar(
                          solicitud.idSolicitudApoyo,
                          "ASIGNAR"
                        )
                      }
                    >
                      Asignar unidad de apoyo
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}