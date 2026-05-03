// src/modules/dashboard/pages/StylePage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PlanGate from '../../auth/components/PlanGate'
import usePlan from '../../../hooks/usePlan'
import { API_URL } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

const PRESETS = [
  { id: 'cosmic', name: 'Cosmic Dark', description: 'Oscuro con destellos violetas', preview: 'linear-gradient(135deg, #06060f, #1a0a2e)', config: { bgType: 'animated-gradient', colors: ['#06060f', '#1a0a2e', '#0d1a3e'], primary: '#7c83fd', animation: 'mesh' } },
  { id: 'aurora', name: 'Aurora', description: 'Verde y azul como el norte', preview: 'linear-gradient(135deg, #061a14, #0a2e1a)', config: { bgType: 'animated-gradient', colors: ['#06130f', '#0a2e1a', '#061a2e'], primary: '#34d399', animation: 'wave' } },
  { id: 'sunset', name: 'Sunset', description: 'Cálido con tonos dorados', preview: 'linear-gradient(135deg, #1a0a06, #2e1a06)', config: { bgType: 'animated-gradient', colors: ['#1a0806', '#2e1206', '#1a1506'], primary: '#f59e0b', animation: 'pulse' } },
  { id: 'ocean', name: 'Ocean', description: 'Profundo como el mar', preview: 'linear-gradient(135deg, #06101a, #06182e)', config: { bgType: 'animated-gradient', colors: ['#06101a', '#06182e', '#060e1a'], primary: '#38bdf8', animation: 'flow' } },
  { id: 'rose', name: 'Rose Gold', description: 'Elegante y femenino', preview: 'linear-gradient(135deg, #1a0612, #2e0618)', config: { bgType: 'animated-gradient', colors: ['#1a060e', '#2e0614', '#1a0618'], primary: '#f43f5e', animation: 'mesh' } },
  { id: 'minimal', name: 'Minimal Dark', description: 'Limpio y profesional', preview: 'linear-gradient(135deg, #0a0a0a, #141414)', config: { bgType: 'solid', colors: ['#0a0a0a'], primary: '#ffffff', animation: 'none' } },
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

function StyleContent() {
  const [style, setStyle] = useState({ preset: 'cosmic', primary: '#7c83fd', bgType: 'animated-gradient', colors: ['#06060f', '#1a0a2e', '#0d1a3e'], animation: 'mesh' })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('storeStyle')
    if (saved) setStyle(JSON.parse(saved))
  }, [])

  const applyPreset = (preset) => setStyle({ preset: preset.id, ...preset.config })

  const handleSave = async () => {
    setSaving(true)
    const company = JSON.parse(localStorage.getItem('company') || '{}') || {}
    const slug = company.slug || 'default'
    localStorage.setItem(`storeStyle_${slug}`, JSON.stringify(style))
    localStorage.setItem('storeStyle', JSON.stringify(style))
    try {
      await fetch(`${API_URL}/companies/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ storeStyle: JSON.stringify(style) }),
      })
    } catch { /* no crítico */ }
    setSuccess('✅ Estilo guardado.')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const previewBg = () => style.colors.length === 1 ? style.colors[0] : `linear-gradient(135deg, ${style.colors.join(', ')})`

  return (
    <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Presets */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🎨 Temas prediseñados</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {PRESETS.map(preset => (
              <button key={preset.id} type="button" onClick={() => applyPreset(preset)} style={{
                padding: 0, border: style.preset === preset.id ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.06)',
                borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent',
                boxShadow: style.preset === preset.id ? '0 0 20px rgba(124,131,253,0.3)' : 'none',
              }}>
                <div style={{ height: 52, background: preset.preview }}/>
                <div style={{ padding: '8px 10px', background: 'rgba(13,13,26,0.95)', textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{preset.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{preset.description}</div>
                </div>
                {style.preset === preset.id && <div style={{ background: 'var(--primary)', padding: '4px', textAlign: 'center', fontSize: 11, color: 'white', fontWeight: 600 }}>✓ Activo</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Color primario */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🎯 Color de acento</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {PRIMARY_COLORS.map(c => (
              <button key={c.color} type="button" onClick={() => setStyle(s => ({ ...s, primary: c.color, preset: 'custom' }))} style={{ width: 44, height: 44, borderRadius: 12, background: c.color, border: style.primary === c.color ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', boxShadow: style.primary === c.color ? `0 0 16px ${c.color}80` : 'none', position: 'relative' }} title={c.name}>
                {style.primary === c.color && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: c.color === '#ffffff' ? '#000' : '#fff' }}>✓</span>}
              </button>
            ))}
            <input type="color" value={style.primary} onChange={e => setStyle(s => ({ ...s, primary: e.target.value, preset: 'custom' }))} style={{ width: 44, height: 44, borderRadius: 12, border: '2px dashed rgba(255,255,255,0.2)', cursor: 'pointer', padding: 2 }} title="Custom"/>
          </div>
        </div>

        {/* Fondo */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>🖼️ Fondo de la tienda</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {style.colors.map((color, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={color} onChange={e => { const nc = [...style.colors]; nc[i] = e.target.value; setStyle(s => ({ ...s, colors: nc, preset: 'custom' })) }} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2 }}/>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Color {i + 1}</span>
              </div>
            ))}
            {style.colors.length < 4 && <button type="button" onClick={() => setStyle(s => ({ ...s, colors: [...s.colors, '#1a1a2e'], preset: 'custom' }))} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>}
            {style.colors.length > 1 && <button type="button" onClick={() => setStyle(s => ({ ...s, colors: s.colors.slice(0, -1), preset: 'custom' }))} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>}
          </div>
          <div style={{ height: 60, borderRadius: 12, background: previewBg(), border: '1px solid rgba(255,255,255,0.08)', marginBottom: 4, transition: 'background 0.3s' }}/>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vista previa del fondo</div>
        </div>

        {/* Animaciones */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>✨ Animación de fondo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ANIMATIONS.map(anim => (
              <button key={anim.key} type="button" onClick={() => setStyle(s => ({ ...s, animation: anim.key, preset: 'custom' }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: style.animation === anim.key ? 'rgba(124,131,253,0.12)' : 'rgba(255,255,255,0.03)', border: style.animation === anim.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.06)', color: style.animation === anim.key ? 'var(--primary)' : 'var(--text-soft)', fontSize: 14, fontWeight: style.animation === anim.key ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                <span style={{ fontSize: 20 }}>{anim.icon}</span>
                <span>{anim.label}</span>
                {style.animation === anim.key && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#34d399' }}>{success}</div>}

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '15px', borderRadius: 14, background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 8px 24px rgba(124,131,253,0.25)' }}>
          {saving ? 'Guardando...' : '💾 Aplicar estilo'}
        </button>
      </div>
    </div>
  )
}

export default function StylePage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Estilo de tu tienda</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Personaliza los colores, fondos y animaciones de tu tienda.</p>
      </div>

      {!loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <StyleContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}