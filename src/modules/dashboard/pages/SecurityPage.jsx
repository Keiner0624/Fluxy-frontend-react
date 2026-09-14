// src/modules/dashboard/pages/SecurityPage.jsx
// Seguridad de la cuenta: correo y WhatsApp verificados, contraseña, cuentas
// vinculadas, sesiones abiertas y, para el dueño, exportar o eliminar el negocio.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { ConfirmDialog, ErrorState, Modal } from '@/modules/dashboard/components/ui'
import useReauth from '@/hooks/useReauth'
import { CodeInput, PasswordField, SocialButtons } from '@/modules/auth/components/AuthUi'
import { PASSWORD_MIN } from '@/modules/auth/registration'
import { api } from '@/app/api'
import { getMe, invalidateAccount } from '@/app/account'
import { clearSession } from '@/app/session'
import { API_URL } from '@/app/config'
import { date, dateTime } from '@/app/format'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import Icon from '@/components/Icon'

const METHOD_LABEL = { PASSWORD: 'Contraseña', GOOGLE: 'Google', APPLE: 'Apple', SIGNUP: 'Registro', INVITATION: 'Invitación' }

function Section({ id, icon, title, text, children, action }) {
  return (
    <section id={id} className="fx-card" style={{ marginBottom: 16, scrollMarginTop: 80 }}>
      <div className="fx-card__head" style={{ alignItems: 'flex-start' }}>
        <div className="fx-row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <span className="fx-auth__mark" style={{ width: 36, height: 36, margin: 0 }}><Icon name={icon} size={17} /></span>
          <div>
            <h2 className="fx-h3">{title}</h2>
            {text && <p className="fx-hint" style={{ marginTop: 2 }}>{text}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="fx-card__body">{children}</div>
    </section>
  )
}

/** Pide el valor nuevo (si hace falta), envía el código y lo confirma. */
function CodeFlowModal({ title, intro, inputLabel, inputType, requestPath, confirmPath, needsValue = true, extra, run, onClose, onDone }) {
  const [value, setValue] = useState('')
  const [issued, setIssued] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [applyToStore, setApplyToStore] = useState(false)

  const send = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      setIssued(await run(() => api.post(requestPath, needsValue ? { value } : undefined)))
      setCode('')
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (current = code) => {
    if (current.length !== 6) return
    setBusy(true)
    setError('')
    try {
      await api.post(confirmPath, { code: current, applyToStore })
      onDone()
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal as="form" title={title} width={460} onClose={onClose}
      onSubmit={(e) => { e.preventDefault(); issued ? confirm() : send() }}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={busy || (issued ? code.length !== 6 : needsValue && !value.trim())}>
            {busy ? <span className="fx-spinner" /> : issued ? 'Confirmar' : 'Enviar código'}
          </button>
        </>
      )}>
      {!issued ? (
        <>
          <p className="fx-hint" style={{ marginBottom: 14 }}>{intro}</p>
          {needsValue && (
            <div className="fx-field">
              <label className="fx-label" htmlFor="code-flow-value">{inputLabel}</label>
              <input id="code-flow-value" className="fx-input" type={inputType} value={value} autoFocus
                onChange={(e) => { setValue(e.target.value); setError('') }} maxLength={254} />
            </div>
          )}
        </>
      ) : (
        <>
          <p className="fx-hint" style={{ marginBottom: 10 }}>
            Ingresá el código que enviamos a <strong style={{ color: 'var(--fx-ink)' }}>{issued.destination}</strong>. Vence en 10 minutos.
          </p>
          <CodeInput value={code} onChange={setCode} onComplete={confirm} error={Boolean(error)} disabled={busy} />
          {extra && (
            <label className="fx-check" style={{ marginBottom: 8 }}>
              <input type="checkbox" checked={applyToStore} onChange={(e) => setApplyToStore(e.target.checked)} />
              <span>{extra}</span>
            </label>
          )}
          <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={send} disabled={busy}>
            <Icon name="refresh" size={14} /> Reenviar código
          </button>
        </>
      )}
      {error && <div className="fx-alert fx-alert--error" role="alert" style={{ marginTop: 10 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
    </Modal>
  )
}

function PasswordModal({ hasPassword, run, onClose, onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [signOutOthers, setSignOutOthers] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (next.length < PASSWORD_MIN) { setError(`Usá al menos ${PASSWORD_MIN} caracteres.`); return }
    if (next !== confirmValue) { setError('Las contraseñas no coinciden.'); return }
    setBusy(true)
    setError('')
    try {
      const result = await run(() => api.post('/me/password', { currentPassword: hasPassword ? current : null, newPassword: next, signOutOthers }))
      onDone(result.sessionsRevoked)
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={hasPassword ? 'Cambiar contraseña' : 'Definir contraseña'} width={460} onClose={onClose}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={busy}>{busy ? <span className="fx-spinner" /> : 'Guardar'}</button>
        </>
      )}>
      {hasPassword && <PasswordField id="current-password" label="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" autoFocus />}
      <PasswordField id="new-password" label="Contraseña nueva" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password"
        placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} autoFocus={!hasPassword} />
      <PasswordField id="confirm-password" label="Repetir contraseña nueva" value={confirmValue} onChange={(e) => setConfirmValue(e.target.value)} autoComplete="new-password" />
      <label className="fx-check">
        <input type="checkbox" checked={signOutOthers} onChange={(e) => setSignOutOthers(e.target.checked)} />
        <span>Cerrar la sesión en los demás dispositivos</span>
      </label>
      {error && <div className="fx-alert fx-alert--error" role="alert" style={{ marginTop: 12 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
    </Modal>
  )
}

function DeleteBusinessModal({ companyName, run, onClose, onDone }) {
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onDone(await run(() => api.post('/company-account/deletion', { confirmation })))
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const matches = confirmation.trim().toLowerCase() === (companyName || '').trim().toLowerCase()
  return (
    <Modal as="form" onSubmit={submit} title="Eliminar el negocio" width={480} onClose={onClose}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--danger" disabled={busy || !matches}>
            {busy ? <span className="fx-spinner" /> : 'Programar eliminación'}
          </button>
        </>
      )}>
      <div className="fx-alert fx-alert--error" style={{ marginBottom: 14 }}>
        <Icon name="alert" size={16} />
        <span>La tienda sale de línea de inmediato. Tenés 14 días para arrepentirte; después se borran los datos personales de clientes y equipo. Exportá tus datos antes.</span>
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="delete-confirmation">Escribí <strong>{companyName}</strong> para confirmar</label>
        <input id="delete-confirmation" className="fx-input" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" autoFocus />
      </div>
      {error && <div className="fx-alert fx-alert--error" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div>}
    </Modal>
  )
}

export default function SecurityPage() {
  const navigate = useNavigate()
  const access = useAccess()
  const security = useApi(() => api.get('/me/security'))
  const sessions = useApi(() => api.get('/me/sessions'))
  const lifecycle = useApi(() => api.get('/company-account/lifecycle'), [], { enabled: access.isOwner })
  const hasPassword = security.data?.hasPassword !== false
  const { run, dialog } = useReauth(hasPassword)
  const [modal, setModal] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const company = JSON.parse(localStorage.getItem('company') || '{}') || {}

  const refreshAll = () => {
    invalidateAccount('me')
    getMe({ force: true }).catch(() => {})
    security.reload()
  }

  const closeSession = async (session) => {
    setBusy(true)
    try {
      if (session.current) {
        await api.post('/me/logout')
        clearSession()
        navigate('/login', { replace: true })
        return
      }
      await api.del(`/me/sessions/${session.id}`)
      toast.success('Sesión cerrada.')
      sessions.reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
      setConfirming(null)
    }
  }

  const closeOthers = async () => {
    setBusy(true)
    try {
      const { revoked } = await api.post('/me/sessions/revoke-others')
      toast.success(revoked ? `Cerramos ${revoked} ${revoked === 1 ? 'sesión' : 'sesiones'}.` : 'No había otras sesiones abiertas.')
      sessions.reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
      setConfirming(null)
    }
  }

  const link = async (provider, credential) => {
    try {
      await run(() => api.post(`/me/identities/${provider.toLowerCase()}`, { idToken: credential.idToken, nonce: credential.nonce }))
      toast.success('Cuenta vinculada.')
      security.reload()
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') toast.error(err.message)
    }
  }

  const unlink = async (provider) => {
    try {
      await run(() => api.del(`/me/identities/${provider.toLowerCase()}`))
      toast.success('Cuenta desvinculada.')
      security.reload()
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') toast.error(err.message)
    }
  }

  const exportData = async () => {
    setBusy(true)
    try {
      const res = await fetch(`${API_URL}/company-account/export`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'No se pudo exportar.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fluxy-${company.slug || 'negocio'}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exportación descargada.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const cancelDeletion = async () => {
    setBusy(true)
    try {
      await api.del('/company-account/deletion')
      toast.success('Cancelaste la eliminación. Tu tienda está activa.')
      lifecycle.reload()
      refreshAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const s = security.data
  const linked = new Set(s?.linkedProviders || [])
  const otherSessions = (sessions.data || []).filter((x) => !x.current).length

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Seguridad</h1>
          <p>Cómo entrás a tu cuenta y dónde tenés la sesión abierta.</p>
        </div>
      </div>

      {security.error && <div style={{ marginBottom: 14 }}><ErrorState error={security.error} onRetry={security.reload} /></div>}

      <div className="fx-split">
        <div>
          <Section id="correo" icon="mail" title="Correo electrónico" text="Con él iniciás sesión y recuperás el acceso."
            action={s && <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => setModal('email-change')}>Cambiar</button>}>
            {s ? (
              <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <span style={{ color: 'var(--fx-ink)', fontWeight: 500 }}>{s.email}</span>
                {s.emailVerified
                  ? <span className="fx-badge fx-badge--ok"><Icon name="checkCircle" size={13} /> Verificado</span>
                  : <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => setModal('email-verify')}>Verificar ahora</button>}
              </div>
            ) : <div className="fx-skeleton" style={{ height: 22 }} />}
          </Section>

          <Section id="whatsapp" icon="phone" title="WhatsApp" text="Para avisos de seguridad y verificar cambios."
            action={s?.phoneVerificationAvailable && <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => setModal('phone-change')}>{s.phone ? 'Cambiar' : 'Agregar'}</button>}>
            {s ? (
              <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <span style={{ color: 'var(--fx-ink)' }}>{s.phone || 'Sin número'}</span>
                {s.phone && (s.phoneVerified
                  ? <span className="fx-badge fx-badge--ok"><Icon name="checkCircle" size={13} /> Verificado</span>
                  : <span className="fx-badge">Sin verificar</span>)}
              </div>
            ) : <div className="fx-skeleton" style={{ height: 22 }} />}
            {s && !s.phoneVerificationAvailable && <p className="fx-hint" style={{ marginTop: 8 }}>La verificación por WhatsApp estará disponible pronto.</p>}
          </Section>

          <Section id="contrasena" icon="lock" title="Contraseña"
            text={s && !s.hasPassword ? 'Entrás con Google o Apple. Podés definir una contraseña como alternativa.' : 'Usá una frase larga que no uses en otros sitios.'}
            action={s && <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => setModal('password')}>{s.hasPassword ? 'Cambiar' : 'Definir'}</button>}>
            <p className="fx-hint">Al cambiarla podés cerrar la sesión en los demás dispositivos.</p>
          </Section>

          <Section id="proveedores" icon="globe" title="Cuentas vinculadas" text="Entrá con un clic usando Google o Apple.">
            {s ? (
              <ul className="fx-list">
                {['GOOGLE', 'APPLE'].map((provider) => (
                  <li key={provider} className="fx-list__row" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ flex: 1, color: 'var(--fx-ink)', fontWeight: 500 }}>{provider === 'GOOGLE' ? 'Google' : 'Apple'}</span>
                    {linked.has(provider) ? (
                      <>
                        <span className="fx-badge fx-badge--ok">Vinculada</span>
                        <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => unlink(provider)}>Desvincular</button>
                      </>
                    ) : s.providersEnabled?.[provider] ? (
                      <div style={{ minWidth: 200 }}><SocialButtons capture only={provider} onCapture={link} onError={(err) => toast.error(err.message)} /></div>
                    ) : (
                      <span className="fx-hint">No disponible todavía</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : <div className="fx-skeleton" style={{ height: 60 }} />}
          </Section>
        </div>

        <div>
          <Section id="sesiones" icon="shield" title="Sesiones abiertas" text="Si no reconocés alguna, cerrala y cambiá tu contraseña."
            action={otherSessions > 0 && <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setConfirming({ type: 'others' })}>Cerrar las demás</button>}>
            {sessions.error && <ErrorState error={sessions.error} onRetry={sessions.reload} />}
            {!sessions.data && !sessions.error && <div className="fx-skeleton" style={{ height: 90 }} />}
            {sessions.data && (
              <ul className="fx-list">
                {sessions.data.map((session) => (
                  <li key={session.id} className="fx-list__row" style={{ alignItems: 'flex-start', gap: 10 }}>
                    <Icon name={/iPhone|Android/.test(session.deviceLabel || '') ? 'phone' : 'overview'} size={17} style={{ marginTop: 2, color: 'var(--fx-copy)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--fx-ink)', fontSize: 13.5, fontWeight: 500 }}>
                        {session.deviceLabel || 'Dispositivo'}
                        {session.current && <span className="fx-badge fx-badge--brand" style={{ marginLeft: 8 }}>Esta sesión</span>}
                      </div>
                      <div className="fx-hint" style={{ fontSize: 12 }}>
                        {METHOD_LABEL[session.authMethod] || session.authMethod} · Red {session.ipPrefix || 'desconocida'} · Último uso {dateTime(session.lastUsedAt)}
                      </div>
                    </div>
                    <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setConfirming({ type: 'one', session })}>
                      {session.current ? 'Salir' : 'Cerrar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {access.isOwner && (
            <Section id="negocio" icon="building" title="Datos del negocio" text="Solo el dueño ve esta sección.">
              <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ color: 'var(--fx-ink)', fontWeight: 500, fontSize: 13.5 }}>Exportar todo</div>
                  <p className="fx-hint" style={{ fontSize: 12.5 }}>Productos, clientes, pedidos, pagos e inventario en JSON.</p>
                </div>
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={exportData} disabled={busy}>
                  <Icon name="download" size={14} /> Exportar
                </button>
              </div>
              {lifecycle.data?.status === 'DELETION_PENDING' ? (
                <div className="fx-alert fx-alert--error" style={{ alignItems: 'center' }}>
                  <Icon name="trash" size={16} />
                  <span style={{ flex: 1 }}>Eliminación programada para el {date(lifecycle.data.deletionScheduledAt)}.</span>
                  {lifecycle.data.reason === 'OWNER_REQUEST' && (
                    <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={cancelDeletion} disabled={busy}>Cancelar eliminación</button>
                  )}
                </div>
              ) : (
                <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: 'var(--fx-danger)', fontWeight: 500, fontSize: 13.5 }}>Eliminar el negocio</div>
                    <p className="fx-hint" style={{ fontSize: 12.5 }}>La tienda sale de línea y se elimina a los 14 días.</p>
                  </div>
                  <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" style={{ color: 'var(--fx-danger)' }} onClick={() => setModal('delete')}>
                    Eliminar
                  </button>
                </div>
              )}
            </Section>
          )}
        </div>
      </div>

      {modal === 'email-verify' && (
        <CodeFlowModal title="Verificar tu correo" intro={`Te enviaremos un código a ${s?.email}.`} needsValue={false}
          requestPath="/me/email/verification" confirmPath="/me/email/verification/confirm" run={run}
          onClose={() => setModal(null)} onDone={() => { setModal(null); toast.success('Correo verificado.'); refreshAll() }} />
      )}
      {modal === 'email-change' && (
        <CodeFlowModal title="Cambiar el correo" intro="Te enviaremos un código al correo nuevo. Al confirmarlo, avisamos al anterior."
          inputLabel="Correo nuevo" inputType="email" requestPath="/me/email/change" confirmPath="/me/email/change/confirm" run={run}
          onClose={() => setModal(null)} onDone={() => { setModal(null); toast.success('Correo actualizado.'); refreshAll() }} />
      )}
      {modal === 'phone-change' && (
        <CodeFlowModal title="WhatsApp" intro="Te enviaremos un código por WhatsApp al número nuevo." inputLabel="Celular (9 dígitos)" inputType="tel"
          requestPath="/me/phone/change" confirmPath="/me/phone/change/confirm" run={run}
          extra={access.can('SETTINGS_MANAGE') ? 'Usarlo también como WhatsApp de la tienda' : null}
          onClose={() => setModal(null)} onDone={() => { setModal(null); toast.success('WhatsApp actualizado.'); refreshAll() }} />
      )}
      {modal === 'password' && (
        <PasswordModal hasPassword={hasPassword} run={run} onClose={() => setModal(null)}
          onDone={(revoked) => { setModal(null); toast.success(revoked ? `Contraseña actualizada. Cerramos ${revoked} ${revoked === 1 ? 'sesión' : 'sesiones'}.` : 'Contraseña actualizada.'); refreshAll(); sessions.reload() }} />
      )}
      {modal === 'delete' && (
        <DeleteBusinessModal companyName={company.name} run={run} onClose={() => setModal(null)}
          onDone={() => { setModal(null); toast.success('Programaste la eliminación del negocio.'); lifecycle.reload(); refreshAll() }} />
      )}
      {confirming?.type === 'others' && (
        <ConfirmDialog title="Cerrar las demás sesiones" text="Se cierra la sesión en todos los otros dispositivos. Esta queda abierta."
          confirmLabel="Cerrar sesiones" busy={busy} onClose={() => setConfirming(null)} onConfirm={closeOthers} />
      )}
      {confirming?.type === 'one' && (
        <ConfirmDialog title={confirming.session.current ? 'Salir de esta sesión' : 'Cerrar la sesión'}
          text={confirming.session.current ? 'Vas a tener que iniciar sesión de nuevo.' : `${confirming.session.deviceLabel || 'Ese dispositivo'} deja de tener acceso de inmediato.`}
          confirmLabel={confirming.session.current ? 'Salir' : 'Cerrar sesión'} busy={busy}
          onClose={() => setConfirming(null)} onConfirm={() => closeSession(confirming.session)} />
      )}
      {dialog}
    </DashboardLayout>
  )
}
