import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  campaignActions, composeMessage, limitLabel, percent, personalMessage, rebaseLink, suggestContent, whatsappDigits, whatsappShare,
} from './marketingFormat.js'
import { qrMatrix } from './qr.js'

test('el texto sugerido usa el producto, el precio y el cupón', () => {
  const content = suggestContent({
    type: 'PRODUCT', objective: 'SELL_PRODUCT', target: { name: 'Cappuccino', price: 9.5 },
    coupon: { code: 'CAFE20', discountType: 'PERCENTAGE', discountValue: 20 }, storeName: 'Café Luna',
  })
  assert.equal(content.title, 'Cappuccino en Café Luna')
  assert.match(content.message, /S\/ 9\.50/)
  assert.match(content.message, /CAFE20 tenés 20% de descuento/)
})

test('recuperar clientes tiene su propio mensaje, venga de donde venga', () => {
  const content = suggestContent({ type: 'STORE', objective: 'WIN_BACK', storeName: 'Café Luna' })
  assert.equal(content.title, '¡Te extrañamos!')
  assert.equal(content.callToAction, 'Volvé a pedir')
})

test('el mensaje termina con la llamada a la acción y el enlace', () => {
  const text = composeMessage({ title: 'Promo', message: 'Solo hoy', callToAction: 'Pedí' }, 'https://x.test/store/a?cmp=1')
  assert.equal(text, 'Promo\nSolo hoy\nPedí: https://x.test/store/a?cmp=1')
  assert.equal(composeMessage({}, 'https://x.test'), 'Pedí acá: https://x.test')
})

test('el enlace conserva los parámetros del backend sobre el dominio de la tienda', () => {
  const link = { url: 'http://api.test/store/cafe?cmp=abc', query: '?cmp=abc&utm_source=qr' }
  assert.equal(rebaseLink(link, 'https://tienda.test/store/cafe'), 'https://tienda.test/store/cafe?cmp=abc&utm_source=qr')
  assert.equal(rebaseLink(link, ''), 'http://api.test/store/cafe?cmp=abc')
  assert.equal(rebaseLink(null, 'https://x'), '')
})

test('WhatsApp: celular peruano con 51, texto codificado y saludo por nombre', () => {
  assert.equal(whatsappDigits('987 654 321'), '51987654321')
  assert.equal(whatsappDigits('+54 9 11 5555 0000'), '5491155550000')
  assert.equal(whatsappShare('Hola & chau', '987654321'), 'https://wa.me/51987654321?text=Hola%20%26%20chau')
  assert.equal(personalMessage('Ana María', 'Volvé'), 'Hola Ana! Volvé')
  assert.equal(personalMessage('', 'Volvé'), 'Volvé')
})

test('formatos de porcentaje y límite del plan', () => {
  assert.equal(percent(0.125), '13%')
  assert.equal(percent(0.034), '3.4%')
  assert.equal(percent(0), '0%')
  assert.equal(limitLabel(1, 2), '1 de 2 en curso')
  assert.equal(limitLabel(4, -1), '4 en curso · sin límite')
})

test('las acciones combinan el estado de la campaña con los permisos', () => {
  const campaign = { actions: ['EDIT', 'ACTIVATE', 'DELETE'] }
  const seller = campaignActions(campaign, () => false)
  assert.deepEqual(Object.values(seller).filter(Boolean), [])
  const owner = campaignActions(campaign, () => true)
  assert.equal(owner.activate, true)
  assert.equal(owner.pause, false)
  assert.equal(owner.remove, true)
})

test('el QR tiene los patrones de posición en tres esquinas', () => {
  const m = qrMatrix('https://fluxy.test/store/cafe?cmp=q7Rk2mX9aP4d&utm_source=qr&utm_medium=offline')
  const n = m.length
  assert.ok(n >= 21 && (n - 17) % 4 === 0)
  for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    assert.equal(m[r][c], true)
    assert.equal(m[r + 1][c + 1], false)
    assert.equal(m[r + 3][c + 3], true)
  }
})
