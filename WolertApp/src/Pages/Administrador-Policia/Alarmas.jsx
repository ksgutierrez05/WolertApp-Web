
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import RegistrarAlarmaMapa from "../../Components/Administrador-policia/RegistrarAlarmaMapa";
import {
  listarAlarmas,
  eliminarAlarma,
} from "../../Services/AlarmasAdminService";

import "../../css/Policia/administrador-policia/css/alarmas.css";
import "../../css/Policia/administrador-policia/css/registrar-alarma-mapa.css";

const dato = (obj, ...campos) =>
  campos.map((c) => obj?.[c]).find((v) => v != null);

const idAlarma = (a) =>
  dato(a, "idAlarma", "IdAlarma", "ID_ALARMA");

const nombreAlarma = (a) =>
  dato(a, "nombre", "Nombre", "NOMBRE") ?? "";

const estadoAlarma = (a) =>
  String(dato(a, "estado", "Estado", "ESTADO") ?? "")
    .trim()
    .toUpperCase();

const barrioAlarma = (a) =>
  dato(a, "nombreBarrio", "barrioNombre", "NombreBarrio") ??
  a.barrio?.nombre ??
  (dato(a, "idBarrio", "IdBarrio")
    ? `Barrio #${dato(a, "idBarrio", "IdBarrio")}`
    : "Sin barrio");

const radioAlarma = (a) =>
  dato(a, "radioCobertura", "RadioCobertura", "RADIO_COBERTURA");

const esMantenimiento = (e) =>
  ["MANTENIMIENTO", "EN MANTENIMIENTO"].includes(e);

