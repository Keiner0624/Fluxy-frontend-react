// src/modules/dashboard/components/ui.jsx
// Piezas compartidas por las páginas del panel: mismos tamaños, mismos estados.
import { useEffect, useRef } from 'react'
import Icon from '@/components/Icon'
import { isoDay, rangeFromPreset } from '@/app/format'

// ─── Modal ───────────────────────────────────────────────────────────────────

// Con modales anidados (cancelar dentro del detalle), Escape cierra solo el de arriba.
const openModals = []

export function Modal({ title, subtitle, onClose, children, footer, width = 560, as: Tag = 'div', onSubmit, closable = true }) {
  // En un ref: onClose suele ser una función nueva en cada render y no debe
  // reordenar la pila de modales abiertos.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    const token = {}
    openModals.push(token)
    const onKey = (e) => {
      if (e.key === 'Escape' && openModals[openModals.length - 1] === token) onCloseRef.current()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      openModals.splice(openModals.indexOf(token), 1)
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="fx-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
      <Tag
        className="fx-modal__panel"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        noValidate={Tag === 'form' ? true : undefined}
      >
        <div className="fx-modal__head">
          <div style={{ minWidth: 0 }}>
            <h2 className="fx-h2 fx-truncate">{title}</h2>
            {subtitle && <p className="fx-hint" style={{ marginTop: 2 }}>{subtitle}</p>}
          </div>
          {closable && (
            <button type="button" className="fx-btn fx-btn--ghost fx-btn--icon" onClick={onClose} aria-label="Cerrar">
              <Icon name="close" size={17} />
            </button>
          )}
        </div>
        <div className="fx-modal__body">{children}</div>
        {footer && <div className="fx-modal__foot">{footer}</div>}
      </Tag>
    </div>
  )
}

