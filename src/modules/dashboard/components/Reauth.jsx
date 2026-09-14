// src/modules/dashboard/components/Reauth.jsx
// Acciones sensibles (cambiar correo, transferir la propiedad, eliminar el
// negocio) exigen confirmar la identidad en los últimos 10 minutos. Si el
// backend responde REAUTH_REQUIRED se pide la contraseña y se reintenta.
import { useState } from 'react'
import { api } from '@/app/api'
import Icon from '@/components/Icon'
import { Modal } from './ui'
import { PasswordField, SocialButtons } from '@/modules/auth/components/AuthUi'

export default function ReauthDialog({ hasPassword, onDone, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const confirm = async (body) => {
    setBusy(true)
    setError('')
    try {
      await api.post('/me/reauth', body)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal as="form" title="Confirmá que sos vos" subtitle="Por seguridad, antes de continuar." width={440} onClose={onClose}
      onSubmit={(e) => { e.preventDefault(); if (password) confirm({ password }) }}
      footer={hasPassword && (
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={busy || !password}>
            {busy ? <><span className="fx-spinner" /> Confirmando…</> : 'Confirmar'}
          </button>
        </>
      )}>
      {hasPassword ? (
        <PasswordField id="reauth-password" label="Tu contraseña" value={password} autoComplete="current-password"
          onChange={(e) => { setPassword(e.target.value); setError('') }} invalid={Boolean(error)} autoFocus />
      ) : (
        <>
          <p className="fx-hint" style={{ marginBottom: 14 }}>Tu cuenta entra con Google o Apple. Confirmá con la cuenta vinculada:</p>
          <SocialButtons capture onCapture={(provider, credential) => confirm({ provider, idToken: credential.idToken, nonce: credential.nonce })}
            onError={(err) => setError(err.message)} />
        </>
      )}
      {error && <div className="fx-alert fx-alert--error" role="alert" style={{ marginTop: 8 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
    </Modal>
  )
}
