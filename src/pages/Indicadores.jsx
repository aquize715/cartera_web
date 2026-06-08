import { useState, useMemo, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import datosASFI from "../data/datos_asfi.json";
import { exportarPDF }   from "../utils/exportPDF";
import { exportarExcel } from "../utils/exportExcel";
import "./Indicadores.css";

// ── CONSTANTES ────────────────────────────────────────────────────────────────

const BANCOS = {
  BNB:          { nombre: "Banco Nacional de Bolivia S.A.",                       corto: "Nac. Bolivia",  color: "#4CAF50", colorAlt: "#7B3FA1" },
  BUN:          { nombre: "Banco Unión S.A.",                                     corto: "Unión",         color: "#D32F2F", colorAlt: "#FBC02D" },
  BME:          { nombre: "Banco Mercantil Santa Cruz S.A.",                      corto: "Mercantil SC",  color: "#005B9F", colorAlt: "#4FC3F7" },
  BIS:          { nombre: "Banco BISA S.A.",                                      corto: "BISA",          color: "#0D3B66", colorAlt: "#4FC3F7" },
  BCR:          { nombre: "Banco de Crédito de Bolivia S.A.",                     corto: "Crédito",       color: "#1565C0", colorAlt: "#81D4FA" },
  BGA:          { nombre: "Banco Ganadero S.A.",                                  corto: "Ganadero",      color: "#2E7D32", colorAlt: "#FBC02D" },
  BEC:          { nombre: "Banco Económico S.A.",                                 corto: "Económico",     color: "#1976D2", colorAlt: "#81D4FA" },
  BSO:          { nombre: "Banco Solidario S.A.",                                 corto: "BancoSol",      color: "#F57C00", colorAlt: "#1565C0" },
  BNA:          { nombre: "Banco de la Nación Argentina",                         corto: "Nación Arg.",   color: "#4FC3F7", colorAlt: "#1565C0" },
  BIE:          { nombre: "Banco para el Fomento a Iniciativas Económicas S.A.",  corto: "BancoFIE",      color: "#1E88E5", colorAlt: "#43A047" },
  BFO:          { nombre: "Banco Fortaleza S.A.",                                 corto: "Fortaleza",     color: "#C62828", colorAlt: "#B0B0B0" },
  BPR:          { nombre: "Banco Prodem S.A.",                                    corto: "Prodem",        color: "#EF6C00", colorAlt: "#1565C0" },
  TOTAL_SISTEMA:{ nombre: "Total Sistema",                                        corto: "Sistema",       color: "#00E5FF", colorAlt: "#C4A050" },
};

const INDICADORES = [
  { key: "mora_pct",             label: "Índice de Mora",          unidad: "%" },
  { key: "cartera_vigente_pct",  label: "Cartera Vigente",         unidad: "%" },
  { key: "cartera_reprog_pct",   label: "Cartera Reprogramada",    unidad: "%" },
  { key: "cap_pct",              label: "CAP",                     unidad: "%" },
  { key: "prev_incobrable_pct",  label: "Previsión Incobrable",    unidad: "%" },
];

// Indicadores donde subir es favorable (para semáforo de sección 6)
const FAVORABLE_SUBE = new Set(["cartera_vigente_pct", "cap_pct"]);

// ── DEPARTAMENTOS — MAPA BOLIVIA ──────────────────────────────────────────────

const DEPARTAMENTOS = {
  LA_PAZ:     { nombre: "La Paz",      cx: 76.2,  cy: 260.4 },
  ORURO:      { nombre: "Oruro",       cx: 94.8,  cy: 390.6 },
  POTOSI:     { nombre: "Potosí",      cx: 145.2, cy: 480.0 },
  TARIJA:     { nombre: "Tarija",      cx: 235.0, cy: 530.0 },
  SANTA_CRUZ: { nombre: "Santa Cruz",  cx: 360.0, cy: 360.0 },
  CHUQUISACA: { nombre: "Chuquisaca",  cx: 220.0, cy: 455.0 },
  PANDO:      { nombre: "Pando",       cx: 115.0, cy: 75.0  },
  BENI:       { nombre: "Beni",        cx: 210.0, cy: 175.0 },
  COCHABAMBA: { nombre: "Cochabamba",  cx: 175.0, cy: 340.0 },
};

const DEPTO_PATHS = {
  LA_PAZ:     "M 34.2,371.5 L 31.6,362.3 L 25.9,351.6 L 22.6,342.9 L 21.6,338.0 L 26.9,334.5 L 29.5,331.7 L 32.8,326.8 L 40.2,318.1 L 43.8,313.1 L 45.1,305.7 L 48.2,299.1 L 42.7,296.8 L 38.2,296.0 L 29.6,274.5 L 32.0,265.0 L 34.4,262.2 L 37.2,256.6 L 37.7,252.9 L 30.6,244.6 L 31.2,237.0 L 35.8,228.2 L 38.8,225.1 L 42.3,221.4 L 44.5,215.0 L 50.2,211.1 L 46.3,202.6 L 44.3,194.8 L 42.1,190.1 L 44.2,187.6 L 45.7,184.0 L 45.9,167.6 L 47.0,154.1 L 50.5,149.7 L 52.9,145.3 L 55.9,141.7 L 57.3,139.3 L 60.5,136.1 L 64.4,136.3 L 73.5,124.8 L 79.7,117.6 L 83.8,114.5 L 122.9,138.7 L 122.4,144.8 L 117.4,161.4 L 113.2,166.2 L 107.8,173.6 L 106.9,185.0 L 102.8,190.8 L 102.0,196.8 L 100.9,206.1 L 100.9,215.3 L 99.9,220.2 L 100.5,221.8 L 101.8,226.4 L 100.5,228.8 L 104.6,237.7 L 104.8,244.1 L 107.7,246.1 L 111.0,248.5 L 116.3,258.3 L 116.5,262.4 L 119.6,265.6 L 123.1,281.3 L 123.3,283.1 L 122.8,287.1 L 125.0,294.3 L 126.8,297.5 L 127.5,308.2 L 129.6,318.5 L 126.3,322.4 L 121.3,327.4 L 120.1,331.3 L 123.4,335.6 L 124.9,342.5 L 125.6,348.2 L 125.8,350.7 L 117.9,349.2 L 116.0,347.2 L 104.7,351.8 L 92.0,361.4 L 92.9,364.1 L 92.2,366.1 L 82.6,360.6 L 66.0,357.8 L 55.2,367.4 L 41.7,373.5 L 37.4,372.6 L 34.2,371.5 Z",
  ORURO:      "M 45.5,412.6 L 44.7,404.1 L 44.7,401.7 L 43.6,391.9 L 41.5,383.9 L 40.4,377.2 L 50.1,371.1 L 62.4,359.3 L 80.5,359.7 L 90.9,366.8 L 92.9,364.6 L 92.2,362.4 L 99.2,356.1 L 115.2,347.1 L 117.4,348.3 L 120.0,352.6 L 134.7,372.1 L 130.3,375.5 L 131.1,382.0 L 135.7,382.5 L 136.6,385.0 L 132.6,387.9 L 132.2,393.5 L 134.6,398.3 L 146.9,404.5 L 151.4,414.7 L 156.1,423.3 L 139.5,426.0 L 99.7,448.0 L 61.1,438.8 L 66.0,433.3 L 57.8,426.5 L 48.6,417.8 L 45.5,412.6 Z",
  POTOSI:     "M 60.3,459.7 L 62.3,454.5 L 62.0,451.2 L 56.5,446.5 L 61.1,438.8 L 99.7,448.0 L 139.5,426.0 L 156.1,423.3 L 151.4,414.7 L 146.9,404.5 L 134.6,398.3 L 132.2,393.5 L 132.6,387.9 L 136.6,385.0 L 135.7,382.5 L 131.1,382.0 L 130.3,375.5 L 134.7,372.1 L 142.5,371.8 L 148.6,369.2 L 156.4,366.6 L 159.2,369.9 L 163.3,371.2 L 170.4,377.1 L 174.7,382.3 L 180.3,388.4 L 182.8,390.0 L 177.1,389.0 L 175.3,389.7 L 174.4,388.8 L 172.2,388.3 L 170.9,387.7 L 170.0,387.4 L 170.2,390.4 L 172.4,392.2 L 172.8,401.7 L 171.2,403.7 L 172.2,404.4 L 179.3,401.6 L 180.0,403.1 L 177.0,406.6 L 177.1,408.1 L 178.0,409.7 L 177.6,411.8 L 175.5,415.4 L 178.3,420.0 L 180.6,423.8 L 186.6,428.4 L 192.0,430.5 L 197.3,429.7 L 200.3,433.3 L 200.7,435.6 L 205.2,445.0 L 193.2,456.1 L 185.7,457.9 L 184.0,459.3 L 182.8,463.7 L 182.1,468.6 L 180.0,492.7 L 178.3,506.3 L 184.0,519.9 L 185.8,527.3 L 184.7,530.4 L 184.1,534.0 L 185.5,535.7 L 188.4,541.0 L 176.7,546.0 L 167.9,546.8 L 156.3,538.3 L 147.4,540.2 L 145.9,545.3 L 139.0,548.9 L 133.4,550.8 L 130.0,552.4 L 128.7,559.7 L 121.8,563.8 L 119.5,569.1 L 99.9,579.8 L 88.9,577.6 L 88.1,565.2 L 84.6,555.3 L 83.8,548.4 L 82.4,543.9 L 78.0,529.8 L 66.5,497.3 L 61.3,494.2 L 63.6,482.7 L 54.5,476.4 L 55.8,468.3 L 53.1,462.6 L 60.3,459.7 Z",
  TARIJA:     "M 284.5,551.9 L 281.8,549.0 L 279.1,544.6 L 271.0,542.0 L 243.4,544.1 L 235.6,542.3 L 234.6,545.1 L 231.7,551.7 L 224.7,563.9 L 221.4,578.9 L 219.7,572.9 L 216.5,569.2 L 217.2,566.0 L 214.5,560.8 L 213.4,557.8 L 213.2,553.7 L 209.6,550.1 L 206.4,549.8 L 189.4,546.1 L 187.1,538.6 L 184.4,534.3 L 184.1,531.0 L 185.2,528.1 L 187.1,523.7 L 188.3,508.4 L 190.0,497.3 L 191.8,498.0 L 193.5,498.1 L 195.2,499.6 L 196.2,500.0 L 197.6,500.4 L 199.0,500.7 L 199.9,501.8 L 200.7,502.6 L 202.0,503.6 L 204.4,502.7 L 205.1,500.7 L 206.6,496.9 L 208.3,497.1 L 209.6,497.6 L 211.2,499.4 L 213.3,503.2 L 216.1,503.0 L 220.1,505.3 L 225.1,505.6 L 226.1,504.5 L 226.0,502.1 L 226.8,500.4 L 226.7,495.8 L 229.3,495.8 L 232.7,497.3 L 233.5,498.6 L 298.8,499.6 L 293.5,520.8 L 285.4,549.8 L 284.5,551.9 Z",
  SANTA_CRUZ: "M 465.1,456.4 L 461.4,458.4 L 459.0,460.0 L 455.5,463.6 L 454.5,457.3 L 453.2,449.7 L 434.2,437.1 L 419.5,427.2 L 387.3,427.5 L 327.5,440.6 L 318.3,442.2 L 313.1,457.3 L 310.5,462.7 L 303.6,473.4 L 259.9,477.1 L 256.9,472.9 L 254.4,474.7 L 252.4,476.8 L 246.3,474.5 L 242.5,423.8 L 238.4,416.0 L 236.4,421.8 L 233.0,421.7 L 230.5,414.4 L 227.4,412.7 L 225.9,410.1 L 222.5,405.9 L 221.7,401.8 L 222.6,397.6 L 222.3,393.9 L 221.0,392.8 L 218.2,390.8 L 217.5,388.5 L 217.0,386.8 L 215.2,382.7 L 212.3,378.3 L 207.3,370.0 L 211.6,362.8 L 218.5,350.0 L 221.9,348.0 L 225.2,347.8 L 224.7,343.3 L 216.9,335.9 L 210.1,330.5 L 204.1,320.2 L 203.9,316.4 L 204.3,312.7 L 206.0,309.0 L 207.9,303.6 L 207.3,300.7 L 208.4,295.8 L 207.8,291.1 L 207.9,287.4 L 207.1,284.0 L 208.2,282.5 L 259.0,283.9 L 255.1,281.1 L 253.7,276.7 L 250.6,273.7 L 246.1,270.0 L 243.5,265.4 L 235.9,251.1 L 235.9,243.2 L 304.2,194.9 L 327.8,183.9 L 336.1,182.2 L 341.5,182.5 L 345.0,180.4 L 350.6,184.1 L 361.1,191.9 L 363.1,193.3 L 367.5,198.7 L 369.2,201.6 L 369.0,205.4 L 366.4,209.0 L 366.9,214.8 L 371.7,225.6 L 373.7,235.8 L 369.8,249.5 L 375.2,265.7 L 377.7,297.2 L 403.7,300.3 L 442.3,301.8 L 446.7,299.7 L 446.9,307.8 L 442.7,321.8 L 442.6,327.5 L 444.5,334.8 L 448.5,342.6 L 451.1,344.1 L 454.1,346.9 L 459.5,351.2 L 466.0,351.8 L 467.9,356.4 L 469.6,361.1 L 471.2,365.9 L 479.1,381.2 L 476.2,383.4 L 468.1,411.1 L 468.5,416.9 L 459.4,436.1 L 456.5,442.8 L 465.1,456.4 Z",
  CHUQUISACA: "M 301.1,477.2 L 298.7,493.5 L 234.3,499.3 L 232.9,497.2 L 230.1,495.8 L 227.0,495.0 L 226.8,500.2 L 226.2,501.7 L 226.1,504.3 L 225.3,505.5 L 220.8,505.5 L 216.4,503.0 L 213.4,503.3 L 211.3,499.6 L 209.8,498.2 L 208.5,497.1 L 206.9,496.7 L 205.1,500.2 L 204.6,502.5 L 202.2,503.7 L 200.9,502.8 L 200.1,501.9 L 199.1,500.8 L 197.8,500.5 L 196.5,499.9 L 195.4,499.6 L 194.6,499.6 L 192.0,498.0 L 190.2,497.3 L 188.9,506.0 L 187.1,522.3 L 178.3,506.5 L 179.8,498.0 L 184.8,479.9 L 182.6,464.0 L 184.0,460.2 L 185.1,458.6 L 189.3,456.5 L 205.5,445.9 L 200.6,436.5 L 200.5,433.5 L 198.3,430.0 L 192.2,430.6 L 187.2,428.8 L 181.4,425.2 L 178.5,420.3 L 175.5,415.5 L 177.3,412.1 L 178.1,410.2 L 177.4,408.4 L 176.9,406.7 L 179.8,403.6 L 179.5,401.7 L 176.3,402.2 L 171.2,404.0 L 172.5,402.0 L 172.4,392.7 L 170.5,390.8 L 169.8,387.5 L 170.8,387.4 L 172.0,388.2 L 174.2,388.6 L 175.0,389.7 L 177.1,389.0 L 183.0,390.4 L 184.4,391.7 L 186.5,395.0 L 189.3,398.4 L 193.9,399.8 L 197.3,395.0 L 204.3,394.3 L 208.6,396.7 L 211.0,399.7 L 215.5,400.5 L 220.4,400.0 L 221.6,403.0 L 223.0,407.5 L 226.0,411.3 L 229.1,413.0 L 231.0,414.6 L 234.0,422.2 L 237.0,420.9 L 239.9,416.3 L 244.0,455.7 L 247.6,476.4 L 252.8,476.4 L 255.5,474.5 L 257.4,472.4 L 260.6,477.4 L 301.1,477.2 Z",
  PANDO:      "M 179.3,20.0 L 183.1,24.7 L 183.7,29.5 L 184.6,38.6 L 184.4,43.8 L 181.1,50.2 L 176.6,53.0 L 170.5,57.8 L 167.4,59.0 L 164.7,63.9 L 161.7,62.1 L 162.1,65.2 L 157.8,67.0 L 154.7,69.9 L 155.7,72.2 L 152.9,76.4 L 150.0,80.1 L 148.3,86.7 L 146.6,90.5 L 139.5,94.7 L 132.3,97.9 L 130.7,104.5 L 126.7,106.8 L 124.5,108.6 L 123.0,111.8 L 122.2,114.6 L 124.4,116.9 L 124.6,126.7 L 124.0,132.1 L 83.8,114.5 L 79.7,117.6 L 73.5,124.8 L 64.4,136.3 L 60.5,136.1 L 57.3,139.3 L 40.2,106.7 L 24.2,75.5 L 23.4,73.9 L 34.1,74.0 L 45.2,76.0 L 49.5,76.6 L 53.6,77.4 L 54.2,81.9 L 65.5,77.8 L 71.0,75.7 L 75.2,69.1 L 81.8,61.6 L 89.8,62.2 L 94.7,59.4 L 98.5,54.8 L 104.1,51.3 L 106.8,49.6 L 107.8,47.4 L 113.6,47.4 L 116.0,45.6 L 133.0,31.5 L 134.4,29.5 L 144.8,27.2 L 153.3,25.0 L 154.4,24.6 L 157.8,25.3 L 163.4,24.3 L 165.2,24.5 L 166.2,22.3 L 168.6,23.3 L 169.7,24.9 L 171.1,25.4 L 174.2,26.2 L 175.2,25.0 L 176.7,22.3 L 179.3,20.0 Z",
  BENI:       "M 181.1,50.2 L 179.9,53.2 L 179.3,55.3 L 179.8,57.4 L 181.6,63.1 L 183.0,68.9 L 184.6,74.6 L 183.0,77.3 L 181.1,82.4 L 181.7,86.2 L 183.6,89.8 L 183.9,96.1 L 187.8,98.8 L 188.6,101.0 L 188.7,104.2 L 189.7,108.5 L 191.7,105.2 L 193.8,109.2 L 194.7,113.2 L 196.1,115.0 L 196.6,118.5 L 202.0,119.0 L 204.7,122.0 L 206.7,124.2 L 207.9,124.0 L 208.6,126.0 L 213.6,128.1 L 215.2,128.4 L 215.1,133.4 L 217.3,136.1 L 221.9,137.9 L 224.0,139.1 L 227.8,140.2 L 232.8,141.1 L 236.6,141.4 L 239.5,138.1 L 250.3,141.2 L 253.4,142.2 L 254.6,144.4 L 257.8,146.9 L 262.9,147.2 L 264.9,145.9 L 268.5,146.0 L 269.4,149.3 L 271.0,151.7 L 273.0,154.6 L 276.3,157.7 L 277.9,158.6 L 280.1,160.3 L 283.2,159.2 L 284.9,161.9 L 292.9,165.5 L 294.6,166.6 L 299.3,166.2 L 302.9,165.8 L 304.8,170.5 L 308.3,174.9 L 312.8,179.3 L 316.1,183.7 L 320.6,182.6 L 270.9,216.0 L 236.1,245.4 L 236.2,251.7 L 244.4,265.8 L 247.8,272.0 L 251.0,274.0 L 254.5,277.8 L 255.5,281.7 L 259.4,284.1 L 204.1,282.0 L 185.5,292.7 L 164.4,307.6 L 149.2,301.2 L 139.3,286.6 L 118.2,263.5 L 116.0,261.0 L 112.8,250.8 L 109.5,246.1 L 106.4,245.7 L 104.2,241.0 L 104.1,234.3 L 100.6,227.6 L 101.9,223.9 L 100.4,220.8 L 99.1,217.0 L 101.5,213.3 L 100.3,203.0 L 101.9,194.2 L 104.3,189.3 L 105.6,179.2 L 112.8,167.8 L 114.5,165.2 L 120.4,156.5 L 123.3,140.6 L 123.3,134.5 L 123.9,129.6 L 125.0,122.8 L 122.8,114.3 L 121.5,112.8 L 124.7,110.6 L 124.6,106.7 L 128.2,105.0 L 131.1,100.7 L 132.6,95.0 L 145.1,92.6 L 148.8,88.6 L 150.3,83.3 L 151.8,80.2 L 154.2,75.0 L 156.2,69.6 L 154.2,69.2 L 162.2,68.0 L 160.4,64.0 L 163.0,63.6 L 167.5,61.8 L 168.1,57.2 L 172.8,56.0 L 178.4,50.8 L 181.1,50.2 Z",
  COCHABAMBA: "M 120.9,353.5 L 125.8,348.6 L 125.0,342.9 L 123.9,336.4 L 120.0,332.1 L 121.4,328.2 L 124.0,322.7 L 129.6,319.2 L 127.9,309.4 L 127.1,298.1 L 125.4,295.0 L 122.4,290.2 L 123.0,283.5 L 123.3,281.5 L 139.3,286.6 L 149.2,301.2 L 164.4,307.6 L 185.5,292.7 L 204.1,282.0 L 207.1,282.5 L 206.6,284.1 L 207.9,287.9 L 208.5,292.1 L 208.1,296.7 L 208.2,300.7 L 207.8,304.2 L 205.2,309.6 L 204.6,313.0 L 203.7,317.4 L 204.2,320.6 L 211.0,330.8 L 217.9,336.3 L 224.8,343.6 L 224.6,347.8 L 221.2,347.9 L 218.5,350.4 L 208.5,366.1 L 209.0,371.9 L 212.8,378.7 L 215.6,384.4 L 216.9,387.1 L 217.4,389.1 L 218.3,390.9 L 221.8,393.2 L 222.4,394.2 L 222.4,397.9 L 219.7,398.3 L 212.5,400.8 L 209.7,398.3 L 207.1,394.9 L 202.9,393.0 L 194.6,397.4 L 192.4,400.1 L 186.7,398.0 L 185.2,394.0 L 183.2,391.7 L 182.3,389.8 L 179.5,388.2 L 173.5,381.1 L 169.4,375.8 L 160.5,371.7 L 158.2,368.6 L 154.6,366.3 L 145.6,371.8 L 138.8,371.7 L 129.7,362.0 L 120.9,353.5 Z",
};

const METRICAS_DEPTO = [
  { key: "cartera_vigente",          label: "Cartera Vigente" },
  { key: "cartera_vencida",          label: "Cartera Vencida" },
  { key: "cartera_ejecucion",        label: "En Ejecución" },
  { key: "cartera_reprog_vigente",   label: "Reprog. Vigente" },
  { key: "cartera_reprog_vencida",   label: "Reprog. Vencida" },
  { key: "cartera_reprog_ejecucion", label: "Reprog. Ejecución" },
  { key: "cartera_contingente",      label: "Contingente" },
  { key: "obligaciones_publico",     label: "Oblig. Público" },
  { key: "prevision",                label: "Previsión" },
];

function getDeptoValue(periodo, depto, metrica) {
  return datosASFI.serie_historica[periodo]?.cartera_departamental?.[depto]?.[metrica] ?? null;
}

function heatmapColor(valor, min, max) {
  if (valor == null || max === min) return "#13151C";
  const t = (valor - min) / (max - min);
  if (t <= 0.5) {
    const tt = t * 2;
    const r = Math.round(0x13 + tt * (0xC4 - 0x13));
    const g = Math.round(0x15 + tt * (0xA0 - 0x15));
    const b = Math.round(0x1C + tt * (0x50 - 0x1C));
    return `rgb(${r},${g},${b})`;
  } else {
    const tt = (t - 0.5) * 2;
    const r = Math.round(0xC4 + tt * (0x00 - 0xC4));
    const g = Math.round(0xA0 + tt * (0xE5 - 0xA0));
    const b = Math.round(0x50 + tt * (0xFF - 0x50));
    return `rgb(${r},${g},${b})`;
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

const PERIODOS     = Object.keys(datosASFI.serie_historica).sort();
const PERIODOS_DIC = PERIODOS.filter((p) => p.endsWith("-12"));

// Rangos esperados para detectar y corregir valores con punto decimal perdido
// (dos períodos en el JSON tienen enteros como 183 en lugar de 1.83)
const IND_RANGE = {
  mora_pct:            [0.3,  12 ],
  cartera_vigente_pct: [80,   100],
  cartera_reprog_pct:  [0,    45 ],
  prev_incobrable_pct: [0,    25 ],
  cartera_neta_activo: [25,   90 ],
  liquidez_cp:         [3,    75 ],
};

function normalizeIndicador(key, v) {
  const range = IND_RANGE[key];
  if (!range) return v;
  const [lo, hi] = range;
  if (v >= lo && v <= hi) return v;
  const d100 = v / 100;
  if (d100 >= lo && d100 <= hi) return d100;
  const d10 = v / 10;
  if (d10 >= lo && d10 <= hi) return d10;
  return null;
}

function getIndicadorValue(periodo, banco, key) {
  const p = datosASFI.serie_historica[periodo];
  if (!p) return null;
  if (key === "cap_pct") {
    const v = p.ponderacion_cap?.[banco]?.cap_pct;
    return v != null ? +(v * 100).toFixed(2) : null;
  }
  const raw = p.indicadores?.[banco]?.[key];
  if (raw == null) return null;
  const cooked = Number(raw) < 1 ? Number(raw) * 100 : Number(raw);
  const v = normalizeIndicador(key, cooked);
  return v != null ? +v.toFixed(2) : null;
}

function hexToRgb(hex) {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function colorSimilar(hex1, hex2) {
  try {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return Math.abs(r1 - r2) < 60 && Math.abs(g1 - g2) < 60 && Math.abs(b1 - b2) < 60;
  } catch { return false; }
}

function getColorB(bancoA, bancoB) {
  const cA = BANCOS[bancoA]?.color ?? "#00E5FF";
  const cB = BANCOS[bancoB]?.color ?? "#C4A050";
  return colorSimilar(cA, cB) ? (BANCOS[bancoB]?.colorAlt ?? cB) : cB;
}

function fmt(v) {
  return v != null ? `${Number(v).toFixed(2)}%` : "—";
}

function fmtMillones(milesDebs) {
  if (milesDebs == null) return "—";
  const m = milesDebs / 1_000_000;
  return `Bs. ${m.toLocaleString("es-BO", { maximumFractionDigits: 0 })} M`;
}

// ── TOOLTIP COMPARTIDO ────────────────────────────────────────────────────────

function IndTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ind-tooltip">
      <p className="ind-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? "#00E5FF" }}>
          {p.name}: <strong>{p.value != null ? `${p.value}%` : "—"}</strong>
        </p>
      ))}
    </div>
  );
}

