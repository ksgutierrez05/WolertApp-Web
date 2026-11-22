import { useEffect, useMemo, useState } from "react";
import "../../css/admin/reportes.css";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const FECHAS = ["fecha", "fechaReporte", "fechaCreacion", "fechaRegistro", "fechaAtencion", "fechaAsignacion", "createdAt", "created_at"];
const fechaDe = (item) => FECHAS.map((key) => item?.[key]).find(Boolean) ?? null;
const norm = (value) => String(value ?? "").trim().toLocaleUpperCase("es-CO");
const esCerrado = (value) => ["RESUELTA", "CERRADA", "ATENDIDA", "FINALIZADA", "COMPLETADA"].includes(norm(value));
const formato = (value) => new Intl.NumberFormat("es-CO").format(value || 0);

const REPORTES = [
  { id: "actividad", label: "Actividad ciudadana", icon: "bi-activity", description: "Volumen de alertas, prioridades y estados" },
  { id: "atencion", label: "Gestión de atención", icon: "bi-headset", description: "Atenciones y asignaciones registradas" },
  { id: "recursos", label: "Capacidad operativa", icon: "bi-people", description: "Disponibilidad de personal, unidades y alarmas" },
];

function agrupar(items, campo) {
  const cuenta = new Map();
  items.forEach((item) => {
    const nombre = String(campo(item) || "Sin dato").trim();
    cuenta.set(nombre, (cuenta.get(nombre) || 0) + 1);
  });
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
}

const xmlEscape = (valor) =>
  String(valor ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function columnaExcel(numero) {
  let columna = "";
  let valor = numero;
  while (valor > 0) {
    const residuo = (valor - 1) % 26;
    columna = String.fromCharCode(65 + residuo) + columna;
    valor = Math.floor((valor - 1) / 26);
  }
  return columna;
}

function celdaExcel(valor, referencia, estilo = 0) {
  const estiloXml = estilo ? ` s="${estilo}"` : "";
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return `<c r="${referencia}"${estiloXml}><v>${valor}</v></c>`;
  }

  const texto = valor instanceof Date ? valor.toLocaleString("es-CO") : String(valor ?? "");
  return `<c r="${referencia}" t="inlineStr"${estiloXml}><is><t xml:space="preserve">${xmlEscape(texto)}</t></is></c>`;
}

