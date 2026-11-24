import "../../css/transito/director-transito/detalle-casos.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listarTiposAlertaCentral, normalizarCentral } from "../../Services/centralTransitoService";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarAtencionesDirector,
  listarAlertasDirector,
  listarAgentesDirector,
  listarUnidadesDirector,
  listarUsuariosTransito,
  idAtencion,
  idAlerta,
  nombreAgente,
  fechaCaso,
  fechaTransito,
  fechaEsHoy,
  estadoCaso,
  tipoCaso,
  estadoFinalizado,
  estadoActivoAgente,
  normalizar,
} from "../../Services/directorTransitoService";

const POR_PAGINA = 5;
const coloresPerfil = ["azul", "rojo", "ambar", "morado", "verde"];
const SIN_MAYUSCULAS = { textTransform: "none" };

function iniciales(nombre) {
  const partes = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  return partes.length ? (partes[0][0] + (partes[1]?.[0] || "")).toUpperCase() : "?";
}

function colorPerfil(caso) {
  const clave = String(caso.identificador ?? caso.reportante ?? "");
  const suma = [...clave].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return coloresPerfil[suma % coloresPerfil.length];
}

function claseTipoCaso(tipo) {
  const valor = normalizar(tipo);
  if (valor.includes("SEMAFORO") || valor.includes("SEMÁFORO")) return "casos-tipo-semaforo";
  if (valor.includes("ROBO") || valor.includes("HURTO") || valor.includes("ATRACO")) return "casos-tipo-robo";
  if (valor.includes("ACCIDENTE") || valor.includes("CHOQUE") || valor.includes("SINIESTRO")) return "casos-tipo-accidente";
  if (valor.includes("PENDIENTE")) return "casos-tipo-pendiente";
  if (valor.includes("EMERGENCIA") || valor.includes("CRITIC")) return "casos-tipo-emergencia";
  if (valor.includes("CONGESTION") || valor.includes("TRAFICO")) return "casos-tipo-congestion";
  return "casos-tipo-otro";
}

function claseEstadoCaso(estado) {
  const valor = normalizar(estado);
  if (valor.includes("PENDIENTE") || valor.includes("ESPERA") || valor.includes("RECIBIDA")) return "casos-estado-pendiente";
  if (valor.includes("CRITIC") || valor.includes("CANCELADA") || valor.includes("RECHAZADA")) return "casos-estado-critico";
  if (valor.includes("RESUEL") || valor.includes("FINALIZ") || valor.includes("CERRAD") || valor.includes("ATENDID")) return "casos-estado-resuelto";
  if (valor.includes("CAMINO") || valor.includes("ASIGNADA")) return "casos-estado-camino";
  if (valor.includes("PROCESO") || valor.includes("ATENCION")) return "casos-estado-atencion";
  return "casos-estado-otro";
}