export default function Alarmas() {
  const [alarmas, setAlarmas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("TODAS");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [editor, setEditor] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const POR_PAGINA = 8;

  useEffect(() => {
    const controller = new AbortController();

    listarAlarmas(controller.signal)
      .then((datos) => {
        if (controller.signal.aborted) return;
        setAlarmas(datos);
        setError("");
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e.message || "No se pudieron cargar las alarmas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [recarga]);

  const resumen = useMemo(() => ({
    total: alarmas.length,
    activas: alarmas.filter(
      (a) => estadoAlarma(a) === "ACTIVA"
    ).length,
    inactivas: alarmas.filter(
      (a) => estadoAlarma(a) === "INACTIVA"
    ).length,
    mantenimiento: alarmas.filter(
      (a) => esMantenimiento(estadoAlarma(a))
    ).length,
  }), [alarmas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alarmas.filter((a) => {
      const estado = estadoAlarma(a);

      const cumpleEstado =
        filtro === "TODAS" ||
        (filtro === "MANTENIMIENTO"
          ? esMantenimiento(estado)
          : estado === filtro);

      const contenido = [
        idAlarma(a),
        nombreAlarma(a),
        barrioAlarma(a),
        estado,
      ].join(" ").toLowerCase();

      return cumpleEstado && contenido.includes(texto);
    });
  }, [alarmas, filtro, busqueda]);

  const paginas = Math.max(
    1,
    Math.ceil(filtradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, paginas);

  const visibles = filtradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const indicadores = [
    {
      titulo: "Total de alarmas",
      valor: resumen.total,
      icono: "bi-broadcast-pin",
      tono: "azul",
    },
    {
      titulo: "Activas",
      valor: resumen.activas,
      icono: "bi-check-circle-fill",
      tono: "verde",
    },
    {
      titulo: "Inactivas",
      valor: resumen.inactivas,
      icono: "bi-slash-circle-fill",
      tono: "rojo",
    },
    {
      titulo: "En mantenimiento",
      valor: resumen.mantenimiento,
      icono: "bi-tools",
      tono: "ambar",
    },
  ];

  const filtros = [
    { clave: "TODAS", texto: "Todas", total: resumen.total },
    { clave: "ACTIVA", texto: "Activas", total: resumen.activas },
    { clave: "INACTIVA", texto: "Inactivas", total: resumen.inactivas },
    {
      clave: "MANTENIMIENTO",
      texto: "Mantenimiento",
      total: resumen.mantenimiento,
    },
  ];

  function actualizar() {
    setCargando(true);
    setRecarga((n) => n + 1);
  }

  function guardada() {
    const estabaEditando = editor?.modo === "editar";

    setEditor(null);
    setAviso(
      estabaEditando
        ? "Alarma modificada correctamente."
        : "Alarma registrada correctamente."
    );
    actualizar();
  }

  async function confirmarEliminar() {
    if (!eliminando || procesando) return;

    setProcesando(true);
    setError("");
    setAviso("");

    try {
      await eliminarAlarma(idAlarma(eliminando));
      setEliminando(null);
      setAviso("Alarma eliminada correctamente.");
      actualizar();
    } catch (e) {
      setError(e.message || "No se pudo eliminar la alarma.");
      setEliminando(null);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <Topbar
        iniciales="SG"
        placeholder="Buscar por nombre o barrio..."
        valor={busqueda}
        onCambio={(v) => {
          setBusqueda(v);
          setPagina(1);
        }}
      />

      <section className="alarmas-vista alarmas-crud">
        <div className="alarmas-encabezado">
          <div className="alarmas-encabezado-texto">
            <h1>Alarmas</h1>
            <p>
              Administra las alarmas comunitarias y sus
              zonas de cobertura.
            </p>
          </div>

          <div className="alarmas-acciones">
            <button
              type="button"
              className="alarma-btn alarma-btn-principal"
              onClick={() => setEditor({ modo: "crear" })}
            >
              <i className="bi bi-plus-circle" />
              Agregar alarma
            </button>

            <button
              type="button"
              className="alarma-btn alarma-btn-secundario"
              onClick={actualizar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise" />
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {aviso && (
          <div className="alert alert-success mb-3" role="status">
            <i className="bi bi-check-circle me-2" />
            {aviso}
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        <div className="row g-3 mb-4">
          {indicadores.map((item) => (
            <div className="col-6 col-xl-3" key={item.titulo}>
              <article className={`alarmas-kpi tono-${item.tono}`}>
                <div className="alarmas-kpi-icono">
                  <i className={`bi ${item.icono}`} />
                </div>
                <div className="alarmas-kpi-info">
                  <span className="alarmas-kpi-titulo">
                    {item.titulo}
                  </span>
                  <strong className="alarmas-kpi-valor">
                    {cargando ? "..." : item.valor}
                  </strong>
                </div>
                <i className="bi bi-chevron-right alarmas-kpi-flecha" />
              </article>
            </div>
          ))}
        </div>

        <div className="alarmas-filtros">
          {filtros.map((item) => (
            <button
              key={item.clave}
              type="button"
              className={`chip-filtro-dash ${
                filtro === item.clave ? "active" : ""
              }`}
              onClick={() => {
                setFiltro(item.clave);
                setPagina(1);
              }}
            >
              {item.texto}
              <span className="chip-count-dash">
                {item.total}
              </span>
            </button>
          ))}
        </div>

        <section className="alarmas-panel-tabla">
          <div className="alarmas-tabla-encabezado">
            <div className="alarmas-tabla-titulo">
              <span className="alarmas-tabla-icono">
                <i className="bi bi-broadcast-pin" />
              </span>
              <div>
                <h2>Alarmas registradas</h2>
                <p>
                  Consulta, modifica o elimina alarmas.
                </p>
              </div>
            </div>

            <span className="alarmas-total-registros">
              {filtradas.length} registros
            </span>
          </div>

          <div className="table-responsive">
            <table className="alarmas-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Barrio</th>
                  <th>Estado</th>
                  <th>Radio</th>
                  <th>Coordenadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {!cargando && visibles.map((a) => {
                  const estado = estadoAlarma(a);
                  const lat = dato(a, "latitud", "Latitud");
                  const lng = dato(a, "longitud", "Longitud");
                  const clase = esMantenimiento(estado)
                    ? "mantenimiento"
                    : estado.toLowerCase();

                  return (
                    <tr key={idAlarma(a)}>
                      <td>
                        <div className="alarmas-nombre">
                          {nombreAlarma(a)}
                        </div>
                        <span className="alarmas-codigo">
                          Código: {idAlarma(a)}
                        </span>
                      </td>

                      <td>
                        <span className="alarmas-barrio">
                          {barrioAlarma(a)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`alarma-estado alarma-estado-${clase}`}
                        >
                          <span className="alarma-estado-punto" />
                          {estado}
                        </span>
                      </td>

                      <td>
                        <span className="alarmas-radio">
                          {radioAlarma(a) ?? "—"} m
                        </span>
                      </td>

                      <td>
                        <span className="alarmas-coordenadas">
                          {lat != null && lng != null
                            ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
                            : "No disponibles"}
                        </span>
                      </td>

                      <td>
                        <div className="alarmas-acciones-tabla">
                          <button
                            type="button"
                            className="alarma-accion editar"
                            title="Modificar alarma"
                            aria-label={`Modificar ${nombreAlarma(a)}`}
                            onClick={() =>
                              setEditor({
                                modo: "editar",
                                alarma: a,
                              })
                            }
                          >
                            <i className="bi bi-pencil-square" />
                          </button>

                          <button
                            type="button"
                            className="alarma-accion eliminar"
                            title="Eliminar alarma"
                            aria-label={`Eliminar ${nombreAlarma(a)}`}
                            onClick={() => setEliminando(a)}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cargando && (
            <div className="alarmas-tabla-vacia">
              <span>Cargando alarmas...</span>
            </div>
          )}

          {!cargando && visibles.length === 0 && (
            <div className="alarmas-tabla-vacia">
              <i className="bi bi-inbox" />
              <h3>No se encontraron alarmas</h3>
              <p>Prueba con otra búsqueda o filtro.</p>
            </div>
          )}

          {!cargando && paginas > 1 && (
            <div className="alarmas-paginacion">
              <span>
                Página {paginaActual} de {paginas}
              </span>

              <div>
                <button
                  type="button"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina(paginaActual - 1)}
                >
                  <i className="bi bi-chevron-left" />
                </button>

                <button
                  type="button"
                  disabled={paginaActual === paginas}
                  onClick={() => setPagina(paginaActual + 1)}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </section>
      </section>

      {editor && (
        <RegistrarAlarmaMapa
          key={
            editor.modo === "editar"
              ? `editar-${idAlarma(editor.alarma)}`
              : "crear"
          }
          alarmas={alarmas}
          alarmaEditar={
            editor.modo === "editar"
              ? editor.alarma
              : null
          }
          onClose={() => setEditor(null)}
          onGuardada={guardada}
        />
      )}

      {eliminando && (
        <div className="alarma-confirmacion-fondo">
          <section
            className="alarma-confirmacion"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-alarma"
          >
            <div className="alarma-confirmacion-icono">
              <i className="bi bi-trash3" />
            </div>

            <h3 id="titulo-eliminar-alarma">
              ¿Eliminar alarma?
            </h3>

            <p>
              Se eliminará{" "}
              <strong>{nombreAlarma(eliminando)}</strong>.
              Esta acción no se puede deshacer.
            </p>

            <div className="alarma-confirmacion-botones">
              <button
                type="button"
                className="alarma-btn alarma-btn-secundario"
                disabled={procesando}
                onClick={() => setEliminando(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="alarma-btn alarma-btn-peligro"
                disabled={procesando}
                onClick={confirmarEliminar}
              >
                <i className="bi bi-trash3" />
                {procesando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
