
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";
import SelectBonito from "../../Components/Administrador-policia/SelectBonito";

import {
  cargarUnidadesCentral,
  obtenerCampo,
  idDeUnidad,
  idDeAlerta,
  estadoDe,
  asignacionEnCurso,
  nombreUnidad,
  tipoDeAlerta,
  resumenUnidades,
} from "../../Services/atencionUnidadesCentralService";

import "../../css/Policia/central-policia/css/unidades.css";

const claseEstadoUnidad = (valor) => {
  const normalizado = String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  if (normalizado === "OPERATIVA") return "operativa";
  if (normalizado === "ACTIVA") return "activa";
  if (["OCUPADA", "OCUPADO", "EN_ATENCION"].includes(normalizado)) return "ocupada";
  if (["FUERA_DE_SERVICIO", "FUERA_SERVICIO", "INACTIVA"].includes(normalizado)) return "fuera-servicio";
  if (["EN_CAMINO", "DESPLAZAMIENTO"].includes(normalizado)) return "en-camino";
  if (["EN_SITIO", "EN_LUGAR"].includes(normalizado)) return "en-sitio";
  return "otro";
};

function Unidades() {
  const [datos, setDatos] = useState({
    unidades: [],
    policias: [],
    asignaciones: [],
    alertas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    cargarUnidadesCentral(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) {
          setDatos(resultado);
          setError("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, []);

  const valores = useMemo(
    () => resumenUnidades(datos.unidades, datos.asignaciones),
    [datos.unidades, datos.asignaciones]
  );

  const registros = useMemo(() => {
    const unidadesUnicas = [...new Map(
      datos.unidades.map((unidad) => [String(idDeUnidad(unidad)), unidad])
    ).values()];

    return unidadesUnicas.map((unidad) => {
      const idUnidad = idDeUnidad(unidad);
      const asignacion = datos.asignaciones.find(
        (a) =>
          String(
            obtenerCampo(
              a,
              "idUnidad",
              "IdUnidad"
            )
          ) === String(idUnidad) &&
          asignacionEnCurso(a)
      );

      const alerta = datos.alertas.find(
        (a) =>
          String(idDeAlerta(a)) ===
          String(
            obtenerCampo(
              asignacion,
              "idAlerta",
              "IdAlerta"
            )
          )
      );

      return {
        clave: String(idUnidad),
        unidad,
        asignacion,
        alerta,
        idUnidad,
      };
    });
  }, [datos.unidades, datos.asignaciones, datos.alertas]);

  const estados = useMemo(
    () =>
      [...new Set(
        datos.unidades
          .map(estadoDe)
          .filter(Boolean)
      )].sort(),
    [datos.unidades]
  );

  const filtrados = useMemo(() => {
    return registros.filter((registro) => {
      const estado = estadoDe(registro.unidad);

      const coincideUnidad =
        filtroUnidad === "todas" ||
        String(registro.idUnidad) === filtroUnidad;

      const coincideEstado =
        filtroEstado === "todos" ||
        estado === filtroEstado;

      const textoBusqueda = [
        nombreUnidad(registro.unidad),
        estado,
        registro.alerta ? tipoDeAlerta(registro.alerta) : "Sin asignación activa",
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideUnidad &&
        coincideEstado &&
        textoBusqueda.includes(busqueda.toLowerCase())
      );
    });
  }, [registros, filtroUnidad, filtroEstado, busqueda]);

  const registrosPorPagina = 8;
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = filtrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const atencionActual = (registro) => {
    if (!registro.asignacion) {
      return "Sin asignación activa";
    }

    const id = obtenerCampo(
      registro.asignacion,
      "idAlerta",
      "IdAlerta"
    );

    return `Alerta #${id ?? "—"} · ${
      registro.alerta
        ? tipoDeAlerta(registro.alerta)
        : "En seguimiento"
    }`;
  };

  return (
    <div className="unidad-page">
      <Topbar placeholder="Buscar unidad..." />

      <main className="main-dash">
        <div className="container-fluid">
          <header className="unidad-header mb-4">
            <div className="unidad-titulo">

              <div>
                <h1 className="page-title-dash">
                  Unidades
                </h1>

                <p className="unidad-descripcion mb-0">Consulta el estado y la atención actual de las unidades policiales.</p>
              </div>
            </div>


          </header>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>
                No se pudieron consultar las unidades.
              </strong>

              <p className="mb-0 mt-1">{error}</p>
            </div>
          )}

          <div className="unidad-kpis">
            <Kpis
              grupo="unidades"
              valores={cargando || error ? {} : valores}
            />
          </div>

          <section className="unidad-filtros card-panel-dash">
            <div className="unidad-search">
              <div className="input-group">
                <span className="input-group-text" aria-hidden="true"><i className="bi bi-search" /></span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Buscar unidad..."
                  aria-label="Buscar unidad"
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                />
              </div>
            </div>
            <SelectBonito
              id="unidades-filtro-unidad"
              ariaLabel="Filtrar por unidad"
              valor={filtroUnidad}
              onChange={(valor) => { setFiltroUnidad(valor); setPagina(1); }}
              opciones={[
                { valor: "todas", etiqueta: "Todas las unidades" },
                ...datos.unidades.map((u) => ({ valor: String(idDeUnidad(u)), etiqueta: nombreUnidad(u) })),
              ]}
              placeholder="Todas las unidades"
              icono="bi-car-front"
              variante="filtro"
            />
            <SelectBonito
              id="unidades-filtro-estado"
              ariaLabel="Filtrar por estado"
              valor={filtroEstado}
              onChange={(valor) => { setFiltroEstado(valor); setPagina(1); }}
              opciones={[
                { valor: "todos", etiqueta: "Todos los estados" },
                ...estados.map((estado) => ({ valor: estado, etiqueta: estado })),
              ]}
              placeholder="Todos los estados"
              icono="bi-funnel"
              variante="filtro"
            />
          </section>
          <section className="card-panel-dash unidad-panel-tabla">
            <div className="unidad-tabla-encabezado">
              <div>
                <h2>Estado de las unidades</h2>
                <p>Consulta el estado y la atención actual de las unidades policiales</p>
              </div>
            </div>
            <div className="unidad-tabla-wrap table-responsive">
              <table className="table unidad-tabla align-middle">
                <thead><tr><th>Unidad</th><th>Estado</th><th>Atención actual</th><th className="text-center">Detalle</th></tr></thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="4" className="text-center p-4">Cargando unidades...</td></tr>
                  ) : error ? (
                    <tr><td colSpan="4" className="text-center p-4">No se pudo cargar la información.</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-4 text-muted">No se encontraron unidades con esos filtros.</td></tr>
                  ) : registrosPagina.map((registro) => (
                    <tr key={registro.clave}>
                      <td>
                        <span className="unidad-nombre-cai">
                          <span className="unidad-vehiculo-icono"><i className="bi bi-car-front" aria-hidden="true" /></span>
                          <strong>{nombreUnidad(registro.unidad) || "Unidad sin nombre"}</strong>
                        </span>
                      </td>
                      <td><span className={`unidad-estado ${claseEstadoUnidad(estadoDe(registro.unidad))}`}>{estadoDe(registro.unidad) || "No disponible"}</span></td>
                      <td><span className="unidad-sin-atencion">{atencionActual(registro)}</span></td>
                      <td className="ver-detalles-cell text-center">
                        <button type="button" className="unidad-btn-detalle btn-ver-detalles" title="Ver detalles" aria-label={`Ver detalles de ${nombreUnidad(registro.unidad)}`} onClick={() => setDetalle(registro)}>
                          <i className="bi bi-eye-fill" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!cargando && !error && filtrados.length > 0 && (
              <nav className="unidad-paginacion" aria-label="Paginación de unidades">
                <span>Mostrando {(paginaActual - 1) * registrosPorPagina + 1}–{Math.min(paginaActual * registrosPorPagina, filtrados.length)} de {filtrados.length} unidades</span>
                <div className="unidad-paginacion-controles">
                  <button type="button" disabled={paginaActual === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}><i className="bi bi-chevron-left" aria-hidden="true" /> Anterior</button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                    <button key={numero} type="button" className={numero === paginaActual ? "activa" : ""} aria-current={numero === paginaActual ? "page" : undefined} aria-label={`Página ${numero}`} onClick={() => setPagina(numero)}>{numero}</button>
                  ))}
                  <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>Siguiente <i className="bi bi-chevron-right" aria-hidden="true" /></button>
                </div>
              </nav>
            )}
          </section>
        </div>
      </main>

      {detalle && (
        <div
          className="modal d-block unidad-modal-backdrop"
          id="modalDetalleUnidad"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalDetalleUnidadTitulo"
          onClick={() => setDetalle(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content unidad-modal">
              <div className="modal-header">
                <div>
                  <span className="unidad-modal-subtitulo">INFORMACIÓN DE UNIDAD</span>

                  <h5
                    className="modal-title"
                    id="modalDetalleUnidadTitulo"
                  >
                    <i className="bi bi-truck unidad-modal-titulo-icon" aria-hidden="true" />
                    {nombreUnidad(detalle.unidad) || "Unidad sin nombre"}
                  </h5>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetalle(null)}
                  aria-label="Cerrar"
                />
              </div>

              <div className="modal-body">
                <div className="unidad-detalle-lista">
                  <div className="unidad-detalle-fila">
                    <span className="unidad-detalle-etiqueta">
                      <i className="bi bi-activity" aria-hidden="true" />
                      Estado operativo
                    </span>
                    <span className={`unidad-estado ${claseEstadoUnidad(estadoDe(detalle.unidad))}`}>
                      {estadoDe(detalle.unidad) || "No disponible"}
                    </span>
                  </div>

                  <div className="unidad-detalle-fila">
                    <span className="unidad-detalle-etiqueta">
                      <i className="bi bi-clipboard2-pulse" aria-hidden="true" />
                      Atención actual
                    </span>
                    <span className="unidad-detalle-atencion">
                      {atencionActual(detalle)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light unidad-btn-cerrar"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Unidades;
