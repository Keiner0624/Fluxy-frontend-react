// src/modules/dashboard/pages/StylePage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PlanGate from '../../../components/PlanGate'
import usePlan from '../../../hooks/usePlan'
import { API_URL, getCompanyStoreUrl } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

const CLOUDINARY_CLOUD  = 'dklhbrw7s'
const CLOUDINARY_PRESET = 'fluxy_unsigned'

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
  { key: 'none',  label: 'Sin animación',    icon: '⬜' },
  { key: 'mesh',  label: 'Mesh gradiente',   icon: '🌐' },
  { key: 'wave',  label: 'Olas suaves',      icon: '🌊' },
  { key: 'pulse', label: 'Pulso radial',     icon: '💫' },
  { key: 'flow',  label: 'Flujo de colores', icon: '🎨' },
]

const DEFAULT_STYLE = {
  preset: 'cosmic', primary: '#7c83fd', bgType: 'animated-gradient',
  colors: ['#06060f', '#1a0a2e', '#0d1a3e'], animation: 'mesh',
  bgImage: '', bgOverlay: 0.5,
}

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Error al subir imagen')
  return (await res.json()).secure_url
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

// ─── StyleContent ─────────────────────────────────────────────────────────────
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
      const url = await uploadToCloudinary(file)
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
    setSuccess('✅ Estilo guardado y aplicado a tu tienda.')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const previewBg = () => style.colors?.length > 1
    ? `linear-gradient(135deg, ${style.colors.join(', ')})`
    : style.colors?.[0] || '#06060f'

  return (
    <div className="fluxy-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: 24, alignItems: 'start' }}>

      {/* ── Controles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Presets */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🎨 Temas prediseñados</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10 }}>
            {PRESETS.map(preset => (
              <button key={preset.id} type="button" onClick={() => applyPreset(preset)} style={{
                padding: 0, border: style.preset === preset.id ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.06)',
                borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent',
                boxShadow: style.preset === preset.id ? '0 0 20px rgba(124,131,253,0.3)' : 'none',
              }}>
                <div style={{ height: 46, background: preset.preview }}/>
                <div style={{ padding: '7px 10px', background: 'rgba(13,13,26,0.95)', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 1 }}>{preset.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{preset.description}</div>
                </div>
                {style.preset === preset.id && <div style={{ background: 'var(--primary)', padding: '3px', textAlign: 'center', fontSize: 10, color: 'white', fontWeight: 600 }}>✓ Activo</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Color primario */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🎯 Color de acento</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {PRIMARY_COLORS.map(c => (
              <button key={c.color} type="button" onClick={() => setStyle(s => ({ ...s, primary: c.color, preset: 'custom' }))}
                style={{ width: 42, height: 42, borderRadius: 11, background: c.color, border: style.primary === c.color ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', boxShadow: style.primary === c.color ? `0 0 16px ${c.color}80` : 'none', position: 'relative' }} title={c.name}>
                {style.primary === c.color && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: c.color === '#ffffff' ? '#000' : '#fff' }}>✓</span>}
              </button>
            ))}
            <input type="color" value={style.primary} onChange={e => setStyle(s => ({ ...s, primary: e.target.value, preset: 'custom' }))} style={{ width: 42, height: 42, borderRadius: 11, border: '2px dashed rgba(255,255,255,0.2)', cursor: 'pointer', padding: 2 }} title="Custom"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: style.primary, boxShadow: `0 0 8px ${style.primary}60` }}/>
            <span style={{ fontSize: 12, color: style.primary, fontWeight: 600 }}>{style.primary}</span>
          </div>
        </div>

        {/* Colores del fondo */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🖼️ Colores del fondo</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {style.colors.map((color, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={color} onChange={e => { const nc = [...style.colors]; nc[i] = e.target.value; setStyle(s => ({ ...s, colors: nc, preset: 'custom' })) }} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2 }}/>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Color {i + 1}</span>
              </div>
            ))}
            {style.colors.length < 4 && (
              <button type="button" onClick={() => setStyle(s => ({ ...s, colors: [...s.colors, '#1a1a2e'], preset: 'custom' }))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            )}
            {style.colors.length > 1 && (
              <button type="button" onClick={() => setStyle(s => ({ ...s, colors: s.colors.slice(0, -1), preset: 'custom' }))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            )}
          </div>
          <div style={{ height: 48, borderRadius: 10, background: previewBg(), border: '1px solid rgba(255,255,255,0.08)', transition: 'background 0.3s' }}/>
        </div>

        {/* 🆕 Imagen de fondo */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🌄 Imagen de fondo</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, marginTop: 12, lineHeight: 1.6 }}>
            Sube una foto como fondo de tu tienda. El gradiente se aplica encima para mantener legibilidad. Se adapta automáticamente a escritorio y móvil.
          </p>

          {style.bgImage ? (
            <div style={{ marginBottom: 16 }}>
              {/* Preview con overlay */}
              <div style={{ height: 110, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
                <img src={style.bgImage} alt="fondo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                <div style={{ position: 'absolute', inset: 0, background: previewBg(), opacity: style.bgOverlay ?? 0.5 }}/>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px' }}>Vista previa del overlay</span>
                </div>
                <button type="button" onClick={() => setStyle(s => ({ ...s, bgImage: '', preset: 'custom' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 7, padding: '4px 10px', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  ✕ Quitar
                </button>
              </div>

              {/* Slider opacidad */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Opacidad del gradiente</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{Math.round((style.bgOverlay ?? 0.5) * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={style.bgOverlay ?? 0.5}
                  onChange={e => setStyle(s => ({ ...s, bgOverlay: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>0% — Imagen pura</span>
                  <span>100% — Solo gradiente</span>
                </div>
              </div>

              <button type="button" onClick={() => bgImgRef.current?.click()} style={{ width: '100%', marginTop: 12, padding: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                🔄 Cambiar imagen
              </button>
            </div>
          ) : (
            <>
              <div onClick={() => bgImgRef.current?.click()} style={{
                height: 90, borderRadius: 12, border: '2px dashed rgba(124,131,253,0.25)',
                background: 'rgba(124,131,253,0.04)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, marginBottom: 12, transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'}
              >
                {uploadingBg ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⬆️ Subiendo...</div>
                ) : (
                  <>
                    <span style={{ fontSize: 24 }}>🌄</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Clic para subir imagen de fondo</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>JPG, PNG — Recomendado 1920×1080px</span>
                  </>
                )}
              </div>
              <button type="button" onClick={() => bgImgRef.current?.click()} disabled={uploadingBg} style={{ width: '100%', padding: '10px', background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.2)', borderRadius: 10, color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {uploadingBg ? '⬆️ Subiendo...' : '📤 Subir imagen de fondo'}
              </button>
            </>
          )}
          <input ref={bgImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgImageUpload}/>
        </div>

        {/* Animaciones */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>✨ Animación de fondo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ANIMATIONS.map(anim => (
              <button key={anim.key} type="button" onClick={() => setStyle(s => ({ ...s, animation: anim.key, preset: 'custom' }))} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12,
                background: style.animation === anim.key ? 'rgba(124,131,253,0.12)' : 'rgba(255,255,255,0.03)',
                border: style.animation === anim.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.06)',
                color: style.animation === anim.key ? 'var(--primary)' : 'var(--text-soft)',
                fontSize: 14, fontWeight: style.animation === anim.key ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              }}>
                <span style={{ fontSize: 18 }}>{anim.icon}</span>
                <span>{anim.label}</span>
                {style.animation === anim.key && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#34d399' }}>{success}</div>}

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '15px', borderRadius: 14, background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 8px 24px rgba(124,131,253,0.25)' }}>
          {saving ? 'Guardando...' : '💾 Aplicar estilo a mi tienda'}
        </button>
      </div>

      {/* ── Vista previa ── */}
      <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ key: 'desktop', icon: '🖥️', label: 'Escritorio' }, { key: 'mobile', icon: '📱', label: 'Móvil' }].map(m => (
            <button key={m.key} onClick={() => setPreviewMode(m.key)} style={{
              flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: previewMode === m.key ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
              border: previewMode === m.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)',
              color: previewMode === m.key ? 'var(--primary)' : 'var(--text-muted)',
            }}>{m.icon} {m.label}</button>
          ))}
        </div>

        <div style={{ maxWidth: previewMode === 'mobile' ? 300 : '100%', margin: '0 auto', width: '100%', transition: 'max-width 0.3s ease' }}>
          <StorePreview style={style} company={company} />
        </div>

        {/* Info */}
        <div style={{ background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>Configuración actual</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>
            {style.preset === 'custom' ? 'Personalizado' : PRESETS.find(p => p.id === style.preset)?.name || 'Custom'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {ANIMATIONS.find(a => a.key === style.animation)?.label}
            {style.bgImage ? ' · Con imagen de fondo' : ' · Sin imagen de fondo'}
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
      <style>{`
        @media (max-width: 768px) {
          .fluxy-two-col { grid-template-columns: 1fr !important; }
          .fluxy-sticky { position: relative !important; top: 0 !important; }
        }
      `}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Estilo de tu tienda</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Personaliza colores, imagen de fondo y animaciones. Vista previa en tiempo real.</p>
      </div>

      {!loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <StyleContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}