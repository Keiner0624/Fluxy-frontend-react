import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRegistration, normalizePhone, validateRegistration, apiFieldErrors } from './registration.js'

const valid = () => ({ fullName: 'Eduardo Moreno', businessName: 'Mi tienda', category: 'FOOD', whatsapp: '999888777', email: 'owner@example.test', password: 'Una frase segura', taxId: '', termsAccepted: true })

test('normalizes names, email and Peru phone without changing the password', () => {
  const result = normalizeRegistration({ ...valid(), fullName: '  Eduardo   Moreno ', businessName: ' Mi   tienda ', email: ' Owner@Example.test ', whatsapp: '+51 999 888 777' })
  assert.equal(result.fullName, 'Eduardo Moreno')
  assert.equal(result.businessName, 'Mi tienda')
  assert.equal(result.email, 'owner@example.test')
  assert.equal(result.whatsapp, '999888777')
  assert.equal(result.password, valid().password)
  assert.deepEqual(validateRegistration(result), {})
})

test('accepts optional tax ID, DNI and RUC only with valid lengths', () => {
  for (const taxId of ['', '12345678', '20123456789']) assert.deepEqual(validateRegistration({ ...valid(), taxId }), {})
  for (const taxId of ['123', '123456789', '1234567a']) assert.ok(validateRegistration({ ...valid(), taxId }).taxId)
})

test('rejects short, blank and excessive UTF-8 passwords', () => {
  for (const password of ['1234567', '        ', 'á'.repeat(37)]) assert.ok(validateRegistration({ ...valid(), password }).password)
  assert.deepEqual(validateRegistration({ ...valid(), password: 'á'.repeat(36) }), {})
})

test('requires explicit acceptance, category and personal name', () => {
  const errors = validateRegistration({ ...valid(), termsAccepted: false, category: 'UNKNOWN', fullName: '' })
  assert.ok(errors.termsAccepted)
  assert.ok(errors.category)
  assert.ok(errors.fullName)
})

test('does not silently truncate invalid phones', () => {
  assert.equal(normalizePhone('+51 999 888 7778'), '519998887778')
  for (const whatsapp of ['123456789', '99988877', '519998887778']) assert.ok(validateRegistration({ ...valid(), whatsapp }).whatsapp)
})

test('maps legacy API field names to the visible form', () => {
  assert.deepEqual(apiFieldErrors({ errors: { whatssapp: 'Invalid phone', businesName: 'Invalid name', passwordWithinByteLimit: 'Too long' } }), { whatsapp: 'Invalid phone', businessName: 'Invalid name', password: 'Too long' })
  assert.deepEqual(apiFieldErrors({ field: 'email', message: 'Duplicado' }), { email: 'Duplicado' })
})
