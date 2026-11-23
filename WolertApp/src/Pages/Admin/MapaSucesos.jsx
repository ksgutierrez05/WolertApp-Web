import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/admin/mapa-sucesos.css';
import { eliminarAlerta, listarAlertas } from '../../Services/AlertasAPI.js';
import { eliminarAlarma, listarAlarmas } from '../../Services/AlarmasAdminService.js';
import { listaUsuarios } from '../../Services/UsuariosAPI.js';

const CENTRO_VALLEDUPAR = [10.4731, -73.2446];
const coordenada = (valor) => valor === null || valor === undefined || valor === '' ? Number.NaN : Number(valor);
const leer = (obj, ...claves) => {
  for (const clave of claves) {
    const encontrado = obj?.[clave] ?? obj?.[clave[0]?.toUpperCase() + clave.slice(1)];
    if (encontrado !== undefined && encontrado !== null && encontrado !== '') return encontrado;
  }
  return null;
};

function buscarCampo(obj, coincide, profundidad = 0) {
  if (!obj || typeof obj !== 'object' || profundidad > 3) return null;
  for (const [clave, valor] of Object.entries(obj)) {
    const claveNormalizada = clave.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (coincide(claveNormalizada) && valor !== null && valor !== undefined && typeof valor !== 'object' && valor !== '') return valor;
  }
  for (const valor of Object.values(obj)) {
    const resultado = buscarCampo(valor, coincide, profundidad + 1);
    if (resultado !== null) return resultado;
  }
  return null;
}

