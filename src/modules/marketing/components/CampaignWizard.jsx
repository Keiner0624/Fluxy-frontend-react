// src/modules/marketing/components/CampaignWizard.jsx
// Asistente "Crear campaña": qué se promociona → objetivo → canal → contenido → audiencia → revisar.
// También edita: lo que ya se publicó (qué y por dónde) queda fijo para no mezclar resultados.
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import { Modal } from '@/modules/dashboard/components/ui'
import { uploadImage, validateImage } from '@/app/cloudinary'
import { generateCampaignCopy } from '@/app/ai'
import {
  CHANNELS, OBJECTIVES, TYPES, defaultObjective, discountLabel, formatMoney, suggestContent,
} from '../lib/marketingFormat'
import {
  campaignAction, createCampaign, getSegments, listCategories, listCoupons, listProducts, readStoredCompany, updateCampaign,
} from '../api/marketingApi'

const STEPS = ['Qué', 'Objetivo', 'Canal', 'Contenido', 'Audiencia', 'Revisar']

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(local) {
  if (!local) return null
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function initialForm(campaign, preset) {
  if (campaign) {
    return {
      type: campaign.type, objective: campaign.objective, targetId: campaign.type === 'COUPON' ? null : campaign.targetId,
      couponId: campaign.couponId, channel: campaign.channel, name: campaign.name || '', title: campaign.title || '',
      message: campaign.message || '', callToAction: campaign.callToAction || '', imageUrl: campaign.imageUrl || '',
      segment: campaign.segment || '', segmentCategoryId: campaign.segmentCategoryId || '',
      startsAt: toLocalInput(campaign.startsAt), endsAt: toLocalInput(campaign.endsAt),
    }
  }
  const type = preset?.type || ''
  return {
    type, objective: preset?.objective || (type ? defaultObjective(type) : ''), targetId: preset?.targetId || null,
    couponId: null, channel: preset?.channel || '', name: preset?.name || '', title: '', message: '', callToAction: '',
    imageUrl: '', segment: preset?.segment || '', segmentCategoryId: '', startsAt: '', endsAt: '',
  }
}

function OptionGrid({ options, value, onChange, locked = {} }) {
  return (
    <div className="fx-roles" role="radiogroup">
      {Object.entries(options).map(([key, option]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          className={`fx-role${value === key ? ' is-on' : ''}`}
          onClick={() => !locked[key] && onChange(key)}
          disabled={Boolean(locked[key])}
          style={locked[key] ? { opacity: .55, cursor: 'not-allowed' } : undefined}
        >
          <strong style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {option.icon && <Icon name={option.icon} size={15} />}{option.label}
            {locked[key] && <span className="fx-plan-tag fx-plan-tag--pro" style={{ marginLeft: 'auto' }}>{locked[key]}</span>}
          </strong>
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  )
}

export default function CampaignWizard({ campaign, preset, capabilities, canPublish, onClose, onSaved }) {
  const editing = Boolean(campaign)
  const published = editing && campaign.status !== 'DRAFT'
  const [step, setStep] = useState(() => (editing ? 3 : preset?.type ? (preset.type === 'STORE' || preset.targetId ? 1 : 0) : 0))
  const [form, setForm] = useState(() => initialForm(campaign, preset))
  const [catalog, setCatalog] = useState({ products: [], categories: [], coupons: [], segments: [], loaded: false })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [writing, setWriting] = useState(false)
  const [company] = useState(readStoredCompany)

  useEffect(() => {
    let alive = true
    // Cada lista puede fallar por permisos (p. ej. sin acceso a Cupones): se sigue con lo que haya.
    Promise.allSettled([listProducts(), listCategories(), capabilities?.coupons ? listCoupons() : Promise.resolve([]), getSegments()])
      .then(([products, categories, coupons, segments]) => {
        if (!alive) return
        const value = (r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [])
        setCatalog({
          products: value(products).filter((p) => p.status !== 'HIDDEN'),
          categories: value(categories),
          coupons: value(coupons),
          segments: value(segments),
          loaded: true,
        })
      })
    return () => { alive = false }
  }, [capabilities?.coupons])

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setError('') }
  const product = catalog.products.find((p) => p.id === Number(form.targetId))
  const category = catalog.categories.find((c) => c.id === Number(form.targetId))
  const coupon = catalog.coupons.find((c) => c.id === Number(form.couponId))
  const target = form.type === 'PRODUCT' ? product : form.type === 'CATEGORY' ? category : null

  const suggestion = () => suggestContent({
    type: form.type, objective: form.objective, target: target && { name: target.name, price: target.price },
    coupon, storeName: company.name,
  })

  // Texto propuesto por la IA (plan Business): queda en los campos para revisarlo y editarlo.
  const writeWithAi = async () => {
    setWriting(true)
    setError('')
    try {
      const copy = await generateCampaignCopy({
        type: form.type, objective: form.objective, channel: form.channel,
        target: target?.name || null, price: target?.price != null ? String(target.price) : null,
        couponCode: coupon?.code || null, discount: coupon ? discountLabel(coupon) : null, storeName: company.name || null,
      })
      set({ title: copy.title, message: copy.message, callToAction: copy.callToAction })
    } catch (e) {
      setError(e.message)
    } finally {
      setWriting(false)
    }
  }

  const applySuggestion = () => {
    const s = suggestion()
    set({ title: s.title, message: s.message, callToAction: s.callToAction })
  }

  // Al llegar al contenido por primera vez, se propone un texto y un nombre.
  useEffect(() => {
    if (step !== 3 || editing) return
    setForm((f) => {
      if (f.title || f.message) return f
      const s = suggestContent({
        type: f.type, objective: f.objective, target: target && { name: target.name, price: target.price },
        coupon, storeName: company.name,
      })
      return {
        ...f, ...s,
        name: f.name || s.title,
        imageUrl: f.imageUrl || (f.type === 'PRODUCT' ? product?.imageUrl || '' : ''),
      }
    })
    // Solo al entrar al paso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const stepError = (index) => {
    if (index === 0) {
      if (!form.type) return 'Elegí qué vas a promocionar.'
      if (form.type === 'PRODUCT' && !form.targetId) return 'Elegí el producto.'
      if (form.type === 'CATEGORY' && !form.targetId) return 'Elegí la categoría.'
      if (form.type === 'COUPON' && !form.couponId) return 'Elegí el cupón.'
    }
    if (index === 1 && !form.objective) return 'Elegí un objetivo.'
    if (index === 2 && !form.channel) return 'Elegí por dónde lo vas a compartir.'
    if (index === 3) {
      if (!form.name.trim()) return 'Poné un nombre a la campaña.'
      if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) return 'La fecha de fin tiene que ser posterior al inicio.'
    }
    if (index === 4 && form.segment === 'CATEGORY_BUYERS' && !form.segmentCategoryId) return 'Elegí la categoría del segmento.'
    return ''
  }

  const next = () => {
    const problem = stepError(step)
    if (problem) { setError(problem); return }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const payload = () => ({
    name: form.name.trim(),
    type: form.type,
    objective: form.objective,
    targetId: form.type === 'COUPON' ? form.couponId : form.targetId,
    couponId: form.couponId || null,
    channel: form.channel,
    title: form.title,
    message: form.message,
    callToAction: form.callToAction,
    imageUrl: form.imageUrl,
    segment: form.segment || null,
    segmentCategoryId: form.segment === 'CATEGORY_BUYERS' ? Number(form.segmentCategoryId) || null : null,
    startsAt: toIso(form.startsAt),
    endsAt: toIso(form.endsAt),
  })

  const save = async (activate) => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      const problem = stepError(i)
      if (problem) { setStep(i); setError(problem); return }
    }
    setSaving(true)
    setError('')
    try {
      let saved = editing ? await updateCampaign(campaign.id, payload()) : await createCampaign(payload())
      let activationError = ''
      if (activate) {
        try {
          saved = await campaignAction(saved.id, 'activate')
        } catch (e) {
          // La campaña quedó guardada; se informa por qué no se activó.
          activationError = e.message
        }
      }
      onSaved(saved, { created: !editing, activationError })
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const upload = async (file) => {
    const problem = validateImage(file)
    if (problem) { setError(problem); return }
    setUploading(true)
    try {
      set({ imageUrl: await uploadImage(file) })
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const segmentOptions = catalog.segments
  const selectedSegment = segmentOptions.find((s) => s.key === form.segment)

  const footer = (
    <>
      {step > 0 && !(published && step === 3) && (
        <button type="button" className="fx-btn fx-btn--ghost" onClick={() => { setError(''); setStep((s) => s - 1) }} disabled={saving}>
          <Icon name="arrowLeft" size={14} /> Atrás
        </button>
      )}
      <span style={{ flex: 1 }} />
      {step < STEPS.length - 1 ? (
        <button type="button" className="fx-btn fx-btn--primary" onClick={next}>
          Siguiente <Icon name="arrowRight" size={14} />
        </button>
      ) : (
        <>
          {!published && (
            <button type="button" className="fx-btn fx-btn--secondary" onClick={() => save(false)} disabled={saving}>
              {editing ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
          )}
          {published ? (
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => save(false)} disabled={saving}>
              {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar cambios'}
            </button>
          ) : canPublish && (
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => save(true)} disabled={saving}>
              {saving ? <><span className="fx-spinner" /> Guardando…</> : <><Icon name="megaphone" size={15} /> {editing ? 'Guardar y activar' : 'Crear y activar'}</>}
            </button>
          )}
        </>
      )}
    </>
  )

  return (
    <Modal
      title={editing ? `Editar: ${campaign.name}` : 'Crear campaña'}
      subtitle={`Paso ${step + 1} de ${STEPS.length} · ${STEPS[step]}`}
      onClose={onClose}
      width={640}
      footer={footer}
    >
      <div className="fx-steps" aria-hidden="true">
        {STEPS.map((label, i) => (
          <div key={label} className={`fx-steps__item${i <= step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`}>
            <div className="fx-steps__bar" />
            <span className="fx-steps__label">{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <>
          <p className="fx-label" style={{ marginBottom: 10 }}>¿Qué vas a promocionar?</p>
          <OptionGrid
            options={TYPES}
            value={form.type}
            locked={{
              ...(!capabilities?.coupons ? { COUPON: 'Pro' } : {}),
              ...(published ? Object.fromEntries(Object.keys(TYPES).filter((k) => k !== form.type).map((k) => [k, 'Fijo'])) : {}),
            }}
            onChange={(type) => set({ type, targetId: null, objective: defaultObjective(type) })}
          />
          {form.type === 'PRODUCT' && (
            <div className="fx-field" style={{ marginTop: 16 }}>
              <label className="fx-label" htmlFor="w-product">Producto</label>
              <select id="w-product" className="fx-select" value={form.targetId || ''} disabled={published}
                onChange={(e) => set({ targetId: Number(e.target.value) || null })}>
                <option value="">{catalog.loaded ? 'Elegí un producto' : 'Cargando…'}</option>
                {catalog.products.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatMoney(p.price)}{p.stock <= 0 ? ' · sin stock' : ''}</option>)}
              </select>
              {product && (
                <div className="fx-row" style={{ gap: 10, marginTop: 10 }}>
                  {product.imageUrl && <img src={product.imageUrl} alt="" className="fx-thumb" />}
                  <span className="fx-hint">{product.stock > 0 ? `${product.stock} en stock` : 'Sin stock: conviene reponer antes de promocionarlo.'}</span>
                </div>
              )}
            </div>
          )}
          {form.type === 'CATEGORY' && (
            <div className="fx-field" style={{ marginTop: 16 }}>
              <label className="fx-label" htmlFor="w-category">Categoría</label>
              <select id="w-category" className="fx-select" value={form.targetId || ''} disabled={published}
                onChange={(e) => set({ targetId: Number(e.target.value) || null })}>
                <option value="">{catalog.loaded ? 'Elegí una categoría' : 'Cargando…'}</option>
                {catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.name}</option>)}
              </select>
            </div>
          )}
          {form.type === 'COUPON' && (
            <div className="fx-field" style={{ marginTop: 16 }}>
              <label className="fx-label" htmlFor="w-coupon">Cupón</label>
              <select id="w-coupon" className="fx-select" value={form.couponId || ''} disabled={published}
                onChange={(e) => set({ couponId: Number(e.target.value) || null })}>
                <option value="">{catalog.loaded ? 'Elegí un cupón' : 'Cargando…'}</option>
                {catalog.coupons.map((c) => <option key={c.id} value={c.id} disabled={!c.active}>{c.code} · {discountLabel(c)}{c.active ? '' : ' (inactivo)'}</option>)}
              </select>
              {catalog.loaded && catalog.coupons.length === 0 && (
                <p className="fx-hint" style={{ marginTop: 6 }}>Todavía no tenés cupones. Creá uno en <a className="fx-link" href="/dashboard/coupons">Cupones</a> y volvé.</p>
              )}
            </div>
          )}
        </>
      )}

      {step === 1 && (
        <>
          <p className="fx-label" style={{ marginBottom: 10 }}>¿Qué querés lograr?</p>
          <OptionGrid options={OBJECTIVES} value={form.objective} onChange={(objective) => set({ objective })} />
        </>
      )}

      {step === 2 && (
        <>
          <p className="fx-label" style={{ marginBottom: 10 }}>¿Por dónde lo vas a compartir?</p>
          <OptionGrid
            options={CHANNELS}
            value={form.channel}
            locked={published ? Object.fromEntries(Object.keys(CHANNELS).filter((k) => k !== form.channel).map((k) => [k, 'Fijo'])) : {}}
            onChange={(channel) => set({ channel })}
          />
          <p className="fx-hint" style={{ marginTop: 12 }}>
            Fluxy arma el enlace rastreable y el texto; vos lo publicás. Después podés sacar enlaces para otros canales y cada visita queda registrada con su origen.
          </p>
        </>
      )}

      {step === 3 && (
        <>
          <div className="fx-field">
            <label className="fx-label" htmlFor="w-name">Nombre interno</label>
            <input id="w-name" className="fx-input" maxLength={120} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Promo de invierno" />
          </div>
          <div className="fx-row fx-row--between" style={{ marginBottom: 8 }}>
            <span className="fx-label" style={{ margin: 0 }}>Contenido</span>
            <div className="fx-row" style={{ gap: 4 }}>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={applySuggestion} disabled={writing}>
                <Icon name="refresh" size={14} /> Texto sugerido
              </button>
              {capabilities?.ai && (
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={writeWithAi} disabled={writing}>
                  {writing ? <><span className="fx-spinner" /> Escribiendo…</> : <><Icon name="sparkles" size={14} /> Escribir con IA</>}
                </button>
              )}
            </div>
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="w-title">Título</label>
            <input id="w-title" className="fx-input" maxLength={120} value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="w-message">Mensaje</label>
            <textarea id="w-message" className="fx-textarea" maxLength={1000} rows={3} value={form.message} onChange={(e) => set({ message: e.target.value })} />
            <p className="fx-hint" style={{ marginTop: 4, textAlign: 'right' }}>{form.message.length}/1000</p>
          </div>
          <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fx-field">
              <label className="fx-label" htmlFor="w-cta">Llamada a la acción</label>
              <input id="w-cta" className="fx-input" maxLength={60} value={form.callToAction} onChange={(e) => set({ callToAction: e.target.value })} placeholder="Pedilo acá" />
            </div>
            {form.type !== 'COUPON' && capabilities?.coupons && (
              <div className="fx-field">
                <label className="fx-label" htmlFor="w-coupon2">Cupón (opcional)</label>
                <select id="w-coupon2" className="fx-select" value={form.couponId || ''} onChange={(e) => set({ couponId: Number(e.target.value) || null })}>
                  <option value="">Sin cupón</option>
                  {catalog.coupons.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.code} · {discountLabel(c)}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="fx-field">
            <label className="fx-label">Imagen</label>
            <div className="fx-row" style={{ gap: 10, flexWrap: 'wrap' }}>
              {form.imageUrl && <img src={form.imageUrl} alt="" className="fx-thumb fx-thumb--lg" />}
              <label className="fx-btn fx-btn--secondary fx-btn--sm" style={{ cursor: 'pointer' }}>
                {uploading ? <><span className="fx-spinner" /> Subiendo…</> : <><Icon name="upload" size={14} /> {form.imageUrl ? 'Cambiar' : 'Subir imagen'}</>}
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
              {form.imageUrl && (
                <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => set({ imageUrl: '' })}>Quitar</button>
              )}
            </div>
            <p className="fx-hint" style={{ marginTop: 6 }}>Se usa en la pieza para redes. Si promocionás un producto, se toma su foto.</p>
          </div>
          <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fx-field">
              <label className="fx-label" htmlFor="w-start">Empieza</label>
              <input id="w-start" type="datetime-local" className="fx-input" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} />
            </div>
            <div className="fx-field">
              <label className="fx-label" htmlFor="w-end">Termina</label>
              <input id="w-end" type="datetime-local" className="fx-input" value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
            </div>
          </div>
          <p className="fx-hint" style={{ marginTop: -6 }}>Vacío: empieza al activarla y dura hasta que la finalices. Fuera de estas fechas no se atribuyen visitas ni pedidos.</p>
        </>
      )}

      {step === 4 && (
        <>
          <p className="fx-label" style={{ marginBottom: 4 }}>Audiencia (opcional)</p>
          <p className="fx-hint" style={{ marginBottom: 12 }}>
            Con un segmento, en la campaña vas a tener la lista de esos clientes para escribirles uno a uno por WhatsApp. Quienes pidieron no recibir promociones no aparecen.
          </p>
          <div className="fx-roles">
            <button type="button" className={`fx-role${!form.segment ? ' is-on' : ''}`} onClick={() => set({ segment: '', segmentCategoryId: '' })}>
              <strong>Sin segmento</strong><span>Compartís el enlace en tus canales.</span>
            </button>
            {segmentOptions.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`fx-role${form.segment === s.key ? ' is-on' : ''}`}
                disabled={!s.available}
                style={!s.available ? { opacity: .55, cursor: 'not-allowed' } : undefined}
                onClick={() => s.available && set({ segment: s.key })}
              >
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.label}
                  {!s.available && <span className="fx-plan-tag fx-plan-tag--pro" style={{ marginLeft: 'auto' }}>Pro</span>}
                </strong>
                <span>{s.rule}{s.customers != null ? ` · ${s.customers} ${s.customers === 1 ? 'cliente' : 'clientes'}` : ''}</span>
              </button>
            ))}
          </div>
          {form.segment === 'CATEGORY_BUYERS' && (
            <div className="fx-field" style={{ marginTop: 14 }}>
              <label className="fx-label" htmlFor="w-segcat">Categoría</label>
              <select id="w-segcat" className="fx-select" value={form.segmentCategoryId} onChange={(e) => set({ segmentCategoryId: e.target.value })}>
                <option value="">Elegí una categoría</option>
                {catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {selectedSegment?.reachable != null && (
            <p className="fx-hint" style={{ marginTop: 12 }}>
              {selectedSegment.reachable} de {selectedSegment.customers} tienen teléfono para escribirles.
            </p>
          )}
        </>
      )}

      {step === 5 && (
        <dl className="fx-kv" style={{ gap: '8px 16px' }}>
          <dt>Nombre</dt><dd>{form.name}</dd>
          <dt>Promociona</dt>
          <dd>{TYPES[form.type]?.label}{target ? ` · ${target.name}` : ''}{form.type === 'COUPON' && coupon ? ` · ${coupon.code}` : ''}</dd>
          <dt>Objetivo</dt><dd>{OBJECTIVES[form.objective]?.label}</dd>
          <dt>Canal</dt><dd>{CHANNELS[form.channel]?.label}</dd>
          {coupon && form.type !== 'COUPON' && <><dt>Cupón</dt><dd>{coupon.code} · {discountLabel(coupon)}</dd></>}
          <dt>Vigencia</dt>
          <dd>{form.startsAt ? new Date(form.startsAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Al activarla'} → {form.endsAt ? new Date(form.endsAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Hasta finalizarla'}</dd>
          {selectedSegment && <><dt>Audiencia</dt><dd>{selectedSegment.label}</dd></>}
          <dt>Mensaje</dt>
          <dd style={{ whiteSpace: 'pre-line' }}>{[form.title, form.message, form.callToAction && `${form.callToAction}: (enlace de la campaña)`].filter(Boolean).join('\n')}</dd>
        </dl>
      )}

      {error && (
        <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      )}
      {step === 5 && !canPublish && !published && (
        <p className="fx-hint" style={{ marginTop: 12 }}>Tu rol puede crear campañas pero no publicarlas: queda como borrador para que alguien con permiso la active.</p>
      )}
    </Modal>
  )
}
