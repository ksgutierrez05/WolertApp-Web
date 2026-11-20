import { useEffect, useMemo, useState } from "react";
import "../../css/admin/tipos.css";
import { listarTiposAlerta } from "../../Services/TipoAlertasAPI";
import { ListarTiposArma } from "../../Services/TiposArmaAPI";
import { ListarMediosTransporte } from "../../Services/MediosTransporteAPI";

const TABS = [
  { id: "alerta", label: "Tipos de alerta", short: "Alertas", icon: "bi-bell-fill", description: "Clasificaciones para reportes ciudadanos" },
  { id: "arma", label: "Tipos de arma", short: "Armas", icon: "bi-shield-exclamation", description: "Categorías registradas de armas" },
  { id: "transporte", label: "Medios de transporte", short: "Transporte", icon: "bi-truck-front-fill", description: "Medios asociados a los reportes" },
];

function nombreDe(item) { return item?.nombre ?? item?.descripcion ?? item?.medio ?? item?.Nombre ?? item?.Descripcion ?? "Sin nombre"; }
function idDe(item, tab) {
  if (tab === "alerta") return item?.idTipoAlerta ?? item?.id ?? item?.IdTipoAlerta;
  if (tab === "arma") return item?.idTipoArma ?? item?.id ?? item?.IdTipoArma;
  return item?.idMedioTransporte ?? item?.id ?? item?.IdMedioTransporte;
}

export default function Tipos() {
  const [tab, setTab] = useState("alerta");
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const seleccion = TABS.find((item) => item.id === tab);

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true); setError("");
    const promesa = tab === "alerta" ? listarTiposAlerta() : tab === "arma" ? ListarTiposArma() : ListarMediosTransporte();
    promesa.then((lista) => {
      if (controlador.signal.aborted) return;
      if (!Array.isArray(lista)) throw new Error("La API no devolvió una lista válida.");
      setDatos(lista);
    }).catch((err) => {
      if (!controlador.signal.aborted) { setError(err.message || "No se pudieron cargar los datos."); setDatos([]); }
    }).finally(() => { if (!controlador.signal.aborted) setCargando(false); });
    return () => controlador.abort();
  }, [tab, recarga]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-CO");
    if (!texto) return datos;
    return datos.filter((item) => Object.values(item ?? {}).some((v) => String(v ?? "").toLocaleLowerCase("es-CO").includes(texto)));
  }, [datos, busqueda]);

  return <main className="types-page">
    <header className="types-hero">
      <div><span className="types-eyebrow"><i className="bi bi-collection-fill" /> CATÁLOGOS DEL SISTEMA</span><h1>Tipos y categorías</h1><p>Consulta las clasificaciones que organizan los reportes y recursos del sistema.</p></div>
      <div className="types-hero-count"><span>Registros en esta categoría</span><strong>{cargando ? "—" : datos.length.toLocaleString("es-CO")}</strong><small>{seleccion?.label}</small></div>
    </header>

    <nav className="types-tabs" aria-label="Categorías de tipos">
      {TABS.map((item) => <button key={item.id} type="button" className={`types-tab ${tab === item.id ? "is-active" : ""}`} onClick={() => { setTab(item.id); setBusqueda(""); }} aria-pressed={tab === item.id}>
        <span className="types-tab__icon"><i className={`bi ${item.icon}`} /></span><span className="types-tab__text"><b>{item.label}</b><small>{item.description}</small></span><span className="types-tab__arrow"><i className="bi bi-chevron-right" /></span>
      </button>)}
    </nav>

    <section className="types-content">
      <div className="types-toolbar"><div className="types-toolbar__title"><div className="types-section-icon"><i className={`bi ${seleccion?.icon}`} /></div><div><h2>{seleccion?.label}</h2><p>{seleccion?.description}</p></div></div>
        <div className="types-toolbar__actions"><label className="types-search"><i className="bi bi-search" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o código" aria-label="Buscar en la categoría actual" />{busqueda && <button type="button" onClick={() => setBusqueda("")} aria-label="Limpiar búsqueda"><i className="bi bi-x-lg" /></button>}</label><button className="types-refresh" type="button" disabled={cargando} onClick={() => setRecarga((n) => n + 1)}><i className={`bi bi-arrow-clockwise ${cargando ? "types-spin" : ""}`} /><span>Actualizar</span></button></div>
      </div>

      {error && <div className="types-error" role="alert"><i className="bi bi-exclamation-triangle-fill" /><span>{error}</span><button type="button" onClick={() => setRecarga((n) => n + 1)}>Reintentar</button></div>}
      <div className="types-table-wrap"><table className="types-table"><thead><tr><th>Nombre</th><th>Código de referencia</th></tr></thead><tbody>
        {!cargando && !error && filtrados.map((item, index) => <tr key={idDe(item, tab) ?? `${nombreDe(item)}-${index}`}><td><div className="types-name"><span className="types-row-icon"><i className={`bi ${seleccion?.icon}`} /></span><strong>{nombreDe(item)}</strong></div></td><td><span className="types-code">{idDe(item, tab) ?? "—"}</span></td></tr>)}
      </tbody></table>
      {cargando && <div className="types-state"><span className="types-loader" /><b>Cargando categoría</b><small>Consultando los registros disponibles…</small></div>}
      {!cargando && !error && filtrados.length === 0 && <div className="types-state"><span className="types-empty-icon"><i className={`bi ${busqueda ? "bi-search" : "bi-inbox"}`} /></span><b>{busqueda ? "No encontramos coincidencias" : "Esta categoría aún no tiene registros"}</b><small>{busqueda ? "Prueba con otro nombre o código." : "Cuando existan registros, aparecerán en esta tabla."}</small></div>}
      </div>
      <footer className="types-table-footer"><span>Mostrando <b>{filtrados.length.toLocaleString("es-CO")}</b> de <b>{datos.length.toLocaleString("es-CO")}</b> registros</span><span><i className="bi bi-database-check" /> Catálogo actualizado desde el sistema</span></footer>
    </section>
  </main>;
}
