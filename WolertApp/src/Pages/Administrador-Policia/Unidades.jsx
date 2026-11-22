
import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import { apiAdminPolicia } from "../../Services/AdminPoliciaApi";
import "../../css/Policia/administrador-policia/css/unidades.css";

const FORM_INICIAL = {
  nombre: "",
  idBarrio: "",
  estado: "OPERATIVA",
  latitud: "",
  longitud: "",
};

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const mostrar = (valor) =>
  valor === null || valor === undefined || valor === ""
    ? "—"
    : String(valor);

function obtenerLista(respuesta, recurso) {
  if (Array.isArray(respuesta)) return respuesta;

  const lista =
    respuesta?.items ??
    respuesta?.data ??
    respuesta?.datos ??
    respuesta?.resultados ??
    respuesta?.value;

  if (Array.isArray(lista)) return lista;

  throw new Error(
    `La API de ${recurso} no devolvió una lista válida.`
  );
}

function obtenerIdUnidad(policia) {
  return (
    policia.idUnidad ??
    policia.idUnidadPolicial ??
    policia.unidad?.idUnidad ??
    policia.unidadPolicial?.idUnidad ??
    null
  );
}

function obtenerNombrePolicia(policia) {
  const nombre = [
    policia.nombres ?? policia.nombre,
    policia.apellidos ?? policia.apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    policia.nombreCompleto ||
    policia.nombreUsuario ||
    nombre ||
    `Policía #${policia.idUsuario ?? "—"}`
  );
}

