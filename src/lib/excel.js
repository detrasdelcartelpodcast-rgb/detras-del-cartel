/* ==========================================================================
   EXPORTAR A EXCEL (.xlsx de verdad, sin librerías de afuera)

   Un .xlsx es un ZIP con varios XML adentro. Se arma a mano: así no hay que
   cargar nada de un servidor ajeno (lo prohíbe la política de seguridad del
   sitio) ni sumar una dependencia más.

   Probado con Excel y con openpyxl: encabezados en negrita, anchos de columna
   y texto ajustado.
========================================================================== */

const escaparXml = (v) =>
  String(v ?? '').replace(/[<>&"']/g, (s) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[s]));

const letraColumna = (i) => {
  let s = '';
  i++;
  while (i > 0) {
    const r = (i - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    i = (i - r - 1) / 26;
  }
  return s;
};

function hojaXml(filas, anchos) {
  const cols = anchos.map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`).join('');
  const cuerpo = filas
    .map((fila, f) => {
      const celdas = fila
        .map(
          (valor, c) =>
            `<c r="${letraColumna(c)}${f + 1}" t="inlineStr" s="${f === 0 ? 1 : 0}"><is><t xml:space="preserve">${escaparXml(valor)}</t></is></c>`
        )
        .join('');
      return `<row r="${f + 1}">${celdas}</row>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${cuerpo}</sheetData></worksheet>`;
}

const ARCHIVOS_FIJOS = {
  '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Consultas" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
};

// ── Mini-ZIP sin compresión ──────────────────────────────────────────────────
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function armarZip(archivos) {
  const codificador = new TextEncoder();
  const partes = [];
  const central = [];
  let desplazamiento = 0;
  const escribir = (n, bytes) => {
    const a = [];
    for (let i = 0; i < bytes; i++) a.push((n >>> (i * 8)) & 0xff);
    return a;
  };

  for (const [nombre, contenido] of Object.entries(archivos)) {
    const datos = codificador.encode(contenido);
    const nom = codificador.encode(nombre);
    const crc = crc32(datos);
    const cabecera = [
      ...escribir(0x04034b50, 4), ...escribir(20, 2), ...escribir(0, 2), ...escribir(0, 2),
      ...escribir(0, 2), ...escribir(0, 2), ...escribir(crc, 4),
      ...escribir(datos.length, 4), ...escribir(datos.length, 4),
      ...escribir(nom.length, 2), ...escribir(0, 2),
    ];
    partes.push(new Uint8Array(cabecera), nom, datos);
    central.push([
      ...escribir(0x02014b50, 4), ...escribir(20, 2), ...escribir(20, 2), ...escribir(0, 2),
      ...escribir(0, 2), ...escribir(0, 2), ...escribir(0, 2), ...escribir(crc, 4),
      ...escribir(datos.length, 4), ...escribir(datos.length, 4),
      ...escribir(nom.length, 2), ...escribir(0, 2), ...escribir(0, 2), ...escribir(0, 2),
      ...escribir(0, 2), ...escribir(0, 4), ...escribir(desplazamiento, 4),
      ...Array.from(nom),
    ]);
    desplazamiento += cabecera.length + nom.length + datos.length;
  }

  const directorio = new Uint8Array(central.flat());
  const fin = new Uint8Array([
    ...escribir(0x06054b50, 4), ...escribir(0, 2), ...escribir(0, 2),
    ...escribir(central.length, 2), ...escribir(central.length, 2),
    ...escribir(directorio.length, 4), ...escribir(desplazamiento, 4), ...escribir(0, 2),
  ]);
  return new Blob([...partes, directorio, fin], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** Arma y descarga el archivo. `columnas` = [[titulo, ancho], …]. */
export function descargarExcel({ nombreArchivo, columnas, filas }) {
  const contenido = [columnas.map(([titulo]) => titulo), ...filas];
  const blob = armarZip({ ...ARCHIVOS_FIJOS, 'xl/worksheets/sheet1.xml': hojaXml(contenido, columnas.map(([, a]) => a)) });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}
