// src/utils/exportPDF.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CYAN  = [0, 229, 255];
const GOLD  = [196, 160, 80];
const DARK  = [13, 15, 20];
const CARD  = [19, 21, 28];
const TEXT  = [240, 240, 240];
const MUTED = [120, 120, 140];

/**
 * Captura un elemento y recorta el espacio negro inferior vacío.
 * Detecta la última fila de píxeles con contenido real (no fondo puro).
 */
async function capturarSeccion(el) {
  const altReal = el.scrollHeight;

  const canvas = await html2canvas(el, {
    backgroundColor: "#13151C",
    scale: 1.5,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    height: altReal,
    windowHeight: altReal,
  });

  return recortarCanvasInferior(canvas);
}

/**
 * Elimina filas de píxeles del fondo vacío al final del canvas.
 * Recorre desde abajo hacia arriba buscando la primera fila con contenido.
 */
function recortarCanvasInferior(canvas) {
  const ctx  = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const BG  = [19, 21, 28];
  const TOL = 8;

  let ultimaFilaConContenido = 0;

  for (let y = canvas.height - 1; y >= 0; y--) {
    let filaVacia = true;
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (
        Math.abs(r - BG[0]) > TOL ||
        Math.abs(g - BG[1]) > TOL ||
        Math.abs(b - BG[2]) > TOL
      ) {
        filaVacia = false;
        break;
      }
    }
    if (!filaVacia) {
      ultimaFilaConContenido = y;
      break;
    }
  }

  const altoRecortado = Math.min(ultimaFilaConContenido + 20, canvas.height);

  const recortado = document.createElement("canvas");
  recortado.width  = canvas.width;
  recortado.height = altoRecortado;
  const ctxR = recortado.getContext("2d");
  ctxR.drawImage(canvas, 0, 0, canvas.width, altoRecortado, 0, 0, canvas.width, altoRecortado);
  return recortado;
}

function pieDePagina(doc, n) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.2);
  doc.line(15, H - 14, W - 15, H - 14);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Grupo 1 · UMSA · Fuente: ASFI · Ley N° 393", 15, H - 8);
  doc.text(`Pág. ${n}`, W - 15, H - 8, { align: "right" });
}

function dibujarPortada(doc, fecha) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 0, W, 4, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, H - 4, W, 4, "F");
  doc.setTextColor(...CYAN);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("CARTERA DE CRÉDITOS", W / 2, 60, { align: "center" });
  doc.setTextColor(...TEXT);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema Financiero Boliviano", W / 2, 74, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(30, 85, W - 30, 85);
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  const meta = [
    `Fecha de generación: ${fecha}`,
    "Fuente de datos: ASFI — Autoridad de Supervisión del Sistema Financiero",
    "Normativa: Ley N° 393 de Servicios Financieros",
    "Banco Central de Bolivia (BCB)",
  ];
  meta.forEach((l, i) => doc.text(l, W / 2, 100 + i * 10, { align: "center" }));
  doc.setFillColor(...CARD);
  doc.roundedRect(W / 2 - 55, 148, 110, 22, 3, 3, "F");
  doc.setTextColor(...GOLD);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("GRUPO 1 · UMSA", W / 2, 157, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Finanzas y Operaciones Bancarias", W / 2, 164, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text("Adm. de Empresas · UMSA · La Paz, Bolivia", W / 2, H - 20, { align: "center" });
}

function agregarImagenSeccion(doc, canvas, titulo, n) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const HEADER_H = 18;
  const MARGEN   = 10;
  const PIE_H    = 20;
  const TOP      = HEADER_H + 4;

  const anchoDisponible  = W - MARGEN * 2;
  const altoMaxPorPagina = H - TOP - PIE_H;

  const ratio    = canvas.height / canvas.width;
  const altoReal = anchoDisponible * ratio;

  const imgData = canvas.toDataURL("image/png");

  // ── Cabe en una sola página ───────────────────────────────────────────────
  if (altoReal <= altoMaxPorPagina) {
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...CARD);
    doc.rect(0, 0, W, HEADER_H, "F");
    doc.setDrawColor(...CYAN);
    doc.setLineWidth(0.4);
    doc.line(0, HEADER_H, W, HEADER_H);
    doc.setTextColor(...CYAN);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 15, 12);
    doc.addImage(imgData, "PNG", MARGEN, TOP, anchoDisponible, altoReal, undefined, "FAST");
    pieDePagina(doc, n);
    return n;
  }

  // ── No cabe: dividir en slices ────────────────────────────────────────────
  const pixelesPorPagina = Math.floor((altoMaxPorPagina / altoReal) * canvas.height);
  let offsetPx     = 0;
  let paginaActual = n;
  let primeraVez   = true;

  while (offsetPx < canvas.height) {
    const altoSlicePx = Math.min(pixelesPorPagina, canvas.height - offsetPx);
    const sliceCanvas    = document.createElement("canvas");
    sliceCanvas.width    = canvas.width;
    sliceCanvas.height   = altoSlicePx;
    const ctx = sliceCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, offsetPx, canvas.width, altoSlicePx, 0, 0, canvas.width, altoSlicePx);
    const sliceData   = sliceCanvas.toDataURL("image/png");
    const altoSliceMM = (altoSlicePx / canvas.height) * altoReal;

    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, H, "F");

    if (primeraVez) {
      doc.setFillColor(...CARD);
      doc.rect(0, 0, W, HEADER_H, "F");
      doc.setDrawColor(...CYAN);
      doc.setLineWidth(0.4);
      doc.line(0, HEADER_H, W, HEADER_H);
      doc.setTextColor(...CYAN);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(titulo, 15, 12);
      primeraVez = false;
    }

    doc.addImage(sliceData, "PNG", MARGEN, TOP, anchoDisponible, altoSliceMM, undefined, "FAST");
    pieDePagina(doc, paginaActual);

    offsetPx     += altoSlicePx;
    paginaActual += 1;
  }

  return paginaActual - 1;
}

export async function exportarPDF(refs) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const fecha = new Date().toLocaleDateString("es-BO", {
    year: "numeric", month: "long", day: "numeric",
  });
  const fechaArchivo = new Date().toISOString().slice(0, 10);
  let pagina = 1;

  dibujarPortada(doc, fecha);
  pieDePagina(doc, pagina);

  const secciones = [
    { ref: refs.refCards,        titulo: "Indicadores del Sistema Financiero" },
    { ref: refs.refMapa,         titulo: "Distribución Departamental de Cartera" },
    { ref: refs.refHistorico,    titulo: "Evolución Histórica de Indicadores" },
    { ref: refs.refComparacion,  titulo: "Comparación Banco vs Banco" },
    { ref: refs.refFechas,       titulo: "Comparación por Períodos" },
    { ref: refs.refCalculadoras, titulo: "Resultados de Calculadoras" },
  ];

  for (const s of secciones) {
    if (!s.ref?.current) continue;
    if (s.ref === refs.refCalculadoras) {
      if (!s.ref.current.querySelector(".calc-resultado")) continue;
    }
    pagina++;
    const canvas = await capturarSeccion(s.ref.current);
    pagina = agregarImagenSeccion(doc, canvas, s.titulo, pagina);
  }

  doc.save(`Reporte_Cartera_Bolivia_${fechaArchivo}.pdf`);
}
