// src/modules/dashboard/pages/StylePage.jsx
// Estilo de la tienda: color de acento e imagen de portada, con vista previa
// fiel a la tienda pública.
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import PlanGate from '@/components/PlanGate'
import usePlan from '@/hooks/usePlan'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import { getCompanyStoreUrl } from '@/app/config'
import { getMyCompany, invalidateAccount } from '@/app/account'
import { uploadImage } from '@/app/cloudinary'
import { parseStoreStyle, storeThemeVars } from '@/modules/store/lib/storeTheme'

const COLORS = [
  { color: '#d92d20', name: 'Rojo' },
  { color: '#ea580c', name: 'Naranja' },
  { color: '#ca8a04', name: 'Mostaza' },
  { color: '#16a34a', name: 'Verde' },
  { color: '#0d9488', name: 'Turquesa' },
  { color: '#2563eb', name: 'Azul' },
  { color: '#7c3aed', name: 'Violeta' },
  { color: '#db2777', name: 'Rosa' },
  { color: '#111827', name: 'Grafito' },
]

const DEFAULT_PRIMARY = '#d92d20'

function StorePreview({ style, company, mobile }) {
  const vars = storeThemeVars(JSON.stringify(style))
  const accent = vars['--sf-accent']
  const ink = vars['--sf-accent-ink']
  const onAccent = vars['--sf-on-accent']
  const soft = `color-mix(in srgb, ${accent} 10%, #fff)`
  const name = company?.name || 'Mi tienda'
  const cards = mobile ? 2 : 4

  return (
    <div style={{ background: '#f7f5f2', fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif", color: '#17171c' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff', borderBottom: '1px solid #ebe7e1' }}>
        {company?.logoUrl
          ? <img src={company.logoUrl} alt="" style={{ width: 26, height: 26, borderRadius: 8, objectFit: 'cover' }} />
          : <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: accent, color: onAccent, fontSize: 12, fontWeight: 800 }}>{name[0]?.toUpperCase()}</span>}
        <strong style={{ color: ink, fontSize: 13, fontWeight: 800 }}>{name}</strong>
        {!mobile && (
          <span style={{ display: 'flex', gap: 12, margin: '0 auto', fontSize: 10, color: '#4f5159', fontWeight: 600 }}>
            <span style={{ color: ink, borderBottom: `2px solid ${accent}` }}>Inicio</span><span>Productos</span><span>Nosotros</span>
          </span>
        )}
        <span style={{ marginLeft: mobile ? 'auto' : 0, position: 'relative' }}>
          <Icon name="cart" size={16} />
          <b style={{ position: 'absolute', top: -6, right: -8, minWidth: 13, height: 13, borderRadius: 99, background: accent, color: onAccent, fontSize: 8, display: 'grid', placeItems: 'center' }}>2</b>
        </span>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.1fr .9fr', gap: 12, alignItems: 'center', padding: mobile ? 14 : 18, borderRadius: 16, background: `linear-gradient(118deg, color-mix(in srgb, ${accent} 9%, #fff6ee), #fff)` }}>
          <div>
            <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 99, background: soft, color: ink, fontSize: 8, fontWeight: 700 }}>● Tienda oficial</span>
            <div style={{ margin: '6px 0 4px', color: ink, fontSize: mobile ? 18 : 22, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05 }}>{name}</div>
            <div style={{ color: '#4f5159', fontSize: 9, lineHeight: 1.5 }}>{company?.description?.slice(0, 80) || 'Elegí tus productos y armá tu pedido en un minuto.'}</div>
            <span style={{ display: 'inline-block', marginTop: 8, padding: '6px 10px', borderRadius: 8, background: accent, color: onAccent, fontSize: 9, fontWeight: 700 }}>Ver productos →</span>
          </div>
          <div style={{ height: mobile ? 90 : 110, borderRadius: 12, background: style.bgImage ? `center/cover url(${style.bgImage})` : `radial-gradient(circle, ${soft}, #fff 70%)`, display: 'grid', placeItems: 'center', color: ink }}>
            {!style.bgImage && <Icon name="image" size={24} />}
          </div>
        </div>

        <div style={{ margin: '12px 2px 8px', fontSize: 11, fontWeight: 800 }}>Productos destacados</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards}, 1fr)`, gap: 8 }}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} style={{ overflow: 'hidden', border: '1px solid #ebe7e1', borderRadius: 12, background: '#fff' }}>
              <div style={{ height: 46, background: `linear-gradient(135deg, ${soft}, #f3efea)`, display: 'grid', placeItems: 'center', color: ink }}><Icon name="package" size={16} /></div>
              <div style={{ padding: 6 }}>
                <div style={{ fontSize: 8.5, fontWeight: 700 }}>Producto {i + 1}</div>
                <div style={{ margin: '2px 0 5px', color: ink, fontSize: 10, fontWeight: 800 }}>S/ {(12 + i * 9).toFixed(2)}</div>
                <div style={{ padding: 3, borderRadius: 6, background: accent, color: onAccent, fontSize: 8, fontWeight: 700, textAlign: 'center' }}>Agregar</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StyleContent() {
  const cached = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const [company, setCompany] = useState(cached)
  const [style, setStyle] = useState(() => ({ primary: DEFAULT_PRIMARY, bgImage: '', ...parseStoreStyle(cached.storeStyle) }))
  const [saved, setSaved] = useState(style)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const fileRef = useRef(null)

  useEffect(() => {
    let vigente = true
    getMyCompany({ force: true }).then((data) => {
      if (!vigente || !data) return
      const current = { primary: DEFAULT_PRIMARY, bgImage: '', ...parseStoreStyle(data.storeStyle) }
      setCompany(data)
      setStyle(current)
      setSaved(current)
    }).catch(() => {})
    return () => { vigente = false }
  }, [])

  const effective = storeThemeVars(JSON.stringify(style))['--sf-accent']
  const adjusted = effective.toLowerCase() !== String(style.primary).toLowerCase()
  const dirty = style.primary !== saved.primary || (style.bgImage || '') !== (saved.bgImage || '')

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Elegí una imagen.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no puede pesar más de 5 MB.'); return }
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setStyle((s) => ({ ...s, bgImage: url }))
    } catch {
      toast.error('No se pudo subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      // Se conservan las claves que no edita esta pantalla (versiones anteriores del estilo).
      const payload = JSON.stringify({ ...parseStoreStyle(company.storeStyle), primary: style.primary, bgImage: style.bgImage || '' })
      const updated = await api.put('/companies/config', { storeStyle: payload })
      const next = { ...company, ...updated, storeStyle: payload }
      setCompany(next)
      setSaved(style)
      localStorage.setItem('company', JSON.stringify({ ...cached, storeStyle: payload, storeUrl: getCompanyStoreUrl(next) }))
      invalidateAccount('company')
      toast.success('Estilo guardado. Ya se ve en tu tienda.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = getCompanyStoreUrl(company)

  return (
    <div className="fx-style">
      <div className="fx-style__controls">
        <div className="fx-card">
          <div className="fx-card__head"><h2 className="fx-h3">Color de la tienda</h2></div>
          <div className="fx-card__body">
            <p className="fx-hint" style={{ marginBottom: 12 }}>Se usa en botones, precios, el nombre de la tienda y los detalles.</p>
            <div className="fx-swatches">
              {COLORS.map((c) => (
                <button key={c.color} type="button" title={c.name} aria-label={c.name} aria-pressed={style.primary === c.color}
                  className={`fx-swatch${style.primary === c.color ? ' is-on' : ''}`} style={{ background: c.color }}
                  onClick={() => setStyle((s) => ({ ...s, primary: c.color }))} />
              ))}
            </div>
            <div className="fx-row" style={{ gap: 10, marginTop: 14 }}>
              <input type="color" className="fx-color" value={/^#[0-9a-f]{6}$/i.test(style.primary) ? style.primary : DEFAULT_PRIMARY}
                onChange={(e) => setStyle((s) => ({ ...s, primary: e.target.value }))} aria-label="Color personalizado" />
              <span className="fx-hint">Color personalizado · {style.primary}</span>
            </div>
            {adjusted && (
              <div className="fx-alert fx-alert--warn" style={{ marginTop: 12 }}>
                <Icon name="info" size={16} />
                <span>Ese color es muy claro para leerse sobre fondo blanco. La tienda usará {effective}.</span>
              </div>
            )}
          </div>
        </div>

        <div className="fx-card">
          <div className="fx-card__head"><h2 className="fx-h3">Imagen de portada</h2></div>
          <div className="fx-card__body">
            {style.bgImage ? (
              <>
                <div className="fx-bgpreview" style={{ backgroundImage: `url(${style.bgImage})` }} />
                <div className="fx-row" style={{ gap: 8, marginTop: 12 }}>
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Icon name="upload" size={15} /> Cambiar
                  </button>
                  <button type="button" className="fx-btn fx-btn--danger fx-btn--sm" onClick={() => setStyle((s) => ({ ...s, bgImage: '' }))}>
                    <Icon name="trash" size={15} /> Quitar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="fx-hint" style={{ marginBottom: 12 }}>
                  Opcional. Se muestra grande en la portada. Si no subís una, usamos la foto de tu producto destacado. Ideal: horizontal, 1200 × 900 px.
                </p>
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <><span className="fx-spinner" /> Subiendo…</> : <><Icon name="upload" size={15} /> Subir imagen</>}
                </button>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="fx-btn fx-btn--primary" onClick={save} disabled={saving || !dirty}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar y aplicar'}
          </button>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setStyle(saved)} disabled={!dirty}>Descartar cambios</button>
          {storeUrl && (
            <a className="fx-btn fx-btn--ghost" href={storeUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}>
              <Icon name="external" size={15} /> Ver tienda
            </a>
          )}
        </div>
      </div>

      <div className="fx-style__preview">
        <div className="fx-card">
          <div className="fx-card__head">
            <h2 className="fx-h3">Vista previa</h2>
            <div className="fx-tabs" style={{ padding: 3 }}>
              <button type="button" className={`fx-tab${previewMode === 'desktop' ? ' fx-tab--on' : ''}`} onClick={() => setPreviewMode('desktop')}>Escritorio</button>
              <button type="button" className={`fx-tab${previewMode === 'mobile' ? ' fx-tab--on' : ''}`} onClick={() => setPreviewMode('mobile')}>Móvil</button>
            </div>
          </div>
          <div className="fx-card__body">
            <div className={previewMode === 'mobile' ? 'fx-preview-frame fx-preview-frame--mobile' : 'fx-preview-frame'}>
              <StorePreview style={style} company={company} mobile={previewMode === 'mobile'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StylePage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Estilo de la tienda</h1>
          <p>Elegí el color y la portada de tu tienda. La vista previa se actualiza al instante.</p>
        </div>
      </div>

      {!loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <StyleContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}
