
import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import {
  listarPolicias,
  listarUsuariosDisponibles,
  crearPolicia,
  actualizarPolicia,
  eliminarPolicia,
  registrarNuevoPolicia,
} from "../../Services/PoliciasAdminService";
import { apiAdminPolicia } from "../../Services/AdminPoliciaApi";
import "../../css/Policia/administrador-policia/css/policias.css";

const vacio = {
  idUsuario: "",
  cedula: "",
  primerNombre: "",
  primerApellido: "",
  correo: "",
  username: "",
  password: "",
  placa: "",
  rango: "",
  estado: "ACTIVO",
  idUnidad: "",
};

const columnasExcel = [
  "cedula",
  "primerNombre",
  "primerApellido",
  "correo",
  "username",
  "password",
  "placa",
  "rango",
  "estado",
  "idUnidad",
];

const normalizarCabecera = (valor) =>
  String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");

const alias = {
  cedula: "cedula",
  primernombre: "primerNombre",
  primerapellido: "primerApellido",
  correo: "correo",
  email: "correo",
  username: "username",
  usuario: "username",
  password: "password",
  contrasena: "password",
  placa: "placa",
  rango: "rango",
  estado: "estado",
  idunidad: "idUnidad",
};

const requeridoExcel = [
  "cedula",
  "primerNombre",
  "primerApellido",
  "correo",
  "username",
  "password",
  "placa",
];

const texto = (valor) => String(valor ?? "").trim();

function validarFila(fila) {
  const faltantes = requeridoExcel.filter(
    (campo) => !texto(fila[campo])
  );

  if (faltantes.length) {
    return `Faltan: ${faltantes.join(", ")}`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(fila.correo))) {
    return "Correo inválido";
  }

  if (texto(fila.placa).length > 10) {
    return "Placa supera 10 caracteres";
  }

  if (texto(fila.rango).length > 25) {
    return "Rango supera 25 caracteres";
  }

  if (
    !["ACTIVO", "INACTIVO"].includes(
      texto(fila.estado || "ACTIVO").toUpperCase()
    )
  ) {
    return "Estado inválido";
  }

  if (
    texto(fila.idUnidad) &&
    (!Number.isInteger(Number(fila.idUnidad)) ||
      Number(fila.idUnidad) <= 0)
  ) {
    return "ID de unidad inválido";
  }

  return "";
}

