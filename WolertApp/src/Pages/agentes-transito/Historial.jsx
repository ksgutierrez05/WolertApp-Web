
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";

import {
  obtenerAtencionesAgente,
  fechaAtencion,
} from "../../Services/agenteTransitoService";
import "../../css/transito/central-transito/panel-atencion-transito.css";

const POR_PAGINA = 5;

export default function Historial() {
  const [casos, setCasos] = useState([]);
  const [filtro, setFiltro] = useState("FINALIZADA");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    obtenerAtencionesAgente()
      .then((datos) => {
        if (activo) setCasos(datos);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const filas = useMemo(() => {
    return casos
      .filter(
        (caso) =>
          filtro === "todas" ||
          caso.estadoFinal === filtro
      )
      .filter((caso) => {
        const texto = [
          caso.idAtencionTransito,
          caso.idAlerta,
          caso.descripcion,
          caso.estadoFinal,
        ]
          .join(" ")
          .toLowerCase();

        return texto.includes(
          busqueda.trim().toLowerCase()
        );
      })
      .sort(
        (a, b) =>
          new Date(b.fechaAtencion || 0) -
          new Date(a.fechaAtencion || 0)
      );
  }, [casos, filtro, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filas.length / POR_PAGINA)
  );

  const visibles = filas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  function cambiarFiltro(nuevoFiltro) {
    setFiltro(nuevoFiltro);
    setPagina(1);
  }

  return (
    <Layout
      rol="agente"
      titulo="Historial"
      activo="historial"
      busqueda={{
        placeholder: "Buscar por caso...",
      }}
    >
      <header className="st-header mb-4">
  <div>
    <span className="st-eyebrow">AGENTE DE TRÁNSITO</span>
    <h1>Historial de atenciones</h1>
    <p>Consulta las atenciones registradas durante tu servicio.</p>
  </div>
</header>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando historial...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-card-dash">
        <div className="d-flex flex-wrap gap-2 tabs-dash mb-3">
          {[
            ["FINALIZADA", "Finalizadas"],
            ["EN_PROCESO", "En proceso"],
            ["todas", "Todas"],
          ].map(([id, texto]) => {
            const cantidad =
              id === "todas"
                ? casos.length
                : casos.filter(
                    (caso) =>
                      caso.estadoFinal === id
                  ).length;

            return (
              <button
                key={id}
                type="button"
                className={`tab-dash ${
                  filtro === id ? "active-dash" : ""
                }`}
                onClick={() => cambiarFiltro(id)}
              >
                {texto} ({cantidad})
              </button>
            );
          })}
        </div>

        <div className="mb-3">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por número de atención, alerta o descripción..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Atención</th>
                <th>Alerta</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((caso, indice) => (
                <tr
                  key={
                    caso.idAtencionTransito ?? indice
                  }
                >
                  <td className="text-muted small">
                    {fechaAtencion(
                      caso.fechaAtencion
                    )}
                  </td>

                  <td>
                    #{caso.idAtencionTransito}
                  </td>

                  <td>
                    #{caso.idAlerta ?? "—"}
                  </td>

                  <td>
                    {caso.descripcion ||
                      "Sin descripción"}
                  </td>

                  <td>
                    <span
                      className={`badge-estado-dash ${
                        caso.estadoFinal ===
                        "FINALIZADA"
                          ? "estado-resuelta-dash"
                          : "estado-atencion-dash"
                      }`}
                    >
                      {caso.estadoFinal ===
                      "FINALIZADA"
                        ? "Finalizada"
                        : caso.estadoFinal ===
                          "EN_PROCESO"
                        ? "En proceso"
                        : caso.estadoFinal ||
                          "Sin estado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <p className="text-muted small text-center p-3 mb-0">
            No hay atenciones para este filtro.
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando{" "}
            {filas.length === 0
              ? 0
              : (pagina - 1) * POR_PAGINA + 1}
            {"–"}
            {Math.min(
              pagina * POR_PAGINA,
              filas.length
            )}{" "}
            de {filas.length} atenciones
          </span>

          <div className="d-flex gap-1">
            <button
              type="button"
              className="page-btn-dash"
              disabled={pagina === 1}
              onClick={() =>
                setPagina((p) => p - 1)
              }
            >
              <i className="bi bi-chevron-left" />
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, i) => i + 1
            ).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`page-btn-dash ${
                  pagina === numero
                    ? "active-dash"
                    : ""
                }`}
                onClick={() =>
                  setPagina(numero)
                }
              >
                {numero}
              </button>
            ))}

            <button
              type="button"
              className="page-btn-dash"
              disabled={
                pagina === totalPaginas
              }
              onClick={() =>
                setPagina((p) => p + 1)
              }
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
