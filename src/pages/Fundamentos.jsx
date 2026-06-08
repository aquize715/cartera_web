import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import {
  IconBuildingBank, IconClock, IconAlertTriangle, IconRefresh,
  IconBriefcase, IconBuildingStore, IconCoins, IconHome, IconShoppingCart,
  IconArrowRight, IconFileText, IconShield, IconScale, IconSearch,
  IconHandStop, IconRepeat, IconTrash, IconChevronDown, IconChevronUp,
  IconCircleCheck, IconAlertCircle, IconAlertOctagon, IconCircleX,
  IconFlame
} from "@tabler/icons-react";
import "./Fundamentos.css";

// ─── DATOS ───────────────────────────────────────────────────────────────────

const TIPOS_CARTERA = [
  {
    id: "vigente",
    icon: <IconCircleCheck size={28} />,
    nombre: "Cartera Vigente",
    corto: "Créditos al día en sus pagos",
    color: "#00E5FF",
    riesgo: "Bajo",
    prevision: "Previsión genérica mínima",
    descripcion:
      "Comprende los créditos cuyas cuotas se encuentran siendo canceladas dentro del plazo contractual pactado. Se subdivide en cartera vigente ordinaria (sin modificaciones) y cartera reprogramada vigente (términos renegociados, cuotas al día). Es el indicador de salud financiera del portafolio.",
    normativa: "RNSF — Libro 3°, Título II (ASFI)",
  },
  {
    id: "vencida",
    icon: <IconAlertCircle size={28} />,
    nombre: "Cartera Vencida",
    corto: "Capital o cuotas no pagados al vencimiento",
    color: "#F59E0B",
    riesgo: "Medio",
    prevision: "Previsión específica según categoría A–E",
    descripcion:
      "Incluye los créditos o cuotas no pagados tras el vencimiento del plazo contractual, superando los umbrales de mora establecidos por ASFI. Es el indicador central del riesgo crediticio: a mayor proporción de cartera vencida sobre la cartera total (índice de mora), mayor exigencia de previsiones específicas.",
    normativa: "Reglamento de Evaluación y Calificación — ASFI",
  },
  {
    id: "ejecucion",
    icon: <IconAlertOctagon size={28} />,
    nombre: "Cartera en Ejecución",
    corto: "Acciones legales iniciadas para cobro",
    color: "#EF4444",
    riesgo: "Alto",
    prevision: "Previsión del 100% exigida por ASFI",
    descripcion:
      "Son los créditos respecto a los cuales la EIF ha iniciado acciones legales o judiciales para recuperar los montos adeudados. Conforme al Art. 3° RNSF — Libro 3°, Título II, la ASFI publica mensualmente la nómina de deudores con créditos en ejecución, con graves implicaciones para su historial crediticio.",
    normativa: "Art. 3° RNSF — Libro 3°, Título II; Art. 91 Ley N° 393",
  },
  {
    id: "reprogramada",
    icon: <IconRefresh size={28} />,
    nombre: "Cartera Reprogramada / Reestructurada",
    corto: "Condiciones contractuales modificadas por acuerdo",
    color: "#C4A050",
    riesgo: "Variable",
    prevision: "Según estado posterior de cumplimiento",
    descripcion:
      "Surge cuando la EIF y el deudor acuerdan modificar las condiciones originales del crédito. La reprogramación ajusta el cronograma de pagos; la reestructuración implica cambios más profundos (capitalización de intereses, modificación de tasa). Puede estar vigente, vencida o en ejecución según el cumplimiento posterior.",
    normativa: "RNSF — Libro 3°, Título VIII; Ley N° 393 Arts. 504–506",
  },
];

