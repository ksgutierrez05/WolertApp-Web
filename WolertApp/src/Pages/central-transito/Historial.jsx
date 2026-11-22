import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../Components/transito/Layout";
import {
  listarAtencionesCentral,
  listarAgentesCentral,
  listarAlertasCentral,
  finalizadaCentral,
  fechaCentral,
  fechaRegistroCentral,
  tipoCentral,
  lugarCentral,
  reportanteCentral,
  normalizarCentral,
  idAgenteCentral,
  idAlertaCentral,
  idAtencionCentral,
  nombreAgenteCentral,
} from "../../Services/centralTransitoService";
import "../../css/transito/central-transito/panel-atencion-transito.css";
const lista = (valor) => (Array.isArray(valor) ? valor : []);
function clasificarTipo(tipo) {
  const valor = normalizarCentral(tipo);
  if (valor.includes("SEMAFORO")) return "semaforo";
  if (valor.includes("ACCIDENTE") || valor.includes("CHOQUE")) return "accidente";
  return "otro";
}
function claseTipo(tipo) {
  return clasificarTipo(tipo) === "semaforo"
    ? "tipo-semaforo-dash"
    : "tipo-accidente-dash";
}
function fechaLocalISO(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}
function fechaCierreAtencion(atencion) {
  return (
    atencion.fechaFinalizacion ||
    atencion.fechaCierre ||
    atencion.fechaFin ||
    atencion.fechaAtencion ||
    fechaRegistroCentral(atencion)
  );
}
export default function Historial() {
  const [atenciones, setAtenciones] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [buscar, setBuscar] = useState("");
  const [fecha, setFecha] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const fechaRef = useRef(null);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      const [rAtenciones, rAgentes, rAlertas] = await Promise.allSettled([
        listarAtencionesCentral(),
        listarAgentesCentral(),
        listarAlertasCentral(),
      ]);
      if (!activo) return;
      const mensajes = [];
      if (rAtenciones.status === "fulfilled") setAtenciones(lista(rAtenciones.value));
      else mensajes.push("No se pudo consultar el historial de atenciones.");
      if (rAgentes.status === "fulfilled") setAgentes(lista(rAgentes.value));
      else mensajes.push("No se pudieron cargar los nombres de agentes.");
      if (rAlertas.status === "fulfilled") setAlertas(lista(rAlertas.value));
      else mensajes.push("No se pudieron consultar los datos de las alertas.");
      setErrores(mensajes);
      setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);
  const casos = useMemo(
    () =>
      atenciones
        .filter(finalizadaCentral)
        .map((atencion) => {
          const idAgente = atencion.idAgenteTransito ?? atencion.agenteTransitoId;
          const agente = agentes.find(
            (item) =>
              idAgente != null &&
              String(idAgenteCentral(item)) === String(idAgente)
          );
          const alerta = alertas.find(
            (item) =>
              atencion.idAlerta != null &&
              String(idAlertaCentral(item)) === String(atencion.idAlerta)
          );
          const origen = alerta || atencion;
          const tipo =
            tipoCentral(origen) === "Sin tipo registrado"
              ? tipoCentral(atencion)
              : tipoCentral(origen);
          const cierre = fechaCierreAtencion(atencion);
          return {
            id: idAtencionCentral(atencion),
            tipo,
            clasificacion: clasificarTipo(tipo),
            reporta: reportanteCentral(origen),
            barrio: lugarCentral(origen),
            agente: agente
              ? nombreAgenteCentral(agente)
              : atencion.nombreAgente || "No identificado",
            fecha: fechaLocalISO(cierre),
            cierre: fechaCentral(cierre),
            informe:
              atencion.descripcion ||
              atencion.informe ||
              atencion.observaciones ||
              atencion.descripcionFinal ||
              "",
            estado: atencion.estadoFinal || atencion.estado || "Finalizada",
          };
        })
        .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")),
    [atenciones, agentes, alertas]
  );
  const cuenta = (tipo) =>
    casos.filter((caso) => caso.clasificacion === tipo).length;
  const filas = useMemo(() => {
    const busqueda = normalizarCentral(buscar);
    return casos.filter((caso) => {
      if (filtro !== "todos" && caso.clasificacion !== filtro) return false;
      if (fecha && caso.fecha !== fecha) return false;
      const contenido = normalizarCentral(
        [
          caso.reporta,
          caso.tipo,
          caso.barrio,
          caso.agente,
          caso.cierre,
          caso.informe,
        ].join(" ")
      );
      return contenido.includes(busqueda);
    });
  }, [casos, filtro, fecha, buscar]);
  function abrirCalendario() {
    const elemento = fechaRef.current;
    if (!elemento) return;
    if (typeof elemento.showPicker === "function") {
      try {
        elemento.showPicker();
      } catch {
        elemento.focus();
      }
    } else {
      elemento.focus();
    }
  }
  const fechaTexto = fecha ? fecha.split("-").reverse().join("/") : "";
  const tabs = [
    ["todos", "Todos", casos.length],
    ["accidente", "Accidente", cuenta("accidente")],
    ["semaforo", "Semáforo dañado", cuenta("semaforo")],
    ...(cuenta("otro") > 0 ? [["otro", "Otros", cuenta("otro")]] : []),
  ];
  return (
    <Layout
      rol="central"
      titulo="Historial de casos"
      activo="historial"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      <header className="st-header mb-4">
        <div>
          <span className="st-eyebrow">CENTRAL DE TRÁNSITO</span>
          <h1>Historial de casos</h1>
          <p>Consulta los casos de tránsito despachados y cerrados.</p>
        </div>
      </header>
      {cargando && <div className="alert alert-info">Cargando historial...</div>}
      {errores.length > 0 && (
        <div className="alert alert-warning">{errores.join(" ")}</div>
      )}
      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {tabs.map(([id, etiqueta, total]) => (
              <button
                key={id}
                type="button"
                className={`tab-dash ${filtro === id ? "active-dash" : ""}`}
                onClick={() => setFiltro(id)}
              >
                {etiqueta} ({total})
              </button>
            ))}
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="input-group search-panel-dash">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control border-0"
                placeholder="Barrio, agente o fecha..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
            <div className="fecha-wrap-dash">
              <button
                type="button"
                className={`btn-fecha-dash ${fecha ? "activo-dash" : ""}`}
                onClick={abrirCalendario}
                title="Filtrar por fecha"
                aria-label="Filtrar por fecha"
              >
                <i className="bi bi-calendar3" />
              </button>
              <input
                ref={fechaRef}
                type="date"
                className="fecha-oculta-dash"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                tabIndex={-1}
                aria-label="Fecha del historial"
              />
            </div>
            {fecha && (
              <span className="chip-fecha-dash">
                {fechaTexto}
                <button
                  type="button"
                  onClick={() => setFecha("")}
                  aria-label="Quitar fecha"
                >
                  <i className="bi bi-x" />
                </button>
              </span>
            )}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Agente asignado</th>
                <th>Cierre</th>
                <th className="text-end"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((caso, indice) => (
                <tr key={caso.id ?? indice}>
                  <td>{caso.reporta}</td>
                  <td>
                    <span className={`badge-tipo-dash ${claseTipo(caso.tipo)}`}>
                      {normalizarCentral(caso.tipo)}
                    </span>
                  </td>
                  <td>{caso.barrio}</td>
                  <td>{caso.agente}</td>
                  <td>{caso.cierre}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="link-detalle-dash border-0 bg-transparent"
                      onClick={() => setSeleccionado(caso)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!cargando && filas.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay casos cerrados que coincidan con los filtros.
          </p>
        )}
        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {filas.length} de {casos.length} casos cerrados
          </span>
          <div className="d-flex gap-1">
            <button type="button" className="page-btn-dash active-dash">
              1
            </button>
          </div>
        </div>
      </div>
      {seleccionado && (
        <div
          className="modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloDetalleHistorial"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSeleccionado(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header border-0 pb-0">
                <h5 id="tituloDetalleHistorial" className="panel-title-dash mb-0">
                  Detalle del caso
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSeleccionado(null)}
                />
              </div>
              <div className="modal-body">
                <span
                  className={`badge-tipo-dash mb-2 d-inline-block ${claseTipo(seleccionado.tipo)}`}
                >
                  {normalizarCentral(seleccionado.tipo)}
                </span>
                <div className="perfil-datos-dash">
                  {[
                    ["Barrio", seleccionado.barrio],
                    ["Reportado por", seleccionado.reporta],
                    ["Agente asignado", seleccionado.agente],
                    ["Cierre", seleccionado.cierre],
                    ["Estado", seleccionado.estado],
                  ].map(([etiqueta, valor]) => (
                    <div key={etiqueta} className="perfil-fila-dash">
                      <span className="perfil-label-dash">{etiqueta}</span>
                      <span className="perfil-valor-dash">{valor}</span>
                    </div>
                  ))}
                </div>
                <p className="config-field-label-dash mt-3 mb-1">Informe</p>
                <p className="detalle-descripcion-dash">
                  {seleccionado.informe || "No hay informe registrado."}
                </p>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}