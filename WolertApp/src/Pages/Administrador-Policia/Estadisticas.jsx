
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";
import "../../css/Policia/administrador-policia/css/estadisticas.css";

const datosVacios = {
  alertas: [],
  atenciones: [],
  asignaciones: [],
  policias: [],
  unidades: [],
  alarmas: [],
};

const texto = (valor) =>
  String(valor ?? "").trim().toUpperCase();

function esHoy(fecha) {
  if (!fecha) return false;

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return false;

  return valor.toDateString() === new Date().toDateString();
}

function agrupar(registros, campo) {
  const conteos = new Map();

  registros.forEach((registro) => {
    const nombre =
      String(registro?.[campo] ?? "").trim() ||
      "SIN INFORMACIÓN";

    conteos.set(nombre, (conteos.get(nombre) || 0) + 1);
  });

  return [...conteos.entries()].sort((a, b) => b[1] - a[1]);
}

function Barra({ etiqueta, valor, total }) {
  const porcentaje =
    total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div className="estadistica-barra-fila">
      <span
        className="estadistica-barra-etiqueta"
        title={etiqueta}
      >
        {etiqueta.replaceAll("_", " ")}
      </span>

      <div
        className="estadistica-barra-track"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="estadistica-barra-fill"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <strong>{valor}</strong>
      <small>{porcentaje}%</small>
    </div>
  );
}