const TIPOS_CREDITO = [
  {
    id: "empresarial",
    icon: <IconBriefcase size={22} />,
    nombre: "Empresarial",
    arts: "Arts. 45–46",
    color: "#00E5FF",
    descripcion:
      "Destinado a personas naturales o jurídicas que desarrollan actividades productivas, comerciales o de servicios a gran escala. Evaluación basada en estados financieros auditados, flujo de caja proyectado y posición de mercado.",
    monto: "Generalmente > Bs 1.000.000",
    tasa: "No regulada — mercado libre",
    garantia: "Hipotecas industriales, prendas sobre maquinaria",
    entidades: "Bancos Múltiples",
  },
  {
    id: "pyme",
    icon: <IconBuildingStore size={22} />,
    nombre: "PYME",
    arts: "Arts. 47–48",
    color: "#A78BFA",
    descripcion:
      "Para pequeñas y medianas empresas que no alcanzan escala empresarial. Requiere metodologías especializadas de evaluación. Los Bancos PYME son entidades especialmente autorizadas por ASFI para este segmento.",
    monto: "Rango intermedio — definido por ASFI",
    tasa: "Regulada para sector productivo (D.S. N°2088)",
    garantia: "Garantías convencionales y no convencionales (Art. 99)",
    entidades: "Bancos PYME, Bancos Múltiples",
  },
  {
    id: "microcredito",
    icon: <IconCoins size={22} />,
    nombre: "Microcrédito",
    arts: "Arts. 49–52",
    color: "#34D399",
    descripcion:
      "Financiamiento a personas en actividades de pequeña escala (unidad económica familiar). Incluye instituciones especializadas como IFD, BancoSol y Banco FIE. Metodología basada en análisis de flujo familiar y garantías solidarias.",
    monto: "Hasta Bs 380.000",
    tasa: "Tasa máxima regulada por ASFI",
    garantia: "Garantías no convencionales, solidarias, warrants",
    entidades: "IFD, Bancos Múltiples, Cooperativas",
  },
  {
    id: "vivienda",
    icon: <IconHome size={22} />,
    nombre: "Vivienda de Interés Social",
    arts: "Arts. 53–56",
    color: "#F59E0B",
    descripcion:
      "Para adquisición, construcción o mejora de única vivienda sin fines comerciales. El D.S. N°1842 fija tasas máximas. Orientado a familias bolivianas de ingresos medios y bajos que acceden por primera vez a vivienda propia.",
    monto: "Hasta UFV 460.000 (casas) / UFV 400.000 (deptos.)",
    tasa: "Máx. 5,5% anual en MN — D.S. N°1842",
    garantia: "Hipoteca sobre el inmueble financiado",
    entidades: "Bancos Múltiples, Mutuales de Ahorro",
  },
  {
    id: "consumo",
    icon: <IconShoppingCart size={22} />,
    nombre: "Consumo",
    arts: "Arts. 57–59",
    color: "#EC4899",
    descripcion:
      "Para personas naturales destinado a adquisición de bienes de consumo o servicios. No destinado a actividades productivas. Incluye créditos personales, tarjetas de crédito y financiamiento de vehículos.",
    monto: "Variable según capacidad de pago",
    tasa: "No regulada — mercado libre",
    garantia: "Garantía personal, descuento por planilla",
    entidades: "Todos los tipos de entidades financieras",
  },
];

const CICLO_PASOS = [
  { n: "01", label: "Solicitud", desc: "El cliente presenta solicitud con documentación: ingresos, garantías, destino del crédito y historial crediticio en el CIC-ASFI.", icon: "📋", color: "#00E5FF" },
  { n: "02", label: "Evaluación", desc: "La EIF analiza capacidad de pago, flujo de caja, garantías ofrecidas y calificación en la Central de Información de Créditos (Art. 96, Ley N°393).", icon: "🔍", color: "#A78BFA" },
  { n: "03", label: "Aprobación", desc: "El Comité de Créditos evalúa el expediente. Si aprueba, define monto, plazo, tasa y condiciones. Si rechaza, debe fundamentar la decisión.", icon: "✅", color: "#34D399" },
  { n: "04", label: "Desembolso", desc: "Firma del contrato, constitución de garantías y desembolso del capital. La EIF registra el crédito como activo en su cartera. Inicia el plazo contractual.", icon: "💰", color: "#F59E0B" },
  { n: "05", label: "Seguimiento", desc: "Monitoreo periódico del cumplimiento de cuotas, visitas al negocio o domicilio, y actualización de la calificación crediticia del deudor.", icon: "📊", color: "#C4A050" },
  { n: "06", label: "Recuperación", desc: "Al vencimiento o en caso de mora: gestión de cobranza preventiva, administrativa, prejudicial o judicial según los días de incumplimiento.", icon: "🔄", color: "#EF4444" },
];

