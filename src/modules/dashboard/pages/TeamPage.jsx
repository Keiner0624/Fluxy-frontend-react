// src/modules/dashboard/pages/TeamPage.jsx
// Personas del negocio, su rol y lo que puede hacer cada una.
import { useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { date, ROLES, PERMISSION_GROUPS } from '@/app/format'
import { ConfirmDialog, EmptyState, ErrorState, Modal, NoAccess } from '@/modules/dashboard/components/ui'

function RolePicker({ value, onChange, allowAdmin }) {
  return (
    <div className="fx-roles">
      {['ADMIN', 'SELLER', 'VIEWER'].map((role) => {
        const disabled = role === 'ADMIN' && !allowAdmin
        return (
          <button key={role} type="button" disabled={disabled} className={`fx-role${value === role ? ' is-on' : ''}`}
            style={disabled ? { opacity: .5, cursor: 'not-allowed' } : undefined}
            title={disabled ? 'Solo el dueño puede asignar administradores' : undefined}
            onClick={() => onChange(role)}>
            <strong>{ROLES[role].label}</strong>
            <span>{ROLES[role].text}</span>
          </button>
        )
      })}
    </div>
  )
}

function PermissionGrid({ selected, onChange, grantable }) {
  const toggle = (permission) => {
    const next = new Set(selected)
    if (next.has(permission)) next.delete(permission); else next.add(permission)
    onChange(next)
  }
  return (
    <div className="fx-perms">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.module} className="fx-perms__group">
          <p>{group.module}</p>
          {group.items.map(([key, label]) => {
            const disabled = !grantable.has(key)
            return (
              <label key={key} className="fx-check" style={disabled ? { opacity: .5, cursor: 'not-allowed' } : undefined}
                title={disabled ? 'No podés conceder un permiso que no tenés' : undefined}>
                <input type="checkbox" checked={selected.has(key)} disabled={disabled} onChange={() => toggle(key)} />
                <span>{label}</span>
              </label>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Lo que quien invita puede conceder: lo que tiene, sin facturación, y equipo completo solo si es dueño. */
function useGrantable() {
  const access = useAccess()
  const all = PERMISSION_GROUPS.flatMap((g) => g.items.map(([key]) => key))
  return new Set(all.filter((key) => {
    if (key === 'TEAM_MANAGE' && !access.isOwner) return false
    return access.isOwner || access.can(key)
  }))
}

function InviteModal({ team, onClose, onInvited }) {
  const access = useAccess()
  const grantable = useGrantable()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('SELLER')
  const [custom, setCustom] = useState(false)
  const [permissions, setPermissions] = useState(() => new Set(team.roleDefaults.SELLER))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const pickRole = (next) => {
    setRole(next)
    setPermissions(new Set(team.roleDefaults[next]))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const r = await api.post('/team/invitations', { email, role, permissions: custom ? [...permissions] : null })
      setResult(r)
      onInvited()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (result) {
    const message = `Te invité al equipo de ${JSON.parse(localStorage.getItem('company') || '{}').name || 'mi negocio'} en Fluxy. Creá tu acceso acá: ${result.acceptUrl}`
    return (
      <Modal title="Invitación creada" onClose={onClose} width={520}
        footer={<button type="button" className="fx-btn fx-btn--primary" onClick={onClose}>Listo</button>}>
        <div className={`fx-alert ${result.emailSent ? 'fx-alert--ok' : 'fx-alert--warn'}`} style={{ marginBottom: 16 }}>
          <Icon name={result.emailSent ? 'mail' : 'info'} size={16} />
          <span>
            {result.emailSent
              ? `Le enviamos un correo a ${result.invitation.email}. También podés compartirle el enlace.`
              : 'El envío de correos no está configurado: compartile este enlace por WhatsApp o como prefieras.'}
          </span>
        </div>
        <label className="fx-label" htmlFor="invite-link">Enlace de invitación (vence en 7 días)</label>
        <div className="fx-row" style={{ gap: 8 }}>
          <input id="invite-link" className="fx-input" readOnly value={result.acceptUrl} onFocus={(e) => e.target.select()} />
          <button type="button" className="fx-btn fx-btn--secondary" onClick={() => { navigator.clipboard?.writeText(result.acceptUrl); toast.success('Enlace copiado.') }}>
            <Icon name="copy" size={15} /> Copiar
          </button>
        </div>
        <a className="fx-btn fx-btn--ghost fx-btn--sm" style={{ marginTop: 10 }} target="_blank" rel="noreferrer"
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}>
          <Icon name="message" size={14} /> Compartir por WhatsApp
        </a>
      </Modal>
    )
  }

  return (
    <Modal as="form" onSubmit={submit} title="Invitar al equipo" onClose={onClose} width={680}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving || !email.trim()}>
            {saving ? <><span className="fx-spinner" /> Creando…</> : 'Crear invitación'}
          </button>
        </>
      )}
    >
      <div className="fx-field">
        <label className="fx-label" htmlFor="invite-email">Correo</label>
        <input id="invite-email" className="fx-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="persona@correo.com" autoFocus maxLength={150} />
      </div>
      <span className="fx-label">Rol</span>
      <RolePicker value={role} onChange={pickRole} allowAdmin={access.isOwner} />
      <label className="fx-check" style={{ margin: '16px 0 12px' }}>
        <input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} />
        <span>Personalizar permisos por módulo</span>
      </label>
      {custom && <PermissionGrid selected={permissions} onChange={setPermissions} grantable={grantable} />}
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

function EditMemberModal({ member, team, onClose, onSaved }) {
  const access = useAccess()
  const grantable = useGrantable()
  const [role, setRole] = useState(member.role)
  const [custom, setCustom] = useState(member.customPermissions)
  const [permissions, setPermissions] = useState(() => new Set(member.permissions))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await api.patch(`/team/members/${member.userId}`, {
        role,
        useRoleDefaults: !custom,
        permissions: custom ? [...permissions] : null,
      })
      toast.success(`Permisos de ${updated.fullName} actualizados.`)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={member.fullName} subtitle={member.email} onClose={onClose} width={680}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </>
      )}
    >
      <span className="fx-label">Rol</span>
      <RolePicker value={role} allowAdmin={access.isOwner}
        onChange={(next) => { setRole(next); if (!custom) setPermissions(new Set(team.roleDefaults[next])) }} />
      <label className="fx-check" style={{ margin: '16px 0 12px' }}>
        <input type="checkbox" checked={custom} onChange={(e) => {
          setCustom(e.target.checked)
          if (!e.target.checked) setPermissions(new Set(team.roleDefaults[role]))
        }} />
        <span>Personalizar permisos (si no, usa los del rol y se actualiza si el rol cambia)</span>
      </label>
      {custom
        ? <PermissionGrid selected={permissions} onChange={setPermissions} grantable={grantable} />
        : <p className="fx-hint">Permisos del rol: {team.roleDefaults[role].length} acciones habilitadas.</p>}
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

export default function TeamPage() {
  const access = useAccess()
  const canView = access.can('TEAM_VIEW')
  const { data: team, loading, error, reload } = useApi(() => api.get('/team'), [], { enabled: canView })
  const [inviting, setInviting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [busy, setBusy] = useState(false)

  const canManageMember = (m) => access.can('TEAM_MANAGE') && !m.you && m.role !== 'OWNER' && (m.role !== 'ADMIN' || access.isOwner)

  const setStatus = async () => {
    setBusy(true)
    const next = toggling.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    try {
      await api.patch(`/team/members/${toggling.userId}`, { status: next })
      toast.success(next === 'DISABLED' ? `${toggling.fullName} ya no puede entrar al panel.` : `${toggling.fullName} recuperó el acceso.`)
      setToggling(null)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resend = async (invitation) => {
    try {
      // Si coincide con los permisos del rol se reenvía sin personalizar, para que siga al rol.
      const defaults = team.roleDefaults[invitation.role] || []
      const sameAsRole = defaults.length === invitation.permissions.length && defaults.every((p) => invitation.permissions.includes(p))
      const r = await api.post('/team/invitations', {
        email: invitation.email, role: invitation.role, permissions: sameAsRole ? null : invitation.permissions,
      })
      navigator.clipboard?.writeText(r.acceptUrl)
      toast.success(r.emailSent ? 'Invitación reenviada por correo. Enlace copiado.' : 'Nuevo enlace copiado al portapapeles.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const revoke = async (invitation) => {
    try {
      await api.del(`/team/invitations/${invitation.id}`)
      toast.success('Invitación revocada.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Equipo" /></DashboardLayout>

  const members = team?.members || []
  const invitations = team?.invitations || []

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Equipo</h1>
          <p>{team ? `${members.length} ${members.length === 1 ? 'persona' : 'personas'} con acceso al panel` : 'Quién trabaja en tu negocio y qué puede hacer'}</p>
        </div>
        {access.can('TEAM_INVITE') && (
          <div className="fx-page-head__actions">
            <button className="fx-btn fx-btn--primary" onClick={() => setInviting(true)} disabled={!team}>
              <Icon name="plus" size={16} /> Invitar persona
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ marginBottom: 14 }}><ErrorState error={error} onRetry={reload} /></div>}

      <div className="fx-card" style={{ marginBottom: 16 }}>
        {loading && !team ? (
          <div className="fx-card__body">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)}</div>
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Rol</th>
                  <th className="fx-hide-md">Permisos</th>
                  <th className="fx-hide-sm">Estado</th>
                  <th style={{ width: 150 }} />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId}>
                    <td>
                      <div className="fx-table__strong">{m.fullName}{m.you && <span className="fx-hint" style={{ fontWeight: 400 }}> (vos)</span>}</div>
                      <div className="fx-hint" style={{ fontSize: 12 }}>{m.email}</div>
                    </td>
                    <td><span className={`fx-badge${m.role === 'OWNER' ? ' fx-badge--brand' : ''}`}>{ROLES[m.role]?.label || m.role}</span></td>
                    <td className="fx-hide-md fx-hint" style={{ fontSize: 13 }}>
                      {m.role === 'OWNER' ? 'Acceso total' : m.customPermissions ? `Personalizados · ${m.permissions.length}` : `Del rol · ${m.permissions.length}`}
                    </td>
                    <td className="fx-hide-sm">
                      {m.status === 'ACTIVE'
                        ? <span className="fx-badge fx-badge--ok"><span className="fx-dot" />Activo</span>
                        : <span className="fx-badge fx-badge--danger">Desactivado</span>}
                    </td>
                    <td>
                      {canManageMember(m) && (
                        <div className="fx-row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                          <button className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setToggling(m)}>
                            {m.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
                          </button>
                          <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setEditing(m)} aria-label={`Editar permisos de ${m.fullName}`}>
                            <Icon name="edit" size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {team && (
        <div className="fx-split">
          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Invitaciones pendientes</h2></div>
            {invitations.length === 0 ? (
              <EmptyState icon="mail" title="Sin invitaciones pendientes"
                text="Invitá a quien te ayuda con el negocio. Cada persona entra con su propio correo y ve solo lo que le permitas." />
            ) : (
              <ul className="fx-list" style={{ padding: '4px 20px' }}>
                {invitations.map((inv) => (
                  <li key={inv.id} className="fx-list__row" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 13.5, color: 'var(--fx-ink)' }}>{inv.email}</div>
                      <div className="fx-hint" style={{ fontSize: 12 }}>
                        {ROLES[inv.role]?.label} · {inv.status === 'EXPIRED' ? 'Vencida' : `Vence el ${date(inv.expiresAt)}`}
                      </div>
                    </div>
                    {access.can('TEAM_INVITE') && (
                      <>
                        <button className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => resend(inv)}>Reenviar</button>
                        <button className="fx-btn fx-btn--ghost fx-btn--sm" style={{ color: 'var(--fx-danger)' }} onClick={() => revoke(inv)}>Revocar</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Roles</h2></div>
            <div className="fx-card__body">
              <dl className="fx-kv" style={{ gap: '10px 14px' }}>
                {Object.entries(ROLES).map(([key, role]) => (
                  <div key={key} style={{ display: 'contents' }}>
                    <dt style={{ fontWeight: 500, color: 'var(--fx-ink)' }}>{role.label}</dt>
                    <dd style={{ color: 'var(--fx-copy)' }}>{role.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}

      {inviting && team && <InviteModal team={team} onClose={() => setInviting(false)} onInvited={reload} />}
      {editing && team && <EditMemberModal member={editing} team={team} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
      {toggling && (
        <ConfirmDialog
          title={toggling.status === 'ACTIVE' ? `Desactivar a ${toggling.fullName}` : `Reactivar a ${toggling.fullName}`}
          text={toggling.status === 'ACTIVE'
            ? 'Pierde el acceso de inmediato, incluso si tiene la sesión abierta. Su historial de acciones se conserva.'
            : 'Vuelve a entrar al panel con el rol y los permisos que tenía.'}
          confirmLabel={toggling.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
          danger={toggling.status === 'ACTIVE'}
          busy={busy}
          onClose={() => setToggling(null)}
          onConfirm={setStatus}
        />
      )}
    </DashboardLayout>
  )
}
