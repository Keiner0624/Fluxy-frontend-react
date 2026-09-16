import v20260505 from './2026-05-05.js'
import v20260913 from './2026-09-13.js'

// Todas las versiones publicadas quedan disponibles; la vigente es la última.
const current = v20260913

export const CURRENT_LEGAL_VERSION = current.version
export const CURRENT_PROVIDER = current.provider
export const PUBLISHED_LEGAL_DOCUMENTS = Object.freeze({
  [v20260913.version]: v20260913,
  [v20260505.version]: v20260505,
})
export const getLegalDocument = (version = CURRENT_LEGAL_VERSION) => Object.hasOwn(PUBLISHED_LEGAL_DOCUMENTS, version) ? PUBLISHED_LEGAL_DOCUMENTS[version] : null
export const legalUrl = (doc = 'terms', version = CURRENT_LEGAL_VERSION) => '/terms?' + new URLSearchParams({ doc, version }).toString()
