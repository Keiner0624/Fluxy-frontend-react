// src/modules/dashboard/pages/StylePage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import PlanGate from '@/components/PlanGate'
import usePlan from '@/hooks/usePlan'
import { API_URL, getCompanyStoreUrl } from '@/app/config'
import Icon from '@/components/Icon'
import { uploadImage } from '@/app/cloudinary'


function getToken() { return localStorage.getItem('token') || '' }

const PRESETS = [
  { id: 'cosmic',  name: 'Cosmic Dark',  description: 'Oscuro con destellos violetas', preview: 'linear-gradient(135deg, #06060f, #1a0a2e)', config: { bgType: 'animated-gradient', colors: ['#06060f', '#1a0a2e', '#0d1a3e'], primary: '#7c83fd', animation: 'mesh',  bgImage: '', bgOverlay: 0.5 } },
  { id: 'aurora',  name: 'Aurora',        description: 'Verde y azul como el norte',   preview: 'linear-gradient(135deg, #061a14, #0a2e1a)', config: { bgType: 'animated-gradient', colors: ['#06130f', '#0a2e1a', '#061a2e'], primary: '#34d399', animation: 'wave',  bgImage: '', bgOverlay: 0.5 } },
  { id: 'sunset',  name: 'Sunset',        description: 'Cálido con tonos dorados',     preview: 'linear-gradient(135deg, #1a0a06, #2e1a06)', config: { bgType: 'animated-gradient', colors: ['#1a0806', '#2e1206', '#1a1506'], primary: '#f59e0b', animation: 'pulse', bgImage: '', bgOverlay: 0.5 } },
  { id: 'ocean',   name: 'Ocean',         description: 'Profundo como el mar',         preview: 'linear-gradient(135deg, #06101a, #06182e)', config: { bgType: 'animated-gradient', colors: ['#06101a', '#06182e', '#060e1a'], primary: '#38bdf8', animation: 'flow',  bgImage: '', bgOverlay: 0.5 } },
  { id: 'rose',    name: 'Rose Gold',     description: 'Elegante y femenino',          preview: 'linear-gradient(135deg, #1a0612, #2e0618)', config: { bgType: 'animated-gradient', colors: ['#1a060e', '#2e0614', '#1a0618'], primary: '#f43f5e', animation: 'mesh',  bgImage: '', bgOverlay: 0.5 } },
  { id: 'minimal', name: 'Minimal Dark',  description: 'Limpio y profesional',         preview: 'linear-gradient(135deg, #0a0a0a, #141414)', config: { bgType: 'solid',            colors: ['#0a0a0a'],                        primary: '#ffffff', animation: 'none',  bgImage: '', bgOverlay: 0.5 } },
]

const PRIMARY_COLORS = [
  { color: '#7c83fd', name: 'Violeta' }, { color: '#34d399', name: 'Verde' },
  { color: '#f59e0b', name: 'Dorado' }, { color: '#38bdf8', name: 'Azul' },
  { color: '#f43f5e', name: 'Rosa' },   { color: '#a78bfa', name: 'Lavanda' },
  { color: '#fb923c', name: 'Naranja' }, { color: '#ffffff', name: 'Blanco' },
]

const ANIMATIONS = [
  { key: 'none',  label: 'Sin animación' },
  { key: 'mesh',  label: 'Mesh gradiente' },
  { key: 'wave',  label: 'Olas suaves' },
  { key: 'pulse', label: 'Pulso radial' },
  { key: 'flow',  label: 'Flujo de colores' },
]

const DEFAULT_STYLE = {
  preset: 'cosmic', primary: '#7c83fd', bgType: 'animated-gradient',
  colors: ['#06060f', '#1a0a2e', '#0d1a3e'], animation: 'mesh',
  bgImage: '', bgOverlay: 0.5,
}