function crearIcono(tipo, color) {
  return L.divIcon({
    className: 'mapa-sucesos-marker-wrap',
    html: `<span class="mapa-sucesos-marker mapa-sucesos-marker--${tipo}" style="--marker-color:${color};--pulse-color:${color}"><i class="bi ${tipo === 'alerta' ? 'bi-exclamation-lg' : 'bi-bell-fill'}"></i></span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 36],
    popupAnchor: [0, -34],
  });
}

function crearIconoImagen(tipo, ruta, color, dimensiones = [48, 52]) {
  return L.divIcon({
    className: 'mapa-sucesos-marker-wrap',
    html: `<span class="mapa-sucesos-marker mapa-sucesos-marker--imagen mapa-sucesos-marker--${tipo}" style="--pulse-color:${color}"><img src="${ruta}" alt="" /></span>`,
    iconSize: dimensiones,
    iconAnchor: [dimensiones[0] / 2, dimensiones[1] - 2],
    popupAnchor: [0, -(dimensiones[1] - 8)],
  });
}

const iconos = {
  alerta: crearIcono('alerta', '#d92d20'),
  alarma: crearIconoImagen('alarma', '/img/Logo_alarma.png', '#2457d6'),
  policia: crearIconoImagen('policia', '/img/Logo_alerta_policia.png', '#154d8c', [48, 60]),
};

function AjustarMapa({ puntos }) {
  const mapa = useMap();
  useEffect(() => {
    if (puntos.length === 1) mapa.setView(puntos[0].posicion, 15);
    if (puntos.length > 1) mapa.fitBounds(L.latLngBounds(puntos.map((p) => p.posicion)), { padding: [48, 48], maxZoom: 15 });
  }, [mapa, puntos]);
  return null;
}

function fechaCorta(valor) {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? String(valor) : fecha.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function tieneCoordenadas(punto) {
  return Number.isFinite(punto.lat) && Number.isFinite(punto.lng)
    && Math.abs(punto.lat) <= 90 && Math.abs(punto.lng) <= 180;
}

function usuarioAlarma(alarma, usuarios) {
  const username = leer(alarma, 'username', 'userName', 'usuarioUsername', 'usernameUsuario', 'userNameUsuario', 'usernameCreador', 'userNameCreador', 'creadorUsername', 'creadorUserName', 'creadoPorUsername', 'reportanteUsername', 'nombreUsuarioCreador', 'authorUsername', 'createdByUsername')
    ?? buscarCampo(alarma, (clave) => clave === 'username');
  if (username) return username;

  const usuario = leer(alarma, 'usuario', 'usuarioCreador', 'creadorUsuario', 'usuarioRegistro', 'creador', 'creadoPor', 'reportadoPor', 'createdBy', 'creator', 'author', 'user');
  if (usuario && typeof usuario === 'object') {
    const nombreUsuario = leer(usuario, 'username', 'nombreUsuario', 'userName');
    if (nombreUsuario) return nombreUsuario;
    const nombre = leer(usuario, 'nombreCompleto', 'nombre');
    if (nombre) return nombre;
    const partes = [leer(usuario, 'primerNombre'), leer(usuario, 'segundoNombre'), leer(usuario, 'primerApellido'), leer(usuario, 'segundoApellido')].filter(Boolean);
    if (partes.length) return partes.join(' ');
  }

  const idUsuario = leer(alarma, 'idUsuarioCreador', 'usuarioCreadorId', 'idUsuario', 'usuarioId', 'idUsuarioAlarma', 'creadoPorId', 'idCreadoPor', 'creadoPorUsuarioId', 'idCreador', 'creadorId', 'idCreadorUsuario', 'idUsuarioReportante', 'reportadoPorId', 'idUsuarioCreacion', 'usuarioCreacionId', 'idUsuarioRegistro', 'usuarioRegistroId', 'createdById', 'creatorId', 'authorId', 'idAutor', 'autorId')
    ?? (usuario && typeof usuario === 'object' ? leer(usuario, 'idUsuario', 'usuarioId', 'id') : null)
    ?? buscarCampo(alarma, (clave) => (clave.includes('usuario') || clave.includes('user')) && (clave.startsWith('id') || clave.endsWith('id')))
    ?? (typeof usuario === 'number' || (typeof usuario === 'string' && /^\d+$/.test(usuario)) ? usuario : null);
  const registroUsuario = idUsuario && usuarios.find((u) => String(leer(u, 'idUsuario', 'id')) === String(idUsuario));
  const usernameRelacionado = leer(registroUsuario, 'username', 'userName');
  if (usernameRelacionado) return usernameRelacionado;
  if (usuario && typeof usuario === 'string' && !/^\d+$/.test(usuario)) return usuario;
  return idUsuario ? `Usuario #${idUsuario}` : 'Usuario no informado';
}

function generadoPorPolicia(registro) {
  const banderas = [
    leer(registro, 'esPolicia'),
    leer(registro, 'generadaPorPolicia'),
    leer(registro, 'reportadaPorPolicia'),
    leer(registro, 'creadaPorPolicia'),
    leer(registro, 'esUsuarioPolicia'),
  ];
  if (banderas.some((valor) => valor === true || String(valor).toLowerCase() === 'true')) return true;

  const actores = ['usuario', 'usuarioReportante', 'reportadoPorUsuario', 'usuarioCreador', 'creador', 'creadoPor', 'generadoPor', 'reportadoPor']
    .map((campo) => leer(registro, campo))
    .filter((valor) => valor && typeof valor === 'object');
  const camposRol = ['rolNombre', 'nombreRol', 'rol', 'tipoUsuario', 'tipoReportante', 'rolReportante', 'reportadoPorRol', 'reportanteRol', 'rolCreador', 'creadorRol', 'creadoPorRol', 'usuarioRol', 'usuarioRolNombre', 'generadoPorRol', 'rolGenerador', 'origen'];
  const roles = [
    ...camposRol.map((campo) => leer(registro, campo)),
    ...actores.flatMap((actor) => camposRol.map((campo) => leer(actor, campo))),
  ].map((rol) => (rol && typeof rol === 'object' ? leer(rol, 'nombre', 'name', 'codigo') : rol));
  return roles.some((rol) => String(rol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().includes('POLICIA'));
}

export default function MapaSucesos() {
  const [alertas, setAlertas] = useState([]);
  const [alarmas, setAlarmas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [actualizado, setActualizado] = useState(null);
  const [eliminando, setEliminando] = useState('');
  const [errorEliminacion, setErrorEliminacion] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    const resultados = await Promise.allSettled([listarAlertas(), listarAlarmas(), listaUsuarios()]);
    const fallos = [];
    if (resultados[0].status === 'fulfilled' && Array.isArray(resultados[0].value)) setAlertas(resultados[0].value);
    else { setAlertas([]); fallos.push(`Alertas: ${resultados[0].reason?.message || 'respuesta inválida'}`); }
    if (resultados[1].status === 'fulfilled' && Array.isArray(resultados[1].value)) setAlarmas(resultados[1].value);
    else { setAlarmas([]); fallos.push(`Alarmas: ${resultados[1].reason?.message || 'respuesta inválida'}`); }
    if (resultados[2].status === 'fulfilled' && Array.isArray(resultados[2].value)) setUsuarios(resultados[2].value);
    else setUsuarios([]);
    setErrores(fallos);
    setActualizado(new Date());
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const elementos = useMemo(() => {
    const convertidos = [
      ...alertas.map((a) => ({
        tipo: 'alerta', id: leer(a, 'idAlerta', 'id') ?? '—', titulo: leer(a, 'tipo') || 'Alerta reportada',
        estado: leer(a, 'estado') || 'Sin estado', prioridad: leer(a, 'prioridad'),
        esPolicia: generadoPorPolicia(a),
        fecha: leer(a, 'fecha', 'fechaCreacion'),
        lat: leer(a, 'latitud'), lng: leer(a, 'longitud'), descripcion: leer(a, 'descripcion'),
      })),
      ...alarmas.map((a) => ({
        tipo: 'alarma', id: leer(a, 'idAlarma', 'id'), titulo: leer(a, 'nombre') || 'Alarma comunitaria',
        estado: leer(a, 'estado') || 'Sin estado', prioridad: null,
        esPolicia: generadoPorPolicia(a),
        reportante: usuarioAlarma(a, usuarios),
        fecha: leer(a, 'fechaCreacion', 'fecha'),
        lat: leer(a, 'latitud'), lng: leer(a, 'longitud'), descripcion: leer(a, 'descripcion'),
      })),
    ];
    return convertidos.map((p) => ({ ...p, lat: coordenada(p.lat), lng: coordenada(p.lng) }))
      .filter((p) => filtro === 'todos' || p.tipo === filtro);
  }, [alertas, alarmas, filtro, usuarios]);

  const puntos = useMemo(
    () => elementos.filter(tieneCoordenadas).map((p) => ({ ...p, posicion: [p.lat, p.lng] })),
    [elementos],
  );
  const sinUbicacion = (lista) => lista.filter((item) => {
    const lat = coordenada(leer(item, 'latitud'));
    const lng = coordenada(leer(item, 'longitud'));
    return !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180;
  }).length;
  const ocultosPorFiltro = (filtro === 'todos' ? 0 : filtro === 'alerta' ? alarmas.length : alertas.length);

  const borrarSuceso = async (item) => {
    const nombre = item.tipo === 'alerta' ? 'esta alerta' : 'esta alarma';
    if (!window.confirm(`¿Seguro que deseas eliminar ${nombre} #${item.id}? Esta acción no se puede deshacer.`)) return;
    const clave = `${item.tipo}-${item.id}`;
    setEliminando(clave);
    setErrorEliminacion('');
    try {
      if (item.tipo === 'alerta') {
        await eliminarAlerta(item.id);
        setAlertas((actuales) => actuales.filter((a) => String(leer(a, 'idAlerta', 'id')) !== String(item.id)));
      } else {
        await eliminarAlarma(item.id);
        setAlarmas((actuales) => actuales.filter((a) => String(leer(a, 'idAlarma', 'id')) !== String(item.id)));
      }
    } catch (err) {
      setErrorEliminacion(err.message || `No se pudo eliminar ${nombre}.`);
    } finally {
      setEliminando('');
    }
  };

  return (
    <main className="container-fluid admin-mapa-sucesos">
      <header className="admin-mapa-sucesos__header">
        <div>
          <span className="admin-mapa-sucesos__eyebrow"><i className="bi bi-geo-alt-fill" /> VISTA OPERATIVA</span>
          <h1>Mapa de sucesos</h1>
          <p>Ubicación de las alertas reportadas por la comunidad y las alarmas registradas.</p>
        </div>
        <button type="button" className="admin-mapa-sucesos__refresh" onClick={cargar} disabled={cargando}>
          <i className={`bi ${cargando ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'}`} /> {cargando ? 'Actualizando…' : 'Actualizar mapa'}
        </button>
      </header>

      <section className="admin-mapa-sucesos__toolbar" aria-label="Filtros y resumen del mapa">
        <div className="admin-mapa-sucesos__filters">
          {[['todos', 'Todos'], ['alerta', 'Alertas'], ['alarma', 'Alarmas']].map(([valor, etiqueta]) => (
            <button type="button" key={valor} className={filtro === valor ? 'is-active' : ''} onClick={() => setFiltro(valor)}>{etiqueta}</button>
          ))}
        </div>
        <div className="admin-mapa-sucesos__summary">
          <span><i className="mapa-sucesos-dot mapa-sucesos-dot--alerta" /> {alertas.length} alertas</span>
          <span><i className="mapa-sucesos-dot mapa-sucesos-dot--alarma" /> {alarmas.length} alarmas</span>
          {actualizado && <small>Actualizado {actualizado.toLocaleTimeString('es-CO')}</small>}
        </div>
      </section>

      {errores.map((mensaje) => <div className="admin-mapa-sucesos__notice admin-mapa-sucesos__notice--error" role="alert" key={mensaje}>{mensaje}</div>)}
      {!cargando && sinUbicacion(alertas) + sinUbicacion(alarmas) > 0 && (
        <div className="admin-mapa-sucesos__notice" role="status">
          {sinUbicacion(alertas) + sinUbicacion(alarmas)} suceso(s) no se muestran porque no tienen coordenadas válidas.
          {ocultosPorFiltro > 0 && ` El filtro actual también oculta ${ocultosPorFiltro} registros.`}
        </div>
      )}

      <div className="admin-mapa-sucesos__workspace">
        <section className="admin-mapa-sucesos__map-shell" aria-label="Mapa de alertas y alarmas">
          <MapContainer center={CENTRO_VALLEDUPAR} zoom={13} scrollWheelZoom className="admin-mapa-sucesos__map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AjustarMapa puntos={puntos} />
            {puntos.map((p, idx) => (
              <Marker key={`${p.tipo}-${p.id}-${idx}`} position={p.posicion} icon={p.esPolicia ? iconos.policia : iconos[p.tipo]}>
                <Popup>
                  <div className="admin-mapa-sucesos__popup">
                    <span className={`admin-mapa-sucesos__tag admin-mapa-sucesos__tag--${p.tipo}`}>{p.tipo === 'alerta' ? 'Alerta' : 'Alarma'} #{p.id}</span>
                    {p.esPolicia && <span className="admin-mapa-sucesos__policia-tag"><i className="bi bi-shield-fill-check" /> Reporte policial</span>}
                    <strong>{p.titulo}</strong>
                    <span>Estado: {p.estado}{p.prioridad ? ` · Prioridad ${p.prioridad}` : ''}</span>
                    {p.tipo === 'alarma' && <span>Creada por: {p.reportante}</span>}
                    {p.fecha && <span>{fechaCorta(p.fecha)}</span>}
                    {p.descripcion && <p>{p.descripcion}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {!cargando && puntos.length === 0 && (
            <div className="admin-mapa-sucesos__empty"><i className="bi bi-map" /><strong>No hay sucesos para mostrar</strong><span>Revisa los filtros o confirma que los registros tengan coordenadas.</span></div>
          )}
          <div className="admin-mapa-sucesos__legend"><span><i className="mapa-sucesos-dot mapa-sucesos-dot--alerta" /> Alertas</span><span><i className="mapa-sucesos-dot mapa-sucesos-dot--alarma" /> Alarmas</span></div>
        </section>

        <aside className="admin-mapa-sucesos__list-panel" aria-label="Listado de sucesos">
          <div className="admin-mapa-sucesos__list-heading">
            <div><h2>Sucesos registrados</h2><p>{elementos.length} elemento(s) · puedes retirar reportes falsos</p></div>
            <i className="bi bi-inboxes" />
          </div>
          {errorEliminacion && <div className="admin-mapa-sucesos__notice admin-mapa-sucesos__notice--error" role="alert">{errorEliminacion}</div>}
          <div className="admin-mapa-sucesos__list">
            {elementos.length === 0 && !cargando && <div className="admin-mapa-sucesos__list-empty">No hay sucesos en esta vista.</div>}
            {elementos.map((item, idx) => {
              const clave = `${item.tipo}-${item.id}`;
              return (
                <article className="admin-mapa-sucesos__item" key={`${clave}-${idx}`}>
                  {item.esPolicia
                    ? <img className="admin-mapa-sucesos__policia-logo" src="/img/Logo_alerta_policia.png" alt="Reporte policial" title="Reporte policial" />
                    : item.tipo === 'alarma'
                    ? <img className="admin-mapa-sucesos__alarm-logo" src="/img/Logo_alarma.png" alt="" />
                    : <span className="admin-mapa-sucesos__item-icon admin-mapa-sucesos__item-icon--alerta"><i className="bi bi-exclamation-triangle-fill" /></span>}
                  <div className="admin-mapa-sucesos__item-info">
                    <div className="admin-mapa-sucesos__item-title">{item.titulo} <small>#{item.id}</small></div>
                    <span>{item.tipo === 'alerta' ? 'Alerta' : 'Alarma'} · {item.estado}</span>
                    {item.tipo === 'alarma' && <span>Creada por: {item.reportante}</span>}
                    {item.fecha && <span>{fechaCorta(item.fecha)}</span>}
                    {!tieneCoordenadas(item) && <span className="admin-mapa-sucesos__no-coords"><i className="bi bi-geo-alt" /> Sin coordenadas</span>}
                  </div>
                  <button
                    type="button"
                    className="admin-mapa-sucesos__delete"
                    aria-label={`Eliminar ${item.tipo} ${item.id}`}
                    title="Eliminar suceso"
                    onClick={() => borrarSuceso(item)}
                    disabled={eliminando === clave || item.id === '—'}
                  >
                    <i className={`bi ${eliminando === clave ? 'bi-arrow-repeat' : 'bi-trash3'}`} />
                  </button>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
