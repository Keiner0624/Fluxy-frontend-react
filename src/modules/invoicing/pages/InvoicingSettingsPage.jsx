// src/modules/invoicing/pages/InvoicingSettingsPage.jsx
// Asistente de facturación electrónica: datos fiscales → método de emisión → credenciales →
// series → preferencias → prueba → activación. Qué se puede emitir lo decide el servidor.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { ErrorState, NoAccess } from '@/modules/dashboard/components/ui'
import PlanGate from '@/components/PlanGate'
import Icon from '@/components/Icon'
import useAccess from '@/hooks/useAccess'
import useApi from '@/hooks/useApi'
import useReauth from '@/hooks/useReauth'
import { peekMe } from '@/app/account'
import { dateTime } from '@/app/format'
import {
  activate, createSeries, getConfiguration, pause, testConnection, updateProvider, updateSeries, updateSettings, verifyRuc,
} from '../api/invoicingApi'
import { CONFIG_STATUS, DOC_TYPES, TAX_REGIMES, VERIFICATION, isValidRuc } from '../lib/invoicingFormat'

const PROVIDERS = {
  SANDBOX: { label: 'Modo de prueba de Fluxy', text: 'Probá todo el flujo sin enviar nada a SUNAT. Los comprobantes no tienen valor tributario.' },
  NUBEFACT: { label: 'Nubefact', text: 'Emisión real con tu cuenta de Nubefact (OSE). Necesitás su ruta y token.' },
}

function Step({ n, title, done, children, hint }) {
  return (
    <div className="fx-card" style={{ marginBottom: 16 }}>
      <div className="fx-card__head">
        <div className="fx-row" style={{ gap: 10 }}>
          <span className="fx-shortcut__icon" style={{ margin: 0, width: 28, height: 28, fontWeight: 700, fontSize: 13,
            background: done ? 'var(--fx-ok-soft, #e7f7ee)' : undefined, color: done ? 'var(--fx-ok, #16a34a)' : undefined }}>
            {done ? <Icon name="check" size={15} /> : n}
          </span>
          <div>
            <h2 className="fx-h3">{title}</h2>
            {hint && <p className="fx-hint">{hint}</p>}
          </div>
        </div>
      </div>
      <div className="fx-card__body">{children}</div>
    </div>
  )
}

export default function InvoicingSettingsPage() {
  const access = useAccess()
  if (access.ready && !access.can('INVOICING_CONFIGURE')) {
    return <DashboardLayout><NoAccess module="Configuración de facturación" /></DashboardLayout>
  }
  return <SettingsContent access={access} />
}

