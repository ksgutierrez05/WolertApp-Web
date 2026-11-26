
import { useEffect } from "react";
import PageHeader from "../../Components/Patrullero/Pageheader";
import Kpis from "../../Components/Patrullero/Kpicard";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import usePatrullero from "../../Utils/usePatrullero";

import "../../css/Policia/Patrullero/css/unidad.css";

export default function MiUnidad() {
  const { datos, cargando, error, recargar } = usePatrullero();
  const { toast } = useFeedback();

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudo cargar la información de la unidad.", "Error al cargar la unidad");
  }, [error, toast]);

  const unidad = datos?.unidad;
  const integrantes = unidad?.policias || [];
  const asignaciones = datos?.asignaciones || [];

  const activas = asignaciones.filter(
    (a) => a.estadoAsignacion === "EN_ATENCION"
  ).length;

  const disponibles = integrantes.filter(
    (p) =>
      String(p.estado || "").toUpperCase() === "DISPONIBLE"
  ).length;

  const valores = {
    integrantes: integrantes.length,
    disponibles,
    enAtencion: activas,
  };

  const fila = (icono, nombre, valor) => (
    <div className="un-dato-fila">
      <dt>
        <i className={`bi ${icono}`} aria-hidden="true" />
        {nombre}
      </dt>
      <dd>{valor ?? "—"}</dd>
    </div>
  );

  return (
    <div className="container-fluid mi-unidad-patrullero">
      <PageHeader
        titulo="Mi Unidad"
        descripcion="Consulta tu unidad, quiénes la conforman y su estado operativo."
      />

      {cargando && (
        <p role="status">Cargando unidad...</p>
      )}

      {error && (
        <button type="button" className="btn btn-link btn-sm px-0" onClick={recargar}>Reintentar carga</button>
      )}

      <section className="un-ficha" aria-label="Ficha de la unidad">
        <div className="un-ficha-izq">
          <div className="un-ficha-icono" aria-hidden="true">
            <i className="bi bi-shield-shaded" />
          </div>

          <div>
            <p className="un-ficha-eyebrow">Tu unidad</p>

            <h2 className="un-ficha-nombre">
              {unidad?.nombre || "Sin unidad asignada"}
            </h2>

            <p className="un-ficha-sub">
              <i className="bi bi-geo-alt" aria-hidden="true" />
              {" "}Barrio: {unidad?.nombreBarrio || "—"}
            </p>
          </div>
        </div>

        <div className="un-ficha-der">
          <span className="un-ficha-estado"><i className="bi bi-activity" aria-hidden="true" /> {unidad?.estado || "Estado no disponible"}</span>
          <div className="un-ficha-dato">
            <span className="un-ficha-num">
              {asignaciones.length}
            </span>
            <span className="un-ficha-lbl">
              Asignaciones de la unidad
            </span>
          </div>

          <div className="un-ficha-dato">
            <span className="un-ficha-num">
              {activas}
            </span>
            <span className="un-ficha-lbl">
              Asignaciones en atención
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Indicadores de la unidad">
        <Kpis grupo="unidad" valores={valores} />
      </section>

      <div className="row g-4 align-items-stretch">
        <section
          className="col-lg-4 d-flex"
          aria-labelledby="un-datos-titulo"
        >
          <div className="card-panel-dash un-panel w-100">
            <h2 className="un-titulo" id="un-datos-titulo">
              <i className="bi bi-info-circle" />
              Datos de la unidad
            </h2>

            <dl className="un-datos">
              {fila("bi-shield", "Estado", unidad?.estado)}
              {fila("bi-geo-alt", "Barrio", unidad?.nombreBarrio)}
            </dl>
          </div>
        </section>

        <section
          className="col-lg-8 d-flex"
          aria-labelledby="un-integrantes-titulo"
        >
          <div className="card-panel-dash un-panel w-100">
            <div className="un-panel-cabecera">
              <h2
                className="un-titulo"
                id="un-integrantes-titulo"
              >
                <i className="bi bi-people" />
                Integrantes de la unidad
              </h2>

              <span className="un-solo-lectura">
                <i className="bi bi-lock" />
                {" "}Solo lectura
              </span>
            </div>

            {integrantes.length ? (
              <div className="un-integrantes">
                {integrantes.map((p) => (
                  <article
                    key={p.idUsuario}
                    className="un-integrante"
                  >
                    <div className="un-integrante-avatar">
                      <i className="bi bi-person-badge" />
                    </div>

                    <div className="un-integrante-info">
                      <strong>
                        {p.nombreUsuario || "Sin nombre"}
                      </strong>

                      <span>
                        {p.rango || "Policía"}
                      </span>

                      <small><i className="bi bi-credit-card-2-front" aria-hidden="true" /> Placa {p.placa || "—"}</small>
                    </div>
                    <span className={`un-integrante-estado${String(p.estado || "").trim().toUpperCase() === "DISPONIBLE" ? " disponible" : ""}`}>{p.estado || "Sin estado"}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="un-vacio">
                <span className="un-vacio-icono">
                  <i className="bi bi-person-badge" />
                </span>

                <h3>Sin información de integrantes</h3>

                <p>
                  Los integrantes de tu unidad aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
