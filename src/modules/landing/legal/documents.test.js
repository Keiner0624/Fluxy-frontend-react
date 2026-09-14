import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { CURRENT_LEGAL_VERSION, PUBLISHED_LEGAL_DOCUMENTS, getLegalDocument, legalUrl } from './documents.js'

test('published documents retain the original version and complete sections', () => {
  const current = getLegalDocument()
  assert.equal(CURRENT_LEGAL_VERSION, '2026-05-05')
  assert.equal(current.sections.terms.length, 10)
  assert.equal(current.sections.privacy.length, 8)
  for (const sections of Object.values(current.sections)) {
    assert.equal(new Set(sections.map(section => section.id)).size, sections.length)
    for (const section of sections) assert.ok(section.title && section.content)
  }
})

test('unpublished and inherited keys cannot be resolved as accepted versions', () => {
  for (const version of ['2026-09-13-draft', 'unknown', '__proto__', 'constructor']) assert.equal(getLegalDocument(version), null)
  assert.equal(Object.keys(PUBLISHED_LEGAL_DOCUMENTS).length, 1)
})

test('registration links pin both documents to the published version', () => {
  for (const doc of ['terms', 'privacy']) {
    const url = new URL(legalUrl(doc), 'http://localhost')
    assert.equal(url.searchParams.get('doc'), doc)
    assert.equal(url.searchParams.get('version'), CURRENT_LEGAL_VERSION)
  }
})

test('the supplied draft is complete, identified as a draft and blocked from publication', async () => {
  const draft = JSON.parse(await readFile(new URL('../../../../docs/legal/2026-09-13.draft.json', import.meta.url), 'utf8'))
  assert.equal(draft.status, 'DRAFT')
  assert.equal(draft.sections.terms.length, 23)
  assert.equal(draft.sections.privacy.length, 16)
  assert.ok(draft.publicationBlockedBy.length)
  assert.equal(getLegalDocument(draft.version), null)
})
