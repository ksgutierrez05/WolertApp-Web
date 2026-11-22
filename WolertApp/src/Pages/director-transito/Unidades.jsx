import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarUnidades,
  obtenerUnidad,
  listarBarriosUnidades,
  crearUnidad,
  actualizarUnidad,
  desactivarUnidad,
} from "../../Services/unidadesTransitoService";
import "../../css/transito/director-transito/panel-unidades.css";

const VACIO = { nombre: "", estado: "OPERATIVA", barrioId: "", latitud: "", longitud: "" };
const ESTADOS = [
  ["OPERATIVA", "Operativa"],
  ["FUERA_DE_SERVICIO", "Fuera de servicio"],
  ["INACTIVA", "Inactiva"],
];
const normalizar = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const estadoNormalizado = (estado) => {
  const valor = normalizar(estado).replace(/\s+/g, "_");
  return valor === "ACTIVA" ? "OPERATIVA" : valor;
};
const etiqueta = (s) => ESTADOS.find(([id]) => id === estadoNormalizado(s))?.[1] ?? s ?? "Sin estado";
const claseEstado = (s) => ({
  OPERATIVA: "operativa",
  FUERA_DE_SERVICIO: "fuera-servicio",
  INACTIVA: "inactiva",
}[estadoNormalizado(s)] ?? "desconocida");
const barrioId = (b) => b.idBarrio ?? b.barrioId;
const barrioNombre = (b) => b.nombre ?? b.nombreBarrio ?? "Barrio sin nombre";

