import { useEffect, useMemo, useState } from "react";
import "../../css/admin/tipos.css";
import {
  crearTipoAlerta,
  editarTipoAlerta,
  eliminarTipoAlerta,
  listarTiposAlerta,
} from "../../Services/TipoAlertasAPI";
import {
  CrearTipoArma,
  EditarTipoArma,
  EliminarTipoArma,
  ListarTiposArma,
} from "../../Services/TiposArmaAPI";
import {
  CrearMedioTransporte,
  EditarMedioTransporte,
  EliminarMedioTransporte,
  ListarMediosTransporte,
} from "../../Services/MediosTransporteAPI";

const TABS = [
  {
    id: "alerta",
    label: "Tipos de alerta",
    short: "Alertas",
    singular: "tipo de alerta",
    icon: "bi-bell-fill",
    description: "Clasificaciones para reportes ciudadanos",
  },
  {
    id: "arma",
    label: "Tipos de arma",
    short: "Armas",
    singular: "tipo de arma",
    icon: "bi-shield-exclamation",
    description: "Categorías registradas de armas",
  },
  {
    id: "transporte",
    label: "Medios de transporte",
    short: "Transporte",
    singular: "medio de transporte",
    icon: "bi-truck-front-fill",
    description: "Medios asociados a los reportes",
  },
];

const FORMULARIO_VACIO = {
  nombre: "",
  prioridad: "",
  centralResponsable: "",
};

function nombreDe(item) {
  return (
    item?.nombre ??
    item?.descripcion ??
    item?.medio ??
    item?.Nombre ??
    item?.Descripcion ??
    "Sin nombre"
  );
}

function camposExtra(item, tab) {
  const llavesId = [
    "id",
    "Id",
    "idTipoAlerta",
    "IdTipoAlerta",
    "idTipoArma",
    "IdTipoArma",
    "idMedioTransporte",
    "IdMedioTransporte",
  ];
  const llavesNombre = ["nombre", "Nombre", "descripcion", "Descripcion", "medio", "Medio"];
  const excluir = new Set([...llavesId, ...llavesNombre]);

  if (tab === "alerta") {
    return [
      {
        etiqueta: "Prioridad",
        valor: item.prioridad ?? item.Prioridad ?? "Sin asignar",
      },
      {
        etiqueta: "Central",
        valor: item.centralResponsable ?? item.CentralResponsable ?? "Sin asignar",
      },
    ];
  }

  return Object.entries(item ?? {})
    .filter(([llave, valor]) => !excluir.has(llave) && valor != null && typeof valor !== "object")
    .map(([llave, valor]) => ({ etiqueta: llave, valor: String(valor) }));
}

function etiquetaCampoExtra(llave) {
  return llave
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, (letra) => letra.toUpperCase());
}

function idDe(item, tab) {
  if (tab === "alerta") {
    return item?.idTipoAlerta ?? item?.id ?? item?.IdTipoAlerta;
  }
  if (tab === "arma") {
    return item?.idTipoArma ?? item?.id ?? item?.IdTipoArma;
  }
  return item?.idMedioTransporte ?? item?.id ?? item?.IdMedioTransporte;
}

function detalleError(error) {
  const mensaje = error?.message?.trim();
  if (!mensaje) return "No se pudo guardar el registro del catálogo.";

  try {
    const json = JSON.parse(mensaje);
    if (json.errors) {
      return Object.values(json.errors).flat().join(" ");
    }
    return json.title || json.message || mensaje;
  } catch {
    return mensaje.replace(/^"|"$/g, "");
  }
}

