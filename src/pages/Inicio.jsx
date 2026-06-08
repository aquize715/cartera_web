import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconBook2,
  IconChartBar,
  IconArrowUpRight,
} from '@tabler/icons-react'
import './Inicio.css'

const stats = [
  { value: 'Bs 226.7B', label: 'Cartera Total', accent: 'cyan' },
  { value: '3.0%', label: 'Morosidad', accent: 'gold' },
  { value: '48.3%', label: 'Cartera Productiva', accent: null },
]

const navCards = [
  {
    to: '/fundamentos',
    variant: 'cyan',
    icon: <IconBook2 size={20} />,
    title: 'Fundamentos',
    desc: 'Marco regulatorio, tipos de crédito y clasificación de cartera',
  },
  {
    to: '/indicadores',
    variant: 'gold',
    icon: <IconChartBar size={20} />,
    title: 'Indicadores',
    desc: 'Morosidad, cobertura, concentración y evolución histórica',
  },
]

export default function Inicio() {
  const [videoAbierto, setVideoAbierto] = useState(false)

  return (
    <div className="inicio">
      <section className="hero">
        <div className="hero__glow-cyan" />
        <div className="hero__glow-gold" />

        <div className="hero__content">
          {/* Tag superior */}
          <div className="hero__tag">
            <span className="hero__tag-dot" />
            UMSA · Finanzas y Operaciones Bancarias · 2026
          </div>

          {/* Título */}
          <h1 className="hero__title">
            Cartera de Créditos en el
            <span className="hero__title-break">
              {' '}
              <span className="hero__title-gold">Sistema Financiero</span>{' '}
              <span className="hero__title-cyan">Boliviano</span>
            </span>
          </h1>

          {/* Stats */}
          <div className="hero__stats">
            {stats.map(({ value, label, accent }) => (
              <div key={label} className="hero__stat">
                <span
                  className={
                    'hero__stat-value' +
                    (accent === 'cyan' ? ' hero__stat-value--cyan' : '') +
                    (accent === 'gold' ? ' hero__stat-value--gold' : '')
                  }
                >
                  {value}
                </span>
                <span className="hero__stat-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div className="hero__separator">
            <div className="hero__separator-line" />
            <span className="hero__separator-label">Explorar secciones</span>
            <div className="hero__separator-line" />
          </div>

          {/* Nav cards */}
          <div className="hero__nav-cards">
            {navCards.map(({ to, variant, icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className={`hero__nav-card hero__nav-card--${variant}`}
              >
                <div className={`hero__nav-card-icon hero__nav-card-icon--${variant}`}>
                  {icon}
                </div>
                <span className="hero__nav-card-title">{title}</span>
                <span className="hero__nav-card-desc">{desc}</span>
                <IconArrowUpRight size={16} className="hero__nav-card-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN RECURSOS */}
      <section className="recursos-section">
        <div className="recursos-header">
          <span className="section-label">ENTREGABLES DEL PROYECTO</span>
          <h2 className="recursos-titulo">Recursos del Proyecto</h2>
          <p className="recursos-subtitulo">Documentos académicos y materiales complementarios del Grupo 1</p>
        </div>

        <div className="recursos-grid">
          <a
            href="https://drive.google.com/file/d/1xNEc9Cnqfs-izJnNBCSt7yDEyQLnRwq8/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="recurso-card"
          >
            <div className="recurso-icon recurso-word">📄</div>
            <div className="recurso-info">
              <span className="recurso-tipo">WORD</span>
              <h3 className="recurso-nombre">Informe Académico</h3>
              <p className="recurso-desc">Documento formal completo del proyecto</p>
            </div>
            <span className="recurso-accion">Abrir ↗</span>
          </a>

          <a
            href="https://drive.google.com/file/d/1Pd542hqg7IFHGSVJ8Oix0jV7GqL9qgoj/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="recurso-card"
          >
            <div className="recurso-icon recurso-pdf">🗺️</div>
            <div className="recurso-info">
              <span className="recurso-tipo">PDF</span>
              <h3 className="recurso-nombre">Infografía</h3>
              <p className="recurso-desc">Resumen visual del sistema de cartera</p>
            </div>
            <span className="recurso-accion">Abrir ↗</span>
          </a>

          <a
            href="https://drive.google.com/file/d/1QKYiYDJ15rJvZTrAe5lRx115vf4oLLbW/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="recurso-card"
          >
            <div className="recurso-icon recurso-pptx">📊</div>
            <div className="recurso-info">
              <span className="recurso-tipo">PPTX</span>
              <h3 className="recurso-nombre">Diapositivas</h3>
              <p className="recurso-desc">Presentación para la defensa oral</p>
            </div>
            <span className="recurso-accion">Abrir ↗</span>
          </a>

          <div
            className="recurso-card recurso-card-video"
            onClick={() => setVideoAbierto(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className="recurso-icon recurso-video">▶️</div>
            <div className="recurso-info">
              <span className="recurso-tipo">VIDEO</span>
              <h3 className="recurso-nombre">Video Explicativo</h3>
              <p className="recurso-desc">Presentación audiovisual del proyecto</p>
            </div>
            <span className="recurso-accion">Ver ▶</span>
          </div>
        </div>

        {videoAbierto && (
          <div className="video-modal-overlay" onClick={() => setVideoAbierto(false)}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="video-modal-close" onClick={() => setVideoAbierto(false)}>✕</button>
              <iframe
                src="https://drive.google.com/file/d/1PvthbpOcYlQssyog2avwDubFFmCVuyTA/preview"
                width="100%"
                height="100%"
                allow="autoplay"
                title="Video Explicativo"
                style={{ border: 'none', borderRadius: '8px' }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
