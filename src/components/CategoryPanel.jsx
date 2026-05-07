// src/components/CategoryPanel.jsx
import { useState, useEffect } from 'react'

// ─── Panel lateral desktop ────────────────────────────────────────────────────
function DesktopPanel({ categories, selected, onSelect, primary, bgColors }) {
  const bg = bgColors?.length > 0
    ? `linear-gradient(180deg, ${bgColors[0]}dd, ${bgColors[bgColors.length-1]}dd)`
    : 'rgba(10,10,24,0.85)'

  return (
    <div style={{
      width: 200, flexShrink: 0,
      position: 'sticky', top: 100,
      alignSelf: 'flex-start',
    }}>
      <div style={{
        background: bg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${primary}20`,
        borderRadius: 20,
        padding: '16px 12px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${primary}10`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: `${primary}90`, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, paddingLeft: 8 }}>
          Categorías
        </div>

        {/* Todos */}
        <button onClick={() => onSelect(null)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 10px', borderRadius: 12, marginBottom: 4,
          background: !selected ? `${primary}18` : 'transparent',
          border: !selected ? `1px solid ${primary}30` : '1px solid transparent',
          color: !selected ? primary : 'rgba(255,255,255,0.5)',
          fontSize: 13, fontWeight: !selected ? 700 : 400, cursor: 'pointer',
          textAlign: 'left', transition: 'all 0.15s',
        }}>
          <span style={{ fontSize: 15 }}>🏪</span>
          <span>Todos</span>
        </button>

        {categories.map(cat => (
          <button key={cat.id} onClick={() => onSelect(cat.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 12, marginBottom: 4,
            background: selected === cat.id ? `${primary}18` : 'transparent',
            border: selected === cat.id ? `1px solid ${primary}30` : '1px solid transparent',
            color: selected === cat.id ? primary : 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: selected === cat.id ? 700 : 400, cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (selected !== cat.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (selected !== cat.id) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 15 }}>{cat.emoji || '📦'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Chips horizontales móvil ─────────────────────────────────────────────────
function MobileChips({ categories, selected, onSelect, primary }) {
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
      scrollbarWidth: 'none', msOverflowStyle: 'none',
    }}>
      <style>{'.cat-chips::-webkit-scrollbar{display:none}'}</style>
      <button className="cat-chips" onClick={() => onSelect(null)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 50, flexShrink: 0,
        background: !selected ? `${primary}18` : 'rgba(255,255,255,0.05)',
        border: !selected ? `1px solid ${primary}35` : '1px solid rgba(255,255,255,0.08)',
        color: !selected ? primary : 'rgba(255,255,255,0.4)',
        fontSize: 12, fontWeight: !selected ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        🏪 Todos
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => onSelect(cat.id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 50, flexShrink: 0,
          background: selected === cat.id ? `${primary}18` : 'rgba(255,255,255,0.05)',
          border: selected === cat.id ? `1px solid ${primary}35` : '1px solid rgba(255,255,255,0.08)',
          color: selected === cat.id ? primary : 'rgba(255,255,255,0.4)',
          fontSize: 12, fontWeight: selected === cat.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          {cat.emoji || '📦'} {cat.name}
        </button>
      ))}
    </div>
  )
}

export default function CategoryPanel({ categories = [], selected, onSelect, primary = '#7c83fd', bgColors = [], isMobile = false }) {
  if (categories.length === 0) return null

  if (isMobile) return <MobileChips categories={categories} selected={selected} onSelect={onSelect} primary={primary}/>
  return <DesktopPanel categories={categories} selected={selected} onSelect={onSelect} primary={primary} bgColors={bgColors}/>
}