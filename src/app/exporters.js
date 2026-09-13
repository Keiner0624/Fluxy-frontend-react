// src/app/exporters.js
// Exportación de reportes a CSV, Excel (.xlsx) y PDF sin dependencias.
//
// Recibe el formato que devuelve /reports/export:
//   { title, from, to, columns: [{ key, label, type }], rows: [{...}] }
// type es text, number, money o date.

const encoder = new TextEncoder()

function cellValue(row, column) {
  const value = row[column.key]
  if (value === null || value === undefined) return ''
  if (column.type === 'date') {
    return new Date(value).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  return value
}

function fileName(report, extension) {
  const slug = report.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${slug}_${report.from}_${report.to}.${extension}`
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function exportCsv(report) {
  const escape = (value) => {
    const text = String(value)
    // Punto y coma: es el separador que Excel espera con configuración regional en español.
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [
    report.columns.map((c) => escape(c.label)).join(';'),
    ...report.rows.map((row) => report.columns.map((c) => {
      const value = cellValue(row, c)
      return escape(typeof value === 'number' ? String(value).replace('.', ',') : value)
    }).join(';')),
  ]
  // BOM para que Excel reconozca UTF-8 y muestre bien las tildes.
  downloadBlob(new Blob([String.fromCharCode(0xfeff) + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), fileName(report, 'csv'))
}

// ─── Excel (.xlsx) ───────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** ZIP sin compresión: suficiente para un .xlsx y sin librerías. */
function zip(files) {
  const chunks = []
  const central = []
  let offset = 0
  for (const { name, content } of files) {
    const nameBytes = encoder.encode(name)
    const data = encoder.encode(content)
    const crc = crc32(data)

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // nombres en UTF-8
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, nameBytes.length, true)
    chunks.push(new Uint8Array(local.buffer), nameBytes, data)

    const entry = new DataView(new ArrayBuffer(46))
    entry.setUint32(0, 0x02014b50, true)
    entry.setUint16(4, 20, true)
    entry.setUint16(6, 20, true)
    entry.setUint16(8, 0x0800, true)
    entry.setUint32(16, crc, true)
    entry.setUint32(20, data.length, true)
    entry.setUint32(24, data.length, true)
    entry.setUint16(28, nameBytes.length, true)
    entry.setUint32(42, offset, true)
    central.push(new Uint8Array(entry.buffer), nameBytes)

    offset += 30 + nameBytes.length + data.length
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function xml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function columnName(index) {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  return name
}

export function exportXlsx(report) {
  const header = `<row r="1">${report.columns.map((c, i) =>
    `<c r="${columnName(i)}1" t="inlineStr" s="1"><is><t>${xml(c.label)}</t></is></c>`).join('')}</row>`
  const body = report.rows.map((row, r) => {
    const rowNumber = r + 2
    const cells = report.columns.map((c, i) => {
      const ref = `${columnName(i)}${rowNumber}`
      const value = cellValue(row, c)
      if ((c.type === 'number' || c.type === 'money') && value !== '' && Number.isFinite(Number(value))) {
        return `<c r="${ref}"${c.type === 'money' ? ' s="2"' : ''}><v>${Number(value)}</v></c>`
      }
      return `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`
    }).join('')
    return `<row r="${rowNumber}">${cells}</row>`
  }).join('')
  const widths = report.columns.map((c, i) =>
    `<col min="${i + 1}" max="${i + 1}" width="${c.type === 'text' ? 28 : 16}" customWidth="1"/>`).join('')

  downloadBlob(zip([
    { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Reporte" sheetId="1" r:id="rId1"/></sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
    { name: 'xl/styles.xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;S/&quot; #,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>' },
    { name: 'xl/worksheets/sheet1.xml', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths}</cols><sheetData>${header}${body}</sheetData></worksheet>` },
  ]), fileName(report, 'xlsx'))
}

// ─── PDF (impresión del navegador) ───────────────────────────────────────────

export function exportPdf(report, companyName = '') {
  const format = (row, c) => {
    const value = cellValue(row, c)
    if (c.type === 'money' && value !== '') return `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return xml(value)
  }
  const numeric = (c) => c.type === 'number' || c.type === 'money'
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${xml(report.title)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#0b172a;padding:36px 40px;font-size:12px}
  header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #d4dce8;padding-bottom:14px;margin-bottom:18px}
  h1{font-size:19px;font-weight:700;letter-spacing:-.3px}
  .muted{color:#7d8ba1}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#7d8ba1;border-bottom:1px solid #d4dce8;padding:8px 10px}
  td{padding:8px 10px;border-bottom:1px solid #eef2f7}
  .num{text-align:right;font-variant-numeric:tabular-nums}
  footer{margin-top:18px;color:#7d8ba1;font-size:10.5px}
  @media print{body{padding:0}}
</style></head><body>
<header><div><h1>${xml(report.title)}</h1><div class="muted">${xml(companyName)}</div></div>
<div class="muted">Del ${xml(report.from)} al ${xml(report.to)}</div></header>
<table><thead><tr>${report.columns.map((c) => `<th class="${numeric(c) ? 'num' : ''}">${xml(c.label)}</th>`).join('')}</tr></thead>
<tbody>${report.rows.length ? report.rows.map((row) => `<tr>${report.columns.map((c) =>
    `<td class="${numeric(c) ? 'num' : ''}">${format(row, c)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${report.columns.length}" class="muted">Sin datos en el período.</td></tr>`}</tbody></table>
<footer>Generado con Fluxy el ${new Date().toLocaleString('es-PE')}</footer>
<script>window.onload=()=>{window.print()}</script></body></html>`
  const win = window.open('', '_blank')
  if (!win) throw new Error('El navegador bloqueó la ventana de impresión. Permití ventanas emergentes para este sitio.')
  win.document.write(html)
  win.document.close()
}
