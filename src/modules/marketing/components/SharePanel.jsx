// src/modules/marketing/components/SharePanel.jsx
// Compartir una campaña: enlace rastreable por canal, texto listo, QR y pieza para redes.
// V1 es distribución manual: Fluxy prepara todo y el comercio lo publica.
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '@/components/Icon'
import { getCompanyStoreUrl } from '@/app/config'
import { downloadBlob } from '@/app/exporters'
import { getLink, readStoredCompany } from '../api/marketingApi'
import { CHANNELS, composeMessage, rebaseLink, whatsappShare } from '../lib/marketingFormat'
import { canvasBlob, renderQr } from '../lib/qr'
import { FORMATS, renderCreative } from '../lib/creative'

const QR_COLORS = ['#111111', '#1769e0', '#0f766e', '#7c3aed', '#be123c', '#b45309']
const CREATIVE_CHANNELS = ['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'WHATSAPP']

async function copy(text, what) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copiado`)
  } catch {
    toast.error('No se pudo copiar. Seleccioná el texto y copialo a mano.')
  }
}

function fileSlug(text) {
  return String(text || 'campana').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'campana'
}

export default function SharePanel({ campaign, capabilities }) {
  const [company] = useState(readStoredCompany)
  const [channel, setChannel] = useState(campaign.channel)
  const [link, setLink] = useState(null)
  const [error, setError] = useState('')
  const [qrColor, setQrColor] = useState(QR_COLORS[0])
  const [qrLogo, setQrLogo] = useState(false)
  const [qrPreview, setQrPreview] = useState('')
  const [creativePreview, setCreativePreview] = useState('')
  const [busy, setBusy] = useState('')
  const customQr = Boolean(capabilities?.customQr)

  useEffect(() => {
    let alive = true
    setError('')
    getLink(campaign.id, channel)
      .then((data) => { if (alive) setLink(data) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [campaign.id, channel])

  const url = rebaseLink(link, getCompanyStoreUrl(company))
  const text = url ? composeMessage(campaign, url) : ''
  const creativeInput = useMemo(() => ({
    imageUrl: campaign.imageUrl || campaign.targetImage || '',
    title: campaign.title || campaign.name,
    subtitle: campaign.message || '',
    cta: campaign.callToAction || 'Pedí online',
    storeName: company.name,
    color: company.primaryColor || '#1769e0',
    logoUrl: customQr ? company.logoUrl : '',
  }), [campaign, company, customQr])

  // Vista previa del QR (canal QR) y de la pieza (redes).
  useEffect(() => {
    if (!url) return undefined
    let alive = true
    if (channel === 'QR') {
      renderQr(url, { size: 440, color: customQr ? qrColor : '#111111', logoUrl: customQr && qrLogo ? company.logoUrl : '' })
        .then((canvas) => { if (alive) setQrPreview(canvas.toDataURL('image/png')) })
        .catch(() => { if (alive) setQrPreview('') })
    } else if (CREATIVE_CHANNELS.includes(channel)) {
      renderCreative({ ...creativeInput, format: 'square', qrText: url })
        .then((canvas) => {
          if (!alive) return
          try { setCreativePreview(canvas.toDataURL('image/jpeg', 0.8)) } catch { setCreativePreview('') }
        })
        .catch(() => { if (alive) setCreativePreview('') })
    }
    return () => { alive = false }
  }, [url, channel, qrColor, qrLogo, customQr, creativeInput, company.logoUrl])

  const downloadQr = async () => {
    setBusy('qr')
    try {
      const canvas = await renderQr(url, { size: 1024, color: customQr ? qrColor : '#111111', logoUrl: customQr && qrLogo ? company.logoUrl : '' })
      downloadBlob(await canvasBlob(canvas), `qr-${fileSlug(campaign.name)}.png`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy('')
    }
  }

  const downloadCreative = async (format) => {
    setBusy(format)
    try {
      const canvas = await renderCreative({ ...creativeInput, format, qrText: url })
      downloadBlob(await canvasBlob(canvas), `${fileSlug(campaign.name)}-${format === 'story' ? 'historia' : 'post'}.png`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="fx-card">
      <div className="fx-card__head">
        <div>
          <h2 className="fx-h3">Compartir</h2>
          <p className="fx-hint">Cada canal tiene su enlace: así sabés de dónde vino cada visita y cada pedido.</p>
        </div>
      </div>
      <div className="fx-card__body">
        {!campaign.acceptingAttribution && (
          <div className="fx-alert fx-alert--warn" style={{ marginBottom: 14 }}>
            <Icon name="info" size={16} />
            <span>
              {campaign.status === 'SCHEDULED'
                ? 'La campaña está programada: las visitas empiezan a contarse cuando arranque.'
                : 'La campaña no está activa: el enlace abre la tienda, pero no se cuentan visitas ni pedidos hasta activarla.'}
            </span>
          </div>
        )}

        {/* En la columna angosta las pestañas bajan de línea: la elegida nunca queda fuera de vista. */}
        <div className="fx-tabs" role="tablist" style={{ marginBottom: 14, flexWrap: 'wrap', overflow: 'visible' }}>
          {Object.entries(CHANNELS).map(([key, c]) => (
            <button key={key} type="button" role="tab" aria-selected={channel === key}
              className={`fx-tab${channel === key ? ' fx-tab--on' : ''}`} onClick={() => setChannel(key)}>
              <Icon name={c.icon} size={14} /> {c.label}
            </button>
          ))}
        </div>

        {error && <div className="fx-alert fx-alert--error"><Icon name="alert" size={16} /><span>{error}</span></div>}

        <div className="fx-field">
          <label className="fx-label" htmlFor="share-url">Enlace rastreable</label>
          <div className="fx-row" style={{ gap: 8 }}>
            <input id="share-url" className="fx-input" readOnly value={url} onFocus={(e) => e.target.select()} placeholder="Generando…" />
            <button type="button" className="fx-btn fx-btn--secondary" onClick={() => copy(url, 'Enlace')} disabled={!url}>
              <Icon name="copy" size={14} /> <span className="fx-hide-sm">Copiar</span>
            </button>
          </div>
        </div>

        {channel !== 'QR' && (
          <div className="fx-field">
            <div className="fx-row fx-row--between">
              <label className="fx-label" htmlFor="share-text">Mensaje</label>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => copy(text, 'Mensaje')} disabled={!text}>
                <Icon name="copy" size={13} /> Copiar mensaje
              </button>
            </div>
            <textarea id="share-text" className="fx-textarea" readOnly rows={4} value={text} onFocus={(e) => e.target.select()} />
          </div>
        )}

        <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {channel === 'WHATSAPP' && (
            <a className="fx-btn fx-btn--primary" href={text ? whatsappShare(text) : undefined} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={15} /> Compartir en WhatsApp
            </a>
          )}
          {channel === 'FACEBOOK' && link?.shareUrl && (
            <a className="fx-btn fx-btn--primary" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">
              <Icon name="facebook" size={15} /> Compartir en Facebook
            </a>
          )}
          {channel === 'DIRECT' && url && (
            <a className="fx-btn fx-btn--secondary" href={url} target="_blank" rel="noreferrer">
              <Icon name="external" size={14} /> Abrir la tienda con el enlace
            </a>
          )}
          {(channel === 'INSTAGRAM' || channel === 'TIKTOK') && (
            <p className="fx-hint" style={{ margin: 0 }}>
              {channel === 'INSTAGRAM' ? 'Instagram no acepta enlaces en las publicaciones: poné el enlace en tu bio o en un sticker de historia.' : 'Poné el enlace en tu bio y usá la pieza en el video o como portada.'}
            </p>
          )}
        </div>

        {channel === 'QR' && (
          <div className="fx-row" style={{ gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 220, maxWidth: '100%', padding: 8, border: '1px solid var(--fx-line)', borderRadius: 12, background: '#fff' }}>
              {qrPreview ? <img src={qrPreview} alt="Código QR de la campaña" style={{ width: '100%', display: 'block' }} /> : <div className="fx-skeleton" style={{ aspectRatio: '1' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p className="fx-hint" style={{ marginBottom: 10 }}>Imprimilo en el mostrador, las bolsas o los volantes. Cada escaneo cuenta como visita de la campaña.</p>
              {customQr ? (
                <>
                  <p className="fx-label">Color</p>
                  <div className="fx-swatches" style={{ marginBottom: 10 }}>
                    {QR_COLORS.map((c) => (
                      <button key={c} type="button" className="fx-swatch" aria-label={`Color ${c}`} aria-pressed={qrColor === c}
                        onClick={() => setQrColor(c)}
                        style={{ background: c, outline: qrColor === c ? '2px solid var(--fx-brand)' : 'none', outlineOffset: 2 }} />
                    ))}
                  </div>
                  {company.logoUrl && (
                    <label className="fx-check" style={{ marginBottom: 12 }}>
                      <input type="checkbox" checked={qrLogo} onChange={(e) => setQrLogo(e.target.checked)} /> Logo en el centro
                    </label>
                  )}
                </>
              ) : (
                <p className="fx-hint" style={{ marginBottom: 12 }}>
                  <span className="fx-plan-tag fx-plan-tag--pro">Pro</span> QR con el color y el logo de tu marca.
                </p>
              )}
              <button type="button" className="fx-btn fx-btn--primary" onClick={downloadQr} disabled={!url || busy === 'qr'}>
                {busy === 'qr' ? <><span className="fx-spinner" /> Generando…</> : <><Icon name="download" size={14} /> Descargar QR (PNG)</>}
              </button>
            </div>
          </div>
        )}

        {CREATIVE_CHANNELS.includes(channel) && (
          <>
            <div className="fx-divider" style={{ margin: '18px 0' }} />
            <p className="fx-label">Pieza para redes</p>
            <div className="fx-row" style={{ gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 220, maxWidth: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--fx-line)' }}>
                {creativePreview ? <img src={creativePreview} alt="Vista previa de la pieza" style={{ width: '100%', display: 'block' }} /> : <div className="fx-skeleton" style={{ aspectRatio: '1' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <p className="fx-hint" style={{ marginBottom: 12 }}>
                  Con la foto, el título y un QR con el enlace de este canal. Para cambiar el texto o la imagen, editá la campaña.
                </p>
                <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(FORMATS).map(([key, f]) => (
                    <button key={key} type="button" className="fx-btn fx-btn--secondary" onClick={() => downloadCreative(key)} disabled={!url || Boolean(busy)}>
                      {busy === key ? <><span className="fx-spinner" /> Generando…</> : <><Icon name="download" size={14} /> {f.label}</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