function SettingsContent({ access }) {
  const config = useApi(getConfiguration, [])
  const { run, dialog } = useReauth(peekMe()?.hasPassword !== false)
  const [busy, setBusy] = useState('')
  const c = config.data

  const act = async (name, action, success) => {
    setBusy(name)
    try {
      const updated = await run(action)
      config.setData(updated)
      if (success) toast.success(typeof success === 'function' ? success(updated) : success)
      return updated
    } catch (e) {
      if (e.code !== 'REAUTH_CANCELLED') toast.error(e.message)
      return null
    } finally {
      setBusy('')
    }
  }

  if (config.error) return <DashboardLayout><ErrorState error={config.error} onRetry={config.reload} /></DashboardLayout>
  if (!c) return <DashboardLayout><div className="fx-skeleton" style={{ height: 300 }} /></DashboardLayout>
  if (!c.planAllowed) return <DashboardLayout><PlanGate currentPlan="FREE" requiredPlan="PRO" /></DashboardLayout>

  const status = CONFIG_STATUS[c.status]
  const production = c.environment === 'PRODUCTION'

  return (
    <DashboardLayout>
      <Link to="/dashboard/invoices" className="fx-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13.5 }}>
        <Icon name="arrowLeft" size={14} /> Comprobantes
      </Link>
      <div className="fx-page-head">
        <div>
          <div className="fx-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <h1>Facturación electrónica</h1>
            <span className={`fx-badge ${status?.badge || ''}`}><span className="fx-dot" />{status?.label}</span>
            <span className={`fx-badge ${production ? 'fx-badge--brand' : 'fx-badge--warn'}`}>{production ? 'Emisión real' : 'Modo de prueba'}</span>
          </div>
          <p>{c.statusReason || 'Tu negocio es el emisor de sus comprobantes; Fluxy los prepara, envía y guarda.'}</p>
        </div>
        <div className="fx-page-head__actions">
          {c.status === 'ACTIVE' ? (
            <button type="button" className="fx-btn fx-btn--secondary" disabled={Boolean(busy)} onClick={() => act('pause', pause, 'Facturación pausada')}>Pausar</button>
          ) : (
            <button type="button" className="fx-btn fx-btn--primary" disabled={!c.canActivate || Boolean(busy)}
              onClick={() => act('activate', activate, 'Facturación activa')}>
              {busy === 'activate' ? <><span className="fx-spinner" /> Activando…</> : <><Icon name="check" size={15} /> Activar</>}
            </button>
          )}
        </div>
      </div>

      <div className="fx-split">
        <div>
          <FiscalStep c={c} busy={busy} act={act} />
          <Step n={2} title="Método de emisión" done={c.provider === 'NUBEFACT' ? c.hasCredentials : true}
            hint="Podés empezar en modo de prueba y pasar a emisión real cuando tengas tu cuenta del proveedor.">
            <div className="fx-roles">
              {Object.entries(PROVIDERS).map(([key, p]) => (
                <button key={key} type="button" className={`fx-role${c.provider === key ? ' is-on' : ''}`} disabled={Boolean(busy)}
                  onClick={() => c.provider !== key && act('provider', () => updateProvider({ provider: key }), 'Método de emisión cambiado')}>
                  <strong>{p.label}</strong><span>{p.text}</span>
                </button>
              ))}
            </div>
            {production && !c.rucLookupAvailable && (
              <p className="fx-hint" style={{ marginTop: 10 }}>La verificación de RUC en el padrón todavía no está disponible en este servidor: sin ella no se puede activar la emisión real.</p>
            )}
          </Step>
          {c.requiresCredentials && <CredentialsStep c={c} busy={busy} act={act} />}
          <SeriesStep c={c} busy={busy} act={act} canManage={access.can('INVOICING_SERIES')} />
          <PreferencesStep c={c} busy={busy} act={act} />
          <Step n={6} title="Prueba" done={c.connectionOk} hint="Comprueba que Fluxy pueda comunicarse con el proveedor.">
            <div className="fx-row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="fx-btn fx-btn--secondary" disabled={Boolean(busy)} onClick={() => act('test', testConnection,
                (u) => (u.connectionOk ? 'Conexión correcta' : 'La conexión falló'))}>
                {busy === 'test' ? <><span className="fx-spinner" /> Probando…</> : <><Icon name="plug" size={15} /> Probar conexión</>}
              </button>
              {c.connectionCheckedAt && (
                <span className={`fx-badge ${c.connectionOk ? 'fx-badge--ok' : 'fx-badge--danger'}`}>
                  {c.connectionOk ? 'Correcta' : 'Falló'} · {dateTime(c.connectionCheckedAt)}
                </span>
              )}
            </div>
            {c.connectionMessage && <p className="fx-hint" style={{ marginTop: 8 }}>{c.connectionMessage}</p>}
          </Step>
        </div>

        <div className="fx-card" style={{ position: 'sticky', top: 16 }}>
          <div className="fx-card__head"><h2 className="fx-h3">7. Activación</h2></div>
          <div className="fx-card__body">
            <ul className="fx-list">
              {c.checklist.map((item) => (
                <li key={item.key} className="fx-list__row" style={{ alignItems: 'flex-start' }}>
                  <span style={{ color: item.ok ? 'var(--fx-ok, #16a34a)' : 'var(--fx-muted)', marginTop: 2 }}>
                    <Icon name={item.ok ? 'checkCircle' : 'clock'} size={16} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</div>
                    {!item.ok && <div className="fx-hint" style={{ fontSize: 12.5 }}>{item.message}</div>}
                  </div>
                </li>
              ))}
            </ul>
            <p className="fx-hint" style={{ marginTop: 10, fontSize: 12.5 }}>
              Solo el servidor activa la facturación: verifica el RUC, la conexión y las series antes de permitir emitir.
            </p>
            {c.activatedAt && <p className="fx-hint" style={{ fontSize: 12.5 }}>Activada el {dateTime(c.activatedAt)}.</p>}
          </div>
        </div>
      </div>
      {dialog}
    </DashboardLayout>
  )
}

