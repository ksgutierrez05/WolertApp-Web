import { useEffect, useMemo, useState } from 'react';
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

const prioridadOrden = { ALTA: 0, MEDIA: 1, BAJA: 2 };
const colorPrioridad = { ALTA: '#d92d20', MEDIA: '#c17b16', BAJA: '#168a4f' };

const prioridadDe = (tipo) =>
  String(tipo?.prioridad ?? tipo?.Prioridad ?? 'SIN PRIORIDAD').toUpperCase();
const centralDe = (tipo) =>
  String(tipo?.centralResponsable ?? tipo?.CentralResponsable ?? '').toUpperCase();
const nombreDe = (tipo) =>
  String(tipo?.nombre ?? tipo?.Nombre ?? 'Tipo de alerta')
    .replaceAll('_', ' ')
    .trim();

function etiquetaCentral(tipo) {
  const central = centralDe(tipo);
  if (central === 'POLICIA') return 'Policía';
  if (central === 'TRANSITO') return 'Tránsito';
  return central || 'Central sin asignar';
}

function iconoDe(tipo) {
  const nombre = normalizar(nombreDe(tipo));
  if (/incendio|fuego/.test(nombre)) return 'bi-fire';
  if (/medic|salud|herid|accidente/.test(nombre)) return 'bi-heart-pulse-fill';
  if (/robo|hurto|asalto/.test(nombre)) return 'bi-person-fill-lock';
  if (/transito|vehicul|movilidad/.test(nombre)) return 'bi-car-front-fill';
  if (/ruido/.test(nombre)) return 'bi-volume-up-fill';
  if (/arma|violencia|amenaza/.test(nombre)) return 'bi-shield-exclamation';
  if (/sospech/.test(nombre)) return 'bi-person-badge-fill';
  return 'bi-exclamation-diamond-fill';
}

