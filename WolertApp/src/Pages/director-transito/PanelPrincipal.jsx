import { Link } from "react-router-dom";
import MapaOperaciones from "../../Components/transito/director-transito/MapaOperaciones";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import "../../css/transito/director-transito/panel-principal.css";
import {
  listarAgentesDirector,
  listarAtencionesDirector,
  listarAlertasDirector,
  listarUnidadesDirector,
  fechaCaso,
  fechaTransito,
  fechaEsHoy,
  estadoFinalizado,
  estadoActivoAgente,
  estadoCaso,
  tipoCaso,
  badgeEstadoCaso,
  normalizar,
  esAccidente,
  idAlerta,
} from "../../Services/directorTransitoService";

function claseTipo(caso) {
  const tipo = String(tipoCaso(caso) ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/accidente|siniestro|choque|colision/.test(tipo)) return "tipo-rojo";
  if (/congestion|trafico|tranc[oó]n/.test(tipo)) return "tipo-amarillo";
  if (/semaforo|senal/.test(tipo)) return "tipo-azul";
  if (/infraccion|estacionamiento/.test(tipo)) return "tipo-morado";
  if (/obstruccion|bloqueo|via cerrada/.test(tipo)) return "tipo-naranja";
  if (/vehiculo|averia/.test(tipo)) return "tipo-verde";
  const colores = ["tipo-azul", "tipo-morado", "tipo-verde", "tipo-naranja", "tipo-amarillo"];
  const indice = [...tipo].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return colores[indice % colores.length];
}

export default function PanelPrincipal() {
  const [agentes, setAgentes] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [, setUnidades] = useState([]);
  const [alertasDisponibles, setAlertasDisponibles] =
    useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("TODAS");
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const [rAgentes, rAtenciones, rAlertas, rUnidades] =
        await Promise.allSettled([
          listarAgentesDirector(),
          listarAtencionesDirector(),
          listarAlertasDirector(),
          listarUnidadesDirector(),
        ]);

      if (!activo) return;

      const errores = [];

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      } else {
        errores.push("No se pudieron cargar los agentes.");
      }

      if (rAtenciones.status === "fulfilled") {
        setAtenciones(rAtenciones.value);
      } else {
        errores.push("No se pudieron cargar las atenciones.");
      }

      if (rAlertas.status === "fulfilled") {
        setAlertas(rAlertas.value);
        setAlertasDisponibles(true);
      } else {
        errores.push(
          "No se pudieron cargar las alertas. Verifica su endpoint."
        );
      }

      if (rUnidades.status === "fulfilled") {
        setUnidades(rUnidades.value);
      }

      setError(errores.join(" "));
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const disponibles = agentes.filter(
    (agente) =>
      estadoActivoAgente(
        agente.estadoAgente ?? agente.estado
      )
  ).length;

  const activos = atenciones.filter(
    (a) => !estadoFinalizado(a.estadoFinal)
  ).length;

  const cerradosHoy = atenciones.filter(
    (a) =>
      estadoFinalizado(a.estadoFinal) &&
      fechaEsHoy(a.fechaAtencion)
  ).length;

  const ultimos = useMemo(() => {
    const origen = alertasDisponibles ? alertas : atenciones;

    return [...origen].sort(
      (a, b) =>
        new Date(fechaCaso(b) || 0) -
        new Date(fechaCaso(a) || 0)
    );
  }, [alertas, atenciones, alertasDisponibles]);

  const tipos = useMemo(() => {
    return [...new Set(
      ultimos.map((caso) => normalizar(tipoCaso(caso)))
    )].filter((tipo) => tipo && tipo !== "SIN TIPO");
  }, [ultimos]);

  const ultimosFiltrados =
    tab === "TODAS"
      ? ultimos
      : ultimos.filter(
          (caso) => normalizar(tipoCaso(caso)) === tab
        );



 
