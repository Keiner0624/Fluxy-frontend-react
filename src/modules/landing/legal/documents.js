import current from './2026-05-05.js'

export const CURRENT_LEGAL_VERSION = current.version
export const PUBLISHED_LEGAL_DOCUMENTS = Object.freeze({ [current.version]: current })
export const getLegalDocument = (version = CURRENT_LEGAL_VERSION) => Object.hasOwn(PUBLISHED_LEGAL_DOCUMENTS, version) ? PUBLISHED_LEGAL_DOCUMENTS[version] : null
export const legalUrl = (doc = 'terms', version = CURRENT_LEGAL_VERSION) => '/terms?' + new URLSearchParams({ doc, version }).toString()
