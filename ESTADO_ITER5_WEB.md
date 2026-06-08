# ESTADO ITERACIÓN 5 — Exportador PDF y Excel
**Fecha:** COMPLETADA
**Estado:** ✅ COMPLETADA

## Archivos creados / modificados
| Archivo | Acción |
|---------|--------|
| src/utils/exportPDF.js   | ✨ Nuevo — lógica PDF con jsPDF + html2canvas |
| src/utils/exportExcel.js | ✨ Nuevo — lógica Excel con SheetJS (6 hojas) |
| src/pages/Indicadores.jsx | ✏️ Modificado — refs + handlers + barra + toast |
| src/pages/Indicadores.css | ✏️ Modificado — estilos barra y toast |

## Funcionalidades
- Barra sticky bajo el Hero con botones PDF (cian) y Excel (dorado)
- PDF: portada + 6 secciones capturadas visualmente + pie de página
- Excel: 6 hojas (Sistema, Bancos, Historico, Departamental, Comparacion, Calculadoras)
- Estado de carga (spinner) mientras genera
- Toast de confirmación al terminar

## Próxima iteración
Iteración 6 — Simulador IA (/simulador) con Claude API