const accidentesPorComuna = useMemo(() => {
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const agrupados = new Map();

  for (const alerta of alertas) {
    const fecha = new Date(fechaCaso(alerta) || 0);

    if (
      !esAccidente(alerta) ||
      fecha < hace30Dias
    ) {
      continue;
    }

    const comuna =
      alerta.nombreComuna ||
      alerta.comunaNombre ||
      alerta.comuna?.nombre ||
      "Sin comuna";

    agrupados.set(
      comuna,
      (agrupados.get(comuna) || 0) + 1
    );
  }

  return [...agrupados.entries()]
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}, [alertas]);


  const maxAccidentes = Math.max(
    1,
    ...accidentesPorComuna.map((c) => c.cantidad)
  );

  const fechaHoy = new Date()
    .toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <Layout
      titulo="Panel Director de Tránsito"
      activo="panel"
      claseTopbar="mb-4"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="director-panel">
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check me-2" />
          PANEL DE TRÁNSITO · {fechaHoy}
        </div>

        <h1 className="hero-title-dash">
          ¡Bienvenido,
          <br />
          director de tránsito!
        </h1>

        <p className="hero-text-dash">
          Supervisa los casos, las atenciones y el personal
          de tránsito desde un solo lugar.
        </p>

        <a
          href="#casosTransito"
          className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash"
        >
          <span className="dot-danger-dash" />
          {" "}Ver casos de tránsito
        </a>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando panel de tránsito...
        </div>
      )}

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          variante="panel"
          color="red"
          valor={activos}
          label="Atenciones activas"
          icono="bi-geo-alt-fill"
        />
        <KpiCard
          variante="panel"
          color="blue"
          valor="—"
          label="Tiempo de respuesta"
          icono="bi-stopwatch"
        />
        <KpiCard
          variante="panel"
          color="green"
          valor={cerradosHoy}
          label="Atenciones cerradas hoy"
          icono="bi-check2-circle"
        />
        <KpiCard
          variante="panel"
          color="amber"
          valor={`${disponibles}/${agentes.length}`}
          label="Agentes disponibles"
          icono="bi-shield-check"
        />
      </div>

      <section id="casosTransito">
        <div className="sec-head-pd">
          <h2>Casos de tránsito</h2>
          <span className="contador-director">
            {ultimos.length} registros
          </span>
        </div>

        <div className="panel-pd mb-4">
          <div className="table-responsive">
            <table className="tabla-pd" id="tablaCasos">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Ubicación / reportante</th>
                  <th>Fecha de reporte</th>
                  <th>Estado</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.slice(0, 10).map((caso, indice) => (
                  <tr
                    key={idAlerta(caso) ?? indice}
                    
                  >
                    <td>
                      <span className={`badge-dash tipo-director ${claseTipo(caso)}`}>
                        {tipoCaso(caso)}
                      </span>
                    </td>
                    <td>
                      <div className="info-title-dash">
                        {caso.nombreBarrio ||
                          caso.barrioNombre ||
                          caso.direccion ||
                          "Ubicación no disponible"}
                      </div>
                      <div className="info-sub-dash">
                        Reportado por{" "}
                        {caso.reportadoPor || caso.nombreReportante ||
                          caso.nombreUsuario ||
                          "No registrado"}
                      </div>
                    </td>
                    <td>
                      <span className="wait-dash wait-warn-dash">
                        {fechaTransito(fechaCaso(caso))}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-dash ${badgeEstadoCaso(estadoCaso(caso))}`}>
                        {estadoCaso(caso)}
                      </span>
                    </td>
                    <td className="text-end">
                      <button type="button" className="link-btn-dash border-0 bg-transparent" onClick={() => setDetalle(caso)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ultimos.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">
              {alertasDisponibles
                ? "No hay casos registrados."
                : "No hay casos disponibles para mostrar."}
            </p>
          )}
          <div className="paginacion-pd">
            Mostrando {Math.min(10, ultimos.length)} de {ultimos.length} registros
          </div>
        </div>
      </section>

      <div className="sec-head-pd">
        <h2 className="titulos">
          Mapa de operaciones
        </h2>
        <Link to="/transito/director/mapa" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-arrows-fullscreen me-2" /> Ver mapa completo
        </Link>
      </div>

      <div className="panel-pd mb-4">
        <MapaOperaciones compacto />
      </div>

      <div className="sec-head-pd">
        <h2 className="titulos">
          Accidentes por comuna
        </h2>
        <span className="contador-director">
          Últimos 30 días
        </span>
      </div>

      <div className="comunas-pd mb-4">
        {accidentesPorComuna.map((comuna) => (
          <div
            key={comuna.nombre}
            className="comuna-row-pd"
          >
            <span className="nombre-pd">
              {comuna.nombre}
            </span>
            <div className="pista-pd">
              <span
                style={{
                  width: `${
                    (comuna.cantidad / maxAccidentes) * 100
                  }%`,
                }}
              />
            </div>
            <span className="valor-pd">
              {comuna.cantidad}
            </span>
          </div>
        ))}

        {accidentesPorComuna.length === 0 && (
          <p className="text-muted small mb-0">
            No hay datos de accidentes por comuna
            disponibles para este periodo.
          </p>
        )}
      </div>

      <div className="sec-head-pd">
        <h2 className="titulos">
          Últimos casos de tránsito
        </h2>
        <span className="contador-director">
          {ultimos.length} registros
        </span>
      </div>

      <div className="tabs-pd">
        <button
          type="button"
          className={`tab-pd ${
            tab === "TODAS" ? "active-pd" : ""
          }`}
          onClick={() => setTab("TODAS")}
        >
          Todas ({ultimos.length})
        </button>

        {tipos.map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={`tab-pd ${
              tab === tipo ? "active-pd" : ""
            }`}
            onClick={() => setTab(tipo)}
          >
            {tipo} (
            {ultimos.filter(
              (c) => normalizar(tipoCaso(c)) === tipo
            ).length}
            )
          </button>
        ))}
      </div>

      <div className="panel-pd">
        <div className="table-responsive">
          <table className="tabla-pd">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ultimosFiltrados.slice(0, 10).map(
                (caso, indice) => (
                  <tr
                    key={
                      idAlerta(caso) ??
                      caso.idAtencionTransito ??
                      indice
                    }
                  >
                    <td>
                      <div className="info-title-dash">
                        {caso.reportadoPor || caso.nombreReportante ||
                          caso.nombreUsuario ||
                          "No registrado"}
                      </div>
                      <div className="info-sub-dash">
                        {fechaTransito(fechaCaso(caso))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-dash tipo-director ${claseTipo(caso)}`}>
                        {tipoCaso(caso)}
                      </span>
                    </td>
                    <td>
                      {caso.nombreBarrio ||
                        caso.barrioNombre ||
                        "No disponible"}
                    </td>
                    <td>
                      <span
                        className={`badge-dash ${badgeEstadoCaso(
                          estadoCaso(caso)
                        )}`}
                      >
                        {estadoCaso(caso)}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="link-btn-dash border-0 bg-transparent"
                        onClick={() => setDetalle(caso)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {ultimosFiltrados.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay casos para mostrar.
          </p>
        )}

        <div className="paginacion-pd">
          <span>
            Mostrando {Math.min(10, ultimosFiltrados.length)}
            {" "}de {ultimosFiltrados.length} registros
          </span>
        </div>
      </div>

      {detalle && (
        <div
          className="modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloDetallePanel"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header">
                <h5
                  id="tituloDetallePanel"
                  className="modal-title"
                >
                  Detalle del caso
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setDetalle(null)}
                />
              </div>
              <div className="modal-body">
                <p><b>Tipo:</b> {tipoCaso(detalle)}</p>
                <p><b>Estado:</b> {estadoCaso(detalle)}</p>
                <p>
                  <b>Fecha:</b>{" "}
                  {fechaTransito(fechaCaso(detalle))}
                </p>
                <p>
                  <b>Descripción:</b>{" "}
                  {detalle.descripcion ?? "No disponible"}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
