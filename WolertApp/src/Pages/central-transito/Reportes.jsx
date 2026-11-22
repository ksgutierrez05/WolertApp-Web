
import { useEffect, useMemo, useState } from "react";
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
  fechaCentral,
  fechaRegistroCentral,
  tipoCentral,
  lugarCentral,
  idAtencionCentral,
  idAgenteCentral,
  idAlertaCentral,
  nombreAgenteCentral,
} from "../../Services/centralTransitoService";

import "../../css/transito/central-transito/panel-atencion-transito.css";

// Archivo ubicado en public/img/
const LOGO_TRANSITO = "/img/secretaria%20transito.png";

const AZUL = [23, 63, 101];
const AZUL_CLARO = [235, 242, 248];
const GRIS = [75, 85, 95];

function lista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function textoSeguro(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "No registrado";
  }

  return String(valor);
}

function fechaCierre(atencion) {
  return (
    atencion?.fechaFinalizacion ||
    atencion?.fechaCierre ||
    atencion?.fechaFin ||
    atencion?.fechaAtencion ||
    fechaRegistroCentral(atencion)
  );
}

function numeroInforme(caso) {
  return `WLT-TRA-AT-${String(caso.id).padStart(5, "0")}`;
}

function fechaExportacion() {
  return new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function cargarLogo() {
  const respuesta = await fetch(LOGO_TRANSITO);

  if (!respuesta.ok) {
    throw new Error("No se encontró el logo de tránsito.");
  }

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

    imagen.onload = () => {
      resolve({
        ancho: imagen.naturalWidth,
        alto: imagen.naturalHeight,
      });
    };

    imagen.onerror = () => reject(new Error("Imagen no válida."));
    imagen.src = dataUrl;
  });
}

// ======================================================
// GENERAR INFORME INDIVIDUAL EN PDF
// ======================================================

async function generarPDF(caso, responsable) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

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

    const maxAncho = 29;
    const maxAlto = 27;

    const escala = Math.min(
      maxAncho / dimensiones.ancho,
      maxAlto / dimensiones.alto
    );

    const imagenAncho = dimensiones.ancho * escala;
    const imagenAlto = dimensiones.alto * escala;

    const formato = imagen.startsWith("data:image/png")
      ? "PNG"
      : imagen.startsWith("data:image/jpeg")
        ? "JPEG"
        : "PNG";

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

  const centroEncabezado =
    margen + 36 + (anchoContenido - 36) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...AZUL);

  doc.text(
    "ALCALDÍA MUNICIPAL DE VALLEDUPAR",
    centroEncabezado,
    23,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.text(
    "SECRETARÍA DE TRÁNSITO",
    centroEncabezado,
    31,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.text(
    "INFORME DE ATENCIÓN DE INCIDENTE",
    centroEncabezado,
    39,
    { align: "center" }
  );

  let y = 54;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);

  doc.text(`Código: ${codigo}`, margen, y);

  doc.text(
    `Fecha de emisión: ${fechaEmision}`,
    ancho - margen,
    y,
    { align: "right" }
  );

  y += 9;

  doc.setFillColor(...AZUL);
  doc.rect(margen, y, anchoContenido, 11, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);

  doc.text(
    "INFORME INSTITUCIONAL DE ATENCIÓN",
    ancho / 2,
    y + 7.3,
    { align: "center" }
  );

  y += 16;

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
    margin: {
      left: margen,
      right: margen,
      bottom: 29,
    },
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
    headStyles: {
      fillColor: AZUL,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: {
        cellWidth: 55,
        fillColor: AZUL_CLARO,
        fontStyle: "bold",
      },
      1: {
        cellWidth: anchoContenido - 55,
      },
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
    const texto = textoSeguro(contenido);

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

    const lineas = doc.splitTextToSize(
      texto,
      anchoContenido - 8
    );

    for (const linea of lineas) {
      nuevaPaginaSiHaceFalta(6);

      doc.text(linea, margen + 3, y);
      y += 4.8;
    }

    y += 9;
  }

  agregarSeccion(
    "2. DESCRIPCIÓN DE LOS HECHOS",
    caso.descripcionAlerta
  );

  agregarSeccion(
    "3. ACTUACIONES REALIZADAS",
    caso.descripcion
  );

  agregarSeccion(
    "4. OBSERVACIONES REGISTRADAS",
    caso.observacion
  );

  agregarSeccion(
    "5. RESULTADO DE LA ATENCIÓN",
    `La atención registra como estado final: ${textoSeguro(
      caso.estadoFinal
    )}.`
  );

  nuevaPaginaSiHaceFalta(64);

  doc.setFillColor(...AZUL_CLARO);
  doc.rect(margen, y, anchoContenido, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...AZUL);

  doc.text(
    "6. RESPONSABLE DE LA ENTREGA DEL INFORME",
    margen + 3,
    y + 6
  );

  y += 15;

  doc.setFontSize(9);
  doc.setTextColor(45, 55, 65);

  doc.setFont("helvetica", "bold");
  doc.text("Nombre completo:", margen + 3, y);

  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(responsable.nombre, anchoContenido - 45),
    margen + 39,
    y
  );

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.text("Cargo:", margen + 3, y);

  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(responsable.cargo, anchoContenido - 45),
    margen + 39,
    y
  );

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

  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);

    doc.setDrawColor(205, 215, 225);
    doc.line(margen, alto - 21, ancho - margen, alto - 21);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);

    doc.text(
      "Generado mediante WolertApp a partir de registros del sistema.",
      margen,
      alto - 15
    );

    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      ancho - margen,
      alto - 15,
      { align: "right" }
    );

    doc.setFontSize(7);
    doc.text(
      "Documento sujeto a validación institucional.",
      margen,
      alto - 10
    );
  }

  doc.save(`Informe_${codigo}.pdf`);
}

