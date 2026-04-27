import { useState } from 'react'
import { createOrder } from '../api/storeApi'
import toast from 'react-hot-toast'

const empty = { name: '', phone: '', address: '' }

export default function CheckoutModal({ open, cart, total, company, onClose, onSuccess }) {
    const [form, setForm] = useState(empty)
    const [loading, setLoading] = useState(false)

    if (!open) return null

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.phone) return toast.error('Completa los campos requeridos')
        setLoading(true)
        try {
            await createOrder(company.id, {
                customerName: form.name,
                customerPhone: form.phone,
                customerAddress: form.address,
                items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
                total
            })
            toast.success('¡Pedido realizado con éxito!')
            setForm(empty)
            onSuccess()
            onClose()
        } catch {
            toast.error('Error al procesar el pedido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
                width: '90%', maxWidth: 440, padding: 32, zIndex: 301
            }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
                    Confirmar pedido
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    Total: <strong style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</strong>
                </p>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { key: 'name', label: 'Nombre *', placeholder: 'Tu nombre' },
                        { key: 'phone', label: 'Teléfono *', placeholder: '+56 9 0000 0000' },
                        { key: 'address', label: 'Dirección', placeholder: 'Calle, número, ciudad' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                            <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>{label}</label>
                            <input
                                value={form[key]}
                                onChange={e => set(key, e.target.value)}
                                placeholder={placeholder}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 10,
                                    border: '1px solid var(--border)', background: 'var(--bg)',
                                    color: 'var(--text)', fontSize: 14, outline: 'none'
                                }}
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--border)',
                            background: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: 12, borderRadius: 10, border: 'none',
                            background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? .7 : 1
                        }}>
                            {loading ? 'Enviando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
