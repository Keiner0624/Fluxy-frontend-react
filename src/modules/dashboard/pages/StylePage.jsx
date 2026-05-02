// src/modules/dashboard/pages/StylePage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

const PRESETS = [
  {
    id: 'cosmic',
    name: 'Cosmic Dark',
    description: 'Oscuro con destellos violetas',
    preview: 'linear-gradient(135deg, #06060f, #1a0a2e)',
    config: {
      bgType: 'animated-gradient',
      colors: ['#06060f', '#1a0a2e', '#0d1a3e'],
      primary: '#7c83fd',
      animation: 'mesh',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Verde y azul como el norte',
    preview: 'linear-gradient(135deg, #061a14, #0a2e1a)',
    config: {
      bgType: 'animated-gradient',
      colors: ['#06130f', '#0a2e1a', '#061a2e'],
      primary: '#34d399',
      animation: 'wave',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Cálido con tonos dorados',
    preview: 'linear-gradient(135deg, #1a0a06, #2e1a06)',
    config: {
      bgType: 'animated-gradient',
      colors: ['#1a0806', '#2e1206', '#1a1506'],
      primary: '#f59e0b',
      animation: 'pulse',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Profundo como el mar',
    preview: 'linear-gradient(135deg, #06101a, #06182e)',
    config: {
      bgType: 'animated-gradient',
      colors: ['#06101a', '#06182e', '#060e1a'],
      primary: '#38bdf8',
      animation: 'flow',
    },
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    description: 'Elegante y femenino',
    preview: 'linear-gradient(135deg, #1a0612, #2e0618)',
    config: {
      bgType: 'animated-gradient',
      colors: ['#1a060e', '#2e0614', '#1a0618'],
      primary: '#f43f5e',
      animation: 'mesh',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Dark',
    description: 'Limpio y profesional',
    preview: 'linear-gradient(135deg, #0a0a0a, #141414)',
    config: {
      bgType: 'solid',
      colors: ['#0a0a0a'],
      primary: '#ffffff',
      animation: 'none',
    },
  },
]

const PRIMARY_COLORS = [
  { color: '#7c83fd', name: 'Violeta' },
  { color: '#34d399', name: 'Verde' },
  { color: '#f59e0b', name: 'Dorado' },
  { color: '#38bdf8', name: 'Azul' },
  { color: '#f43f5e', name: 'Rosa' },
  { color: '#a78bfa', name: 'Lavanda' },
  { color: '#fb923c', name: 'Naranja' },
  { color: '#ffffff', name: 'Blanco' },
]

const ANIMATIONS = [
  { key: 'none',  label: 'Sin animación',    icon: '⬜' },
  { key: 'mesh',  label: 'Mesh gradiente',   icon: '🌐' },
  { key: 'wave',  label: 'Olas suaves',      icon: '🌊' },
  { key: 'pulse', label: 'Pulso radial',     icon: '💫' },
  { key: 'flow',  label: 'Flujo de colores', icon: '🎨' },
]

export default function StylePage() {
  const [style, setStyle] = useState({
    preset: 'cosmic',
    primary: '#7c83fd',
    bgType: 'animated-gradient',
    colors: ['#06060f', '#1a0a2e', '#0d1a3e'],
    animation: 'mesh',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('storeStyle')
    if (saved) setStyle(JSON.parse(saved))
  }, [])

  const applyPreset = (preset) => {
    setStyle({ preset: preset.id, ...preset.config })
  }

  const handleSave = async () => {
    setSaving(true)
    const company = JSON.parse(localStorage.getItem('company') || '{}') || {}
    const slug = company.slug || 'default'
    
    console.log('[StylePage] Saving style for company:', company)
    console.log('[StylePage] Slug:', slug)
    console.log('[StylePage] Style to save:', style)
    
    // Guardar en localStorage con la clave del slug de la tienda
    const storeStyleKey = `storeStyle_${slug}`
    localStorage.setItem(storeStyleKey, JSON.stringify(style))
    console.log(`[StylePage] Saved to localStorage key: ${storeStyleKey}`)
    
    // También guardar como clave genérica para compatibilidad
    localStorage.setItem('storeStyle', JSON.stringify(style))
    console.log('[StylePage] Saved to generic key: storeStyle')
    
    try {
      await fetch(`${API_URL}/companies/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ storeStyle: JSON.stringify(style) }),
      })
      console.log('[StylePage] Backend save successful')
    } catch (err) {
      console.error('[StylePage] Backend save failed:', err)
      // No crítico si falla
    }
    setSuccess('✅ Estilo guardado.')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const previewBg = () => {
    if (style.colors.length === 1) return style.colors[0]
    return `linear-gradient(135deg, ${style.colors.join(', ')})`
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
          Panel de vendedor
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>
          Estilo de tu tienda
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Personaliza los colores, fondos y animaciones de tu tienda.
        </p>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 20, alignItems: 'start' }}>

        {/* Controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Presets */}
          <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              🎨 Temas prediseñados
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {PRESETS.map(preset => (
                <button key={preset.id} type="button" onClick={() => applyPreset(preset)} style={{
                  padding: '0', border: style.preset === preset.id
                    ? '2px solid var(--primary)'
                    : '2px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  transition: 'all 0.2s', background: 'transparent',
                  boxShadow: style.preset === preset.id ? '0 0 20px rgba(124,131,253,0.3)' : 'none',
                }}>
                  {/* Preview color */}
                  <div style={{ height: 52, background: preset.preview }}/>
                  <div style={{ padding: '8px 10px', background: 'rgba(13,13,26,0.95)', textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{preset.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{preset.description}</div>
                  </div>
                  {style.preset === preset.id && (
                    <div style={{ background: 'var(--primary)', padding: '4px', textAlign: 'center', fontSize: 11, color: 'white', fontWeight: 600 }}>
                      ✓ Activo
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color primario */}
          <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              🎯 Color de acento
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Color de botones, precios y elementos destacados de tu tienda.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {PRIMARY_COLORS.map(c => (
                <button key={c.color} type="button" onClick={() => setStyle(s => ({ ...s, primary: c.color, preset: 'custom' }))} style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: c.color, border: style.primary === c.color
                    ? '3px solid white'
                    : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: style.primary === c.color ? `0 0 16px ${c.color}80` : 'none',
                  position: 'relative',
                }} title={c.name}>
                  {style.primary === c.color && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: c.color === '#ffffff' ? '#000' : '#fff' }}>✓</span>
                  )}
                </button>
              ))}
              {/* Custom color */}
              <div style={{ position: 'relative' }}>
                <input type="color" value={style.primary}
                  onChange={e => setStyle(s => ({ ...s, primary: e.target.value, preset: 'custom' }))}
                  style={{ width: 44, height: 44, borderRadius: 12, border: '2px dashed rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent', padding: 2 }}
                  title="Color personalizado"
                />
                <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Custom</div>
              </div>
            </div>
            {/* Preview color */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: style.primary, boxShadow: `0 0 10px ${style.primary}60` }}/>
              <span style={{ fontSize: 13, color: style.primary, fontWeight: 600 }}>{style.primary}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— Color seleccionado</span>
            </div>
          </div>

          {/* Tipo de fondo */}
          <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              🖼️ Fondo de la tienda
            </div>

            {/* Colores del gradiente */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Colores del gradiente:</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {style.colors.map((color, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={color}
                      onChange={e => {
                        const newColors = [...style.colors]
                        newColors[i] = e.target.value
                        setStyle(s => ({ ...s, colors: newColors, preset: 'custom' }))
                      }}
                      style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2 }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Color {i + 1}</span>
                  </div>
                ))}
                {style.colors.length < 4 && (
                  <button type="button" onClick={() => setStyle(s => ({ ...s, colors: [...s.colors, '#1a1a2e'], preset: 'custom' }))} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)',
                    color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                )}
                {style.colors.length > 1 && (
                  <button type="button" onClick={() => setStyle(s => ({ ...s, colors: s.colors.slice(0, -1), preset: 'custom' }))} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                    color: '#f87171', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>−</button>
                )}
              </div>
            </div>

            {/* Preview gradiente */}
            <div style={{
              height: 60, borderRadius: 12, background: previewBg(),
              border: '1px solid rgba(255,255,255,0.08)', marginBottom: 4,
              transition: 'background 0.3s',
            }}/>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vista previa del fondo</div>
          </div>

          {/* Animaciones */}
          <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              ✨ Animación de fondo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ANIMATIONS.map(anim => (
                <button key={anim.key} type="button"
                  onClick={() => setStyle(s => ({ ...s, animation: anim.key, preset: 'custom' }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    background: style.animation === anim.key ? 'rgba(124,131,253,0.12)' : 'rgba(255,255,255,0.03)',
                    border: style.animation === anim.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    color: style.animation === anim.key ? 'var(--primary)' : 'var(--text-soft)',
                    fontSize: 14, fontWeight: style.animation === anim.key ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  }}>
                  <span style={{ fontSize: 20 }}>{anim.icon}</span>
                  <span>{anim.label}</span>
                  {style.animation === anim.key && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Success */}
          {success && (
            <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#34d399' }}>
              {success}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '15px', borderRadius: 14,
            background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 8px 24px rgba(124,131,253,0.25)',
          }}>
            {saving ? 'Guardando...' : '💾 Aplicar estilo'}
          </button>
        </div>

        {/* Preview tienda */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
              Vista previa
            </div>

            {/* Preview */}
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
              {/* "Pantalla" */}
              <div style={{
                background: previewBg(),
                padding: '20px 16px',
                minHeight: 320,
                position: 'relative',
              }}>
                {/* Glow animado */}
                {style.animation !== 'none' && (
                  <div style={{
                    position: 'absolute', top: '20%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 200, height: 200,
                    background: `radial-gradient(circle, ${style.primary}30 0%, transparent 70%)`,
                    animation: 'pulse 3s ease infinite',
                    pointerEvents: 'none',
                  }}/>
                )}

                {/* Header tienda */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
                  borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: style.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#000' }}>F</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>Mi Tienda</span>
                  </div>
                  <div style={{ background: style.primary, borderRadius: 50, padding: '3px 8px', fontSize: 9, fontWeight: 700, color: '#000' }}>🛒 0</div>
                </div>

                {/* Hero */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: `${style.primary}20`, border: `1px solid ${style.primary}40`,
                    borderRadius: 50, padding: '3px 10px', marginBottom: 8,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: style.primary }}/>
                    <span style={{ fontSize: 9, color: style.primary, fontWeight: 600 }}>Tienda oficial • Fluxy</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: "'Fraunces', serif", lineHeight: 1.2, marginBottom: 6 }}>
                    Bienvenido a <span style={{ color: style.primary }}>tu tienda</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    Productos de calidad con atención directa...
                  </div>
                </div>

                {/* Botón */}
                <div style={{
                  background: style.primary,
                  borderRadius: 10, padding: '8px 14px',
                  fontSize: 11, fontWeight: 700,
                  color: '#000', display: 'inline-block',
                  marginBottom: 14,
                }}>Ver productos →</div>

                {/* Cards producto mock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['📦', '🛍️'].map((emoji, i) => (
                    <div key={i} style={{
                      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, overflow: 'hidden',
                    }}>
                      <div style={{ height: 52, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji}</div>
                      <div style={{ padding: '7px 8px' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Producto {i + 1}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: style.primary }}>S/ 25.00</div>
                        <div style={{ marginTop: 6, background: style.primary, borderRadius: 5, padding: '3px', textAlign: 'center', fontSize: 8, fontWeight: 700, color: '#000' }}>+ Agregar</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Vista previa del estilo aplicado
            </div>
          </div>

          {/* Info preset activo */}
          <div style={{
            background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>
              Tema activo
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>
              {style.preset === 'custom' ? 'Personalizado' : PRESETS.find(p => p.id === style.preset)?.name || 'Custom'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Animación: {ANIMATIONS.find(a => a.key === style.animation)?.label}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}