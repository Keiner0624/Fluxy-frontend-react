// src/modules/dashboard/components/LegalUpdateModal.jsx
// Pide aceptar la versión vigente de los Términos y la Política a quien aceptó una anterior.
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '@/app/api'
import { logout } from '@/app/session'
import Icon from '@/components/Icon'
import { CURRENT_LEGAL_VERSION, getLegalDocument, legalUrl } from '@/modules/landing/legal/documents'
import { Modal } from './ui'

const noop = () => {}

export default function LegalUpdateModal() {
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let vigente = true
    api.get('/me/legal').then((data) => { if (vigente) setStatus(data) }).catch(() => {})
    return () => { vigente = false }
  }, [])

  // Si el backend publica otra versión que este sitio aún no tiene, no se puede mostrar para aceptar.
  if (!status?.needsAcceptance || status.currentVersion !== CURRENT_LEGAL_VERSION) return null

  const accept = async () => {
    setBusy(true)
    try {
      setStatus(await api.post('/me/legal/accept', { version: CURRENT_LEGAL_VERSION }))
      toast.success('Gracias. Aceptaste la versión vigente.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const firstTime = !status.acceptedVersion
  return (
    <Modal
      title={firstTime ? 'Términos y privacidad' : 'Actualizamos nuestros términos'}
      subtitle={`Versión del ${getLegalDocument().updatedAt}`}
      onClose={noop}
      closable={false}
      width={500}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={async () => { await logout(); navigate('/login') }} disabled={busy}>Cerrar sesión</button>
          <button type="button" className="fx-btn fx-btn--primary" onClick={accept} disabled={busy}>
            {busy ? <span className="fx-spinner" /> : <Icon name="check" size={15} />} Aceptar y continuar
          </button>
        </>
      )}
    >
      <p style={{ color: 'var(--fx-copy)', fontSize: 14, lineHeight: 1.6 }}>
        {firstTime
          ? 'Para seguir usando Fluxy necesitamos que aceptes los Términos y Condiciones y la Política de Privacidad vigentes.'
          : 'Publicamos una nueva versión de los Términos y Condiciones y de la Política de Privacidad. Para seguir usando Fluxy, revisala y aceptala.'}
      </p>
      <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--fx-copy)', fontSize: 13.5, lineHeight: 1.7 }}>
        <li>Separamos con claridad qué hace Fluxy, qué hace tu negocio y qué hace tu comprador.</li>
        <li>Listamos los proveedores que usamos y dónde se guardan los datos.</li>
        <li>Sumamos el Libro de Reclamaciones virtual y el aviso de cookies.</li>
      </ul>
      <div className="fx-row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        <Link to={legalUrl('terms')} target="_blank" rel="noopener" className="fx-btn fx-btn--secondary fx-btn--sm">
          <Icon name="file" size={14} /> Términos y Condiciones
        </Link>
        <Link to={legalUrl('privacy')} target="_blank" rel="noopener" className="fx-btn fx-btn--secondary fx-btn--sm">
          <Icon name="shield" size={14} /> Política de Privacidad
        </Link>
      </div>
    </Modal>
  )
}
