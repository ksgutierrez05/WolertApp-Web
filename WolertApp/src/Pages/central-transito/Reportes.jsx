import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Layout from "../../Components/transito/Layout";
import {
  listarAtencionesCentral,
  listarAgentesCentral,
  listarAlertasCentral,
  finalizadaCentral,
  tipoCentral,
  lugarCentral,
  idAtencionCentral,
  idAgenteCentral,
  idAlertaCentral,
  nombreAgenteCentral,
} from "../../Services/centralTransitoService";
import "../../css/transito/central-transito/panel-atencion-transito.css";
// ===== CONFIGURACIÓN =====
const LOGO_TRANSITO = "/img/secretaria%20transito.png";
const AZUL = [23, 63, 101];
const AZUL_CLARO = [235, 242, 248];
const GRIS = [75, 85, 95];
// ===== FUNCIONES AUXILIARES =====
const lista = (valor) => (Array.isArray(valor) ? valor : []);
const textoSeguro = (valor) =>
  valor === null || valor === undefined || valor === ""
    ? "No registrado"
    : String(valor);
const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
function nombreIncidente(valor) {
  const nombres = {
    SEMAFORO_DANADO: "Semáforo dañado",
    ACCIDENTE_TRANSITO: "Accidente de tránsito",
    CONGESTION_VEHICULAR: "Congestión vehicular",
    OBSTRUCCION_VIA: "Obstrucción de vía",
  };
  const codigo = String(valor ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  if (!codigo) return "No registrado";
  if (nombres[codigo]) return nombres[codigo];
  const nombre = codigo.toLowerCase().replaceAll("_", " ");
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}
function colorIncidente(tipo) {
  const valor = normalizar(tipo);
  if (valor.includes("SEMAFORO") || valor.includes("SENAL")) return "amber";
  if (valor.includes("ACCIDENTE") || valor.includes("CHOQUE") || valor.includes("ATROPELLO")) return "red";
  if (valor.includes("CONGESTION") || valor.includes("TRANCON") || valor.includes("TRAFICO")) return "purple";
  if (valor.includes("OBSTRUCCION") || valor.includes("BLOQUEO") || valor.includes("VIA")) return "blue";
  if (valor.includes("CONTROL") || valor.includes("OPERATIVO")) return "green";
  return "blue";
}
const fechaCierre = (atencion) =>
  atencion?.fechaFinalizacion ??
  atencion?.fechaCierre ??
  atencion?.fechaFin ??
  atencion?.fechaAtencion ??
  atencion?.fechaRegistro ??
  atencion?.fecha ??
  null;
function formatearFecha(valor) {
  if (!valor) return "Sin registrar";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Fecha inválida";
  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
const numeroInforme = (caso) =>
  `WLT-TRA-AT-${String(caso.id).padStart(5, "0")}`;
const fechaExportacion = () =>
  new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
// ===== LOGO =====
async function cargarLogo() {
  const respuesta = await fetch(LOGO_TRANSITO);
  if (!respuesta.ok) throw new Error("No se encontró el logo de tránsito.");
  const blob = await respuesta.blob();
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer el logo."));
    lector.readAsDataURL(blob);
  });
}
function dimensionesImagen(dataUrl) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () =>
      resolve({ ancho: imagen.naturalWidth, alto: imagen.naturalHeight });
    imagen.onerror = () => reject(new Error("Imagen no válida."));
    imagen.src = dataUrl;
  });
}
// ===== GENERAR PDF =====
async function generarPDF(caso, responsable) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 17;
  const anchoContenido = ancho - margen * 2;
  const codigo = numeroInforme(caso);
  const fechaEmision = fechaExportacion();
  // Encabezado institucional
  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.5);
  doc.rect(margen, 13, anchoContenido, 33);
  try {
    const imagen = await cargarLogo();
    const dimensiones = await dimensionesImagen(imagen);
    const escala = Math.min(29 / dimensiones.ancho, 27 / dimensiones.alto);
    const imagenAncho = dimensiones.ancho * escala;
    const imagenAlto = dimensiones.alto * escala;
    const formato = imagen.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(
      imagen,
      formato,
      margen + (33 - imagenAncho) / 2,
      16 + (27 - imagenAlto) / 2,
      imagenAncho,
      imagenAlto
    );
  } catch (error) {
    console.warn("No se pudo incluir el logo:", error);
  }
  doc.setDrawColor(...AZUL);
  doc.line(margen + 36, 13, margen + 36, 46);
  const centroEncabezado = margen + 36 + (anchoContenido - 36) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...AZUL);
  doc.text("ALCALDÍA MUNICIPAL DE VALLEDUPAR", centroEncabezado, 23, { align: "center" });
  doc.setFontSize(10);
  doc.text("SECRETARÍA DE TRÁNSITO", centroEncabezado, 31, { align: "center" });
  doc.setFontSize(9);
  doc.text("INFORME DE ATENCIÓN DE INCIDENTE", centroEncabezado, 39, { align: "center" });
  let y = 54;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text(`Código: ${codigo}`, margen, y);
  doc.text(`Fecha de emisión: ${fechaEmision}`, ancho - margen, y, { align: "right" });
  y += 9;
  doc.setFillColor(...AZUL);
  doc.rect(margen, y, anchoContenido, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("INFORME INSTITUCIONAL DE ATENCIÓN", ancho / 2, y + 7.3, { align: "center" });
  y += 16;
  // Información general
  autoTable(doc, {
    startY: y,
    head: [["1. INFORMACIÓN GENERAL DEL CASO", ""]],
    body: [
      ["Número de informe", codigo],
      ["Número de atención", textoSeguro(caso.id)],
      ["Número de alerta", textoSeguro(caso.idAlerta)],
      ["Tipo de incidente", textoSeguro(caso.tipo)],
      ["Ubicación registrada", textoSeguro(caso.barrio)],
      ["Fecha de atención", textoSeguro(caso.cierre)],
      ["Estado final", textoSeguro(caso.estadoFinal)],
      ["Agente que atendió", textoSeguro(caso.agente)],
      ["Unidad de tránsito", textoSeguro(caso.idUnidad)],
      ["Número de asignación", textoSeguro(caso.idAsignacion)],
    ],
    theme: "grid",
    margin: { left: margen, right: margen, bottom: 29 },
    tableWidth: anchoContenido,
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.7,
      lineColor: [218, 226, 234],
      lineWidth: 0.2,
      textColor: [45, 55, 65],
      overflow: "linebreak",
    },
    headStyles: { fillColor: AZUL, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 55, fillColor: AZUL_CLARO, fontStyle: "bold" },
      1: { cellWidth: anchoContenido - 55 },
    },
  });
  y = doc.lastAutoTable.finalY + 9;
  function nuevaPaginaSiHaceFalta(alturaNecesaria) {
    if (y + alturaNecesaria > alto - 29) {
      doc.addPage();
      y = 22;
    }
  }
  function agregarSeccion(titulo, contenido) {
    const contenidoTexto = textoSeguro(contenido);
    nuevaPaginaSiHaceFalta(26);
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(margen, y, anchoContenido, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...AZUL);
    doc.setFontSize(9.5);
    doc.text(titulo, margen + 3, y + 6);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 55, 65);
    doc.setFontSize(9);
    const lineas = doc.splitTextToSize(contenidoTexto, anchoContenido - 8);
    for (const linea of lineas) {
      nuevaPaginaSiHaceFalta(6);
      doc.text(linea, margen + 3, y);
      y += 4.8;
    }
    y += 9;
  }
  agregarSeccion("2. DESCRIPCIÓN DE LOS HECHOS", caso.descripcionAlerta);
  agregarSeccion("3. ACTUACIONES REALIZADAS", caso.descripcion);
  agregarSeccion("4. OBSERVACIONES REGISTRADAS", caso.observacion);
  agregarSeccion(
    "5. RESULTADO DE LA ATENCIÓN",
    `La atención registra como estado final: ${textoSeguro(caso.estadoFinal)}.`
  );
  // Responsable de la entrega
  nuevaPaginaSiHaceFalta(64);
  doc.setFillColor(...AZUL_CLARO);
  doc.rect(margen, y, anchoContenido, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...AZUL);
  doc.text("6. RESPONSABLE DE LA ENTREGA DEL INFORME", margen + 3, y + 6);
  y += 15;
  doc.setFontSize(9);
  doc.setTextColor(45, 55, 65);
  doc.setFont("helvetica", "bold");
  doc.text("Nombre completo:", margen + 3, y);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(responsable.nombre, anchoContenido - 45), margen + 39, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Cargo:", margen + 3, y);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(responsable.cargo, anchoContenido - 45), margen + 39, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Dependencia:", margen + 3, y);
  doc.setFont("helvetica", "normal");
  doc.text("Central de Tránsito", margen + 39, y);
  y += 17;
  doc.setDrawColor(105, 115, 125);
  doc.line(margen + 3, y, margen + 88, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text("Firma de quien entrega el informe", margen + 3, y);
  // Pie de página
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setDrawColor(205, 215, 225);
    doc.line(margen, alto - 21, ancho - margen, alto - 21);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);
    doc.text("Generado mediante WolertApp a partir de registros del sistema.", margen, alto - 15);
    doc.text(`Página ${pagina} de ${totalPaginas}`, ancho - margen, alto - 15, { align: "right" });
    doc.setFontSize(7);
    doc.text("Documento sujeto a validación institucional.", margen, alto - 10);
  }
  doc.save(`Informe_${codigo}.pdf`);
}
// ===== EXPORTAR EXCEL =====
// Protección contra fórmulas: antepone una comilla si empieza con = + - @
function valorExcel(valor) {
  if (valor === null || valor === undefined) return "";
  const contenido = String(valor);
  return /^\s*[=+\-@]/.test(contenido) ? `'${contenido}` : contenido;
}
async function exportarCasosExcel(casos) {
  const libro = new ExcelJS.Workbook();
  libro.creator = "WolertApp";
  libro.subject = "Registro de atenciones de tránsito";
  libro.title = "Informe de casos finalizados";
  libro.created = new Date();
  const hoja = libro.addWorksheet("Casos de tránsito", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  const columnas = [
    { header: "N.º Atención", key: "id", width: 18 },
    { header: "N.º Alerta", key: "idAlerta", width: 16 },
    { header: "Tipo de incidente", key: "tipo", width: 27 },
    { header: "Ubicación", key: "barrio", width: 35 },
    { header: "Agente responsable", key: "agente", width: 32 },
    { header: "Fecha de atención", key: "cierre", width: 26 },
    { header: "Estado final", key: "estadoFinal", width: 20 },
    { header: "Unidad de tránsito", key: "idUnidad", width: 21 },
    { header: "N.º Asignación", key: "idAsignacion", width: 20 },
    { header: "Descripción del incidente", key: "descripcionAlerta", width: 55 },
    { header: "Actuaciones realizadas", key: "descripcion", width: 55 },
    { header: "Observaciones", key: "observacion", width: 55 },
  ];
  hoja.columns = columnas;
  // Encabezado
  hoja.mergeCells("A1:L2");
  const titulo = hoja.getCell("A1");
  titulo.value =
    "SECRETARÍA DE TRÁNSITO - VALLEDUPAR\nREGISTRO DE CASOS FINALIZADOS";
  titulo.font = {
    name: "Aptos Display",
    size: 16,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF173F65" } };
  titulo.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  hoja.getRow(1).height = 25;
  hoja.getRow(2).height = 25;
  hoja.mergeCells("A3:L3");
  const subtitulo = hoja.getCell("A3");
  subtitulo.value = `Fecha de exportación: ${fechaExportacion()} | Total de atenciones: ${casos.length}`;
  subtitulo.font = { name: "Aptos", size: 11, italic: true, color: { argb: "FF475569" } };
  subtitulo.alignment = { horizontal: "center", vertical: "middle" };
  hoja.getRow(3).height = 25;
  hoja.getRow(4).height = 12;
  // Encabezados de columnas
  const filaEncabezados = hoja.getRow(5);
  columnas.forEach((columna, indice) => {
    const celda = filaEncabezados.getCell(indice + 1);
    celda.value = columna.header;
    celda.font = { name: "Aptos", bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2D609C" } };
    celda.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  filaEncabezados.height = 32;
  // Registros
  casos.forEach((caso, indice) => {
    const fila = hoja.addRow({
      id: caso.id ?? "",
      idAlerta: caso.idAlerta ?? "",
      tipo: valorExcel(caso.tipo),
      barrio: valorExcel(caso.barrio),
      agente: valorExcel(caso.agente),
      cierre: valorExcel(caso.cierre),
      estadoFinal: valorExcel(caso.estadoFinal),
      idUnidad: caso.idUnidad ?? "",
      idAsignacion: caso.idAsignacion ?? "",
      descripcionAlerta: valorExcel(caso.descripcionAlerta),
      descripcion: valorExcel(caso.descripcion),
      observacion: valorExcel(caso.observacion),
    });
    fila.height = 36;
    fila.eachCell({ includeEmpty: true }, (celda) => {
      celda.alignment = { vertical: "middle", wrapText: true };
      celda.font = { name: "Aptos", size: 10, color: { argb: "FF334155" } };
      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: indice % 2 === 0 ? "FFFFFFFF" : "FFF0F5FA" },
      };
      celda.border = { bottom: { style: "hair", color: { argb: "FFDCE5ED" } } };
    });
  });
  hoja.autoFilter = { from: "A5", to: `L${Math.max(6, casos.length + 5)}` };
  hoja.pageSetup = {
    orientation: "landscape",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  hoja.headerFooter.oddFooter =
    "WolertApp - Registro de atenciones de tránsito | Página &P de &N";
  const buffer = await libro.xlsx.writeBuffer();
  const archivo = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fecha = new Date().toISOString().slice(0, 10);
  saveAs(archivo, `Informe_Casos_Transito_${fecha}.xlsx`);
}
// ===== NOTIFICACIONES =====
function Notificacion({ item, cerrar }) {
  useEffect(() => {
    const timer = setTimeout(
      () => cerrar(item.id),
      item.tipo === "error" ? 6500 : 4000
    );
    return () => clearTimeout(timer);
  }, [item.id, item.tipo, cerrar]);
  const icono =
    item.tipo === "exito"
      ? "bi-check-circle-fill"
      : item.tipo === "error"
        ? "bi-exclamation-circle-fill"
        : "bi-info-circle-fill";
  return (
    <div
      className={`informe-toast informe-toast-${item.tipo}`}
      role={item.tipo === "error" ? "alert" : "status"}
    >
      <i className={`bi ${icono}`} />
      <span>{item.mensaje}</span>
      <button type="button" onClick={() => cerrar(item.id)} aria-label="Cerrar notificación">
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}
// ===== COMPONENTE PRINCIPAL =====
export default function Informes() {
  const [atenciones, setAtenciones] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [responsable, setResponsable] = useState({ nombre: "", cargo: "" });
  const [generando, setGenerando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const notificar = useCallback((mensaje, tipo = "info") => {
    setNotificaciones((items) => [
      ...items,
      { id: `${Date.now()}-${Math.random()}`, mensaje, tipo },
    ]);
  }, []);
  const cerrarNotificacion = useCallback(
    (id) => setNotificaciones((items) => items.filter((n) => n.id !== id)),
    []
  );
  // ===== CARGAR INFORMACIÓN =====
  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      const [rAtenciones, rAgentes, rAlertas] = await Promise.allSettled([
        listarAtencionesCentral(),
        listarAgentesCentral(),
        listarAlertasCentral(),
      ]);
      if (!activo) return;
      const mensajes = [];
      if (rAtenciones.status === "fulfilled") setAtenciones(lista(rAtenciones.value));
      else mensajes.push("No se pudieron consultar las atenciones.");
      if (rAgentes.status === "fulfilled") setAgentes(lista(rAgentes.value));
      else mensajes.push("No se pudieron consultar los agentes.");
      if (rAlertas.status === "fulfilled") setAlertas(lista(rAlertas.value));
      else mensajes.push("No se pudieron consultar las alertas.");
      if (mensajes.length) notificar(mensajes.join(" "), "error");
      setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [notificar]);
  // ===== CONSTRUIR CASOS FINALIZADOS =====
  const casos = useMemo(
    () =>
      atenciones.filter(finalizadaCentral).map((atencion) => {
        const idAgente = atencion.idAgenteTransito ?? atencion.agenteTransitoId;
        const agente = agentes.find(
          (item) =>
            idAgente != null && String(idAgenteCentral(item)) === String(idAgente)
        );
        const idAlerta = atencion.idAlerta ?? atencion.alertaId;
        const alerta = alertas.find(
          (item) =>
            idAlerta != null && String(idAlertaCentral(item)) === String(idAlerta)
        );
        const origen = alerta || atencion;
        return {
          id: idAtencionCentral(atencion),
          idAlerta,
          idUnidad: atencion.idUnidadTransito ?? atencion.unidadTransitoId,
          idAsignacion: atencion.idAsignacion,
          tipo: tipoCentral(origen),
          barrio: lugarCentral(origen),
          agente: agente
            ? nombreAgenteCentral(agente)
            : atencion.nombreAgente || "No identificado",
          cierre: formatearFecha(fechaCierre(atencion)),
          estadoFinal: atencion.estadoFinal || atencion.estado || "No registrado",
          descripcionAlerta: alerta?.descripcion || "",
          descripcion: atencion.descripcion || "",
          observacion: atencion.observacion || "",
        };
      }),
    [atenciones, agentes, alertas]
  );
  // ===== BUSCADOR =====
  const filas = useMemo(() => {
    const busqueda = buscar.trim().toLocaleLowerCase("es-CO");
    return casos.filter((caso) =>
      [caso.id, caso.idAlerta, caso.tipo, caso.barrio, caso.agente, caso.cierre, caso.estadoFinal]
        .join(" ")
        .toLocaleLowerCase("es-CO")
        .includes(busqueda)
    );
  }, [casos, buscar]);
  // ===== FORMULARIO =====
  function abrirFormulario(caso) {
    setSeleccionado(caso);
    setResponsable({ nombre: "", cargo: "Operador de Central de Tránsito" });
  }
  function cerrarFormulario() {
    if (generando) return;
    setSeleccionado(null);
    setResponsable({ nombre: "", cargo: "" });
  }
  async function descargarInforme(evento) {
    evento.preventDefault();
    if (!seleccionado || generando) return;
    const responsableManual = {
      nombre: responsable.nombre.trim(),
      cargo: responsable.cargo.trim() || "Operador de Central de Tránsito",
    };
    if (!responsableManual.nombre) {
      notificar("Escribe el nombre del responsable para generar el informe.", "error");
      return;
    }
    setGenerando(true);
    try {
      await generarPDF(seleccionado, responsableManual);
      notificar("Informe PDF generado correctamente.", "exito");
      setSeleccionado(null);
      setResponsable({ nombre: "", cargo: "" });
    } catch (error) {
      console.error("Error generando PDF:", error);
      notificar(`No fue posible generar el informe: ${error?.message || "Error desconocido"}`, "error");
    } finally {
      setGenerando(false);
    }
  }
  async function descargarExcel() {
    if (exportando || casos.length === 0) return;
    setExportando(true);
    try {
      await exportarCasosExcel(casos);
      notificar("Archivo Excel exportado correctamente.", "exito");
    } catch (error) {
      console.error("Error exportando Excel:", error);
      notificar("No se pudo generar el archivo Excel. Inténtalo nuevamente.", "error");
    } finally {
      setExportando(false);
    }
  }
  // ===== INTERFAZ =====
  return (
    <Layout
      rol="central"
      titulo="Informes de casos"
      activo="reportes"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      <header className="st-header mb-4">
        <div>
          <span className="st-eyebrow">CENTRAL DE TRÁNSITO</span>
          <h1>Informes de casos</h1>
          <p>
            Consulta las atenciones finalizadas, descarga informes institucionales en PDF y exporta los registros a Excel.
          </p>
        </div>
      </header>
      <div className="table-card-dash informes-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h2 className="panel-title-dash mb-1">Registro de atenciones finalizadas</h2>
            <p className="text-muted small mb-0">
              {casos.length} atenciones disponibles para informe
            </p>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="input-group search-panel-dash">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control border-0"
                placeholder="Buscar caso, barrio o agente..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-asignar-dash"
              onClick={descargarExcel}
              disabled={exportando || cargando || casos.length === 0}
            >
              <i className="bi bi-file-earmark-excel me-2" />
              {exportando ? "Exportando..." : "Exportar todos a Excel"}
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0 informes-tabla">
            <thead>
              <tr>
                <th>N.º atención</th>
                <th>Incidente</th>
                <th>Ubicación</th>
                <th>Agente</th>
                <th>Fecha de atención</th>
                <th>Estado</th>
                <th className="text-end">Documento</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((caso, indice) => (
                <tr key={caso.id ?? indice}>
                  <td>
                    <span className="informes-id">#{caso.id ?? "S/N"}</span>
                  </td>
                  <td>
                    <span className={`informe-incidente-pill informe-incidente-${colorIncidente(caso.tipo)}`}>
                      {nombreIncidente(caso.tipo)}
                    </span>
                  </td>
                  <td>
                    <span className="informes-ubicacion">{caso.barrio}</span>
                  </td>
                  <td>
                    <span className="informes-agente">{caso.agente}</span>
                  </td>
                  <td>
                    <span className="informes-fecha">{caso.cierre}</span>
                  </td>
                  <td>
                    <span className="informes-estado-pill">Finalizado</span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn-asignar-dash"
                      onClick={() => abrirFormulario(caso)}
                    >
                      <i className="bi bi-file-earmark-pdf me-2" />
                      Generar informe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!cargando && filas.length === 0 && (
          <p className="text-center text-muted small mb-0 p-4">
            No se encontraron atenciones finalizadas.
          </p>
        )}
      </div>
      {seleccionado && (
        <div className="panel-card-dash mt-4">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h2 className="panel-title-dash mb-1">Generar informe institucional</h2>
              <p className="text-muted small mb-0">
                Atención #{seleccionado.id} · Alerta #{seleccionado.idAlerta}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={cerrarFormulario}
              disabled={generando}
              aria-label="Cerrar formulario"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <form onSubmit={descargarInforme}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="config-field-label-dash">Responsable de la entrega</label>
                <input
                  type="text"
                  className="form-control"
                  value={responsable.nombre}
                  placeholder="Escribe el nombre del responsable"
                  onChange={(e) => setResponsable((anterior) => ({ ...anterior, nombre: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="config-field-label-dash">Cargo del responsable</label>
                <input
                  type="text"
                  className="form-control"
                  value={responsable.cargo}
                  onChange={(e) => setResponsable((anterior) => ({ ...anterior, cargo: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <div className="p-3 rounded bg-light">
                  <p className="fw-semibold mb-2">Información que incluirá el documento</p>
                  <p className="small mb-1">
                    <strong>Incidente:</strong> {nombreIncidente(seleccionado.tipo)}
                  </p>
                  <p className="small mb-1">
                    <strong>Ubicación:</strong> {seleccionado.barrio}
                  </p>
                  <p className="small mb-1">
                    <strong>Agente que atendió:</strong> {seleccionado.agente}
                  </p>
                  <p className="small mb-0">
                    <strong>Estado:</strong> {seleccionado.estadoFinal}
                  </p>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn-secundario-dash"
                  onClick={cerrarFormulario}
                  disabled={generando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-asignar-dash"
                  disabled={generando}
                >
                  <i className="bi bi-download me-2" />
                  {generando ? "Generando documento..." : "Descargar informe PDF"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      {createPortal(
        <div className="informe-toast-contenedor" aria-live="polite">
          {notificaciones.map((item) => (
            <Notificacion key={item.id} item={item} cerrar={cerrarNotificacion} />
          ))}
        </div>,
        document.body
      )}
      <style>{`
        .informe-toast-contenedor { position:fixed; bottom:22px; right:20px; z-index:99999; width:min(365px,calc(100vw - 32px)); display:flex; flex-direction:column; gap:10px; pointer-events:none; }
        .informe-toast { display:flex; align-items:flex-start; gap:12px; padding:14px; border:1px solid #e5eaf1; border-left:4px solid #517aac; border-radius:12px; background:#fff; color:#34465f; box-shadow:0 12px 30px rgba(27,47,73,.14); font:500 13px/1.5 Inter,sans-serif; pointer-events:auto; animation:toastEntrada .2s ease-out; }
        .informe-toast-exito { border-left-color:#299b69; }
        .informe-toast-error { border-left-color:#db6471; }
        .informe-toast > i { font-size:18px; color:#517aac; }
        .informe-toast-exito > i { color:#299b69; }
        .informe-toast-error > i { color:#db6471; }
        .informe-toast span { flex:1; overflow-wrap:anywhere; }
        .informe-toast button { background:none; border:0; color:#8390a0; cursor:pointer; }
        @keyframes toastEntrada { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        @media(max-width:600px) { .informe-toast-contenedor { bottom:16px; right:16px; } }
        .informes-card { border-radius:18px; border:1px solid #e8edf5; background:#ffffff; overflow:hidden; }
        .informes-tabla { font-family:"Inter",sans-serif; font-size:13px; }
        .informes-tabla thead th { background:#f3f7fc; color:#61738b; font-size:11px; font-weight:800; padding:17px 16px; border-bottom:1px solid #e5ebf3; white-space:nowrap; }
        .informes-tabla tbody td { padding:17px 16px; border-bottom:1px solid #edf1f6; vertical-align:middle; }
        .informes-tabla tbody tr:nth-child(even) { background:#fbfcff; }
        .informes-tabla tbody tr:hover { background:#f1f6fc; }
        .informes-id { display:inline-flex; padding:7px 11px; border-radius:9px; background:#edf3fb; color:#2d609c; font-weight:800; font-size:12px; white-space:nowrap; }
        .informe-incidente-pill { display:inline-flex; align-items:center; justify-content:center; padding:7px 13px; border-radius:999px; font-family:"Inter",sans-serif; font-size:11px; font-weight:750; line-height:1.4; white-space:nowrap; }
        .informe-incidente-amber { background:#fff3dc; color:#a96a10; }
        .informe-incidente-red { background:#fdebec; color:#c34854; }
        .informe-incidente-purple { background:#f0eafd; color:#7655b5; }
        .informe-incidente-blue { background:#e7f0fc; color:#356fae; }
        .informe-incidente-green { background:#e7f7ed; color:#20834c; }
        .informes-estado-pill { display:inline-flex; align-items:center; justify-content:center; padding:7px 13px; border-radius:999px; background:#e7f7ed; color:#20834c; font-size:11px; font-weight:750; white-space:nowrap; }
        .informes-ubicacion { color:#61738b; font-size:12px; font-weight:600; }
        .informes-agente { color:#203c5d; font-size:12px; font-weight:700; }
        .informes-fecha { color:#60728b; font-size:12px; font-weight:600; white-space:nowrap; }
        @media (max-width:768px) {
          .informes-tabla thead th, .informes-tabla tbody td { padding:13px 12px; }
        }
      `}</style>
    </Layout>
  );
}