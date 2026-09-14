// src/modules/landing/pages/TermsPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

import { CURRENT_LEGAL_VERSION, PUBLISHED_LEGAL_DOCUMENTS, getLegalDocument, legalUrl } from '../legal/documents'
import '../legal/legal.css'

const DOCS = [
  { key: 'terms',   label: 'Términos y condiciones' },
  { key: 'privacy', label: 'Política de privacidad' },
]
const EMPTY_SECTIONS = []

export default function TermsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const doc = searchParams.get('doc') === 'privacy' ? 'privacy' : 'terms'
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [draftError, setDraftError] = useState(false)
  const version = searchParams.get('version') || CURRENT_LEGAL_VERSION
  const isDraft = import.meta.env.DEV && version === '2026-09-13-draft'
  const legalDocument = isDraft ? draft : getLegalDocument(version)
  const sections = legalDocument?.sections[doc] ?? EMPTY_SECTIONS

  useEffect(() => {
    let active = true
    if (import.meta.env.DEV && isDraft) {
      import('../../../../docs/legal/2026-09-13.draft.json')
        .then(module => { if (active) setDraft(module.default) })
        .catch(() => { if (active) setDraftError(true) })
    }
    return () => { active = false }
  }, [isDraft])

  // Marca en el índice la sección visible al hacer scroll
  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(`sec-${s.id}`))
      .filter(Boolean)
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveId(visible.target.id.replace('sec-', ''))
      },
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [sections])

  const selectDoc = (key) => {
    setSearchParams({ doc: key, version })
    setActiveId(null)
    window.scrollTo({ top: 0 })
  }

  if (!legalDocument) {
    return <div className="fx fx-legal"><main className="fx-legal__shell">
      <h1>{isDraft && !draftError ? 'Cargando borrador…' : 'Versión no disponible'}</h1>
      <p>{isDraft && !draftError ? 'Vista previa local; no es una versión publicada.' : 'Esta versión no está publicada. No se ha sustituido por otro documento.'}</p>
      <Link to={legalUrl(doc)} className="fx-btn fx-btn--primary">Ver documento vigente</Link>
    </main></div>
  }

  return (
    <div className="fx fx-legal">
      <header className="fx-legal__nav">
        <div className="fx-legal__nav-inner">
          <Link to="/">
            <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
          </Link>
          <Link to="/" className="fx-btn fx-btn--ghost fx-btn--sm">
            <Icon name="arrowLeft" size={15} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="fx-legal__shell">
        <div className="fx-legal__header">
          <span className="fx-eyebrow">Documentos legales</span>
          <h1 className="fx-legal__title">{DOCS.find((d) => d.key === doc).label}</h1>
          <p className="fx-hint">Última actualización: {legalDocument.updatedAt} · Versión {legalDocument.version}</p>
          {isDraft && <div className="fx-alert fx-alert--error fx-legal__draft" role="status">
            Demostración con datos de prueba, solo visible en desarrollo. No es la versión vigente ni se solicita su aceptación.
            Antes de publicarla deben confirmarse los datos legales reales y la revisión jurídica y operativa.
          </div>}
          <div className="fx-legal__tools">
            <label htmlFor="legal-version">Historial de versiones</label>
            <select id="legal-version" className="fx-input" value={version} onChange={event => { setSearchParams({ doc, version: event.target.value }); setActiveId(null) }}>
              {Object.keys(PUBLISHED_LEGAL_DOCUMENTS).map(value => <option key={value} value={value}>{value} · publicada</option>)}
              {import.meta.env.DEV && <option value="2026-09-13-draft">2026-09-13 · borrador local</option>}
            </select>
            <button type="button" className="fx-btn fx-btn--secondary" onClick={() => window.print()}>Imprimir documento</button>
          </div>
        </div>

        <nav className="fx-legal__tabs" aria-label="Documento legal">
          {DOCS.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={doc === d.key}
              className={`fx-legal__tab${doc === d.key ? ' fx-legal__tab--on' : ''}`}
              onClick={() => selectDoc(d.key)}
            >
              {d.label}
            </button>
          ))}
        </nav>

        <div className="fx-legal__body">
          <nav className="fx-legal__toc" aria-label="Índice">
            <p className="fx-eyebrow" style={{ marginBottom: 12 }}>Contenido</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#sec-${s.id}`}
                    className={activeId === s.id ? 'is-active' : undefined}
                    onClick={() => setActiveId(s.id)}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="fx-legal__doc">
            {sections.map((s) => (
              <section key={s.id} id={`sec-${s.id}`} className="fx-legal__section">
                <h2>{s.title}</h2>
                {s.content.split('\n\n').map((block, i) => {
                  const lines = block.split('\n')
                  const isList = lines.every((l) => l.trim().startsWith('•'))
                  if (isList) {
                    return (
                      <ul key={i}>
                        {lines.map((l, j) => <li key={j}>{l.replace(/^\s*•\s*/, '')}</li>)}
                      </ul>
                    )
                  }
                  return <p key={i}>{block}</p>
                })}
              </section>
            ))}
          </article>
        </div>

        <footer className="fx-legal__foot">
          <p className="fx-hint">
            ¿Dudas sobre estos documentos? Escribinos a{' '}
            <a href={`mailto:${isDraft ? legalDocument.provider.contactEmail : 'soporte@fluxyweb.com'}`} className="fx-auth__link">{isDraft ? legalDocument.provider.contactEmail : 'soporte@fluxyweb.com'}</a>.
          </p>
          <Link to="/" className="fx-btn fx-btn--secondary fx-btn--sm">Volver al inicio</Link>
        </footer>
      </div>
    </div>
  )
}

