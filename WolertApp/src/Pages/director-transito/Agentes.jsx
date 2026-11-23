import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarAgentesDirector,
  listarUnidadesDirector,
  listarAtencionesDirector,
  registrarAgenteDirector,
  actualizarAgenteDirector,
  registrarCentralTransito,
  listarUsuariosTransito,
  nombreAgente,
  nombreUnidadAgente,
  idAgente,
  estadoActivoAgente,
  fechaEsEsteMes,
  normalizar,
  estadoFinalizado,
} from "../../Services/directorTransitoService";

function Aviso({ aviso, cerrar }) {
  useEffect(() => {
    const tiempo = setTimeout(() => cerrar(aviso.id), aviso.tipo === "error" ? 6500 : 4000);
    return () => clearTimeout(tiempo);
  }, [aviso.id, aviso.tipo, cerrar]);
  const error = aviso.tipo === "error";
  return (
    <div
      role={error ? "alert" : "status"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        background: "#fff",
        color: "#25344a",
        borderRadius: 14,
        boxShadow: "0 8px 28px rgba(0,0,0,.14)",
        border: `1px solid ${error ? "#f4c5ca" : "#cce9d9"}`,
        borderLeft: `4px solid ${error ? "#d84b5c" : "#34a36a"}`,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
      }}
    >
      <i
        className={`bi ${error ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`}
        style={{ color: error ? "#d84b5c" : "#34a36a", fontSize: 19 }}
      />
      <span style={{ flex: 1, lineHeight: 1.5 }}>{aviso.mensaje}</span>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => cerrar(aviso.id)}
        style={{ border: 0, background: "transparent", color: "#748196", cursor: "pointer" }}
      >
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}

const POR_PAGINA = 5;

const FORMULARIO_INICIAL = {
  cedula: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  correo: "",
  telefono: "",
  username: "",
  password: "",
  placa: "",
  rango: "",
  unidadTransitoId: "",
  calle: "",
  carrera: "",
  etapa: "",
  manzana: "",
  casa: "",
};

const CAMPOS_PERSONALES = [
  { name: "primerNombre", label: "Primer nombre", maxLength: 12, required: true },
  { name: "segundoNombre", label: "Segundo nombre", maxLength: 12 },
  { name: "primerApellido", label: "Primer apellido", maxLength: 20, required: true },
  { name: "segundoApellido", label: "Segundo apellido", maxLength: 20 },
  { name: "cedula", label: "Cédula", maxLength: 11, required: true },
  { name: "telefono", label: "Teléfono", maxLength: 10 },
];

const CAMPOS_DIRECCION = [
  { name: "calle", label: "Calle", maxLength: 50 },
  { name: "carrera", label: "Carrera", maxLength: 50 },
  { name: "etapa", label: "Etapa", maxLength: 20 },
  { name: "manzana", label: "Manzana", maxLength: 20 },
  { name: "casa", label: "Casa", maxLength: 10 },
];

// Central se almacena en USUARIOS; no tiene placa, rango ni unidad.
const estaActivo = (p) =>
  p.tipoPersonal === "CENTRAL_TRANSITO"
    ? normalizar(p.estado) === "ACTIVO"
    : estadoActivoAgente(p.estadoAgente ?? p.estado);