function PanelBarras({ titulo, icono, registros, campo }) {
  const agrupados = useMemo(
    () => agrupar(registros, campo),
    [registros, campo]
  );

  return (
    <section className="estadistica-panel">
      <div className="estadistica-panel-encabezado">
        <span className="estadistica-panel-icono">
          <i className={`bi ${icono}`} aria-hidden="true" />
        </span>
        <h2>{titulo}</h2>
      </div>

      {agrupados.length === 0 ? (
        <p className="estadistica-vacio">
          No hay información disponible.
        </p>
      ) : (
        <div className="estadistica-barras">
          {agrupados.map(([nombre, cantidad]) => (
            <Barra
              key={nombre}
              etiqueta={nombre}
              valor={cantidad}
              total={registros.length}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResumenEstados({ titulo, registros }) {
  const estados = useMemo(
    () => agrupar(registros, "estado"),
    [registros]
  );

  return (
    <div className="estadistica-estados-columna">
      <h3>
        {titulo} <span>({registros.length})</span>
      </h3>

      {estados.length === 0 ? (
        <p className="estadistica-vacio">
          No hay registros disponibles.
        </p>
      ) : (
        <div className="estadistica-estados-lista">
          {estados.map(([estado, cantidad]) => (
            <div
              className="estadistica-estado-fila"
              key={estado}
            >
              <span className="estadistica-estado-nombre">
                <span className="estadistica-estado-punto" />
                {estado.replaceAll("_", " ")}
              </span>

              <strong className="estadistica-estado-cantidad">
                {cantidad}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tarjetas = [
  {
    clave: "totalAlertas",
    etiqueta: "Total de alertas",
    icono: "bi-bell",
    tono: "verde",
  },
  {
    clave: "alertasResueltas",
    etiqueta: "Alertas resueltas",
    icono: "bi-check-circle-fill",
    tono: "verde",
  },
  {
    clave: "policiasActivos",
    etiqueta: "Policías activos",
    icono: "bi-people-fill",
    tono: "azul",
  },
  {
    clave: "unidadesOperativas",
    etiqueta: "Unidades operativas",
    icono: "bi-shield-check",
    tono: "ambar",
  },
];

function Estadisticas() {
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [actualizacion, setActualizacion] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const resultado = await obtenerDatosEstadisticas(
          controller.signal
        );

        if (controller.signal.aborted) return;

        const recibidos = resultado?.datos ?? {};

        setDatos({
          alertas: Array.isArray(recibidos.alertas)
            ? recibidos.alertas
            : [],
          atenciones: Array.isArray(recibidos.atenciones)
            ? recibidos.atenciones
            : [],
          asignaciones: Array.isArray(recibidos.asignaciones)
            ? recibidos.asignaciones
            : [],
          policias: Array.isArray(recibidos.policias)
            ? recibidos.policias
            : [],
          unidades: Array.isArray(recibidos.unidades)
            ? recibidos.unidades
            : [],
          alarmas: Array.isArray(recibidos.alarmas)
            ? recibidos.alarmas
            : [],
        });

        setErrores(
          Array.isArray(resultado?.errores)
            ? resultado.errores
            : []
        );

        setActualizacion(new Date());
      } catch (error) {
        if (
          controller.signal.aborted ||
          error.name === "AbortError"
        ) {
          return;
        }

        setErrores([
          error.message || "No se pudieron cargar las estadísticas.",
        ]);
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => controller.abort();
  }, [recarga]);

  function actualizarDatos() {
    if (cargando) return;

    setCargando(true);
    setErrores([]);
    setRecarga((valor) => valor + 1);
  }

  const valores = useMemo(
    () => ({
      totalAlertas: datos.alertas.length,

      alertasResueltas: datos.alertas.filter(
        (a) => texto(a.estado) === "RESUELTA"
      ).length,

      policiasActivos: datos.policias.filter(
        (p) => texto(p.estado) === "ACTIVO"
      ).length,

      unidadesOperativas: datos.unidades.filter(
        (u) => texto(u.estado) === "OPERATIVA"
      ).length,
    }),
    [datos]
  );

  const actividadHoy = useMemo(
    () => ({
      alertas: datos.alertas.filter((a) =>
        esHoy(a.fecha)
      ).length,

      atenciones: datos.atenciones.filter((a) =>
        esHoy(a.fechaAtencion ?? a.fecha)
      ).length,

      asignaciones: datos.asignaciones.filter((a) =>
        esHoy(a.fecha)
      ).length,
    }),
    [datos]
  );

  return (
    <>
      <Topbar placeholder="Consultar estadísticas..." />

      <main className="main-dash estadisticas-page">
        <div className="estadisticas-contenido">

          {/* ENCABEZADO */}

          <header className="estadisticas-encabezado">
            <div>
              <h1>Estadísticas</h1>
              <p>
                Indicadores operacionales del sistema policial.
              </p>
            </div>

            <button
              type="button"
              className="btn-cv-verde"
              disabled={cargando}
              onClick={actualizarDatos}
            >
              <i
                className="bi bi-arrow-clockwise"
                aria-hidden="true"
              />
              {cargando
                ? "Actualizando..."
                : "Actualizar datos"}
            </button>
          </header>

          {/* INDICADORES */}

          <section
            className="estadisticas-kpis"
            aria-label="Indicadores generales"
          >
            {tarjetas.map((tarjeta) => (
              <article
                className={`kpi-card-policial tono-${tarjeta.tono}`}
                key={tarjeta.clave}
              >
                <div className="kpi-card-icono">
                  <i
                    className={`bi ${tarjeta.icono}`}
                    aria-hidden="true"
                  />
                </div>

                <div className="kpi-card-info">
                  <span className="kpi-card-titulo">
                    {tarjeta.etiqueta}
                  </span>

                  <strong className="kpi-card-valor">
                    {cargando
                      ? "..."
                      : valores[tarjeta.clave]}
                  </strong>
                </div>
              </article>
            ))}
          </section>

          {/* ERRORES */}

          {errores.length > 0 && (
            <div
              className="estadistica-alerta-error"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle" />

              <div>
                <strong>
                  Algunas consultas no pudieron completarse.
                </strong>

                {errores.map((error, indice) => (
                  <p key={indice}>{String(error)}</p>
                ))}
              </div>
            </div>
          )}

          {cargando ? (
            <p className="estadistica-vacio">
              Cargando estadísticas...
            </p>
          ) : (
            <>
              {/* GRÁFICAS */}

              <div className="estadisticas-graficas">
                <PanelBarras
                  titulo="Alertas por estado"
                  icono="bi-bell"
                  registros={datos.alertas}
                  campo="estado"
                />

                <PanelBarras
                  titulo="Policías por estado"
                  icono="bi-people"
                  registros={datos.policias}
                  campo="estado"
                />

                <PanelBarras
                  titulo="Atenciones por estado"
                  icono="bi-clipboard-check"
                  registros={datos.atenciones}
                  campo="estadoFinal"
                />

                <PanelBarras
                  titulo="Alertas por tipo"
                  icono="bi-exclamation-circle"
                  registros={datos.alertas}
                  campo="tipo"
                />
              </div>

              {/* ALARMAS Y UNIDADES */}

              <section className="estadistica-panel estadistica-panel-estados">
                <div className="estadistica-panel-encabezado">
                  <span className="estadistica-panel-icono">
                    <i
                      className="bi bi-activity"
                      aria-hidden="true"
                    />
                  </span>

                  <h2>Estado de alarmas y unidades</h2>
                </div>

                <div className="estadistica-estados-grid">
                  <ResumenEstados
                    titulo="Alarmas"
                    registros={datos.alarmas}
                  />

                  <ResumenEstados
                    titulo="Unidades"
                    registros={datos.unidades}
                  />
                </div>
              </section>

              {/* ACTIVIDAD DE HOY */}

              <section className="estadistica-panel">
                <div className="estadistica-panel-encabezado">
                  <span className="estadistica-panel-icono">
                    <i
                      className="bi bi-calendar-check"
                      aria-hidden="true"
                    />
                  </span>

                  <h2>Actividad de hoy</h2>
                </div>

                <div className="estadistica-resumen">
                  <div>
                    <strong>{actividadHoy.alertas}</strong>
                    <span>Alertas registradas hoy</span>
                  </div>

                  <div>
                    <strong>{actividadHoy.atenciones}</strong>
                    <span>Atenciones registradas hoy</span>
                  </div>

                  <div>
                    <strong>{actividadHoy.asignaciones}</strong>
                    <span>Asignaciones de hoy</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* FECHA DE ACTUALIZACIÓN */}

          <p className="estadistica-actualizacion">
            {actualizacion
              ? `Última actualización: ${actualizacion.toLocaleString(
                  "es-CO"
                )}`
              : "Sin actualización disponible"}
          </p>
        </div>
      </main>
    </>
  );
}

export default Estadisticas;
