export default function Hero({ company, loading }) {
    const phone = company?.phone?.replace(/[^0-9]/g, '')
    const waMsg = encodeURIComponent(`¡Hola! 👋 Vi tu tienda *${company?.name}* en Fluxy y quiero hacer un pedido. ¿Me puedes ayudar?`)

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center',
            padding: '120px 32px 80px',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Fondo con gradiente y mesh */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse 80% 60% at 20% 40%, rgba(124,131,253,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 70%, rgba(79,70,229,0.08) 0%, transparent 55%),
          var(--bg)
        `,
                zIndex: 0,
            }}/>

            {/* Grid decorativo */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
                backgroundSize: '64px 64px',
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}/>

            <div style={{
                maxWidth: 1200, margin: '0 auto', width: '100%',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 80, alignItems: 'center',
                position: 'relative', zIndex: 1,
            }}>
                {/* Texto */}
                <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
                    {/* Pill badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(124,131,253,0.08)',
                        border: '1px solid rgba(124,131,253,0.2)',
                        borderRadius: 50, padding: '6px 16px',
                        marginBottom: 28,
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--primary)',
                            boxShadow: '0 0 8px var(--primary)',
                        }}/>
                        <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Tienda oficial • Fluxy
            </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(40px, 5vw, 64px)',
                        fontWeight: 700, lineHeight: 1.05,
                        letterSpacing: '-1.5px',
                        marginBottom: 20, color: 'white',
                    }}>
                        Bienvenido a{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #7c83fd, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
              {loading ? '...' : company?.name || 'nuestra tienda'}
            </span>
                    </h1>

                    <p style={{
                        fontSize: 17, color: 'var(--text-soft)',
                        lineHeight: 1.75, maxWidth: 460,
                        marginBottom: 36, fontWeight: 300,
                    }}>
                        {company?.description || 'Productos de calidad con atención directa y personalizada. Compra segura y respuesta inmediata.'}
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                        <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                    color: 'white', padding: '14px 28px',
                                    borderRadius: 14, fontSize: 15, fontWeight: 600,
                                    boxShadow: '0 8px 32px rgba(124,131,253,0.3)',
                                    transition: 'all 0.3s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,131,253,0.4)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,131,253,0.3)' }}
                        >
                            Ver productos
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M7 17l9.2-9.2M17 17V7H7"/>
                            </svg>
                        </button>

                        {phone && (
                            <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                               style={{
                                   display: 'flex', alignItems: 'center', gap: 8,
                                   background: 'rgba(255,255,255,0.04)',
                                   border: '1px solid rgba(255,255,255,0.1)',
                                   borderRadius: 14, padding: '14px 24px',
                                   fontSize: 15, fontWeight: 500, color: 'white',
                                   transition: 'all 0.3s',
                               }}
                               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Hablar con el vendedor
                            </a>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 32 }}>
                        {[
                            { label: 'Atención directa', icon: '👤' },
                            { label: 'Respuesta rápida', icon: '⚡' },
                            { label: 'Negocio verificado', icon: '✓' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{s.icon}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 500 }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card flotante de info */}
                <div style={{
                    animation: 'fadeUp 0.8s 0.2s ease both',
                    display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    {/* Card principal */}
                    <div style={{
                        background: 'rgba(13,13,26,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 24, padding: 32,
                        backdropFilter: 'blur(20px)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Acento top */}
                        <div style={{
                            position: 'absolute', top: 0, left: 24, right: 24, height: 2,
                            background: 'linear-gradient(to right, transparent, var(--primary), transparent)',
                            borderRadius: 1,
                        }}/>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                                Información de contacto
                            </div>
                            <div style={{ width: 32, height: 2, background: 'var(--primary)', borderRadius: 1 }}/>
                        </div>

                        {[
                            company?.address && { icon: '📍', text: company.address, label: 'Ubicación' },
                            company?.phone   && { icon: '📞', text: company.phone,   label: 'Teléfono' },
                            { icon: '🕐', text: 'Respuesta inmediata', label: 'Atención' },
                            { icon: '🔒', text: 'Compra 100% segura',  label: 'Seguridad' },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14,
                                padding: '12px 0',
                                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'rgba(124,131,253,0.08)',
                                    border: '1px solid rgba(124,131,253,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, flexShrink: 0,
                                }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                                    <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>{item.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Card métodos de pago */}
                    <div style={{
                        background: 'rgba(13,13,26,0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 18, padding: '18px 24px',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
                            Métodos de pago aceptados
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Efectivo', emoji: '💵' },
                                { label: 'Yape', emoji: '📱' },
                                { label: 'Plin', emoji: '🏦' },
                                { label: 'Tarjeta', emoji: '💳' },
                            ].map(p => (
                                <div key={p.label} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 10, padding: '6px 12px',
                                    fontSize: 12, color: 'var(--text-soft)',
                                }}>
                                    <span>{p.emoji}</span> {p.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra urgencia */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(135deg, rgba(124,131,253,0.08), rgba(251,191,36,0.06))',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '10px 32px', textAlign: 'center',
                fontSize: 13, color: '#fbbf24', fontWeight: 500,
                letterSpacing: '0.3px',
            }}>
                🔥 Stock limitado — Asegura tu pedido hoy mismo
            </div>

            {/* WhatsApp flotante */}
            {phone && (
                <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                   style={{
                       position: 'fixed', bottom: 28, left: 28, zIndex: 900,
                       display: 'flex', alignItems: 'center', gap: 10,
                       background: 'linear-gradient(135deg, #25d366, #128c7e)',
                       color: 'white', padding: '13px 22px',
                       borderRadius: 50, fontSize: 14, fontWeight: 600,
                       boxShadow: '0 8px 32px rgba(37,211,102,0.35)',
                       transition: 'all 0.3s',
                   }}
                   onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,211,102,0.5)' }}
                   onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,211,102,0.35)' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Habla con el vendedor
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'white', opacity: 0.8,
                        animation: 'pulse 2s infinite',
                    }}/>
                </a>
            )}
        </section>
    )
}