export default function Tipos() {
  const [tab, setTab] = useState("alerta");
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const esAdmin = localStorage.getItem("rol") === "ADMIN";
  const seleccion = TABS.find((item) => item.id === tab);

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    setError("");

    const promesa =
      tab === "alerta"
        ? listarTiposAlerta(controlador.signal)
        : tab === "arma"
          ? ListarTiposArma(controlador.signal)
          : ListarMediosTransporte(controlador.signal);

    promesa
      .then((lista) => {
        if (controlador.signal.aborted) return;
        if (!Array.isArray(lista)) {
          throw new Error("La API no devolvió una lista válida.");
        }
        setDatos(lista);
      })
      .catch((err) => {
        if (!controlador.signal.aborted) {
          setError(err.message || "No se pudieron cargar los datos.");
          setDatos([]);
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [tab, recarga]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-CO");
    if (!texto) return datos;

    return datos.filter((item) =>
      Object.values(item ?? {}).some((valor) =>
        String(valor ?? "").toLocaleLowerCase("es-CO").includes(texto)
      )
    );
  }, [datos, busqueda]);

  function abrirCrear() {
    setTipoEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario("");
    setModalAbierto(true);
  }

  function abrirEditar(tipo) {
    setTipoEditando(tipo);
    setFormulario({
      nombre: nombreDe(tipo),
      prioridad: (tipo.prioridad ?? tipo.Prioridad ?? "").toUpperCase(),
      centralResponsable: (
        tipo.centralResponsable ?? tipo.CentralResponsable ?? ""
      ).toUpperCase(),
    });
    setErrorFormulario("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
    setErrorFormulario("");
  }

  async function guardarTipo(event) {
    event.preventDefault();
    setGuardando(true);
    setErrorFormulario("");

    const payload =
      tab === "alerta"
        ? {
            nombre: formulario.nombre.trim(),
            prioridad: formulario.prioridad,
            centralResponsable: formulario.centralResponsable || null,
          }
        : tab === "arma"
          ? { descripcion: formulario.nombre.trim() }
          : { medio: formulario.nombre.trim() };

    try {
      const operaciones = {
        alerta: [crearTipoAlerta, editarTipoAlerta],
        arma: [CrearTipoArma, EditarTipoArma],
        transporte: [CrearMedioTransporte, EditarMedioTransporte],
      };
      const [crear, editar] = operaciones[tab];
      if (tipoEditando) await editar(idDe(tipoEditando, tab), payload);
      else await crear(payload);

      setModalAbierto(false);
      setTipoEditando(null);
      setFormulario(FORMULARIO_VACIO);
      setRecarga((actual) => actual + 1);
    } catch (err) {
      setErrorFormulario(detalleError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function borrarTipo(tipo) {
    const id = idDe(tipo, tab);
    if (
      !window.confirm(
        `¿Eliminar "${nombreDe(tipo)}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setEliminandoId(id);
    setError("");
    try {
      const operaciones = {
        alerta: eliminarTipoAlerta,
        arma: EliminarTipoArma,
        transporte: EliminarMedioTransporte,
      };
      await operaciones[tab](id);
      setRecarga((actual) => actual + 1);
    } catch (err) {
      setError(detalleError(err));
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <main className="types-page">
      <header className="types-hero">
        <div>
          <span className="types-eyebrow">
            <i className="bi bi-collection-fill" /> CATÁLOGOS DEL SISTEMA
          </span>
          <h1>Tipos y categorías</h1>
          <p>
            Consulta y administra las clasificaciones de reportes y recursos
            del sistema.
          </p>
        </div>
        <div className="types-hero-count">
          <span>Registros en esta categoría</span>
          <strong>
            {cargando ? "—" : datos.length.toLocaleString("es-CO")}
          </strong>
          <small>{seleccion?.label}</small>
        </div>
      </header>

      <nav className="types-tabs" aria-label="Categorías de tipos">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`types-tab ${tab === item.id ? "is-active" : ""}`}
            onClick={() => {
              setTab(item.id);
              setBusqueda("");
              setError("");
            }}
            aria-pressed={tab === item.id}
          >
            <span className="types-tab__icon">
              <i className={`bi ${item.icon}`} />
            </span>
            <span className="types-tab__text">
              <b>{item.label}</b>
              <small>{item.description}</small>
            </span>
            <span className="types-tab__arrow">
              <i className="bi bi-chevron-right" />
            </span>
          </button>
        ))}
      </nav>

      <section className="types-content">
        <div className="types-toolbar">
          <div className="types-toolbar__title">
            <div className="types-section-icon">
              <i className={`bi ${seleccion?.icon}`} />
            </div>
            <div>
              <h2>{seleccion?.label}</h2>
              <p>{seleccion?.description}</p>
            </div>
          </div>

          <div className="types-toolbar__actions">
            {esAdmin && (
              <button
                className="types-create"
                type="button"
                onClick={abrirCrear}
              >
                <i className="bi bi-plus-lg" />
                <span>Agregar {seleccion?.singular || "registro"}</span>
              </button>
            )}
            <label className="types-search">
              <i className="bi bi-search" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre o código"
                aria-label="Buscar en la categoría actual"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </label>
            <button
              className="types-refresh"
              type="button"
              disabled={cargando}
              onClick={() => setRecarga((actual) => actual + 1)}
            >
              <i
                className={`bi bi-arrow-clockwise ${cargando ? "types-spin" : ""}`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="types-error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRecarga((actual) => actual + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="types-table-wrap">
          <table className="types-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Información</th>
                <th>Código de referencia</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {!cargando &&
                !error &&
                filtrados.map((item, index) => (
                  <tr
                    key={
                      idDe(item, tab) ?? `${nombreDe(item)}-${index}`
                    }
                  >
                    <td>
                      <div className="types-name">
                        <span className="types-row-icon">
                          <i className={`bi ${seleccion?.icon}`} />
                        </span>
                        <strong>{nombreDe(item)}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="types-details-list">
                        {camposExtra(item, tab).length > 0 ? (
                          camposExtra(item, tab).map(({ etiqueta, valor }) => (
                            <span key={etiqueta}>
                              <small>{etiquetaCampoExtra(etiqueta)}</small>
                              {etiqueta === "Prioridad" ? (
                                <b
                                  className={`types-priority types-priority--${String(valor).toLowerCase()}`}
                                >
                                  {valor}
                                </b>
                              ) : (
                                <b>{valor}</b>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="types-detail-empty">
                            {tab === "arma" ? "Tipo de arma" : "Medio de transporte"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="types-code">
                        {idDe(item, tab) ?? "—"}
                      </span>
                    </td>
                    {esAdmin && (
                      <td>
                        <div className="types-row-actions">
                          <button
                            type="button"
                            onClick={() => abrirEditar(item)}
                            aria-label={`Editar ${nombreDe(item)}`}
                            title="Editar tipo"
                          >
                            <i className="bi bi-pencil-square" />
                          </button>
                          <button
                            type="button"
                            className="is-danger"
                            disabled={eliminandoId === idDe(item, tab)}
                            onClick={() => borrarTipo(item)}
                            aria-label={`Eliminar ${nombreDe(item)}`}
                            title="Eliminar tipo"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {cargando && (
            <div className="types-state">
              <span className="types-loader" />
              <b>Cargando categoría</b>
              <small>Consultando los registros disponibles…</small>
            </div>
          )}
          {!cargando && !error && filtrados.length === 0 && (
            <div className="types-state">
              <span className="types-empty-icon">
                <i className={`bi ${busqueda ? "bi-search" : "bi-inbox"}`} />
              </span>
              <b>
                {busqueda
                  ? "No encontramos coincidencias"
                  : "Esta categoría aún no tiene registros"}
              </b>
              <small>
                {busqueda
                  ? "Prueba con otro nombre o código."
                  : "Cuando existan registros, aparecerán en esta tabla."}
              </small>
            </div>
          )}
        </div>

        <footer className="types-table-footer">
          <span>
            Mostrando <b>{filtrados.length.toLocaleString("es-CO")}</b> de{" "}
            <b>{datos.length.toLocaleString("es-CO")}</b> registros
          </span>
          <span>
            <i className="bi bi-database-check" /> Catálogo actualizado desde
            el sistema
          </span>
        </footer>
      </section>

      {modalAbierto && (
        <div
          className="types-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <section
            className="types-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="types-modal-title"
          >
            <header className="types-modal__header">
              <div>
                <span className="types-eyebrow">
                  <i className={`bi ${seleccion?.icon}`} /> CATÁLOGO DE {seleccion?.short?.toUpperCase()}
                </span>
                <h2 id="types-modal-title">
                  {tipoEditando ? "Editar" : "Agregar"} {seleccion?.singular || "registro"}
                </h2>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <form onSubmit={guardarTipo}>
              <label className="types-form-field">
                <span>
                  {tab === "alerta"
                    ? "Nombre del tipo de alerta"
                    : tab === "arma"
                      ? "Descripción del tipo de arma"
                      : "Nombre del medio de transporte"}
                </span>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      nombre: event.target.value,
                    }))
                  }
                  required
                  autoFocus
                  placeholder={
                    tab === "alerta"
                      ? "Ej. ACCIDENTE DE TRÁNSITO"
                      : tab === "arma"
                        ? "Ej. Arma traumática"
                        : "Ej. Motocicleta"
                  }
                />
                {tab === "alerta" && (
                  <small>Máximo 50 caracteres. Se guardará en mayúsculas.</small>
                )}
              </label>

              {tab === "alerta" && <label className="types-form-field">
                <span>Prioridad</span>
                <select
                  value={formulario.prioridad}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      prioridad: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled>
                    Selecciona una prioridad
                  </option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </label>}

              {tab === "alerta" && <label className="types-form-field">
                <span>Central responsable</span>
                <select
                  value={formulario.centralResponsable}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      centralResponsable: event.target.value,
                    }))
                  }
                >
                  <option value="">Sin asignar</option>
                  <option value="POLICIA">Policía</option>
                  <option value="TRANSITO">Tránsito</option>
                </select>
                <small>Este campo es opcional en el backend.</small>
              </label>}

              {errorFormulario && (
                <div className="types-form-error" role="alert">
                  <i className="bi bi-exclamation-circle-fill" />
                  {errorFormulario}
                </div>
              )}

              <footer className="types-modal__actions">
                <button
                  className="types-cancel"
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  className="types-submit"
                  type="submit"
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <i className="bi bi-arrow-repeat types-spin" /> Guardando…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2" />
                      {tipoEditando ? "Guardar cambios" : "Agregar registro"}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
