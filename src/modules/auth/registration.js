export const BUSINESS_CATEGORIES = {
  CLOTHING: 'Ropa y accesorios', TECHNOLOGY: 'Tecnología', FOOD: 'Alimentos y bebidas',
  BEAUTY: 'Belleza', PHARMACY: 'Farmacia', HOME: 'Hogar', SERVICES: 'Servicios', OTHER: 'Otro',
}

/** Igual que PasswordPolicy en el backend. */
export const PASSWORD_MIN = 10

export function normalizePhone(value) {
  const digits = value.replace(/[\s()+-]/g, '')
  return digits.startsWith('51') && digits.length === 11 ? digits.slice(2) : digits
}

export function normalizeRegistration(form) {
  return {
    ...form,
    fullName: form.fullName.trim().replace(/\s+/g, ' '),
    businessName: form.businessName.trim().replace(/\s+/g, ' '),
    email: form.email.trim().toLowerCase(),
    whatsapp: normalizePhone(form.whatsapp),
    taxId: (form.taxId || '').trim(),
  }
}

export function validateRegistration(form, { requirePassword = true, requirePersonal = true } = {}) {
  const errors = {}
  if (requirePersonal && (form.fullName.length < 2 || form.fullName.length > 80)) errors.fullName = 'Ingresa tu nombre (entre 2 y 80 caracteres).'
  if (form.businessName.length < 2 || form.businessName.length > 120) errors.businessName = 'Usa entre 2 y 120 caracteres para tu negocio.'
  if (!Object.hasOwn(BUSINESS_CATEGORIES, form.category)) errors.category = 'Selecciona el rubro de tu negocio.'
  if (!/^9\d{8}$/.test(form.whatsapp)) errors.whatsapp = 'Ingresa un celular peruano de 9 dígitos que empiece con 9.'
  if (requirePersonal && (form.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) errors.email = 'Ingresa un correo electrónico válido.'
  if (requirePassword && (!form.password.trim() || form.password.length < PASSWORD_MIN || new TextEncoder().encode(form.password).length > 72)) errors.password = `Usá al menos ${PASSWORD_MIN} caracteres. Podés usar una frase fácil de recordar.`
  if (form.taxId && !/^(\d{8}|\d{11})$/.test(form.taxId)) errors.taxId = 'El DNI tiene 8 dígitos y el RUC, 11.'
  if (!form.termsAccepted) errors.termsAccepted = 'Debes aceptar los términos y la política de privacidad.'
  return errors
}

export function apiFieldErrors(data) {
  const aliases = { businesName: 'businessName', whatssapp: 'whatsapp', passwordWithinByteLimit: 'password' }
  const errors = { ...(data.errors || {}) }
  if (data.field) errors[data.field] = data.message
  if (data.details?.field) errors[data.details.field] = data.message
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => [aliases[key] || key, value]))
}
