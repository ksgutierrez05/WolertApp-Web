
import { useEffect, useMemo, useState } from "react";

import Kpis from "../../Components/Administrador-policia/Kpicard";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

import "../../css/Policia/administrador-policia/css/reportes.css";

function campo(obj, ...claves) {
  for (const clave of claves) {
    if (obj?.[clave] !== undefined && obj?.[clave] !== null) {
      return obj[clave];
    }
  }
  return "";
}

function normalizar(valor) {
  return String(valor ?? "").trim().toUpperCase();
}

function fechaValida(fecha) {
  if (!fecha) return null;
  const resultado = new Date(fecha);
  return Number.isNaN(resultado.getTime()) ? null : resultado;
}

function fechaRegistro(alerta) {
  return campo(
    alerta,
    "fechaReporte",
    "FechaReporte",
    "fechaCreacion",
    "FechaCreacion",
    "fecha",
    "Fecha"
  );
}

function Reportes() {
  const [datos, setDatos] = useState({
    alertas: [],
    atenciones: [],
    asignaciones: [],
    policias: [],
    unidades: [],
    alarmas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [erroresParciales, setErroresParciales] = useState([]);
  const [recarga, setRecarga] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [fecha, setFecha] = useState("todas");

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const resultado = await obtenerDatosEstadisticas(
          controller.signal
        );

        if (controller.signal.aborted) return;

        setDatos(resultado.datos);
        setErroresParciales(resultado.errores || []);
        setError("");
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "No se pudieron cargar los reportes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => controller.abort();
  }, [recarga]);

  const registros = useMemo(() => {
    return (datos.alertas || []).map((alerta) => {
      const estadoAlerta = campo(
        alerta,
        "estado",
        "Estado"
      ) || "SIN ESTADO";

      const id = campo(
        alerta,
        "idAlerta",
        "IdAlerta"
      );

      return {
        id,
        tipo: campo(
          alerta,
          "nombreTipoAlerta",
          "NombreTipoAlerta",
          "tipoAlerta",
          "TipoAlerta"
        ) || "Alerta",
        barrio: campo(
          alerta,
          "nombreBarrio",
          "NombreBarrio",
          "barrioNombre",
          "BarrioNombre"
        ) || "No disponible",
        fecha: fechaRegistro(alerta),
        estado: estadoAlerta,
        prioridad: campo(
          alerta,
          "prioridad",
          "Prioridad"
        ) || "No disponible",
        original: alerta,
      };
    });
  }, [datos.alertas]);

  const clasificar = (valor) => {
    const e = normalizar(valor);

    if (
      ["RESUELTA", "RESUELTO", "FINALIZADA",
        "FINALIZADO", "ATENDIDA", "ATENDIDO", "CERRADA"].includes(e)
    ) return "finalizados";

    if (
      ["EN ATENCION", "EN PROCESO", "ASIGNADA",
        "EN CAMINO", "ACTIVA"].includes(e)
    ) return "enProceso";

    return "pendientes";
  };

  const valoresKpi = useMemo(() => ({
    totalReportes: registros.length,
    pendientes: registros.filter(
      (r) => clasificar(r.estado) === "pendientes"
    ).length,
    enProceso: registros.filter(
      (r) => clasificar(r.estado) === "enProceso"
    ).length,
    finalizados: registros.filter(
      (r) => clasificar(r.estado) === "finalizados"
    ).length,
  }), [registros]);

  const registrosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);

    return registros.filter((r) => {
      const coincideEstado =
        estado === "todos" || clasificar(r.estado) === estado;

      let coincideFecha = true;
      const fechaDato = fechaValida(r.fecha);
      const hoy = new Date();

      if (fecha !== "todas") {
        if (!fechaDato) {
          coincideFecha = false;
        } else if (fecha === "hoy") {
          coincideFecha =
            fechaDato.toDateString() === hoy.toDateString();
        } else if (fecha === "mes") {
          coincideFecha =
            fechaDato.getMonth() === hoy.getMonth() &&
            fechaDato.getFullYear() === hoy.getFullYear();
        } else if (fecha === "anio") {
          coincideFecha =
            fechaDato.getFullYear() === hoy.getFullYear();
        }
      }

      const contenido = normalizar([
        r.id,
        r.tipo,
        r.barrio,
        r.estado,
        r.prioridad,
      ].join(" "));

      return coincideEstado && coincideFecha &&
        (!texto || contenido.includes(texto));
    }).sort((a, b) => {
      return (fechaValida(b.fecha)?.getTime() || 0) -
        (fechaValida(a.fecha)?.getTime() || 0);
    });
  }, [registros, busqueda, estado, fecha]);

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((v) => v + 1);
  }

  function exportarCSV() {
    if (!registrosFiltrados.length) return;

    const columnas = [
      "ID",
      "TIPO DE ALERTA",
      "BARRIO",
      "FECHA",
      "PRIORIDAD",
      "ESTADO",
    ];

    const escapar = (valor) =>
      `"${String(valor ?? "").replace(/"/g, '""')}"`;

    const filas = registrosFiltrados.map((r) => [
      r.id,
      r.tipo,
      r.barrio,
      r.fecha,
      r.prioridad,
      r.estado,
    ]);

    const contenido = [
      columnas,
      ...filas,
    ].map((fila) => fila.map(escapar).join(";")).join("\n");

    const blob = new Blob(
      ["\uFEFF" + contenido],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `reporte-policial-${new Date()
      .toISOString().slice(0, 10)}.csv`;

    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="reportes-page">

      <header className="reportes-header">
        <div>
          <span className="reportes-etiqueta">
            ADMINISTRACIÓN POLICIAL
          </span>

          <h1>Reportes</h1>

          <p>
            Consulta y exporta información de la actividad policial.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={actualizar}
          disabled={cargando}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Actualizar
        </button>
      </header>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={actualizar}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )}

      {erroresParciales.length > 0 && (
        <div className="alert alert-warning">
          Algunos recursos no pudieron consultarse:
          <ul className="mb-0 mt-2">
            {erroresParciales.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Kpis
        grupo="reportes"
        valores={valoresKpi}
        cargando={cargando}
      />

      <section className="reportes-panel">

        <div className="reportes-panel-header">
          <div>
            <h2>Generación de reportes</h2>
            <p>
              Filtra las alertas registradas en el sistema.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-success"
            onClick={exportarCSV}
            disabled={cargando || registrosFiltrados.length === 0}
          >
            <i className="bi bi-file-earmark-spreadsheet me-2" />
            Exportar CSV
          </button>
        </div>

        <div className="reportes-filtros">

          <label>
            <span>Buscar</span>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>

              <input
                className="form-control"
                placeholder="ID, alerta o barrio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Fecha</span>
            <select
              className="form-select"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            >
              <option value="todas">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="mes">Este mes</option>
              <option value="anio">Este año</option>
            </select>
          </label>

          <label>
            <span>Estado</span>
            <select
              className="form-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendientes">Pendientes</option>
              <option value="enProceso">En proceso</option>
              <option value="finalizados">Finalizados</option>
            </select>
          </label>
        </div>

        <div className="reportes-tabla-contenedor">
          <table className="table reportes-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de alerta</th>
                <th>Barrio</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    Cargando reportes...
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    No se encontraron reportes.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((r, index) => (
                  <tr key={r.id || index}>
                    <td>#{r.id || "—"}</td>
                    <td>{r.tipo}</td>
                    <td>{r.barrio}</td>
                    <td>
                      {fechaValida(r.fecha)
                        ? fechaValida(r.fecha).toLocaleDateString("es-CO")
                        : "No disponible"}
                    </td>
                    <td>{r.prioridad}</td>
                    <td>
                      <span className={`reporte-estado ${clasificar(r.estado)}`}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="reportes-footer">
          Mostrando {registrosFiltrados.length} de {registros.length} registros
        </footer>
      </section>
    </main>
  );
}

export default Reportes;
