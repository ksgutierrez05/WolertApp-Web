import { useEffect, useMemo, useState } from "react";

import Layout from "../../Components/transito/Layout";

import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAgentesDirector,
  listarUnidadesDirector,
  listarAtencionesDirector,
  registrarAgenteDirector,
  actualizarAgenteDirector,
  nombreAgente,
  nombreUnidadAgente,
  idAgente,
  estadoActivoAgente,
  fechaEsEsteMes,
  normalizar,
  estadoFinalizado,
} from "../../Services/directorTransitoService";

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
  {
    name: "primerNombre",
    label: "Primer nombre",
    maxLength: 12,
    required: true,
  },

  { name: "segundoNombre", label: "Segundo nombre", maxLength: 12 },

  {
    name: "primerApellido",
    label: "Primer apellido",
    maxLength: 20,
    required: true,
  },

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

export default function Agentes() {
  const [agentes, setAgentes] = useState([]);

  const [unidades, setUnidades] = useState([]);

  const [atenciones, setAtenciones] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("todos");

  const [pagina, setPagina] = useState(1);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState(null);

  const [formulario, setFormulario] = useState({ ...FORMULARIO_INICIAL });

  const [guardando, setGuardando] = useState(false);

  const [errorRegistro, setErrorRegistro] = useState("");

  const [mensajeRegistro, setMensajeRegistro] = useState("");

  const [mostrarExito, setMostrarExito] = useState(false);

  const [mostrarDireccion, setMostrarDireccion] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAgentesDirector(),
        listarUnidadesDirector(),
        listarAtencionesDirector(),
      ]);

      if (!activo) return;

      const errores = [];

      const [rAgentes, rUnidades, rAtenciones] = resultados;

      if (rAgentes.status === "fulfilled") setAgentes(rAgentes.value);
      else errores.push(rAgentes.reason?.message || "Error al cargar agentes");

      if (rUnidades.status === "fulfilled") setUnidades(rUnidades.value);
      else
        errores.push(rUnidades.reason?.message || "Error al cargar unidades");

      if (rAtenciones.status === "fulfilled") setAtenciones(rAtenciones.value);
      else
        errores.push(
          rAtenciones.reason?.message || "Error al cargar atenciones",
        );

      setError(
        errores.length
          ? `No se pudo cargar toda la información: ${errores.join(" | ")}`
          : "",
      );

      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const activos = agentes.filter((a) =>
    estadoActivoAgente(a.estadoAgente ?? a.estado),
  ).length;

  const inactivos = agentes.length - activos;

  const filtrados = useMemo(
    () =>
      agentes.filter((agente) => {
        const activo = estadoActivoAgente(agente.estadoAgente ?? agente.estado);

        if (filtro === "activos" && !activo) return false;

        if (filtro === "inactivos" && activo) return false;

        const contenido = normalizar(
          [
            nombreAgente(agente),
            agente.cedula,
            agente.numeroDocumento,

            agente.placa,
            nombreUnidadAgente(agente, unidades),
          ].join(" "),
        );

        return contenido.includes(normalizar(busqueda));
      }),
    [agentes, unidades, filtro, busqueda],
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  // Total de atenciones finalizadas durante el mes actual.
  const casosAtendidosMes = atenciones.filter(
    (atencion) =>
      fechaEsEsteMes(atencion.fechaAtencion) &&
      estadoFinalizado(atencion.estadoFinal),
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

    setErrorRegistro("");

    setMensajeRegistro("");

    setMostrarExito(false);

    setMostrarDireccion(false);

    setFormulario({ ...FORMULARIO_INICIAL });

    setMostrarModal(true);
  }

  function abrirEdicion(agente) {
    setAgenteEditando(agente);
    setErrorRegistro("");
    setMensajeRegistro("");
    setMostrarExito(false);
    const datos = Object.fromEntries(
      Object.keys(FORMULARIO_INICIAL).map((campo) => [
        campo,
        String(agente[campo] ?? ""),
      ]),
    );
    datos.cedula = String(agente.cedula ?? agente.numeroDocumento ?? "");
    datos.unidadTransitoId = String(
      agente.unidadTransitoId ?? agente.idUnidadTransito ?? "",
    );
    datos.password = ""; // Nunca precargar ni mostrar contraseñas.
    setFormulario(datos);
    setMostrarDireccion(
      ["calle", "carrera", "etapa", "manzana", "casa"].some(
        (campo) => datos[campo],
      ),
    );
    setMostrarModal(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setMostrarModal(false);
    setAgenteEditando(null);

    setErrorRegistro("");
  }

  async function guardarAgente(evento) {
    evento.preventDefault();

    if (guardando) return;

    setGuardando(true);

    setErrorRegistro("");

    setMensajeRegistro("");

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

      placa: formulario.placa.trim(),

      rango: opcional(formulario.rango),

      unidadTransitoId: formulario.unidadTransitoId
        ? Number(formulario.unidadTransitoId)
        : null,

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
          throw new Error(
            "Este agente no tiene identificador para actualizarlo.",
          );
        await actualizarAgenteDirector(identificador, datos);
      } else {
        await registrarAgenteDirector(datos);
      }

      setMostrarModal(false);
      setAgenteEditando(null);

      setFormulario({ ...FORMULARIO_INICIAL });

      setPagina(1);

      setFiltro("todos");

      setBusqueda("");

      setMensajeRegistro(
        agenteEditando
          ? "Los cambios del agente se guardaron correctamente."
          : "El agente de tránsito se registró correctamente.",
      );

      setMostrarExito(true);

      try {
        const agentesActualizados = await listarAgentesDirector();

        setAgentes(agentesActualizados);

        setError("");
      } catch (recargaError) {
        // El POST ya fue exitoso. No confundir un error de consulta con un fallo de registro.

        setError(
          `Registro exitoso, pero no se pudo actualizar el listado: ${recargaError?.message || "error de conexión"}.`,
        );
      }
    } catch (err) {
      setErrorRegistro(err.message || "No se pudo guardar el agente.");
    } finally {
      setGuardando(false);
    }
  }

  const renderCampo = ({
    name,
    label,
    maxLength,
    required = false,
    type = "text",
  }) => (
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

  return (
    <Layout
      titulo="Agentes de Tránsito"
      activo="agentes"
      busqueda={{ placeholder: "Buscar por agente, zona o placa..." }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">Agentes de Tránsito</h1>

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

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          color="blue"
          valor={agentes.length}
          label="Agentes totales"
          icono="bi-people"
        />

        <KpiCard
          color="green"
          valor={activos}
          label="Activos ahora"
          icono="bi-person-check"
        />

        <KpiCard
          color="red"
          valor={inactivos}
          label="Inactivos"
          icono="bi-person-dash"
        />

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
              ["todos", "Todos", agentes.length],
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
              placeholder="Buscar agente, cédula o zona..."
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
                <th>Agente</th>
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
                const activo = estadoActivoAgente(
                  agente.estadoAgente ?? agente.estado,
                );

                return (
                  <tr key={idAgente(agente) ?? indice}>
                    <td>
                      <div className="info-title-dash">
                        {nombreAgente(agente)}
                      </div>
                      <div className="info-sub-dash">
                        CC{" "}
                        {agente.cedula ??
                          agente.numeroDocumento ??
                          "No registrada"}
                      </div>
                    </td>

                    <td>{nombreUnidadAgente(agente, unidades)}</td>
                    <td>
                      <span className="dt-pill-placa">
                        {agente.placa || "Sin registrar"}
                      </span>
                    </td>
                    <td>
                      <span className="dt-pill-rango">
                        {agente.rango || "Sin asignar"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge-dash ${activo ? "badge-green-dash" : "badge-red-dash"}`}
                      >
                        {activo
                          ? "Activo"
                          : normalizar(
                                agente.estadoAgente ?? agente.estado,
                              ).includes("INACTIV")
                            ? "Inactivo"
                            : String(
                                agente.estadoAgente ??
                                  agente.estado ??
                                  "Sin estado",
                              )
                                .replace(/_/g, " ")
                                .toLocaleLowerCase("es")
                                .replace(/^./, (letra) =>
                                  letra.toLocaleUpperCase("es"),
                                )}
                      </span>
                    </td>

                    <td>{casosDelMes(agente)}</td>

                    <td className="text-end">
                      <div className="dt-acciones-agente">
                        <button
                          type="button"
                          className="dt-accion-agente editar"
                          title="Editar agente"
                          aria-label={`Editar ${nombreAgente(agente)}`}
                          onClick={() => abrirEdicion(agente)}
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button
                          type="button"
                          className="dt-accion-agente eliminar"
                          title="Eliminar: pendiente de confirmar endpoint de API"
                          aria-label={`Eliminar ${nombreAgente(agente)} (no disponible)`}
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
            {cargando ? "Consultando agentes..." : "No se encontraron agentes."}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {visibles.length} de {filtrados.length} agentes
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
                      <i
                        className={`bi ${agenteEditando ? "bi-pencil-square" : "bi-person-plus-fill"}`}
                      />
                    </span>

                    <div>
                      <span className="dt-registro-eyebrow">
                        DIRECCIÓN DE TRÁNSITO
                      </span>

                      <h2 id="tituloModalAgente">
                        {agenteEditando
                          ? "Editar agente de tránsito"
                          : "Registrar nuevo agente"}
                      </h2>

                      <p>
                        {agenteEditando
                          ? "Actualiza los datos del agente seleccionado."
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
                  {errorRegistro && (
                    <div className="dt-registro-error" role="alert">
                      <i className="bi bi-exclamation-circle-fill" />
                      <span>{errorRegistro}</span>
                    </div>
                  )}

                  <div className="dt-registro-intro">
                    <span>
                      <i className="bi bi-info-circle me-2" />
                      {agenteEditando
                        ? "Modifica los datos que necesites actualizar."
                        : "Completa los datos para crear el perfil del agente."}
                    </span>

                    <span className="dt-required-note">
                      {" "}
                      Campos obligatorios
                    </span>
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
                        <label
                          htmlFor="agente-correo"
                          className="dt-form-label"
                        >
                          Correo electrónico{" "}
                          <span className="dt-required"></span>
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
                        <label
                          htmlFor="agente-password"
                          className="dt-form-label"
                        >
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
                          placeholder={
                            agenteEditando
                              ? "Dejar vacía para no cambiarla"
                              : ""
                          }
                          disabled={guardando}
                        />
                      </div>
                    </div>
                  </section>

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
                      {renderCampo({
                        name: "placa",
                        label: "Placa",
                        maxLength: 20,
                        required: true,
                      })}

                      {renderCampo({
                        name: "rango",
                        label: "Rango",
                        maxLength: 30,
                      })}

                      <div className="col-12">
                        <label
                          htmlFor="agente-unidad"
                          className="dt-form-label"
                        >
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
                            const id =
                              unidad.idUnidadTransito ??
                              unidad.idUnidad ??
                              unidad.id;

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

                      <i
                        className={`bi bi-chevron-${mostrarDireccion ? "up" : "down"}`}
                      />
                    </button>

                    {mostrarDireccion && (
                      <div className="row g-3 mt-1">
                        {CAMPOS_DIRECCION.map(renderCampo)}
                      </div>
                    )}
                  </section>
                </div>

                <div className="dt-registro-footer">
                  <span className="dt-registro-footer-note">
                    <i className="bi bi-shield-check me-2" />
                    {agenteEditando
                      ? "Edición de personal"
                      : "Registro de personal"}
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

                    <button
                      type="submit"
                      className="dt-btn-registrar"
                      disabled={guardando}
                    >
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />{" "}
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i
                            className={`bi ${agenteEditando ? "bi-check-lg" : "bi-plus-lg"}`}
                          />{" "}
                          {agenteEditando
                            ? "Guardar cambios"
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

      {mostrarExito && (
        <div
          className="dt-exito-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dt-exito-titulo"
        >
          <div className="dt-exito-card">
            <div className="dt-exito-decoracion" />

            <div className="dt-exito-icon">
              <i className="bi bi-check-lg" />
            </div>

            <span className="dt-exito-etiqueta">REGISTRO EXITOSO</span>

            <h2 id="dt-exito-titulo">¡Agente registrado!</h2>

            <p>
              {mensajeRegistro || agenteEditando
                ? "Los cambios del agente se guardaron correctamente."
                : "El agente de tránsito se registró correctamente."}
            </p>

            <div className="dt-exito-detalle">
              <div>
                <i className="bi bi-person-badge" />
                <span>Personal de Tránsito</span>
              </div>

              <span className="dt-exito-estado">
                <i className="bi bi-check-circle-fill" /> Completado
              </span>
            </div>

            <button
              type="button"
              className="dt-btn-exito"
              onClick={() => {
                setMostrarExito(false);
                setMensajeRegistro("");
              }}
            >
              Volver al listado <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
