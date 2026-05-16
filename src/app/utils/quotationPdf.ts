import type { Quotation } from '../store';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 46;

export function createQuotationPdfBlob(quote: Quotation): Blob {
  const lines = buildPdfLines(quote);
  const contentLines: string[] = [
    '0.93 0.97 1 rg 0 0 595 842 re f',
    '0.05 0.28 0.63 rg 0 790 595 52 re f',
    '1 1 1 rg BT /F1 20 Tf 46 810 Td (SURTIMAX - COTIZACION) Tj ET',
    '0 0 0 rg',
  ];

  let y = 760;
  lines.forEach((line, index) => {
    if (line === '') {
      y -= 12;
      return;
    }
    const fontSize = index === 0 ? 15 : 10;
    contentLines.push(`BT /F1 ${fontSize} Tf ${MARGIN_X} ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= index === 0 ? 22 : 15;
  });

  contentLines.push(`BT /F1 9 Tf ${MARGIN_X} 34 Td (${escapePdfText('PDF generado desde SURTIMAX. Para WhatsApp Web, si el archivo no se adjunta automaticamente, adjuntelo desde Descargas.')}) Tj ET`);

  const content = contentLines.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function buildPdfLines(quote: Quotation): string[] {
  const clientEmail = quote.clientEmail ? ` | Email: ${quote.clientEmail}` : '';
  const itemLines = quote.items.flatMap((item, index) => wrapLine(
    `${index + 1}. ${item.code} | ${item.description} | Cant: ${item.quantity} | P.Unit: $${item.unitPrice.toFixed(2)} | Subtotal: $${(item.quantity * item.unitPrice).toFixed(2)}`,
    92,
  ));

  return [
    `Cotizacion: ${quote.number}`,
    `Fecha: ${new Date(quote.date).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    'DATOS DEL CLIENTE',
    `Nombre / Razon Social: ${quote.clientName}`,
    `Cedula / RUC: ${quote.clientCedula}`,
    `Telefono: ${quote.clientPhone}${clientEmail}`,
    `Direccion: ${quote.clientAddress}`,
    '',
    'PRODUCTOS',
    ...itemLines,
    '',
    `Subtotal sin IVA: $${quote.subtotal.toFixed(2)}`,
    `IVA 15%: $${quote.iva.toFixed(2)}`,
    `Descuento: $${quote.discount.toFixed(2)}`,
    `TOTAL COTIZADO: $${quote.finalTotal.toFixed(2)}`,
    '',
    'Validez y condiciones comerciales:',
    'Los precios reflejados estan sujetos a cambios sin previo aviso.',
    'Tiempo de entrega estimado segun disponibilidad de inventario.',
  ];
}

function wrapLine(text: string, maxLength: number): string[] {
  const clean = sanitizePdfText(text);
  if (clean.length <= maxLength) return [clean];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function escapePdfText(text: string): string {
  return sanitizePdfText(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function sanitizePdfText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
