import test from 'node:test'
import assert from 'node:assert/strict'
import { CURRENT_LEGAL_VERSION, PUBLISHED_LEGAL_DOCUMENTS, getLegalDocument, legalUrl } from './documents.js'

test('the current version is 2026-09-13 and earlier versions stay published', () => {
  assert.equal(CURRENT_LEGAL_VERSION, '2026-09-13')
  assert.deepEqual(Object.keys(PUBLISHED_LEGAL_DOCUMENTS).sort(), ['2026-05-05', '2026-09-13'])
  assert.equal(getLegalDocument('2026-05-05').sections.terms.length, 10)
  assert.equal(getLegalDocument('2026-05-05').sections.privacy.length, 8)
})

test('every published version has complete sections with unique ids', () => {
  const current = getLegalDocument()
  assert.equal(current.sections.terms.length, 23)
  assert.equal(current.sections.privacy.length, 16)
  for (const document of Object.values(PUBLISHED_LEGAL_DOCUMENTS)) {
    assert.equal(document.status, 'PUBLISHED')
    for (const sections of Object.values(document.sections)) {
      assert.equal(new Set(sections.map(section => section.id)).size, sections.length)
      for (const section of sections) assert.ok(section.title && section.content)
    }
  }
})

test('the published text has no editorial placeholders or drafting notes', () => {
  const text = JSON.stringify(getLegalDocument().sections)
  for (const pattern of [/\[[A-ZÁÉÍÓÚ ./]{4,}\]/, /deben completarse/i, /antes de publicaci[oó]n/i, /Esta afirmación debe/i, /Antes del lanzamiento/i, /undefined|null/]) {
    assert.doesNotMatch(text, pattern)
  }
})

test('unknown and inherited keys cannot be resolved as accepted versions', () => {
  for (const version of ['2026-09-13-draft', 'unknown', '__proto__', 'constructor']) assert.equal(getLegalDocument(version), null)
})

test('registration links pin both documents to the current version', () => {
  for (const doc of ['terms', 'privacy']) {
    const url = new URL(legalUrl(doc), 'http://localhost')
    assert.equal(url.searchParams.get('doc'), doc)
    assert.equal(url.searchParams.get('version'), CURRENT_LEGAL_VERSION)
  }
})