function hojaExcel({ filas, anchos, filtros, congelar = 0, combinar = [] }) {
  const ultimaColumna = columnaExcel(Math.max(1, ...filas.map((fila) => fila.valores.length)));
  const ultimaFila = Math.max(1, filas.length);
  const columnas = anchos.map((ancho, index) =>
    `<col min="${index + 1}" max="${index + 1}" width="${ancho}" customWidth="1"/>`
  ).join("");
  const filasXml = filas.map((fila, index) => {
    const numero = index + 1;
    const altura = fila.alto ? ` ht="${fila.alto}" customHeight="1"` : "";
    const celdas = fila.valores.map((valor, celdaIndex) =>
      celdaExcel(valor, `${columnaExcel(celdaIndex + 1)}${numero}`, fila.estilo || 0)
    ).join("");
    return `<row r="${numero}"${altura}>${celdas}</row>`;
  }).join("");
  const autoFiltro = filtros
    ? `<autoFilter ref="${filtros}"/>`
    : "";
  const pane = congelar
    ? `<sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="${congelar}" topLeftCell="A${congelar + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>`;
  const combinadas = combinar.length
    ? `<mergeCells count="${combinar.length}">${combinar.map((rango) => `<mergeCell ref="${rango}"/>`).join("")}</mergeCells>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${ultimaColumna}${ultimaFila}"/>${pane}<sheetFormatPr defaultRowHeight="20"/><cols>${columnas}</cols><sheetData>${filasXml}</sheetData>${autoFiltro}${combinadas}<pageMargins left="0.35" right="0.35" top="0.55" bottom="0.55" header="0.25" footer="0.25"/></worksheet>`;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function crearZip(archivos) {
  const codificador = new TextEncoder();
  const partes = [];
  const centrales = [];
  let desplazamiento = 0;

  archivos.forEach(({ nombre, contenido }) => {
    const nombreBytes = codificador.encode(nombre);
    const contenidoBytes = codificador.encode(contenido);
    const checksum = crc32(contenidoBytes);
    const local = new Uint8Array(30 + nombreBytes.length + contenidoBytes.length);
    const vistaLocal = new DataView(local.buffer);
    vistaLocal.setUint32(0, 0x04034b50, true);
    vistaLocal.setUint16(4, 20, true);
    vistaLocal.setUint16(6, 0x0800, true);
    vistaLocal.setUint16(8, 0, true);
    vistaLocal.setUint32(14, checksum, true);
    vistaLocal.setUint32(18, contenidoBytes.length, true);
    vistaLocal.setUint32(22, contenidoBytes.length, true);
    vistaLocal.setUint16(26, nombreBytes.length, true);
    local.set(nombreBytes, 30);
    local.set(contenidoBytes, 30 + nombreBytes.length);
    partes.push(local);

    const central = new Uint8Array(46 + nombreBytes.length);
    const vistaCentral = new DataView(central.buffer);
    vistaCentral.setUint32(0, 0x02014b50, true);
    vistaCentral.setUint16(4, 20, true);
    vistaCentral.setUint16(6, 20, true);
    vistaCentral.setUint16(8, 0x0800, true);
    vistaCentral.setUint16(10, 0, true);
    vistaCentral.setUint32(16, checksum, true);
    vistaCentral.setUint32(20, contenidoBytes.length, true);
    vistaCentral.setUint32(24, contenidoBytes.length, true);
    vistaCentral.setUint16(28, nombreBytes.length, true);
    vistaCentral.setUint32(42, desplazamiento, true);
    central.set(nombreBytes, 46);
    centrales.push(central);
    desplazamiento += local.length;
  });

  const tamañoCentral = centrales.reduce((total, bloque) => total + bloque.length, 0);
  const fin = new Uint8Array(22);
  const vistaFin = new DataView(fin.buffer);
  vistaFin.setUint32(0, 0x06054b50, true);
  vistaFin.setUint16(8, archivos.length, true);
  vistaFin.setUint16(10, archivos.length, true);
  vistaFin.setUint32(12, tamañoCentral, true);
  vistaFin.setUint32(16, desplazamiento, true);

  return new Blob([...partes, ...centrales, fin], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function descargarExcel({ nombre, reporte, periodo, generado, metricas, distribuciones, registros, errores }) {
  const resumen = [
    { valores: ["WOLERT · INFORME OPERATIVO", "", ""], estilo: 1, alto: 34 },
    { valores: [reporte, "", ""], estilo: 2, alto: 27 },
    { valores: [`Periodo: ${periodo}`, `Generado: ${generado}`, "Fuente: WolertApp"], estilo: 3, alto: 24 },
    { valores: ["", "", ""] },
    { valores: ["RESUMEN EJECUTIVO", "", ""], estilo: 4, alto: 24 },
    { valores: ["Indicador", "Resultado", "Descripción"], estilo: 5 },
    ...metricas.map(([etiqueta, valor, descripcion]) => ({ valores: [etiqueta, valor, descripcion] })),
  ];
  const filasCombinadas = ["A1:C1", "A2:C2", "A3:C3", "A5:C5"];

  resumen.push({ valores: ["", "", ""] });
  resumen.push({ valores: ["DISTRIBUCIONES", "", ""], estilo: 4, alto: 24 });
  filasCombinadas.push(`A${resumen.length}:C${resumen.length}`);
  distribuciones.forEach(({ titulo, filas, total }) => {
    resumen.push({ valores: [titulo, "", ""], estilo: 6, alto: 22 });
    filasCombinadas.push(`A${resumen.length}:C${resumen.length}`);
    resumen.push({ valores: ["Categoría", "Registros", "Participación"], estilo: 5 });
    if (filas.length) {
      filas.forEach(([etiqueta, cantidad]) => {
        resumen.push({
          valores: [etiqueta, cantidad, `${total ? Math.round((cantidad / total) * 100) : 0}%`],
        });
      });
    } else {
      resumen.push({ valores: ["Sin registros", 0, "0%"] });
    }
    resumen.push({ valores: ["Total", total, total ? "100%" : "0%"], estilo: 7 });
    resumen.push({ valores: ["", "", ""] });
  });
  if (errores.length) {
    resumen.push({ valores: ["COBERTURA DE DATOS", "", ""], estilo: 4, alto: 24 });
    filasCombinadas.push(`A${resumen.length}:C${resumen.length}`);
    resumen.push({
      valores: ["Consulta parcial", "", "Una o más fuentes no respondieron. Consulta los detalles a continuación."],
      estilo: 3,
    });
    errores.forEach((error) => {
      resumen.push({ valores: ["Fuente no disponible", "", error], estilo: 3 });
    });
  }

  const camposPrivados = /cedula|documento|telefono|correo|email|direccion|username|password|token/i;
  const claves = [...new Set(registros.flatMap((registro) =>
    Object.keys(registro).filter((key) => key !== "__grupo" && !camposPrivados.test(key))
  ))];
  const encabezados = ["Grupo", ...claves];
  const filasDetalle = [
    { valores: encabezados, estilo: 5, alto: 30 },
    ...registros.map((registro) => ({
      valores: [registro.__grupo, ...claves.map((clave) => {
        const valor = registro[clave];
        if (valor == null) return "";
        if (typeof valor === "object") return JSON.stringify(valor);
        if (typeof valor === "boolean") return valor ? "Sí" : "No";
        return valor;
      })] ,
    })),
  ];
  if (!registros.length) filasDetalle.push({ valores: ["Sin registros"] });

  const anchosDetalle = encabezados.map((encabezado, index) =>
    index === 0 ? 20 : Math.min(32, Math.max(16, String(encabezado).length + 3))
  );
  const estiloXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="5"><font><sz val="10"/><name val="Aptos"/><color rgb="FF24364B"/></font><font><b/><sz val="18"/><name val="Aptos Display"/><color rgb="FFFFFFFF"/></font><font><b/><sz val="13"/><name val="Aptos Display"/><color rgb="FF24446A"/></font><font><sz val="10"/><name val="Aptos"/><color rgb="FF65758A"/></font><font><b/><sz val="10"/><name val="Aptos"/><color rgb="FFFFFFFF"/></font></fonts><fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF244E7A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF0F7"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF315F91"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFDCE4ED"/></left><right style="thin"><color rgb="FFDCE4ED"/></right><top style="thin"><color rgb="FFDCE4ED"/></top><bottom style="thin"><color rgb="FFDCE4ED"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="4" fillId="4" borderId="0" xfId="0"/><xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0"/><xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

  const libro = crearZip([
    { nombre: "[Content_Types].xml", contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { nombre: "_rels/.rels", contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { nombre: "xl/workbook.xml", contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resumen" sheetId="1" r:id="rId1"/><sheet name="Detalle" sheetId="2" r:id="rId2"/></sheets></workbook>` },
    { nombre: "xl/_rels/workbook.xml.rels", contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { nombre: "xl/styles.xml", contenido: estiloXml },
    { nombre: "xl/worksheets/sheet1.xml", contenido: hojaExcel({ filas: resumen, anchos: [34, 20, 58], combinar: filasCombinadas }) },
    { nombre: "xl/worksheets/sheet2.xml", contenido: hojaExcel({ filas: filasDetalle, anchos: anchosDetalle, filtros: `A1:${columnaExcel(encabezados.length)}${filasDetalle.length}`, congelar: 1 }) },
  ]);

  const url = URL.createObjectURL(libro);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `wolert-reporte-${nombre}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Indicador({ icon, label, value, detail, tone }) {
  return <article className="admin-reports__metric"><span className={`admin-reports__metric-icon ${tone}`}><i className={`bi ${icon}`} /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>;
}

function Distribucion({ titulo, detalle, filas, total }) {
  return <section className="admin-reports__distribution"><header><h3>{titulo}</h3><p>{detalle}</p></header>{filas.length ? <div className="admin-reports__bars">{filas.slice(0, 7).map(([label, count], index) => <div className="admin-reports__bar-row" key={label}><div><span>{label.replaceAll("_", " ")}</span><b>{formato(count)} <small>{total ? Math.round(count / total * 100) : 0}%</small></b></div><span className="admin-reports__track"><i style={{ width: `${total ? Math.max(2, count / total * 100) : 0}%`, animationDelay: `${index * 70}ms` }} /></span></div>)}</div> : <div className="admin-reports__empty">No hay registros para este periodo.</div>}</section>;
}

export default function Reportes() {
  const [datos, setDatos] = useState({});
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [tipo, setTipo] = useState("actividad");
  const [periodo, setPeriodo] = useState("30");
  const reporteActivo = REPORTES.find((reporte) => reporte.id === tipo);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    obtenerDatosEstadisticas(controller.signal)
      .then((resultado) => { if (!controller.signal.aborted) { setDatos(resultado.datos); setErrores(resultado.errores); } })
      .catch((error) => { if (!controller.signal.aborted) setErrores([error.message || "No se pudieron cargar los datos."]); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  const desde = useMemo(() => {
    if (periodo === "all") return null;
    const date = new Date();
    date.setDate(date.getDate() - Number(periodo));
    date.setHours(0, 0, 0, 0);
    return date;
  }, [periodo]);
  const dentroPeriodo = (item) => {
    if (!desde) return true;
    const date = new Date(fechaDe(item));
    return !Number.isNaN(date.getTime()) && date >= desde;
  };
  const alertas = useMemo(() => (datos.alertas || []).filter(dentroPeriodo), [datos.alertas, desde]);
  const atenciones = useMemo(() => (datos.atenciones || []).filter(dentroPeriodo), [datos.atenciones, desde]);
  const asignaciones = useMemo(() => (datos.asignaciones || []).filter(dentroPeriodo), [datos.asignaciones, desde]);
  const prioridades = useMemo(() => agrupar(alertas, (item) => item.prioridad), [alertas]);
  const estados = useMemo(() => agrupar(alertas, (item) => item.estado), [alertas]);
  const tiposAlerta = useMemo(() => agrupar(alertas, (item) => item.tipo ?? item.tipoAlerta ?? item.nombreTipoAlerta), [alertas]);
  const actualizacion = new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  const exportar = () => {
    let metricas;
    let distribuciones;
    let registros;

    if (tipo === "actividad") {
      metricas = [
        ["Alertas recibidas", alertas.length, "Reportes ciudadanos del periodo"],
        ["Cerradas o atendidas", resueltas, "Alertas con estado finalizado"],
        ["Prioridad alta", alertas.filter((item) => norm(item.prioridad) === "ALTA").length, "Requieren atención prioritaria"],
      ];
      distribuciones = [
        { titulo: "Alertas por tipo", filas: tiposAlerta, total: alertas.length },
        { titulo: "Alertas por estado", filas: estados, total: alertas.length },
        { titulo: "Alertas por prioridad", filas: prioridades, total: alertas.length },
      ];
      registros = alertas.map((item) => ({ __grupo: "Alerta", ...item }));
    } else if (tipo === "atencion") {
      metricas = [
        ["Atenciones registradas", atenciones.length, "Intervenciones en el periodo"],
        ["Asignaciones realizadas", asignaciones.length, "Despachos en el periodo"],
        ["Alertas relacionadas", alertas.length, "Reportes ciudadanos del periodo"],
        ["Atenciones por alerta", alertas.length ? Math.round((atenciones.length / alertas.length) * 100) / 100 : 0, "Promedio del periodo"],
        ["Asignaciones por alerta", alertas.length ? Math.round((asignaciones.length / alertas.length) * 100) / 100 : 0, "Promedio del periodo"],
      ];
      distribuciones = [
        { titulo: "Atenciones por estado", filas: agrupar(atenciones, (item) => item.estado), total: atenciones.length },
        { titulo: "Asignaciones por estado", filas: agrupar(asignaciones, (item) => item.estado), total: asignaciones.length },
      ];
      registros = [
        ...atenciones.map((item) => ({ __grupo: "Atención", ...item })),
        ...asignaciones.map((item) => ({ __grupo: "Asignación", ...item })),
      ];
    } else {
      const estadosPersonal = agrupar(pol, (item) => item.estado);
      const estadosUnidades = agrupar(unidades, (item) => item.estado);
      metricas = [
        ["Personal registrado", pol.length, `${personalDisponible} activos o disponibles`],
        ["Unidades registradas", unidades.length, `${unidadesDisponibles} activas o disponibles`],
        ["Alarmas registradas", alarmas.length, "Total en el sistema"],
      ];
      distribuciones = [
        { titulo: "Estado del personal", filas: estadosPersonal, total: pol.length },
        { titulo: "Estado de las unidades", filas: estadosUnidades, total: unidades.length },
      ];
      registros = [
        ...pol.map((item) => ({ __grupo: "Personal policial", ...item })),
        ...unidades.map((item) => ({ __grupo: "Unidad", ...item })),
        ...alarmas.map((item) => ({ __grupo: "Alarma", ...item })),
      ];
    }

    descargarExcel({
      nombre: tipo,
      reporte: reporteActivo.label,
      periodo: periodo === "all" ? "Todo el historial" : `Últimos ${periodo} días`,
      generado: new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }),
      metricas,
      distribuciones,
      registros,
      errores,
    });
  };

  const pol = datos.policias || [];
  const unidades = datos.unidades || [];
  const alarmas = datos.alarmas || [];
  const personalDisponible = pol.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const unidadesDisponibles = unidades.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const resueltas = alertas.filter((x) => esCerrado(x.estado)).length;
  const sinDatosConsultados = errores.length > 0
    && (!Object.keys(datos).length || errores.length >= Object.keys(datos).length);

  return <main className="admin-reports">
    <header className="admin-reports__hero"><div><span className="admin-reports__eyebrow"><i className="bi bi-file-earmark-bar-graph-fill" /> INFORMES Y ANÁLISIS</span><h1>Reportes</h1><p>Genera resúmenes para entender la actividad y el desempeño operativo.</p></div><div className="admin-reports__actions"><label htmlFor="reports-period">Periodo</label><select id="reports-period" value={periodo} onChange={(event) => setPeriodo(event.target.value)}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="all">Todo el historial</option></select><button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "admin-reports__spin" : ""}`} /> Actualizar</button></div></header>

    <nav className="admin-reports__types" aria-label="Tipo de informe">{REPORTES.map((reporte) => <button type="button" key={reporte.id} className={tipo === reporte.id ? "is-active" : ""} onClick={() => setTipo(reporte.id)}><i className={`bi ${reporte.icon}`} /><span><b>{reporte.label}</b><small>{reporte.description}</small></span><i className="bi bi-chevron-right" /></button>)}</nav>
    {errores.length > 0 && <div className="admin-reports__notice" role="status"><i className="bi bi-exclamation-triangle-fill" /><span>Algunos datos no pudieron consultarse: {errores.join(" · ")}</span></div>}
    <section className="admin-reports__report"><div className="admin-reports__report-head"><div><span className="admin-reports__report-kicker">INFORME · {periodo === "all" ? "HISTÓRICO" : `ÚLTIMOS ${periodo} DÍAS`}</span><h2><i className={`bi ${reporteActivo.icon}`} /> {reporteActivo.label}</h2><p>{reporteActivo.description}. Datos consolidados para el periodo seleccionado.</p></div><button type="button" className="admin-reports__export" onClick={exportar} disabled={cargando || sinDatosConsultados}><i className="bi bi-file-earmark-excel-fill" /> Descargar Excel</button></div>
      {cargando ? <div className="admin-reports__loading"><span /> Preparando informe…</div> : <>
        {tipo === "actividad" && <><div className="admin-reports__metrics"><Indicador icon="bi-bell-fill" label="Alertas recibidas" value={formato(alertas.length)} detail="Total en el periodo" tone="blue" /><Indicador icon="bi-check-circle-fill" label="Cerradas o atendidas" value={formato(resueltas)} detail={`${alertas.length ? Math.round(resueltas / alertas.length * 100) : 0}% del total`} tone="green" /><Indicador icon="bi-exclamation-octagon-fill" label="Prioridad alta" value={formato(alertas.filter((a) => norm(a.prioridad) === "ALTA").length)} detail="Requieren atención prioritaria" tone="red" /></div><div className="admin-reports__grid"><Distribucion titulo="Alertas por tipo" detalle="Principales categorías reportadas" filas={tiposAlerta} total={alertas.length} /><Distribucion titulo="Alertas por estado" detalle="Estado actual de los registros" filas={estados} total={alertas.length} /><Distribucion titulo="Alertas por prioridad" detalle="Distribución según nivel de atención" filas={prioridades} total={alertas.length} /></div></>}
        {tipo === "atencion" && <><div className="admin-reports__metrics"><Indicador icon="bi-headset" label="Atenciones registradas" value={formato(atenciones.length)} detail="En el periodo seleccionado" tone="violet" /><Indicador icon="bi-send-check-fill" label="Asignaciones realizadas" value={formato(asignaciones.length)} detail="En el periodo seleccionado" tone="blue" /><Indicador icon="bi-arrow-repeat" label="Atenciones por alerta" value={alertas.length ? (atenciones.length / alertas.length).toLocaleString("es-CO", { maximumFractionDigits: 2 }) : "0"} detail="Promedio del periodo" tone="green" /></div><div className="admin-reports__grid admin-reports__grid--two"><Distribucion titulo="Atenciones por estado" detalle="Distribución de las intervenciones registradas" filas={agrupar(atenciones, (x) => x.estado)} total={atenciones.length} /><Distribucion titulo="Asignaciones por estado" detalle="Distribución de los despachos registrados" filas={agrupar(asignaciones, (x) => x.estado)} total={asignaciones.length} /></div></>}
        {tipo === "recursos" && <><div className="admin-reports__metrics"><Indicador icon="bi-people-fill" label="Personal registrado" value={formato(pol.length)} detail={`${formato(personalDisponible)} activos o disponibles`} tone="blue" /><Indicador icon="bi-truck-front-fill" label="Unidades registradas" value={formato(unidades.length)} detail={`${formato(unidadesDisponibles)} activas o disponibles`} tone="green" /><Indicador icon="bi-broadcast-pin" label="Alarmas registradas" value={formato(alarmas.length)} detail="Total en el sistema" tone="amber" /></div><div className="admin-reports__grid admin-reports__grid--two"><Distribucion titulo="Estado del personal" detalle="Disponibilidad del recurso policial" filas={agrupar(pol, (x) => x.estado)} total={pol.length} /><Distribucion titulo="Estado de las unidades" detalle="Disponibilidad de unidades operativas" filas={agrupar(unidades, (x) => x.estado)} total={unidades.length} /></div></>}
      </>}</section>
    <footer className="admin-reports__footer"><span><i className="bi bi-shield-check" /> Información consultada desde Wolert</span><span>Actualizado: {actualizacion}</span></footer>
  </main>;
}
