import { useEffect, useState } from "react";
import { useFeedback } from "../Feedback/useFeedback";

import {
  listarSolicitudesApoyo,
  responderSolicitudApoyo,
  asignarUnidadApoyo,
} from "../../Services/solicitudesApoyoService";
import SelectBonito from "../Administrador-policia/SelectBonito";

import "../../css/Policia/Patrullero/css/apoyo-solicitudes.css";


const ESTADOS = [
  "TODAS",
  "PENDIENTE",
  "ACEPTADA",
  "RECHAZADA",
  "EN_CAMINO",
  "CANCELADA",
];

export default function SolicitudesApoyoCentral({ mostrarActualizar = true }) {
  const { confirm, prompt, toast } = useFeedback();
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
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
      setError(e.userMessage || "No fue posible cargar las solicitudes de apoyo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const solicitudInicial = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(solicitudInicial);
  }, []);

  async function actuar(id, accion) {
    let observacion = "";

    if (accion === "RECHAZADA") {
      observacion = await prompt({
        title: "Motivo del rechazo",
        description: "Indica por qué se rechaza esta solicitud de apoyo.",
        inputLabel: "Motivo",
        placeholder: "Escribe el motivo",
        multiline: true,
        required: true,
        confirmLabel: "Continuar",
        tone: "warning",
      });
      if (!observacion) return;
    }

    const esAsignacion = accion === "ASIGNAR";
    const esRechazo = accion === "RECHAZADA";
    const detalle = esAsignacion
      ? "Confirma que deseas asignar automáticamente una unidad de apoyo disponible."
      : esRechazo
        ? `Confirma el rechazo de la solicitud con este motivo: ${observacion}`
        : "Confirma que deseas aceptar esta solicitud de apoyo.";

    await confirm({
      title: esAsignacion
        ? "¿Asignar unidad de apoyo?"
        : esRechazo
          ? "¿Rechazar solicitud?"
          : "¿Aceptar solicitud de apoyo?",
      description: detalle,
      confirmLabel: esAsignacion ? "Asignar unidad" : esRechazo ? "Rechazar" : "Aceptar",
      tone: esRechazo ? "warning" : "confirm",
      failureMessage: "No fue posible actualizar la solicitud de apoyo.",
      onConfirm: async () => {
        setProcesando(id);
        setError("");
        try {
          if (esAsignacion) {
            await asignarUnidadApoyo(id);
          } else {
            await responderSolicitudApoyo(id, accion, observacion);
          }
          toast.success(
            esAsignacion
              ? "La unidad de apoyo se asignó correctamente."
              : esRechazo
                ? "La solicitud de apoyo fue rechazada."
                : "La solicitud de apoyo fue aceptada.",
            esAsignacion ? "Asignación exitosa" : "Solicitud actualizada"
          );
          await cargar();
        } finally {
          setProcesando(null);
        }
      },
    });
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
          {mostrarActualizar && <button
            type="button"
            onClick={cargar}
            disabled={cargando}
          >
            Actualizar
          </button>}

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
              <SelectBonito
                id="solicitudes-apoyo-estado"
                ariaLabel="Filtrar solicitudes por estado"
                valor={filtro}
                onChange={setFiltro}
                opciones={ESTADOS.map((estado) => ({
                  valor: estado,
                  etiqueta: estado === "TODAS"
                    ? "Todos"
                    : estado.replaceAll("_", " "),
                }))}
                placeholder="Estado"
                icono="bi-funnel"
                variante="filtro"
              />
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
