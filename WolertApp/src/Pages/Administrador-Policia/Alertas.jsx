
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import { listarAlertasAdmin } from "../../Services/AlertasAdminService";
import { formatearFecha } from "../../Utils/centroOperacionesAdmin";
import "../../css/Policia/administrador-policia/css/alertas.css";

const POR_PAGINA = 10;

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const mostrar = (valor) =>
  String(valor ?? "").trim() || "—";

const textoBonito = (valor) =>
  mostrar(valor).replaceAll("_", " ");

function iniciales(nombre) {
  const palabras = String(nombre ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!palabras.length) return "?";

  return (palabras.length > 1
    ? palabras[0][0] + palabras[1][0]
    : palabras[0].slice(0, 2)
  ).toUpperCase();
}

function clasePrioridad(valor) {
  switch (normalizar(valor)) {
    case "ALTA":
      return "alta";
    case "MEDIA":
      return "media";
    case "BAJA":
      return "baja";
    default:
      return "neutra";
  }
}

function claseEstado(valor) {
  switch (normalizar(valor)) {
    case "PENDIENTE":
      return "pendiente";
    case "UNIDAD_ASIGNADA":
    case "ASIGNADA":
      return "asignada";
    case "EN_ATENCION":
      return "atencion";
    case "RESUELTA":
    case "FINALIZADA":
      return "resuelta";
    case "CANCELADA":
      return "cancelada";
    default:
      return "neutro";
  }
}

function Prioridad({ valor }) {
  return (
    <span className={`alertas-prioridad ${clasePrioridad(valor)}`}>
      <span className="alertas-prioridad-punto" />
      {textoBonito(valor)}
    </span>
  );
}