function textoVisible(valor) {
  if (normalizarCentral(valor).replace(/_/g, " ") === "SEMAFORO DANADO") {
    return "Semáforo dañado";
  }
  const texto = String(valor ?? "").replace(/_/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("es");
  return texto.replace(/(^|\s)(\p{L})/gu, (coincidencia, espacio, letra) => espacio + letra.toLocaleUpperCase("es"));
}

function claseFiltroEstado(valor) {
  return `casos-filtro-${claseEstadoCaso(valor).replace("casos-estado-", "")}`;
}

function prepararCasos(alertas, atenciones) {
  if (alertas.length > 0) {
    return alertas.map((alerta) => {
      const atencion = atenciones.find((a) => String(a.idAlerta) === String(idAlerta(alerta)));
      return {
        ...alerta,
        atencion,
        identificador: idAlerta(alerta),
        tipoVisual: tipoCaso(alerta),
        estadoVisual: estadoCaso(atencion ?? alerta),
        fechaVisual: fechaCaso(alerta) ?? fechaCaso(atencion),
        reportante:
          alerta.reportadoPor || alerta.nombreReportante ||
          alerta.nombreUsuario ||
          alerta.reportanteNombre ||
          alerta.usuario?.nombre ||
          "No registrado",
        barrio: alerta.nombreBarrio || alerta.barrioNombre || alerta.barrio?.nombre || "No registrado",
      };
    });
  }
  return atenciones.map((atencion) => ({
    ...atencion,
    atencion,
    identificador: idAtencion(atencion),
    tipoVisual: tipoCaso(atencion),
    estadoVisual: estadoCaso(atencion),
    fechaVisual: fechaCaso(atencion),
    reportante: atencion.reportadoPor || atencion.nombreReportante || "No disponible",
    barrio: atencion.nombreBarrio || atencion.barrioNombre || "No disponible",
  }));
}

function AvisosCasos({ avisos, cerrar }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 99999,
        display: "grid",
        gap: 10,
        width: "min(370px, calc(100vw - 32px))",
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      {avisos.map((aviso) => {
        const peligro = aviso.tipo === "error";
        return (
          <div
            key={aviso.id}
            role={peligro ? "alert" : "status"}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: peligro ? "#fff3f2" : "#eef7ff",
              border: `1px solid ${peligro ? "#f4c8c4" : "#c8def5"}`,
              borderLeft: `4px solid ${peligro ? "#cf5c56" : "#517aac"}`,
              borderRadius: 14,
              padding: "13px 14px",
              color: "#263b52",
              boxShadow: "0 12px 30px rgba(25,48,78,.14)",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
            }}
          >
            <i
              className={`bi ${peligro ? "bi-exclamation-circle-fill" : "bi-info-circle-fill"}`}
              style={{ color: peligro ? "#cf5c56" : "#517aac", fontSize: 18 }}
            />
            <div style={{ flex: 1, lineHeight: 1.5 }}>
              <strong style={{ display: "block", marginBottom: 2 }}>
                {peligro ? "No se pudo completar" : "Información"}
              </strong>
              {aviso.texto}
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => cerrar(aviso.id)}
              style={{ border: 0, background: "transparent", color: "#687a8b", padding: 0, cursor: "pointer" }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

export default function Casos() {
  const [casos, setCasos] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState(null);

  const cerrarAviso = useCallback((id) => setAvisos((prev) => prev.filter((a) => a.id !== id)), []);

  const notificar = useCallback((texto, tipo = "error") => {
    if (!texto) return;
    const id = `${Date.now()}-${Math.random()}`;
    setAvisos((prev) => [...prev.slice(-3), { id, texto, tipo }]);
    window.setTimeout(() => setAvisos((prev) => prev.filter((a) => a.id !== id)), tipo === "error" ? 6500 : 4000);
  }, []);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const [rAtenciones, rAlertas, rAgentes, rUnidades, rTipos, rUsuarios] = await Promise.allSettled([
        listarAtencionesDirector(),
        listarAlertasDirector(),
        listarAgentesDirector(),
        listarUnidadesDirector(),
        listarTiposAlertaCentral(),
        listarUsuariosTransito(),
      ]);
      if (!activo) return;
      const atenciones = rAtenciones.status === "fulfilled" ? rAtenciones.value : [];
      const alertas = rAlertas.status === "fulfilled" ? rAlertas.value : [];
      const tipos = rTipos.status === "fulfilled" ? rTipos.value : [];

      const tiposTransito = new Set(
        tipos
          .filter(t => normalizarCentral(t.centralResponsable ?? t.central_responsable) === "TRANSITO")
          .map(t => normalizarCentral(t.nombre ?? t.nombreTipoAlerta ?? t.tipo))
          .filter(Boolean)
      );

      const alertasTransito = alertas.filter(alerta =>
        tiposTransito.has(normalizarCentral(tipoCaso(alerta)))
      );

      setCasos(prepararCasos(alertasTransito, atenciones));
      if (rAgentes.status === "fulfilled") setAgentes(rAgentes.value);
      if (rUnidades.status === "fulfilled") setUnidades(rUnidades.value);
      if (rUsuarios.status === "fulfilled") setUsuarios(rUsuarios.value);
      const errores = [];
      if (rAtenciones.status === "rejected")
        errores.push(rAtenciones.reason?.message || "No se pudieron consultar las atenciones.");
      if (rAlertas.status === "rejected")
        errores.push("No se pudieron consultar las alertas. Se muestran las atenciones disponibles.");
      if (rAgentes.status === "rejected") errores.push("No se pudo consultar la disponibilidad de agentes.");
      if (errores.length) notificar(errores.join(" | "));
      setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [notificar]);

  const estadosDisponibles = useMemo(
    () =>
      [...new Set(casos.map((caso) => String(caso.estadoVisual ?? "").trim()))]
        .filter(Boolean)
        .sort((a, b) => textoVisible(a).localeCompare(textoVisible(b), "es")),
    [casos],
  );

  const filtrados = useMemo(
    () =>
      casos.filter((caso) => {
        if (estado && normalizar(caso.estadoVisual) !== normalizar(estado)) return false;
        const contenido = normalizar(
          [
            caso.identificador,
            caso.reportante,
            caso.barrio,
            caso.tipoVisual,
            caso.estadoVisual,
            caso.descripcion,
          ].join(" "),
        );
        return contenido.includes(normalizar(busqueda));
      }),
    [casos, estado, busqueda],
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const activos = casos.filter((caso) => !estadoFinalizado(caso.estadoVisual)).length;

  const cerradosHoy = casos.filter(
    (caso) =>
      estadoFinalizado(caso.estadoVisual) && fechaEsHoy(caso.atencion?.fechaAtencion ?? caso.fechaVisual),
  ).length;

  const cerradosMes = casos.filter((caso) => {
    if (!estadoFinalizado(caso.estadoVisual)) return false;
    const fecha = caso.atencion?.fechaAtencion ?? caso.fechaVisual;
    if (!fecha) return false;
    const fechaCierre = new Date(fecha);
    const hoy = new Date();
    return (
      !Number.isNaN(fechaCierre.getTime()) &&
      fechaCierre.getMonth() === hoy.getMonth() &&
      fechaCierre.getFullYear() === hoy.getFullYear()
    );
  }).length;

  const disponibles = agentes.filter((agente) => estadoActivoAgente(agente.estadoAgente ?? agente.estado)).length;

  function limpiar() {
    setBusqueda("");
    setEstado("");
    setPagina(1);
  }

  return (
    <Layout
      titulo="Casos de Tránsito"
      activo="casos"
      busqueda={{ placeholder: "Buscar por caso, barrio o agente..." }}
    >
      <div className="mb-4">
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.6px", color: "#517aac", marginBottom: 6 }}>
          DIRECCIÓN DE TRÁNSITO
        </div>
        <h1
          className="section-title-dash"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(22px, 2.3vw, 27px)",
            fontWeight: 800,
            letterSpacing: "-0.9px",
            lineHeight: 1.2,
          }}
        >
          Casos de Tránsito
        </h1>
        <p className="section-text-dash mb-0">
          Consulta y supervisa los casos reportados en el módulo de tránsito.
        </p>
      </div>
      {cargando && (
        <div className="text-muted small mb-3" role="status">
          Cargando casos de tránsito...
        </div>
      )}
      <div className="row g-3 mb-4 mt-4 casos-kpis">
        <KpiCard color="red" valor={activos} label="Casos activos" icono="bi-geo-alt" />
        <KpiCard color="blue" valor={cerradosMes} label="Casos cerrados del mes" icono="bi-calendar-check" />
        <KpiCard color="green" valor={cerradosHoy} label="Casos cerrados hoy" icono="bi-check2" />
        <KpiCard color="amber" valor={`${disponibles}/${agentes.length}`} label="Agentes disponibles" icono="bi-truck" />
      </div>
      <div className="table-card-dash casos-tabla">
        <div className="casos-barra-filtros mb-3">
          <div className="input-group search-dash filtros-busqueda-dash casos-buscador">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar por reportante, barrio..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
          <div className="casos-filtros-estados">
            <button
              type="button"
              className={`pill-filtro-dash casos-filtro-todas ${estado === "" ? "casos-filtro-activo" : ""}`}
              style={SIN_MAYUSCULAS}
              onClick={() => {
                setEstado("");
                setPagina(1);
              }}
            >
              Todas ({casos.length})
            </button>
            {estadosDisponibles.map((valor) => (
              <button
                key={valor}
                type="button"
                className={`pill-filtro-dash ${claseFiltroEstado(valor)} ${estado === valor ? "casos-filtro-activo" : ""}`}
                style={SIN_MAYUSCULAS}
                aria-pressed={estado === valor}
                onClick={() => {
                  setEstado(valor);
                  setPagina(1);
                }}
              >
                {textoVisible(valor)}
              </button>
            ))}
            <button
              type="button"
              className="pill-filtro-dash casos-filtro-limpiar"
              style={SIN_MAYUSCULAS}
              onClick={limpiar}
            >
              <i className="bi bi-x-circle" /> Limpiar
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0 casos-table">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th className="text-end"> </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((caso, indice) => (
                <tr key={caso.identificador ?? indice}>
                  <td>
                    <div className="casos-reportante">
                      <span className={`casos-avatar casos-avatar-${colorPerfil(caso)}`}>
                        {iniciales(caso.reportante)}
                      </span>
                      <div className="casos-reportante-datos">
                        <div className="info-title-dash">{caso.reportante}</div>
                        <div className="info-sub-dash">{fechaTransito(caso.fechaVisual)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-dash casos-pill ${claseTipoCaso(caso.tipoVisual)}`} style={SIN_MAYUSCULAS}>
                      {textoVisible(caso.tipoVisual)}
                    </span>
                  </td>
                  <td>{caso.barrio}</td>
                  <td>
                    <span className={`badge-dash casos-pill ${claseEstadoCaso(caso.estadoVisual)}`} style={SIN_MAYUSCULAS}>
                      {textoVisible(caso.estadoVisual)}
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
              ))}
            </tbody>
          </table>
        </div>
        {visibles.length === 0 && <p className="text-center text-muted py-4 mb-0">No se encontraron casos.</p>}
        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {visibles.length} de {filtrados.length} reportes
          </span>
          <div className="d-flex gap-1">
            <button
              type="button"
              className="page-btn-dash"
              disabled={paginaActual === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left" />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`page-btn-dash ${paginaActual === numero ? "active-dash" : ""}`}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}
            <button
              type="button"
              className="page-btn-dash"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
      {detalle && (
        <div
          className="caso-detalle-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetalle(null);
          }}
        >
          <div
            className="caso-detalle-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloDetalleCaso"
          >
            <header className="caso-detalle-header">
              <span className="caso-detalle-header-icon">
                <i className="bi bi-clipboard-data-fill" />
              </span>

              <div className="caso-detalle-header-info">
                <div className="caso-detalle-eyebrow">
                  DIRECCIÓN DE TRÁNSITO
                </div>

                <h2 id="tituloDetalleCaso">
                  Detalle del caso #{detalle.identificador ?? "—"}
                </h2>

                <p>
                  Consulta la información y atención del incidente.
                </p>
              </div>

              <button
                type="button"
                className="caso-detalle-close"
                aria-label="Cerrar detalle"
                onClick={() => setDetalle(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="caso-detalle-body">

              <div className="caso-detalle-resumen">
                <span
                  className={`badge-dash casos-pill ${claseTipoCaso(detalle.tipoVisual)}`}
                  style={SIN_MAYUSCULAS}
                >
                  {textoVisible(detalle.tipoVisual)}
                </span>

                <span
                  className={`badge-dash casos-pill ${claseEstadoCaso(detalle.estadoVisual)}`}
                  style={SIN_MAYUSCULAS}
                >
                  {textoVisible(detalle.estadoVisual)}
                </span>
              </div>

              <section className="caso-detalle-section">

                <h3>
                  <i className="bi bi-file-earmark-text" />
                  Información del caso
                </h3>

                <div className="caso-detalle-grid">

                  <div className="caso-detalle-field">
                    <small>
                      <i className="bi bi-person" />
                      Reportado por
                    </small>
                    <strong>{detalle.reportante}</strong>
                  </div>

                  <div className="caso-detalle-field">
                    <small>
                      <i className="bi bi-geo-alt" />
                      Barrio
                    </small>
                    <strong>{detalle.barrio}</strong>
                  </div>

                  <div className="caso-detalle-field">
                    <small>
                      <i className="bi bi-calendar-event" />
                      Fecha del reporte
                    </small>
                    <strong>
                      {fechaTransito(detalle.fechaVisual)}
                    </strong>
                  </div>

                  <div className="caso-detalle-field">
                    <small>
                      <i className="bi bi-exclamation-circle" />
                      Tipo de incidente
                    </small>
                    <strong>
                      {textoVisible(detalle.tipoVisual)}
                    </strong>
                  </div>

                  <div className="caso-detalle-field completo">
                    <small>
                      <i className="bi bi-card-text" />
                      Descripción del incidente
                    </small>
                    <p>
                      {detalle.descripcion || "No disponible"}
                    </p>
                  </div>

                </div>
              </section>

              <section className="caso-detalle-section">

                <h3>
                  <i className="bi bi-shield-check" />
                  Información de la atención
                </h3>

                {detalle.atencion ? (
                  <div className="caso-detalle-grid">

                    <div className="caso-detalle-field">
                      <small>
                        <i className="bi bi-person-check" />
                        Agente que atendió
                      </small>

                      <strong>
                        {agentes.find(
                          (a) => String(a.idUsuario) === String(detalle.atencion.idAgenteTransito)
                        )?.nombreUsuario ||
                          (detalle.atencion.idAgenteTransito != null
                            ? `Agente #${detalle.atencion.idAgenteTransito}`
                            : "No registrado")}
                      </strong>
                    </div>

                    <div className="caso-detalle-field">
                      <small>
                        <i className="bi bi-car-front" />
                        Unidad de tránsito
                      </small>

                      <strong>
                        {unidades.find(
                          (u) => String(u.idUnidadTransito) === String(detalle.atencion.idUnidadTransito)
                        )?.nombre ||
                          (detalle.atencion.idUnidadTransito != null
                            ? `Unidad #${detalle.atencion.idUnidadTransito}`
                            : "No registrada")}
                      </strong>
                    </div>

                    <div className="caso-detalle-field">
                      <small>
                        <i className="bi bi-headset" />
                        Registrado por
                      </small>

                      <strong>
                        {usuarios.find(u =>
                          detalle.atencion.usuarioRegistra != null &&
                          (
                            String(u.idUsuario) === String(detalle.atencion.usuarioRegistra) ||
                            normalizar(u.username) === normalizar(detalle.atencion.usuarioRegistra)
                          )
                        )?.nombreCompleto || detalle.atencion.usuarioRegistra || "No registrado"}
                      </strong>
                    </div>

                    <div className="caso-detalle-field">
                      <small>
                        <i className="bi bi-calendar-check" />
                        Fecha de atención
                      </small>

                      <strong>
                        {fechaTransito(detalle.atencion.fechaAtencion)}
                      </strong>
                    </div>

                    <div className="caso-detalle-field completo">
                      <small>
                        <i className="bi bi-check2-circle" />
                        Estado final
                      </small>

                      <div>
                        <span
                          className={`badge-dash casos-pill ${claseEstadoCaso(detalle.atencion.estadoFinal)}`}
                          style={SIN_MAYUSCULAS}
                        >
                          {textoVisible(detalle.atencion.estadoFinal)}
                        </span>
                      </div>
                    </div>

                    <div className="caso-detalle-field completo">
                      <small>
                        <i className="bi bi-file-earmark-text" />
                        Informe de atención
                      </small>
                      <p>
                        {detalle.atencion.descripcion || "Sin informe"}
                      </p>
                    </div>

                    <div className="caso-detalle-field completo">
                      <small>
                        <i className="bi bi-chat-left-text" />
                        Observaciones
                      </small>
                      <p>
                        {detalle.atencion.observacion || "Sin observaciones"}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="caso-detalle-vacio">
                    <i className="bi bi-clock-history" />

                    <div>
                      <strong>Atención pendiente</strong>
                      <p>
                        Este caso aún no tiene una atención registrada.
                      </p>
                    </div>
                  </div>
                )}

              </section>
            </div>

            <footer className="caso-detalle-footer">
              <span>
                <i className="bi bi-shield-check me-2" />
                Gestión de casos
              </span>

              <button
                type="button"
                onClick={() => setDetalle(null)}
              >
                Cerrar detalle
              </button>
            </footer>
          </div>
        </div>
      )}
      <AvisosCasos avisos={avisos} cerrar={cerrarAviso} />
    </Layout>
  );
}