export function ConfirmDialog({ title, text, confirmLabel = 'Confirmar', danger = false, busy = false, onConfirm, onClose, children }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      width={440}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose} disabled={busy}>Volver</button>
          <button type="button" className={`fx-btn ${danger ? 'fx-btn--danger' : 'fx-btn--primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? <><span className="fx-spinner" /> Procesando…</> : confirmLabel}
          </button>
        </>
      )}
    >
      {text && <p className="fx-hint" style={{ fontSize: 14 }}>{text}</p>}
      {children}
    </Modal>
  )
}

// ─── Estados ─────────────────────────────────────────────────────────────────

export function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div className="fx-empty">
      <div className="fx-empty__icon"><Icon name={icon} size={20} /></div>
      <p className="fx-empty__title">{title}</p>
      {text && <p className="fx-empty__text">{text}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="fx-alert fx-alert--error" role="alert" style={{ alignItems: 'center' }}>
      <Icon name="alert" size={16} />
      <span style={{ flex: 1 }}>{error?.message || 'No se pudo cargar la información.'}</span>
      {onRetry && (
        <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => onRetry()}>
          <Icon name="refresh" size={14} /> Reintentar
        </button>
      )}
    </div>
  )
}

/** Módulo al que la persona no tiene acceso: explica por qué en vez de mostrar una pantalla vacía. */
export function NoAccess({ module }) {
  return (
    <div className="fx-gate">
      <div className="fx-gate__icon"><Icon name="lock" size={20} /></div>
      <h2 className="fx-h2">Sin acceso a {module}</h2>
      <p className="fx-gate__text">
        Tu rol no incluye este módulo. Si lo necesitás, pedile al dueño del negocio que ajuste tus permisos desde Equipo.
      </p>
    </div>
  )
}

// ─── Indicadores ─────────────────────────────────────────────────────────────

export function StatCard({ label, icon, value, foot, delta, deltaLabel, loading, tone }) {
  if (loading) {
    return (
      <div className="fx-stat">
        <div className="fx-skeleton" style={{ width: 96, height: 12 }} />
        <div className="fx-skeleton" style={{ width: 80, height: 24, marginTop: 12 }} />
        <div className="fx-skeleton" style={{ width: 120, height: 11, marginTop: 9 }} />
      </div>
    )
  }
  return (
    <div className={`fx-stat${tone ? ` fx-stat--${tone}` : ''}`}>
      <span className="fx-stat__label">{icon && <Icon name={icon} size={14} />}{label}</span>
      <p className="fx-stat__value">{value}</p>
      {(foot || delta !== undefined) && (
        <p className="fx-stat__foot">
          {delta === null ? (
            // Sin valor anterior no hay porcentaje que mostrar.
            <span>Sin período anterior para comparar</span>
          ) : delta !== undefined ? (
            <>
              <span className={`fx-stat__delta${delta > 0 ? ' fx-stat__delta--up' : delta < 0 ? ' fx-stat__delta--down' : ''}`}>
                {delta !== 0 && <Icon name={delta > 0 ? 'arrowUp' : 'arrowDown'} size={12} />}
                {delta > 0 ? '+' : ''}{delta}%
              </span>
              {' '}{deltaLabel || foot}
            </>
          ) : foot}
        </p>
      )}
    </div>
  )
}

export function Badge({ config, fallback }) {
  if (!config) return <span className="fx-badge">{fallback}</span>
  return (
    <span className={`fx-badge ${config.badge || ''}`}>
      {config.icon && <Icon name={config.icon} size={12} />}
      {config.label}
    </span>
  )
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, totalElements, size, onChange, noun = 'resultados' }) {
  if (!totalElements) return null
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)
  return (
    <div className="fx-pager">
      <span className="fx-hint">{from}–{to} de {totalElements} {noun}</span>
      <div className="fx-row" style={{ gap: 6 }}>
        <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          <Icon name="arrowLeft" size={14} /> Anterior
        </button>
        <span className="fx-hint fx-num">{page + 1} / {Math.max(totalPages, 1)}</span>
        <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
          Siguiente <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Período ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { key: '7', label: 'Últimos 7 días' },
  { key: '30', label: 'Últimos 30 días' },
  { key: '90', label: 'Últimos 90 días' },
  { key: 'month', label: 'Este mes' },
  { key: '365', label: 'Último año' },
  { key: 'custom', label: 'Personalizado' },
]

export function RangePicker({ value, onChange }) {
  return (
    <div className="fx-range-picker">
      <select
        className="fx-select"
        value={value.preset}
        onChange={(e) => onChange(e.target.value === 'custom' ? { ...value, preset: 'custom' } : rangeFromPreset(e.target.value))}
        aria-label="Período"
      >
        {PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
      {value.preset === 'custom' && (
        <>
          <input type="date" className="fx-input" value={value.from} max={value.to}
            onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })} aria-label="Desde" />
          <input type="date" className="fx-input" value={value.to} min={value.from} max={isoDay(new Date())}
            onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })} aria-label="Hasta" />
        </>
      )}
    </div>
  )
}

// ─── Gráfico de columnas ─────────────────────────────────────────────────────

export function ColumnChart({ data, valueKey, labelKey, format = (v) => v, height = 180, emptyText = 'Sin datos en el período.' }) {
  if (!data?.length || data.every((d) => !Number(d[valueKey]))) {
    return <p className="fx-chart__empty">{emptyText}</p>
  }
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  const labelEvery = Math.ceil(data.length / 12)
  return (
    <div className="fx-bars" style={{ height }} role="img" aria-label="Gráfico de columnas">
      {data.map((item, i) => {
        const value = Number(item[valueKey]) || 0
        return (
          <div key={item[labelKey] ?? i} className="fx-bars__col" title={`${item[labelKey]}: ${format(value)}`}>
            <div className="fx-bars__track">
              <div className="fx-bars__fill" style={{ height: `${Math.max((value / max) * 100, value ? 2 : 0)}%` }} />
            </div>
            <span className="fx-bars__label fx-truncate" style={{ visibility: i % labelEvery === 0 ? 'visible' : 'hidden' }}>
              {String(item[labelKey]).length === 10 ? String(item[labelKey]).slice(5) : item[labelKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Barra horizontal con porcentaje, para rankings y participación. */
export function ShareBar({ label, value, max, right }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value ? 2 : 0) : 0
  return (
    <div className="fx-share">
      <div className="fx-row fx-row--between" style={{ gap: 12 }}>
        <span className="fx-truncate" style={{ fontSize: 13.5, color: 'var(--fx-ink)' }}>{label}</span>
        <span className="fx-num fx-hint" style={{ whiteSpace: 'nowrap' }}>{right}</span>
      </div>
      <div className="fx-share__track"><div className="fx-share__fill" style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
