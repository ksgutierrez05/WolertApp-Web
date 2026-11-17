
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";

import {
  listarAlertasAdmin,
} from "../../Services/AlertasAdminService";

import {
  formatearFecha,
} from "../../Utils/centroOperacionesAdmin";

import "../../css/Policia/administrador-policia/css/alertas.css";

const POR_PAGINA = 10;

const normalizar = valor =>
  String(valor ?? "").trim().toUpperCase();

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODAS");
  const [pagina, setPagina] = useState(1);
  const [seleccionada, setSeleccionada] = useState(null);
  const [recarga, setRecarga] = useState(0);

 
useEffect(() => {
  const controlador = new AbortController();

  listarAlertasAdmin(controlador.signal)
    .then(datos => {
      if (controlador.signal.aborted) return;

      if (!Array.isArray(datos)) {
        throw new Error(
          "La API no devolvió una lista de alertas."
        );
      }

      setAlertas(datos);
      setError("");
    })
    .catch(err => {
      if (!controlador.signal.aborted) {
        setError(err.message);
        setAlertas([]);
      }
    })
    .finally(() => {
      if (!controlador.signal.aborted) {
        setCargando(false);
      }
    });

  return () => controlador.abort();
}, [recarga]);

  const tipos = useMemo(
    () => [
      ...new Set(
        alertas.map(a => a.tipo).filter(Boolean)
      ),
    ].sort(),
    [alertas]
  );

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alertas.filter(a => {
      const coincideTexto = [
        a.idAlerta,
        a.reportadoPor,
        a.barrioNombre,
        a.tipo,
        a.descripcion,
      ].some(valor =>
        String(valor ?? "").toLowerCase().includes(texto)
      );

      return (
        coincideTexto &&
        (tipo === "TODAS" ||
          normalizar(a.tipo) === tipo)
      );
    });
  }, [alertas, busqueda, tipo]);

  const kpis = useMemo(() => ({
    total: alertas.length,

    pendientes: alertas.filter(
      a => normalizar(a.estado) === "PENDIENTE"
    ).length,

    enAtencion: alertas.filter(
      a => normalizar(a.estado) === "EN_ATENCION"
    ).length,

    resueltas: alertas.filter(
      a => normalizar(a.estado) === "RESUELTA"
    ).length,
  }), [alertas]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(
    pagina,
    totalPaginas
  );

  const inicio = (paginaActual - 1) * POR_PAGINA;

  const visibles = filtradas.slice(
    inicio,
    inicio + POR_PAGINA
  );

  function cambiarTipo(valor) {
    setTipo(valor);
    setPagina(1);
  }

  return (
    <>
      <Topbar placeholder="Consultar alertas..." />

      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h1 className="page-title-dash fw-bold m-0">
            Alertas
          </h1>

          <p className="info-sub-dash m-0">
            Seguimiento de las alertas reportadas por los ciudadanos.
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

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <Kpis
        grupo="alertas"
        valores={error ? {} : kpis}
        cargando={cargando}
      />

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Buscar por ciudadano, barrio, tipo o número..."
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
      </div>

      <div className="d-flex gap-2 flex-wrap mb-3">
        <button
          type="button"
          className={`chip-filtro-dash ${
            tipo === "TODAS" ? "active" : ""
          }`}
          onClick={() => cambiarTipo("TODAS")}
        >
          Todas
          <span className="chip-count-dash">
            {alertas.length}
          </span>
        </button>

        {tipos.map(nombre => (
          <button
            type="button"
            key={nombre}
            className={`chip-filtro-dash ${
              tipo === normalizar(nombre) ? "active" : ""
            }`}
            onClick={() => cambiarTipo(normalizar(nombre))}
          >
            {nombre}
            <span className="chip-count-dash">
              {
                alertas.filter(
                  a => normalizar(a.tipo) === normalizar(nombre)
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      <div className="card-panel-dash p-3">
        <div className="table-responsive">
          <table className="table table-borderless align-middle tabla-alertas-dash mb-0">
            <thead>
              <tr>
                <th>N.º</th>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map(alerta => (
                <tr key={alerta.idAlerta}>
                  <td>#{alerta.idAlerta}</td>
                  <td>{alerta.reportadoPor || "—"}</td>
                  <td>{alerta.tipo || "—"}</td>
                  <td>{alerta.prioridad || "—"}</td>
                  <td>{alerta.barrioNombre || "—"}</td>

                  <td>
                    <span className="badge bg-secondary">
                      {alerta.estado || "Sin estado"}
                    </span>
                  </td>

                  <td>{formatearFecha(alerta.fecha)}</td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSeleccionada(alerta)}
                    >
                      <i className="bi bi-eye me-1" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cargando && (
          <p role="status" className="text-center p-3">
            Cargando alertas...
          </p>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <p className="text-center p-3">
            No se encontraron alertas.
          </p>
        )}

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3">
          <span className="info-sub-dash m-0">
            Mostrando {filtradas.length ? inicio + 1 : 0}
            –{Math.min(inicio + POR_PAGINA, filtradas.length)}
            {" "}de {filtradas.length} alertas
          </span>

          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className="pagina-btn-dash"
              disabled={paginaActual <= 1}
              onClick={() => setPagina(p => p - 1)}
            >
              Anterior
            </button>

            <span className="px-2">
              {paginaActual} / {totalPaginas}
            </span>

            <button
              type="button"
              className="pagina-btn-dash"
              disabled={paginaActual >= totalPaginas}
              onClick={() => setPagina(p => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {seleccionada && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de alerta"
          style={{ background: "rgba(0,0,0,.55)" }}
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setSeleccionada(null);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-alerta-dash">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalle de alerta #{seleccionada.idAlerta}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSeleccionada(null)}
                />
              </div>

              <div className="modal-body">
                <div className="detalle-principal-dash">
                  <div>
                    <small>TIPO DE ALERTA</small>
                    <div>{seleccionada.tipo || "—"}</div>
                  </div>

                  <div>
                    <small>PRIORIDAD</small>
                    <div>{seleccionada.prioridad || "—"}</div>
                  </div>

                  <div>
                    <small>ESTADO</small>
                    <div>{seleccionada.estado || "—"}</div>
                  </div>
                </div>

                <div className="detalle-grid-dash">
                  <div className="detalle-item-dash">
                    <i className="bi bi-person" />
                    <div>
                      <small>Ciudadano</small>
                      <strong>{seleccionada.reportadoPor || "—"}</strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-geo-alt" />
                    <div>
                      <small>Barrio</small>
                      <strong>{seleccionada.barrioNombre || "—"}</strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-clock" />
                    <div>
                      <small>Fecha</small>
                      <strong>{formatearFecha(seleccionada.fecha)}</strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-geo" />
                    <div>
                      <small>Coordenadas</small>
                      <strong>
                        {seleccionada.latitud ?? "—"},
                        {" "}
                        {seleccionada.longitud ?? "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="detalle-descripcion-dash">
                  <small>DESCRIPCIÓN</small>
                  <p>
                    {seleccionada.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cerrar-detalle-dash"
                  onClick={() => setSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Alertas;
