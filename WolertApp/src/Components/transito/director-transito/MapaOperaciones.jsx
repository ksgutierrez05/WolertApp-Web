import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  cargarSemaforosMapa,
  cargarGruposMapa,
  cargarAlertasSemaforosMapa,
} from "../../../Services/mapaTransitoAdapter";
import "../../../css/transito/director-transito/mapas-transito.css";
const CENTRO = [10.4769, -73.2509];
const capasDef = [
  { id: "semaforos", titulo: "Semáforos", icono: "bi-stoplights-fill", color: "#517aac" },
  { id: "grupos", titulo: "Unidades de tránsito", icono: "bi-car-front-fill", color: "#27917b" },
  {
    id: "alertas",
    titulo: "Alertas relacionadas",
    icono: "bi-exclamation-triangle-fill",
    color: "#d94b53",
  },
];
const iconos = Object.fromEntries(
  capasDef.map((c) => [
    c.id,
    L.divIcon({
      className: "sem-marker",
      html: `<div class="sem-pin" style="--pin-color:${c.color}"><i class="bi ${c.icono}"></i></div>`,
      iconSize: [40, 47],
      iconAnchor: [20, 45],
    }),
  ]),
);
function Foco({ posicion }) {
  const mapa = useMap();
  useEffect(() => {
    if (posicion) mapa.flyTo(posicion, 16);
  }, [mapa, posicion]);
  return null;
}
const coords = (p) => {
  const a = Number(p.latitud),
    b = Number(p.longitud);
  return p.latitud != null &&
    p.longitud != null &&
    p.latitud !== "" &&
    p.longitud !== "" &&
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a) <= 90 &&
    Math.abs(b) <= 180
    ? [a, b]
    : null;
};
const id = (tipo, p, i) =>
  `${tipo}-${p.idSemaforo ?? p.idGrupo ?? p.idAlerta ?? i}`;
const nombre = (tipo, p) =>
  tipo === "semaforos"
    ? p.codigo || "Semáforo"
    : tipo === "grupos"
      ? p.nombre || "Unidad de tránsito"
      : p.tipo || "Alerta";
