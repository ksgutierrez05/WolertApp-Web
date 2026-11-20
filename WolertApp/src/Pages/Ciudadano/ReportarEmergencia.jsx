import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, LayersControl, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/ciudadano/reportar-emergencia.css';
import { crearAlerta } from '../../Services/AlertasAPI.js';
import { listarTiposAlerta } from '../../Services/TipoAlertasAPI.js';

const CENTRO_INICIAL = [10.4731, -73.2446]; // Valledupar

// Token público de Mapbox (empieza con pk.). Va en el archivo .env: VITE_MAPBOX_TOKEN=pk.xxxxx
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const estiloMapbox = (id) =>
  `https://api.mapbox.com/styles/v1/mapbox/${id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
const ATRIB_MAPBOX =
  '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Los "nombreBD" deben coincidir con la columna NOMBRE de la tabla TiposAlerta
// del backend (se comparan sin importar mayúsculas, tildes ni guiones bajos).
// Si no coinciden, el tipo aparece deshabilitado.
const TIPOS_CONFIG = [
  {
    clave: 'robo',
    nombre: 'Robo / Asalto',
    nombreBD: 'ROBO',
    icono: 'bi-person-x-fill',
    color: '#e5484d',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'sospechoso',
    nombre: 'Persona sospechosa',
    nombreBD: 'PERSONA_SOSPECHOSA',
    icono: 'bi-person-badge-fill',
    color: '#1f9d5b',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'ruido',
    nombre: 'Ruido / Alteración',
    nombreBD: 'RUIDO',
    icono: 'bi-volume-up-fill',
    color: '#e08a1e',
    subtipos: [],
    pregunta: null
  },
  {
    clave: 'incendio',
    nombre: 'Incendio',
    nombreBD: 'INCENDIO',
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
    nombreBD: 'EMERGENCIA_MEDICA',
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
    nombreBD: 'ACCIDENTE',
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
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export default function ReportarEmergencia({ onClose }) {
  const navigate = useNavigate();
  const volverAMenuPrincipal = () => navigate('/ciudadano');

  const [tipo, setTipo] = useState(null);
  const [subtipo, setSubtipo] = useState('');
  const [extra, setExtra] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [pos, setPos] = useState(null);       // { lat, lng }
  const [volarA, setVolarA] = useState(null); // solo cuando se usa el GPS
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [enviada, setEnviada] = useState(false);
  const [tipos, setTipos] = useState(() =>
    TIPOS_CONFIG.map((t) => ({ ...t, tipoAlertaId: null }))
  );
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState('');

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
      setErrorTipos('No se pudieron cargar los tipos de alerta. Verifica que el backend esté encendido y vuelve a intentarlo.');
    } finally {
      setCargandoTipos(false);
    }
  }

  useEffect(() => {
    cargarTipos();
  }, []);

  const elegirTipo = (t) => {
    setTipo(t);
    setSubtipo('');
    setExtra(false);
    setError('');
    setMostrarMapa(false);
    // La ubicación del usuario se toma nada más elegir el tipo
    usarMiUbicacion();
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

  // Obtener la ubicación automáticamente al abrir el reporte
  useEffect(() => {
    usarMiUbicacion();
  }, []);

  const reiniciar = () => {
    setEnviada(false);
    setTipo(null);
    setSubtipo('');
    setExtra(false);
    setDescripcion('');
    setPos(null);
    setError('');
    setMostrarMapa(false);
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
      setMostrarMapa(false);
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
    <div className="re-modal-fondo" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="re-titulo-modal">
      <div className="re-modal-contenedor" onClick={(e) => e.stopPropagation()}>
        <div className="re-modal-cabecera">
          <h2 id="re-titulo-modal">Reportar emergencia</h2>
          <button type="button" className="re-modal-volver" onClick={volverAMenuPrincipal}>
            Volver al menú principal
          </button>
        </div>

        <div className="re-modal-cuerpo">
          {!tipo && !enviada ? (
            <div className="re-paso-tipo">
              <div className="re-seleccion-tipo">
                <h2>¿Qué tipo de emergencia tienes?</h2>
                {errorTipos && (
                  <p className="re-error" role="alert">
                    {errorTipos}{' '}
                    <button type="button" className="re-btn-oscuro" onClick={cargarTipos}>
                      Reintentar
                    </button>
                  </p>
                )}
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
          ) : (
            <div className={`re-contenido-tipo-mapa ${mostrarMapa ? '' : 're-sin-mapa'}`}>
              {mostrarMapa && (
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
              )}

              <aside className="re-panel">
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

                <div className="re-coords-caja">
                  <i className="bi bi-pin-map-fill" />
                  <div>
                    <strong>Coordenadas del incidente</strong>
                    <span>{pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Aún sin marcar'}</span>
                  </div>
                </div>

                {error && <div className="re-error" role="alert">{error}</div>}

                <div className="re-acciones">
                  {mostrarMapa ? (
                    <>
                      <button type="button" className="re-btn-manual" onClick={() => setMostrarMapa(false)}>
                        <i className="bi bi-arrow-left" /> Volver a la alerta directa
                      </button>
                      <button type="button" className="re-panico" onClick={enviar} disabled={enviando}>
                        <i className="bi bi-shield-fill-exclamation" />
                        {enviando ? 'Enviando alerta...' : 'Enviar alerta'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="re-btn-manual" onClick={() => setMostrarMapa(true)}>
                        <i className="bi bi-map" /> Seleccionar ubicación en el mapa
                      </button>
                      <button type="button" className="re-btn-ubicacion" onClick={usarMiUbicacion} disabled={enviando}>
                        <i className="bi bi-crosshair" /> Usar mi ubicación
                      </button>
                      <button type="button" className="re-panico" onClick={enviar} disabled={enviando}>
                        <i className="bi bi-shield-fill-exclamation" />
                        {enviando ? 'Enviando alerta...' : 'Enviar alerta'}
                      </button>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>

        {/* Resultado */}
        {enviada && (
          <div className="re-modal-ok">
            <i className="bi bi-check-circle-fill re-ok-icono" />
            <h2 id="re-titulo-ok">Tu alerta fue registrada</h2>
            <p>Mantente en un lugar seguro. Las autoridades pueden ver tu ubicación en el mapa.</p>
            <button type="button" className="re-btn-oscuro" onClick={reiniciar}>Entendido</button>
          </div>
        )}
      </div>
    </div>
  );
}