// ── BANCO AVATAR ─────────────────────────────────────────────────────────────

function BancoAvatar({ sigla, color, size = 48 }) {
  const [r, g, b] = hexToRgb(color);
  const logoSrc = `/logos/bancos/${sigla === 'TOTAL_SISTEMA' ? 'ASFI' : sigla}.png`;
  const fallbackText = sigla === 'TOTAL_SISTEMA' ? 'SIS' : sigla;
  return (
    <div
      className="ind-banco-avatar"
      style={{
        width: size,
        height: size,
        fontSize: `${Math.round(size * 0.38)}px`,
        background: `rgba(${r},${g},${b},0.2)`,
        border: `1.5px solid rgba(${r},${g},${b},0.6)`,
        color,
        overflow: 'hidden',
        padding: 0,
        position: 'relative',
      }}
    >
      <img
        src={logoSrc}
        alt={sigla}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <span
        style={{
          display: 'none',
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {fallbackText}
      </span>
    </div>
  );
}

// ── KPI CARD ──────────────────────────────────────────────────────────────────

function KpiCard({ titulo, valor, subtitulo, badge, color }) {
  return (
    <div className="ind-kpi-card" style={{ "--kpi-color": color ?? "var(--color-cyan)" }}>
      <span className="ind-kpi-titulo">{titulo}</span>
      <span className="ind-kpi-valor">{valor}</span>
      {subtitulo && <span className="ind-kpi-sub">{subtitulo}</span>}
      {badge && (
        <span className={`ind-kpi-badge ${badge.ok ? "ind-badge-green" : "ind-badge-red"}`}>
          {badge.label}
        </span>
      )}
    </div>
  );
}

// ── SECCIÓN 1 — HERO ──────────────────────────────────────────────────────────

function SeccionHero({ periodo, setPeriodo }) {
  return (
    <div className="ind-hero">
      <div className="ind-hero-glow" />
      <span className="ind-tag">Art. 415 · Ley N°393</span>
      <h1 className="ind-hero-title">
        Indicadores del<br />
        <span className="ind-accent-cyan">Sistema Financiero</span>
      </h1>
      <p className="ind-hero-sub">
        Datos históricos de la cartera de créditos de la Banca Múltiple boliviana — ASFI
      </p>
      <div className="ind-hero-controls">
        <label className="ind-label-muted">Período de análisis</label>
        <select
          className="ind-select"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          {[...PERIODOS].reverse().map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <p className="indicadores-data-nota">
        ⚠ Los datos provienen de reportes oficiales ASFI. Algunos períodos pueden presentar valores atípicos debido a datos incompletos, cambios de metodología o registros corruptos en la fuente original.
      </p>
    </div>
  );
}

// ── SECCIÓN MAPA DEPARTAMENTAL ────────────────────────────────────────────────

function SeccionMapa({ periodoGlobal }) {
  const [metrica,  setMetrica]  = useState("cartera_vigente");
  const [año,      setAño]      = useState(() => {
    const match = periodoGlobal?.match(/^(\d{4})/);
    return match ? match[1] : "2025";
  });
  const [deptoSel, setDeptoSel] = useState("LA_PAZ");
  const [tooltip,  setTooltip]  = useState(null);

  const periodo      = `${año}-12`;
  const metricaLabel = METRICAS_DEPTO.find((m) => m.key === metrica)?.label ?? metrica;

  const valores = Object.keys(DEPARTAMENTOS).map((d) => getDeptoValue(periodo, d, metrica)).filter((v) => v != null);
  const minVal  = Math.min(...valores);
  const maxVal  = Math.max(...valores);

  const deptoData = METRICAS_DEPTO.map((m) => ({
    ...m,
    valor: getDeptoValue(periodo, deptoSel, m.key),
  }));

  return (
    <section className="ind-section ind-mapa-section">
      <div className="ind-section-header">
        <span className="ind-section-tag">Distribución Geográfica · {periodo}</span>
        <h2 className="ind-section-title">Cartera por Departamento</h2>
        <p className="ind-section-desc">
          Concentración de cartera en el territorio boliviano. Intensidad de color según valor de la métrica seleccionada.
        </p>
      </div>

      <div className="ind-ctrl-row">
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Métrica</label>
          <select className="ind-select" value={metrica} onChange={(e) => setMetrica(e.target.value)}>
            {METRICAS_DEPTO.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Año (cierre dic.)</label>
          <select className="ind-select" value={año} onChange={(e) => setAño(e.target.value)}>
            {PERIODOS_DIC.map((p) => {
              const y = p.split("-")[0];
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="ind-mapa-layout">
        <div className="ind-mapa-svg-wrapper">
          <svg viewBox="20 15 470 580" className="ind-mapa-svg" xmlns="http://www.w3.org/2000/svg">
            {Object.entries(DEPTO_PATHS).map(([sigla, path]) => {
              const val   = getDeptoValue(periodo, sigla, metrica);
              const fill  = heatmapColor(val, minVal, maxVal);
              const activo = deptoSel === sigla;
              return (
                <g key={sigla}>
                  <path
                    d={path}
                    fill={fill}
                    stroke={activo ? "#00E5FF" : "rgba(0,229,255,0.25)"}
                    strokeWidth={activo ? 2.5 : 1}
                    className="ind-mapa-path"
                    onClick={() => setDeptoSel(sigla)}
                    onMouseMove={(e) => setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      nombre: DEPARTAMENTOS[sigla].nombre,
                      valor: val,
                    })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text
                    x={DEPARTAMENTOS[sigla].cx}
                    y={DEPARTAMENTOS[sigla].cy}
                    className="ind-mapa-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {sigla === "LA_PAZ" ? "La Paz" : sigla === "SANTA_CRUZ" ? "Sta. Cruz" : DEPARTAMENTOS[sigla].nombre.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="ind-mapa-leyenda">
            <span className="ind-mapa-leyenda-min">Mín</span>
            <div className="ind-mapa-leyenda-barra" />
            <span className="ind-mapa-leyenda-max">Máx</span>
          </div>

          {tooltip && (
            <div
              className="ind-mapa-tooltip"
              style={{ left: tooltip.x + 12, top: tooltip.y - 40, position: "fixed" }}
            >
              <strong>{tooltip.nombre}</strong>
              <span>{tooltip.valor != null ? `Bs. ${(tooltip.valor / 1000).toLocaleString("es-BO", { maximumFractionDigits: 0 })}M` : "Sin datos"}</span>
            </div>
          )}
        </div>

        <div className="ind-mapa-panel">
          <div className="ind-mapa-panel-header">
            <span className="ind-mapa-panel-nombre">{DEPARTAMENTOS[deptoSel]?.nombre ?? deptoSel}</span>
            <span className="ind-mapa-panel-periodo">{periodo}</span>
          </div>
          <p className="ind-mapa-panel-hint">Haz clic en un departamento para ver sus datos</p>
          <div className="ind-mapa-panel-filas">
            {deptoData.map((m) => (
              <div
                key={m.key}
                className={`ind-mapa-panel-fila${m.key === metrica ? " ind-mapa-fila--activa" : ""}`}
              >
                <span className="ind-mapa-fila-label">{m.label}</span>
                <span className="ind-mapa-fila-valor">
                  {m.valor != null
                    ? `Bs. ${(m.valor / 1000).toLocaleString("es-BO", { maximumFractionDigits: 0 })}M`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="ind-chart-fuente" style={{ marginTop: "1rem" }}>Fuente: ASFI — asfi.gob.bo</p>
        </div>
      </div>
    </section>
  );
}

// ── SECCIÓN 2 — CARDS TOTAL SISTEMA ──────────────────────────────────────────

function SeccionCards({ periodo }) {
  const ef     = datosASFI.serie_historica[periodo]?.estados_financieros?.TOTAL_SISTEMA;
  const capPct = getIndicadorValue(periodo, "TOTAL_SISTEMA", "cap_pct");

  return (
    <section className="ind-section">
      <div className="ind-section-header">
        <span className="ind-section-tag">Panorama del Sistema · {periodo}</span>
        <h2 className="ind-section-title">Indicadores del Total Sistema</h2>
        <p className="ind-section-desc">
          Métricas agregadas de la Banca Múltiple boliviana para el período seleccionado.
        </p>
      </div>
      <div className="ind-kpi-grid">
        <KpiCard titulo="Cartera Total"        valor={fmtMillones(ef?.cartera_total)}                                                      subtitulo="miles de millones de Bs."           color="#00E5FF" />
        <KpiCard titulo="Índice de Mora"        valor={fmt(getIndicadorValue(periodo, "TOTAL_SISTEMA", "mora_pct"))}                        subtitulo="Cartera en mora / Cartera total"     color="#F59E0B" />
        <KpiCard titulo="Cartera Vigente"       valor={fmt(getIndicadorValue(periodo, "TOTAL_SISTEMA", "cartera_vigente_pct"))}             subtitulo="Sobre cartera total"                 color="#34D399" />
        <KpiCard
          titulo="CAP"
          valor={capPct != null ? `${capPct.toFixed(2)}%` : "—"}
          subtitulo="Capital / Activos ponderados"
          color={capPct != null && capPct >= 10 ? "#34D399" : "#EF4444"}
          badge={capPct != null ? { ok: capPct >= 10, label: capPct >= 10 ? "≥10% Art.415 ✓" : "<10% Incumple" } : null}
        />
        <KpiCard titulo="Previsión Incobrable"  valor={fmt(getIndicadorValue(periodo, "TOTAL_SISTEMA", "prev_incobrable_pct"))}            subtitulo="Sobre cartera total"                 color="#C4A050" />
        <KpiCard titulo="Cartera Reprogramada"  valor={fmt(getIndicadorValue(periodo, "TOTAL_SISTEMA", "cartera_reprog_pct"))}             subtitulo="Sobre cartera total"                 color="#A78BFA" />
      </div>
    </section>
  );
}

// ── SECCIÓN 3 — SELECTOR BANCO ────────────────────────────────────────────────

function SeccionBancoSelector({ periodo }) {
  const [bancoActivo, setBancoActivo] = useState("TOTAL_SISTEMA");

  const ef     = datosASFI.serie_historica[periodo]?.estados_financieros?.[bancoActivo];
  const banco  = BANCOS[bancoActivo];
  const capPct = getIndicadorValue(periodo, bancoActivo, "cap_pct");
  const [pr, pg, pb] = hexToRgb(banco?.color ?? "#00E5FF");
  const panelBg = `rgba(${pr},${pg},${pb},0.06)`;
  const kpiBg   = `rgba(${pr},${pg},${pb},0.13)`;

  return (
    <section className="ind-section ind-section--dark">
      <div className="ind-section-header">
        <span className="ind-section-tag">Análisis por Entidad · {periodo}</span>
        <h2 className="ind-section-title">Indicadores por Banco</h2>
        <p className="ind-section-desc">
          Selecciona una entidad para ver sus métricas en el período analizado.
        </p>
      </div>

      <div className="ind-banco-grid">
        {Object.keys(BANCOS).map((sigla) => {
          const b = BANCOS[sigla];
          const activo = bancoActivo === sigla;
          return (
            <button
              key={sigla}
              className={`ind-banco-btn${activo ? " ind-banco-btn--active" : ""}`}
              style={{ "--bcolor": b.color }}
              onClick={() => setBancoActivo(sigla)}
            >
              <img
                src={`/logos/bancos/${sigla === 'TOTAL_SISTEMA' ? 'ASFI' : sigla}.png`}
                alt={sigla}
                className="ind-banco-btn-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="ind-banco-sigla">{sigla}</span>
              <span className="ind-banco-corto">{b.corto}</span>
            </button>
          );
        })}
      </div>

      {banco && (
        <div className="ind-banco-panel" style={{ "--panel-color": banco.color, "--panel-bg": panelBg, "--kpi-panel-bg": kpiBg }}>
          <div className="ind-banco-panel-header">
            <BancoAvatar sigla={bancoActivo} color={banco.color} size={48} />
            <h3 className="ind-banco-panel-nombre">{banco.nombre}</h3>
            <span className="ind-banco-panel-periodo">{periodo}</span>
          </div>
          <div className="ind-kpi-grid">
            <KpiCard titulo="Cartera Total"        valor={fmtMillones(ef?.cartera_total)}                                                   color={banco.color} />
            <KpiCard titulo="Índice de Mora"        valor={fmt(getIndicadorValue(periodo, bancoActivo, "mora_pct"))}                     color={banco.color} />
            <KpiCard titulo="Cartera Vigente"       valor={fmt(getIndicadorValue(periodo, bancoActivo, "cartera_vigente_pct"))}          color={banco.color} />
            <KpiCard
              titulo="CAP"
              valor={capPct != null ? `${capPct.toFixed(2)}%` : "—"}
              color={banco.color}
              badge={capPct != null ? { ok: capPct >= 10, label: capPct >= 10 ? "≥10% Art.415 ✓" : "<10% Incumple" } : null}
            />
            <KpiCard titulo="Previsión Incobrable"  valor={fmt(getIndicadorValue(periodo, bancoActivo, "prev_incobrable_pct"))}         color={banco.color} />
            <KpiCard titulo="Cartera Reprogramada"  valor={fmt(getIndicadorValue(periodo, bancoActivo, "cartera_reprog_pct"))}          color={banco.color} />
          </div>
        </div>
      )}
    </section>
  );
}

// ── SECCIÓN 4 — HISTÓRICO ─────────────────────────────────────────────────────

function SeccionHistorico() {
  const [banco,     setBanco]     = useState("TOTAL_SISTEMA");
  const [indicador, setIndicador] = useState("mora_pct");

  const { datos, atipicos } = useMemo(() => {
    const serie = PERIODOS
      .filter((p) => p.endsWith("-12"))
      .map((p) => {
        const v = getIndicadorValue(p, banco, indicador);
        return v != null ? { año: p.split("-")[0], valor: v } : null;
      })
      .filter(Boolean);

    const vals  = serie.map((d) => d.valor);
    const media = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const sigma = Math.sqrt(vals.reduce((a, b) => a + (b - media) ** 2, 0) / (vals.length || 1));
    const atipicosSet = new Set(
      serie.filter((d) => Math.abs(d.valor - media) > 3 * sigma).map((d) => d.año)
    );

    return { datos: serie, atipicos: atipicosSet };
  }, [banco, indicador]);

  const lineColor = BANCOS[banco]?.color ?? "#00E5FF";
  const indLabel  = INDICADORES.find((i) => i.key === indicador)?.label ?? indicador;

  const PuntoPersonalizado = (props) => {
    const { cx, cy, payload } = props;
    if (atipicos.has(payload?.año)) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#F59E0B" stroke="#0D0F14" strokeWidth={2} />
          <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fill="#F59E0B">⚠</text>
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill={lineColor} strokeWidth={0} />;
  };

  return (
    <section className="ind-section">
      <div className="ind-section-header">
        <span className="ind-section-tag">Serie Histórica · Diciembre de cada año</span>
        <h2 className="ind-section-title">Evolución Histórica</h2>
        <p className="ind-section-desc">
          Tendencia anual desde 2015 hasta 2025. Se muestran únicamente los cierres de diciembre.
        </p>
      </div>

      <div className="ind-ctrl-row">
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Banco</label>
          <select className="ind-select" value={banco} onChange={(e) => setBanco(e.target.value)}>
            {Object.keys(BANCOS).map((b) => (
              <option key={b} value={b}>{BANCOS[b].nombre}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Indicador</label>
          <select className="ind-select" value={indicador} onChange={(e) => setIndicador(e.target.value)}>
            {INDICADORES.map((i) => (
              <option key={i.key} value={i.key}>{i.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ind-chart-card">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={datos} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="año"   tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)",  fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<IndTooltip />} />
            <Line
              type="monotone"
              dataKey="valor"
              name={indLabel}
              stroke={lineColor}
              strokeWidth={2.5}
              dot={<PuntoPersonalizado />}
              activeDot={{ r: 7, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
          {atipicos.size > 0 && (
            <div className="ind-advertencia">
              <span className="ind-advertencia-icon">⚠</span>
              <span>
                Los puntos marcados con ⚠ presentan valores estadísticamente atípicos ({">"} 3σ respecto a la media histórica).
                Pueden corresponder a eventos regulatorios extraordinarios, como las reprogramaciones masivas de 2018.
              </span>
            </div>
          )}
        <p className="ind-chart-fuente">Fuente: ASFI — asfi.gob.bo</p>
      </div>
    </section>
  );
}

// ── SECCIÓN 5 — COMPARACIÓN BANCO VS BANCO ───────────────────────────────────

function SeccionComparacion() {
  const [bancoA,    setBancoA]    = useState("BNB");
  const [bancoB,    setBancoB]    = useState("BUN");
  const [indicador, setIndicador] = useState("mora_pct");
  const [periodo,   setPeriodo]   = useState("2025-12");

  const colorA   = BANCOS[bancoA]?.color ?? "#00E5FF";
  const colorB   = getColorB(bancoA, bancoB);
  const valA     = getIndicadorValue(periodo, bancoA, indicador);
  const valB     = getIndicadorValue(periodo, bancoB, indicador);
  const indLabel = INDICADORES.find((i) => i.key === indicador)?.label ?? indicador;

  const chartData = [
    { name: BANCOS[bancoA]?.corto ?? bancoA, valor: valA, fill: colorA },
    { name: BANCOS[bancoB]?.corto ?? bancoB, valor: valB, fill: colorB },
  ];

  return (
    <section className="ind-section ind-section--dark">
      <div className="ind-section-header">
        <span className="ind-section-tag">Benchmarking · Entidad vs. Entidad</span>
        <h2 className="ind-section-title">Comparación Banco vs. Banco</h2>
        <p className="ind-section-desc">
          Contrasta un indicador entre dos entidades en un período específico.
        </p>
      </div>

      <div className="ind-ctrl-row ind-ctrl-row--wrap">
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Banco A</label>
          <select className="ind-select" value={bancoA} onChange={(e) => setBancoA(e.target.value)}>
            {Object.keys(BANCOS).map((b) => (
              <option key={b} value={b}>{BANCOS[b].nombre}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Banco B</label>
          <select className="ind-select" value={bancoB} onChange={(e) => setBancoB(e.target.value)}>
            {Object.keys(BANCOS).map((b) => (
              <option key={b} value={b}>{BANCOS[b].nombre}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Indicador</label>
          <select className="ind-select" value={indicador} onChange={(e) => setIndicador(e.target.value)}>
            {INDICADORES.map((i) => (
              <option key={i.key} value={i.key}>{i.label}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Período</label>
          <select className="ind-select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {[...PERIODOS].reverse().map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ind-chart-card">
        <div className="ind-comp-legend">
          <span className="ind-comp-legend-item" style={{ color: colorA }}>
            <BancoAvatar sigla={bancoA} color={colorA} size={28} />
            {BANCOS[bancoA]?.nombre}: {valA != null ? `${valA}%` : "—"}
          </span>
          <span className="ind-comp-legend-item" style={{ color: colorB }}>
            <BancoAvatar sigla={bancoB} color={colorB} size={28} />
            {BANCOS[bancoB]?.nombre}: {valB != null ? `${valB}%` : "—"}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 13 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="ind-tooltip">
                    <p className="ind-tooltip-label">{label} · {periodo}</p>
                    <p style={{ color: payload[0]?.payload?.fill }}>
                      {indLabel}: <strong>{payload[0]?.value != null ? `${payload[0].value}%` : "—"}</strong>
                    </p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="valor" name={indLabel} radius={[6, 6, 0, 0]} maxBarSize={120}>
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="ind-chart-fuente">Fuente: ASFI — asfi.gob.bo · {indLabel}</p>
      </div>
    </section>
  );
}

// ── SECCIÓN 6 — COMPARACIÓN POR FECHAS ───────────────────────────────────────

function SeccionFechas() {
  const [banco, setBanco] = useState("TOTAL_SISTEMA");
  const [per1,  setPer1]  = useState("2024-12");
  const [per2,  setPer2]  = useState("2025-12");

  const filas = INDICADORES.map((ind) => {
    const v1    = getIndicadorValue(per1, banco, ind.key);
    const v2    = getIndicadorValue(per2, banco, ind.key);
    const delta = v1 != null && v2 != null ? +(v2 - v1).toFixed(2) : null;
    let favorable = null;
    if (delta != null && delta !== 0) {
      favorable = FAVORABLE_SUBE.has(ind.key) ? delta > 0 : delta < 0;
    }
    return { ...ind, v1, v2, delta, favorable };
  });

  return (
    <section className="ind-section">
      <div className="ind-section-header">
        <span className="ind-section-tag">Comparativa Temporal</span>
        <h2 className="ind-section-title">Comparación por Fechas</h2>
        <p className="ind-section-desc">
          Evolución de indicadores de una entidad entre dos períodos con lectura semáforo.
        </p>
      </div>

      <div className="ind-ctrl-row ind-ctrl-row--wrap">
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Banco</label>
          <select className="ind-select" value={banco} onChange={(e) => setBanco(e.target.value)}>
            {Object.keys(BANCOS).map((b) => (
              <option key={b} value={b}>{BANCOS[b].nombre}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Período 1</label>
          <select className="ind-select" value={per1} onChange={(e) => setPer1(e.target.value)}>
            {[...PERIODOS].reverse().map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="ind-ctrl-group">
          <label className="ind-label-muted">Período 2</label>
          <select className="ind-select" value={per2} onChange={(e) => setPer2(e.target.value)}>
            {[...PERIODOS].reverse().map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ind-fechas-table">
        <div className="ind-fechas-header">
          <div className="ind-fechas-col ind-fechas-col--label">Indicador</div>
          <div className="ind-fechas-col">{per1}</div>
          <div className="ind-fechas-col">{per2}</div>
          <div className="ind-fechas-col">Variación</div>
        </div>
        {filas.map((f) => (
          <div key={f.key} className="ind-fechas-row">
            <div className="ind-fechas-col ind-fechas-col--label">{f.label}</div>
            <div className="ind-fechas-col">{f.v1 != null ? `${f.v1}%` : "—"}</div>
            <div className="ind-fechas-col">{f.v2 != null ? `${f.v2}%` : "—"}</div>
            <div className={`ind-fechas-col ind-fechas-delta${f.favorable === true ? " ind-delta-ok" : f.favorable === false ? " ind-delta-mal" : ""}`}>
              {f.delta != null ? (
                <>
                  <span className="ind-delta-arrow">
                    {f.delta > 0 ? "↑" : f.delta < 0 ? "↓" : "→"}
                  </span>
                  {Math.abs(f.delta).toFixed(2)} pp
                </>
              ) : "—"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── SECCIÓN 7 — CALCULADORAS ──────────────────────────────────────────────────

function Calculadora({ titulo, subtitulo, campos, formula, referencia, esCociente, badgeFn }) {
  const [vals,      setVals]      = useState({});
  const [resultado, setResultado] = useState(null);
  const [error,     setError]     = useState("");

  const calcular = () => {
    const nums = {};
    for (const c of campos) {
      const v = parseFloat(vals[c.key]);
      if (isNaN(v) || v <= 0) {
        setError(`Ingresa un valor válido en "${c.label}"`);
        setResultado(null);
        return;
      }
      nums[c.key] = v;
    }
    setError("");
    setResultado(formula(nums));
  };

  const badge = resultado != null && badgeFn ? badgeFn(resultado) : null;

  return (
    <div className="ind-calc-card">
      <h4 className="ind-calc-titulo">{titulo}</h4>
      <p className="ind-calc-sub">{subtitulo}</p>
      <div className="ind-calc-campos">
        {campos.map((c) => (
          <div key={c.key} className="ind-calc-campo">
            <label className="ind-label-muted">{c.label}</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder={c.placeholder}
              className="ind-input"
              value={vals[c.key] ?? ""}
              onChange={(e) => setVals({ ...vals, [c.key]: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && calcular()}
            />
          </div>
        ))}
      </div>
      <button className="ind-btn-calc" onClick={calcular}>Calcular</button>
      {error && <p className="ind-calc-error">{error}</p>}
      {resultado != null && !error && (
        <div className="ind-calc-resultado">
          <span className="ind-calc-num">
            {resultado.toFixed(esCociente ? 4 : 2)}{esCociente ? "×" : "%"}
          </span>
          {badge && (
            <span className={`ind-kpi-badge ${badge.ok ? "ind-badge-green" : "ind-badge-red"}`}>
              {badge.label}
            </span>
          )}
        </div>
      )}
      <p className="ind-calc-ref">Ref.: {referencia}</p>
    </div>
  );
}

function SeccionCalculadoras() {
  return (
    <section className="ind-section ind-section--dark">
      <div className="ind-section-header">
        <span className="ind-section-tag">Herramientas de Análisis</span>
        <h2 className="ind-section-title">Calculadoras Financieras</h2>
        <p className="ind-section-desc">
          Fórmulas reguladas por la RNSF y Ley N°393 para evaluación de indicadores clave.
        </p>
      </div>
      <div className="ind-calc-grid">
        <Calculadora
          titulo="Índice de Mora"
          subtitulo="Cartera en mora / Cartera total × 100"
          campos={[
            { key: "mora",  label: "Cartera en mora (Bs.)",  placeholder: "ej. 500000" },
            { key: "total", label: "Cartera total (Bs.)",    placeholder: "ej. 10000000" },
          ]}
          formula={({ mora, total }) => (mora / total) * 100}
          referencia="RNSF — Libro 3°, Título II (ASFI)"
        />
        <Calculadora
          titulo="Cobertura de Previsiones"
          subtitulo="Previsiones constituidas / Cartera en mora"
          esCociente
          campos={[
            { key: "prev", label: "Previsiones (Bs.)",       placeholder: "ej. 400000" },
            { key: "mora", label: "Cartera en mora (Bs.)",   placeholder: "ej. 500000" },
          ]}
          formula={({ prev, mora }) => prev / mora}
          referencia="RNSF — Reglamento de Evaluación y Calificación"
        />
        <Calculadora
          titulo="CAP — Art. 415 Ley N°393"
          subtitulo="Capital regulatorio / Activos ponderados por riesgo × 100"
          campos={[
            { key: "cap", label: "Capital regulatorio (Bs.)",          placeholder: "ej. 1500000000" },
            { key: "apr", label: "Activos ponderados por riesgo (Bs.)", placeholder: "ej. 10000000000" },
          ]}
          formula={({ cap, apr }) => (cap / apr) * 100}
          referencia="Art. 415 Ley N°393 de Servicios Financieros"
          badgeFn={(v) => ({ ok: v >= 10, label: v >= 10 ? "≥10% Cumple Art.415 ✓" : "<10% No cumple Art.415" })}
        />
      </div>
    </section>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function Indicadores() {
  const [periodo, setPeriodo] = useState("2025-12");

  // ── Refs para exportación ──────────────────────────────────
  const refCards        = useRef(null);
  const refMapa         = useRef(null);
  const refHistorico    = useRef(null);
  const refComparacion  = useRef(null);
  const refFechas       = useRef(null);
  const refCalculadoras = useRef(null);
  const [exportando, setExportando] = useState(null);
  const [toast,      setToast]      = useState(null);

  const handleExportPDF = async () => {
    setExportando('pdf');
    try {
      await exportarPDF({ refCards, refMapa, refHistorico, refComparacion, refFechas, refCalculadoras });
      setToast({ tipo: "pdf", msg: "✓ PDF descargado correctamente" });
    } catch (e) {
      console.error("Error exportando PDF:", e);
      setToast({ tipo: "pdf", msg: "✗ Error al generar el PDF" });
    } finally {
      setExportando(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleExportExcel = () => {
    setExportando('excel');
    try {
      exportarExcel(datosASFI, [], []);
      setToast({ tipo: "excel", msg: "✓ Excel descargado correctamente" });
    } catch (e) {
      console.error("Error exportando Excel:", e);
      setToast({ tipo: "excel", msg: "✗ Error al generar el Excel" });
    } finally {
      setExportando(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <main className="ind-main">
      <SeccionHero periodo={periodo} setPeriodo={setPeriodo} />

      {/* ── Barra de exportación ── */}
      <div className="export-bar">
        <span className="export-bar__label">Exportar datos del sistema</span>
        <button className="export-btn export-btn-pdf" onClick={handleExportPDF} disabled={exportando}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="15" y2="17"/>
          </svg>
          {exportando === 'pdf' ? 'Generando...' : 'Exportar PDF'}
        </button>
        <button className="export-btn export-btn-excel" onClick={handleExportExcel} disabled={exportando}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          {exportando === 'excel' ? 'Generando...' : 'Exportar Excel'}
        </button>
      </div>

      <div ref={refMapa}>
        <SeccionMapa periodoGlobal={periodo} />
      </div>
      <div ref={refCards}>
        <SeccionCards periodo={periodo} />
      </div>
      <SeccionBancoSelector periodo={periodo} />
      <div ref={refHistorico}>
        <SeccionHistorico />
      </div>
      <div ref={refComparacion}>
        <SeccionComparacion />
      </div>
      <div ref={refFechas}>
        <SeccionFechas />
      </div>
      <div ref={refCalculadoras}>
        <SeccionCalculadoras />
      </div>

      {toast && (
        <div className={`export-toast export-toast--${toast.tipo}`}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
