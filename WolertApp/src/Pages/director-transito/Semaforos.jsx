import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarSemaforos,
  listarBarrios,
  crearSemaforo,
  actualizarSemaforo,
  eliminarSemaforo,
} from "../../Services/semaforosDirectorService";
import "../../css/transito/director-transito/panel-semaforos.css";
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
function normalizar(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function estadoSemaforo(valor) {
  const estado = normalizar(valor);
  if (["FUNCIONANDO", "ACTIVO", "OPERATIVO"].includes(estado)) {
    return "FUNCIONANDO";
  }
  if (["DANADO", "AVERIADO", "INACTIVO"].includes(estado)) {
    return "DANADO";
  }
  if (["MANTENIMIENTO", "EN MANTENIMIENTO"].includes(estado)) {
    return "MANTENIMIENTO";
  }
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
    default:
      return estado || "Sin estado";
  }
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
  const [formulario, setFormulario] = useState({
    ...FORMULARIO_VACIO,
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  async function cargarDatos() {
    setCargando(true);
    setError("");
    const resultados = await Promise.allSettled([
      listarSemaforos(),
      listarBarrios(),
    ]);
    const [resultadoSemaforos, resultadoBarrios] = resultados;
    const errores = [];
    if (resultadoSemaforos.status === "fulfilled") {
      setSemaforos(resultadoSemaforos.value);
    } else {
      errores.push(
        resultadoSemaforos.reason?.message ||
          "No se pudieron cargar los semáforos.",
      );
    }
    if (resultadoBarrios.status === "fulfilled") {
      setBarrios(resultadoBarrios.value);
    } else {
      errores.push(
        resultadoBarrios.reason?.message ||
          "No se pudieron cargar los barrios.",
      );
    }
    if (errores.length) {
      setError(errores.join(" | "));
    }
    setCargando(false);
  }
  useEffect(() => {
    let activo = true;
    async function cargarInicial() {
      const resultados = await Promise.allSettled([
        listarSemaforos(),
        listarBarrios(),
      ]);
      if (!activo) return;
      const [resultadoSemaforos, resultadoBarrios] = resultados;
      const errores = [];
      if (resultadoSemaforos.status === "fulfilled") {
        setSemaforos(resultadoSemaforos.value);
      } else {
        errores.push(
          resultadoSemaforos.reason?.message ||
            "No se pudieron cargar los semáforos.",
        );
      }
      if (resultadoBarrios.status === "fulfilled") {
        setBarrios(resultadoBarrios.value);
      } else {
        errores.push(
          resultadoBarrios.reason?.message ||
            "No se pudieron cargar los barrios.",
        );
      }
      if (errores.length > 0) {
        setError(errores.join(" | "));
      }
      setCargando(false);
    }
    cargarInicial();
    return () => {
      activo = false;
    };
  }, []);
  const estadisticas = useMemo(() => {
    return {
      total: semaforos.length,
      funcionando: semaforos.filter(
        (s) => estadoSemaforo(s.estado) === "FUNCIONANDO",
      ).length,
      danados: semaforos.filter((s) => estadoSemaforo(s.estado) === "DANADO")
        .length,
      mantenimiento: semaforos.filter(
        (s) => estadoSemaforo(s.estado) === "MANTENIMIENTO",
      ).length,
      vehiculares: semaforos.filter((s) => normalizar(s.tipo) === "VEHICULAR")
        .length,
      peatonales: semaforos.filter((s) => normalizar(s.tipo) === "PEATONAL")
        .length,
    };
  }, [semaforos]);
  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda);
    return semaforos.filter((semaforo) => {
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
  }, [semaforos, busqueda, filtroEstado, filtroTipo]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );
  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroTipo("TODOS");
    setPagina(1);
  }
  function cambiarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }
  function abrirNuevo() {
    setEditandoId(null);
    setFormulario({ ...FORMULARIO_VACIO });
    setError("");
    setAviso("");
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
    const confirmado = window.confirm(
      `¿Deseas eliminar el semáforo ${semaforo.codigo || semaforo.idSemaforo}?`,
    );
    if (!confirmado) return;
    setError("");
    setAviso("");
    try {
      await eliminarSemaforo(semaforo.idSemaforo);
      setAviso("Semáforo eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el semáforo.");
    }
  }
  return (
    <Layout
      titulo="Semáforos"
      activo="semaforos"
      busqueda={{
        placeholder: "Buscar por código, ubicación o barrio...",
      }}
    >
      <div className="sem-panel">
        <div className="row align-items-center mb-4">
          <div className="col">
            <h1 className="section-title-dash">Semáforos</h1>
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
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}
        {aviso && (
          <div className="alert alert-success" role="status">
            <i className="bi bi-check-circle me-2" />
            {aviso}
          </div>
        )}
        <div className="row g-3 mb-4">
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
              {[
                ["", "Todas", "pill-todas-dash"],
                ["FUNCIONANDO", "Funcionando", "pill-funcionando-dash"],
                ["DANADO", "Dañado", "pill-danado-dash"],
                [
                  "MANTENIMIENTO",
                  "En mantenimiento",
                  "pill-mantenimiento-dash",
                ],
              ].map(([valor, texto, clase]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={filtroEstado === valor}
                  className={`pill-filtro-dash ${clase} ${
                    filtroEstado === valor ? "pill-activa-dash" : ""
                  }`}
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
                className={`tab-dash-sem ${
                  filtroTipo === valor ? "active-dash" : ""
                }`}
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
                        {normalizar(semaforo.tipo) === "VEHICULAR"
                          ? "Vehicular"
                          : normalizar(semaforo.tipo) === "PEATONAL"
                            ? "Peatonal"
                            : semaforo.tipo || "—"}
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
                          onClick={() => borrarSemaforo(semaforo)}
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
          {visibles.length === 0 && (
            <div className="text-center text-muted py-4">
              <i className="bi bi-traffic-light fs-3 d-block mb-2" />
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
                disabled={paginaActual === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (numero) => (
                  <button
                    key={numero}
                    type="button"
                    className={`page-btn-dash ${
                      paginaActual === numero ? "active-dash" : ""
                    }`}
                    onClick={() => setPagina(numero)}
                  >
                    {numero}
                  </button>
                ),
              )}

              <button
                type="button"
                className="page-btn-dash"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        </div>
        {modalAbierto && (
          <div
            className="modal fade show modal-dash"
            id="modalSemaforo"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModalSemaforo"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={guardarSemaforo}>
                  <div className="modal-header">
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
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="inputCodigo" className="form-label-dash">
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
                        onChange={(e) => cambiarCampo("codigo", e.target.value)}
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
                      <label htmlFor="inputBarrio" className="form-label-dash">
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
                          <option key={barrio.idBarrio} value={barrio.idBarrio}>
                            {barrio.nombre}
                          </option>
                        ))}
                      </select>
                      {barrios.length === 0 && (
                        <small className="text-muted">
                          No hay barrios disponibles. Comprueba la conexión con
                          la API.
                        </small>
                      )}
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="inputTipo" className="form-label-dash">
                          Tipo
                        </label>
                        <select
                          id="inputTipo"
                          className="form-select form-control-dash"
                          value={formulario.tipo}
                          onChange={(e) => cambiarCampo("tipo", e.target.value)}
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
                  <div className="modal-footer">
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
      </div>
    </Layout>
  );
}