const ARTICULOS_NORMATIVOS = [
  {
    art: "Art. 66",
    titulo: "Niveles de Cartera de Créditos",
    resumen: "El Estado, mediante Decreto Supremo, define niveles mínimos de cartera de cumplimiento obligatorio para las EIF, con revisión al menos anual. La ASFI podrá determinar también niveles máximos para precautelar la estabilidad del sistema.",
    implicancia: "Las entidades están obligadas a cumplir porcentajes mínimos de financiamiento a sectores estratégicos bajo pena de sanciones administrativas.",
    color: "#00E5FF",
  },
  {
    art: "Art. 67",
    titulo: "Sectores Priorizados",
    resumen: "Los niveles mínimos deben priorizar: vivienda de interés social y sector productivo, con énfasis en micro, pequeña y mediana empresa urbana y rural, artesanos y organizaciones económicas comunitarias.",
    implicancia: "Define constitucionalmente qué sectores deben recibir crédito preferencial, democratizando el acceso al financiamiento en Bolivia.",
    color: "#C4A050",
  },
  {
    art: "Art. 68",
    titulo: "Alianzas Estratégicas",
    resumen: "Las EIF sin tecnologías especializadas en financiamiento productivo para micro y PYME podrán suscribir alianzas estratégicas con otras entidades financieras para cumplir los niveles mínimos.",
    implicancia: "Permite que bancos grandes cumplan mínimos de cartera a través de IFD especializadas, ampliando el alcance sin exigir infraestructura propia.",
    color: "#A78BFA",
  },
  {
    art: "Art. 69",
    titulo: "Mecanismos de Control",
    resumen: "La ASFI establece los mecanismos y procedimientos para la aplicación y control de los niveles mínimos y máximos de cartera fijados por el Órgano Ejecutivo.",
    implicancia: "Confiere a ASFI el poder de fiscalización y sanción ante incumplimientos, incluyendo circulares, resoluciones y planes de regularización.",
    color: "#34D399",
  },
];

// Datos reales dic.2025 (informe borrador, Tabla 15)
const COMPOSICION_REAL = [
  { sector: "Microcrédito", real: 30.9, minimo: null, fill: "#34D399" },
  { sector: "Vivienda", real: 24.2, minimo: 25, fill: "#F59E0B" },
  { sector: "Empresarial", real: 24.1, minimo: null, fill: "#00E5FF" },
  { sector: "PYME", real: 10.7, minimo: null, fill: "#A78BFA" },
  { sector: "Consumo", real: 10.1, minimo: null, fill: "#EC4899" },
];

// Para el gráfico real vs regulatorio (sector productivo + vivienda = 62% real vs 60% mínimo D.S.4408)
const DATA_REGULATORIO = [
  { name: "Productivo", real: 65.7, minimo: 60 },
  { name: "Vivienda IS", real: 24.2, minimo: 25 },
  { name: "Consumo", real: 10.1, minimo: null },
];

const DECRETOS = [
  { ds: "D.S. N° 1842", año: "2013", contenido: "Fija niveles mínimos de cartera para sector productivo y vivienda de interés social. Establece tasa máxima de 5,5% anual para vivienda social.", color: "#00E5FF" },
  { ds: "D.S. N° 2055", año: "2014", contenido: "Amplía niveles mínimos e incorpora a cooperativas de ahorro y crédito e IFD dentro del régimen de cumplimiento.", color: "#A78BFA" },
  { ds: "D.S. N° 2088", año: "2014", contenido: "Establece tasas de interés máximas para créditos de vivienda de interés social y sector productivo por tipo de entidad.", color: "#34D399" },
  { ds: "D.S. N° 4408", año: "2020", contenido: "Restablece y ajusta niveles mínimos de cartera post-pandemia. Fija 60% combinado (productivo + vivienda) para Bancos Múltiples.", color: "#C4A050" },
];

