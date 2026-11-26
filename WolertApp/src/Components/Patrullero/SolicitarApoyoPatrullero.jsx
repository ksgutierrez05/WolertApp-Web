import { useState } from "react";
import SelectBonito from "../Administrador-policia/SelectBonito";
import { useFeedback } from "../Feedback/useFeedback";
import {
  crearSolicitudApoyo,
} from "../../Services/solicitudesApoyoService";

import "../../css/Policia/Patrullero/css/apoyo-solicitudes.css";
import "../../css/Policia/Patrullero/css/apoyo-patrullero.css";

export default function SolicitarApoyoPatrullero({
  asignacion,
  onCreada,
}) {
  const { toast } = useFeedback();
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [destino, setDestino] = useState("TRANSITO");
  const [cargando, setCargando] = useState(false);

  const estado = String(
    asignacion?.estadoAsignacion || asignacion?.EstadoAsignacion || ""
  ).trim().toUpperCase().replace(/[\s-]+/g, "_");

  const habilitado =
    asignacion &&
    ["ASIGNADA", "EN_ATENCION"].includes(estado);

  async function enviar(e) {
    e.preventDefault();
    if (motivo.trim().length < 8) {
      toast.warning("Describe el motivo con al menos 8 caracteres.", "Revisa el motivo");
      return;
    }
    setCargando(true);

    try {
      await crearSolicitudApoyo(
        Number(asignacion.idAlerta),
        Number(asignacion.idAsignacion),
        destino,
        motivo.trim()
      );

      setAbierto(false);
      setMotivo("");
      await Promise.resolve(onCreada?.()).catch((errorCarga) => {
        toast.errorFrom(errorCarga, "La solicitud se envió, pero no se pudieron actualizar los datos.");
      });
      toast.success("La solicitud se envió a la central destinataria.", "Apoyo solicitado");
    } catch (e) {
      toast.errorFrom(e, "No se pudo solicitar apoyo.", "Error al solicitar apoyo");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="sa-box sa-patrullero">
      <div className="sa-head">
        <div>
          <strong>Apoyo interinstitucional</strong>
          <small>
            Solicita apoyo para esta asignación.
          </small>
        </div>

        <button
          type="button"
          className="sa-primary"
          disabled={!habilitado}
          onClick={() => {
            setAbierto(!abierto);
          }}
        >
          Solicitar apoyo
        </button>
      </div>

      {!habilitado && (
        <p className="sa-muted">
          Selecciona una asignación activa para solicitar apoyo.
        </p>
      )}
{abierto && habilitado && (
        <form onSubmit={enviar} className="sa-form">
          <label>
            Central destinataria
            <SelectBonito
              id="apoyo-patrullero-destino"
              ariaLabel="Seleccionar central destinataria"
              valor={destino}
              onChange={setDestino}
              opciones={[
                { valor: "TRANSITO", etiqueta: "Central de Tránsito" },
                { valor: "POLICIA", etiqueta: "Central de Policía" },
              ]}
              placeholder="Selecciona una central"
              icono="bi-building"
              variante="campo"
            />
          </label>

          <label>
            Motivo
            <textarea
              required
              minLength={8}
              maxLength={1000}
              value={motivo}
              onChange={(e) =>
                setMotivo(e.target.value)
              }
              placeholder="Describe por qué se necesita apoyo"
            />
          </label>
<div className="sa-actions">
            <button
              type="button"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </button>

            <button
              className="sa-primary"
              disabled={
                cargando || motivo.trim().length < 8
              }
            >
              {cargando
                ? "Enviando..."
                : "Enviar solicitud"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