export default function Policias() {
  const [policias, setPolicias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [unidad, setUnidad] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [modal, setModal] = useState(null);
  const [modoRegistro, setModoRegistro] = useState("nuevo");

  const [formulario, setFormulario] = useState({ ...vacio });
  const [usuarios, setUsuarios] = useState([]);
  const [unidadesOpciones, setUnidadesOpciones] = useState([]);

  const [filasExcel, setFilasExcel] = useState([]);
  const [resultadosExcel, setResultadosExcel] = useState([]);

  const inputExcel = useRef(null);

  // =========================================
  // CONSULTAS
  // =========================================

  const recargar = async () => {
    const datos = await listarPolicias();
    setPolicias(datos);
  };

  useEffect(() => {
    let vivo = true;

    listarPolicias()
      .then((datos) => {
        if (vivo) setPolicias(datos);
      })
      .catch((e) => {
        if (vivo) setError(e.message);
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });

    return () => {
      vivo = false;
    };
  }, []);

  async function cargarUnidades() {
    const datos = await apiAdminPolicia("/api/Unidades");

    if (!Array.isArray(datos)) {
      throw new Error(
        "La API no devolvió una lista de unidades."
      );
    }

    setUnidadesOpciones(datos);
  }

  // =========================================
  // MODALES
  // =========================================

  async function abrirCrear() {
    setError("");
    setMensaje("");
    setFormulario({ ...vacio });
    setModoRegistro("nuevo");
    setModal("crear");

    try {
      await cargarUnidades();
    } catch (e) {
      setError(e.message);
    }
  }

  async function cambiarModo(modo) {
    setModoRegistro(modo);
    setError("");

    setFormulario((actual) => ({
      ...actual,
      idUsuario: "",
    }));

    if (modo === "existente") {
      try {
        const disponibles = await listarUsuariosDisponibles();
        setUsuarios(disponibles);
      } catch (e) {
        setError(e.message);
      }
    }
  }

  async function abrirEditar(policia) {
    setError("");
    setMensaje("");

    setFormulario({
      ...vacio,
      idUsuario: policia.idUsuario,
      placa: policia.placa ?? "",
      rango: policia.rango ?? "",
      estado: policia.estado ?? "ACTIVO",
      idUnidad: policia.idUnidad ?? "",
    });

    setModal("editar");

    try {
      await cargarUnidades();
    } catch (e) {
      setError(e.message);
    }
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function cerrar() {
    if (guardando) return;

    setModal(null);
    setError("");
  }

  // =========================================
  // GUARDAR
  // =========================================

  async function guardar(e) {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    const datos = {
      placa: texto(formulario.placa),
      rango: texto(formulario.rango) || null,
      estado: formulario.estado,
      idUnidad:
        formulario.idUnidad === ""
          ? null
          : Number(formulario.idUnidad),
    };

    try {
      if (modal === "editar") {
        await actualizarPolicia(
          formulario.idUsuario,
          datos
        );
      } else if (modoRegistro === "nuevo") {
        await registrarNuevoPolicia({
          ...formulario,
          ...datos,
        });
      } else {
        await crearPolicia({
          ...datos,
          idUsuario: Number(formulario.idUsuario),
        });
      }

      await recargar();

      setModal(null);
      setMensaje("Registro guardado correctamente.");
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(policia) {
    const confirmar = window.confirm(
      `¿Eliminar el registro policial de ${
        policia.nombreUsuario || policia.placa
      }?`
    );

    if (!confirmar) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await eliminarPolicia(policia.idUsuario);
      await recargar();

      setMensaje("Registro policial eliminado.");
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  // =========================================
  // FILTROS Y KPI
  // =========================================

  const unidades = useMemo(() => {
    const mapa = new Map();

    policias
      .filter((p) => p.idUnidad != null)
      .forEach((p) => {
        mapa.set(
          String(p.idUnidad),
          p.nombreUnidad
        );
      });

    return [...mapa.entries()];
  }, [policias]);

  const filtrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    return policias.filter((p) => {
      const coincideBusqueda = [
        p.nombreUsuario,
        p.cedula,
        p.placa,
        p.rango,
      ].some((valor) =>
        texto(valor).toLowerCase().includes(termino)
      );

      const coincideEstado =
        !estado ||
        texto(p.estado).toUpperCase() === estado;

      const coincideUnidad =
        !unidad ||
        String(p.idUnidad) === unidad;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideUnidad
      );
    });
  }, [policias, busqueda, estado, unidad]);

  const activos = policias.filter(
    (p) =>
      texto(p.estado).toUpperCase() === "ACTIVO"
  ).length;

  const tarjetas = [
    {
      titulo: "Total de policías",
      valor: policias.length,
      icono: "bi-people-fill",
      tono: "azul",
    },
    {
      titulo: "Policías activos",
      valor: activos,
      icono: "bi-person-check-fill",
      tono: "verde",
    },
    {
      titulo: "Unidades con policías",
      valor: unidades.length,
      icono: "bi-shield-check",
      tono: "ambar",
    },
  ];

  // =========================================
  // LEER ARCHIVO EXCEL
  // =========================================

  async function leerExcel(evento) {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    setError("");
    setMensaje("");
    setResultadosExcel([]);

    try {
      const XLSX = await import("xlsx");

      const contenido = await archivo.arrayBuffer();

      const libro = XLSX.read(contenido, {
        type: "array",
        cellDates: false,
      });

      const hoja = libro.Sheets[libro.SheetNames[0]];

      const matriz = XLSX.utils.sheet_to_json(hoja, {
        header: 1,
        defval: "",
        raw: false,
      });

      if (matriz.length < 2) {
        throw new Error(
          "El Excel no contiene registros."
        );
      }

      const campos = matriz[0].map(
        (columna) =>
          alias[normalizarCabecera(columna)] || null
      );

      const faltan = requeridoExcel.filter(
        (campo) => !campos.includes(campo)
      );

      if (faltan.length) {
        throw new Error(
          `Faltan columnas: ${faltan.join(", ")}`
        );
      }

      const registros = matriz
        .slice(1)
        .map((valores, indice) => {
          const fila = {};

          campos.forEach((campo, posicion) => {
            if (campo) {
              fila[campo] = texto(valores[posicion]);
            }
          });

          fila.estado = texto(
            fila.estado || "ACTIVO"
          ).toUpperCase();

          return {
            ...fila,
            numero: indice + 2,
            error: validarFila(fila),
          };
        })
        .filter((fila) =>
          columnasExcel.some((campo) =>
            texto(fila[campo])
          )
        );

      if (!registros.length) {
        throw new Error(
          "No hay filas para importar."
        );
      }

      const cedulas = new Set();
      const usuariosExcel = new Set();
      const placas = new Set();

      const revisados = registros.map((fila) => {
        let errorFila = fila.error;

        const controles = [
          ["cedula", cedulas],
          ["username", usuariosExcel],
          ["placa", placas],
        ];

        for (const [campo, conjunto] of controles) {
          const valor = texto(
            fila[campo]
          ).toLowerCase();

          if (valor && conjunto.has(valor)) {
            errorFila =
              errorFila ||
              `Valor repetido en el Excel: ${campo}`;
          }

          conjunto.add(valor);
        }

        return {
          ...fila,
          error: errorFila,
        };
      });

      setFilasExcel(revisados);
      setModal("excel");
    } catch (e) {
      setError(
        `No se pudo leer el Excel: ${e.message}`
      );
    } finally {
      evento.target.value = "";
    }
  }

  // =========================================
  // DESCARGAR PLANTILLA CSV
  // =========================================

  function descargarPlantilla() {
    const encabezado = columnasExcel.join(",");

    const blob = new Blob(
      ["\uFEFF" + encabezado + "\n"],
      {
        type: "text/csv;charset=utf-8",
      }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "plantilla_policias.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  }

  // =========================================
  // IMPORTAR REGISTROS
  // =========================================

  async function importarExcel() {
    if (guardando) return;

    const validas = filasExcel.filter(
      (fila) => !fila.error
    );

    if (!validas.length) return;

    setGuardando(true);
    setResultadosExcel([]);

    const salida = [];

    for (const fila of validas) {
      try {
        await registrarNuevoPolicia({
          ...fila,
          idUnidad: texto(fila.idUnidad)
            ? Number(fila.idUnidad)
            : null,
        });

        salida.push({
          numero: fila.numero,
          estado: "OK",
          detalle: "Registrado",
        });
      } catch (e) {
        salida.push({
          numero: fila.numero,
          estado: "ERROR",
          detalle: e.message,
        });
      }

      setResultadosExcel([...salida]);
    }

    try {
      await recargar();
    } catch (e) {
      setError(e.message);
    }

    setGuardando(false);

    setMensaje(
      `Importación terminada: ${
        salida.filter((r) => r.estado === "OK").length
      } correctos, ${
        salida.filter((r) => r.estado === "ERROR").length
      } fallidos.`
    );
  }

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <>
      <Topbar
        iniciales="AP"
        placeholder="Buscar policía, cédula o placa..."
        valor={busqueda}
        onCambio={setBusqueda}
      />

      {/* ENCABEZADO */}

      <div className="header-vista-dash mb-4">
        <div>
          <h1>Policías</h1>
          <p>
            Administra el personal policial y sus unidades.
          </p>
        </div>

        <div className="policias-botones-cabecera">
          <input
            ref={inputExcel}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={leerExcel}
          />

          <button
            type="button"
            className="btn-secundario-dash"
            onClick={() => inputExcel.current?.click()}
          >
            <i className="bi bi-file-earmark-excel" />
            Importar Excel
          </button>

          <button
            type="button"
            className="btn-cv-verde"
            onClick={abrirCrear}
          >
            <i className="bi bi-plus-lg" />
            Nuevo policía
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {error && !modal && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* TARJETAS KPI */}

      <div className="row g-3 mb-4">
        {tarjetas.map((tarjeta) => (
          <div
            className="col-12 col-sm-6 col-xl-4"
            key={tarjeta.titulo}
          >
            <article
              className={`kpi-card-policial tono-${tarjeta.tono}`}
            >
              <div className="kpi-card-icono">
                <i className={`bi ${tarjeta.icono}`} />
              </div>

              <div className="kpi-card-info">
                <span className="kpi-card-titulo">
                  {tarjeta.titulo}
                </span>

                <strong className="kpi-card-valor">
                  {cargando ? "..." : tarjeta.valor}
                </strong>
              </div>

              <span className="kpi-card-flecha">
                <i className="bi bi-chevron-right" />
              </span>
            </article>
          </div>
        ))}
      </div>

      {/* FILTROS */}

      <div className="panel-filtros-policias mb-4">
        <div className="panel-filtros-header">
          <div className="panel-filtros-icono">
            <i className="bi bi-funnel" />
          </div>

          <div>
            <h3>Filtros de policías</h3>
            <p>Busca y organiza el personal policial</p>
          </div>
        </div>

        <div className="panel-filtros-body">
          <div className="buscador-unidades">
            <label htmlFor="buscarPolicia">
              Buscar policía
            </label>

            <div className="buscador-unidades-input">
              <i className="bi bi-search" />

              <input
                id="buscarPolicia"
                placeholder="Nombre, cédula o placa..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />
            </div>
          </div>

          <div className="filtros-unidades-selects">
            <div className="filtro-unidad-card">
              <label htmlFor="filtroEstado">
                Estado
              </label>

              <select
                id="filtroEstado"
                className="form-select"
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value)
                }
              >
                <option value="">
                  Todos los estados
                </option>

                {[
                  ...new Set(
                    policias
                      .map((p) =>
                        texto(p.estado).toUpperCase()
                      )
                      .filter(Boolean)
                  ),
                ].map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-unidad-card">
              <label htmlFor="filtroUnidad">
                Unidad
              </label>

              <select
                id="filtroUnidad"
                className="form-select"
                value={unidad}
                onChange={(e) =>
                  setUnidad(e.target.value)
                }
              >
                <option value="">
                  Todas las unidades
                </option>

                {unidades.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre || `Unidad ${id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA ALINEADA */}

      <div className="card-panel-dash mb-4 policias-tabla-panel">
        <div className="table-responsive">
          <table className="tabla-dash tabla-policias-alineada">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>Policía</th>
                <th>Placa</th>
                <th>Rango</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((policia) => (
                <tr key={policia.idUsuario}>
                  <td>
                    <div className="celda-persona-dash">
                      <div
                        className="avatar-sm-dash"
                        style={{ background: "#087b58" }}
                      >
                        {texto(
                          policia.nombreUsuario || "P"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="celda-titulo-dash">
                          {policia.nombreUsuario ||
                            "Sin nombre"}
                        </div>

                        <div className="celda-sub-dash">
                          {policia.cedula ||
                            "Sin cédula"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>{policia.placa || "—"}</td>
                  <td>{policia.rango || "—"}</td>

                  <td>
                    {policia.nombreUnidad ||
                      "Sin unidad"}
                  </td>

                  <td>
                    <span
                      className={
                        texto(
                          policia.estado
                        ).toUpperCase() === "ACTIVO"
                          ? "badge bg-success"
                          : "badge bg-secondary"
                      }
                    >
                      {policia.estado || "—"}
                    </span>
                  </td>

                  <td>
                    <div className="tabla-acciones-dash">
                      <button
                        type="button"
                        className="btn-icono-dash editar-dash"
                        aria-label="Editar"
                        onClick={() =>
                          abrirEditar(policia)
                        }
                      >
                        <i className="bi bi-pencil-square" />
                      </button>

                      <button
                        type="button"
                        className="btn-icono-dash borrar-dash"
                        aria-label="Eliminar"
                        disabled={guardando}
                        onClick={() => borrar(policia)}
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

        {!cargando && filtrados.length === 0 && (
          <div className="tabla-vacio-dash">
            No se encontraron policías.
          </div>
        )}
      </div>

      {/* MODAL */}

      {modal && (
        <div
          className="modal d-block modal-policias"
          role="dialog"
          aria-modal="true"
          aria-label={
            modal === "excel"
              ? "Importar policías"
              : modal === "editar"
                ? "Editar policía"
                : "Registrar policía"
          }
          style={{
            background: "rgba(9,28,24,.6)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-policias-content">
              <div className="modal-header-dash">
                <div>
                  <h2 className="modal-title">
                    {modal === "excel"
                      ? "Importar policías desde Excel"
                      : modal === "editar"
                        ? "Editar policía"
                        : "Registrar policía"}
                  </h2>

                  <p className="modal-subtitle">
                    {modal === "excel"
                      ? "Revisa los datos antes de registrar"
                      : "Información de la cuenta y del personal"}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  disabled={guardando}
                  onClick={cerrar}
                />
              </div>

              {modal === "excel" ? (
                <>
                  <div className="modal-body-dash">
                    <p className="policias-ayuda">
                      La primera hoja debe tener las columnas:
                      {" "}
                      {columnasExcel.join(", ")}.
                      {" "}
                      La columna <strong>idUnidad</strong>
                      {" "}
                      es opcional y debe contener el ID
                      numérico de la unidad.
                      Los registros con errores no se enviarán.
                    </p>

                    <button
                      type="button"
                      className="btn-secundario-dash mb-3"
                      onClick={descargarPlantilla}
                    >
                      <i className="bi bi-download" />
                      Descargar plantilla CSV
                    </button>

                    <div className="table-responsive">
                      <table className="table table-sm tabla-importacion">
                        <thead>
                          <tr>
                            <th>Fila</th>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Placa</th>
                            <th>Validación</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filasExcel.map((fila) => (
                            <tr key={fila.numero}>
                              <td>{fila.numero}</td>
                              <td>{fila.cedula}</td>
                              <td>
                                {fila.primerNombre}
                                {" "}
                                {fila.primerApellido}
                              </td>
                              <td>{fila.placa}</td>

                              <td
                                className={
                                  fila.error
                                    ? "text-danger"
                                    : "text-success"
                                }
                              >
                                {fila.error || "Lista"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {resultadosExcel.length > 0 && (
                      <div
                        className="mt-3"
                        aria-live="polite"
                      >
                        <strong>Resultados</strong>

                        <div className="policias-resultados">
                          {resultadosExcel.map(
                            (resultado) => (
                              <p
                                key={resultado.numero}
                                className={
                                  resultado.estado === "OK"
                                    ? "text-success"
                                    : "text-danger"
                                }
                              >
                                Fila {resultado.numero}:
                                {" "}
                                {resultado.detalle}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer-dash">
                    <button
                      type="button"
                      className="btn-secundario-dash"
                      onClick={cerrar}
                      disabled={guardando}
                    >
                      Cerrar
                    </button>

                    <button
                      type="button"
                      className="btn-cv-verde"
                      onClick={importarExcel}
                      disabled={
                        guardando ||
                        !filasExcel.some(
                          (fila) => !fila.error
                        ) ||
                        resultadosExcel.length > 0
                      }
                    >
                      {guardando
                        ? `Procesando ${resultadosExcel.length}/${
                            filasExcel.filter(
                              (fila) => !fila.error
                            ).length
                          }`
                        : `Importar ${
                            filasExcel.filter(
                              (fila) => !fila.error
                            ).length
                          } registros válidos`}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={guardar}>
                  <div className="modal-body-dash">
                    {error && (
                      <div className="alert alert-danger">
                        {error}
                      </div>
                    )}

                    {/* TIPO DE REGISTRO */}

                    {modal === "crear" && (
                      <div className="form-seccion-policias">
                        <div className="form-seccion-titulo">
                          <i className="bi bi-person-check" />

                          <div>
                            <h3>Tipo de registro</h3>
                            <p>
                              Selecciona cómo registrar al policía
                            </p>
                          </div>
                        </div>

                        <div className="registro-opciones-policias">
                          <label
                            className={`registro-opcion-policias ${
                              modoRegistro === "nuevo"
                                ? "seleccionada"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="modo"
                              checked={
                                modoRegistro === "nuevo"
                              }
                              onChange={() =>
                                cambiarModo("nuevo")
                              }
                            />

                            <i className="bi bi-person-plus" />

                            <span>
                              <strong>
                                Usuario nuevo
                              </strong>
                              <small>
                                Crear cuenta
                              </small>
                            </span>
                          </label>

                          <label
                            className={`registro-opcion-policias ${
                              modoRegistro === "existente"
                                ? "seleccionada"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="modo"
                              checked={
                                modoRegistro === "existente"
                              }
                              onChange={() =>
                                cambiarModo("existente")
                              }
                            />

                            <i className="bi bi-person-check" />

                            <span>
                              <strong>
                                Usuario existente
                              </strong>
                              <small>
                                Vincular cuenta
                              </small>
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* DATOS DE ACCESO */}

                    {modal === "crear" &&
                      (modoRegistro === "nuevo" ? (
                        <div className="form-seccion-policias">
                          <div className="form-seccion-titulo">
                            <i className="bi bi-person-vcard" />

                            <div>
                              <h3>Datos de acceso</h3>
                            </div>
                          </div>

                          <div className="row g-3">
                            {[
                              [
                                "cedula",
                                "Cédula",
                                "text",
                              ],
                              [
                                "primerNombre",
                                "Primer nombre",
                                "text",
                              ],
                              [
                                "primerApellido",
                                "Primer apellido",
                                "text",
                              ],
                              [
                                "correo",
                                "Correo electrónico",
                                "email",
                              ],
                              [
                                "username",
                                "Usuario",
                                "text",
                              ],
                              [
                                "password",
                                "Contraseña inicial",
                                "password",
                              ],
                            ].map(
                              ([campo, etiqueta, tipo]) => (
                                <div
                                  className="col-12 col-md-6"
                                  key={campo}
                                >
                                  <div className="form-field-dash">
                                    <label
                                      htmlFor={`pol-${campo}`}
                                    >
                                      {etiqueta} *
                                    </label>

                                    <input
                                      id={`pol-${campo}`}
                                      className="form-control"
                                      type={tipo}
                                      required
                                      maxLength={
                                        campo === "cedula"
                                          ? 20
                                          : undefined
                                      }
                                      autoComplete={
                                        campo === "password"
                                          ? "new-password"
                                          : "off"
                                      }
                                      value={
                                        formulario[campo]
                                      }
                                      onChange={(e) =>
                                        cambiar(
                                          campo,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="form-seccion-policias">
                          <div className="form-seccion-titulo">
                            <i className="bi bi-person-check" />

                            <div>
                              <h3>Usuario disponible</h3>
                            </div>
                          </div>

                          <div className="form-field-dash">
                            <label htmlFor="pol-id">
                              Usuario *
                            </label>

                            <select
                              id="pol-id"
                              className="form-select"
                              required
                              value={
                                formulario.idUsuario
                              }
                              onChange={(e) =>
                                cambiar(
                                  "idUsuario",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Selecciona un usuario
                              </option>

                              {usuarios.map(
                                (usuario) => (
                                  <option
                                    key={
                                      usuario.idUsuario
                                    }
                                    value={
                                      usuario.idUsuario
                                    }
                                  >
                                    {usuario.nombreCompleto ||
                                      usuario.username ||
                                      usuario.idUsuario}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>
                      ))}

                    {/* INFORMACIÓN POLICIAL */}

                    <div className="form-seccion-policias">
                      <div className="form-seccion-titulo">
                        <i className="bi bi-shield-check" />

                        <div>
                          <h3>
                            Información policial
                          </h3>
                          <p>
                            Identificación institucional y asignación
                          </p>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="form-field-dash">
                            <label htmlFor="pol-placa">
                              Placa *
                            </label>

                            <input
                              id="pol-placa"
                              className="form-control"
                              maxLength={10}
                              required
                              value={
                                formulario.placa
                              }
                              onChange={(e) =>
                                cambiar(
                                  "placa",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-field-dash">
                            <label htmlFor="pol-rango">
                              Rango
                            </label>

                            <input
                              id="pol-rango"
                              className="form-control"
                              maxLength={25}
                              value={
                                formulario.rango
                              }
                              onChange={(e) =>
                                cambiar(
                                  "rango",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-field-dash">
                            <label htmlFor="pol-unidad">
                              Unidad policial
                            </label>

                            <select
                              id="pol-unidad"
                              className="form-select"
                              value={
                                formulario.idUnidad
                              }
                              onChange={(e) =>
                                cambiar(
                                  "idUnidad",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Sin unidad
                              </option>

                              {unidadesOpciones.map(
                                (unidad) => (
                                  <option
                                    key={
                                      unidad.idUnidad
                                    }
                                    value={
                                      unidad.idUnidad
                                    }
                                  >
                                    {unidad.nombre ||
                                      `Unidad ${unidad.idUnidad}`}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-field-dash">
                            <label htmlFor="pol-estado">
                              Estado
                            </label>

                            <select
                              id="pol-estado"
                              className="form-select"
                              value={
                                formulario.estado
                              }
                              onChange={(e) =>
                                cambiar(
                                  "estado",
                                  e.target.value
                                )
                              }
                            >
                              <option value="ACTIVO">
                                Activo
                              </option>
                              <option value="INACTIVO">
                                Inactivo
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTONES DEL FORMULARIO */}

                  <div className="modal-footer-dash">
                    <button
                      type="button"
                      className="btn-secundario-dash"
                      onClick={cerrar}
                      disabled={guardando}
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
                        : modal === "crear"
                          ? "Registrar policía"
                          : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