const ETAPAS_GESTION = [
  { n: 1, titulo: "Evaluación Crediticia", desc: "Análisis de capacidad de pago, flujo de caja, historial CIC y calidad de garantías. Criterios cualitativos y cuantitativos (RNSF Libro 3°).", icon: <IconSearch size={20} />, color: "#00E5FF", art: "Art. 450 Ley N°393" },
  { n: 2, titulo: "Otorgamiento", desc: "Aprobación en comité, formalización contractual y constitución de garantías. Registro en cartera vigente.", icon: <IconFileText size={20} />, color: "#A78BFA", art: "Arts. 45–59 Ley N°393" },
  { n: 3, titulo: "Monitoreo", desc: "Seguimiento periódico del deudor, alerta temprana ante primeros signos de mora. Clasificación actualizada mensualmente.", icon: <IconShield size={20} />, color: "#34D399", art: "RNSF — Libro 3°, Título V" },
  { n: 4, titulo: "Cobranza", desc: "Preventiva (antes del vencimiento) → Administrativa (día 1–30) → Prejudicial (31–90) → Judicial (>90 días de mora).", icon: <IconScale size={20} />, color: "#F59E0B", art: "Art. 96 Ley N°393" },
  { n: 5, titulo: "Reprogramación / Reestructuración", desc: "Modificación de condiciones contractuales por acuerdo. Reprogramación: ajuste de cronograma. Reestructuración: cambios profundos en tasa, plazo o capitalización.", icon: <IconRepeat size={20} />, color: "#C4A050", art: "Arts. 504–506 Ley N°393" },
  { n: 6, titulo: "Castigo de Cartera", desc: "Solo cuando la EIF ha constituido el 100% de previsiones (categoría E). Es reconocimiento contable de la pérdida, NO condonación. El deudor mantiene su obligación legal.", icon: <IconTrash size={20} />, color: "#EF4444", art: "Art. 91 Ley N°393" },
];

const REPROG_VS_REESTRUC = [
  { campo: "Definición", reprog: "Ajuste del cronograma de pagos (plazo, monto de cuotas) sin cambiar condiciones esenciales del crédito.", reest: "Cambios profundos en las condiciones: capitalización de intereses, modificación de tasa, ampliación significativa del plazo." },
  { campo: "Causa", reprog: "Factores externos o coyunturales que afectan temporalmente la capacidad de pago.", reest: "Dificultades financieras estructurales del deudor que requieren rediseño del crédito." },
  { campo: "Efecto en cartera", reprog: "El crédito pasa a cartera reprogramada. Su calificación depende del cumplimiento posterior.", reest: "Mayor impacto en previsiones. Puede mantenerse en mora si el deudor no cumple las nuevas condiciones." },
  { campo: "Normativa ASFI", reprog: "RNSF — Libro 3°, Título VIII. No requiere autorización previa de ASFI.", reest: "Arts. 504–506 Ley N°393. Plan de Regularización. Puede requerir notificación a ASFI según magnitud." },
];

// ─── TOOLTIP PERSONALIZADO ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="fund-tooltip">
        <p className="fund-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || "#00E5FF" }}>
            {p.name}: <strong>{p.value}%</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── COMPONENTES DE SECCIÓN ───────────────────────────────────────────────────

function SeccionHero() {
  return (
    <div className="fund-hero">
      <div className="fund-hero-glow" />
      <span className="fund-tag">Ley N° 393 · ASFI · RNSF</span>
      <h1 className="fund-hero-title">
        Fundamentos de la<br />
        <span className="fund-accent-cyan">Cartera de Créditos</span>
      </h1>
      <p className="fund-hero-sub">
        Marco conceptual, normativo y de gestión del sistema financiero boliviano
      </p>
      <div className="fund-hero-pills">
        <span className="fund-pill fund-pill-cyan">Capítulo I — Marco Conceptual</span>
        <span className="fund-pill fund-pill-gold">Capítulo II — Marco Regulatorio</span>
        <span className="fund-pill fund-pill-muted">Capítulo V — Gestión de Cartera</span>
      </div>
    </div>
  );
}

