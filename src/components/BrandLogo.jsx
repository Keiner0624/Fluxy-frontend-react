export default function BrandLogo({
  size = 36,
  gap = 10,
  showWordmark = true,
  textSize = 20,
  textColor = 'white',
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
            fontFamily: "'Fraunces', serif",
            fontSize: textSize,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.3px',
            ...textStyle,
          }}
        >
          Fluxy
        </span>
      )}
    </div>
  )
}
