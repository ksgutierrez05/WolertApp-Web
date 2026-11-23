import { useState } from "react";
import {
  crearSolicitudApoyo,
} from "../../Services/solicitudesApoyoService";

import "../../css/Policia/Patrullero/css/apoyo-solicitudes.css";

export default function SolicitarApoyoPatrullero({
  asignacion,
  onCreada,
}) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [destino, setDestino] = useState("TRANSITO");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const estado = String(
    asignacion?.estadoAsignacion || ""
  ).toUpperCase();

  const habilitado =
    asignacion &&
    ["ASIGNADA", "EN_ATENCION"].includes(estado);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setOk("");
    setCargando(true);

    try {
      await crearSolicitudApoyo(
        Number(asignacion.idAlerta),
        Number(asignacion.idAsignacion),
        destino,
        motivo.trim()
      );

      setOk("Solicitud enviada a la central de destino.");
      setAbierto(false);
      setMotivo("");
      onCreada?.();
    } catch (e) {
      setError(
        e.message || "No se pudo solicitar apoyo."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="sa-box">
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
            setError("");
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

      {ok && (
        <p className="sa-ok" role="status">
          {ok}
        </p>
      )}

      {abierto && habilitado && (
        <form onSubmit={enviar} className="sa-form">
          <label>
            Central destinataria
            <select
              value={destino}
              onChange={(e) =>
                setDestino(e.target.value)
              }
            >
              <option value="TRANSITO">
                Central de Tránsito
              </option>
              <option value="POLICIA">
                Central de Policía
              </option>
            </select>
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

          {error && (
            <p className="sa-error" role="alert">
              {error}
            </p>
          )}

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