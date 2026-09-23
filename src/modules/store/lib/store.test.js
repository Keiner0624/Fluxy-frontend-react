import test from 'node:test'
import assert from 'node:assert/strict'
import { canUseWhatsapp, matchesSearch, money, productImages, sortProducts, whatsappNumber } from './storeFormat.js'
import { contrast, storeBanner, storeMode, storeThemeVars } from './storeTheme.js'

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

test('un acento casi blanco se reemplaza por tinta legible', () => {
  const vars = storeThemeVars(JSON.stringify({ primary: '#ffffff' }))
  assert.equal(vars['--sf-accent'], '#111827')
  assert.equal(vars['--sf-on-accent'], '#ffffff')
})

test('un acento claro se oscurece para usarlo como texto sobre blanco', () => {
  const vars = storeThemeVars(JSON.stringify({ primary: '#34d399' }))
  assert.equal(vars['--sf-accent'], '#34d399')
  assert.notEqual(vars['--sf-accent-ink'], '#34d399')
  assert.equal(vars['--sf-on-accent'], '#111827')
})

test('la apariencia por defecto es clara y solo acepta valores conocidos', () => {
  assert.equal(storeMode(undefined), 'light')
  assert.equal(storeMode('{"mode":"dark"}'), 'dark')
  assert.equal(storeMode('{"mode":"auto"}'), 'auto')
  assert.equal(storeMode('{"mode":"neon"}'), 'light')
})

test('en la tienda oscura un acento casi negro se reemplaza por uno claro', () => {
  const vars = storeThemeVars(JSON.stringify({ primary: '#111827' }), 'dark')
  assert.equal(vars['--sf-accent'], '#f4f4f5')
  assert.equal(vars['--sf-on-accent'], '#111827')
  // En la tienda clara el mismo color se mantiene.
  assert.equal(storeThemeVars(JSON.stringify({ primary: '#111827' }), 'light')['--sf-accent'], '#111827')
})

test('el texto de acento se lee en los dos fondos para toda la paleta de Estilo', () => {
  const palette = ['#d92d20', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#111827', '#ffffff', '#34d399']
  for (const primary of palette) {
    for (const [scheme, surface] of [['light', [255, 255, 255]], ['dark', [28, 28, 33]]]) {
      const vars = storeThemeVars(JSON.stringify({ primary }), scheme)
      assert.ok(contrast(rgb(vars['--sf-accent-ink']), surface) >= 4.5, `${primary} en ${scheme}: texto de acento`)
      assert.ok(contrast(rgb(vars['--sf-accent']), rgb(vars['--sf-on-accent'])) >= 3, `${primary} en ${scheme}: texto sobre el botón`)
    }
  }
})

test('un estilo inválido usa el acento por defecto', () => {
  assert.equal(storeThemeVars('no es json')['--sf-accent'], '#e0312b')
  assert.equal(storeBanner('{"bgImage":"http://inseguro.test/a.jpg"}'), '')
  assert.equal(storeBanner('{"bgImage":"https://cdn.test/a.jpg"}'), 'https://cdn.test/a.jpg')
})

test('WhatsApp agrega el código de Perú y respeta plan e integración', () => {
  assert.equal(whatsappNumber({ phone: '987 654 321' }), '51987654321')
  assert.equal(whatsappNumber({ phone: '+51 987654321' }), '51987654321')
  assert.equal(canUseWhatsapp({ phone: '987654321', plan: 'FREE' }), false)
  assert.equal(canUseWhatsapp({ phone: '987654321', plan: 'PRO', whatsappEnabled: false }), false)
  assert.equal(canUseWhatsapp({ phone: '987654321', plan: 'PRO' }), true)
})

test('la búsqueda ignora tildes, mayúsculas y orden de palabras', () => {
  const product = { name: 'Pollo a la brasa', description: 'Con papas', category: { name: 'Pollería' } }
  assert.ok(matchesSearch(product, 'POLLERIA'))
  assert.ok(matchesSearch(product, 'papas pollo'))
  assert.equal(matchesSearch(product, 'pizza'), false)
})

test('destacados muestra primero lo disponible y con foto', () => {
  const list = sortProducts([
    { id: 1, price: 5, stock: 0, imageUrl: 'a' },
    { id: 2, price: 9, stock: 3 },
    { id: 3, price: 7, stock: 2, imageUrl: 'b' },
  ], 'featured')
  assert.deepEqual(list.map((p) => p.id), [3, 2, 1])
  assert.deepEqual(sortProducts(list, 'priceAsc').map((p) => p.id), [1, 3, 2])
})

test('galería y precios', () => {
  assert.deepEqual(productImages({ imageUrl: 'a', images: '["b","a"]' }), ['b', 'a'])
  assert.deepEqual(productImages({ imageUrl: 'a', images: 'roto' }), ['a'])
  assert.equal(money(12.5), 'S/ 12.50')
})