function Estado({ valor }) {
  return (
    <span className={`alertas-estado ${claseEstado(valor)}`}>
      {textoBonito(valor)}
    </span>
  );
}

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODAS");
  const [pagina, setPagina] = useState(1);
  const [seleccionada, setSeleccionada] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    listarAlertasAdmin(controlador.signal)
      .then((datos) => {
        if (controlador.signal.aborted) return;

        if (!Array.isArray(datos)) {
          throw new Error(
            "La API no devolvió una lista de alertas."
          );
        }

        setAlertas(datos);
        setError("");
      })
      .catch((err) => {
        if (controlador.signal.aborted) return;

        setError(
          err.message ||
          "No se pudieron cargar las alertas."
        );
        setAlertas([]);
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [recarga]);

  const tipos = useMemo(
    () =>
      [...new Set(
        alertas.map((a) => normalizar(a.tipo)).filter(Boolean)
      )].sort(),
    [alertas]
  );

  const conteosTipo = useMemo(() => {
    const conteos = {};

    for (const alerta of alertas) {
      const nombre = normalizar(alerta.tipo);
      conteos[nombre] = (conteos[nombre] || 0) + 1;
    }

    return conteos;
  }, [alertas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return alertas.filter((a) => {
      const coincideTexto = [
        a.idAlerta,
        a.reportadoPor,
        a.barrioNombre,
        a.tipo,
        a.descripcion,
      ].some((valor) =>
        String(valor ?? "").toLowerCase().includes(texto)
      );

      const coincideTipo =
        tipo === "TODAS" || normalizar(a.tipo) === tipo;

      return coincideTexto && coincideTipo;
    });
  }, [alertas, busqueda, tipo]);

  const kpis = useMemo(
    () => ({
      total: alertas.length,
      pendientes: alertas.filter(
        (a) => normalizar(a.estado) === "PENDIENTE"
      ).length,
      enAtencion: alertas.filter(
        (a) => normalizar(a.estado) === "EN_ATENCION"
      ).length,
      resueltas: alertas.filter(
        (a) => normalizar(a.estado) === "RESUELTA"
      ).length,
    }),
    [alertas]
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA);

  function cambiarTipo(valor) {
    setTipo(valor);
    setPagina(1);
  }

  

  return (
    <>
      <Topbar placeholder="Consultar alertas..." />

      <div className="alertas-admin-vista">
        <div className="alertas-encabezado mb-4">
          <div>
            <h1 className="page-title-dash fw-bold m-0">
              Alertas
            </h1>
            <p className="info-sub-dash m-0">
              Seguimiento de las alertas reportadas por
              los ciudadanos.
            </p>
          </div>

        </div>

        {error && (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        <Kpis
          grupo="alertas"
          valores={error ? {} : kpis}
          cargando={cargando}
        />

        <section className="alertas-tabla-panel">
          <div className="alertas-filtros">
          <div className="alertas-buscador">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por ciudadano, barrio, tipo o número..."
              aria-label="Buscar alertas"
            />

          </div>

          <div className="alertas-chips">
            <button
              type="button"
              className={`alertas-chip ${
                tipo === "TODAS" ? "activo" : ""
              }`}
              onClick={() => cambiarTipo("TODAS")}
            >
              Todas
              <span>{alertas.length}</span>
            </button>

            {tipos.map((nombre) => (
              <button
                type="button"
                key={nombre}
                className={`alertas-chip ${
                  tipo === nombre ? "activo" : ""
                }`}
                onClick={() => cambiarTipo(nombre)}
              >
                {textoBonito(nombre)}
                <span>{conteosTipo[nombre] || 0}</span>
              </button>
            ))}
          </div>
          </div>

          <div className="table-responsive alertas-tabla-scroll">
            <table className="tabla-alertas-dash">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Reportado por</th>
                  <th>Tipo de alerta</th>
                  <th>Prioridad</th>
                  <th>Barrio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="alertas-col-acciones">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {!cargando &&
                  visibles.map((alerta) => (
                    <tr key={alerta.idAlerta}>
                      <td>
                        <span className="alertas-numero">
                          #{alerta.idAlerta}
                        </span>
                      </td>

                      <td>
                        <div className="alertas-ciudadano">
                          <span className="alertas-avatar">
                            {iniciales(alerta.reportadoPor)}
                          </span>
                          <div className="alertas-ciudadano-datos">
                            <strong>
                              {mostrar(alerta.reportadoPor)}
                            </strong>
                            <small>Ciudadano</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="alertas-tipo">
                          <i
                            className="bi bi-exclamation-circle"
                            aria-hidden="true"
                          />
                          {textoBonito(alerta.tipo)}
                        </span>
                      </td>

                      <td>
                        <Prioridad valor={alerta.prioridad} />
                      </td>

                      <td>
                        <div className="alertas-barrio">
                          <i
                            className="bi bi-geo-alt"
                            aria-hidden="true"
                          />
                          <span>
                            {mostrar(alerta.barrioNombre)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <Estado valor={alerta.estado} />
                      </td>

                      <td>
                        <span className="alertas-fecha">
                          {alerta.fecha
                            ? formatearFecha(alerta.fecha)
                            : "—"}
                        </span>
                      </td>

                      <td className="alertas-col-acciones ver-detalles-cell">
                        <button
                          type="button"
                          className="alertas-btn-ver btn-ver-detalles"
                          onClick={() => setSeleccionada(alerta)}
                          aria-label={`Ver alerta ${alerta.idAlerta}`}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye-fill" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {cargando && (
            <div className="alertas-tabla-vacia" role="status">
              <i className="bi bi-arrow-repeat alertas-girando" />
              <strong>Cargando alertas...</strong>
              <span>Consultando los registros de WOLERTAPP.</span>
            </div>
          )}

          {!cargando && !error && visibles.length === 0 && (
            <div className="alertas-tabla-vacia">
              <i className="bi bi-inbox" />
              <strong>No se encontraron alertas</strong>
              <span>
                Prueba con otro término o selecciona otro tipo.
              </span>
            </div>
          )}

          {!cargando && filtradas.length > 0 && (
            <div className="alertas-paginacion">
              <span className="alertas-paginacion-info">
                Mostrando {inicio + 1}–
                {Math.min(inicio + POR_PAGINA, filtradas.length)}
                {" "}de {filtradas.length} alertas
              </span>

              <div className="alertas-paginacion-controles">
                <button
                  type="button"
                  disabled={paginaActual <= 1}
                  onClick={() =>
                    setPagina((p) => Math.max(1, p - 1))
                  }
                >
                  <i className="bi bi-chevron-left" />
                  Anterior
                </button>

                <span className="alertas-pagina-actual">
                  {paginaActual} / {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() =>
                    setPagina((p) =>
                      Math.min(totalPaginas, p + 1)
                    )
                  }
                >
                  Siguiente
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {seleccionada && (
        <div
          className="modal d-block alertas-modal-fondo"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de alerta"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSeleccionada(null);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-alerta-dash">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">
                    Detalle de alerta #{seleccionada.idAlerta}
                  </h5>
                  <p className="modal-subtitulo-dash">
                    Información del reporte ciudadano
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSeleccionada(null)}
                />
              </div>

              <div className="modal-body">
                <div className="detalle-principal-dash">
                  <div>
                    <small>TIPO DE ALERTA</small>
                    <span className="alertas-tipo">
                      {textoBonito(seleccionada.tipo)}
                    </span>
                  </div>

                  <div>
                    <small>PRIORIDAD</small>
                    <Prioridad valor={seleccionada.prioridad} />
                  </div>

                  <div>
                    <small>ESTADO</small>
                    <Estado valor={seleccionada.estado} />
                  </div>
                </div>

                <div className="detalle-grid-dash">
                  <div className="detalle-item-dash">
                    <i className="bi bi-person" />
                    <div>
                      <small>Ciudadano</small>
                      <strong>
                        {mostrar(seleccionada.reportadoPor)}
                      </strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-geo-alt" />
                    <div>
                      <small>Barrio</small>
                      <strong>
                        {mostrar(seleccionada.barrioNombre)}
                      </strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-clock" />
                    <div>
                      <small>Fecha</small>
                      <strong>
                        {seleccionada.fecha
                          ? formatearFecha(seleccionada.fecha)
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="detalle-item-dash">
                    <i className="bi bi-geo" />
                    <div>
                      <small>Coordenadas</small>
                      <strong>
                        {seleccionada.latitud ?? "—"},{" "}
                        {seleccionada.longitud ?? "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="detalle-descripcion-dash">
                  <small>DESCRIPCIÓN</small>
                  <p>
                    {seleccionada.descripcion ||
                      "Sin descripción"}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cerrar-detalle-dash"
                  onClick={() => setSeleccionada(null)}
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

export default Alertas;