function FiscalStep({ c, busy, act }) {
  const p = c.profile
  const [ruc, setRuc] = useState(p.ruc || '')
  const [name, setName] = useState('')
  const [regime, setRegime] = useState(p.taxRegime || 'UNKNOWN')
  const [tradeName, setTradeName] = useState(c.tradeName || '')
  const [address, setAddress] = useState(c.fiscalAddress || '')
  const verification = VERIFICATION[p.verificationStatus]
  const manualName = c.environment === 'TEST' && !c.rucLookupAvailable
  const rucOk = isValidRuc(ruc)

  return (
    <Step n={1} title="Datos fiscales" done={p.canIssueReceipt || p.canIssueInvoice}
      hint="Fluxy verifica tu RUC en el servidor; lo que se puede emitir sale de esa verificación.">
      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="inv-ruc">RUC</label>
          <input id="inv-ruc" className={`fx-input${ruc && !rucOk ? ' fx-input--error' : ''}`} inputMode="numeric" maxLength={11}
            value={ruc} onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))} placeholder="20XXXXXXXXX" />
          {ruc.length === 11 && !rucOk && <p className="fx-hint" style={{ color: 'var(--fx-danger)', marginTop: 4 }}>El dígito verificador no coincide.</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="inv-regime">Régimen tributario</label>
          <select id="inv-regime" className="fx-select" value={regime} onChange={(e) => setRegime(e.target.value)}>
            {Object.entries(TAX_REGIMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {manualName && (
          <div className="fx-field">
            <label className="fx-label" htmlFor="inv-bname">Razón social (modo de prueba)</label>
            <input id="inv-bname" className="fx-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </div>
        )}
      </div>
      <button type="button" className="fx-btn fx-btn--primary" disabled={!rucOk || Boolean(busy) || (manualName && !name.trim() && p.ruc !== ruc)}
        onClick={() => act('verify', () => verifyRuc({ ruc, businessName: name.trim() || p.businessName, taxRegime: regime }),
          (u) => (u.profile.verificationStatus === 'VERIFIED' ? 'RUC verificado' : 'No se pudo verificar el RUC'))}>
        {busy === 'verify' ? <><span className="fx-spinner" /> Verificando…</> : <><Icon name="shield" size={15} /> Verificar RUC</>}
      </button>

      {p.ruc && (
        <div style={{ marginTop: 14, padding: '12px 14px', border: '1px solid var(--fx-line)', borderRadius: 12 }}>
          <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <strong>{p.businessName || 'Sin razón social'}</strong>
            <span className={`fx-badge ${verification?.badge || ''}`}>{verification?.label}</span>
            {p.verificationSource === 'SANDBOX' && <span className="fx-badge fx-badge--warn">Solo prueba</span>}
          </div>
          <dl className="fx-kv">
            <dt>RUC</dt><dd>{p.ruc}</dd>
            {p.rucStatus && <><dt>Estado</dt><dd>{p.rucStatus} · {p.rucCondition}</dd></>}
            <dt>Puede emitir</dt>
            <dd>Boletas {p.canIssueReceipt ? '✓' : '✕'} · Facturas {p.canIssueInvoice ? '✓' : '✕'}</dd>
          </dl>
          {p.verificationMessage && <p className="fx-hint" style={{ marginTop: 6 }}>{p.verificationMessage}</p>}
        </div>
      )}

      <div className="fx-divider" style={{ margin: '16px 0' }} />
      <div className="fx-field">
        <label className="fx-label" htmlFor="inv-trade">Nombre comercial</label>
        <input id="inv-trade" className="fx-input" value={tradeName} onChange={(e) => setTradeName(e.target.value)} maxLength={200} />
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="inv-address">Dirección fiscal</label>
        <input id="inv-address" className="fx-input" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
      </div>
      <button type="button" className="fx-btn fx-btn--secondary" disabled={Boolean(busy)}
        onClick={() => act('fiscal', () => updateSettings({ tradeName, fiscalAddress: address }), 'Datos guardados')}>Guardar datos</button>
    </Step>
  )
}

function CredentialsStep({ c, busy, act }) {
  const [endpoint, setEndpoint] = useState('')
  const [token, setToken] = useState('')
  return (
    <Step n={3} title="Credenciales del proveedor" done={c.hasCredentials}
      hint="Se guardan cifradas y nunca se vuelven a mostrar. Por seguridad te pedimos confirmar tu identidad.">
      {c.hasCredentials && (
        <p className="fx-hint" style={{ marginBottom: 10 }}>
          Cargadas: ruta <span className="fx-code">{c.providerEndpointHint}</span> · token terminado en <span className="fx-code">{c.tokenHint}</span>.
          Escribí nuevos valores solo si querés reemplazarlos.
        </p>
      )}
      <div className="fx-field">
        <label className="fx-label" htmlFor="inv-endpoint">Ruta (URL de tu cuenta)</label>
        <input id="inv-endpoint" className="fx-input" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.nubefact.com/api/v1/…" autoComplete="off" />
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="inv-token">Token</label>
        <input id="inv-token" type="password" className="fx-input" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="new-password" />
      </div>
      <button type="button" className="fx-btn fx-btn--primary" disabled={Boolean(busy) || (!endpoint.trim() && !token.trim())}
        onClick={async () => {
          const ok = await act('credentials', () => updateProvider({ provider: c.provider, endpoint: endpoint.trim() || null, token: token.trim() || null }),
            'Credenciales guardadas: probá la conexión')
          if (ok) { setEndpoint(''); setToken('') }
        }}>
        {busy === 'credentials' ? <><span className="fx-spinner" /> Guardando…</> : <><Icon name="lock" size={15} /> Guardar credenciales</>}
      </button>
    </Step>
  )
}

function SeriesStep({ c, busy, act, canManage }) {
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState('BOLETA')
  const [series, setSeries] = useState('')
  const [edits, setEdits] = useState({})
  return (
    <Step n={4} title="Series" done={c.checklist.find((i) => i.key === 'series')?.ok}
      hint={c.environment === 'TEST' ? 'Numeración de prueba: nunca se mezcla con la real.' : 'Si venías emitiendo en otro sistema, indicá el último número usado antes de emitir.'}>
      <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
        <table className="fx-table">
          <thead><tr><th>Tipo</th><th>Serie</th><th className="fx-table__num">Próximo</th><th>Habilitada</th></tr></thead>
          <tbody>
            {c.series.map((s) => (
              <tr key={s.id}>
                <td>{DOC_TYPES[s.documentType]?.label}{s.documentType === 'NOTA_CREDITO' ? (s.series.startsWith('F') ? ' (facturas)' : ' (boletas)') : ''}</td>
                <td><span className="fx-code">{s.series}</span></td>
                <td className="fx-table__num">
                  {canManage && !s.used ? (
                    <input className="fx-input fx-input--sm" style={{ width: 110, textAlign: 'right' }} type="number" min={1}
                      value={edits[s.id] ?? s.nextNumber} onChange={(e) => setEdits({ ...edits, [s.id]: e.target.value })}
                      onBlur={() => {
                        const next = Number(edits[s.id])
                        if (edits[s.id] !== undefined && next >= 1 && next !== s.nextNumber) {
                          act('series', () => updateSeries(s.id, { currentNumber: next - 1 }), `La serie ${s.series} sigue en el ${next}`)
                        }
                        setEdits((x) => { const y = { ...x }; delete y[s.id]; return y })
                      }} aria-label={`Próximo número de ${s.series}`} />
                  ) : <span className="fx-num">{s.nextNumber}</span>}
                </td>
                <td>
                  <label className="fx-check" title={s.allowed ? '' : 'Tu perfil fiscal no permite este comprobante'}>
                    <input type="checkbox" checked={s.enabled} disabled={!canManage || Boolean(busy) || (!s.enabled && !s.allowed)}
                      onChange={(e) => act('series', () => updateSeries(s.id, { enabled: e.target.checked }))} />
                    {s.enabled ? 'Sí' : s.allowed ? 'No' : 'No permitido'}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canManage && (adding ? (
        <form className="fx-row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }} onSubmit={async (e) => {
          e.preventDefault()
          if (await act('series', () => createSeries({ documentType: type, series }), `Serie ${series.toUpperCase()} creada`)) {
            setAdding(false); setSeries('')
          }
        }}>
          <select className="fx-select" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input className="fx-input" style={{ width: 110, textTransform: 'uppercase' }} maxLength={4} placeholder={type === 'FACTURA' ? 'F002' : type === 'BOLETA' ? 'B002' : 'BC02'}
            value={series} onChange={(e) => setSeries(e.target.value)} required />
          <button type="submit" className="fx-btn fx-btn--primary fx-btn--sm" disabled={Boolean(busy)}>Crear</button>
          <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setAdding(false)}>Cancelar</button>
        </form>
      ) : (
        <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" style={{ marginTop: 10 }} onClick={() => setAdding(true)}>
          <Icon name="plus" size={14} /> Agregar serie (por ejemplo, otra caja)
        </button>
      ))}
    </Step>
  )
}

