// src/app/cloudinary.js
// Única fuente de configuración de Cloudinary. Antes cada página tenía su
// propia copia y se desincronizaron: ProductsPage leía las variables de
// entorno mientras Settings y Style usaban valores fijos distintos.

export const CLOUDINARY_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD  || 'dklhbrw7s'
export const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'fluxy_unsigned'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * Sube una imagen con un preset sin firmar y devuelve su URL segura.
 * Traduce los errores de Cloudinary a mensajes accionables: el más común
 * es un preset o un cloud mal configurados.
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de imágenes. Revisá tu conexión.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail = data?.error?.message || ''
    if (/preset/i.test(detail)) {
      throw new Error(
        `El servicio de imágenes está mal configurado (${detail}). ` +
        `Revisá VITE_CLOUDINARY_CLOUD y VITE_CLOUDINARY_PRESET.`,
      )
    }
    throw new Error(detail || 'No se pudo subir la imagen.')
  }

  if (!data.secure_url) throw new Error('El servicio de imágenes no devolvió una URL.')
  return data.secure_url
}

/** Valida tipo y tamaño antes de subir. Devuelve un mensaje de error o null. */
export function validateImage(file) {
  if (!file.type.startsWith('image/')) return 'El archivo no es una imagen válida.'
  if (file.size > MAX_IMAGE_SIZE) return 'La imagen supera los 5 MB.'
  return null
}