export default function MapaOperaciones({ compacto = false }) {
  const [datos, setDatos] = useState({
    semaforos: [],
    grupos: [],
    alertas: [],
  });
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [visibles, setVisibles] = useState({
    semaforos: true,
    grupos: true,
    alertas: true,
  });
  const [filtros, setFiltros] = useState({
    semaforos: "",
    grupos: "",
    alertas: "",
  });
  const [buscar, setBuscar] = useState("");
  const [posicion, setPosicion] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!document.hidden) {
        setRecarga((valor) => valor + 1);
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);
useEffect(() => {
  let activo = true;

  Promise.allSettled([
    cargarSemaforosMapa(),
    cargarGruposMapa(),
    cargarAlertasSemaforosMapa(),
  ])
    .then((resultados) => {
      if (!activo) return;

      const nombres = ["semaforos", "grupos", "alertas"];
      const nuevo = {};
      const fallos = [];

      resultados.forEach((r, i) => {
        nuevo[nombres[i]] =
          r.status === "fulfilled" && Array.isArray(r.value)
            ? r.value
            : [];

        if (r.status === "rejected") {
          fallos.push(
            `${nombres[i]}: ${r.reason?.message || "No disponible"}`
          );
        }
      });

      setDatos(nuevo);
      setErrores(fallos);
      setCargando(false);
    });

  return () => {
    activo = false;
  };
}, [recarga]);
  const elementos = useMemo(
    () =>
      capasDef.flatMap((c) =>
        visibles[c.id]
          ? datos[c.id]
              .filter((p) => coords(p))
              .filter(
                (p) =>
                  !filtros[c.id] ||
                  String(p.estado || p.prioridad || "").toUpperCase() ===
                    filtros[c.id],
              )
              .filter((p) =>
                JSON.stringify(p).toLowerCase().includes(buscar.toLowerCase()),
              )
              .map((p, i) => ({
                ...p,
                _tipo: c.id,
                _key: id(c.id, p, i),
                _pos: coords(p),
              }))
          : [],
      ),
    [datos, visibles, filtros, buscar],
  );
  return (
      <div className={`sem-ops${compacto ? " sem-ops-compacto" : ""}`}>
        <header className="sem-ops-head">
          <div>
            {!compacto && (
  <div className="sem-ops-eyebrow">
    DIRECCI&Oacute;N DE TR&Aacute;NSITO
  </div>
)}
<h1>Mapa de operaciones</h1>
            <p>Consulta y seguimiento de las operaciones de tránsito</p>
          </div>
          <div className="sem-ops-live">
  <span className="sem-ops-live-dot" />
  {cargando ? "Conectando..." : errores.length ? "Conexion parcial" : "Actualizacion automatica"}
</div>
        </header>

        {!compacto && (
          <div className="sem-ops-summary">
            {capasDef.map((c) => (
              <div
                className="sem-ops-stat"
                key={c.id}
                style={{ "--layer-color": c.color }}
              >
                <div className="sem-ops-stat-icon">
                  <i className={`bi ${c.icono}`} />
                </div>
                <div className="sem-ops-stat-info">
                  <span>{c.titulo}</span>
                  <strong>
                    {cargando ? "..." : datos[c.id].filter((p) => coords(p)).length}
                  </strong>
                  <small>Ubicaciones registradas</small>
                </div>
              </div>
            ))}
          </div>
        )}
        {errores.length > 0 && (
          <p className="sem-ops-error" role="alert">
            No se pudieron cargar algunas capas: {errores.join(" · ")}
          </p>
        )}
        <div className="sem-ops-layout">
          <div className="sem-ops-map">
            <MapContainer center={CENTRO} zoom={13} className="sem-ops-leaflet">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Foco posicion={posicion} />
              {elementos.map((p) => (
                <Marker key={p._key} position={p._pos} icon={iconos[p._tipo]}>
                  <Popup>
                    <strong>{nombre(p._tipo, p)}</strong>
                    <p>
                      {p.direccion ||
                        p.barrioNombre ||
                        p.estado ||
                        "Sin descripción"}
                    </p>
                    <small>{p.estado || p.prioridad || ""}</small>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="sem-ops-leyenda">
              {capasDef.map((c) => (
                <span key={c.id}>
                  <i className={`bi ${c.icono}`} style={{ color: c.color }} /> {c.titulo}
                </span>
              ))}
            </div>
            <span className="sem-ops-count">
              {cargando ? "Cargando ubicaciones..." : `${elementos.length} puntos en el mapa`}
            </span>
          </div>
          {!compacto && <aside className="sem-ops-panel">
            <div className="sem-ops-panel-head">
              <i className="bi bi-layers" />
              <div>
                <strong>Operaciones</strong>
                <small>Capas y elementos registrados</small>
              </div>
            </div>
            <label className="sem-ops-search">
              <i className="bi bi-search" />
              <input
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar en el mapa..."
              />
            </label>
            <div className="sem-ops-section-label">Capas del mapa</div>
<div className="sem-ops-toggles">
              {capasDef.map((c) => (
                <label key={c.id} style={{ "--layer-color": c.color }}>
                  <input
                    type="checkbox"
                    checked={visibles[c.id]}
                    onChange={(e) =>
                      setVisibles((v) => ({ ...v, [c.id]: e.target.checked }))
                    }
                  />
                  <i className={`bi ${c.icono}`} /> {c.titulo}
                </label>
              ))}
            </div>
            <div className="sem-ops-section-label">Filtrar por estado</div>
<div className="sem-ops-filters">
              {capasDef.map((c) => (
                <label key={c.id} style={{ "--layer-color": c.color }}>
                  Estado de {c.titulo.toLowerCase()}
                  <select
                    value={filtros[c.id]}
                    onChange={(e) =>
                      setFiltros((f) => ({ ...f, [c.id]: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    {[
                      ...new Set(
                        datos[c.id]
                          .map((p) =>
                            String(p.estado || p.prioridad || "").toUpperCase(),
                          )
                          .filter(Boolean),
                      ),
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="sem-ops-list">
              {capasDef.map((c) => (
                <section key={c.id}>
                  <h3>
                    <i className={`bi ${c.icono}`} style={{ color: c.color }} /> {c.titulo} (
                    {elementos.filter((p) => p._tipo === c.id).length})
                  </h3>
                  {elementos.filter((p) => p._tipo === c.id).length === 0 ? (
                    <p className="sem-ops-empty">Sin registros disponibles</p>
                  ) : (
                    elementos
                      .filter((p) => p._tipo === c.id)
                      .map((p) => (
                        <button
                          type="button"
                          key={p._key}
                          onClick={() => setPosicion(p._pos)}
                        >
                          <strong>{nombre(c.id, p)}</strong>
                          <small>
                            {p.direccion ||
                              p.barrioNombre ||
                              p.estado ||
                              "Ver ubicación"}
                          </small>
                        </button>
                      ))
                  )}
                </section>
              ))}
            </div>
          </aside>}
        </div>
      </div>
  );
}