function PreferencesStep({ c, busy, act }) {
  const [form, setForm] = useState({
    automaticIssuing: c.automaticIssuing, issueTrigger: c.issueTrigger, emailEnabled: c.emailEnabled, attachPdf: c.attachPdf,
    attachXml: c.attachXml, printAutomatically: c.printAutomatically, paperWidth: c.paperWidth, taxAffectation: c.taxAffectation,
  })
  const check = (field) => ({
    checked: Boolean(form[field]),
    onChange: (e) => setForm((f) => ({ ...f, [field]: e.target.checked })),
  })
  return (
    <Step n={5} title="Preferencias" done hint="Cuándo se emite, cómo se envía y cómo se imprime.">
      <div className="fx-stack" style={{ gap: 10 }}>
        <label className="fx-check"><input type="checkbox" {...check('automaticIssuing')} /> Emitir automáticamente</label>
        {form.automaticIssuing && (
          <select className="fx-select" style={{ maxWidth: 360 }} value={form.issueTrigger} onChange={(e) => setForm({ ...form, issueTrigger: e.target.value })}>
            <option value="PAYMENT_CONFIRMED">Cuando el pedido queda pagado</option>
            <option value="ORDER_DELIVERED">Cuando el pedido se entrega</option>
          </select>
        )}
        <label className="fx-check"><input type="checkbox" {...check('emailEnabled')} /> Enviar por correo si el cliente dejó uno</label>
        <div className="fx-row" style={{ gap: 18, paddingLeft: 24 }}>
          <label className="fx-check"><input type="checkbox" {...check('attachPdf')} disabled={!form.emailEnabled} /> Adjuntar PDF</label>
          <label className="fx-check"><input type="checkbox" {...check('attachXml')} disabled={!form.emailEnabled} /> Adjuntar XML</label>
        </div>
        <label className="fx-check"><input type="checkbox" {...check('printAutomatically')} /> Abrir la impresión del ticket al emitir desde el panel</label>
        <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div className="fx-field">
            <label className="fx-label" htmlFor="inv-paper">Ancho del ticket</label>
            <select id="inv-paper" className="fx-select" value={form.paperWidth} onChange={(e) => setForm({ ...form, paperWidth: Number(e.target.value) })}>
              <option value={80}>80 mm</option>
              <option value={58}>58 mm</option>
            </select>
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="inv-tax">Tus ventas</label>
            <select id="inv-tax" className="fx-select" value={form.taxAffectation} onChange={(e) => setForm({ ...form, taxAffectation: e.target.value })}>
              <option value="GRAVADO">Gravadas con IGV 18% (lo habitual)</option>
              <option value="EXONERADO">Exoneradas de IGV</option>
              <option value="INAFECTO">Inafectas</option>
            </select>
          </div>
        </div>
      </div>
      <button type="button" className="fx-btn fx-btn--secondary" style={{ marginTop: 12 }} disabled={Boolean(busy)}
        onClick={() => act('prefs', () => updateSettings(form), 'Preferencias guardadas')}>Guardar preferencias</button>
      <p className="fx-hint" style={{ marginTop: 8, fontSize: 12.5 }}>Los precios de tu tienda incluyen el IGV: Fluxy calcula la base y el impuesto de cada comprobante.</p>
    </Step>
  )
}