// ======================================================
// EXPORTAR TODAS LAS ATENCIONES FINALIZADAS A EXCEL
// ======================================================

async function exportarCasosExcel(casos) {
  const libro = new ExcelJS.Workbook();

  libro.creator = "WolertApp";
  libro.subject = "Registro de atenciones de tránsito";
  libro.title = "Informe de casos finalizados";
  libro.created = new Date();

  const hoja = libro.addWorksheet("Casos de tránsito", {
    views: [
      {
        state: "frozen",
        ySplit: 5,
      },
    ],
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
    {
      header: "Descripción del incidente",
      key: "descripcionAlerta",
      width: 55,
    },
    {
      header: "Actuaciones realizadas",
      key: "descripcion",
      width: 55,
    },
    {
      header: "Observaciones",
      key: "observacion",
      width: 55,
    },
  ];

  hoja.columns = columnas;

  // Encabezado institucional
  hoja.mergeCells("A1:L2");

  const titulo = hoja.getCell("A1");

  titulo.value =
    "SECRETARÍA DE TRÁNSITO - VALLEDUPAR\n" +
    "REGISTRO DE CASOS FINALIZADOS";

  titulo.font = {
    name: "Aptos Display",
    size: 16,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  titulo.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF173F65" },
  };

  titulo.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  hoja.getRow(1).height = 25;
  hoja.getRow(2).height = 25;

  // Fecha y cantidad de registros
  hoja.mergeCells("A3:L3");

  const subtitulo = hoja.getCell("A3");

  subtitulo.value =
    `Fecha de exportación: ${fechaExportacion()} | ` +
    `Total de atenciones: ${casos.length}`;

  subtitulo.font = {
    name: "Aptos",
    size: 11,
    italic: true,
    color: { argb: "FF475569" },
  };

  subtitulo.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  hoja.getRow(3).height = 25;
  hoja.getRow(4).height = 12;

  // Encabezados de la tabla
  const filaEncabezados = hoja.getRow(5);

  columnas.forEach((columna, indice) => {
    const celda = filaEncabezados.getCell(indice + 1);

    celda.value = columna.header;

    celda.font = {
      name: "Aptos",
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 10,
    };

    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2D609C" },
    };

    celda.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    celda.border = {
      bottom: {
        style: "thin",
        color: { argb: "FF173F65" },
      },
    };
  });

  filaEncabezados.height = 32;

  // Evita que valores de texto sean interpretados
  // como fórmulas al abrir el archivo.
  function valorExcel(valor) {
    if (valor === null || valor === undefined) return "";

    const texto = String(valor);

    if (/^[\s]*[=+\-@]/.test(texto)) {
      return `'${texto}`;
    }

    return texto;
  }

  // Datos de los casos
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
      celda.alignment = {
        vertical: "middle",
        wrapText: true,
      };

      celda.font = {
        name: "Aptos",
        size: 10,
        color: { argb: "FF334155" },
      };

      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb:
            indice % 2 === 0
              ? "FFFFFFFF"
              : "FFF0F5FA",
        },
      };

      celda.border = {
        bottom: {
          style: "hair",
          color: { argb: "FFDCE5ED" },
        },
      };
    });
  });

  // Filtros en Excel
  hoja.autoFilter = {
    from: "A5",
    to: `L${Math.max(6, casos.length + 5)}`,
  };

  // Configuración para impresión
  hoja.pageSetup = {
    orientation: "landscape",
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  hoja.headerFooter.oddFooter =
    "WolertApp - Registro de atenciones de tránsito | Página &P de &N";

  // Generar y descargar archivo
  const buffer = await libro.xlsx.writeBuffer();

  const archivo = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fecha = new Date().toISOString().slice(0, 10);

  saveAs(
    archivo,
    `Informe_Casos_Transito_${fecha}.xlsx`
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function Informes() {
  const [atenciones, setAtenciones] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);

  const [seleccionado, setSeleccionado] = useState(null);

  const [nombreResponsable, setNombreResponsable] = useState("");
  const [cargoResponsable, setCargoResponsable] = useState("");

  const [generando, setGenerando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [errorPDF, setErrorPDF] = useState("");
  const [errorExcel, setErrorExcel] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);

      const resultados = await Promise.allSettled([
        listarAtencionesCentral(),
        listarAgentesCentral(),
        listarAlertasCentral(),
      ]);

      if (!activo) return;

      const [rAtenciones, rAgentes, rAlertas] = resultados;
      const mensajes = [];

      if (rAtenciones.status === "fulfilled") {
        setAtenciones(lista(rAtenciones.value));
      } else {
        mensajes.push("No se pudieron consultar las atenciones.");
      }

      if (rAgentes.status === "fulfilled") {
        setAgentes(lista(rAgentes.value));
      } else {
        mensajes.push("No se pudieron consultar los agentes.");
      }

      if (rAlertas.status === "fulfilled") {
        setAlertas(lista(rAlertas.value));
      } else {
        mensajes.push("No se pudieron consultar las alertas.");
      }

      setErrores(mensajes);
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  // Construcción de casos finalizados
  const casos = useMemo(() => {
    return atenciones
      .filter(finalizadaCentral)
      .map((atencion) => {
        const idAgente =
          atencion.idAgenteTransito ??
          atencion.agenteTransitoId;

        const agente = agentes.find(
          (item) =>
            idAgente != null &&
            String(idAgenteCentral(item)) === String(idAgente)
        );

        const idAlerta =
          atencion.idAlerta ??
          atencion.alertaId;

        const alerta = alertas.find(
          (item) =>
            idAlerta != null &&
            String(idAlertaCentral(item)) === String(idAlerta)
        );

        const origen = alerta || atencion;

        return {
          id: idAtencionCentral(atencion),
          idAlerta,
          idUnidad:
            atencion.idUnidadTransito ??
            atencion.unidadTransitoId,
          idAsignacion: atencion.idAsignacion,
          tipo: tipoCentral(origen),
          barrio: lugarCentral(origen),
          agente: agente
            ? nombreAgenteCentral(agente)
            : atencion.nombreAgente || "No identificado",
          cierre: fechaCentral(fechaCierre(atencion)),
          estadoFinal:
            atencion.estadoFinal ||
            atencion.estado ||
            "No registrado",
          descripcionAlerta: alerta?.descripcion || "",
          descripcion: atencion.descripcion || "",
          observacion: atencion.observacion || "",
        };
      });
  }, [atenciones, agentes, alertas]);

  // Filtrado para la tabla de la página
  const filas = useMemo(() => {
    const busqueda = buscar.trim().toLocaleLowerCase("es-CO");

    return casos.filter((caso) =>
      [
        caso.id,
        caso.idAlerta,
        caso.tipo,
        caso.barrio,
        caso.agente,
        caso.cierre,
        caso.estadoFinal,
      ]
        .join(" ")
        .toLocaleLowerCase("es-CO")
        .includes(busqueda)
    );
  }, [casos, buscar]);

  function abrirFormulario(caso) {
    setSeleccionado(caso);
    setNombreResponsable("");
    setCargoResponsable("");
    setErrorPDF("");
  }

  function cerrarFormulario() {
    if (generando) return;

    setSeleccionado(null);
    setNombreResponsable("");
    setCargoResponsable("");
    setErrorPDF("");
  }

  async function descargarInforme(evento) {
    evento.preventDefault();

    if (!seleccionado || generando) return;

    const nombre = nombreResponsable.trim();
    const cargo = cargoResponsable.trim();

    if (!nombre || !cargo) {
      setErrorPDF("Ingresa el nombre y cargo del responsable.");
      return;
    }

    setGenerando(true);
    setErrorPDF("");

    try {
      await generarPDF(seleccionado, {
        nombre,
        cargo,
      });

      setSeleccionado(null);
      setNombreResponsable("");
      setCargoResponsable("");
    } catch (error) {
      console.error("Error generando PDF:", error);

      setErrorPDF(
        "No fue posible generar el informe. Inténtalo nuevamente."
      );
    } finally {
      setGenerando(false);
    }
  }

  async function descargarExcel() {
    if (exportando || casos.length === 0) return;

    setExportando(true);
    setErrorExcel("");

    try {
      // Se exportan todos los casos, no solamente
      // los que aparecen después de buscar.
      await exportarCasosExcel(casos);
    } catch (error) {
      console.error("Error exportando Excel:", error);

      setErrorExcel(
        "No se pudo generar el archivo Excel. Inténtalo nuevamente."
      );
    } finally {
      setExportando(false);
    }
  }

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
          <span className="st-eyebrow">
            CENTRAL DE TRÁNSITO
          </span>

          <h1>Informes de casos</h1>

          <p>
            Consulta las atenciones finalizadas, genera informes
            institucionales en PDF y exporta el registro
            completo a Excel.
          </p>
        </div>
      </header>

      {cargando && (
        <div className="alert alert-info">
          Cargando atenciones finalizadas...
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-warning">
          {errores.join(" ")}
        </div>
      )}

      {errorExcel && (
        <div className="alert alert-danger">
          {errorExcel}
        </div>
      )}

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h2 className="panel-title-dash mb-1">
              Registro de atenciones finalizadas
            </h2>

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
              disabled={
                exportando ||
                cargando ||
                casos.length === 0
              }
            >
              <i className="bi bi-file-earmark-excel me-2" />

              {exportando
                ? "Exportando..."
                : "Exportar todos a Excel"}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
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
                    <strong>
                      #{caso.id ?? "S/N"}
                    </strong>
                  </td>

                  <td>{caso.tipo}</td>

                  <td>{caso.barrio}</td>

                  <td>{caso.agente}</td>

                  <td>{caso.cierre}</td>

                  <td>
                    <span className="badge bg-success">
                      {caso.estadoFinal}
                    </span>
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
          <p
            className="text-center text-muted small mb-0"
            style={{ padding: 24 }}
          >
            No se encontraron atenciones finalizadas.
          </p>
        )}
      </div>

      {seleccionado && (
        <div className="panel-card-dash mt-4">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h2 className="panel-title-dash mb-1">
                Generar informe institucional
              </h2>

              <p className="text-muted small mb-0">
                Atención #{seleccionado.id} · Alerta #
                {seleccionado.idAlerta}
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

          <div className="alert alert-info small">
            El informe incluirá los datos registrados del caso,
            el logo de la Secretaría de Tránsito y la información
            de quien entrega el documento.
          </div>

          <form onSubmit={descargarInforme}>
            <div className="row g-3">
              <div className="col-md-6">
                <label
                  className="config-field-label-dash"
                  htmlFor="nombreResponsableInforme"
                >
                  Nombre completo de quien entrega
                </label>

                <input
                  id="nombreResponsableInforme"
                  type="text"
                  className="form-control"
                  placeholder="Nombre y apellidos"
                  value={nombreResponsable}
                  onChange={(e) =>
                    setNombreResponsable(e.target.value)
                  }
                  maxLength={120}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  className="config-field-label-dash"
                  htmlFor="cargoResponsableInforme"
                >
                  Cargo del responsable
                </label>

                <input
                  id="cargoResponsableInforme"
                  type="text"
                  className="form-control"
                  placeholder="Ej. Operador de Central de Tránsito"
                  value={cargoResponsable}
                  onChange={(e) =>
                    setCargoResponsable(e.target.value)
                  }
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-12">
                <div className="p-3 rounded bg-light">
                  <p className="fw-semibold mb-2">
                    Información que incluirá el documento
                  </p>

                  <p className="small mb-1">
                    <strong>Incidente:</strong>{" "}
                    {seleccionado.tipo}
                  </p>

                  <p className="small mb-1">
                    <strong>Ubicación:</strong>{" "}
                    {seleccionado.barrio}
                  </p>

                  <p className="small mb-1">
                    <strong>Agente:</strong>{" "}
                    {seleccionado.agente}
                  </p>

                  <p className="small mb-0">
                    <strong>Estado:</strong>{" "}
                    {seleccionado.estadoFinal}
                  </p>
                </div>
              </div>

              {errorPDF && (
                <div className="col-12">
                  <div className="alert alert-danger mb-0">
                    {errorPDF}
                  </div>
                </div>
              )}

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

                  {generando
                    ? "Generando documento..."
                    : "Descargar informe PDF"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
