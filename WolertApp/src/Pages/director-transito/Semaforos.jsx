import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarSemaforos,
  listarBarrios,
  crearSemaforo,
  actualizarSemaforo,
  eliminarSemaforo,
} from "../../Services/semaforosDirectorService";
import "leaflet/dist/leaflet.css";
import "../../css/transito/director-transito/panel-semaforos.css";
import "../../css/transito/director-transito/mapas-transito.css";
import "../../css/transito/director-transito/registro-semaforo-mapa.css";

const CENTRO_VALLEDUPAR = [10.4769, -73.2509];
const POR_PAGINA = 5;

const FORMULARIO_VACIO = {
  codigo: "",
  direccion: "",
  idBarrio: "",
  tipo: "VEHICULAR",
  estado: "FUNCIONANDO",
  latitud: "",
  longitud: "",
  observacion: "",
};

const PILLS_ESTADO = [
  ["", "Todas", "pill-todas-dash"],
  ["FUNCIONANDO", "Funcionando", "pill-funcionando-dash"],
  ["DANADO", "Dañado", "pill-danado-dash"],
  ["MANTENIMIENTO", "En mantenimiento", "pill-mantenimiento-dash"],
];

const iconoSemaforo = L.divIcon({
  className: "registro-sem-icono",
  html: '<span class="registro-sem-pin"><i class="bi bi-stoplights-fill"></i></span>',
  iconSize: [44, 50],
  iconAnchor: [22, 47],
});

function SelectorPunto({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar({
        latitud: e.latlng.lat.toFixed(6),
        longitud: e.latlng.lng.toFixed(6),
      });
    },
  });
  return null;
}

// Recalcula el tamaño del mapa tras la animación de apertura del modal
function AjustarTamano() {
  const mapa = useMap();
  useEffect(() => {
    const t = setTimeout(() => mapa.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [mapa]);
  return null;
}

// Solo mueve el mapa si el punto queda fuera de la vista actual
function CentrarPunto({ posicion }) {
  const mapa = useMap();
  const lat = posicion?.[0];
  const lng = posicion?.[1];
  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (!mapa.getBounds().contains([lat, lng])) {
      mapa.flyTo([lat, lng], Math.max(mapa.getZoom(), 15), { duration: 0.7 });
    }
  }, [mapa, lat, lng]);
  return null;
}

