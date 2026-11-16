import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/reportar-emergencia.css';
import { crearAlerta } from '../../../Service/AlertasAPI.js';
import { listarTiposAlerta } from '../../../Service/TipoAlertasAPI.js';

const API = 'http://localhost:5000';
const CENTRO_INICIAL = [10.4731, -73.2446]; // Valledupar

// Token público de Mapbox (empieza con pk.). Va en el archivo .env: VITE_MAPBOX_TOKEN=pk.xxxxx
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const estiloMapbox = (id) =>
  `https://api.mapbox.com/styles/v1/mapbox/${id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
const ATRIB_MAPBOX =
  '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// IMPORTANTE: pon aquí el IdTipoAlerta real de cada tipo (tabla TiposAlerta de tu BD).
// Mientras estén en null, el botón de pánico avisará que falta configurarlos.
const TIPOS_CONFIG = [
  {
    clave: 'robo',
    nombre: 'Robo / Asalto',
    nombreBD: 'Robo',
    icono: 'bi-person-x-fill',
    color: '#e5484d',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'sospechoso',
    nombre: 'Persona sospechosa',
    nombreBD: 'Persona sospechosa',
    icono: 'bi-person-badge-fill',
    color: '#1f9d5b',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'ruido',
    nombre: 'Ruido / Alteración',
    nombreBD: 'Ruido excesivo',
    icono: 'bi-volume-up-fill',
    color: '#e08a1e',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'incendio',
    nombre: 'Incendio',
    nombreBD: 'Incendio',
    icono: 'bi-fire',
    color: '#e5484d',
    tituloSubtipo: 'Tipo de incendio',
    subtipos: [
      { nombre: 'Vivienda', icono: 'bi-house-fill', color: '#e5484d' },
      { nombre: 'Vehículo', icono: 'bi-car-front-fill', color: '#f08a24' },
      { nombre: 'Zona verde', icono: 'bi-tree-fill', color: '#1f9d5b' },
      { nombre: 'Local comercial', icono: 'bi-shop', color: '#d9772b' }
    ],
    pregunta: 'Hay personas atrapadas'
  },
  {
    clave: 'medica',
    nombre: 'Emergencia médica',
    nombreBD: 'Emergencia médica',
    icono: 'bi-plus-lg',
    color: '#1f9d5b',
    tituloSubtipo: 'Tipo de emergencia',
    subtipos: [
      { nombre: 'Dolor en el pecho', icono: 'bi-heart-pulse-fill', color: '#e5484d' },
      { nombre: 'Caída o golpe', icono: 'bi-bandaid-fill', color: '#f08a24' },
      { nombre: 'Dificultad para respirar', icono: 'bi-lungs-fill', color: '#2563c9' },
      { nombre: 'Otra', icono: 'bi-three-dots', color: '#6b7a90' }
    ],
    pregunta: 'La persona está inconsciente'
  },
  {
    clave: 'accidente',
    nombre: 'Accidente',
    nombreBD: 'Accidente de tránsito',
    icono: 'bi-exclamation-triangle-fill',
    color: '#2563c9',
    tituloSubtipo: 'Tipo de accidente',
    subtipos: [
      { nombre: 'Choque', icono: 'bi-car-front-fill', color: '#f08a24' },
      { nombre: 'Atropello', icono: 'bi-person-walking', color: '#e5484d' },
      { nombre: 'Volcamiento', icono: 'bi-truck', color: '#2563c9' },
      { nombre: 'Moto', icono: 'bi-bicycle', color: '#1f9d5b' }
    ],
    pregunta: 'Hay heridos'
  }
];

// Pin dibujado con SVG: evita el problema de los iconos por defecto de Leaflet con Vite
const iconoPin = L.divIcon({
  className: 're-pin',
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1C8.2 1 1 8 1 16.7 1 28 17 43 17 43s16-15 16-26.300C33 8 25.800 1 17 1z" fill="#d92d20" stroke="#fff" stroke-width="2"/>
    <circle cx="17" cy="16.500" r="5.500" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

async function listarBarrios() {
  const r = await fetch(`${API}/api/barrios`);
  if (!r.ok) throw new Error('No se pudieron cargar los barrios');
  return r.json();
}

function ClickMapa({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

function Volar({ destino }) {
  const map = useMap();
  useEffect(() => {
    if (destino) map.flyTo([destino.lat, destino.lng], Math.max(map.getZoom(), 16));
  }, [destino, map]);
  return null;
}

const obtenerUbicacion = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error('Tu navegador no soporta geolocalización.'));
  navigator.geolocation.getCurrentPosition(
    (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
    (e) => reject(new Error(e.code === 1
      ? 'Permiso de ubicación denegado. Marca el punto en el mapa.'
      : 'No se pudo obtener tu ubicación. Marca el punto en el mapa.')),
    { enableHighAccuracy: true, timeout: 10000 },
  );
});

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function ReportarEmergencia() {
  const [tipo, setTipo] = useState(null);
  const [subtipo, setSubtipo] = useState('');
  const [extra, setExtra] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [barrios, setBarrios] = useState([]);
  const [barrioId, setBarrioId] = useState('');
  const [pos, setPos] = useState(null);       // { lat, lng }
  const [volarA, setVolarA] = useState(null); // solo cuando se usa el GPS
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [enviada, setEnviada] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState('');

  useEffect(() => {
    listarBarrios().then(setBarrios).catch(() => setBarrios([]));
  }, []);

  useEffect(() => {
  async function cargarTipos() {
    try {
      setCargandoTipos(true);
      setErrorTipos('');

      const datos = await listarTiposAlerta();

      const tiposRelacionados = TIPOS_CONFIG.map(tipo => {
        const encontrado = datos.find(bd =>
          normalizar(bd.nombre ?? bd.Nombre) === normalizar(tipo.nombreBD)
        );

        return {
          ...tipo,
          tipoAlertaId: encontrado
            ? Number(encontrado.idTipoAlerta ?? encontrado.IdTipoAlerta)
            : null
        };
      });

      setTipos(tiposRelacionados);

    } catch (error) {
      console.error('Error cargando tipos de alerta:', error);
      setErrorTipos('No se pudieron cargar los tipos de alerta.');
    } finally {
      setCargandoTipos(false);
    }
  }

  cargarTipos();
}, []);

  const barrioNombre = useMemo(
    () => barrios.find((b) => String(b.idBarrio) === String(barrioId))?.nombre || '',
    [barrios, barrioId],
  );

  const elegirTipo = (t) => {
    setTipo(t);
    setSubtipo('');
    setExtra(false);
    setError('');
  };

  const usarMiUbicacion = async () => {
    try {
      setError('');
      const u = await obtenerUbicacion();
      setPos(u);
      setVolarA(u);
    } catch (err) {
      setError(err.message);
    }
  };

  const reiniciar = () => {
    setEnviada(false);
    setTipo(null);
    setSubtipo('');
    setExtra(false);
    setDescripcion('');
    setBarrioId('');
    setPos(null);
    setError('');
  };

  const enviar = async () => {
    setError('');
    if (!pos) { setError('Marca la ubicación en el mapa.'); return; }
    if (!tipo || !Number.isInteger(tipo.tipoAlertaId) || tipo.tipoAlertaId <= 0) {
      setError('El tipo de alerta no tiene un identificador válido.');
      return;
    }

    // El backend solo guarda una descripción de texto: aquí se arma con los detalles elegidos
    const partes = [tipo.nombre];
    if (subtipo) partes.push(subtipo);
    if (extra && tipo.pregunta) partes.push(tipo.pregunta);
    if (barrioNombre) partes.push(`Barrio indicado: ${barrioNombre}`);
    if (descripcion.trim()) partes.push(descripcion.trim());

    try {
      setEnviando(true);
      await crearAlerta({
        tipoAlertaId: tipo.tipoAlertaId,
        descripcion: partes.join('. ').slice(0, 500),
        latitud: Number(pos.lat.toFixed(6)),
        longitud: Number(pos.lng.toFixed(6)),
      });
      setEnviada(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar la alerta.');
    } finally {
      setEnviando(false);
    }
  };

  const mensajeCabecera = pos
    ? 'Ubicación marcada: completa el formulario y pulsa el botón de pánico'
    : 'Marca el punto en el mapa o usa tu ubicación actual';

  return (
    <div className="re-pagina">
      <header className="re-cabecera">
        <div className="re-marca">
          <strong>WolertApp</strong>
        </div>
        <span className={`re-estado ${pos ? 're-estado-ok' : ''}`}>{mensajeCabecera}</span>
      </header>

      <div className="re-cuerpo">
        <div className="re-mapa">
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
            <ClickMapa onPick={setPos} />
            <Volar destino={volarA} />
            {pos && (
              <Marker
                position={[pos.lat, pos.lng]}
                icon={iconoPin}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setPos({ lat, lng });
                  },
                }}
              />
            )}
          </MapContainer>
          {pos && (
            <div className="re-chip-coords">
              <i className="bi bi-geo-alt-fill" /> {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </div>
          )}
          <button type="button" className="re-btn-gps" onClick={usarMiUbicacion}>
            <i className="bi bi-crosshair" /> Usar mi ubicación
          </button>
        </div>

        <aside className="re-panel">
          <div className="re-panel-titulo">
            <span className="re-icono-campana"><i className="bi bi-bell-fill" /></span>
            <div>
              <h1>Reportar emergencia</h1>
              <p>Marca el mapa, elige el tipo y pulsa el botón de pánico</p>
            </div>
          </div>

          {tipo && (
            <div className="re-panel-scroll">
              <div className="re-tipo-actual">
                <span className="re-tipo-icono" style={{ background: tipo.color }}><i className={`bi ${tipo.icono}`} /></span>
                <strong>{tipo.nombre}</strong>
                <button type="button" className="re-link" onClick={() => setTipo(null)}>Cambiar tipo</button>
              </div>

              {tipo.subtipos.length > 0 && (
                <section className="re-caja">
                  <h2>{tipo.tituloSubtipo}</h2>
                  <div className="re-subtipos">
                    {tipo.subtipos.map((s) => (
                      <button
                        key={s.nombre}
                        type="button"
                        className={`re-subtipo ${subtipo === s.nombre ? 'activo' : ''}`}
                        onClick={() => setSubtipo(s.nombre)}
                        aria-pressed={subtipo === s.nombre}
                      >
                        <span className="re-subtipo-icono" style={{ background: s.color }}><i className={`bi ${s.icono}`} /></span>
                        {s.nombre}
                      </button>
                    ))}
                  </div>
                  {tipo.pregunta && (
                    <label className="re-switch">
                      <input type="checkbox" checked={extra} onChange={(e) => setExtra(e.target.checked)} />
                      <span className="re-switch-pista" />
                      <span>{tipo.pregunta}</span>
                    </label>
                  )}
                </section>
              )}

              <label className="re-campo">
                <span><i className="bi bi-pencil-fill" /> Descripción del incidente</span>
                <textarea
                  rows={3}
                  maxLength={400}
                  placeholder="Describe brevemente la emergencia..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </label>

              <label className="re-campo">
                <span>Barrio del incidente</span>
                <select value={barrioId} onChange={(e) => setBarrioId(e.target.value)}>
                  <option value="">Seleccionar barrio</option>
                  {barrios.map((b) => (
                    <option key={b.idBarrio} value={b.idBarrio}>{b.nombre}</option>
                  ))}
                </select>
              </label>

              <div className="re-coords-caja">
                <i className="bi bi-pin-map-fill" />
                <div>
                  <strong>Coordenadas del incidente</strong>
                  <span>{pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Aún sin marcar'}</span>
                </div>
              </div>

              {error && <div className="re-error" role="alert">{error}</div>}

              <button type="button" className="re-panico" onClick={enviar} disabled={enviando}>
                <i className="bi bi-shield-fill-exclamation" />
                {enviando ? 'Enviando alerta...' : 'Enviar alerta'}
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Paso 1: elegir el tipo de emergencia */}
      {!tipo && !enviada && (
        <div className="re-fondo" role="dialog" aria-modal="true" aria-labelledby="re-titulo-tipo">
          <div className="re-modal re-modal-tipos">
            <h2 id="re-titulo-tipo">¿Qué tipo de emergencia tienes?</h2>
            <div className="re-boton-grande" aria-hidden="true">
              <i className="bi bi-shield-fill-exclamation" />
            </div>
            <div className="re-grilla-tipos">
              {tipos.map((t) => (
                <button
                  key={t.clave}
                  type="button"
                  className="re-tipo-card"
                  onClick={() => elegirTipo(t)}
                  disabled={t.tipoAlertaId == null || cargandoTipos}
                >
                  <i
                    className={`bi ${t.icono}`}
                    style={{ color: t.color }}
                  />
                  {t.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {enviada && (
        <div className="re-fondo" role="dialog" aria-modal="true" aria-labelledby="re-titulo-ok">
          <div className="re-modal re-modal-ok">
            <i className="bi bi-check-circle-fill re-ok-icono" />
            <h2 id="re-titulo-ok">Tu alerta fue registrada</h2>
            <p>Mantente en un lugar seguro. Las autoridades pueden ver tu ubicación en el mapa.</p>
            <button type="button" className="re-btn-oscuro" onClick={reiniciar}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}