
import { useEffect, useState } from "react";
import Layout from "../../../Components/transito/Layout";

import {
  obtenerGrupoAgente,
  obtenerAtencionesAgente,
  fechaAtencion,
} from "../../../Services/agenteTransitoService";

export default function Grupo() {
  const [grupo, setGrupo] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    Promise.allSettled([
      obtenerGrupoAgente(),
      obtenerAtencionesAgente(),
    ])
      .then(([resultadoGrupo, resultadoAtenciones]) => {
        if (!activo) return;

        if (resultadoGrupo.status === "fulfilled") {
          setGrupo(resultadoGrupo.value);
        }

        if (
          resultadoAtenciones.status === "fulfilled"
        ) {
          setAtenciones(resultadoAtenciones.value);
        }

        const fallos = [
          resultadoGrupo,
          resultadoAtenciones,
        ].filter((r) => r.status === "rejected");

        if (fallos.length) {
          setError(
            fallos
              .map(
                (r) =>
                  r.reason?.message ||
                  "Error de conexión"
              )
              .join(" | ")
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const unidad = grupo?.unidad;
  const integrantes = grupo?.integrantes ?? [];

  const activas = atenciones.filter(
    (atencion) =>
      atencion.estadoFinal === "EN_PROCESO"
  );

  return (
    <Layout
      rol="agente"
      titulo="Mi grupo"
      activo="grupo"
      busqueda={{ placeholder: "Buscar..." }}
    >
      <div className="hero-page-dash hero-page-img-dash mb-4">
        <div className="eyebrow-page-img-dash">
          <i className="bi bi-people-fill me-2" />
          MI UNIDAD DE TRÁNSITO
        </div>

        <h1 className="hero-page-title-dash">
          {unidad?.nombre || "Mi grupo"}
        </h1>

        <p className="hero-page-text-dash mb-0">
          {unidad?.nombreBarrio ||
            "Sin barrio registrado"}
          {" · "}
          {unidad?.nombreComuna ||
            "Sin comuna registrada"}
        </p>

        <div className="chips-page-img-dash">
          <span className="chip-page-img-dash">
            <span className="punto-vivo-dash" />
            {" "}
            {unidad?.estado ||
              "Estado no disponible"}
          </span>

          <span className="chip-page-img-dash">
            <i className="bi bi-person-check" />
            {" "}
            {integrantes.length} integrantes
          </span>
        </div>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando grupo...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="panel-card-dash mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="caso-label-dash mb-2">
              Casos asignados a ti
            </p>

            <h2 className="caso-titulo-dash">
              {activas.length}{" "}
              {activas.length === 1
                ? "atención en proceso"
                : "atenciones en proceso"}
            </h2>

            <p className="config-text-dash mb-0">
              Atenciones registradas en el sistema
              de Tránsito.
            </p>
          </div>
        </div>

        {activas.map((atencion, indice) => (
          <div
            key={
              atencion.idAtencionTransito ?? indice
            }
            className="mb-3"
          >
            <span className="badge-tipo-dash tipo-accidente-dash mb-2 d-inline-block">
              Atención #{atencion.idAtencionTransito}
            </span>

            <h3 className="caso-titulo-dash">
              Alerta #{atencion.idAlerta ?? "—"}
            </h3>

            <p className="config-text-dash">
              {fechaAtencion(
                atencion.fechaAtencion
              )}
            </p>

            {atencion.descripcion && (
              <p className="config-text-dash">
                {atencion.descripcion}
              </p>
            )}

            <div className="progreso-caso-dash">
              <div className="progreso-linea-dash">
                {[
                  {
                    id: "registrada",
                    label: "Registrada",
                    icono: "bi-check-circle-fill",
                    clase: "paso-completado-dash",
                  },
                  {
                    id: "proceso",
                    label: "En proceso",
                    icono: "bi-clock-history",
                    clase: "paso-actual-dash",
                  },
                  {
                    id: "finalizada",
                    label: "Finalizada",
                    icono: "bi-flag-fill",
                    clase: "paso-pendiente-dash",
                  },
                ].map((paso) => (
                  <div
                    key={paso.id}
                    className={`progreso-paso-dash ${paso.clase}`}
                  >
                    <span className="progreso-circulo-dash">
                      <i className={`bi ${paso.icono}`} />
                    </span>

                    <span className="progreso-label-dash">
                      {paso.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="progreso-accion-dash">
                <span className="progreso-ayuda-dash">
                  Estado consultado desde la API
                </span>

                <span className="badge-estado-dash estado-atencion-dash">
                  En proceso
                </span>
              </div>
            </div>
          </div>
        ))}

        {activas.length === 0 && (
          <p className="config-text-dash mb-0">
            No tienes atenciones en proceso.
          </p>
        )}
      </div>

      <div className="panel-card-dash">
        <h2 className="panel-title-dash">
          Integrantes de{" "}
          {unidad?.nombre || "mi unidad"}
        </h2>

        {integrantes.map((integrante, indice) => {
          const nombre =
            integrante.nombreUsuario ||
            integrante.username ||
            `Agente #${integrante.idUsuario ?? "—"}`;

          const iniciales = nombre
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((palabra) => palabra.charAt(0))
            .join("")
            .toUpperCase();

          const esActual =
            Number(integrante.idUsuario) ===
            Number(grupo?.agente?.idUsuario);

          return (
            <div
              key={integrante.idUsuario ?? indice}
              className="miembro-row-dash"
            >
              <div className="d-flex align-items-center gap-2">
                <span className="avatar-icon-dash avatar-green-dash">
                  {iniciales}
                </span>

                <div className="fw-semibold">
                  {nombre}
                  {esActual ? " (tú)" : ""}
                </div>
              </div>

              <span className="badge-estado-dash estado-resuelta-dash">
                {integrante.estadoAgente ||
                  "Sin estado"}
              </span>
            </div>
          );
        })}

        {integrantes.length === 0 && (
          <p className="config-text-dash mb-0">
            No hay integrantes registrados para
            esta unidad.
          </p>
        )}
      </div>
    </Layout>
  );
}
