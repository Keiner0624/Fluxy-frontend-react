// src/components/Skeleton.jsx

// ─── Animación shimmer ────────────────────────────────────────────────────────
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
`

function SkeletonBase({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '600px 100%',
        animation: 'shimmer 1.4s infinite linear',
        flexShrink: 0,
        ...style,
      }}/>
    </>
  )
}

// ─── Skeleton para cards de productos ────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Imagen */}
      <SkeletonBase height={180} borderRadius={0}/>
      {/* Info */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SkeletonBase height={16} width="70%"/>
        <SkeletonBase height={12} width="90%"/>
        <SkeletonBase height={12} width="60%"/>
        <SkeletonBase height={28} width="45%"/>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <SkeletonBase height={36} borderRadius={10}/>
          <SkeletonBase height={36} width={44} borderRadius={10}/>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton para filas de pedidos ──────────────────────────────────────────
export function OrderRowSkeleton() {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <SkeletonBase width={44} height={44} borderRadius={12}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBase height={14} width="50%"/>
        <SkeletonBase height={11} width="35%"/>
      </div>
      <SkeletonBase height={12} width={80}/>
      <SkeletonBase height={20} width={70}/>
      <SkeletonBase height={28} width={90} borderRadius={50}/>
    </div>
  )
}

// ─── Skeleton para stat cards ─────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <SkeletonBase width={28} height={28} borderRadius={8}/>
      <SkeletonBase height={28} width="50%"/>
      <SkeletonBase height={12} width="65%"/>
    </div>
  )
}

// ─── Skeleton para dashboard card ────────────────────────────────────────────
export function DashboardCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <SkeletonBase width={40} height={40} borderRadius={11}/>
      <SkeletonBase height={15} width="55%"/>
      <SkeletonBase height={12} width="75%"/>
    </div>
  )
}

export default SkeletonBase