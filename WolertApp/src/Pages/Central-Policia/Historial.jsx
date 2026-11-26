
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";
import SelectBonito from "../../Components/Administrador-policia/SelectBonito";

import {
  cargarCasosCentral,
  construirCasos,
  kpisHistorial,
  fechaLegible,
  coincideFecha,
} from "../../Services/historialCentralService";
import { zonaDelCaso } from "../../Services/ubicacionAlertaCentral";

import "../../css/Policia/central-policia/css/historial.css";

const categoriaLegible = (valor) => {
  if (!valor) return "—";
  const texto = String(valor).replaceAll("_", " ").trim().toLocaleLowerCase("es");
  const conAcentos = texto.replace(/\bmedica\b/g, "médica").replace(/\bmedico\b/g, "médico");
  return conAcentos.charAt(0).toLocaleUpperCase("es") + conAcentos.slice(1);
};

function Historial() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 8;

  useEffect(() => {
    const controller = new AbortController();

    cargarCasosCentral(controller.signal)
      .then((resultado) => {
        if (controller.signal.aborted) return;
        setDatos(resultado);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setDatos(null);
        setSeleccion(null);
        setError(
          err?.message || "No se pudo consultar el historial."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, []);

  const casos = useMemo(
    () => (datos ? construirCasos(datos) : []),
    [datos]
  );

  const categorias = useMemo(
    () =>
      [...new Set(casos.map((c) => c.tipo).filter(Boolean))]
        .sort(),
    [casos]
  );

  const estados = useMemo(
    () =>
      [...new Set(casos.map((c) => c.estado).filter(Boolean))]
        .sort(),
    [casos]
  );

  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();

    return casos.filter((caso) => {
      const texto = [
        caso.id,
        caso.descripcion,
        caso.tipo,
        zonaDelCaso(caso),
        caso.unidadNombre,
      ]
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(consulta) &&
        (estado === "todos" || caso.estado === estado) &&
        (categoria === "todas" || caso.tipo === categoria) &&
        coincideFecha(caso.fecha, desde, hasta)
      );
    });
  }, [casos, busqueda, estado, categoria, desde, hasta]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = filtrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );


  const seleccionado = useMemo(
    () =>
      casos.find((caso) => caso.clave === seleccion) || null,
    [casos, seleccion]
  );

  useEffect(() => {
    if (!seleccionado) return undefined;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape") setSeleccion(null);
    };
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [seleccionado]);

  function cambiarFiltro(actualizarFiltro, valor) {
    actualizarFiltro(valor);
    setPagina(1);
  }

  function cerrarDetalle() {
    setSeleccion(null);
  }

  function claseEstado(valor) {
    switch (valor) {
      case "RESUELTA":
        return "historial-estado-resuelta";

      case "CANCELADA":
        return "historial-estado-cancelada";

      case "PENDIENTE":
        return "historial-estado-pendiente";

      case "UNIDAD_ASIGNADA":
      case "EN_ATENCION":
        return "historial-estado-proceso";

      default:
        return "historial-estado-neutral";
    }
  }

return (
    <>
      <Topbar placeholder="Buscar caso..." />

      <main className="historial-main">
        <header className="historial-header">
          <div>

            <h1>
              Historial
            </h1>

            <p>
              Consulta el registro histórico de alertas,
              asignaciones y atenciones de Central Policía.
            </p>
          </div>


        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            No se pudo cargar el historial: {error}
          </div>
        )}

        {datos?.errores?.length > 0 && (
          <div className="alert alert-warning" role="alert">
            <strong>
              Información complementaria incompleta.
            </strong>
            <div className="mt-1">
              {datos.errores.join(" | ")}
            </div>
          </div>
        )}

        <Kpis
          grupo="historial"
          valores={
            cargando || error ? {} : kpisHistorial(casos)
          }
        />

        {/* FILTROS */}
        <section className="historial-panel historial-filtros-panel">
          <div className="historial-filtros">
            <div className="historial-field historial-busqueda">
              <span className="historial-label">Buscar</span>
              <span className="historial-input-wrap">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  type="text"
                  className="form-control historial-input"
                  placeholder="Buscar caso, descripción o zona..."
                  aria-label="Buscar caso, descripción o zona"
                  value={busqueda}
                  onChange={(e) => cambiarFiltro(setBusqueda, e.target.value)}
                />
                {busqueda && <button type="button" className="historial-limpiar-campo" aria-label="Borrar búsqueda" onClick={() => cambiarFiltro(setBusqueda, "")}><i className="bi bi-x-lg" /></button>}
              </span>
            </div>
            <div className="historial-field">
              <span className="historial-label">Estado</span>
              <SelectBonito
                id="historial-filtro-estado"
                ariaLabel="Filtrar por estado"
                valor={estado}
                onChange={(valor) => cambiarFiltro(setEstado, valor || "todos")}
                opciones={[{ valor: "todos", etiqueta: "Todos los estados" }, ...estados.map((valor) => ({ valor, etiqueta: valor.replaceAll("_", " ") }))]}
                placeholder="Todos los estados"
                icono="bi-activity"
                limpiable={estado !== "todos"}
              />
            </div>
            <div className="historial-field">
              <span className="historial-label">Categoría</span>
              <SelectBonito
                id="historial-filtro-categoria"
                ariaLabel="Filtrar por categoría"
                valor={categoria}
                onChange={(valor) => cambiarFiltro(setCategoria, valor || "todas")}
                opciones={[{ valor: "todas", etiqueta: "Todas las categorías" }, ...categorias.map((valor) => ({ valor, etiqueta: valor }))]}
                placeholder="Todas las categorías"
                icono="bi-grid"
                limpiable={categoria !== "todas"}
              />
            </div>
            <div className="historial-field historial-fecha-field">
              <span className="historial-label">Fecha inicial</span>
              <span className="historial-date-wrap">
                <i className="bi bi-calendar3" aria-hidden="true" />
                <input type="date" className="form-control historial-input" aria-label="Fecha inicial" value={desde} max={hasta || undefined} onChange={(e) => cambiarFiltro(setDesde, e.target.value)} />
                {desde && <button type="button" className="historial-limpiar-campo" aria-label="Borrar fecha inicial" onClick={() => cambiarFiltro(setDesde, "")}><i className="bi bi-x-lg" /></button>}
              </span>
            </div>
            <div className="historial-field historial-fecha-field">
              <span className="historial-label">Fecha final</span>
              <span className="historial-date-wrap">
                <i className="bi bi-calendar3" aria-hidden="true" />
                <input type="date" className="form-control historial-input" aria-label="Fecha final" value={hasta} min={desde || undefined} onChange={(e) => cambiarFiltro(setHasta, e.target.value)} />
                {hasta && <button type="button" className="historial-limpiar-campo" aria-label="Borrar fecha final" onClick={() => cambiarFiltro(setHasta, "")}><i className="bi bi-x-lg" /></button>}
              </span>
            </div>
          </div>
        </section>
        {/* TABLA DE HISTORIAL */}
        <section className="historial-contenido">
          <div className="historial-table-panel">
            <div className="table-responsive">
              <table className="table historial-table mb-0">
                <thead>
                  <tr>
                    <th>Número de caso</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Categoría</th>
                    <th>Zona</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!cargando && !error && registrosPagina.map((caso) => (
                    <tr key={caso.clave}>
                      <td><strong>#{caso.id ?? "—"}</strong></td>
                      <td className="historial-descripcion">{caso.descripcion || "Sin descripción"}</td>
                      <td><span className={`badge historial-badge-estado ${claseEstado(caso.estado)}`}>{caso.estado ? caso.estado.replaceAll("_", " ") : "Sin estado"}</span></td>
                      <td className="historial-categoria">{categoriaLegible(caso.tipo)}</td>
                      <td className="historial-zona"><i className="bi bi-geo-alt" aria-hidden="true" /> {zonaDelCaso(caso)}</td>
                      <td className="historial-acciones ver-detalles-cell">
                        <button type="button" className="btn btn-sm btn-ver-detalles" title="Ver detalles" aria-label={`Ver detalles del caso ${caso.clave}`} onClick={() => setSeleccion(caso.clave)}>
                          <i className="bi bi-eye-fill" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(cargando || error || filtrados.length === 0) && (
              <div className="historial-empty">
                <i className="bi bi-file-earmark-text historial-empty-icon" />
                <h3>{cargando ? "Cargando historial..." : error ? "Error al consultar" : "No hay resultados"}</h3>
                <p>{cargando ? "Consultando los casos registrados." : error ? "Comprueba la conexión con la API." : "No hay casos que coincidan con los filtros."}</p>
              </div>
            )}
            {!cargando && !error && filtrados.length > 0 && (
              <nav className="historial-paginacion" aria-label="Paginación del historial">
                <span>Mostrando {(paginaActual - 1) * registrosPorPagina + 1}–{Math.min(paginaActual * registrosPorPagina, filtrados.length)} de {filtrados.length} registros</span>
                <div className="historial-paginacion-controles">
                  <button type="button" disabled={paginaActual === 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}><i className="bi bi-chevron-left" aria-hidden="true" /> Anterior</button>
                  {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                    <button key={numero} type="button" className={numero === paginaActual ? "activa" : ""} aria-current={numero === paginaActual ? "page" : undefined} aria-label={`Página ${numero}`} onClick={() => setPagina(numero)}>{numero}</button>
                  ))}
                  <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}>Siguiente <i className="bi bi-chevron-right" aria-hidden="true" /></button>
                </div>
              </nav>
            )}
          </div>
        </section>
      </main>

      {seleccionado && (
        <div className="historial-modal-overlay" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) cerrarDetalle(); }}>
          <section className="historial-modal" role="dialog" aria-modal="true" aria-labelledby="historial-modal-title">
            <header className="historial-modal-header">
              <div>
                <span className="historial-detalle-subtitulo">INFORMACIÓN DEL CASO</span>
                <h2 id="historial-modal-title">Detalle del caso #{seleccionado.id ?? "—"}</h2>
              </div>
              <button type="button" className="historial-detalle-cerrar" aria-label="Cerrar detalle" onClick={cerrarDetalle}><i className="bi bi-x-lg" /></button>
            </header>
            <div className="historial-modal-body">
              <div className="historial-modal-grid">
                <div className="historial-modal-dato"><span>Número de caso</span><strong>#{seleccionado.id ?? "—"}</strong></div>
                <div className="historial-modal-dato"><span>Fecha y hora</span><strong>{fechaLegible(seleccionado.fecha)}</strong></div>
                <div className="historial-modal-dato"><span>Estado</span><strong><span className={`historial-badge-estado ${claseEstado(seleccionado.estado)}`}>{seleccionado.estado?.replaceAll("_", " ") || "Sin estado"}</span></strong></div>
                <div className="historial-modal-dato"><span>Prioridad</span><strong><span className={`historial-prioridad historial-prioridad-${String(seleccionado.prioridad || "").toLowerCase()}`}>{seleccionado.prioridad?.replaceAll("_", " ") || "No registrada"}</span></strong></div>
                <div className="historial-modal-dato"><span>Categoría</span><strong>{seleccionado.tipo || "No registrada"}</strong></div>
                <div className="historial-modal-dato"><span>Zona</span><strong className="historial-modal-zona"><i className="bi bi-geo-alt" aria-hidden="true" /> {zonaDelCaso(seleccionado)}</strong></div>
                <div className="historial-modal-dato historial-modal-dato-completo"><span>Descripción</span><strong>{seleccionado.descripcion || "Sin descripción"}</strong></div>
              </div>
              <section className="historial-modal-adicional">
                <h3>Asignación</h3>
                <div className="historial-modal-grid">
                  <div className="historial-modal-dato"><span>Unidad asignada</span><strong>{seleccionado.unidadNombre || "No disponible"}</strong></div>
                  <div className="historial-modal-dato"><span>Estado de asignación</span><strong>{seleccionado.estadoAsignacion?.replaceAll("_", " ") || "No disponible"}</strong></div>
                  <div className="historial-modal-dato"><span>Asignaciones registradas</span><strong>{seleccionado.totalAsignaciones}</strong></div>
                </div>
              </section>
              <section className="historial-modal-adicional">
                <h3>Informe de atención</h3>
                <div className="historial-modal-grid">
                  <div className="historial-modal-dato"><span>Resultado de atención</span><strong>{seleccionado.resultado || "No registrado"}</strong></div>
                  <div className="historial-modal-dato"><span>Fecha de atención</span><strong>{fechaLegible(seleccionado.fechaAtencion)}</strong></div>
                  <div className="historial-modal-dato historial-modal-dato-completo"><span>Observaciones</span><strong>{seleccionado.observaciones || "Sin observaciones registradas"}</strong></div>
                  <div className="historial-modal-dato"><span>Atenciones registradas</span><strong>{seleccionado.totalAtenciones}</strong></div>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default Historial;
