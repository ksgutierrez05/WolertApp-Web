
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAgentesDirector,
  listarUnidadesDirector,
  listarAtencionesDirector,
  registrarAgenteDirector,
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
  barrioId: "",
  calle: "",
  carrera: "",
  etapa: "",
  manzana: "",
  casa: "",
};

const CAMPOS_PERSONALES = [
  { name: "primerNombre", label: "Primer nombre", max: 12, required: true },
  { name: "segundoNombre", label: "Segundo nombre", max: 12 },
  { name: "primerApellido", label: "Primer apellido", max: 20, required: true },
  { name: "segundoApellido", label: "Segundo apellido", max: 20 },
  { name: "cedula", label: "Cédula", max: 11, required: true },
  { name: "telefono", label: "Teléfono", max: 10 },
];

const CAMPOS_DIRECCION = [
  { name: "calle", label: "Calle", max: 50 },
  { name: "carrera", label: "Carrera", max: 50 },
  { name: "etapa", label: "Etapa", max: 20 },
  { name: "manzana", label: "Manzana", max: 20 },
  { name: "casa", label: "Casa", max: 10 },
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
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [mensajeRegistro, setMensajeRegistro] = useState("");

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

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      } else {
        errores.push(rAgentes.reason?.message || "Error al cargar agentes");
      }

      if (rUnidades.status === "fulfilled") {
        setUnidades(rUnidades.value);
      } else {
        errores.push(rUnidades.reason?.message || "Error al cargar unidades");
      }

      if (rAtenciones.status === "fulfilled") {
        setAtenciones(rAtenciones.value);
      } else {
        errores.push(rAtenciones.reason?.message || "Error al cargar atenciones");
      }

      setError(errores.join(" | "));
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const activos = agentes.filter((a) =>
    estadoActivoAgente(a.estadoAgente ?? a.estado)
  ).length;

  const inactivos = agentes.filter(
    (a) => !estadoActivoAgente(a.estadoAgente ?? a.estado)
  ).length;

  const filtrados = useMemo(() => {
    return agentes.filter((agente) => {
      const activo = estadoActivoAgente(
        agente.estadoAgente ?? agente.estado
      );

      if (filtro === "activos" && !activo) return false;
      if (filtro === "inactivos" && activo) return false;

      const contenido = normalizar([
        nombreAgente(agente),
        agente.cedula,
        agente.numeroDocumento,
        agente.placa,
        nombreUnidadAgente(agente, unidades),
      ].join(" "));

      return contenido.includes(normalizar(busqueda));
    });
  }, [agentes, unidades, filtro, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  function casosDelMes(agente) {
    const id = idAgente(agente);

    return atenciones.filter(
      (atencion) =>
        String(atencion.idAgenteTransito) === String(id) &&
        fechaEsEsteMes(atencion.fechaAtencion) &&
        estadoFinalizado(atencion.estadoFinal)
    ).length;
  }

  function cambiarFiltro(valor) {
    setFiltro(valor);
    setPagina(1);
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function abrirModal() {
    setFormulario({ ...FORMULARIO_INICIAL });
    setErrorRegistro("");
    setMensajeRegistro("");
    setMostrarModal(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setMostrarModal(false);
    setErrorRegistro("");
  }

  async function guardarAgente(evento) {
    evento.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setErrorRegistro("");
    setMensajeRegistro("");

    const obligatorio = [
      "cedula",
      "primerNombre",
      "primerApellido",
      "correo",
      "username",
      "password",
      "placa",
    ];

    if (obligatorio.some((campo) => !formulario[campo].trim())) {
      setErrorRegistro("Completa todos los campos obligatorios.");
      setGuardando(false);
      return;
    }

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
      password: formulario.password,
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
      await registrarAgenteDirector(datos);

      setMostrarModal(false);
      setFormulario({ ...FORMULARIO_INICIAL });
      setMensajeRegistro("Agente de tránsito registrado correctamente.");
      setPagina(1);
      setFiltro("todos");
      setBusqueda("");

      try {
        const agentesActualizados = await listarAgentesDirector();
        setAgentes(agentesActualizados);
      } catch (errorActualizacion) {
        setError(
          "El agente se registró, pero no se pudo actualizar la lista: " +
          errorActualizacion.message
        );
      }
    } catch (errorGuardado) {
      setErrorRegistro(
        errorGuardado.message || "No se pudo registrar el agente."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Layout
      titulo="Agentes de Tránsito"
      activo="agentes"
      busqueda={{
        placeholder: "Buscar por agente, zona o placa...",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">
            Agentes de Tránsito
          </h1>
          <p className="section-text-dash mb-0">
            Gestiona el personal de campo asignado al módulo de Tránsito.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={abrirModal}
        >
          <i className="bi bi-person-plus me-2" />
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

      {mensajeRegistro && (
        <div className="alert alert-success" role="status">
          <i className="bi bi-check-circle me-2" />
          {mensajeRegistro}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          variante="plano"
          color="blue"
          valor={agentes.length}
          label="Agentes totales"
          icono="bi-people"
        />

        <KpiCard
          variante="plano"
          color="green"
          valor={activos}
          label="Activos ahora"
          icono="bi-person-check"
        />

        <KpiCard
          variante="plano"
          color="red"
          valor={inactivos}
          label="Inactivos"
          icono="bi-person-dash"
        />

        <KpiCard
          variante="plano"
          color="amber"
          valor="—"
          label="Tiempo prom. de atención"
          icono="bi-stopwatch"
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
                className={`tab-dash ${
                  filtro === valor ? "active-dash" : ""
                }`}
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
                <th>Estado</th>
                <th>Casos atendidos (mes)</th>
                <th>Tiempo prom. atención</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((agente, indice) => {
                const activo = estadoActivoAgente(
                  agente.estadoAgente ?? agente.estado
                );

                return (
                  <tr key={idAgente(agente) ?? indice}>
                    <td>
                      <div className="info-title-dash">
                        {nombreAgente(agente)}
                      </div>

                      <div className="info-sub-dash">
                        CC {agente.cedula ??
                          agente.numeroDocumento ??
                          "No registrada"}
                      </div>
                    </td>

                    <td>
                      {nombreUnidadAgente(agente, unidades)}
                    </td>

                    <td>
                      <span
                        className={`badge-dash ${
                          activo
                            ? "badge-green-dash"
                            : "badge-red-dash"
                        }`}
                      >
                        {agente.estadoAgente ??
                          agente.estado ??
                          "Sin estado"}
                      </span>
                    </td>

                    <td>{casosDelMes(agente)}</td>
                    <td>—</td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        title="Eliminar no disponible"
                        disabled
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            {cargando
              ? "Consultando agentes..."
              : "No se encontraron agentes."}
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
              onClick={() =>
                setPagina((p) => Math.max(1, p - 1))
              }
            >
              <i className="bi bi-chevron-left" />
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, i) => i + 1
            ).map((numero) => (
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
            ))}

            <button
              type="button"
              className="page-btn-dash"
              disabled={paginaActual === totalPaginas}
              onClick={() =>
                setPagina((p) => Math.min(totalPaginas, p + 1))
              }
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div
          className="modal fade show"
          id="modalAgente"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloModalAgente"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
            overflowY: "auto",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-dash">
              <form onSubmit={guardarAgente}>
                <div className="modal-header border-0 pb-0">
                  <h5
                    id="tituloModalAgente"
                    className="panel-title-dash mb-0"
                  >
                    Nuevo agente de tránsito
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={cerrarModal}
                    disabled={guardando}
                  />
                </div>

                <div className="modal-body">
                  {errorRegistro && (
                    <div
                      className="alert alert-danger small"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle me-2" />
                      {errorRegistro}
                    </div>
                  )}

                  <h6 className="fw-bold mb-3">
                    Datos personales
                  </h6>

                  <div className="row g-3">
                    {CAMPOS_PERSONALES.map((campo) => (
                      <div
                        className="col-md-6"
                        key={campo.name}
                      >
                        <label
                          className="config-field-label-dash"
                          htmlFor={`agente-${campo.name}`}
                        >
                          {campo.label}
                          {campo.required && " *"}
                        </label>

                        <input
                          id={`agente-${campo.name}`}
                          type="text"
                          className="form-control"
                          name={campo.name}
                          value={formulario[campo.name]}
                          onChange={cambiarCampo}
                          maxLength={campo.max}
                          required={Boolean(campo.required)}
                          disabled={guardando}
                        />
                      </div>
                    ))}

                    <div className="col-12">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-correo"
                      >
                        Correo electrónico *
                      </label>

                      <input
                        id="agente-correo"
                        type="email"
                        className="form-control"
                        name="correo"
                        value={formulario.correo}
                        onChange={cambiarCampo}
                        maxLength={40}
                        required
                        disabled={guardando}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="fw-bold mb-3">
                    Acceso al sistema
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-username"
                      >
                        Nombre de usuario *
                      </label>

                      <input
                        id="agente-username"
                        type="text"
                        className="form-control"
                        name="username"
                        value={formulario.username}
                        onChange={cambiarCampo}
                        maxLength={15}
                        autoComplete="off"
                        required
                        disabled={guardando}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-password"
                      >
                        Contraseña *
                      </label>

                      <input
                        id="agente-password"
                        type="password"
                        className="form-control"
                        name="password"
                        value={formulario.password}
                        onChange={cambiarCampo}
                        maxLength={100}
                        autoComplete="new-password"
                        required
                        disabled={guardando}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="fw-bold mb-3">
                    Información del agente
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-placa"
                      >
                        Placa *
                      </label>

                      <input
                        id="agente-placa"
                        type="text"
                        className="form-control"
                        name="placa"
                        value={formulario.placa}
                        onChange={cambiarCampo}
                        maxLength={20}
                        required
                        disabled={guardando}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-rango"
                      >
                        Rango
                      </label>

                      <input
                        id="agente-rango"
                        type="text"
                        className="form-control"
                        name="rango"
                        value={formulario.rango}
                        onChange={cambiarCampo}
                        maxLength={30}
                        disabled={guardando}
                      />
                    </div>

                    <div className="col-12">
                      <label
                        className="config-field-label-dash"
                        htmlFor="agente-unidad"
                      >
                        Unidad asignada
                      </label>

                      <select
                        id="agente-unidad"
                        className="form-select"
                        name="unidadTransitoId"
                        value={formulario.unidadTransitoId}
                        onChange={cambiarCampo}
                        disabled={guardando}
                      >
                        <option value="">
                          Sin asignar
                        </option>

                        {unidades.map((unidad, indice) => {
                          const id =
                            unidad.idUnidadTransito ??
                            unidad.idUnidad ??
                            unidad.id;

                          if (id == null) return null;

                          return (
                            <option
                              key={id ?? indice}
                              value={id}
                            >
                              {unidad.nombre ??
                                `Unidad ${id}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="fw-bold mb-3">
                    Dirección (opcional)
                  </h6>

                  <div className="row g-3">
                    {CAMPOS_DIRECCION.map((campo) => (
                      <div
                        className="col-md-6"
                        key={campo.name}
                      >
                        <label
                          className="config-field-label-dash"
                          htmlFor={`agente-${campo.name}`}
                        >
                          {campo.label}
                        </label>

                        <input
                          id={`agente-${campo.name}`}
                          type="text"
                          className="form-control"
                          name={campo.name}
                          value={formulario[campo.name]}
                          onChange={cambiarCampo}
                          maxLength={campo.max}
                          disabled={guardando}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-muted small mt-3 mb-0">
                    Los campos marcados con * son obligatorios.
                  </p>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn-secundario-dash"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-guardar-dash"
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2" />
                        Guardar agente
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
