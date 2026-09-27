import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isValidDni, isValidRuc, receiverErrors, ticketHtml } from './invoicingFormat.js'

test('el RUC se valida con el mismo dígito verificador que el servidor', () => {
  assert.equal(isValidRuc('20600000005'), true)
  assert.equal(isValidRuc('10456789124'), true)
  assert.equal(isValidRuc('20600000004'), false)
  assert.equal(isValidRuc('30600000005'), false)
  assert.equal(isValidRuc('2060000000'), false)
  assert.equal(isValidDni('4567 8912'), true)
  assert.equal(isValidDni('4567891'), false)
})

test('reglas del receptor: factura con RUC y razón social, boleta de S/ 700 con documento', () => {
  assert.deepEqual(Object.keys(receiverErrors('FACTURA', { documentNumber: '123', name: '' }, 10)).sort(), ['documentNumber', 'name'])
  assert.deepEqual(receiverErrors('FACTURA', { documentNumber: '20600000005', name: 'Empresa SAC' }, 10), {})
  assert.deepEqual(receiverErrors('BOLETA', {}, 699.99), {})
  assert.ok(receiverErrors('BOLETA', {}, 700).documentNumber)
  assert.ok(receiverErrors('BOLETA', { documentType: 'DNI', documentNumber: '123' }, 10).documentNumber)
  assert.ok(receiverErrors('BOLETA', { email: 'no-es-correo' }, 10).email)
})

test('el ticket escapa los textos y marca los documentos de prueba', () => {
  const html = ticketHtml({
    type: 'BOLETA', fullNumber: 'B001-00000001', issuerName: 'BODEGA <SAC>', issuerRuc: '20600000005', test: true,
    customerName: 'Ana & Co', issueDate: '2026-09-26', items: [{ description: 'Pollo', quantity: 2, unitPrice: 30, total: 60 }],
    subtotal: 50.85, tax: 9.15, total: 60, taxAffectation: 'GRAVADO', amountInWords: 'SESENTA CON 00/100 SOLES',
  }, { width: 58 })
  assert.match(html, /BODEGA &lt;SAC&gt;/)
  assert.match(html, /Ana &amp; Co/)
  assert.match(html, /SIN VALOR TRIBUTARIO/)
  assert.match(html, /size: 58mm auto/)
  assert.match(html, /60\.00/)
})