function BuscadorBarrio({
  id,
  barrios,
  valor,
  onChange,
  placeholder = "Buscar barrio...",
  incluirTodos = false,
  requerido = false,
}) {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const contenedorRef = useRef(null);
  const entradaRef = useRef(null);

  const seleccionado = useMemo(
    () => barrios.find(
      (b) => String(b.idBarrio) === String(valor)
    ),
    [barrios, valor]
  );

  const nombreSeleccionado = seleccionado
    ? String(seleccionado.nombre ?? seleccionado.nombreBarrio ?? "")
    : "";

  useEffect(() => {
    setTexto(nombreSeleccionado);
  }, [nombreSeleccionado]);

  useEffect(() => {
    function cerrarSiFuera(evento) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target)
      ) {
        setAbierto(false);
        setTexto(nombreSeleccionado);
      }
    }

    document.addEventListener("pointerdown", cerrarSiFuera);

    return () =>
      document.removeEventListener("pointerdown", cerrarSiFuera);
  }, [nombreSeleccionado]);

  const opciones = useMemo(() => {
    const termino = texto.trim().toLocaleLowerCase("es");

    return barrios.filter((b) => {
      const nombre = String(
        b.nombre ?? b.nombreBarrio ?? ""
      ).toLocaleLowerCase("es");

      return nombre.includes(termino);
    });
  }, [barrios, texto]);

  const elegir = (barrio) => {
    onChange(String(barrio.idBarrio));
    setTexto(barrio.nombre ?? barrio.nombreBarrio ?? "");
    setAbierto(false);
    setActivo(0);
  };

  const limpiar = () => {
    onChange("");
    setTexto("");
    setActivo(0);
    setAbierto(false);
  };

  return (
    <div
      className="barrio-combobox"
      ref={contenedorRef}
    >
      <div className="barrio-combobox-control">
        <i className="bi bi-search" aria-hidden="true" />

        <input
          ref={entradaRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-opciones`}
          aria-autocomplete="list"
          aria-activedescendant={
            abierto && opciones.length
              ? `${id}-opcion-${activo}`
              : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          required={requerido && !valor}
          value={texto}
          onFocus={() => {
            setAbierto(true);
            setActivo(0);
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            onChange("");
            setAbierto(true);
            setActivo(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setAbierto(false);
              setTexto(nombreSeleccionado);
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAbierto(true);
              setActivo((actual) =>
                Math.min(actual + 1, opciones.length - 1)
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((actual) => Math.max(actual - 1, 0));
            }

            if (
              e.key === "Enter" &&
              abierto &&
              opciones.length > 0
            ) {
              e.preventDefault();
              elegir(opciones[activo] ?? opciones[0]);
            }
          }}
        />

        {texto ? (
          <button
            type="button"
            className="barrio-combobox-limpiar"
            title="Limpiar barrio"
            aria-label="Limpiar barrio"
            onClick={() => {
              limpiar();
              entradaRef.current?.focus();
            }}
          >
            <i className="bi bi-x-lg" />
          </button>
        ) : (
          <button
            type="button"
            className="barrio-combobox-flecha"
            title="Mostrar barrios"
            aria-label="Mostrar barrios"
            onClick={() => {
              setAbierto((actual) => !actual);
              entradaRef.current?.focus();
            }}
          >
            <i className="bi bi-chevron-down" />
          </button>
        )}
      </div>

      {abierto && (
        <div
          className="barrio-combobox-lista"
          id={`${id}-opciones`}
          role="listbox"
        >
          {incluirTodos && (
            <button
              type="button"
              className="barrio-combobox-opcion"
              onMouseDown={(e) => e.preventDefault()}
              onClick={limpiar}
            >
              <i className="bi bi-grid" />
              Todos los barrios
            </button>
          )}

          {opciones.length ? (
            opciones.map((b, indice) => (
              <button
                type="button"
                key={b.idBarrio}
                id={`${id}-opcion-${indice}`}
                role="option"
                aria-selected={
                  String(b.idBarrio) === String(valor)
                }
                className={`barrio-combobox-opcion ${
                  indice === activo ? "seleccionado" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(b)}
              >
                <i className="bi bi-geo-alt" />
                {b.nombre ?? b.nombreBarrio}
              </button>
            ))
          ) : (
            <div className="barrio-combobox-vacio">
              No se encontraron barrios.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [policias, setPolicias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [errorPolicias, setErrorPolicias] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBarrio, setFiltroBarrio] = useState("");

  const [modal, setModal] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  async function cargar() {
    setCargando(true);
    setError("");

    const resultados = await Promise.allSettled([
      apiAdminPolicia("/api/Unidades"),
      apiAdminPolicia("/api/Barrios"),
      apiAdminPolicia("/api/Policias"),
    ]);

    const [rUnidades, rBarrios, rPolicias] = resultados;
    const errores = [];

    if (rUnidades.status === "fulfilled") {
      try {
        setUnidades(obtenerLista(rUnidades.value, "unidades"));
      } catch (e) {
        setUnidades([]);
        errores.push(`Unidades: ${e.message}`);
      }
    } else {
      setUnidades([]);
      errores.push(
        `Unidades: ${
          rUnidades.reason?.message ||
          "No se pudo consultar GET /api/Unidades"
        }`
      );
    }

    if (rBarrios.status === "fulfilled") {
      try {
        setBarrios(obtenerLista(rBarrios.value, "barrios"));
      } catch (e) {
        setBarrios([]);
        errores.push(`Barrios: ${e.message}`);
      }
    } else {
      setBarrios([]);
      errores.push(
        `Barrios: ${
          rBarrios.reason?.message ||
          "No se pudo consultar GET /api/Barrios"
        }`
      );
    }

    if (rPolicias.status === "fulfilled") {
      try {
        setPolicias(obtenerLista(rPolicias.value, "policías"));
        setErrorPolicias("");
      } catch (e) {
        setPolicias([]);
        setErrorPolicias(e.message);
      }
    } else {
      setPolicias([]);
      setErrorPolicias(
        rPolicias.reason?.message ||
        "No se pudo consultar GET /api/Policias"
      );
    }

    setError(errores.join(" | "));
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const barriosPorId = useMemo(
    () =>
      new Map(
        barrios.map((b) => [
          String(b.idBarrio),
          b.nombre ?? b.nombreBarrio ?? "—",
        ])
      ),
    [barrios]
  );

  function nombreBarrio(unidad) {
    const nombre = barriosPorId.get(
      String(unidad?.idBarrio ?? "")
    );

    return (
      nombre ||
      unidad?.nombreBarrio ||
      unidad?.barrioNombre ||
      "—"
    );
  }

  const policiasPorUnidad = useMemo(() => {
    const agrupados = new Map();

    for (const policia of policias) {
      const id = obtenerIdUnidad(policia);

      if (id === null || id === undefined || id === "") {
        continue;
      }

      const clave = String(id);

      if (!agrupados.has(clave)) {
        agrupados.set(clave, []);
      }

      agrupados.get(clave).push(policia);
    }

    return agrupados;
  }, [policias]);

  function integrantesUnidad(idUnidad) {
    return policiasPorUnidad.get(String(idUnidad)) || [];
  }

  function cantidadPolicias(unidad) {
    const vinculados = integrantesUnidad(unidad.idUnidad);

    if (vinculados.length) return vinculados.length;

    if (Array.isArray(unidad.policias)) {
      return unidad.policias.length;
    }

    const cantidad =
      unidad.totalPolicias ??
      unidad.cantidadPolicias ??
      unidad.numeroPolicias;

    if (cantidad !== null && cantidad !== undefined) {
      return cantidad;
    }

    if (
      !errorPolicias &&
      policias.some((p) => obtenerIdUnidad(p) !== null)
    ) {
      return 0;
    }

    return null;
  }

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return unidades.filter((unidad) => {
      const coincideBusqueda =
        !termino ||
        String(unidad.nombre || "")
          .toLowerCase()
          .includes(termino) ||
        nombreBarrio(unidad).toLowerCase().includes(termino) ||
        String(unidad.idUnidad).includes(termino);

      const coincideEstado =
        !filtroEstado ||
        normalizar(unidad.estado) === filtroEstado;

      const coincideBarrio =
        !filtroBarrio ||
        String(unidad.idBarrio ?? "") === filtroBarrio;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideBarrio
      );
    });
  }, [
    unidades,
    barriosPorId,
    busqueda,
    filtroEstado,
    filtroBarrio,
  ]);

  const indicadores = useMemo(() => {
    const totalPolicias = unidades.reduce(
      (total, unidad) =>
        total + Number(cantidadPolicias(unidad) ?? 0),
      0
    );

    return {
      total: unidades.length,
      totalUnidades: unidades.length,
      operativas: unidades.filter(
        (u) => normalizar(u.estado) === "OPERATIVA"
      ).length,
      activas: unidades.filter(
        (u) => normalizar(u.estado) === "ACTIVA"
      ).length,
      policias: totalPolicias,
      totalPolicias,
    };
  }, [unidades, policiasPorUnidad, errorPolicias]);

  function abrirNueva() {
    setSeleccion(null);
    setForm({ ...FORM_INICIAL });
    setError("");
    setMensaje("");
    setModal("formulario");
  }

  async function abrirEditar(unidad) {
    setError("");

    try {
      const detalle = await apiAdminPolicia(
        `/api/Unidades/${unidad.idUnidad}`
      );

      setSeleccion(detalle);
      setForm({
        nombre: detalle.nombre ?? "",
        idBarrio: String(detalle.idBarrio ?? ""),
        estado: detalle.estado ?? "OPERATIVA",
        latitud: String(detalle.latitud ?? ""),
        longitud: String(detalle.longitud ?? ""),
      });
      setModal("formulario");
    } catch (e) {
      setError(e.message || "No se pudo consultar la unidad.");
    }
  }

  async function abrirDetalle(unidad) {
    setError("");
    setCargandoDetalle(true);

    try {
      const detalle = await apiAdminPolicia(
        `/api/Unidades/${unidad.idUnidad}`
      );

      setSeleccion(detalle);
      setModal("detalle");

      try {
        const respuesta = await apiAdminPolicia("/api/Policias");
        setPolicias(obtenerLista(respuesta, "policías"));
        setErrorPolicias("");
      } catch (e) {
        setErrorPolicias(
          e.message || "No se pudieron consultar los integrantes."
        );
      }
    } catch (e) {
      setError(e.message || "No se pudo consultar el detalle.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cambiar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;

    setError("");
    setMensaje("");

    const cuerpo = {
      nombre: form.nombre.trim(),
      idBarrio: Number(form.idBarrio),
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
    };

    if (
      !cuerpo.nombre ||
      !form.idBarrio ||
      form.latitud === "" ||
      form.longitud === "" ||
      !Number.isFinite(cuerpo.latitud) ||
      !Number.isFinite(cuerpo.longitud) ||
      Math.abs(cuerpo.latitud) > 90 ||
      Math.abs(cuerpo.longitud) > 180
    ) {
      setError("Completa correctamente los datos de la unidad.");
      return;
    }

    setGuardando(true);

    try {
      if (seleccion) {
        await apiAdminPolicia(
          `/api/Unidades/${seleccion.idUnidad}`,
          {
            method: "PUT",
            body: JSON.stringify({
              ...cuerpo,
              estado: form.estado,
            }),
          }
        );
      } else {
        await apiAdminPolicia("/api/Unidades", {
          method: "POST",
          body: JSON.stringify(cuerpo),
        });
      }

      setModal("");
      setMensaje(
        seleccion
          ? "Unidad actualizada correctamente."
          : "Unidad registrada correctamente."
      );

      await cargar();
    } catch (e) {
      setError(e.message || "No se pudo guardar la unidad.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(unidad) {
    if (
      !window.confirm(
        `¿Eliminar la unidad "${unidad.nombre}"?`
      )
    ) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await apiAdminPolicia(
        `/api/Unidades/${unidad.idUnidad}`,
        { method: "DELETE" }
      );

      await cargar();
      setMensaje("Unidad eliminada correctamente.");
    } catch (e) {
      setError(e.message || "No se pudo eliminar la unidad.");
    }
  }

  const integrantesSeleccionados = seleccion
    ? integrantesUnidad(seleccion.idUnidad)
    : [];

  const integrantesDetalle =
    integrantesSeleccionados.length > 0
      ? integrantesSeleccionados
      : Array.isArray(seleccion?.policias)
        ? seleccion.policias
        : [];

  const cantidadDetalle = seleccion
    ? cantidadPolicias(seleccion)
    : null;

  return (
    <>
      <Topbar
        iniciales="SG"
        placeholder="Buscar por alerta, barrio, unidad, policía…"
      />

      <div className="header-vista-dash mb-4">
        <div>
          <h1>Unidades Policiales</h1>
          <p>
            Administra las unidades policiales registradas
            en el sistema.
          </p>
        </div>

        <button
          type="button"
          className="btn-cv-verde"
          onClick={abrirNueva}
        >
          <i className="bi bi-plus-lg me-2" />
          Nueva unidad
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {/* KPI originales */}
      <Kpis
        grupo="unidades"
        valores={indicadores}
        cargando={cargando}
      />

      {/* Filtros */}
      <div className="panel-filtros-unidades mb-4">
        <div className="panel-filtros-header">
          <div className="panel-filtros-icono">
            <i className="bi bi-sliders" />
          </div>

          <div className="flex-grow-1">
            <h3>Filtrar unidades</h3>
            <p>Busca y organiza las unidades policiales.</p>
          </div>
        </div>

        <div className="panel-filtros-body">
          <div className="buscador-unidades">
            <label htmlFor="buscarUnidad">
              <i className="bi bi-search me-2" />
              Buscar unidad
            </label>

            <div className="buscador-unidades-input">
              <i className="bi bi-search" />
              <input
                type="text"
                id="buscarUnidad"
                placeholder="Nombre de unidad o barrio..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />
            </div>
          </div>

          <div className="filtros-unidades-selects">
            <div className="filtro-unidad-card">
              <label htmlFor="filtroEstadoUnidad">
                <span className="filtro-unidad-icono estado">
                  <i className="bi bi-activity" />
                </span>

                <span>
                  <strong>Estado</strong>
                  <small>Disponibilidad operativa</small>
                </span>
              </label>

              <select
                id="filtroEstadoUnidad"
                className="form-select"
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value)
                }
              >
                <option value="">Todos los estados</option>
                <option value="OPERATIVA">Operativa</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            <div className="filtro-unidad-card filtro-barrio-card">
              <label htmlFor="filtroBarrioUnidad">
                <span className="filtro-unidad-icono ubicacion">
                  <i className="bi bi-geo-alt" />
                </span>

                <span>
                  <strong>Ubicación</strong>
                  <small>Filtrar por barrio</small>
                </span>
              </label>

              <BuscadorBarrio
                id="filtroBarrioUnidad"
                barrios={barrios}
                valor={filtroBarrio}
                onChange={setFiltroBarrio}
                incluirTodos
                placeholder="Todos los barrios"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-panel-dash unidad-tabla-panel mb-4">
        <div className="unidad-tabla-superior">
          <div>
            <h2>Unidades registradas</h2>
            <p>
              Consulta la información y administra cada unidad.
            </p>
          </div>

          <span className="unidad-resultados">
            {filtradas.length} unidades
          </span>
        </div>

        <div className="table-responsive">
          <table className="tabla-dash unidad-tabla">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th>Policías</th>
                <th>Coordenadas</th>
                <th className="unidad-th-acciones">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody id="tablaUnidades">
              {filtradas.map((unidad) => (
                <tr key={unidad.idUnidad}>
                  <td>
                    <div className="unidad-nombre-celda">
                      <span className="unidad-tabla-icono">
                        <i className="bi bi-shield-check" />
                      </span>

                      <div>
                        <strong>{unidad.nombre}</strong>
                        <small>
                          Unidad #{unidad.idUnidad}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{nombreBarrio(unidad)}</td>

                  <td>
                    <span
                      className={`unidad-estado unidad-estado--${normalizar(
                        unidad.estado
                      ).toLowerCase()}`}
                    >
                      <i className="bi bi-circle-fill" />
                      {mostrar(unidad.estado)}
                    </span>
                  </td>

                  <td>
                    <span className="unidad-cantidad">
                      <i className="bi bi-people" />
                      {mostrar(cantidadPolicias(unidad))}
                    </span>
                  </td>

                  <td>
                    <span className="unidad-coordenadas">
                      {mostrar(unidad.latitud)}
                      {", "}
                      {mostrar(unidad.longitud)}
                    </span>
                  </td>

                  <td>
                    <div className="unidad-acciones">
                      <button
                        type="button"
                        className="unidad-accion ver"
                        title="Ver detalles"
                        onClick={() =>
                          abrirDetalle(unidad)
                        }
                      >
                        <i className="bi bi-eye" />
                      </button>

                      <button
                        type="button"
                        className="unidad-accion editar"
                        title="Editar unidad"
                        onClick={() =>
                          abrirEditar(unidad)
                        }
                      >
                        <i className="bi bi-pencil-square" />
                      </button>

                      <button
                        type="button"
                        className="unidad-accion eliminar"
                        title="Eliminar unidad"
                        onClick={() =>
                          eliminar(unidad)
                        }
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cargando && (
          <div className="tabla-vacio-dash">
            Cargando unidades...
          </div>
        )}

        {!cargando && filtradas.length === 0 && (
          <div className="tabla-vacio-dash">
            No se encontraron unidades con esos filtros.
          </div>
        )}
      </div>

      {/* Formulario */}
      {modal === "formulario" && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-label="Formulario de unidad"
          style={{ background: "#0008" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header modal-header-dash">
                <div>
                  <div className="modal-title">
                    {seleccion
                      ? "Editar unidad"
                      : "Nueva unidad"}
                  </div>
                  <div className="modal-subtitle">
                    Información de la unidad policial
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setModal("")}
                />
              </div>

              <form onSubmit={guardar}>
                <div className="modal-body modal-body-dash">
                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12 form-field-dash">
                      <label htmlFor="unidadNombre">
                        Nombre de la unidad *
                      </label>
                      <input
                        id="unidadNombre"
                        className="form-control"
                        maxLength={50}
                        required
                        value={form.nombre}
                        onChange={(e) =>
                          cambiar("nombre", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-12 form-field-dash">
                      <label htmlFor="unidadBarrio">
                        Barrio *
                      </label>

                      <BuscadorBarrio
                        id="unidadBarrio"
                        barrios={barrios}
                        valor={form.idBarrio}
                        onChange={(id) =>
                          cambiar("idBarrio", id)
                        }
                        requerido
                        placeholder="Escribe para buscar un barrio..."
                      />
                    </div>

                    <div className="col-12 form-field-dash">
                      <label htmlFor="unidadEstado">
                        Estado
                      </label>
                      <select
                        id="unidadEstado"
                        className="form-select"
                        value={form.estado}
                        disabled={!seleccion}
                        onChange={(e) =>
                          cambiar("estado", e.target.value)
                        }
                      >
                        <option value="OPERATIVA">
                          Operativa
                        </option>
                        <option value="ACTIVA">
                          Activa
                        </option>
                        <option value="INACTIVA">
                          Inactiva
                        </option>
                      </select>
                    </div>

                    <div className="col-6 form-field-dash">
                      <label htmlFor="unidadLat">
                        Latitud *
                      </label>
                      <input
                        id="unidadLat"
                        type="number"
                        step="any"
                        className="form-control"
                        required
                        value={form.latitud}
                        onChange={(e) =>
                          cambiar("latitud", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-6 form-field-dash">
                      <label htmlFor="unidadLng">
                        Longitud *
                      </label>
                      <input
                        id="unidadLng"
                        type="number"
                        step="any"
                        className="form-control"
                        required
                        value={form.longitud}
                        onChange={(e) =>
                          cambiar("longitud", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer modal-footer-dash">
                  <button
                    type="button"
                    className="btn-secundario-dash"
                    onClick={() => setModal("")}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-cv-verde"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : "Guardar unidad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detalle */}
      {modal === "detalle" && seleccion && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de unidad"
          style={{ background: "#0008" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="unidad-modal-encabezado">
                <button
                  type="button"
                  className="unidad-modal-cerrar"
                  aria-label="Cerrar"
                  onClick={() => setModal("")}
                >
                  <i className="bi bi-x-lg" />
                </button>

                <span className="unidad-modal-icono">
                  <i className="bi bi-shield-check" />
                </span>

                <h2>{seleccion.nombre}</h2>
                <span className="unidad-modal-estado">
                  {seleccion.estado}
                </span>
              </div>

              <div className="modal-body modal-body-dash">
                {[
                  ["Barrio", nombreBarrio(seleccion)],
                  [
                    "Coordenadas",
                    `${mostrar(
                      seleccion.latitud
                    )}, ${mostrar(seleccion.longitud)}`,
                  ],
                ].map(([titulo, valor]) => (
                  <div
                    className="detalle-fila-dash"
                    key={titulo}
                  >
                    <span className="k">{titulo}</span>
                    <span className="v">{valor}</span>
                  </div>
                ))}

                <div className="unidad-policias-detalle">
                  <div className="unidad-policias-titulo">
                    <span>
                      <i className="bi bi-people me-2" />
                      Policías asignados
                    </span>

                    <strong>
                      {cargandoDetalle
                        ? "..."
                        : mostrar(cantidadDetalle)}
                    </strong>
                  </div>

                  {cargandoDetalle ? (
                    <p className="unidad-policias-vacio">
                      Consultando integrantes...
                    </p>
                  ) : integrantesDetalle.length ? (
                    <div className="unidad-policias-lista">
                      {integrantesDetalle.map(
                        (policia, indice) => (
                          <article
                            className="unidad-policia-item"
                            key={
                              policia.idUsuario ??
                              indice
                            }
                          >
                            <span className="unidad-policia-avatar">
                              <i className="bi bi-person-badge" />
                            </span>

                            <div>
                              <strong>
                                {obtenerNombrePolicia(
                                  policia
                                )}
                              </strong>
                              <small>
                                {policia.rango || "Policía"}
                                {policia.placa
                                  ? ` · Placa ${policia.placa}`
                                  : ""}
                              </small>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="unidad-policias-vacio">
                      {errorPolicias ||
                        "No hay policías vinculados a esta unidad."}
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer modal-footer-dash">
                <button
                  type="button"
                  className="btn-secundario-dash"
                  onClick={() => setModal("")}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
