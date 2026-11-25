import { useEffect, useMemo, useState } from "react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { listarTiposAlerta } from "../../Services/AlertasAdminService";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import SelectBonito from "../../Components/Administrador-policia/SelectBonito";
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

const OPCIONES_PERIODO = [
  { valor: "todas", etiqueta: "Todas las fechas" },
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "anio", etiqueta: "Este año" },
];

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

  const [tipos, setTipos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState(null);
  const [responsable, setResponsable] = useState("");
  const [cargo, setCargo] = useState("Administrador de Policía");
  const [pdfError, setPdfError] = useState("");
  const [generando, setGenerando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [fecha, setFecha] = useState("todas");

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const [resultado, catalogo] = await Promise.all([
          obtenerDatosEstadisticas(controller.signal),
          listarTiposAlerta(controller.signal),
        ]);
        if (!Array.isArray(catalogo))
          throw new Error("No se pudo verificar el catálogo de tipos de alerta.");
        setTipos(catalogo);

        if (controller.signal.aborted) return;

        setDatos(resultado.datos);
        setErroresParciales(resultado.errores || []);
        setError("");
      } catch (err) {
        if (!controller.signal.aborted) {
          setDatos({
            alertas: [],
            atenciones: [],
            asignaciones: [],
            policias: [],
            unidades: [],
            alarmas: [],
          });
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
    return (datos.alertas || [])
      .filter((a) => {
        const id =
          campo(a, "idTipoAlerta", "IdTipoAlerta", "tipoAlertaId") ||
          campo(a.tipoAlerta, "idTipoAlerta", "IdTipoAlerta");
        const nombre = normalizar(
          campo(a, "tipo", "nombreTipoAlerta", "NombreTipoAlerta", "tipoAlerta")
        );
        const tipo =
          tipos.find(
            (t) =>
              id !== "" &&
              String(campo(t, "idTipoAlerta", "IdTipoAlerta", "id")) === String(id)
          ) ||
          tipos.find(
            (t) => nombre && normalizar(campo(t, "nombre", "Nombre")) === nombre
          );
        const central =
          campo(a, "centralResponsable", "CentralResponsable", "central_responsable") ||
          campo(a.tipoAlerta, "centralResponsable", "CentralResponsable") ||
          campo(tipo, "centralResponsable", "CentralResponsable", "central_responsable");
        return (
          normalizar(central)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") === "POLICIA"
        );
      })
      .map((alerta) => {
        const estadoAlerta = campo(alerta, "estado", "Estado") || "SIN ESTADO";

        const id = campo(alerta, "idAlerta", "IdAlerta");

        return {
          id,
          tipo:
            campo(
              alerta,
              "tipo",
              "nombreTipoAlerta",
              "NombreTipoAlerta",
              "tipoAlerta",
              "TipoAlerta"
            ) || "Alerta",
          barrio:
            campo(
              alerta,
              "nombreBarrio",
              "NombreBarrio",
              "barrioNombre",
              "BarrioNombre"
            ) || "No disponible",
          fecha: fechaRegistro(alerta),
          estado: estadoAlerta,
          prioridad: campo(alerta, "prioridad", "Prioridad") || "No disponible",
          original: alerta,
        };
      });
  }, [datos.alertas, tipos]);

  const clasificar = (valor) => {
    const e = normalizar(valor).replaceAll("_", " ");

    if (
      [
        "RESUELTA",
        "RESUELTO",
        "FINALIZADA",
        "FINALIZADO",
        "ATENDIDA",
        "ATENDIDO",
        "CERRADA",
      ].includes(e)
    )
      return "finalizados";

    if (
      [
        "EN ATENCION",
        "EN PROCESO",
        "ASIGNADA",
        "EN CAMINO",
        "ACTIVA",
        "UNIDAD ASIGNADA",
      ].includes(e)
    )
      return "enProceso";

    return "pendientes";
  };

  const valoresKpi = useMemo(
    () => ({
      totalReportes: registros.length,
      pendientes: registros.filter((r) => clasificar(r.estado) === "pendientes")
        .length,
      enProceso: registros.filter((r) => clasificar(r.estado) === "enProceso")
        .length,
      finalizados: registros.filter((r) => clasificar(r.estado) === "finalizados")
        .length,
    }),
    [registros]
  );

  const registrosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);

    return registros
      .filter((r) => {
        const coincideEstado = estado === "todos" || clasificar(r.estado) === estado;

        let coincideFecha = true;
        const fechaDato = fechaValida(r.fecha);
        const hoy = new Date();

        if (fecha !== "todas") {
          if (!fechaDato) {
            coincideFecha = false;
          } else if (fecha === "hoy") {
            coincideFecha = fechaDato.toDateString() === hoy.toDateString();
          } else if (fecha === "mes") {
            coincideFecha =
              fechaDato.getMonth() === hoy.getMonth() &&
              fechaDato.getFullYear() === hoy.getFullYear();
          } else if (fecha === "anio") {
            coincideFecha = fechaDato.getFullYear() === hoy.getFullYear();
          }
        }

        const contenido = normalizar(
          [r.id, r.tipo, r.barrio, r.estado, r.prioridad].join(" ")
        );

        return (
          coincideEstado && coincideFecha && (!texto || contenido.includes(texto))
        );
      })
      .sort((a, b) => {
        return (
          (fechaValida(b.fecha)?.getTime() || 0) -
          (fechaValida(a.fecha)?.getTime() || 0)
        );
      });
  }, [registros, busqueda, estado, fecha]);

  const porPagina = 8;
  const totalPaginas = Math.max(
    1,
    Math.ceil(registrosFiltrados.length / porPagina)
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = registrosFiltrados.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  );

  function abrirInforme(r) {
    setSeleccion(r);
    setPdfError("");
  }

  async function generarPDF(e) {
    e.preventDefault();
    if (!seleccion || !responsable.trim() || !cargo.trim()) return;
    setGenerando(true);
    setPdfError("");
    try {
      const r = seleccion;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const verde = [11, 74, 63];
      const codigo = `WLT-POL-${r.id}`;
      const seguro = (v) => String(v ?? "").trim() || "No registrado";
      doc.setDrawColor(...verde);
      doc.rect(17, 13, 176, 33);
      try {
        const img = new Image();
        img.src = `${import.meta.env.BASE_URL}img/logopolicia.png`;
        await img.decode();
        const escala = Math.min(28 / img.naturalWidth, 27 / img.naturalHeight);
        doc.addImage(
          img,
          "PNG",
          20,
          16,
          img.naturalWidth * escala,
          img.naturalHeight * escala
        );
      } catch {
        doc.setFontSize(9);
        doc.text("WOLERTAPP", 20, 30);
      }
      doc.line(53, 13, 53, 46);
      doc.setTextColor(...verde);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("WOLERTAPP - VALLEDUPAR", 123, 23, { align: "center" });
      doc.text("ADMINISTRACIÓN POLICIAL", 123, 31, { align: "center" });
      doc.setFontSize(9);
      doc.text("INFORME DE ALERTA CIUDADANA", 123, 39, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Código: ${codigo}`, 17, 54);
      doc.text(new Date().toLocaleString("es-CO"), 193, 54, { align: "right" });
      const opciones = {
        theme: "grid",
        margin: { left: 17, right: 17, bottom: 22 },
        styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: verde },
      };
      autoTable(doc, {
        ...opciones,
        startY: 61,
        head: [["1. INFORMACIÓN GENERAL", "Detalle"]],
        body: [
          ["Número de alerta", seguro(r.id)],
          ["Tipo", seguro(r.tipo)],
          ["Barrio", seguro(r.barrio)],
          ["Fecha", fechaValida(r.fecha)?.toLocaleString("es-CO") || "No registrado"],
          ["Prioridad", seguro(r.prioridad)],
          ["Estado", seguro(r.estado)],
          [
            "Descripción",
            seguro(campo(r.original, "descripcion", "Descripcion", "detalle", "Detalle")),
          ],
        ],
      });
      const coincide = (a) =>
        String(campo(a, "idAlerta", "IdAlerta")) === String(r.id) && r.id !== "";
      const atenciones = datos.atenciones.filter(coincide);
      const asignaciones = datos.asignaciones.filter(
        (a) =>
          coincide(a) &&
          campo(a, "idUnidad", "IdUnidad", "idUnidadPolicial") !== "" &&
          !campo(a, "idUnidadTransito", "IdUnidadTransito")
      );
      autoTable(doc, {
        ...opciones,
        startY: doc.lastAutoTable.finalY + 8,
        head: [["2. ATENCIONES POLICIALES", "Fecha", "Detalle"]],
        body: atenciones.length
          ? atenciones.map((a) => [
              seguro(campo(a, "idAtencion", "IdAtencion")),
              seguro(campo(a, "fecha", "Fecha", "fechaAtencion")),
              seguro(campo(a, "detalle", "Detalle", "descripcion")),
            ])
          : [["Sin registros disponibles", "—", "—"]],
      });
      autoTable(doc, {
        ...opciones,
        startY: doc.lastAutoTable.finalY + 8,
        head: [["3. ASIGNACIONES POLICIALES", "Unidad", "Estado"]],
        body: asignaciones.length
          ? asignaciones.map((a) => [
              seguro(campo(a, "idAsignacion", "IdAsignacion")),
              seguro(campo(a, "idUnidad", "IdUnidad", "idUnidadPolicial")),
              seguro(campo(a, "estadoAsignacion", "EstadoAsignacion", "estado", "Estado")),
            ])
          : [["Sin registros disponibles", "—", "—"]],
      });
      autoTable(doc, {
        ...opciones,
        startY: doc.lastAutoTable.finalY + 8,
        head: [["4. RESPONSABLE DE ELABORACIÓN", ""]],
        body: [
          ["Nombre declarado", responsable.trim()],
          ["Cargo declarado", cargo.trim()],
          ["Firma", "________________________"],
        ],
      });
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(90);
        doc.text(
          `WOLERTAPP | Informe generado por el sistema | ${i}/${doc.getNumberOfPages()}`,
          105,
          286,
          { align: "center" }
        );
      }
      doc.save(`${codigo}.pdf`);
      setSeleccion(null);
    } catch (err) {
      setPdfError(err.message || "No se pudo generar el PDF.");
    } finally {
      setGenerando(false);
    }
  }

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((v) => v + 1);
  }

  function exportarCSV() {
    if (!registrosFiltrados.length) return;

    const columnas = ["ID", "TIPO DE ALERTA", "BARRIO", "FECHA", "PRIORIDAD", "ESTADO"];

    const escapar = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;

    const filas = registrosFiltrados.map((r) => [
      r.id,
      r.tipo,
      r.barrio,
      r.fecha,
      r.prioridad,
      r.estado,
    ]);

    const contenido = [columnas, ...filas]
      .map((fila) => fila.map(escapar).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `reporte-policial-${new Date().toISOString().slice(0, 10)}.csv`;

    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="reportes-page">
      <header className="reportes-header">
        <div>
          <span className="reportes-etiqueta">ADMINISTRACIÓN POLICIAL</span>

          <h1>Reportes</h1>

          <p>Consulta y exporta información de la actividad policial.</p>
        </div>
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

      <Kpis grupo="reportes" valores={valoresKpi} cargando={cargando} />

      {!cargando &&
        !error &&
        datos.alertas.length > 0 &&
        registros.length === 0 && (
          <div className="alert alert-warning">
            Se recibieron {datos.alertas.length} alertas, pero ninguna coincide con
            los tipos policiales del catálogo. Verifica la central responsable y el
            nombre del tipo de alerta.
          </div>
        )}

      <section className="reportes-panel">
        <div className="reportes-filtros">
          <div className="rp-fila-filtros">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control"
                aria-label="Buscar reportes"
                placeholder="Buscar por ID, alerta o barrio..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
              />
            </div>

            <SelectBonito
              id="rpPeriodo"
              valor={fecha}
              onChange={(v) => {
                setFecha(v || "todas");
                setPagina(1);
              }}
              icono="bi-calendar3"
              placeholder="Todas las fechas"
              ariaLabel="Periodo"
              opciones={OPCIONES_PERIODO}
            />

            <button
              className="rp-accion"
              onClick={exportarCSV}
              disabled={cargando || !registrosFiltrados.length}
            >
              <i className="bi bi-file-earmark-spreadsheet" /> Exportar CSV
            </button>
          </div>

          <div className="rp-chips">
            {[
              ["todos", "Todos"],
              ["pendientes", "Pendientes"],
              ["enProceso", "En proceso"],
              ["finalizados", "Finalizados"],
            ].map(([v, t]) => (
              <button
                type="button"
                key={v}
                aria-pressed={estado === v}
                className={`rp-chip ${estado === v ? "activo" : ""}`}
                onClick={() => {
                  setEstado(v);
                  setPagina(1);
                }}
              >
                {t}
                <span>
                  {v === "todos"
                    ? registros.length
                    : registros.filter((r) => clasificar(r.estado) === v).length}
                </span>
              </button>
            ))}
          </div>
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
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    Cargando reportes...
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    No se encontraron reportes policiales para los filtros
                    seleccionados.
                  </td>
                </tr>
              ) : (
                visibles.map((r, index) => (
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
                    <td>
                      <button
                        type="button"
                        className="rp-accion"
                        onClick={() => abrirInforme(r)}
                      >
                        <i className="bi bi-file-earmark-pdf" /> Generar informe
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="reportes-footer">
          <span>
            Mostrando{" "}
            {registrosFiltrados.length ? (paginaActual - 1) * porPagina + 1 : 0}–
            {Math.min(paginaActual * porPagina, registrosFiltrados.length)} de{" "}
            {registrosFiltrados.length} registros
          </span>
          <div className="rp-paginacion">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPagina(paginaActual - 1)}
              aria-label="Anterior"
            >
              ‹
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPagina(paginaActual + 1)}
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </footer>
      </section>

      {seleccion && (
        <div
          className="rp-modal-fondo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rp-titulo"
        >
          <form className="rp-modal" onSubmit={generarPDF}>
            <h2 id="rp-titulo">Generar informe policial</h2>
            <p>
              Alerta #{seleccion.id} · {seleccion.tipo}
            </p>
            <label>
              Nombre del responsable
              <input
                className="form-control"
                required
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              />
            </label>
            <label>
              Cargo
              <input
                className="form-control"
                required
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </label>
            {pdfError && <p role="alert">{pdfError}</p>}
            <div className="rp-modal-acciones">
              <button
                type="button"
                disabled={generando}
                onClick={() => setSeleccion(null)}
              >
                Cancelar
              </button>
              <button className="rp-accion" disabled={generando} type="submit">
                {generando ? "Generando..." : "Descargar PDF"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Reportes;