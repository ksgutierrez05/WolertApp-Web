import "../../css/transito/central-transito/panel-atencion-transito.css";
import KpiCard from "../../Components/transito/KpiCard";
import { useEffect, useState } from "react";
import Layout from "../../Components/transito/Layout";

import {
  listarTiposTransito,
  obtenerNombreTipo,
  obtenerPrioridadTipo,
} from "../../Services/tiposAlertasCentralService";

import "../../css/transito/central-transito/tipos-alertas.css";



export default function TiposAlertas() {
  const [tipos, setTipos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("TODAS");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    listarTiposTransito()
      .then(datos => {
        if (activo) setTipos(datos);
      })
      .catch(e => {
        if (activo) {
          setError(e.message || "No se pudieron consultar los tipos.");
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const visibles = tipos.filter(tipo => {
    const nombre = obtenerNombreTipo(tipo).toLowerCase();
    const prioridad = obtenerPrioridadTipo(tipo);

    return nombre.includes(buscar.toLowerCase().trim()) &&
      (filtro === "TODAS" || prioridad === filtro);
  });

  return (
    <Layout
      rol="central"
      titulo="Tipos de alertas"
      activo="tipos-alertas"
      busqueda={{
        placeholder: "Buscar tipo de alerta...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      <header className="st-header mb-4">
        <div>
          <span className="st-eyebrow">
            CENTRAL DE TRÁNSITO
          </span>

          <h1>Tipos de alertas</h1>

          <p>
            Consulta los tipos de alertas correspondientes
            a tu central y sus niveles de prioridad.
          </p>
        </div>
      </header>
<div className="row g-3 mb-5">
        <KpiCard
          color="blue"
          valor={cargando || error ? "—" : tipos.length}
          label="Total de tipos"
          icono="bi-grid"
        />

        <KpiCard
          color="red"
          valor={cargando || error ? "—" : tipos.filter(
            tipo => obtenerPrioridadTipo(tipo) === "ALTA"
          ).length}
          label="Prioridad alta"
          icono="bi-exclamation-triangle"
        />

        <KpiCard
          color="amber"
          valor={cargando || error ? "—" : tipos.filter(
            tipo => obtenerPrioridadTipo(tipo) === "MEDIA"
          ).length}
          label="Prioridad media"
          icono="bi-clock"
        />

        <KpiCard
          color="green"
          valor={cargando || error ? "—" : tipos.filter(
            tipo => obtenerPrioridadTipo(tipo) === "BAJA"
          ).length}
          label="Prioridad baja"
          icono="bi-info-circle"
        />
      </div>
<section className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h2 className="panel-title-dash mb-0">Catálogo de alertas</h2>
            <p>Tipos de alertas de la Central de Tránsito.</p>
          </div>

          <span className="cta-consulta">
            <i className="bi bi-eye me-2" />
            Solo consulta
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3 tabs-dash">
          {[
            ["TODAS", "Todas"],
            ["ALTA", "Alta"],
            ["MEDIA", "Media"],
            ["BAJA", "Baja"],
          ].map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              className={`tab-dash ${
                filtro === valor ? "active-dash" : ""
              }`}
              onClick={() => setFiltro(valor)}
            >
              {etiqueta} ({
                valor === "TODAS"
                  ? tipos.length
                  : tipos.filter(
                      tipo => obtenerPrioridadTipo(tipo) === valor
                    ).length
              })
            </button>
          ))}
        </div>

        {cargando && (
          <p className="cta-vacio">
            Consultando tipos de alertas...
          </p>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Tipo de alerta</th>
                  <th>Descripción</th>
                  <th>Prioridad</th>
                  <th>Central responsable</th>
                </tr>
              </thead>

              <tbody>
                {visibles.map((tipo, indice) => {
                  const prioridad = obtenerPrioridadTipo(tipo);

                  return (
                    <tr key={tipo.idTipoAlerta ?? indice}>
                      <td>
                        <div className="cta-tipo">
                          <span className="cta-tipo-icono">
                            <i className="bi bi-exclamation-circle" />
                          </span>

                          <strong>
                            {obtenerNombreTipo(tipo)}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {tipo.descripcion ?? "Sin descripción"}
                      </td>

                      <td>
                        <span className={`cta-prioridad cta-${prioridad.toLowerCase()}`}>
                          <span className="cta-punto" />
                          {prioridad || "No registrada"}
                        </span>
                      </td>

                      <td>
                        <span className="cta-central">
                          <i className="bi bi-car-front me-2" />
                          Tránsito
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!visibles.length && (
              <p className="cta-vacio">
                No se encontraron tipos de alertas.
              </p>
            )}
          </div>
        )}

        <div className="cta-footer">
          Mostrando {visibles.length} de {tipos.length} tipos
        </div>
      </section>
    </Layout>
  );
}