// src/modules/auth/components/AuthUi.jsx
// Piezas del acceso y el registro: campos con ícono, proveedores y código.
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { exchangeIdToken, getOAuthConfig, renderGoogleButton, signInWithApple } from '../oauth'

export function IconField({ id, label, icon, error, hint, prefix, affix, children, labelAside }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const classes = ['fx-iconfield', affix && 'fx-iconfield--affix', prefix && 'fx-iconfield--prefix'].filter(Boolean).join(' ')
  return (
    <div className="fx-field">
      {labelAside ? (
        <div className="fx-row fx-row--between" style={{ marginBottom: 6 }}>
          <label className="fx-label" htmlFor={id} style={{ marginBottom: 0 }}>{label}</label>
          {labelAside}
        </div>
      ) : (
        <label className="fx-label" htmlFor={id}>{label}</label>
      )}
      <div className={classes}>
        <span className="fx-iconfield__icon" aria-hidden="true"><Icon name={icon} size={17} /></span>
        {prefix && <span className="fx-iconfield__prefix" aria-hidden="true">{prefix}</span>}
        {children({ 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
        {affix}
      </div>
      {hint && !error && <p className="fx-hint" id={`${id}-hint`} style={{ marginTop: 6 }}>{hint}</p>}
      {error && <p className="fx-field__error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

export function PasswordField({ id = 'password', label = 'Contraseña', value, onChange, error, invalid, hint, autoComplete, placeholder, labelAside, autoFocus }) {
  const [visible, setVisible] = useState(false)
  return (
    <IconField id={id} label={label} icon="lock" error={error} hint={hint} labelAside={labelAside}
      affix={(
        <button type="button" className="fx-input-affix" onClick={() => setVisible((v) => !v)}
          aria-pressed={visible} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          <Icon name={visible ? 'eyeOff' : 'eye'} size={17} />
        </button>
      )}>
      {(aria) => (
        <input {...aria} id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange}
          autoComplete={autoComplete} placeholder={placeholder} maxLength={72} autoFocus={autoFocus}
          className={`fx-input${error || invalid ? ' fx-input--error' : ''}`} />
      )}
    </IconField>
  )
}

export function Divider({ children }) {
  return <div className="fx-divider" role="separator">{children}</div>
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)

const AppleLogo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 12.64c-.02-2.3 1.88-3.41 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.59-.75 2.99-.75 1.39 0 1.79.75 3.01.72 1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.45-3.71zM14.08 5.87c.64-.78 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.03.08 2.07-.52 2.71-1.28z" />
  </svg>
)

/**
 * Botones de Google y Apple. Sin client id configurado en el backend se ven
 * deshabilitados. onResult recibe la respuesta de /auth/oauth/{provider}.
 */
export function SocialButtons({ rememberMe = true, onResult, onError, disabled, googleText = 'continue_with', capture = false, onCapture, only }) {
  const [config, setConfig] = useState(null)
  const [busy, setBusy] = useState('')
  const googleSlot = useRef(null)
  const handlers = useRef({ onResult, onError, onCapture })
  useEffect(() => { handlers.current = { onResult, onError, onCapture } })

  useEffect(() => {
    let vigente = true
    getOAuthConfig().then((c) => { if (vigente) setConfig(c || {}) })
    return () => { vigente = false }
  }, [])

  const googleId = config?.google?.clientId
  useEffect(() => {
    if (!googleId || !googleSlot.current) return
    let vigente = true
    const mount = () => renderGoogleButton(googleSlot.current, {
      clientId: googleId,
      text: googleText,
      onCredential: async (credential) => {
        setBusy('google')
        try {
          // capture: el ID token no inicia sesión; lo usa quien llama (confirmar identidad, vincular cuenta).
          if (capture) await handlers.current.onCapture?.('GOOGLE', credential)
          else {
            const result = await exchangeIdToken('google', credential, rememberMe)
            if (vigente) await handlers.current.onResult?.(result, 'google')
          }
        } catch (error) {
          handlers.current.onError?.(error)
        } finally {
          if (vigente) setBusy('')
          // El nonce es de un solo uso: el botón se prepara con uno nuevo.
          if (vigente && googleSlot.current) mount().catch(() => {})
        }
      },
    })
    mount().catch((error) => handlers.current.onError?.(error))
    return () => { vigente = false }
  }, [googleId, googleText, rememberMe, capture])

  const apple = async () => {
    if (!config?.apple?.clientId) return
    setBusy('apple')
    try {
      const credential = await signInWithApple(config.apple)
      if (credential?.idToken && capture) await onCapture?.('APPLE', credential)
      else if (credential?.idToken) await onResult?.(await exchangeIdToken('apple', credential, rememberMe), 'apple')
    } catch (error) {
      onError?.(error)
    } finally {
      setBusy('')
    }
  }

  const loading = config === null
  const noneConfigured = !loading && !googleId && !config?.apple?.clientId

  return (
    <>
      <div className="fx-social" style={only ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        {only === 'APPLE' ? null : googleId ? (
          <div className={`fx-social__google${busy === 'google' ? ' is-busy' : ''}`}>
            <button type="button" className="fx-social__btn" tabIndex={-1} aria-hidden="true" style={{ width: '100%' }}>
              {busy === 'google' ? <span className="fx-spinner" /> : <GoogleLogo />} Google
            </button>
            <div ref={googleSlot} className="fx-social__google-slot" aria-label="Continuar con Google" />
          </div>
        ) : (
          <button type="button" className="fx-social__btn" disabled title={loading ? 'Cargando…' : 'Todavía no disponible'}>
            <GoogleLogo /> Google
          </button>
        )}
        {only !== 'GOOGLE' && <button type="button" className="fx-social__btn" onClick={apple}
          disabled={disabled || !config?.apple?.clientId || busy !== ''}
          title={!loading && !config?.apple?.clientId ? 'Todavía no disponible' : undefined}>
          {busy === 'apple' ? <span className="fx-spinner" /> : <AppleLogo />} Apple
        </button>}
      </div>
      {noneConfigured && <p className="fx-social__hint">El acceso con Google y Apple estará disponible pronto.</p>}
    </>
  )
}

/** Seis casillas para el código; acepta pegar el código completo. */
export function CodeInput({ value, onChange, onComplete, error, disabled, autoFocus = true }) {
  const refs = useRef([])
  // El código se llena de izquierda a derecha, sin huecos. La referencia tiene
  // siempre el último valor: al tipear rápido, React todavía no re-renderizó.
  const current = useRef(value)
  useEffect(() => { current.current = value }, [value])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '')

  useEffect(() => { if (autoFocus) refs.current[0]?.focus() }, [autoFocus])

  const update = (next) => {
    current.current = next
    onChange(next)
    refs.current[Math.min(next.length, 5)]?.focus()
    if (next.length === 6) onComplete?.(next)
  }

  /** Escribe desde la casilla index; si la casilla ya tenía dígito, lo nuevo va a continuación. */
  const type = (index, raw, previous) => {
    let chars = raw.replace(/\D/g, '')
    let at = index
    if (previous && chars.length > 1 && chars.startsWith(previous)) { chars = chars.slice(1); at = index + 1 }
    if (!chars) return
    const text = current.current
    const start = Math.min(at, text.length)
    update((text.slice(0, start) + chars + text.slice(start + chars.length)).slice(0, 6))
  }

  const onPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    update(pasted)
  }

  return (
    <div className={`fx-otp${error ? ' fx-otp--error' : ''}`} role="group" aria-label="Código de 6 dígitos">
      {digits.map((digit, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el }} value={digit} disabled={disabled}
          inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Dígito ${i + 1}`}
          onPaste={onPaste}
          onChange={(e) => type(i, e.target.value, digit)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault()
              const text = current.current
              const at = digit ? i : Math.max(0, Math.min(i, text.length) - 1)
              current.current = text.slice(0, at)
              onChange(current.current)
              refs.current[at]?.focus()
            }
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
          }} />
      ))}
    </div>
  )
}
