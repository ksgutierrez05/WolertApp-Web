import { useEffect, useMemo, useRef, useState } from "react";

import Topbar from "../../Components/Administrador-policia/Topbar";

import Kpis from "../../Components/Administrador-policia/Kpicard";

import SelectBonito from "../../Components/Administrador-policia/SelectBonito";
import { useFeedback } from "../../Components/Feedback/useFeedback";

import MapaUnidadesPoliciales from "../../Components/Administrador-policia/MapaUnidadesPoliciales";

import { apiAdminPolicia } from "../../Services/AdminPoliciaApi";

import "../../css/Policia/administrador-policia/css/unidades.css";

import "../../css/Policia/administrador-policia/css/mapa-unidades-policiales.css";

// ======================================================*
// CONFIGURACIÓN*
// ======================================================*

const ICONO_UNIDAD = "../../../public/img/coche-de-policia.png";

const FORM_INICIAL = {
  nombre: "",
  idBarrio: "",
  estado: "OPERATIVA",
  latitud: "",
  longitud: "",
};

const POR_PAGINA = 8;

const normalizar = (valor) =>
  String(valor ?? "")
    .trim()
    .toUpperCase();

const mostrar = (valor) =>
  valor === null || valor === undefined || valor === "" ? "—" : String(valor);

function obtenerLista(respuesta, nombre) {
  if (Array.isArray(respuesta)) return respuesta;

  const lista =
    respuesta?.items ??
    respuesta?.data ??
    respuesta?.datos ??
    respuesta?.resultados ??
    respuesta?.value;

  if (Array.isArray(lista)) return lista;

  throw new Error(`La API de ${nombre} no devolvió una lista válida.`);
}

function idUnidadPolicia(p) {
  return (
    p.idUnidad ??
    p.idUnidadPolicial ??
    p.unidad?.idUnidad ??
    p.unidadPolicial?.idUnidad ??
    null
  );
}

function nombrePolicia(p) {
  const completo = [p.nombres ?? p.nombre, p.apellidos ?? p.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    p.nombreCompleto ||
    p.nombreUsuario ||
    completo ||
    `Policía #${p.idUsuario ?? "—"}`
  );
}

// ======================================================*
// ICONO PERSONALIZADO*
// ======================================================*

function IconoUnidad({ className = "", tamaño = 24 }) {
  const [fallo, setFallo] = useState(false);

  return (
    <span className={`unidad-icono-personalizado ${className}`}>
      {!fallo ? (
        <img
          src={ICONO_UNIDAD}
          alt="Unidad policial"
          width={tamaño}
          height={tamaño}
          draggable={false}
          onError={() => setFallo(true)}
          style={{
            width: tamaño,
            height: tamaño,
            objectFit: "contain",
            display: "block",
            imageRendering: "auto",
          }}
        />
      ) : (
        <i
          className="bi bi-shield-check"
          aria-hidden="true"
          style={{ fontSize: tamaño * 0.75 }}
        />
      )}
    </span>
  );
}

// ======================================================*
// BUSCADOR DE BARRIOS*
// ======================================================*

