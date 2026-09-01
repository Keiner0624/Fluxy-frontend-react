// src/components/Skeleton.jsx
// Los estilos del shimmer viven en styles/app.css (.fx-skeleton).

function SkeletonBase({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="fx-skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  )
}

// ─── Tarjeta de producto ─────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="fx-card" style={{ overflow: 'hidden' }}>
      <SkeletonBase height={150} borderRadius={0} />
      <div style={{ padding: 16 }}>
        <SkeletonBase width="72%" height={15} />
        <SkeletonBase width="42%" height={13} style={{ marginTop: 9 }} />
        <SkeletonBase width="34%" height={19} style={{ marginTop: 14 }} />
      </div>
    </div>
  )
}

// ─── Fila de pedido ──────────────────────────────────────────────────────────
export function OrderRowSkeleton() {
  return (
    <tr>
      {[36, 140, 90, 70, 80].map((w, i) => (
        <td key={i} style={{ padding: '13px 16px', borderBottom: '1px solid var(--fx-line)' }}>
          <SkeletonBase width={w} height={13} />
        </td>
      ))}
    </tr>
  )
}

// ─── Indicador ───────────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="fx-stat">
      <SkeletonBase width={90} height={12} />
      <SkeletonBase width={70} height={26} style={{ marginTop: 12 }} />
      <SkeletonBase width={110} height={12} style={{ marginTop: 9 }} />
    </div>
  )
}

// ─── Tarjeta genérica del panel ──────────────────────────────────────────────
export function DashboardCardSkeleton() {
  return (
    <div className="fx-card">
      <div className="fx-card__body">
        <SkeletonBase width="46%" height={15} />
        <SkeletonBase width="100%" height={13} style={{ marginTop: 14 }} />
        <SkeletonBase width="82%" height={13} style={{ marginTop: 9 }} />
      </div>
    </div>
  )
}

export default SkeletonBase
