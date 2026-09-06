import Icon from '@/components/Icon'

const TRUST_ITEMS = [
  { icon: 'message', title: 'Atención directa', description: 'Coordina cada detalle del pedido directamente con el vendedor.' },
  { icon: 'clock', title: 'Proceso simple', description: 'Elige tus productos, confirma tus datos y recibe una respuesta.' },
  { icon: 'shield', title: 'Datos protegidos', description: 'Tu información se utiliza únicamente para gestionar el pedido.' },
  { icon: 'checkCircle', title: 'Negocio verificado', description: 'La tienda está registrada dentro de la plataforma Fluxy.' },
]

export default function TrustSection() {
  return (
    <section className="store-trust" id="store-confidence">
      <div className="store-container">
        <div className="store-trust__heading">
          <span className="store-section-label">Compra con confianza</span>
          <h2>Una experiencia clara de principio a fin</h2>
          <p>Todo lo necesario para comprar sin fricciones y mantener el contacto con el negocio.</p>
        </div>
        <div className="store-trust__grid">
          {TRUST_ITEMS.map(item => (
            <article key={item.title}>
              <span className="store-trust__icon"><Icon name={item.icon} size={21} /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