function BuscadorBarrio({
  id,
  barrios,
  valor,
  onChange,
  placeholder = "Buscar barrio...",
  required = false,
}) {
  const [texto, setTexto] = useState("");

  const [abierto, setAbierto] = useState(false);

  const contenedor = useRef(null);

  const seleccionado = barrios.find(
    (b) => String(b.idBarrio) === String(valor) && valor !== "",
  );

  const nombreSeleccionado =
    seleccionado?.nombre ?? seleccionado?.nombreBarrio ?? "";

  useEffect(() => {
    setTexto(nombreSeleccionado);
  }, [nombreSeleccionado]);

  useEffect(() => {
    function cerrarFuera(e) {
      if (!contenedor.current?.contains(e.target)) {
        setAbierto(false);

        setTexto(nombreSeleccionado);
      }
    }

    document.addEventListener("pointerdown", cerrarFuera);

    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
    };
  }, [nombreSeleccionado]);

  const opciones = barrios.filter((b) =>
    String(b.nombre ?? b.nombreBarrio ?? "")
      .toLowerCase()
      .includes(texto.toLowerCase().trim()),
  );

  function elegir(b) {
    onChange(String(b.idBarrio));

    setTexto(b.nombre ?? b.nombreBarrio ?? "");

    setAbierto(false);
  }

  return (
    <div className="barrio-combobox" ref={contenedor}>
      <div className="barrio-combobox-control">
        <i className="bi bi-search" />

        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-opciones`}
          placeholder={placeholder}
          autoComplete="off"
          required={required && !valor}
          value={texto}
          onFocus={() => setAbierto(true)}
          onChange={(e) => {
            setTexto(e.target.value);

            onChange("");

            setAbierto(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setAbierto(false);

              setTexto(nombreSeleccionado);
            }

            if (e.key === "Enter" && abierto && opciones.length) {
              e.preventDefault();

              elegir(opciones[0]);
            }
          }}
        />

        <button
          type="button"
          className="barrio-combobox-flecha"
          onClick={() => setAbierto((v) => !v)}
          aria-label="Mostrar barrios"
        >
          <i className="bi bi-chevron-down" />
        </button>
      </div>

      {abierto && (
        <div
          id={`${id}-opciones`}
          className="barrio-combobox-lista"
          role="listbox"
        >
          {opciones.length ? (
            opciones.map((b) => (
              <button
                type="button"
                role="option"
                aria-selected={String(b.idBarrio) === String(valor)}
                key={b.idBarrio}
                className="barrio-combobox-opcion"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(b)}
              >
                <i className="bi bi-geo-alt" />

                {b.nombre ?? b.nombreBarrio}
              </button>
            ))
          ) : (
            <div className="barrio-combobox-vacio">
              No se encontraron barrios
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================================================*
// DESPLEGABLE DE ESTADO (FILTRO)*
// ======================================================*

const OPCIONES_ESTADO = [
  { valor: "", etiqueta: "Todos los estados" },
  { valor: "OPERATIVA", etiqueta: "Operativa" },
  { valor: "ACTIVA", etiqueta: "Activa" },
  { valor: "INACTIVA", etiqueta: "Inactiva" },
];

// Opciones del select de estado dentro del formulario (modal)
const OPCIONES_ESTADO_FORM = [
  { valor: "OPERATIVA", etiqueta: "Operativa", punto: "azul" },
  { valor: "ACTIVA", etiqueta: "Activa", punto: "verde" },
  { valor: "INACTIVA", etiqueta: "Inactiva", punto: "gris" },
];

function FiltroEstado({ id, valor, onChange, conteos, total }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const cerrarFuera = (e) => {
      if (!ref.current?.contains(e.target)) setAbierto(false);
    };
    const cerrarEscape = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarEscape);

    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      document.removeEventListener("keydown", cerrarEscape);
    };
  }, [abierto]);

  const actual = OPCIONES_ESTADO.find((o) => o.valor === valor);

  return (
    <div
      ref={ref}
      className={`fu-desplegable ${valor ? "activo" : ""} ${abierto ? "abierto" : ""}`}
    >
      <button
        id={id}
        type="button"
        className="fu-boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label="Filtrar por estado"
        onClick={() => setAbierto((v) => !v)}
      >
        <i className="bi bi-activity fu-icono" aria-hidden="true" />

        {valor && (
          <span
            className={`fu-punto fu-${valor.toLowerCase()}`}
            aria-hidden="true"
          />
        )}

        <span className={`fu-texto ${valor ? "" : "sin-valor"}`}>
          {valor ? actual?.etiqueta : "Filtrar por estado"}
        </span>

        <i className="bi bi-chevron-down fu-flecha" aria-hidden="true" />
      </button>

      {abierto && (
        <ul className="fu-menu" role="listbox" aria-label="Estados">
          {OPCIONES_ESTADO.map((op) => {
            const seleccionada = valor === op.valor;
            const cantidad = op.valor ? (conteos[op.valor] ?? 0) : total;

            return (
              <li key={op.valor || "todos"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={seleccionada}
                  className={`fu-opcion ${seleccionada ? "seleccionada" : ""}`}
                  onClick={() => {
                    onChange(op.valor);
                    setAbierto(false);
                  }}
                >
                  <span
                    className={`fu-punto ${
                      op.valor ? `fu-${op.valor.toLowerCase()}` : "fu-todos"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="fu-opcion-texto">{op.etiqueta}</span>
                  <span className="fu-opcion-cantidad">{cantidad}</span>
                  <i
                    className={`bi bi-check-lg fu-check ${seleccionada ? "visible" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ======================================================*
// COMPONENTE PRINCIPAL*
// ======================================================*

export default function Unidades() {
  const { confirm, toast } = useFeedback();
  const [unidades, setUnidades] = useState([]);

  const [barrios, setBarrios] = useState([]);

  const [policias, setPolicias] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const [errorPolicias, setErrorPolicias] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("");

  const [filtroBarrio, setFiltroBarrio] = useState("");

  const [modal, setModal] = useState("");

  const [seleccion, setSeleccion] = useState(null);

  const [form, setForm] = useState({ ...FORM_INICIAL });

  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudo completar la operación con unidades.", "Error de unidades");
  }, [error, toast]);

  useEffect(() => {
    if (errorPolicias) toast.errorFrom(errorPolicias, "No se pudieron consultar los policías.", "Error al cargar integrantes");
  }, [errorPolicias, toast]);

  useEffect(() => {
    if (mensaje) toast.success(mensaje, "Operación completada");
  }, [mensaje, toast]);

  // ====================================================*
  // CARGAR DATOS*
  // ====================================================*

  async function cargar() {
    setCargando(true);

    setError("");

    const resultados = await Promise.allSettled([
      apiAdminPolicia("/api/Unidades"),
      apiAdminPolicia("/api/Barrios"),
      apiAdminPolicia("/api/Policias"),
    ]);

    const [ru, rb, rp] = resultados;

    const errores = [];

    if (ru.status === "fulfilled") {
      try {
        setUnidades(obtenerLista(ru.value, "unidades"));
      } catch (e) {
        setUnidades([]);

        errores.push(e.message);
      }
    } else {
      setUnidades([]);

      errores.push(ru.reason?.message || "Error al consultar unidades.");
    }

    if (rb.status === "fulfilled") {
      try {
        setBarrios(obtenerLista(rb.value, "barrios"));
      } catch (e) {
        setBarrios([]);

        errores.push(e.message);
      }
    } else {
      setBarrios([]);

      errores.push(rb.reason?.message || "Error al consultar barrios.");
    }

    if (rp.status === "fulfilled") {
      try {
        setPolicias(obtenerLista(rp.value, "policías"));

        setErrorPolicias("");
      } catch (e) {
        setPolicias([]);

        setErrorPolicias(e.message);
      }
    } else {
      setPolicias([]);

      setErrorPolicias(rp.reason?.message || "Error al consultar policías.");
    }

    setError(errores.join(" | "));

    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  // ====================================================*
  // BARRIOS*
  // ====================================================*

  const barriosPorId = useMemo(
    () =>
      new Map(
        barrios.map((b) => [
          String(b.idBarrio),
          b.nombre ?? b.nombreBarrio ?? "—",
        ]),
      ),
    [barrios],
  );

  function nombreBarrio(u) {
    return (
      barriosPorId.get(String(u?.idBarrio ?? "")) ||
      u?.nombreBarrio ||
      u?.barrioNombre ||
      "—"
    );
  }

  // ====================================================*
  // POLICÍAS POR UNIDAD*
  // ====================================================*

  const policiasPorUnidad = useMemo(() => {
    const mapa = new Map();

    for (const p of policias) {
      const id = idUnidadPolicia(p);

      if (id === null || id === "") continue;

      const clave = String(id);

      if (!mapa.has(clave)) {
        mapa.set(clave, []);
      }

      mapa.get(clave).push(p);
    }

    return mapa;
  }, [policias]);

  function integrantesUnidad(id) {
    return policiasPorUnidad.get(String(id)) ?? [];
  }

  function cantidadPolicias(u) {
    const vinculados = integrantesUnidad(u.idUnidad);

    if (vinculados.length) {
      return vinculados.length;
    }

    if (Array.isArray(u.policias)) {
      return u.policias.length;
    }

    const total = u.totalPolicias ?? u.cantidadPolicias ?? u.numeroPolicias;

    if (total != null) return total;

    return errorPolicias ? null : 0;
  }

  // ====================================================*
  // FILTROS Y PAGINACIÓN*
  // ====================================================*

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return unidades.filter((u) => {
      const barrio =
        barriosPorId.get(String(u.idBarrio ?? "")) ||
        u.nombreBarrio ||
        u.barrioNombre ||
        "";

      const coincideBusqueda =
        !q ||
        String(u.nombre ?? "")
          .toLowerCase()
          .includes(q) ||
        String(u.idUnidad ?? "").includes(q) ||
        String(barrio).toLowerCase().includes(q);

      const coincideEstado =
        !filtroEstado || normalizar(u.estado) === filtroEstado;

      const coincideBarrio =
        !filtroBarrio || String(u.idBarrio ?? "") === filtroBarrio;

      return coincideBusqueda && coincideEstado && coincideBarrio;
    });
  }, [unidades, busqueda, filtroEstado, filtroBarrio, barriosPorId]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));

  const paginaActual = Math.min(pagina, totalPaginas);

  const paginaUnidades = filtradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado, filtroBarrio]);

  // Contadores del desplegable de estado y utilidades de filtros

  const conteosEstado = useMemo(() => {
    const c = { OPERATIVA: 0, ACTIVA: 0, INACTIVA: 0 };

    for (const u of unidades) {
      const e = normalizar(u.estado);

      if (e in c) c[e] += 1;
    }

    return c;
  }, [unidades]);

  const hayFiltros = Boolean(busqueda || filtroEstado || filtroBarrio);

  function limpiarFiltros() {
    setBusqueda("");

    setFiltroEstado("");

    setFiltroBarrio("");
  }

  // ====================================================*
  // INDICADORES*
  // ====================================================*

  const indicadores = useMemo(() => {
    const totalPolicias = unidades.reduce((s, u) => {
      const vinculados = policiasPorUnidad.get(String(u.idUnidad)) ?? [];

      const cantidad = vinculados.length
        ? vinculados.length
        : Array.isArray(u.policias)
          ? u.policias.length
          : Number(
              u.totalPolicias ?? u.cantidadPolicias ?? u.numeroPolicias ?? 0,
            );

      return s + (Number.isFinite(cantidad) ? cantidad : 0);
    }, 0);

    return {
      total: unidades.length,
      totalUnidades: unidades.length,
      operativas: unidades.filter((u) => normalizar(u.estado) === "OPERATIVA")
        .length,
      activas: unidades.filter((u) => normalizar(u.estado) === "ACTIVA").length,
      policias: totalPolicias,
      totalPolicias,
    };
  }, [unidades, policiasPorUnidad]);

  // ====================================================*
  // CREAR Y EDITAR*
  // ====================================================*

  function nuevaUnidad() {
    setSeleccion(null);

    setForm({ ...FORM_INICIAL });

    setError("");

    setMensaje("");

    setModal("formulario");
  }

  async function editarUnidad(u) {
    setError("");

    try {
      const d = await apiAdminPolicia(`/api/Unidades/${u.idUnidad}`);

      setSeleccion(d);

      setForm({
        nombre: d.nombre ?? "",
        idBarrio: String(d.idBarrio ?? ""),
        estado: d.estado ?? "OPERATIVA",
        latitud: String(d.latitud ?? ""),
        longitud: String(d.longitud ?? ""),
      });

      setModal("formulario");
    } catch (e) {
      setError(e.message || "No se pudo consultar la unidad.");
    }
  }

  async function verDetalle(u) {
    setError("");

    try {
      const d = await apiAdminPolicia(`/api/Unidades/${u.idUnidad}`);

      setSeleccion(d);

      setModal("detalle");
    } catch (e) {
      setError(e.message || "No se pudo consultar el detalle.");
    }
  }

  function cerrarModal() {
    if (guardando) return;

    setModal("");

    setSeleccion(null);

    setForm({ ...FORM_INICIAL });

    setError("");
  }

  function cambiar(campo, valor) {
    setForm((v) => ({
      ...v,
      [campo]: valor,
    }));
  }

  // ====================================================*
  // GUARDAR O ACTUALIZAR*
  // ====================================================*

  async function guardarUnidad(cuerpo, edicion) {
    setGuardando(true);
    try {
      if (edicion) {
        await apiAdminPolicia(`/api/Unidades/${seleccion.idUnidad}`, {
          method: "PUT",
          body: JSON.stringify({
            ...cuerpo,
            estado: form.estado,
          }),
        });
      } else {
        await apiAdminPolicia("/api/Unidades", {
          method: "POST",
          body: JSON.stringify(cuerpo),
        });
      }

      setModal("");

      setSeleccion(null);

      setForm({ ...FORM_INICIAL });

      await cargar();

      setMensaje(
        edicion
          ? "Unidad actualizada correctamente."
          : "Unidad registrada correctamente.",
      );
    } catch (e) {
      setError(e.message || "No se pudo guardar la unidad.");
    } finally {
      setGuardando(false);
    }
  }

  function guardar(e) {
    e.preventDefault();
    if (guardando) return;

    setError("");
    const cuerpo = {
      nombre: form.nombre.trim(),
      idBarrio: Number(form.idBarrio),
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
    };
    const datosInvalidos =
      !cuerpo.nombre ||
      !form.idBarrio ||
      !Number.isInteger(cuerpo.idBarrio) ||
      cuerpo.idBarrio <= 0 ||
      form.latitud === "" ||
      form.longitud === "" ||
      !Number.isFinite(cuerpo.latitud) ||
      !Number.isFinite(cuerpo.longitud) ||
      Math.abs(cuerpo.latitud) > 90 ||
      Math.abs(cuerpo.longitud) > 180;

    if (datosInvalidos) {
      setError("Completa los datos y selecciona una ubicación válida.");
      return;
    }

    const edicion = Boolean(seleccion);
    if (edicion && String(seleccion.estado || "").trim().toUpperCase() !== String(form.estado || "").trim().toUpperCase()) {
      const activando = String(form.estado).trim().toUpperCase() === "OPERATIVA";
      confirm({
        title: activando ? "¿Activar unidad?" : "¿Cambiar estado de la unidad?",
        description: `Confirma que deseas cambiar ${seleccion.nombre} al estado ${form.estado}.`,
        confirmLabel: "Confirmar cambio",
        tone: "warning",
        failureMessage: "No se pudo actualizar el estado de la unidad.",
        onConfirm: () => guardarUnidad(cuerpo, edicion),
      });
      return;
    }

    guardarUnidad(cuerpo, edicion);
  }

  // ====================================================*
  // ELIMINAR*
  // ====================================================*

  function confirmarEliminar(u) {
    confirm({
      title: "¿Eliminar unidad?",
      description: `Se eliminará la unidad ${u.nombre}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar unidad",
      tone: "error",
      failureMessage: "No se pudo eliminar la unidad.",
      onConfirm: async () => {
        if (guardando) return;
        setGuardando(true);
        setError("");
        try {
          await apiAdminPolicia(`/api/Unidades/${u.idUnidad}`, { method: "DELETE" });
          setSeleccion(null);
          setModal("");
          await cargar();
          setMensaje("Unidad eliminada correctamente.");
        } finally {
          setGuardando(false);
        }
      },
    });
  }

  // ====================================================*
  // INTERFAZ*
  // ====================================================*

  return (
    <>
      <Topbar />

      <main className="container-fluid py-4 unidades-policia-page">
        {/* CABECERA */}

        <div className="header-vista-dash mb-4">
          <div>
            <h1>Unidades policiales</h1>

            <p>Administra las unidades, sus ubicaciones y sus integrantes.</p>
          </div>

          <button type="button" className="btn-cv-verde" onClick={nuevaUnidad}>
            <i className="bi bi-plus-lg" />
            Nueva unidad
          </button>
        </div>

        {/* INDICADORES */}

        <Kpis {...indicadores} />

        {/* FILTROS */}

        <section className="panel-filtros-unidades mt-4">
          <div className="filtros-unidades-barra">
            <div className="fu-buscador">
              <i className="bi bi-search" aria-hidden="true" />

              <input
                id="buscarUnidad"
                type="search"
                placeholder="Buscar por nombre, barrio o código..."
                aria-label="Buscar unidad"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <FiltroEstado
              id="filtroEstadoUnidad"
              valor={filtroEstado}
              onChange={setFiltroEstado}
              conteos={conteosEstado}
              total={unidades.length}
            />

            <div className={`fu-barrio ${filtroBarrio ? "activo" : ""}`}>
              <BuscadorBarrio
                id="filtroBarrioUnidad"
                barrios={barrios}
                valor={filtroBarrio}
                onChange={setFiltroBarrio}
                placeholder="Filtrar por barrio"
              />
            </div>
          </div>

          <div className="filtros-unidades-pie">
            <span className="fu-resultados">
              Mostrando <strong>{filtradas.length}</strong> de{" "}
              <strong>{unidades.length}</strong> unidades
            </span>

            {hayFiltros && (
              <button
                type="button"
                className="fu-limpiar"
                onClick={limpiarFiltros}
              >
                <i className="bi bi-x-circle" aria-hidden="true" />
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        {/* TABLA */}

        <section className="card-panel-dash">
          <div className="tabla-header-dash">
            <span>
              <i className="bi bi-shield-check me-2" />
              Unidades registradas
            </span>

            <button
              type="button"
              className="btn-icono-dash ms-auto"
              onClick={cargar}
              disabled={cargando}
              title="Actualizar"
            >
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>

          <div className="table-responsive">
            <table className="tabla-dash">
              <thead>
                <tr>
                  <th>UNIDAD</th>

                  <th>BARRIO</th>

                  <th>ESTADO</th>

                  <th>POLICÍAS</th>

                  <th>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="tabla-vacio-dash">
                      Cargando unidades...
                    </td>
                  </tr>
                ) : paginaUnidades.length ? (
                  paginaUnidades.map((u) => (
                    <tr key={u.idUnidad}>
                      <td>
                        <div className="celda-persona-dash">
                          <div className="unidad-tabla-icono">
                            <IconoUnidad tamaño={22} />
                          </div>

                          <div>
                            <div className="celda-titulo-dash">{u.nombre}</div>

                            <div className="celda-sub-dash">
                              ID #{u.idUnidad}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{nombreBarrio(u)}</td>

                      <td>
                        <span
                          className={`unidad-estado unidad-estado-${normalizar(
                            u.estado,
                          ).toLowerCase()}`}
                        >
                          <span className="unidad-estado-punto" />

                          {mostrar(u.estado)}
                        </span>
                      </td>

                      <td>{mostrar(cantidadPolicias(u))}</td>

                      <td className="ver-detalles-cell">
                        <div className="tabla-acciones-dash">
                          <button
                            type="button"
                            className="btn-icono-dash btn-ver-detalle-admin btn-ver-detalles"
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${u.nombre}`}
                            onClick={() => verDetalle(u)}
                          >
                            <i className="bi bi-eye-fill" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="btn-icono-dash editar-dash"
                            title="Editar"
                            aria-label={`Editar ${u.nombre}`}
                            onClick={() => editarUnidad(u)}
                          >
                            <i className="bi bi-pencil-square" />
                          </button>

                          <button
                            type="button"
                            className="btn-icono-dash borrar-dash"
                            title="Eliminar"
                            aria-label={`Eliminar ${u.nombre}`}
                            onClick={() => confirmarEliminar(u)}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="tabla-vacio-dash">
                      No se encontraron unidades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}

          {totalPaginas > 1 && (
            <div className="unidades-paginacion">
              <div className="unidades-paginacion-info">
                <span>
                  Mostrando{" "}
                  <strong>{(paginaActual - 1) * POR_PAGINA + 1}</strong>
                  {" - "}
                  <strong>
                    {Math.min(paginaActual * POR_PAGINA, filtradas.length)}
                  </strong>
                  {" de "}
                  <strong>{filtradas.length}</strong>
                  {" unidades"}
                </span>
              </div>

              <div className="unidades-paginacion-controles">
                <button
                  type="button"
                  className="unidades-paginacion-btn"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                >
                  <i className="bi bi-chevron-left" />

                  <span>Anterior</span>
                </button>

                <span className="unidades-paginacion-actual">
                  Página <strong>{paginaActual}</strong> de{" "}
                  <strong>{totalPaginas}</strong>
                </span>

                <button
                  type="button"
                  className="unidades-paginacion-btn"
                  disabled={paginaActual === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                  aria-label="Página siguiente"
                >
                  <span>Siguiente</span>

                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL REGISTRAR / EDITAR */}

      {modal === "formulario" && (
        <div
          className="unidad-mapa-modal"
          role="dialog"
          aria-modal="true"
          aria-label={seleccion ? "Editar unidad" : "Registrar unidad"}
        >
          <div className="unidad-mapa-ventana">
            <div className="unidad-mapa-cabecera">
              <div className="unidad-mapa-cabecera-info">
                <div className="unidad-modal-icono unidad-icono-imagen">
                  <IconoUnidad tamaño={32} />
                </div>

                <div>
                  <h2>{seleccion ? "Editar unidad" : "Registrar unidad"}</h2>
                  <p>
                    Completa los datos y selecciona la ubicación en el mapa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="unidad-mapa-cerrar"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="unidad-mapa-contenido">
              <MapaUnidadesPoliciales
                unidades={unidades}
                seleccion={{
                  idUnidad: seleccion?.idUnidad,
                  latitud: form.latitud,
                  longitud: form.longitud,
                }}
                onSeleccionar={({ latitud, longitud }) => {
                  setForm((v) => ({
                    ...v,
                    latitud,
                    longitud,
                  }));
                }}
              />

              <form
                className="unidad-mapa-formulario"
                onSubmit={guardar}
                onInvalid={(evento) => {
                  evento.preventDefault();
                  toast.warning(evento.target.validationMessage || "Revisa los campos obligatorios.", "Datos incompletos");
                }}
              >
                <div className="unidad-mapa-seccion">
                  <div className="unidad-modal-icono unidad-modal-icono-pequeno unidad-icono-imagen">
                    <IconoUnidad tamaño={26} />
                  </div>

                  <div>
                    <h3>Datos del sistema</h3>

                    <p>Configuración de la unidad policial</p>
                  </div>
                </div>

                <div className="unidad-mapa-campo">
                  <label htmlFor="unidadNombre">Nombre de la unidad</label>

                  <input
                    id="unidadNombre"
                    type="text"
                    maxLength={50}
                    placeholder="Ej. CAI Centro"
                    required
                    value={form.nombre}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                  />
                </div>

                <div className="unidad-mapa-campo">
                  <label htmlFor="unidadBarrio">Barrio</label>

                  <BuscadorBarrio
                    id="unidadBarrio"
                    barrios={barrios}
                    valor={form.idBarrio}
                    onChange={(id) => cambiar("idBarrio", id)}
                    placeholder="Buscar barrio..."
                    required
                  />
                </div>

                <div className="unidad-mapa-campo">
                  <label htmlFor="unidadEstado">Estado</label>

                  <SelectBonito
                    id="unidadEstado"
                    variante="campo"
                    icono="bi-activity"
                    ariaLabel="Estado de la unidad"
                    valor={form.estado}
                    deshabilitado={!seleccion}
                    onChange={(v) => cambiar("estado", v || "OPERATIVA")}
                    opciones={OPCIONES_ESTADO_FORM}
                  />
                </div>

                <div className="unidad-mapa-coordenadas">
                  <i className="bi bi-geo-alt-fill" />

                  <div>
                    <strong>Ubicación seleccionada</strong>

                    <span>
                      {form.latitud !== "" && form.longitud !== ""
                        ? `${form.latitud}, ${form.longitud}`
                        : "Selecciona un punto en el mapa"}
                    </span>
                  </div>
                </div>

                <div className="unidad-mapa-botones">
                  <button
                    type="submit"
                    className="unidad-mapa-boton guardar"
                    disabled={guardando}
                  >
                    <i className="bi bi-floppy me-2" />

                    {guardando
                      ? "Guardando..."
                      : seleccion
                        ? "Actualizar unidad"
                        : "Guardar unidad"}
                  </button>

                  <button
                    type="button"
                    className="unidad-mapa-boton cancelar"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}

      {modal === "detalle" && seleccion && (
        <div
          className="unidad-detalle-fondo"
          role="dialog"
          aria-modal="true"
          aria-label="Detalles de unidad"
        >
          <div className="unidad-detalle-ventana">
            <div className="unidad-detalle-header">
              <div className="unidad-detalle-header-info">
                <div className="unidad-detalle-header-icono">
                  <IconoUnidad tamaño={30} />
                </div>

                <div>
                  <h2>{seleccion.nombre}</h2>

                  <p>Información de la unidad policial</p>
                </div>
              </div>

              <button
                type="button"
                className="unidad-detalle-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="unidad-detalle-body">
              <div className="unidad-detalle-grid">
                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-hash" />
                  </div>

                  <div>
                    <span>ID de unidad</span>

                    <strong>#{seleccion.idUnidad}</strong>
                  </div>
                </div>

                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-activity" />
                  </div>

                  <div>
                    <span>Estado</span>

                    <strong
                      className={`unidad-estado-${normalizar(
                        seleccion.estado,
                      ).toLowerCase()}`}
                    >
                      {mostrar(seleccion.estado)}
                    </strong>
                  </div>
                </div>

                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-geo-alt" />
                  </div>

                  <div>
                    <span>Barrio</span>

                    <strong>{nombreBarrio(seleccion)}</strong>
                  </div>
                </div>

                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-people" />
                  </div>

                  <div>
                    <span>Policías asignados</span>

                    <strong>{mostrar(cantidadPolicias(seleccion))}</strong>
                  </div>
                </div>

                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-compass" />
                  </div>

                  <div>
                    <span>Latitud</span>

                    <strong>{mostrar(seleccion.latitud)}</strong>
                  </div>
                </div>

                <div className="unidad-detalle-dato">
                  <div className="unidad-detalle-dato-icono">
                    <i className="bi bi-compass-fill" />
                  </div>

                  <div>
                    <span>Longitud</span>

                    <strong>{mostrar(seleccion.longitud)}</strong>
                  </div>
                </div>
              </div>

              <div className="unidad-detalle-integrantes">
                <div className="unidad-detalle-seccion-titulo">
                  <i className="bi bi-people-fill" />

                  <h3>Integrantes de la unidad</h3>

                  <span>{integrantesUnidad(seleccion.idUnidad).length}</span>
                </div>

                {errorPolicias && (
                  <p className="unidad-detalle-aviso">{errorPolicias}</p>
                )}

                {integrantesUnidad(seleccion.idUnidad).length ? (
                  <div className="unidad-detalle-lista">
                    {integrantesUnidad(seleccion.idUnidad).map((p, i) => (
                      <div
                        className="unidad-detalle-integrante"
                        key={p.idUsuario ?? i}
                      >
                        <div className="unidad-detalle-persona-icono">
                          <i className="bi bi-person-badge" />
                        </div>

                        <span>{nombrePolicia(p)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="unidad-detalle-vacio">
                    No hay integrantes disponibles para mostrar.
                  </p>
                )}
              </div>
            </div>

            <div className="unidad-detalle-footer">
              <button
                type="button"
                className="unidad-detalle-btn-secundario"
                onClick={cerrarModal}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="unidad-detalle-btn-principal"
                onClick={() => editarUnidad(seleccion)}
              >
                <i className="bi bi-pencil-square" />
                Editar unidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}

    </>
  );
}