function normalizar(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function estadoSemaforo(valor) {
  const estado = normalizar(valor);
  if (["FUNCIONANDO", "ACTIVO", "OPERATIVO"].includes(estado))
    return "FUNCIONANDO";
  if (["DANADO", "AVERIADO"].includes(estado)) return "DANADO";
  if (["INACTIVO", "DESACTIVADO"].includes(estado)) return "INACTIVO";
  if (["MANTENIMIENTO", "EN MANTENIMIENTO"].includes(estado))
    return "MANTENIMIENTO";
  return estado;
}

function etiquetaEstado(estado) {
  switch (estadoSemaforo(estado)) {
    case "FUNCIONANDO":
      return "Funcionando";
    case "DANADO":
      return "Dañado";
    case "MANTENIMIENTO":
      return "En mantenimiento";
    case "INACTIVO":
      return "Inactivo";
    default:
      return estado || "Sin estado";
  }
}

function etiquetaTipo(tipo) {
  const t = normalizar(tipo);
  if (t === "VEHICULAR") return "Vehicular";
  if (t === "PEATONAL") return "Peatonal";
  return tipo || "—";
}

export default function Semaforos() {
  const [semaforos, setSemaforos] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [pagina, setPagina] = useState(1);
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState({ ...FORMULARIO_VACIO });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mapaVisible, setMapaVisible] = useState(true);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  useEffect(() => {
    if (!error && !aviso) return;
    const temporizador = setTimeout(() => {
      setError("");
      setAviso("");
    }, 5500);
    return () => clearTimeout(temporizador);
  }, [error, aviso]);

  useEffect(() => {
    if (!modalAbierto) return;
    function alPresionar(e) {
      if (e.key === "Escape" && !guardando) setModalAbierto(false);
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [modalAbierto, guardando]);

  const aplicarResultados = useCallback(
    ([resultadoSemaforos, resultadoBarrios]) => {
      const errores = [];
      if (resultadoSemaforos.status === "fulfilled")
        setSemaforos(resultadoSemaforos.value);
      else
        errores.push(
          resultadoSemaforos.reason?.message ||
            "No se pudieron cargar los semáforos.",
        );
      if (resultadoBarrios.status === "fulfilled")
        setBarrios(resultadoBarrios.value);
      else
        errores.push(
          resultadoBarrios.reason?.message ||
            "No se pudieron cargar los barrios.",
        );
      if (errores.length > 0) setError(errores.join(" | "));
    },
    [],
  );

  async function cargarDatos() {
    setCargando(true);
    setError("");
    const resultados = await Promise.allSettled([
      listarSemaforos(),
      listarBarrios(),
    ]);
    aplicarResultados(resultados);
    setCargando(false);
  }

  useEffect(() => {
    let activo = true;
    Promise.allSettled([listarSemaforos(), listarBarrios()]).then(
      (resultados) => {
        if (!activo) return;
        aplicarResultados(resultados);
        setCargando(false);
      },
    );
    return () => {
      activo = false;
    };
  }, [aplicarResultados]);

  // Excluye registros marcados como ELIMINADO por el backend
  const lista = useMemo(
    () => semaforos.filter((s) => estadoSemaforo(s.estado) !== "ELIMINADO"),
    [semaforos],
  );

  const estadisticas = useMemo(
    () => ({
      total: lista.length,
      funcionando: lista.filter(
        (s) => estadoSemaforo(s.estado) === "FUNCIONANDO",
      ).length,
      danados: lista.filter((s) => estadoSemaforo(s.estado) === "DANADO")
        .length,
      mantenimiento: lista.filter(
        (s) => estadoSemaforo(s.estado) === "MANTENIMIENTO",
      ).length,
      vehiculares: lista.filter((s) => normalizar(s.tipo) === "VEHICULAR")
        .length,
      peatonales: lista.filter((s) => normalizar(s.tipo) === "PEATONAL")
        .length,
    }),
    [lista],
  );

  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda);
    return lista.filter((semaforo) => {
      const contenido = normalizar(
        [
          semaforo.codigo,
          semaforo.direccion,
          semaforo.barrioNombre,
          semaforo.tipo,
          semaforo.estado,
        ].join(" "),
      );
      const coincideBusqueda = !texto || contenido.includes(texto);
      const coincideEstado =
        !filtroEstado || estadoSemaforo(semaforo.estado) === filtroEstado;
      const coincideTipo =
        filtroTipo === "TODOS" || normalizar(semaforo.tipo) === filtroTipo;
      return coincideBusqueda && coincideEstado && coincideTipo;
    });
  }, [lista, busqueda, filtroEstado, filtroTipo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const latMapa = Number(formulario.latitud);
  const lngMapa = Number(formulario.longitud);
  const posicionMapa =
    formulario.latitud !== "" &&
    formulario.longitud !== "" &&
    Number.isFinite(latMapa) &&
    Number.isFinite(lngMapa) &&
    Math.abs(latMapa) <= 90 &&
    Math.abs(lngMapa) <= 180
      ? [latMapa, lngMapa]
      : null;

  function seleccionarUbicacion({ latitud, longitud }) {
    setFormulario((anterior) => ({
      ...anterior,
      latitud: String(latitud),
      longitud: String(longitud),
    }));
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroTipo("TODOS");
    setPagina(1);
  }

  function cambiarCampo(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function abrirNuevo() {
    setEditandoId(null);
    setFormulario({ ...FORMULARIO_VACIO });
    setError("");
    setAviso("");
    setMapaVisible(true);
    setModalAbierto(true);
  }

  function abrirEditar(semaforo) {
    setEditandoId(semaforo.idSemaforo);
    setFormulario({
      codigo: semaforo.codigo ?? "",
      direccion: semaforo.direccion ?? "",
      idBarrio: semaforo.idBarrio != null ? String(semaforo.idBarrio) : "",
      tipo: normalizar(semaforo.tipo) || "VEHICULAR",
      estado: estadoSemaforo(semaforo.estado) || "FUNCIONANDO",
      latitud: semaforo.latitud != null ? String(semaforo.latitud) : "",
      longitud: semaforo.longitud != null ? String(semaforo.longitud) : "",
      observacion: semaforo.observacion ?? "",
    });
    setError("");
    setAviso("");
    setMapaVisible(true);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
  }

  async function guardarSemaforo(evento) {
    evento.preventDefault();
    setError("");
    setAviso("");
    const latitud = Number(formulario.latitud);
    const longitud = Number(formulario.longitud);
    if (
      !formulario.codigo.trim() ||
      !formulario.tipo.trim() ||
      !formulario.estado.trim() ||
      !formulario.idBarrio
    ) {
      setError("Completa el código, tipo, estado y barrio.");
      return;
    }
    if (
      formulario.latitud.trim() === "" ||
      formulario.longitud.trim() === "" ||
      !Number.isFinite(latitud) ||
      !Number.isFinite(longitud) ||
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      setError(
        "Ingresa coordenadas válidas. Latitud: -90 a 90; longitud: -180 a 180.",
      );
      return;
    }
    setGuardando(true);
    try {
      if (editandoId !== null) {
        await actualizarSemaforo(editandoId, formulario);
        setAviso("Semáforo actualizado correctamente.");
      } else {
        await crearSemaforo(formulario);
        setAviso("Semáforo registrado correctamente.");
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el semáforo.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrarSemaforo(semaforo) {
    setConfirmarEliminar(null);
    setError("");
    setAviso("");
    try {
      // El backend marca Estado = "ELIMINADO" sin borrar el registro.
      await eliminarSemaforo(semaforo.idSemaforo);
      await cargarDatos();
      setAviso("Semáforo eliminado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el semáforo.");
    }
  }

  // Con el modal abierto el error se muestra dentro de él, no en el toast
  const mostrarToast = Boolean(aviso) || (Boolean(error) && !modalAbierto);

  return (
    <Layout
      titulo="Semáforos"
      activo="semaforos"
      busqueda={{ placeholder: "Buscar por código, ubicación o barrio..." }}
    >
      <div className="sem-panel">
        <div className="row align-items-center mb-4">
          <div className="col">
            <div className="sem-encabezado-etiqueta">DIRECCIÓN DE TRÁNSITO</div>
            <h1 className="sem-titulo-principal">Semáforos</h1>
            <p className="section-text-dash mb-0">
              Consulta, registra y da seguimiento al estado de los semáforos de
              la ciudad.
            </p>
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
              onClick={abrirNuevo}
            >
              <i className="bi bi-plus-lg me-1" />
              Nuevo semáforo
            </button>
          </div>
        </div>

        {cargando && (
          <div className="alert alert-info" role="status">
            <i className="bi bi-arrow-repeat me-2" />
            Cargando semáforos...
          </div>
        )}

        <div className="row g-3 mt-4 mb-4">
          <KpiCard
            color="blue"
            valor={estadisticas.total}
            label="Total de semáforos"
            icono="bi-signpost-2"
          />
          <KpiCard
            color="green"
            valor={estadisticas.funcionando}
            label="Funcionando"
            icono="bi-check2-circle"
          />
          <KpiCard
            color="red"
            valor={estadisticas.danados}
            label="Dañados"
            icono="bi-exclamation-triangle"
          />
          <KpiCard
            color="amber"
            valor={estadisticas.mantenimiento}
            label="En mantenimiento"
            icono="bi-tools"
          />
        </div>

        <div className="table-card-dash">
          <div className="filtros-fila-dash mb-3">
            <div className="input-group search-dash filtros-busqueda-dash">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control border-0"
                placeholder="Buscar por código, ubicación o barrio..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {PILLS_ESTADO.map(([valor, texto, clase]) => (
                <button
                  key={valor || "todas"}
                  type="button"
                  aria-pressed={filtroEstado === valor}
                  className={`pill-filtro-dash ${clase} ${filtroEstado === valor ? "pill-activa-dash" : ""}`}
                  onClick={() => {
                    setFiltroEstado(filtroEstado === valor ? "" : valor);
                    setPagina(1);
                  }}
                >
                  {texto}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={limpiarFiltros}
            >
              <i className="bi bi-x-circle me-1" />
              Limpiar
            </button>
          </div>

          <div className="d-flex gap-2 tabs-dash mb-3">
            {[
              ["TODOS", "Todas", estadisticas.total],
              ["VEHICULAR", "Vehicular", estadisticas.vehiculares],
              ["PEATONAL", "Peatonal", estadisticas.peatonales],
            ].map(([valor, texto, cantidad]) => (
              <button
                key={valor}
                type="button"
                className={`tab-dash-sem ${filtroTipo === valor ? "active-dash" : ""}`}
                onClick={() => {
                  setFiltroTipo(valor);
                  setPagina(1);
                }}
              >
                {texto} ({cantidad})
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0 sem-tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ubicación</th>
                  <th>Barrio</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Coordenadas</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((semaforo) => (
                  <tr key={semaforo.idSemaforo}>
                    <td>
                      <div className="sem-perfil">
                        <span
                          className={`sem-avatar sem-avatar-${Number(semaforo.idSemaforo || 0) % 5}`}
                        >
                          <i className="bi bi-stoplights-fill" />
                        </span>
                        <div className="sem-perfil-datos">
                          <span className="sem-codigo">
                            {semaforo.codigo || "Sin código"}
                          </span>
                          <span className="sem-id">
                            Semáforo #{semaforo.idSemaforo}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{semaforo.direccion || "—"}</td>
                    <td>
                      <span className="sem-barrio">
                        {semaforo.barrioNombre || "Sin barrio"}
                      </span>
                    </td>
                    <td>
                      <span className="sem-pill sem-pill-tipo">
                        {etiquetaTipo(semaforo.tipo)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sem-pill sem-pill-${estadoSemaforo(semaforo.estado).toLowerCase()}`}
                      >
                        {etiquetaEstado(semaforo.estado)}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {semaforo.latitud != null && semaforo.longitud != null
                        ? `${semaforo.latitud}, ${semaforo.longitud}`
                        : "Sin coordenadas"}
                    </td>
                    <td className="text-end">
                      <div className="sem-acciones">
                        <button
                          type="button"
                          className="sem-accion-btn editar"
                          title="Editar semáforo"
                          aria-label={`Editar ${semaforo.codigo || "semáforo"}`}
                          onClick={() => abrirEditar(semaforo)}
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button
                          type="button"
                          className="sem-accion-btn eliminar"
                          title="Eliminar semáforo"
                          aria-label={`Eliminar ${semaforo.codigo || "semáforo"}`}
                          onClick={() => setConfirmarEliminar(semaforo)}
                        >
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!cargando && visibles.length === 0 && (
            <div className="text-center text-muted py-4">
              <i className="bi bi-stoplights fs-3 d-block mb-2" />
              No hay semáforos para mostrar.
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
            <span className="text-muted small">
              Mostrando {visibles.length} de {filtrados.length} semáforos
            </span>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="page-btn-dash"
                aria-label="Página anterior"
                disabled={paginaActual === 1}
                onClick={() => setPagina(Math.max(1, paginaActual - 1))}
              >
                <i className="bi bi-chevron-left" />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (numero) => (
                  <button
                    key={numero}
                    type="button"
                    className={`page-btn-dash ${paginaActual === numero ? "active-dash" : ""}`}
                    onClick={() => setPagina(numero)}
                  >
                    {numero}
                  </button>
                ),
              )}
              <button
                type="button"
                className="page-btn-dash"
                aria-label="Página siguiente"
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPagina(Math.min(totalPaginas, paginaActual + 1))
                }
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        </div>

        {modalAbierto && (
          <div
            className="modal fade show modal-dash registro-sem-overlay"
            id="modalSemaforo"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModalSemaforo"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered registro-sem-dialog">
              <div className="modal-content registro-sem-contenido">
                <form onSubmit={guardarSemaforo}>
                  <div className="modal-header registro-sem-cabecera">
                    <div className="registro-sem-marca">
                      <img
                        src="/img/secretaria%20transito.png"
                        alt="Secretaría de Tránsito"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div>
                        <strong>WolertApp · Tránsito</strong>
                        <small>Gestión de semáforos de Valledupar</small>
                      </div>
                    </div>
                    <h5 className="modal-title" id="tituloModalSemaforo">
                      {editandoId !== null
                        ? "Editar semáforo"
                        : "Nuevo semáforo"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      disabled={guardando}
                      onClick={cerrarModal}
                    />
                  </div>

                  <div className="modal-body registro-sem-cuerpo">
                    <div className="registro-sem-mapa-col">
                      <div className="registro-sem-mapa-barra">
                        <div>
                          <strong>
                            <i className="bi bi-geo-alt-fill me-2" />
                            Ubicación del semáforo
                          </strong>
                          <small>
                            Haz clic en el mapa para marcar el punto exacto
                          </small>
                        </div>
                        <button
                          type="button"
                          className="registro-sem-mapa-toggle"
                          onClick={() => setMapaVisible((valor) => !valor)}
                        >
                          {mapaVisible ? "Ocultar mapa" : "Mostrar mapa"}
                        </button>
                      </div>
                      {mapaVisible && (
                        <div className="registro-sem-mapa-marco">
                          <MapContainer
                            center={posicionMapa || CENTRO_VALLEDUPAR}
                            zoom={14}
                            scrollWheelZoom={true}
                            className="registro-sem-leaflet"
                          >
                            <TileLayer
                              attribution="&copy; OpenStreetMap contributors"
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <AjustarTamano />
                            <SelectorPunto
                              onSeleccionar={seleccionarUbicacion}
                            />
                            {posicionMapa && (
                              <>
                                <CentrarPunto posicion={posicionMapa} />
                                <Marker
                                  position={posicionMapa}
                                  icon={iconoSemaforo}
                                />
                              </>
                            )}
                          </MapContainer>
                        </div>
                      )}
                      <div className="registro-sem-ubicacion">
                        <i className="bi bi-pin-map-fill" />
                        <div>
                          <small>Ubicación seleccionada</small>
                          <strong>
                            {posicionMapa
                              ? `${latMapa.toFixed(6)}, ${lngMapa.toFixed(6)}`
                              : "Selecciona un punto en el mapa"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="registro-sem-form-col">
                      <div className="registro-sem-form-titulo">
                        <span className="registro-sem-form-icon">
                          <i className="bi bi-stoplights-fill" />
                        </span>
                        <div>
                          <strong>
                            {editandoId !== null
                              ? "Editar semáforo"
                              : "Registrar semáforo"}
                          </strong>
                          <small>
                            Completa los datos y selecciona su ubicación
                          </small>
                        </div>
                      </div>

                      {error && (
                        <div className="alert alert-danger py-2" role="alert">
                          {error}
                        </div>
                      )}

                      <div className="mb-3">
                        <label
                          htmlFor="inputCodigo"
                          className="form-label-dash"
                        >
                          Código
                        </label>
                        <input
                          id="inputCodigo"
                          type="text"
                          className="form-control form-control-dash"
                          placeholder="Ej: SEM-004"
                          maxLength={30}
                          required
                          value={formulario.codigo}
                          onChange={(e) =>
                            cambiarCampo("codigo", e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="inputUbicacion"
                          className="form-label-dash"
                        >
                          Ubicación
                        </label>
                        <input
                          id="inputUbicacion"
                          type="text"
                          className="form-control form-control-dash"
                          placeholder="Ej: Cra 19 con Calle 16"
                          maxLength={150}
                          value={formulario.direccion}
                          onChange={(e) =>
                            cambiarCampo("direccion", e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="inputBarrio"
                          className="form-label-dash"
                        >
                          Barrio
                        </label>
                        <select
                          id="inputBarrio"
                          className="form-select form-control-dash"
                          required
                          value={formulario.idBarrio}
                          onChange={(e) =>
                            cambiarCampo("idBarrio", e.target.value)
                          }
                        >
                          <option value="">Selecciona un barrio</option>
                          {barrios.map((barrio) => (
                            <option
                              key={barrio.idBarrio}
                              value={barrio.idBarrio}
                            >
                              {barrio.nombre}
                            </option>
                          ))}
                        </select>
                        {barrios.length === 0 && (
                          <small className="text-muted">
                            No hay barrios disponibles. Comprueba la conexión
                            con la API.
                          </small>
                        )}
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label
                            htmlFor="inputTipo"
                            className="form-label-dash"
                          >
                            Tipo
                          </label>
                          <select
                            id="inputTipo"
                            className="form-select form-control-dash"
                            value={formulario.tipo}
                            onChange={(e) =>
                              cambiarCampo("tipo", e.target.value)
                            }
                          >
                            <option value="VEHICULAR">Vehicular</option>
                            <option value="PEATONAL">Peatonal</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="inputEstado"
                            className="form-label-dash"
                          >
                            Estado
                          </label>
                          <select
                            id="inputEstado"
                            className="form-select form-control-dash"
                            value={formulario.estado}
                            onChange={(e) =>
                              cambiarCampo("estado", e.target.value)
                            }
                          >
                            <option value="FUNCIONANDO">Funcionando</option>
                            <option value="DANADO">Dañado</option>
                            <option value="MANTENIMIENTO">
                              En mantenimiento
                            </option>
                            <option value="INACTIVO">Inactivo</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="inputLatitud"
                            className="form-label-dash"
                          >
                            Latitud
                          </label>
                          <input
                            id="inputLatitud"
                            type="number"
                            step="any"
                            min="-90"
                            max="90"
                            className="form-control form-control-dash"
                            placeholder="Ej: 10.4631"
                            required
                            value={formulario.latitud}
                            onChange={(e) =>
                              cambiarCampo("latitud", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="inputLongitud"
                            className="form-label-dash"
                          >
                            Longitud
                          </label>
                          <input
                            id="inputLongitud"
                            type="number"
                            step="any"
                            min="-180"
                            max="180"
                            className="form-control form-control-dash"
                            placeholder="Ej: -73.2532"
                            required
                            value={formulario.longitud}
                            onChange={(e) =>
                              cambiarCampo("longitud", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-1 mt-3">
                        <label
                          htmlFor="inputObservacion"
                          className="form-label-dash"
                        >
                          Observación
                        </label>
                        <textarea
                          id="inputObservacion"
                          className="form-control form-control-dash"
                          rows={3}
                          maxLength={200}
                          placeholder="Observaciones sobre el semáforo..."
                          value={formulario.observacion}
                          onChange={(e) =>
                            cambiarCampo("observacion", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer registro-sem-pie">
                    <button
                      type="button"
                      className="btn btn-light"
                      disabled={guardando}
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primario-dash"
                      disabled={guardando || barrios.length === 0}
                    >
                      {guardando
                        ? "Guardando..."
                        : editandoId !== null
                          ? "Actualizar"
                          : "Guardar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {mostrarToast && (
          <div
            className={`sem-toast ${error ? "sem-toast-error" : "sem-toast-exito"}`}
            role={error ? "alert" : "status"}
          >
            <i
              className={`bi ${error ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`}
            />
            <span>{error || aviso}</span>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => {
                setError("");
                setAviso("");
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {confirmarEliminar && (
          <div
            className="sem-confirmar-fondo"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmarEliminar(null);
            }}
          >
            <div
              className="sem-confirmar"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sem-confirmar-titulo"
            >
              <span className="sem-confirmar-icono">
                <i className="bi bi-trash3" />
              </span>
              <h2 id="sem-confirmar-titulo">¿Eliminar semáforo?</h2>
              <p>
                ¿Deseas eliminar el semáforo{" "}
                <strong>
                  {confirmarEliminar.codigo || confirmarEliminar.idSemaforo}
                </strong>
                ? Dejará de aparecer en los listados.
              </p>
              <div className="sem-confirmar-botones">
                <button
                  type="button"
                  onClick={() => setConfirmarEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="sem-confirmar-eliminar"
                  onClick={() => borrarSemaforo(confirmarEliminar)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}