function SeccionTiposCartera() {
  const [activo, setActivo] = useState(null);
  return (
    <section className="fund-section">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo I · 1.3</span>
        <h2 className="fund-section-title">Tipos de Cartera según su Estado</h2>
        <p className="fund-section-desc">
          Clasificación de la cartera en función del cumplimiento del deudor, base del riesgo crediticio.
        </p>
      </div>
      <div className="fund-cartera-grid">
        {TIPOS_CARTERA.map((t) => {
          const abierto = activo === t.id;
          return (
            <div
              key={t.id}
              className={`fund-cartera-card${abierto ? " fund-cartera-card--open" : ""}`}
              style={{ "--card-color": t.color }}
              onClick={() => setActivo(abierto ? null : t.id)}
            >
              <div className="fund-cartera-card-top">
                <div className="fund-cartera-icon" style={{ color: t.color }}>{t.icon}</div>
                <div className="fund-cartera-info">
                  <h3 className="fund-cartera-nombre">{t.nombre}</h3>
                  <p className="fund-cartera-corto">{t.corto}</p>
                </div>
                <div className="fund-cartera-toggle">
                  {abierto ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                </div>
              </div>
              <div className="fund-cartera-badges">
                <span className="fund-badge" style={{ borderColor: t.color, color: t.color }}>
                  Riesgo: {t.riesgo}
                </span>
                <span className="fund-badge fund-badge-muted">{t.prevision}</span>
              </div>
              {abierto && (
                <div className="fund-cartera-expand">
                  <p className="fund-cartera-desc">{t.descripcion}</p>
                  <div className="fund-cartera-norm">
                    <IconFileText size={14} />
                    <span>{t.normativa}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SeccionTiposCredito() {
  const [tab, setTab] = useState("empresarial");
  const actual = TIPOS_CREDITO.find((t) => t.id === tab);
  return (
    <section className="fund-section">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo I · 1.4</span>
        <h2 className="fund-section-title">Tipos de Crédito — Ley N° 393</h2>
        <p className="fund-section-desc">
          Arts. 45–59: cinco modalidades según destino, perfil del prestatario y condiciones económicas.
        </p>
      </div>
      <div className="fund-tabs">
        {TIPOS_CREDITO.map((t) => (
          <button
            key={t.id}
            className={`fund-tab${tab === t.id ? " fund-tab--active" : ""}`}
            style={tab === t.id ? { borderBottomColor: t.color, color: t.color } : {}}
            onClick={() => setTab(t.id)}
          >
            <span className="fund-tab-icon" style={{ color: t.color }}>{t.icon}</span>
            {t.nombre}
          </button>
        ))}
      </div>
      {actual && (
        <div className="fund-credito-panel" style={{ "--panel-color": actual.color }}>
          <div className="fund-credito-panel-header">
            <div className="fund-credito-panel-icon" style={{ color: actual.color }}>{actual.icon}</div>
            <div>
              <h3 style={{ color: actual.color }}>{actual.nombre}</h3>
              <span className="fund-credito-arts">{actual.arts} · Ley N° 393</span>
            </div>
          </div>
          <p className="fund-credito-desc">{actual.descripcion}</p>
          <div className="fund-credito-meta-grid">
            <div className="fund-meta-item">
              <span className="fund-meta-label">Monto referencial</span>
              <span className="fund-meta-val">{actual.monto}</span>
            </div>
            <div className="fund-meta-item">
              <span className="fund-meta-label">Tasa de interés</span>
              <span className="fund-meta-val">{actual.tasa}</span>
            </div>
            <div className="fund-meta-item">
              <span className="fund-meta-label">Garantías típicas</span>
              <span className="fund-meta-val">{actual.garantia}</span>
            </div>
            <div className="fund-meta-item">
              <span className="fund-meta-label">Entidades autorizadas</span>
              <span className="fund-meta-val">{actual.entidades}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SeccionCiclo() {
  const [hover, setHover] = useState(null);
  return (
    <section className="fund-section">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo I · 1.5</span>
        <h2 className="fund-section-title">El Ciclo del Crédito</h2>
        <p className="fund-section-desc">
          Proceso completo desde la solicitud hasta la recuperación del capital en el sistema financiero boliviano.
        </p>
      </div>
      <div className="fund-ciclo-container">
        {CICLO_PASOS.map((paso, idx) => (
          <div key={idx} className="fund-ciclo-item">
            <div
              className={`fund-ciclo-card${hover === idx ? " fund-ciclo-card--hover" : ""}`}
              style={{ "--step-color": paso.color }}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="fund-ciclo-numero" style={{ color: paso.color }}>{paso.n}</div>
              <div className="fund-ciclo-emoji">{paso.icon}</div>
              <h4 className="fund-ciclo-label" style={{ color: paso.color }}>{paso.label}</h4>
              <p className="fund-ciclo-desc">{paso.desc}</p>
            </div>
            {idx < CICLO_PASOS.length - 1 && (
              <div className="fund-ciclo-arrow">
                <IconArrowRight size={20} color="rgba(255,255,255,0.25)" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SeccionMarcoNormativo() {
  const [abierto, setAbierto] = useState(null);
  return (
    <section className="fund-section fund-section--dark">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo II · 2.3</span>
        <h2 className="fund-section-title">Marco Normativo — Arts. 66 al 69</h2>
        <p className="fund-section-desc">
          Ley N° 393 de Servicios Financieros: mandato constitucional de niveles mínimos de cartera.
        </p>
      </div>
      <div className="fund-acordeon">
        {ARTICULOS_NORMATIVOS.map((a) => {
          const open = abierto === a.art;
          return (
            <div
              key={a.art}
              className={`fund-acordeon-item${open ? " fund-acordeon-item--open" : ""}`}
              style={{ "--ac-color": a.color }}
            >
              <button
                className="fund-acordeon-header"
                onClick={() => setAbierto(open ? null : a.art)}
              >
                <div className="fund-acordeon-titulo">
                  <span className="fund-acordeon-art" style={{ color: a.color }}>{a.art}</span>
                  <span className="fund-acordeon-nombre">{a.titulo}</span>
                </div>
                {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              </button>
              {open && (
                <div className="fund-acordeon-body">
                  <div className="fund-cita-block" style={{ borderLeftColor: a.color }}>
                    <p>{a.resumen}</p>
                  </div>
                  <div className="fund-implicancia">
                    <span className="fund-implicancia-label">Implicancia práctica:</span>
                    <p>{a.implicancia}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SeccionGraficoSectores() {
  return (
    <section className="fund-section">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo II · 2.3 — Datos ASFI Dic. 2025</span>
        <h2 className="fund-section-title">Composición Real vs. Mínimo Regulatorio</h2>
        <p className="fund-section-desc">
          Participación efectiva de la cartera por sector al cierre de diciembre 2025, contrastada
          con los mínimos exigidos por D.S. N°1842 y N°4408.
        </p>
      </div>

      <div className="fund-graficos-row">
        {/* Gráfico barras — composición real */}
        <div className="fund-grafico-card">
          <h4 className="fund-grafico-titulo">Composición por Tipo de Crédito — Dic. 2025</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={COMPOSICION_REAL} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <XAxis dataKey="sector" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="real" name="Participación real" radius={[4, 4, 0, 0]}>
                {COMPOSICION_REAL.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="fund-grafico-fuente">Fuente: ASFI — Evaluación del Sistema Financiero, Dic. 2025</p>
        </div>

        {/* Gráfico real vs mínimo regulatorio */}
        <div className="fund-grafico-card">
          <h4 className="fund-grafico-titulo">Real vs. Mínimo Regulatorio (D.S. N°4408)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DATA_REGULATORIO} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 80]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="real" name="Real Dic. 2025" fill="#00E5FF" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Bar dataKey="minimo" name="Mínimo D.S. N°4408" fill="#C4A050" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
          <p className="fund-grafico-fuente">Productivo incluye: Microcrédito + PYME + Empresarial · Mínimo 60% combinado para Bancos Múltiples</p>
        </div>
      </div>

      {/* Decretos supremos */}
      <div className="fund-section-header" style={{ marginTop: "2.5rem" }}>
        <span className="fund-section-tag">Capítulo II · 2.5</span>
        <h3 className="fund-section-title" style={{ fontSize: "1.3rem" }}>Decretos Supremos Complementarios</h3>
      </div>
      <div className="fund-decretos-grid">
        {DECRETOS.map((d) => (
          <div key={d.ds} className="fund-decreto-card" style={{ "--ds-color": d.color }}>
            <div className="fund-decreto-header">
              <span className="fund-decreto-ds" style={{ color: d.color }}>{d.ds}</span>
              <span className="fund-decreto-año">{d.año}</span>
            </div>
            <p className="fund-decreto-contenido">{d.contenido}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeccionGestionCartera() {
  const [expandido, setExpandido] = useState(null);
  return (
    <section className="fund-section fund-section--dark">
      <div className="fund-section-header">
        <span className="fund-section-tag">Capítulo V — Gestión de Cartera</span>
        <h2 className="fund-section-title">Proceso de Gestión Crediticia</h2>
        <p className="fund-section-desc">
          Desde la evaluación hasta el castigo: etapas reguladas por la Ley N° 393 y la RNSF-ASFI.
        </p>
      </div>

      <div className="fund-gestion-timeline">
        {ETAPAS_GESTION.map((e) => {
          const open = expandido === e.n;
          return (
            <div
              key={e.n}
              className={`fund-gestion-step${open ? " fund-gestion-step--open" : ""}`}
              style={{ "--step-c": e.color }}
              onClick={() => setExpandido(open ? null : e.n)}
            >
              <div className="fund-gestion-step-left">
                <div className="fund-gestion-numero" style={{ background: e.color + "20", color: e.color, borderColor: e.color + "40" }}>
                  {e.n}
                </div>
                <div className="fund-gestion-linea" style={{ background: open ? e.color + "60" : "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="fund-gestion-step-right">
                <div className="fund-gestion-step-header">
                  <div className="fund-gestion-icon-wrap" style={{ color: e.color }}>{e.icon}</div>
                  <h4 className="fund-gestion-titulo" style={{ color: e.color }}>{e.titulo}</h4>
                  <span className="fund-gestion-art">{e.art}</span>
                  <div className="fund-gestion-toggle">
                    {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                  </div>
                </div>
                {open && <p className="fund-gestion-desc">{e.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reprog vs Reestruc */}
      <div className="fund-section-header" style={{ marginTop: "3rem" }}>
        <h3 className="fund-section-title" style={{ fontSize: "1.3rem" }}>
          Reprogramación vs. Reestructuración
        </h3>
        <p className="fund-section-desc">Arts. 504–506 Ley N° 393</p>
      </div>
      <div className="fund-comparacion-table">
        <div className="fund-comp-header">
          <div className="fund-comp-campo" />
          <div className="fund-comp-col fund-comp-col--cyan">
            <IconRepeat size={18} /> Reprogramación
          </div>
          <div className="fund-comp-col fund-comp-col--gold">
            <IconRefresh size={18} /> Reestructuración
          </div>
        </div>
        {REPROG_VS_REESTRUC.map((r, i) => (
          <div key={i} className="fund-comp-row">
            <div className="fund-comp-campo">{r.campo}</div>
            <div className="fund-comp-col">{r.reprog}</div>
            <div className="fund-comp-col">{r.reest}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Fundamentos() {
  return (
    <main className="fund-main">
      <SeccionHero />
      <SeccionTiposCartera />
      <SeccionTiposCredito />
      <SeccionCiclo />
      <SeccionMarcoNormativo />
      <SeccionGraficoSectores />
      <SeccionGestionCartera />
    </main>
  );
}
