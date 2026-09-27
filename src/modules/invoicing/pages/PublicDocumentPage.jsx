// src/modules/invoicing/pages/PublicDocumentPage.jsx
// Consulta pública de un comprobante (enlace del correo o QR). Muestra lo mínimo.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicDocument, publicPdfUrl } from '../api/invoicingApi'
import { DOC_STATUS } from '../lib/invoicingFormat'

const box = { maxWidth: 560, margin: '40px auto', padding: 24, background: '#fff', border: '1px solid #e5eaf1', borderRadius: 16,
  fontFamily: 'DM Sans, system-ui, sans-serif', color: '#0b172a' }

export default function PublicDocumentPage() {
  const { token } = useParams()
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getPublicDocument(token).then((d) => alive && setDoc(d)).catch((e) => alive && setError(e.message))
    return () => { alive = false }
  }, [token])

  useEffect(() => {
    if (doc) document.title = `${doc.typeLabel} ${doc.fullNumber} · ${doc.issuerName}`
  }, [doc])

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', padding: '1px 16px' }}>
      <main style={box}>
        {error && <p role="alert">{error}</p>}
        {!doc && !error && <p>Cargando comprobante…</p>}
        {doc && (
          <>
            <p style={{ margin: 0, color: '#526078', fontSize: 13 }}>{doc.issuerName} · RUC {doc.issuerRuc}</p>
            <h1 style={{ fontSize: 22, margin: '6px 0 2px' }}>{doc.typeLabel}</h1>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{doc.fullNumber}</p>
            {doc.test && <p style={{ marginTop: 10, padding: '8px 10px', background: '#fff7e6', borderRadius: 8, fontSize: 13 }}>Documento de prueba: no tiene valor tributario.</p>}
            <p style={{ color: '#526078', fontSize: 14 }}>
              {DOC_STATUS[doc.status]?.label || doc.status} · Emitido el {doc.issueDate}<br />
              Cliente: {doc.customerName}{doc.customerDocument ? ` · ${doc.customerDocument}` : ''}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <tbody>
                {doc.items.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #eef1f6' }}>
                    <td style={{ padding: '8px 0' }}>{Number(item.quantity)} × {item.description}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>S/ {Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #eef1f6' }}><td style={{ paddingTop: 8, color: '#526078' }}>IGV</td><td style={{ textAlign: 'right', paddingTop: 8 }}>S/ {Number(doc.tax).toFixed(2)}</td></tr>
                <tr><td style={{ fontWeight: 700 }}>Total</td><td style={{ textAlign: 'right', fontWeight: 700 }}>S/ {Number(doc.total).toFixed(2)}</td></tr>
              </tbody>
            </table>
            {doc.pdfAvailable && (
              <a href={publicPdfUrl(token)} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 18, background: '#1769e0', color: '#fff', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
                Descargar PDF
              </a>
            )}
            <p style={{ marginTop: 18, fontSize: 12, color: '#7d8ba1' }}>Emitido por {doc.issuerName} a través de Fluxy.</p>
          </>
        )}
      </main>
    </div>
  )
}
