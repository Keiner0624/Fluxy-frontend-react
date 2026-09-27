import test from 'node:test'
import assert from 'node:assert/strict'
import { customStoreHost } from './storeHost.js'

const hosts = new Set(['fluxyweb.vercel.app', 'fluxyweb.com', 'www.fluxyweb.com'])
const detect = (host, dev = false) => customStoreHost(host, { hosts, dev })

test('en las direcciones de Fluxy se muestra la app completa', () => {
  assert.equal(detect('fluxyweb.vercel.app'), null)
  assert.equal(detect('www.fluxyweb.com'), null)
  assert.equal(detect('fluxyweb-git-main-equipo.vercel.app'), null)
  assert.equal(detect('localhost'), null)
  assert.equal(detect('127.0.0.1'), null)
})

test('en un dominio propio se muestra solo esa tienda', () => {
  assert.equal(detect('mitienda.com'), 'mitienda.com')
  assert.equal(detect('WWW.MiTienda.com.'), 'www.mitienda.com')
  assert.equal(detect('tienda.marca.pe'), 'tienda.marca.pe')
})

test('en desarrollo, dominio.localhost simula el dominio propio', () => {
  assert.equal(detect('mitienda.com.localhost', true), 'mitienda.com')
  assert.equal(detect('mitienda.com.localhost', false), null)
})
