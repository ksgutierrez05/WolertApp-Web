import { useEffect, useMemo, useRef, useState } from "react";

import Topbar from "../../Components/Administrador-policia/Topbar";

import {
  listarTiposAlerta,
} from "../../Services/AlertasAdminService";

import "../../css/Policia/administrador-policia/css/tipo-alertas.css";

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const TARJETAS = [
  {
    clave: "total",
    titulo: "Total de tipos",
    icono: "bi-grid",
    tono: "azul",
  },
  {
    clave: "alta",
    titulo: "Prioridad alta",
    icono: "bi-exclamation-triangle",
    tono: "rojo",
  },
  {
    clave: "media",
    titulo: "Prioridad media",
    icono: "bi-exclamation-circle",
    tono: "ambar",
  },
  {
    clave: "baja",
    titulo: "Prioridad baja",
    icono: "bi-check-circle",
    tono: "verde",
  },
];

const OPCIONES_PRIORIDAD = [
  { valor: "", etiqueta: "Todas las prioridades" },
  { valor: "ALTA", etiqueta: "Prioridad alta" },
  { valor: "MEDIA", etiqueta: "Prioridad media" },
  { valor: "BAJA", etiqueta: "Prioridad baja" },
];

function iconoTipo(nombre) {
  const t = String(nombre ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (/ACCIDENTE|TRANSITO/.test(t)) return ['bi-car-front-fill', 'ambar'];
  if (/ROBO|HURTO|ASALTO|HOMICIDIO|VIOLENCIA|RINA/.test(t)) return ['bi-shield-exclamation', 'rojo'];
  if (/MEDIC|SALUD/.test(t)) return ['bi-heart-pulse-fill', 'verde'];
  if (/INCENDIO/.test(t)) return ['bi-fire', 'naranja'];
  if (/SOSPECHOS/.test(t)) return ['bi-person-bounding-box', 'morado'];
  if (/TERREMOTO|SISMO/.test(t)) return ['bi-activity', 'morado'];
  if (/INUNDACION/.test(t)) return ['bi-water', 'azul'];
  if (/GENERAL/.test(t)) return ['bi-bell-fill', 'azul'];
  return ['bi-question-circle', 'gris'];
}

function TiposAlertas() {
  const [tipos, setTipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Desplegable de prioridad
  const [menuAbierto, setMenuAbierto] = useState(false);
  const filtroRef = useRef(null);

  useEffect(() => {
    if (!menuAbierto) return;

    const cerrarAlClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };

    const cerrarConEscape = (e) => {
      if (e.key === "Escape") setMenuAbierto(false);
    };

    document.addEventListener("mousedown", cerrarAlClickFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarAlClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto]);

  // ========================================
  // CONSULTAR TIPOS DE ALERTA
  // ========================================

  useEffect(() => {
    const controlador = new AbortController();

    listarTiposAlerta(controlador.signal)
      .then((datos) => {
        if (controlador.signal.aborted) return;

        if (!Array.isArray(datos)) {
          throw new Error(
            "La API no devolvió una lista de tipos de alerta."
          );
        }

        setTipos(datos);
        setError("");
      })
      .catch((err) => {
        if (controlador.signal.aborted) return;

        setError(
          err.message ||
          "No se pudieron cargar los tipos de alerta."
        );

        setTipos([]);
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [recarga]);

  // ========================================
  // FILTRAR TIPOS
  // ========================================

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tipos.filter((tipo) => {
      const coincideTexto = [
        tipo.idTipoAlerta,
        tipo.nombre,
        tipo.centralResponsable,
      ].some((valor) =>
        String(valor ?? "")
          .toLowerCase()
          .includes(texto)
      );

      const coincidePrioridad =
        !filtro ||
        normalizar(tipo.prioridad) === filtro;

      return coincideTexto && coincidePrioridad;
    });
  }, [tipos, busqueda, filtro]);

  // ========================================
  // INDICADORES
  // ========================================

  const kpis = useMemo(
    () => ({
      total: tipos.length,

      alta: tipos.filter(
        (tipo) => normalizar(tipo.prioridad) === "ALTA"
      ).length,

      media: tipos.filter(
        (tipo) => normalizar(tipo.prioridad) === "MEDIA"
      ).length,

      baja: tipos.filter(
        (tipo) => normalizar(tipo.prioridad) === "BAJA"
      ).length,
    }),
    [tipos]
  );


  // ========================================
  // ESTILO DE PRIORIDADES
  // ========================================

  function clasePrioridad(prioridad) {
    switch (normalizar(prioridad)) {
      case "ALTA":
        return "prioridad-alta";

      case "MEDIA":
        return "prioridad-media";

      case "BAJA":
        return "prioridad-baja";

      default:
        return "prioridad-desconocida";
    }
  }

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div className="tipos-alertas-page">
      <Topbar placeholder="Buscar tipo de alerta..." />

      {/* ENCABEZADO */}

      <div className="header-vista-dash mb-4">
        <div>
          <h1>Tipos de Alertas</h1>

          <p>
            Consulta las categorías de alerta, su prioridad
            y central responsable.
          </p>
        </div>

       

      </div>

      {/* ERRORES REALES DE LA API */}

      {error && (
        <div
          className="alert alert-danger mb-4"
          role="alert"
        >
          <i
            className="bi bi-exclamation-circle me-2"
            aria-hidden="true"
          />

          {error}
        </div>
      )}

      {/* TARJETAS KPI */}

      <div className="row g-3 mb-4">
        {TARJETAS.map((tarjeta) => (
          <div
            className="col-6 col-xl-3"
            key={tarjeta.clave}
          >
            <article
              className={`kpi-card-policial tono-${tarjeta.tono}`}
            >
              <div className="kpi-card-icono">
                <i
                  className={`bi ${tarjeta.icono}`}
                  aria-hidden="true"
                />
              </div>

              <div className="kpi-card-info">
                <span className="kpi-card-titulo">
                  {tarjeta.titulo}
                </span>

                <strong className="kpi-card-valor">
                  {cargando
                    ? "..."
                    : kpis[tarjeta.clave]}
                </strong>
              </div>
            </article>
          </div>
        ))}
      </div>

      {/* FILTROS */}

      <div className="filtros-toolbar-dash mb-3">
        <div className="tipos-buscador">
          <i
            className="bi bi-search"
            aria-hidden="true"
          />

          <input
            type="search"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar por nombre, código o central..."
            aria-label="Buscar tipos de alerta"
          />
        </div>

        <div
          ref={filtroRef}
          className={`tipos-filtro-prioridad ${filtro ? "activo" : ""} ${menuAbierto ? "abierto" : ""}`}
        >
          <button
            type="button"
            className="filtro-boton"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuAbierto}
            aria-label="Filtrar por prioridad"
          >
            <i
              className={`bi ${filtro ? "bi-funnel-fill" : "bi-funnel"}`}
              aria-hidden="true"
            />

            {filtro && (
              <span
                className={`filtro-punto punto-${filtro.toLowerCase()}`}
                aria-hidden="true"
              />
            )}

            <span
              className={`filtro-texto ${filtro ? "" : "sin-valor"}`}
            >
              {filtro
                ? OPCIONES_PRIORIDAD.find((o) => o.valor === filtro)?.etiqueta
                : "Filtrar por prioridad"}
            </span>

            <i
              className="bi bi-chevron-down filtro-flecha"
              aria-hidden="true"
            />
          </button>

          {filtro && (
            <button
              type="button"
              className="filtro-limpiar"
              onClick={() => {
                setFiltro("");
                setMenuAbierto(false);
              }}
              aria-label="Quitar filtro de prioridad"
              title="Quitar filtro"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          )}

          {menuAbierto && (
            <ul
              className="filtro-menu"
              role="listbox"
              aria-label="Prioridades"
            >
              {OPCIONES_PRIORIDAD.map((opcion) => {
                const seleccionada = filtro === opcion.valor;
                const cantidad = opcion.valor
                  ? kpis[opcion.valor.toLowerCase()]
                  : kpis.total;

                return (
                  <li key={opcion.valor || "todas"} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={seleccionada}
                      className={`filtro-opcion ${seleccionada ? "seleccionada" : ""}`}
                      onClick={() => {
                        setFiltro(opcion.valor);
                        setMenuAbierto(false);
                      }}
                    >
                      <span
                        className={`filtro-punto ${
                          opcion.valor
                            ? `punto-${opcion.valor.toLowerCase()}`
                            : "punto-todas"
                        }`}
                        aria-hidden="true"
                      />

                      <span className="filtro-opcion-texto">
                        {opcion.etiqueta}
                      </span>

                      <span className="filtro-opcion-cantidad">
                        {cargando ? "" : cantidad}
                      </span>

                      <i
                        className={`bi bi-check-lg filtro-check ${seleccionada ? "visible" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* TABLA */}

      <div className="card-panel-dash mb-4 tipos-tabla-panel">
        <div className="table-responsive">
          <table className="tabla-dash tabla-tipos-alertas">
            <colgroup>
              <col style={{ width: "45%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>

            <thead>
              <tr>
                <th scope="col">
                  Tipo de alerta
                </th>

                <th scope="col">
                  Prioridad
                </th>

                <th scope="col">
                  Central responsable
                </th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                filtrados.map((tipo) => (
                  <tr key={tipo.idTipoAlerta}>
                    <td>
                      <div className="tipo-alerta-identidad">
                        <span className={`tipo-alerta-icono tipo-icono-${iconoTipo(tipo.nombre)[1]}`}>
                          <i className={`bi ${iconoTipo(tipo.nombre)[0]}`} aria-hidden="true" />
                        </span>
                        <div className="tipo-alerta-texto">
                          <div className="tipo-alerta-nombre">{String(tipo.nombre || "Sin nombre").replace(/_/g, " ")}</div>
                          <div className="tipo-alerta-codigo">Código: {tipo.idTipoAlerta}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`categoria-chip-dash ${clasePrioridad(
                          tipo.prioridad
                        )}`}
                      >
                        {normalizar(tipo.prioridad) || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="tipo-alerta-central">
                        {normalizar(tipo.centralResponsable) ||
                          "Sin asignar"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {cargando && (
          <div className="tabla-vacio-dash">
            <i
              className="bi bi-arrow-repeat fs-3 d-block mb-2"
              aria-hidden="true"
            />

            Cargando tipos de alerta...
          </div>
        )}

        {!cargando &&
          !error &&
          filtrados.length === 0 && (
            <div className="tabla-vacio-dash">
              <i
                className="bi bi-inbox fs-2 d-block mb-2"
                aria-hidden="true"
              />

              No se encontraron tipos de alerta.
            </div>
          )}
      </div>

      {/* CONTADOR DE RESULTADOS */}

      {!cargando && !error && (
        <p className="tipos-contador">
          Mostrando {filtrados.length} de {tipos.length} tipos
          de alerta
        </p>
      )}
    </div>
  );
}

export default TiposAlertas;