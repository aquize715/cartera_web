import './Footer.css'

const sources = ['ASFI', 'Ley N°393', 'BCB']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__left">
          <span className="footer__group">Grupo 1 · UMSA 2026</span>
          <span className="footer__year">Finanzas y Operaciones Bancarias — FIN-709</span>
        </div>
        <div className="footer__sources">
          <span className="footer__sources-label">Fuentes</span>
          {sources.map((s, i) => (
            <span key={s} className="footer__source-tag">{s}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
