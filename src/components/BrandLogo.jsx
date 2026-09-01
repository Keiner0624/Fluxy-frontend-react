// src/components/BrandLogo.jsx
export default function BrandLogo({
  size = 32,
  gap = 9,
  showWordmark = true,
  textSize = 20,
  textColor = 'currentColor',
  style,
  imageStyle,
  textStyle,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>
      <img
        src="/logo-round.png"
        alt="Fluxy"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: 'block',
          borderRadius: '50%',
          objectFit: 'cover',
          ...imageStyle,
        }}
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: textSize,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.65px',
            ...textStyle,
          }}
        >
          Fluxy
        </span>
      )}
    </div>
  )
}