export default function ReportarEmergencia({ onClose }) {
  const navigate = useNavigate();
  const volverAMenuPrincipal = () => navigate('/ciudadano');

  const [tipo, setTipo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [pos, setPos] = useState(null);
  const [volarA, setVolarA] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [referenciaAlerta, setReferenciaAlerta] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState('');
  const [busquedaTipo, setBusquedaTipo] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS');
  const [ubicacionCargando, setUbicacionCargando] = useState(true);

  async function cargarTipos(signal) {
    try {
      setCargandoTipos(true);
      setErrorTipos('');

      const datos = await listarTiposAlerta(signal);
      if (signal?.aborted) return;

      const tiposValidos = datos
        .map((registro) => ({
          ...registro,
          nombre: nombreDe(registro),
          tipoAlertaId: Number(
            registro.idTipoAlerta ?? registro.IdTipoAlerta ?? registro.id
          ),
        }))
        .filter((registro) =>
          Number.isInteger(registro.tipoAlertaId) && registro.tipoAlertaId > 0
        )
        .sort((a, b) => {
          const ordenA = prioridadOrden[prioridadDe(a)] ?? 3;
          const ordenB = prioridadOrden[prioridadDe(b)] ?? 3;
          return ordenA - ordenB || a.nombre.localeCompare(b.nombre, 'es-CO');
        });

      setTipos(tiposValidos);
    } catch (err) {
      if (!signal?.aborted) {
        console.error('Error cargando tipos de alerta:', err);
        setErrorTipos('No se pudieron cargar los tipos de alerta. Verifica que el backend esté encendido y vuelve a intentarlo.');
      }
    } finally {
      if (!signal?.aborted) setCargandoTipos(false);
    }
  }

  useEffect(() => {
    const controlador = new AbortController();
    cargarTipos(controlador.signal);
    return () => controlador.abort();
  }, []);

  const usarMiUbicacion = async () => {
    try {
      setUbicacionCargando(true);
      setError('');
      const ubicacion = await obtenerUbicacion();
      setPos(ubicacion);
      setVolarA(ubicacion);
    } catch (err) {
      setError(err.message);
    } finally {
      setUbicacionCargando(false);
    }
  };

  useEffect(() => {
    usarMiUbicacion();
  }, []);

  const elegirTipo = (seleccionado) => {
    setTipo(seleccionado);
    setError('');
    setMostrarMapa(false);
  };

  const tiposVisibles = useMemo(() => {
    const consulta = normalizar(busquedaTipo);
    return tipos.filter((registro) => {
      const coincideConsulta = !consulta || normalizar([
        nombreDe(registro),
        centralDe(registro),
        prioridadDe(registro),
        registro.tipoAlertaId,
      ].join(' ')).includes(consulta);
      const coincidePrioridad = filtroPrioridad === 'TODAS'
        || prioridadDe(registro) === filtroPrioridad;
      return coincideConsulta && coincidePrioridad;
    });
  }, [tipos, busquedaTipo, filtroPrioridad]);

  const reiniciar = () => {
    setResultado(null);
    setReferenciaAlerta(null);
    setTipo(null);
    setDescripcion('');
    setPos(null);
    setError('');
    setMostrarMapa(false);
    setBusquedaTipo('');
    setFiltroPrioridad('TODAS');
    usarMiUbicacion();
  };

  const enviar = async () => {
    setError('');
    if (!pos) { setError('Marca la ubicación en el mapa.'); return; }
    if (!tipo || !Number.isInteger(tipo.tipoAlertaId) || tipo.tipoAlertaId <= 0) {
      setError('El tipo de alerta no tiene un identificador válido.');
      return;
    }

    const partes = [nombreDe(tipo)];
    if (descripcion.trim()) partes.push(descripcion.trim());

    try {
      setEnviando(true);
      const respuesta = await crearAlerta({
        tipoAlertaId: tipo.tipoAlertaId,
        descripcion: partes.join('. ').slice(0, 500),
        latitud: Number(pos.lat.toFixed(6)),
        longitud: Number(pos.lng.toFixed(6)),
      });
      setResultado(respuesta);
      setReferenciaAlerta(
        (typeof respuesta === 'number' || typeof respuesta === 'string' ? respuesta : null) ??
          respuesta?.idAlerta ??
          respuesta?.IdAlerta ??
          respuesta?.id ??
          respuesta?.Id ??
          respuesta?.alerta?.idAlerta ??
          respuesta?.alerta?.IdAlerta ??
          respuesta?.data?.idAlerta ??
          respuesta?.data?.IdAlerta ??
          null
      );
      setMostrarMapa(false);
    } catch (err) {
      setError(err.message || 'No se pudo enviar la alerta.');
    } finally {
      setEnviando(false);
    }
  };

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
          {!tipo && !resultado ? (
            <div className="re-paso-tipo">
              <div className="re-seleccion-tipo">
                <div className="re-catalogo-header">
                  <span className="re-paso-etiqueta">PASO 1 · CLASIFICAR</span>
                  <h2>¿Qué está ocurriendo?</h2>
                  <p>Selecciona el tipo de alerta. Las opciones y su prioridad vienen del sistema.</p>
                </div>
                <div className="re-catalogo-toolbar">
                  <label className="re-busqueda-tipos">
                    <i className="bi bi-search" />
                    <input
                      type="search"
                      value={busquedaTipo}
                      onChange={(event) => setBusquedaTipo(event.target.value)}
                      placeholder="Buscar alerta por nombre, central o código"
                      aria-label="Buscar tipos de alerta"
                    />
                    {busquedaTipo && (
                      <button type="button" onClick={() => setBusquedaTipo('')} aria-label="Limpiar búsqueda">
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </label>
                  <select
                    className="re-filtro-prioridad"
                    value={filtroPrioridad}
                    onChange={(event) => setFiltroPrioridad(event.target.value)}
                    aria-label="Filtrar tipos por prioridad"
                  >
                    <option value="TODAS">Todas las prioridades</option>
                    <option value="ALTA">Prioridad alta</option>
                    <option value="MEDIA">Prioridad media</option>
                    <option value="BAJA">Prioridad baja</option>
                  </select>
                </div>
                {errorTipos && (
                  <div className="re-error re-error-tipos" role="alert">
                    <span>{errorTipos}</span>
                    <button type="button" className="re-btn-oscuro" onClick={() => cargarTipos()}>
                      Reintentar
                    </button>
                  </div>
                )}
                {!cargandoTipos && !errorTipos && tipos.length > 0 && (
                  <div className="re-resultados-resumen">
                    <span>{tiposVisibles.length} de {tipos.length} tipos</span>
                    <span>Prioridad alta primero</span>
                  </div>
                )}
                <div className="re-resultados-tipos" aria-live="polite">
                  {cargandoTipos ? (
                    <div className="re-catalogo-estado">
                      <span className="re-catalogo-spinner" />
                      <strong>Cargando tipos disponibles…</strong>
                    </div>
                  ) : tiposVisibles.length > 0 ? (
                    <div className="re-grilla-tipos">
                      {tiposVisibles.map((t) => {
                        const prioridad = prioridadDe(t);
                        const central = centralDe(t);
                        const color = colorPrioridad[prioridad] || '#53647b';

                        return (
                          <button
                            key={t.tipoAlertaId}
                            type="button"
                            className="re-tipo-card"
                            style={{ '--re-tipo-color': color }}
                            onClick={() => elegirTipo(t)}
                          >
                            <span className="re-tipo-card-icono">
                              <i className={`bi ${iconoDe(t)}`} />
                            </span>
                            <span className="re-tipo-card-contenido">
                              <strong>{nombreDe(t)}</strong>
                              <span className="re-tipo-card-detalles">
                                <span className={`re-prioridad-pill re-prioridad-${normalizar(prioridad).replace(/\s+/g, '-')}`}>
                                  {prioridad === 'SIN PRIORIDAD' ? 'Sin prioridad' : `Prioridad ${prioridad.toLowerCase()}`}
                                </span>
                                <span className="re-central-pill">
                                  <i className={`bi ${central === 'TRANSITO' ? 'bi-cone-striped' : 'bi-shield-check'}`} />
                                  {etiquetaCentral(t)}
                                </span>
                              </span>
                            </span>
                            <span className="re-tipo-card-codigo">#{t.tipoAlertaId}</span>
                            <i className="bi bi-chevron-right re-tipo-card-flecha" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="re-catalogo-estado">
                      <i className="bi bi-search" />
                      <strong>{tipos.length ? 'No hay coincidencias' : 'No hay tipos de alerta disponibles'}</strong>
                      <span>{tipos.length ? 'Prueba otra búsqueda o prioridad.' : 'El catálogo está vacío; contacta al administrador.'}</span>
                    </div>
                  )}
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
                <button type="button" className="re-btn-gps" onClick={usarMiUbicacion} disabled={ubicacionCargando}>
                  <i className={`bi ${ubicacionCargando ? 'bi-arrow-repeat re-girando' : 'bi-crosshair'}`} />
                  {ubicacionCargando ? 'Buscando ubicación…' : 'Usar mi ubicación'}
                </button>
              </div>
              )}

              <aside className="re-panel">
                <div className="re-tipo-actual">
                  <span className="re-tipo-icono" style={{ background: colorPrioridad[prioridadDe(tipo)] || '#53647b' }}><i className={`bi ${iconoDe(tipo)}`} /></span>
                  <div className="re-tipo-actual-datos">
                    <strong>{nombreDe(tipo)}</strong>
                    <span>Referencia de tipo #{tipo.tipoAlertaId}</span>
                  </div>
                  <button type="button" className="re-link" onClick={() => setTipo(null)}>Cambiar tipo</button>
                </div>

                <div className="re-asignacion-tipo">
                  <span className={`re-prioridad-pill re-prioridad-${normalizar(prioridadDe(tipo)).replace(/\s+/g, '-')}`}>
                    <i className="bi bi-exclamation-triangle-fill" />
                    {prioridadDe(tipo) === 'SIN PRIORIDAD'
                      ? 'Prioridad sin asignar'
                      : `Prioridad ${prioridadDe(tipo).toLowerCase()}`}
                  </span>
                  <span className="re-central-pill">
                    <i className={`bi ${centralDe(tipo) === 'TRANSITO' ? 'bi-cone-striped' : 'bi-shield-check'}`} />
                    {etiquetaCentral(tipo)}
                  </span>
                </div>

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

                <div className={`re-coords-caja ${pos ? 'ok' : ''}`}>
                  <i className="bi bi-pin-map-fill" />
                  <div>
                    <strong>Coordenadas del incidente</strong>
                    <span>
                      {pos
                        ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`
                        : ubicacionCargando
                          ? 'Buscando tu ubicación…'
                          : 'Aún sin marcar'}</span>
                  </div>
                </div>

                {error && <div className="re-error" role="alert">{error}</div>}

                <div className="re-acciones">
                  {mostrarMapa ? (
                    <>
                      <button type="button" className="re-btn-manual" onClick={() => setMostrarMapa(false)}>
                        <i className="bi bi-arrow-left" /> Volver a la alerta directa
                      </button>
                      <button type="button" className="re-panico" onClick={enviar} disabled={enviando || !pos}>
                        <i className="bi bi-shield-fill-exclamation" />
                        {enviando ? 'Enviando alerta...' : !pos ? 'Esperando ubicación…' : 'Enviar alerta'}
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
                      <button type="button" className="re-panico" onClick={enviar} disabled={enviando || !pos}>
                        <i className="bi bi-shield-fill-exclamation" />
                        {enviando ? 'Enviando alerta...' : !pos ? 'Esperando ubicación…' : 'Enviar alerta'}
                      </button>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="re-modal-ok">
            <i className="bi bi-check-circle-fill re-ok-icono" />
            <h2 id="re-titulo-ok">Tu alerta fue registrada</h2>
            {referenciaAlerta != null && (
              <div className="re-referencia-alerta">
                <span>Referencia de tu alerta</span>
                <strong>#{referenciaAlerta}</strong>
              </div>
            )}
            <p>
              {referenciaAlerta != null
                ? 'Guarda esta referencia para identificar tu reporte. Mantente en un lugar seguro.'
                : 'Tu reporte quedó registrado. Mantente en un lugar seguro; las autoridades ya pueden consultar la alerta y su ubicación.'}
            </p>
            <button type="button" className="re-btn-oscuro" onClick={reiniciar}>Entendido</button>
          </div>
        )}
      </div>
    </div>
  );
}