// ─── Vista previa de la tienda ────────────────────────────────────────────────
function StorePreview({ style, company }) {
  const bg = style.colors?.length > 1
    ? `linear-gradient(135deg, ${style.colors.join(', ')})`
    : style.colors?.[0] || '#06060f'
  const primary  = style.primary || '#7c83fd'
  const name     = company?.name || 'Mi Tienda'
  const logoUrl  = company?.logoUrl || null

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {/* Browser bar */}
      <div style={{ background: 'rgba(8,8,20,0.95)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          fluxy.app/store/{company?.slug || 'mi-tienda'}
        </div>
      </div>

      {/* Store */}
      <div style={{ minHeight: 460, position: 'relative', overflow: 'hidden', background: bg }}>
        {/* Imagen de fondo */}
        {style.bgImage && (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${style.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
            <div style={{ position: 'absolute', inset: 0, background: bg, opacity: style.bgOverlay ?? 0.5 }}/>
          </>
        )}

        {/* Glow */}
        {style.animation !== 'none' && (
          <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '50%', background: `radial-gradient(circle, ${primary}20 0%, transparent 65%)`, pointerEvents: 'none' }}/>
        )}

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${primary}06 1px, transparent 1px), linear-gradient(90deg, ${primary}06 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header tienda */}
          <div style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {logoUrl ? (
                <img src={logoUrl} alt={name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{name[0]}</div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>via Fluxy</div>
              </div>
            </div>
            <div style={{ background: primary, borderRadius: 8, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#fff' }}>🛒 0</div>
          </div>

          {/* Hero */}
          <div style={{ padding: '22px 16px 14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${primary}18`, border: `1px solid ${primary}35`, borderRadius: 50, padding: '3px 10px', marginBottom: 10 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: primary }}/>
              <span style={{ fontSize: 9, color: primary, fontWeight: 600 }}>Tienda oficial</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 8 }}>
              Bienvenido a <span style={{ color: primary }}>{name}</span>
            </h2>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 12 }}>
              Productos de calidad con atención directa.
            </p>
            <div style={{ background: primary, display: 'inline-block', padding: '6px 14px', borderRadius: 8, fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 18 }}>
              Ver productos →
            </div>

            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>Catálogo</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['📦', '🛍️', '🎁', '🧴'].map((emoji, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: 44, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{emoji}</div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Producto {i + 1}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: primary }}>S/ {(15 + i * 8).toFixed(2)}</div>
                    <div style={{ marginTop: 4, background: primary, borderRadius: 5, padding: '3px', textAlign: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>+ Agregar</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(8,8,20,0.9)', padding: '8px 12px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
        Vista previa en tiempo real
      </div>
    </div>
  )
}

// ─── Controles ───────────────────────────────────────────────────────────────
function StyleContent() {
  const company  = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const slug     = company.slug || 'default'
  const bgImgRef = useRef()

  const getSaved = () => {
    try {
      const s = localStorage.getItem(`storeStyle_${slug}`) || localStorage.getItem('storeStyle')
      return s ? { ...DEFAULT_STYLE, ...JSON.parse(s) } : null
    } catch { return null }
  }

  const [style, setStyle]             = useState(() => getSaved() || { ...DEFAULT_STYLE })
  const [saving, setSaving]           = useState(false)
  const [success, setSuccess]         = useState('')
  const [uploadingBg, setUploadingBg] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', style.primary || '#7c83fd')
  }, [style.primary])

  const applyPreset = (preset) => setStyle(s => ({ ...s, preset: preset.id, ...preset.config }))

  const handleBgImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingBg(true)
    try {
      const url = await uploadImage(file)
      setStyle(s => ({ ...s, bgImage: url, preset: 'custom' }))
    } catch { /* silencioso */ }
    finally { setUploadingBg(false); e.target.value = '' }
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = JSON.stringify(style)
    localStorage.setItem(`storeStyle_${slug}`, payload)
    localStorage.setItem('storeStyle', payload)
    localStorage.setItem('company', JSON.stringify({ ...company, storeStyle: payload, storeUrl: getCompanyStoreUrl(company) }))
    document.documentElement.style.setProperty('--primary', style.primary || '#7c83fd')
    try {
      await fetch(`${API_URL}/companies/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ storeStyle: payload }),
      })
    } catch { /* no crítico */ }
    setSuccess('Estilo guardado y aplicado a tu tienda.')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const handleReset = () => setStyle({ ...DEFAULT_STYLE })

  return (
    <>
      {success && (
        <div className="fx-alert fx-alert--ok" style={{ marginBottom: 16 }}>
          <Icon name="checkCircle" size={16} /><span>{success}</span>
        </div>
      )}

      <div className="fx-style">
        <div className="fx-style__controls">
          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Temas</h2></div>
            <div className="fx-card__body">
              <div className="fx-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`fx-preset${style.preset === p.id ? ' is-on' : ''}`}
                    onClick={() => applyPreset(p)}
                  >
                    <span className="fx-preset__swatch" style={{ background: p.preview }} />
                    <span className="fx-preset__name">{p.name}</span>
                    <span className="fx-preset__desc">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Color principal</h2></div>
            <div className="fx-card__body">
              <div className="fx-swatches">
                {PRIMARY_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    className={`fx-swatch${style.primary === c.color ? ' is-on' : ''}`}
                    style={{ background: c.color }}
                    onClick={() => setStyle(s => ({ ...s, primary: c.color, preset: 'custom' }))}
                  />
                ))}
              </div>
              <div className="fx-row" style={{ gap: 10, marginTop: 14 }}>
                <input
                  type="color"
                  className="fx-color"
                  value={style.primary || '#7c83fd'}
                  onChange={(e) => setStyle(s => ({ ...s, primary: e.target.value, preset: 'custom' }))}
                  aria-label="Color personalizado"
                />
                <span className="fx-code">{style.primary}</span>
              </div>
            </div>
          </div>

          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Animación de fondo</h2></div>
            <div className="fx-card__body">
              <div className="fx-checks">
                {ANIMATIONS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`fx-choice${style.animation === a.key ? ' is-on' : ''}`}
                    onClick={() => setStyle(s => ({ ...s, animation: a.key, preset: 'custom' }))}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Imagen de fondo</h2></div>
            <div className="fx-card__body">
              {style.bgImage ? (
                <>
                  <div className="fx-bgpreview" style={{ backgroundImage: `url(${style.bgImage})` }} />
                  <div className="fx-field" style={{ marginTop: 14 }}>
                    <label className="fx-label" htmlFor="st-overlay">
                      Oscurecer imagen: {Math.round((style.bgOverlay ?? 0.5) * 100)}%
                    </label>
                    <input
                      id="st-overlay"
                      type="range"
                      min="0"
                      max="0.9"
                      step="0.05"
                      className="fx-range"
                      value={style.bgOverlay ?? 0.5}
                      onChange={(e) => setStyle(s => ({ ...s, bgOverlay: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <button className="fx-btn fx-btn--danger fx-btn--sm" onClick={() => setStyle(s => ({ ...s, bgImage: '' }))}>
                    <Icon name="trash" size={15} />
                    Quitar imagen
                  </button>
                </>
              ) : (
                <>
                  <p className="fx-hint" style={{ marginBottom: 12 }}>
                    Opcional. Se muestra detrás del contenido de tu tienda.
                  </p>
                  <input ref={bgImgRef} type="file" accept="image/*" onChange={handleBgImageUpload} style={{ display: 'none' }} />
                  <button className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => bgImgRef.current?.click()} disabled={uploadingBg}>
                    {uploadingBg ? <><span className="fx-spinner" /> Subiendo…</> : <><Icon name="upload" size={15} /> Subir imagen</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="fx-row" style={{ gap: 8 }}>
            <button className="fx-btn fx-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar y aplicar'}
            </button>
            <button className="fx-btn fx-btn--ghost" onClick={handleReset}>Restaurar</button>
          </div>
        </div>

        <div className="fx-style__preview">
          <div className="fx-card">
            <div className="fx-card__head">
              <h2 className="fx-h3">Vista previa</h2>
              <div className="fx-tabs" style={{ padding: 3 }}>
                <button className={`fx-tab${previewMode === 'desktop' ? ' fx-tab--on' : ''}`} onClick={() => setPreviewMode('desktop')}>Escritorio</button>
                <button className={`fx-tab${previewMode === 'mobile' ? ' fx-tab--on' : ''}`} onClick={() => setPreviewMode('mobile')}>Móvil</button>
              </div>
            </div>
            <div className="fx-card__body">
              <div className={previewMode === 'mobile' ? 'fx-preview-frame fx-preview-frame--mobile' : 'fx-preview-frame'}>
                <StorePreview style={style} company={company} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function StylePage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Estilo de la tienda</h1>
          <p>Personalizá colores, fondo y animaciones. La vista previa se actualiza en tiempo real.</p>
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