const inicialesUnidad = (nombre) => {
  const palabras = String(nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (!palabras.length) return "UT";
  return palabras.length === 1
    ? palabras[0].slice(0, 2).toUpperCase()
    : palabras.slice(0, 2).map((palabra) => palabra[0]).join("").toUpperCase();
};
const colorUnidad = (id) => {
  const colores = ["#d99b2c", "#2e9e5b", "#7c4fc9", "#2f6fed", "#d95368", "#168b91"];
  return colores[Math.abs(Number(id) || 0) % colores.length];
};

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("TODAS");
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({ ...VACIO });
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const [u, b] = await Promise.allSettled([listarUnidades(), listarBarriosUnidades()]);
      const fallos = [];
      if (u.status === "fulfilled") setUnidades(u.value);
      else fallos.push(u.reason?.message || "No se pudieron cargar las unidades.");
      if (b.status === "fulfilled") setBarrios(b.value);
      else fallos.push(b.reason?.message || "No se pudieron cargar los barrios.");
      setError(fallos.join(" | "));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;
    Promise.allSettled([listarUnidades(), listarBarriosUnidades()]).then(([u, b]) => {
      if (!activo) return;
      const fallos = [];
      if (u.status === "fulfilled") setUnidades(u.value);
      else fallos.push(u.reason?.message || "Error al cargar unidades.");
      if (b.status === "fulfilled") setBarrios(b.value);
      else fallos.push(b.reason?.message || "Error al cargar barrios.");
      setError(fallos.join(" | "));
      setCargando(false);
    });
    return () => { activo = false; };
  }, []);

  const totales = useMemo(() => ({
    operativas: unidades.filter((u) => estadoNormalizado(u.estado) === "OPERATIVA").length,
    fuera: unidades.filter((u) => estadoNormalizado(u.estado) === "FUERA_DE_SERVICIO").length,
    inactivas: unidades.filter((u) => estadoNormalizado(u.estado) === "INACTIVA").length,
  }), [unidades]);

  const filtradas = useMemo(() => unidades.filter((u) => {
    const coincide = normalizar([u.nombre, u.nombreBarrio, u.nombreComuna, u.idUnidadTransito, u.estado].join(" ")).includes(normalizar(busqueda));
    return coincide && (filtro === "TODAS" || estadoNormalizado(u.estado) === filtro);
  }), [unidades, busqueda, filtro]);
  const paginas = Math.max(1, Math.ceil(filtradas.length / 5));
  const actual = Math.min(pagina, paginas);
  const visibles = filtradas.slice((actual - 1) * 5, actual * 5);

  function nuevo() {
    setEditando(null);
    setFormulario({ ...VACIO });
    setError("");
    setMostrarModal(true);
  }
  function editar(u) {
    setEditando(u.idUnidadTransito);
    setFormulario({
      nombre: u.nombre ?? "", estado: estadoNormalizado(u.estado) || "OPERATIVA",
      barrioId: u.barrioId == null ? "" : String(u.barrioId),
      latitud: u.latitud == null ? "" : String(u.latitud),
      longitud: u.longitud == null ? "" : String(u.longitud),
    });
    setError("");
    setMostrarModal(true);
  }
  function campo(nombre, valor) { setFormulario((f) => ({ ...f, [nombre]: valor })); }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      if (editando == null) await crearUnidad(formulario);
      else await actualizarUnidad(editando, formulario);
      setAviso(editando == null ? "Unidad registrada correctamente." : "Unidad actualizada correctamente.");
      setMostrarModal(false);
      await cargar();
    } catch (err) { setError(err.message || "No se pudo guardar."); }
    finally { setGuardando(false); }
  }

  async function desactivar(u) {
    if (!window.confirm(`¿Desactivar ${u.nombre}? Se conservarán sus datos e historial.`)) return;
    setError(""); setAviso("");
    try {
      await desactivarUnidad(u);
      setAviso("Unidad marcada como inactiva.");
      await cargar();
    } catch (err) { setError(err.message || "No se pudo desactivar."); }
  }

  async function verIntegrantes(u) {
    setDetalle(null); setCargandoDetalle(true); setError("");
    try { setDetalle(await obtenerUnidad(u.idUnidadTransito)); }
    catch (err) { setError(err.message || "No se pudo consultar la unidad."); }
    finally { setCargandoDetalle(false); }
  }

  return (
    <Layout titulo="Unidades de Tránsito" activo="unidades" busqueda={{ placeholder: "Buscar unidad..." }}>
      <div className="ut">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="section-title-dash">Unidades de Tránsito</h1>
            <p className="section-text-dash mb-0">Administra las unidades operativas, su ubicación y sus integrantes.</p>
          </div>
          <button className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash" type="button" onClick={nuevo}>
            <i className="bi bi-plus-lg me-2" />Nueva unidad
          </button>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
        {cargando && <div className="alert alert-info" role="status">Cargando unidades...</div>}

        <div className="row g-3 mb-4">
          <KpiCard variante="plano" color="blue" valor={unidades.length} label="Total de unidades" icono="bi-diagram-3" />
          <KpiCard variante="plano" color="green" valor={totales.operativas} label="Operativas" icono="bi-check-circle" />
          <KpiCard variante="plano" color="amber" valor={totales.fuera} label="Fuera de servicio" icono="bi-exclamation-circle" />
          <KpiCard variante="plano" color="red" valor={totales.inactivas} label="Inactivas" icono="bi-slash-circle" />
        </div>

        <div className="table-card-dash">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div className="d-flex gap-2 tabs-dash flex-wrap">
              {[["TODAS", "Todas", unidades.length], ["OPERATIVA", "Operativas", totales.operativas], ["FUERA_DE_SERVICIO", "Fuera de servicio", totales.fuera], ["INACTIVA", "Inactivas", totales.inactivas]].map(([id, nombre, n]) => (
                <button key={id} type="button" className={`tab-dash ${filtro === id ? "active-dash" : ""}`} onClick={() => { setFiltro(id); setPagina(1); }}>{nombre} ({n})</button>
              ))}
            </div>
            <div className="input-group search-panel-dash">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
              <input className="form-control border-0" type="search" placeholder="Buscar unidad o barrio..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0 ut-tabla">
              <thead><tr><th>Unidad</th><th>Barrio / comuna</th><th>Integrantes</th><th>Estado</th><th>Ubicación</th><th className="text-end">Acciones</th></tr></thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.idUnidadTransito}>
                    <td>
                      <div className="ut-unidad-perfil">
                        <span className="ut-unidad-avatar" style={{ backgroundColor: colorUnidad(u.idUnidadTransito) }}>
                          {inicialesUnidad(u.nombre)}
                        </span>
                        <div className="ut-unidad-datos">
                          <span className="ut-unidad-nombre">{u.nombre || "Sin nombre"}</span>
                          <span className="ut-unidad-id">Unidad #{u.idUnidadTransito}</span>
                        </div>
                      </div>
                    </td>
                    <td><div className="ut-barrio-nombre">{u.nombreBarrio || "Sin barrio"}</div><div className="info-sub-dash">{u.nombreComuna || "Sin comuna"}</div></td>
                    <td><button type="button" className="ut-pill ut-pill-integrantes" onClick={() => verIntegrantes(u)} title="Ver integrantes">{u.totalAgentes ?? 0} integrantes</button></td>
                    <td><span className={`ut-pill ut-pill-${claseEstado(u.estado)}`}>{etiqueta(u.estado)}</span></td>
                    <td>{u.latitud != null && u.longitud != null ? <a className="ut-pill ut-pill-mapa" href={`https://www.google.com/maps?q=${u.latitud},${u.longitud}`} target="_blank" rel="noreferrer">Ver mapa</a> : <span className="ut-pill ut-pill-desconocida">Sin ubicación</span>}</td>
                    <td><div className="ut-acciones"><button type="button" className="ut-accion-btn editar" title="Editar unidad" aria-label={`Editar ${u.nombre}`} onClick={() => editar(u)}><i className="bi bi-pencil-square" /></button><button type="button" className="ut-accion-btn eliminar" title="Desactivar unidad" aria-label={`Desactivar ${u.nombre}`} disabled={estadoNormalizado(u.estado) === "INACTIVA"} onClick={() => desactivar(u)}><i className="bi bi-trash3-fill" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!cargando && visibles.length === 0 && <p className="text-center text-muted py-4 mb-0">No se encontraron unidades.</p>}
          <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash flex-wrap gap-2">
            <span className="text-muted small">Mostrando {visibles.length} de {filtradas.length} unidades</span>
            <div className="d-flex gap-1 align-items-center"><button type="button" className="page-btn-dash" disabled={actual === 1} onClick={() => setPagina(actual - 1)}><i className="bi bi-chevron-left" /></button><span className="small px-2">{actual} / {paginas}</span><button type="button" className="page-btn-dash" disabled={actual === paginas} onClick={() => setPagina(actual + 1)}><i className="bi bi-chevron-right" /></button></div>
          </div>
        </div>

        {mostrarModal && (
          <div className="ut-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setMostrarModal(false); }}>
            <form className="ut-form-modal" onSubmit={guardar} role="dialog" aria-modal="true" aria-labelledby="ut-modal-title">
              <div className="ut-form-header">
                <span className="ut-form-header-icon"><i className={`bi ${editando == null ? "bi bi-car-front-fill" : "bi-pencil-square"}`} /></span>
                <div className="ut-form-header-info">
                  <div className="ut-form-eyebrow">DIRECCIÓN DE TRÁNSITO</div>
                  <h2 id="ut-modal-title" className="ut-form-title">{editando == null ? "Registrar nueva unidad" : "Editar unidad de tránsito"}</h2>
                  <p className="ut-form-subtitle">{editando == null ? "Incorpora una unidad operativa al sistema WolertApp." : "Actualiza los datos y la disponibilidad de la unidad."}</p>
                </div>
                <button type="button" className="ut-form-close" aria-label="Cerrar formulario" disabled={guardando} onClick={() => setMostrarModal(false)}><i className="bi bi-x-lg" /></button>
              </div>
              <div className="ut-form-body">
                <div className="ut-form-help"><span><i className="bi bi-info-circle me-2" />{editando == null ? "Completa los datos para registrar la unidad." : "Modifica la información de la unidad seleccionada."}</span><span className="ut-form-required">* Campos obligatorios</span></div>
                <section className="ut-form-section">
                  <div className="ut-form-section-header"><span className="ut-form-section-icon"><i className="bi bi-car-front-fill" /></span><div className="ut-form-section-info"><h3 className="ut-form-section-title">Información de la unidad</h3><p className="ut-form-section-subtitle">Identificación y estado operativo</p></div><span className="ut-form-section-number">01</span></div>
                  <div className="ut-form-grid">
                    <div className="ut-form-field full"><label htmlFor="ut-nombre">Nombre de la unidad <span>*</span></label><input id="ut-nombre" type="text" placeholder="Ej. TRÁNSITO 03" maxLength={20} required disabled={guardando} value={formulario.nombre} onChange={(e) => campo("nombre", e.target.value)} /></div>
                    <div className="ut-form-field full"><label htmlFor="ut-estado">Estado <span>*</span></label><select id="ut-estado" required disabled={guardando} value={formulario.estado} onChange={(e) => campo("estado", e.target.value)}>{ESTADOS.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select><small>El estado Inactiva conserva el historial de la unidad.</small></div>
                  </div>
                </section>
                <section className="ut-form-section">
                  <div className="ut-form-section-header"><span className="ut-form-section-icon"><i className="bi bi-geo-alt-fill" /></span><div className="ut-form-section-info"><h3 className="ut-form-section-title">Ubicación y cobertura</h3><p className="ut-form-section-subtitle">Barrio y coordenadas geográficas</p></div><span className="ut-form-section-number">02</span></div>
                  <div className="ut-form-grid">
                    <div className="ut-form-field full"><label htmlFor="ut-barrio">Barrio (opcional)</label><select id="ut-barrio" disabled={guardando} value={formulario.barrioId} onChange={(e) => campo("barrioId", e.target.value)}><option value="">Sin barrio asignado</option>{barrios.map((b) => <option key={barrioId(b)} value={barrioId(b)}>{barrioNombre(b)}</option>)}</select></div>
                    <div className="ut-form-field"><label htmlFor="ut-lat">Latitud <span>*</span></label><input id="ut-lat" type="number" step="any" min="-90" max="90" required disabled={guardando} placeholder="10.4631" value={formulario.latitud} onChange={(e) => campo("latitud", e.target.value)} /></div>
                    <div className="ut-form-field"><label htmlFor="ut-lon">Longitud <span>*</span></label><input id="ut-lon" type="number" step="any" min="-180" max="180" required disabled={guardando} placeholder="-73.2532" value={formulario.longitud} onChange={(e) => campo("longitud", e.target.value)} /></div>
                  </div>
                </section>
              </div>
              <div className="ut-form-footer"><span className="ut-form-footer-info"><i className="bi bi-shield-check me-2" />Gestión de unidades</span><div className="ut-form-footer-actions"><button type="button" className="ut-form-cancel" disabled={guardando} onClick={() => setMostrarModal(false)}>Cancelar</button><button type="submit" className="ut-form-submit" disabled={guardando}>{guardando ? "Guardando..." : <><i className={`bi ${editando == null ? "bi-plus-circle" : "bi-check2-circle"} me-2`} />{editando == null ? "Registrar unidad" : "Guardar cambios"}</>}</button></div></div>
            </form>
          </div>
        )}

        {(detalle || cargandoDetalle) && <div className="modal fade show ut-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalle(null); }}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content modal-dash"><div className="modal-header border-0"><h5 className="panel-title-dash mb-0">Integrantes de {detalle?.nombre ?? "la unidad"}</h5><button type="button" className="btn-close" aria-label="Cerrar" onClick={() => { setDetalle(null); setCargandoDetalle(false); }} /></div><div className="modal-body">{cargandoDetalle ? <p>Cargando integrantes...</p> : (detalle?.agentes?.length ? <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Agente</th><th>Placa</th><th>Rango</th><th>Estado</th></tr></thead><tbody>{detalle.agentes.map((a, i) => <tr key={a.idUsuario ?? i}><td>{a.nombreUsuario || "Sin nombre"}</td><td>{a.placa || "—"}</td><td>{a.rango || "—"}</td><td>{a.estadoAgente || "—"}</td></tr>)}</tbody></table></div> : <p className="text-muted mb-0">Esta unidad no tiene agentes asignados.</p>)}</div><div className="modal-footer border-0"><button type="button" className="btn-secundario-dash" onClick={() => setDetalle(null)}>Cerrar</button></div></div></div></div>}
      </div>
    </Layout>
  );
}