export default function Agentes() {
  const [agentes, setAgentes] = useState([]);
  const [centrales, setCentrales] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [unidades, setUnidades] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState(null);
  const [formulario, setFormulario] = useState({ ...FORMULARIO_INICIAL });
  const [guardando, setGuardando] = useState(false);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [tipoPersonal, setTipoPersonal] = useState("AGENTE_TRANSITO");

  const esCentralForm = tipoPersonal === "CENTRAL_TRANSITO";

  const notificar = useCallback((mensaje, tipo = "error") => {
    setAvisos((previos) => [...previos, { id: `${Date.now()}-${Math.random()}`, mensaje, tipo }]);
  }, []);

  const cerrarAviso = useCallback(
    (id) => setAvisos((previos) => previos.filter((aviso) => aviso.id !== id)),
    [],
  );

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAgentesDirector(),
        listarUnidadesDirector(),
        listarAtencionesDirector(),
        listarUsuariosTransito(),
      ]);
      if (!activo) return;
      const errores = [];
      const [rAgentes, rUnidades, rAtenciones, rUsuarios] = resultados;
      if (rAgentes.status === "fulfilled") setAgentes(rAgentes.value);
      else errores.push(rAgentes.reason?.message || "Error al cargar agentes");
      if (rUnidades.status === "fulfilled") setUnidades(rUnidades.value);
      else errores.push(rUnidades.reason?.message || "Error al cargar unidades");
      if (rAtenciones.status === "fulfilled") setAtenciones(rAtenciones.value);
      else errores.push(rAtenciones.reason?.message || "Error al cargar atenciones");
      if (rUsuarios.status === "fulfilled") {
        setCentrales(rUsuarios.value.filter((u) => u.rolNombre === "CENTRAL_TRANSITO"));
      } else errores.push(rUsuarios.reason?.message || "Error al cargar usuarios de central");
      if (errores.length) notificar(`No se pudo cargar toda la información: ${errores.join(" | ")}`);
      setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [notificar]);

  const personal = useMemo(
    () => [
      ...agentes.map((a) => ({ ...a, tipoPersonal: "AGENTE_TRANSITO" })),
      ...centrales.map((u) => ({ ...u, tipoPersonal: "CENTRAL_TRANSITO" })),
    ],
    [agentes, centrales],
  );

  const activos = personal.filter(estaActivo).length;
  const inactivos = personal.length - activos;

  const filtrados = useMemo(
    () =>
      personal.filter((p) => {
        if (filtroTipo !== "todos" && p.tipoPersonal !== filtroTipo) return false;
        const activo = estaActivo(p);
        if (filtro === "activos" && !activo) return false;
        if (filtro === "inactivos" && activo) return false;
        const contenido = normalizar(
          [
            p.tipoPersonal === "CENTRAL_TRANSITO" ? p.nombreCompleto : nombreAgente(p),
            p.cedula,
            p.numeroDocumento,
            p.username,
            p.correo,
            p.placa,
            p.tipoPersonal === "CENTRAL_TRANSITO" ? "central transito" : nombreUnidadAgente(p, unidades),
          ]
            .filter(Boolean)
            .join(" "),
        );
        return contenido.includes(normalizar(busqueda));
      }),
    [personal, unidades, filtro, filtroTipo, busqueda],
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  // Total de atenciones finalizadas durante el mes actual.
  const casosAtendidosMes = atenciones.filter(
    (atencion) => fechaEsEsteMes(atencion.fechaAtencion) && estadoFinalizado(atencion.estadoFinal),
  ).length;

  function casosDelMes(agente) {
    const id = idAgente(agente);
    return atenciones.filter(
      (atencion) =>
        String(atencion.idAgenteTransito) === String(id) &&
        fechaEsEsteMes(atencion.fechaAtencion) &&
        estadoFinalizado(atencion.estadoFinal),
    ).length;
  }

  function cambiarFiltro(valor) {
    setFiltro(valor);
    setPagina(1);
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  }

  function abrirModal() {
    setAgenteEditando(null);
    setTipoPersonal("AGENTE_TRANSITO");
    setMostrarDireccion(false);
    setFormulario({ ...FORMULARIO_INICIAL });
    setMostrarModal(true);
  }

  function abrirEdicion(agente) {
    setAgenteEditando(agente);
    setTipoPersonal("AGENTE_TRANSITO");
    const datos = Object.fromEntries(
      Object.keys(FORMULARIO_INICIAL).map((campo) => [campo, String(agente[campo] ?? "")]),
    );
    datos.cedula = String(agente.cedula ?? agente.numeroDocumento ?? "");
    datos.unidadTransitoId = String(agente.unidadTransitoId ?? agente.idUnidadTransito ?? "");
    datos.password = ""; // Nunca precargar ni mostrar contraseñas.
    setFormulario(datos);
    setMostrarDireccion(
      ["calle", "carrera", "etapa", "manzana", "casa"].some((campo) => datos[campo]),
    );
    setMostrarModal(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setMostrarModal(false);
    setAgenteEditando(null);
  }

  async function guardarAgente(evento) {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true);
    const opcional = (valor) => valor.trim() || null;
    const datos = {
      cedula: formulario.cedula.trim(),
      primerNombre: formulario.primerNombre.trim(),
      segundoNombre: opcional(formulario.segundoNombre),
      primerApellido: formulario.primerApellido.trim(),
      segundoApellido: opcional(formulario.segundoApellido),
      correo: formulario.correo.trim(),
      telefono: opcional(formulario.telefono),
      username: formulario.username.trim(),
      ...(agenteEditando
        ? formulario.password
          ? { password: formulario.password }
          : {}
        : { password: formulario.password }),
      ...(esCentralForm
        ? {}
        : {
            placa: formulario.placa.trim(),
            rango: opcional(formulario.rango),
            unidadTransitoId: formulario.unidadTransitoId ? Number(formulario.unidadTransitoId) : null,
          }),
      barrioId: null,
      calle: opcional(formulario.calle),
      carrera: opcional(formulario.carrera),
      etapa: opcional(formulario.etapa),
      manzana: opcional(formulario.manzana),
      casa: opcional(formulario.casa),
    };
    try {
      if (agenteEditando) {
        const identificador = idAgente(agenteEditando);
        if (identificador == null)
          throw new Error("Este agente no tiene identificador para actualizarlo.");
        await actualizarAgenteDirector(identificador, datos);
      } else if (esCentralForm) {
        await registrarCentralTransito(datos);
      } else {
        await registrarAgenteDirector(datos);
      }
      setMostrarModal(false);
      setAgenteEditando(null);
      setFormulario({ ...FORMULARIO_INICIAL });
      setPagina(1);
      setFiltro("todos");
      setFiltroTipo("todos");
      setBusqueda("");
      notificar(
        agenteEditando
          ? "Los cambios del agente se guardaron correctamente."
          : esCentralForm
            ? "El usuario de Central de Tránsito se registró correctamente."
            : "El agente de tránsito se registró correctamente.",
        "exito",
      );
      try {
        const [agentesActualizados, usuariosActualizados] = await Promise.all([
          listarAgentesDirector(),
          listarUsuariosTransito(),
        ]);
        setAgentes(agentesActualizados);
        setCentrales(usuariosActualizados.filter((u) => u.rolNombre === "CENTRAL_TRANSITO"));
      } catch (recargaError) {
        // El POST ya fue exitoso. No confundir un error de consulta con un fallo de registro.
        notificar(
          `Registro exitoso, pero no se pudo actualizar el listado: ${recargaError?.message || "error de conexión"}.`,
        );
      }
    } catch (err) {
      notificar(err.message || "No se pudo guardar el agente.");
    } finally {
      setGuardando(false);
    }
  }

  const renderCampo = ({ name, label, maxLength, required = false, type = "text" }) => (
    <div className="col-md-6" key={name}>
      <label htmlFor={`agente-${name}`} className="dt-form-label">
        {label}
        {required && <span className="dt-required"> </span>}
      </label>
      <input
        id={`agente-${name}`}
        type={type}
        className="form-control dt-form-input"
        name={name}
        value={formulario[name]}
        onChange={cambiarCampo}
        maxLength={maxLength}
        required={required}
        disabled={guardando}
      />
    </div>
  );

  function textoEstado(agente) {
    const estado = agente.estadoAgente ?? agente.estado;
    if (normalizar(estado).includes("INACTIV")) return "Inactivo";
    return String(estado ?? "Sin estado")
      .replace(/_/g, " ")
      .toLocaleLowerCase("es")
      .replace(/^./, (letra) => letra.toLocaleUpperCase("es"));
  }

  return (
    <Layout
      rol="director"
      titulo="Agentes de Tránsito"
      activo="agentes"
      busqueda={{ placeholder: "Buscar por agente, zona o placa..." }}
    >
      <style>{`
        .dt-titulo-agentes {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.45rem, 2.2vw, 1.85rem);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.045em;
          color: #243b59;
          margin: 5px 0 9px;
        }
        .dt-acciones-agente { display: inline-flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .dt-acciones-agente .dt-accion-agente {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; min-width: 34px; padding: 0;
          border: 1px solid transparent; border-radius: 11px;
          transition: background-color .2s ease, transform .2s ease;
        }
        .dt-acciones-agente .dt-accion-agente i { font-size: 15px; line-height: 1; }
        .dt-acciones-agente .dt-accion-agente.editar { background: #fff4dc; color: #d48b00; border-color: #ffe8b5; cursor: pointer; }
        .dt-acciones-agente .dt-accion-agente.editar:hover { background: #ffe7ae; transform: translateY(-1px); }
        .dt-acciones-agente .dt-accion-agente.editar:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .dt-acciones-agente .dt-accion-agente.eliminar { background: #fdebec; color: #dc3545; border-color: #f9d5d9; }
        .dt-acciones-agente .dt-accion-agente.eliminar:disabled { opacity: .75; cursor: not-allowed; }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="st-eyebrow">DIRECCIÓN DE TRÁNSITO</span>
          <h1 className="dt-titulo-agentes">Agentes de tránsito</h1>
          <p className="section-text-dash mb-0">
            Gestiona el personal de campo asignado al módulo de Tránsito.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={abrirModal}
        >
          <i className="bi bi-plus-lg me-2" />
          Nuevo agente
        </button>
      </div>
      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando información de agentes...
        </div>
      )}
      <div className="row g-3 mb-4">
        <KpiCard color="blue" valor={personal.length} label="Personal total" icono="bi-people" />
        <KpiCard color="green" valor={activos} label="Activos ahora" icono="bi-person-check" />
        <KpiCard color="red" valor={inactivos} label="Inactivos" icono="bi-person-dash" />
        <KpiCard
          color="blue"
          valor={casosAtendidosMes}
          label="Casos atendidos este mes"
          icono="bi-clipboard-check"
        />
      </div>
      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {[
              ["todos", "Todos", personal.length],
              ["AGENTE_TRANSITO", "Agentes", agentes.length],
              ["CENTRAL_TRANSITO", "Central", centrales.length],
            ].map(([valor, nombre, cantidad]) => (
              <button
                key={valor}
                type="button"
                className={`tab-dash ${filtroTipo === valor ? "active-dash" : ""}`}
                onClick={() => {
                  setFiltroTipo(valor);
                  setPagina(1);
                }}
              >
                {nombre} ({cantidad})
              </button>
            ))}
          </div>
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {[
              ["todos", "Todos", personal.length],
              ["activos", "Activos", activos],
              ["inactivos", "Inactivos", inactivos],
            ].map(([valor, nombre, cantidad]) => (
              <button
                key={valor}
                type="button"
                className={`tab-dash ${filtro === valor ? "active-dash" : ""}`}
                onClick={() => cambiarFiltro(valor)}
              >
                {nombre} ({cantidad})
              </button>
            ))}
          </div>
          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar personal, cédula o usuario..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Personal</th>
                <th>Rol</th>
                <th>Zona asignada</th>
                <th>Placa</th>
                <th>Rango</th>
                <th>Estado</th>
                <th>Casos atendidos (mes)</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((agente, indice) => {
                const esCentral = agente.tipoPersonal === "CENTRAL_TRANSITO";
                const activo = estaActivo(agente);
                const nombre = esCentral ? agente.nombreCompleto : nombreAgente(agente);
                return (
                  <tr key={`${agente.tipoPersonal}-${agente.idUsuario ?? idAgente(agente) ?? indice}`}>
                    <td>
                      <div className="info-title-dash">{nombre}</div>
                      <div className="info-sub-dash">
                        {esCentral
                          ? `@${agente.username ?? "Sin usuario"}`
                          : `CC ${agente.cedula ?? agente.numeroDocumento ?? "No registrada"}`}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-dash ${esCentral ? "badge-blue-dash" : "badge-green-dash"}`}>
                        {esCentral ? "Central" : "Agente"}
                      </span>
                    </td>
                    <td>{esCentral ? "No aplica" : nombreUnidadAgente(agente, unidades)}</td>
                    <td>
                      <span className="dt-pill-placa">
                        {esCentral ? "No aplica" : agente.placa || "Sin registrar"}
                      </span>
                    </td>
                    <td>
                      <span className="dt-pill-rango">
                        {esCentral ? "No aplica" : agente.rango || "Sin asignar"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-dash ${activo ? "badge-green-dash" : "badge-red-dash"}`}>
                        {activo ? "Activo" : textoEstado(agente)}
                      </span>
                    </td>
                    <td>{esCentral ? "—" : casosDelMes(agente)}</td>
                    <td className="text-end">
                      <div className="dt-acciones-agente">
                        <button
                          type="button"
                          className="dt-accion-agente editar"
                          title={
                            esCentral
                              ? "La edición de Central requiere permisos en UsuariosController"
                              : "Editar agente"
                          }
                          disabled={esCentral}
                          aria-label={`Editar ${nombre}`}
                          onClick={() => abrirEdicion(agente)}
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button
                          type="button"
                          className="dt-accion-agente eliminar"
                          title="Eliminar: pendiente de confirmar endpoint de API"
                          aria-label={`Eliminar ${nombre} (no disponible)`}
                          disabled
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {visibles.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            {cargando ? "Consultando personal..." : "No se encontró personal."}
          </p>
        )}
        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {visibles.length} de {filtrados.length} personas
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
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`page-btn-dash ${paginaActual === numero ? "active-dash" : ""}`}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}
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
      {mostrarModal && (
        <div
          className="modal fade show dt-modal-overlay"
          id="modalAgente"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloModalAgente"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-dialog-centered dt-modal-dialog">
            <div className="modal-content dt-registro-modal">
              <form onSubmit={guardarAgente}>
                <div className="dt-registro-header">
                  <div className="dt-registro-header-content">
                    <span className="dt-registro-icon">
                      <i className={`bi ${agenteEditando ? "bi-pencil-square" : "bi-person-plus-fill"}`} />
                    </span>
                    <div>
                      <span className="dt-registro-eyebrow">DIRECCIÓN DE TRÁNSITO</span>
                      <h2 id="tituloModalAgente">
                        {agenteEditando
                          ? "Editar agente de tránsito"
                          : esCentralForm
                            ? "Registrar usuario de central"
                            : "Registrar nuevo agente"}
                      </h2>
                      <p>
                        {agenteEditando
                          ? "Actualiza los datos del agente seleccionado."
                          : esCentralForm
                            ? "Crea una cuenta para la Central de Tránsito."
                            : "Incorpora personal operativo al sistema WolertApp."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dt-registro-close"
                    aria-label="Cerrar formulario"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <div className="dt-registro-body">
                  {!agenteEditando && (
                    <div className="d-flex gap-2 mb-4 flex-wrap" role="group" aria-label="Tipo de personal">
                      <button
                        type="button"
                        className={`btn rounded-pill px-4 fw-bold ${!esCentralForm ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setTipoPersonal("AGENTE_TRANSITO")}
                        disabled={guardando}
                      >
                        Agente de tránsito
                      </button>
                      <button
                        type="button"
                        className={`btn rounded-pill px-4 fw-bold ${esCentralForm ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setTipoPersonal("CENTRAL_TRANSITO")}
                        disabled={guardando}
                      >
                        Central de tránsito
                      </button>
                    </div>
                  )}
                  <div className="dt-registro-intro">
                    <span>
                      <i className="bi bi-info-circle me-2" />
                      {agenteEditando
                        ? "Modifica los datos que necesites actualizar."
                        : esCentralForm
                          ? "Completa los datos para crear el usuario de central."
                          : "Completa los datos para crear el perfil del agente."}
                    </span>
                    <span className="dt-required-note"> Campos obligatorios</span>
                  </div>
                  <section className="dt-form-section">
                    <div className="dt-form-section-header">
                      <span className="dt-form-section-icon">
                        <i className="bi bi-person-vcard" />
                      </span>
                      <div>
                        <h3>Información personal</h3>
                        <p>Identificación y datos de contacto</p>
                      </div>
                      <span className="dt-section-number">01</span>
                    </div>
                    <div className="row g-3">
                      {CAMPOS_PERSONALES.map(renderCampo)}
                      <div className="col-12">
                        <label htmlFor="agente-correo" className="dt-form-label">
                          Correo electrónico <span className="dt-required"></span>
                        </label>
                        <input
                          id="agente-correo"
                          type="email"
                          className="form-control dt-form-input"
                          name="correo"
                          value={formulario.correo}
                          onChange={cambiarCampo}
                          maxLength={40}
                          placeholder="ejemplo@correo.com"
                          required
                          disabled={guardando}
                        />
                      </div>
                    </div>
                  </section>
                  <section className="dt-form-section">
                    <div className="dt-form-section-header">
                      <span className="dt-form-section-icon">
                        <i className="bi bi-shield-lock" />
                      </span>
                      <div>
                        <h3>Acceso al sistema</h3>
                        <p>Credenciales para ingresar a WolertApp</p>
                      </div>
                      <span className="dt-section-number">02</span>
                    </div>
                    <div className="row g-3">
                      {renderCampo({
                        name: "username",
                        label: "Nombre de usuario",
                        maxLength: 15,
                        required: true,
                      })}
                      <div className="col-md-6">
                        <label htmlFor="agente-password" className="dt-form-label">
                          Contraseña <span className="dt-required"></span>
                        </label>
                        <input
                          id="agente-password"
                          type="password"
                          className="form-control dt-form-input"
                          name="password"
                          value={formulario.password}
                          onChange={cambiarCampo}
                          maxLength={100}
                          autoComplete="new-password"
                          required={!agenteEditando}
                          placeholder={agenteEditando ? "Dejar vacía para no cambiarla" : ""}
                          disabled={guardando}
                        />
                      </div>
                    </div>
                  </section>
                  {!esCentralForm && (
                    <section className="dt-form-section">
                      <div className="dt-form-section-header">
                        <span className="dt-form-section-icon">
                          <i className="bi bi-person-badge" />
                        </span>
                        <div>
                          <h3>Asignación operativa</h3>
                          <p>Identificación laboral y unidad de tránsito</p>
                        </div>
                        <span className="dt-section-number">03</span>
                      </div>
                      <div className="row g-3">
                        {renderCampo({ name: "placa", label: "Placa", maxLength: 20, required: true })}
                        {renderCampo({ name: "rango", label: "Rango", maxLength: 30 })}
                        <div className="col-12">
                          <label htmlFor="agente-unidad" className="dt-form-label">
                            Unidad asignada
                          </label>
                          <select
                            id="agente-unidad"
                            className="form-select dt-form-input"
                            name="unidadTransitoId"
                            value={formulario.unidadTransitoId}
                            onChange={cambiarCampo}
                            disabled={guardando}
                          >
                            <option value="">Sin asignar</option>
                            {unidades.map((unidad, indice) => {
                              const id = unidad.idUnidadTransito ?? unidad.idUnidad ?? unidad.id;
                              return id == null ? null : (
                                <option key={id ?? indice} value={id}>
                                  {unidad.nombre ?? `Unidad ${id}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </section>
                  )}
                  <section className="dt-form-section dt-direccion-section">
                    <button
                      type="button"
                      className="dt-direccion-toggle"
                      onClick={() => setMostrarDireccion((previo) => !previo)}
                      aria-expanded={mostrarDireccion}
                    >
                      <span className="dt-form-section-icon">
                        <i className="bi bi-geo-alt" />
                      </span>
                      <span className="dt-direccion-title">
                        <strong>Dirección del agente</strong>
                        <small>Información adicional · Opcional</small>
                      </span>
                      <i className={`bi bi-chevron-${mostrarDireccion ? "up" : "down"}`} />
                    </button>
                    {mostrarDireccion && (
                      <div className="row g-3 mt-1">{CAMPOS_DIRECCION.map(renderCampo)}</div>
                    )}
                  </section>
                </div>
                <div className="dt-registro-footer">
                  <span className="dt-registro-footer-note">
                    <i className="bi bi-shield-check me-2" />
                    {agenteEditando ? "Edición de personal" : "Registro de personal"}
                  </span>
                  <div className="dt-registro-actions">
                    <button
                      type="button"
                      className="dt-btn-cancelar"
                      onClick={cerrarModal}
                      disabled={guardando}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="dt-btn-registrar" disabled={guardando}>
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm" /> Guardando...
                        </>
                      ) : (
                        <>
                          <i className={`bi ${agenteEditando ? "bi-check-lg" : "bi-plus-lg"}`} />{" "}
                          {agenteEditando
                            ? "Guardar cambios"
                            : esCentralForm
                              ? "Registrar usuario"
                              : "Registrar agente"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {createPortal(
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 99999,
            width: "min(370px, calc(100vw - 32px))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          {avisos.map((aviso) => (
            <div key={aviso.id} style={{ pointerEvents: "auto" }}>
              <Aviso aviso={aviso} cerrar={cerrarAviso} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </Layout>
  );
}