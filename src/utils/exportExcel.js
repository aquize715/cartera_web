// src/utils/exportExcel.js
import * as XLSX from "xlsx";

function pct(v) {
  if (v == null || v === "") return "";
  return (v < 1 ? v * 100 : v).toFixed(4);
}

function autoAncho(ws, datos) {
  if (!datos?.length) return;
  ws["!cols"] = Object.keys(datos[0]).map((k) => ({
    wch: Math.min(Math.max(k.length, ...datos.map((r) => String(r[k] ?? "").length)) + 2, 40),
  }));
}

function hoja(datos) {
  if (!datos?.length) return XLSX.utils.aoa_to_sheet([["Sin datos disponibles"]]);
  const ws = XLSX.utils.json_to_sheet(datos);
  autoAncho(ws, datos);
  return ws;
}

function hojaSistema(d) {
  const filas = [];
  Object.entries(d?.serie_historica ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([periodo, data]) => {
      const ind = data?.TOTAL_SISTEMA?.indicadores ?? data?.indicadores?.TOTAL_SISTEMA ?? {};
      const cap = data?.TOTAL_SISTEMA?.ponderacion_cap ?? data?.ponderacion_cap?.TOTAL_SISTEMA ?? {};
      const ef  = data?.TOTAL_SISTEMA?.estados_financieros ?? data?.estados_financieros?.TOTAL_SISTEMA ?? {};
      filas.push({
        "Período": periodo,
        "Cartera Total (miles Bs.)": ef.cartera_total ?? "",
        "Cartera Vigente (%)": pct(ind.cartera_vigente_pct),
        "Índice Morosidad (%)": pct(ind.mora_pct),
        "Cartera Reprog. (%)": pct(ind.cartera_reprog_pct),
        "Previsión Incobrable (%)": pct(ind.prev_incobrable_pct),
        "CAP (%)": pct(cap.cap_pct),
      });
    });
  return hoja(filas);
}

function hojaBancos(d) {
  const filas = [];
  const BANCOS = ["BNB","BUN","BME","BIS","BCR","BGA","BEC","BSO","BNA","BIE","BFO","BPR","TOTAL_SISTEMA"];
  Object.entries(d?.serie_historica ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([periodo, data]) => {
      BANCOS.forEach((banco) => {
        const ind = data?.indicadores?.[banco] ?? {};
        const cap = data?.ponderacion_cap?.[banco] ?? {};
        const ef  = data?.estados_financieros?.[banco] ?? {};
        if (!ind.mora_pct && !cap.cap_pct) return;
        filas.push({
          "Período": periodo,
          "Banco": banco,
          "Cartera Total (miles Bs.)": ef.cartera_total ?? "",
          "Índice Morosidad (%)": pct(ind.mora_pct),
          "Cartera Vigente (%)": pct(ind.cartera_vigente_pct),
          "Cartera Reprog. (%)": pct(ind.cartera_reprog_pct),
          "Previsión Incobrable (%)": pct(ind.prev_incobrable_pct),
          "CAP (%)": pct(cap.cap_pct),
        });
      });
    });
  return hoja(filas);
}

function hojaHistorico(d) {
  const filas = [];
  Object.entries(d?.serie_historica ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([periodo, data]) => {
      const ind = data?.indicadores?.TOTAL_SISTEMA ?? {};
      const cap = data?.ponderacion_cap?.TOTAL_SISTEMA ?? {};
      const ef  = data?.estados_financieros?.TOTAL_SISTEMA ?? {};
      filas.push({
        "Período": periodo,
        "Año": periodo.slice(0, 4),
        "Mes": periodo.slice(5, 7),
        "Cartera Total (miles Bs.)": ef.cartera_total ?? "",
        "Índice Morosidad (%)": pct(ind.mora_pct),
        "Cartera Vigente (%)": pct(ind.cartera_vigente_pct),
        "Cartera Reprog. (%)": pct(ind.cartera_reprog_pct),
        "Previsión Incobrable (%)": pct(ind.prev_incobrable_pct),
        "CAP (%)": pct(cap.cap_pct),
      });
    });
  return hoja(filas);
}

function hojaDepartamental(d) {
  const filas = [];
  const DEPTOS = ["LA_PAZ","SANTA_CRUZ","COCHABAMBA","ORURO","POTOSI","CHUQUISACA","TARIJA","BENI","PANDO","TOTAL"];
  Object.entries(d?.serie_historica ?? {})
    .filter(([p]) => p.endsWith("-12"))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([periodo, data]) => {
      DEPTOS.forEach((dep) => {
        const dd = data?.cartera_departamental?.TOTAL?.[dep] ?? data?.cartera_departamental?.[dep] ?? {};
        if (!Object.keys(dd).length) return;
        filas.push({
          "Período": periodo,
          "Departamento": dep.replace("_", " "),
          "Cartera Vigente": dd.cartera_vigente ?? "",
          "Cartera Reprog. Vigente": dd.cartera_reprog_vigente ?? "",
          "Cartera Vencida": dd.cartera_vencida ?? "",
          "Cartera Reprog. Vencida": dd.cartera_reprog_vencida ?? "",
          "Cartera Ejecución": dd.cartera_ejecucion ?? "",
          "Cartera Reprog. Ejecución": dd.cartera_reprog_ejecucion ?? "",
          "Cartera Contingente": dd.cartera_contingente ?? "",
          "Obligaciones al Público": dd.obligaciones_publico ?? "",
          "Previsión": dd.prevision ?? "",
        });
      });
    });
  return hoja(filas);
}

export function exportarExcel(datosASFI, datosComparacion = [], datosCalcs = []) {
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Cartera de Créditos — Sistema Financiero Boliviano",
    Author: "Grupo 1 · UMSA · Finanzas y Operaciones Bancarias",
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(wb, hojaSistema(datosASFI),       "Sistema");
  XLSX.utils.book_append_sheet(wb, hojaBancos(datosASFI),        "Bancos");
  XLSX.utils.book_append_sheet(wb, hojaHistorico(datosASFI),     "Historico");
  XLSX.utils.book_append_sheet(wb, hojaDepartamental(datosASFI), "Departamental");
  XLSX.utils.book_append_sheet(wb,
    hoja(datosComparacion.length ? datosComparacion : [{ "Info": "No se realizó comparación banco vs banco." }]),
    "Comparacion"
  );
  XLSX.utils.book_append_sheet(wb,
    hoja(datosCalcs.length ? datosCalcs : [{ "Info": "No se utilizaron calculadoras en esta sesión." }]),
    "Calculadoras"
  );
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Datos_Cartera_Bolivia_${fecha}.xlsx`);
}
