import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/mapa-alertas.css';
import { listarAlertasPorAlcance } from '../../../Services/AlertasAPI.js';

const CENTRO_INICIAL = [10.4731, -73.2446]; // Valledupar
const REFRESCO_MS = 15000; // cada cuánto se vuelven a pedir las alertas

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const estiloMapbox = (id) =>
  `https://api.mapbox.com/styles/v1/mapbox/${id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
const ATRIB_MAPBOX =
  '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const COLOR_PRIORIDAD = { alta: '#d92d20', media: '#f08a24', baja: '#1f9d5b' };
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', en_atencion: 'En atención', cerrada: 'Cerrada' };
const ALCANCES = [
  { valor: 'todas', texto: 'Toda la ciudad' },
  { valor: 'comuna', texto: 'Mi comuna' },
  { valor: 'barrio', texto: 'Mi barrio' },
];

// El backend guarda la fecha en UTC pero puede enviarla sin la "Z": se la agregamos
const aFecha = (f) => new Date(/Z$|[+-]\d\d:\d\d$/.test(f) ? f : `${f}Z`);
const formatoFecha = (f) =>
  aFecha(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// Un ícono por combinación prioridad + estado (se reutilizan, no se recrean en cada render)
const cacheIconos = {};
function iconoAlerta(prioridad, estado) {
  const clave = `${prioridad}-${estado}`;
  if (!cacheIconos[clave]) {
    const color = COLOR_PRIORIDAD[prioridad] || '#6b7a90';
    cacheIconos[clave] = L.divIcon({
      className: 'ma-icono',
      html: `<span class="ma-pin ma-pin-${estado} ma-prio-${prioridad}" style="background:${color}"></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  }
  return cacheIconos[clave];
}

// Encuadra el mapa sobre las alertas la primera vez que llegan (y cada vez que cambia el alcance)
function AjustarVista({ puntos }) {
  const map = useMap();
  const [hecho, setHecho] = useState(false);
  useEffect(() => {
    if (hecho || puntos.length === 0) return;
    map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])), { padding: [60, 60], maxZoom: 16 });
    setHecho(true);
  }, [puntos, hecho, map]);
  return null;
}

export default function MapaAlertas() {
  const [alcance, setAlcance] = useState('todas');
  const [mostrarCerradas, setMostrarCerradas] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizada, setActualizada] = useState(null);

  const cargar = useCallback(async (mostrarCarga) => {
    if (mostrarCarga) setCargando(true);
    try {
      const datos = await listarAlertasPorAlcance(alcance);
      setAlertas(datos);
      setActualizada(new Date());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las alertas.');
    } finally {
      setCargando(false);
    }
  }, [alcance]);

  // Carga inicial + actualización automática (se pausa si la pestaña está oculta)
  useEffect(() => {
    cargar(true);
    const id = setInterval(() => {
      if (!document.hidden) cargar(false);
    }, REFRESCO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  // Solo se pueden dibujar las alertas que traen coordenadas
  const puntos = useMemo(
    () => alertas
      .filter((a) => a.latitud != null && a.longitud != null)
      .filter((a) => mostrarCerradas || a.estado !== 'cerrada')
      .map((a) => ({ ...a, lat: Number(a.latitud), lng: Number(a.longitud) })),
    [alertas, mostrarCerradas],
  );

  const sinCoordenadas = alertas.filter((a) => a.latitud == null || a.longitud == null).length;
  const pendientes = alertas.filter((a) => a.estado === 'pendiente').length;

  return (
    <div className="ma-pagina">
      <div className="ma-barra">
        <div className="ma-barra-grupo">
          <label className="ma-campo">
            <span>Alcance</span>
            <select value={alcance} onChange={(e) => setAlcance(e.target.value)}>
              {ALCANCES.map((a) => (
                <option key={a.valor} value={a.valor}>{a.texto}</option>
              ))}
            </select>
          </label>
          <label className="ma-check">
            <input
              type="checkbox"
              checked={mostrarCerradas}
              onChange={(e) => setMostrarCerradas(e.target.checked)}
            />
            Mostrar cerradas
          </label>
        </div>

        <div className="ma-barra-grupo ma-barra-info">
          <span className="ma-dato"><strong>{puntos.length}</strong> en el mapa</span>
          <span className="ma-dato"><strong>{pendientes}</strong> pendientes</span>
          {actualizada && (
            <span className="ma-actualizada">
              Actualizado {actualizada.toLocaleTimeString('es-CO')}
            </span>
          )}
          <button type="button" className="ma-btn" onClick={() => cargar(true)} disabled={cargando}>
            <i className="bi bi-arrow-clockwise" /> {cargando ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && <div className="ma-error" role="alert">{error}</div>}
      {!error && !cargando && sinCoordenadas > 0 && (
        <div className="ma-aviso">
          {sinCoordenadas} alerta(s) no se muestran porque no tienen ubicación.
        </div>
      )}

      <div className="ma-mapa">
        <MapContainer center={CENTRO_INICIAL} zoom={13} style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Calles">
              <TileLayer url={estiloMapbox('streets-v12')} tileSize={512} zoomOffset={-1} maxZoom={19} attribution={ATRIB_MAPBOX} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Claro">
              <TileLayer url={estiloMapbox('light-v11')} tileSize={512} zoomOffset={-1} maxZoom={19} attribution={ATRIB_MAPBOX} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Oscuro">
              <TileLayer url={estiloMapbox('dark-v11')} tileSize={512} zoomOffset={-1} maxZoom={19} attribution={ATRIB_MAPBOX} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satélite">
              <TileLayer url={estiloMapbox('satellite-streets-v12')} tileSize={512} zoomOffset={-1} maxZoom={19} attribution={ATRIB_MAPBOX} />
            </LayersControl.BaseLayer>
          </LayersControl>

          <AjustarVista key={alcance} puntos={puntos} />

          {puntos.map((a) => (
            <Marker key={a.idAlerta} position={[a.lat, a.lng]} icon={iconoAlerta(a.prioridad, a.estado)}>
              <Popup>
                <div className="ma-popup">
                  <div className="ma-popup-cab">
                    <strong>{a.tipo}</strong>
                    <span className={`ma-etiqueta ma-etiqueta-${a.prioridad}`}>{a.prioridad}</span>
                  </div>
                  <div className="ma-popup-estado">{ETIQUETA_ESTADO[a.estado] || a.estado}</div>
                  {a.descripcion && <p className="ma-popup-desc">{a.descripcion}</p>}
                  <ul className="ma-popup-datos">
                    <li><i className="bi bi-person-fill" /> {a.reportadoPor}</li>
                    {a.barrioNombre && <li><i className="bi bi-geo-alt-fill" /> {a.barrioNombre}</li>}
                    <li><i className="bi bi-clock-fill" /> {formatoFecha(a.fecha)}</li>
                  </ul>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="ma-leyenda">
          <strong>Prioridad</strong>
          <span><i style={{ background: COLOR_PRIORIDAD.alta }} /> Alta</span>
          <span><i style={{ background: COLOR_PRIORIDAD.media }} /> Media</span>
          <span><i style={{ background: COLOR_PRIORIDAD.baja }} /> Baja</span>
        </div>
      </div>
    </div>
  );
}
