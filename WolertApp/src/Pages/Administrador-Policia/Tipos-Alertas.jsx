
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Administrador-policia/Topbar";

import {
  listarTiposAlerta,
} from "../../Services/AlertasAdminService";

import "../../css/Policia/administrador-policia/css/tipo-alertas.css";

const normalizar = valor =>
  String(valor ?? "").trim().toUpperCase();

function TiposAlertas() {
  const [tipos, setTipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

 
useEffect(() => {
  const controlador = new AbortController();

  listarTiposAlerta(controlador.signal)
    .then(datos => {
      if (controlador.signal.aborted) return;

      if (!Array.isArray(datos)) {
        throw new Error(
          "La API no devolvió una lista de tipos."
        );
      }

      setTipos(datos);
      setError("");
    })
    .catch(err => {
      if (!controlador.signal.aborted) {
        setError(
          err.message ||
          "No se pudieron cargar los tipos de alerta."
        );

        setTipos([]);
      }
    })
    .finally(() => {
      if (!controlador.signal.aborted) {
        setCargando(false);
      }
    });

  return () => controlador.abort();
}, [recarga]);


  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tipos.filter(tipo => {
      const coincideTexto = [
        tipo.idTipoAlerta,
        tipo.nombre,
        tipo.centralResponsable,
      ].some(valor =>
        String(valor ?? "").toLowerCase().includes(texto)
      );

      const coincidePrioridad =
        !filtro ||
        normalizar(tipo.prioridad) === filtro;

      return coincideTexto && coincidePrioridad;
    });
  }, [tipos, busqueda, filtro]);

  const kpis = {
    total: tipos.length,

    alta: tipos.filter(
      t => normalizar(t.prioridad) === "ALTA"
    ).length,

    media: tipos.filter(
      t => normalizar(t.prioridad) === "MEDIA"
    ).length,

    baja: tipos.filter(
      t => normalizar(t.prioridad) === "BAJA"
    ).length,
  };

  return (
    <>
      <Topbar placeholder="Buscar tipo de alerta..." />

      <div className="header-vista-dash mb-4">
        <div>
          <h1>Tipos de Alertas</h1>

          <p>
            Consulta las categorías de alerta,
            su prioridad y central responsable.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          disabled={cargando}
          onClick={() => {
            setCargando(true);
            setRecarga(n => n + 1);
          }}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Actualizar
        </button>
      </div>

      <div className="alert alert-info" role="note">
        Este módulo es de consulta para ADMIN_POLICIA.
        El backend reserva crear, editar y eliminar
        para el rol ADMIN.
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        {[
          ["Total de tipos", kpis.total, "bi-grid", "azul"],
          ["Prioridad alta", kpis.alta, "bi-exclamation-triangle", "rojo"],
          ["Prioridad media", kpis.media, "bi-exclamation-circle", "ambar"],
          ["Prioridad baja", kpis.baja, "bi-check-circle", "verde"],
        ].map(([titulo, valor, icono, tono]) => (
          <div className="col-6 col-xl-3" key={titulo}>
            <article
              className={`kpi-card-policial tono-${tono}`}
            >
              <div className="kpi-card-icono">
                <i
                  className={`bi ${icono}`}
                  aria-hidden="true"
                />
              </div>

              <div className="kpi-card-info">
                <span className="kpi-card-titulo">
                  {titulo}
                </span>

                <strong className="kpi-card-valor">
                  {cargando ? "..." : valor}
                </strong>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="filtros-toolbar-dash mb-3">
        <div className="search-dash input-group">
          <span className="input-group-text bg-transparent border-0">
            <i className="bi bi-search" />
          </span>

          <input
            className="form-control border-0 bg-transparent"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o central..."
          />
        </div>

        <select
          className="form-select"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          aria-label="Filtrar por prioridad"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>

      <div className="card-panel-dash mb-4">
        <div className="tabla-header-dash">
          <span className="flex-grow-1">
            Tipo de alerta
          </span>

          <span style={{ width: "150px" }}>
            Prioridad
          </span>

          <span style={{ width: "160px" }}>
            Central responsable
          </span>
        </div>

        <div className="table-responsive">
          <table className="tabla-dash">
            <tbody>
              {filtrados.map(tipo => (
                <tr key={tipo.idTipoAlerta}>
                  <td>
                    <strong className="celda-titulo-dash">
                      {tipo.nombre || "Sin nombre"}
                    </strong>

                    <div className="celda-sub-dash">
                      Código: {tipo.idTipoAlerta}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`categoria-chip-dash ${
                        normalizar(tipo.prioridad) === "ALTA"
                          ? "bg-danger-subtle text-danger"
                          : normalizar(tipo.prioridad) === "MEDIA"
                            ? "bg-warning-subtle text-warning-emphasis"
                            : "bg-success-subtle text-success"
                      }`}
                    >
                      {tipo.prioridad || "—"}
                    </span>
                  </td>

                  <td>
                    {tipo.centralResponsable || "Sin asignar"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cargando && (
          <div className="tabla-vacio-dash">
            Cargando tipos de alerta...
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <div className="tabla-vacio-dash">
            <i className="bi bi-inbox fs-2 d-block mb-2" />
            No se encontraron tipos de alerta.
          </div>
        )}
      </div>
    </>
  );
}

export default TiposAlertas;
