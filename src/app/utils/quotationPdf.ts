import type { Quotation } from '../store';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 24;
const TEXT_MARGIN_X = 46;

export async function createQuotationPdfBlobFromElement(element: HTMLElement): Promise<Blob> {
  const canvas = await renderElementToCanvas(element);
  const jpegData = canvas.toDataURL('image/jpeg', 0.92);
  return createImagePdfBlob(jpegData, canvas.width, canvas.height);
}

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
    contentLines.push(`BT /F1 ${fontSize} Tf ${TEXT_MARGIN_X} ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= index === 0 ? 22 : 15;
  });

  contentLines.push(`BT /F1 9 Tf ${TEXT_MARGIN_X} 34 Td (${escapePdfText('PDF generado desde SURTIMAX. Para WhatsApp Web, si el archivo no se adjunta automaticamente, adjuntelo desde Descargas.')}) Tj ET`);

  return createTextPdfBlob(contentLines.join('\n'));
}

async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const { width, height } = element.getBoundingClientRect();
  const renderWidth = Math.ceil(Math.max(width, element.scrollWidth));
  const renderHeight = Math.ceil(Math.max(height, element.scrollHeight));
  const clonedElement = element.cloneNode(true) as HTMLElement;

  clonedElement.querySelectorAll('.no-print').forEach(node => node.remove());
  clonedElement.style.width = `${renderWidth}px`;
  clonedElement.style.maxWidth = `${renderWidth}px`;
  clonedElement.style.boxSizing = 'border-box';
  clonedElement.style.boxShadow = 'none';
  clonedElement.style.margin = '0';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.style.width = `${renderWidth}px`;
  wrapper.style.minHeight = `${renderHeight}px`;
  wrapper.style.background = 'white';
  wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';
  wrapper.appendChild(clonedElement);

  const serialized = new XMLSerializer().serializeToString(wrapper);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${renderWidth}" height="${renderHeight}" viewBox="0 0 ${renderWidth} ${renderHeight}">
      <foreignObject width="100%" height="100%">${serialized}</foreignObject>
    </svg>
  `;

  const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const image = await loadImage(svgUrl);
  URL.revokeObjectURL(svgUrl);

  const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(renderWidth * scale);
  canvas.height = Math.ceil(renderHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar el canvas del PDF.');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo renderizar el documento de prefactura.'));
    image.src = src;
  });
}

function createImagePdfBlob(jpegDataUrl: string, imageWidth: number, imageHeight: number): Blob {
  const jpegBinary = atob(jpegDataUrl.split(',')[1] ?? '');
  const sourceDisplayWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const sourceDisplayHeight = (imageHeight / imageWidth) * sourceDisplayWidth;
  const sourceUsableHeight = PAGE_HEIGHT - PAGE_MARGIN * 2;
  const sourcePageCount = Math.max(1, Math.ceil(sourceDisplayHeight / sourceUsableHeight));

  const LANDSCAPE_WIDTH = PAGE_HEIGHT;
  const LANDSCAPE_HEIGHT = PAGE_WIDTH;
  const horizontalGap = 14;
  const slotWidth = (LANDSCAPE_WIDTH - PAGE_MARGIN * 2 - horizontalGap) / 2;
  const slotHeight = LANDSCAPE_HEIGHT - PAGE_MARGIN * 2;
  const slotScale = slotWidth / sourceDisplayWidth;
  const scaledSliceHeight = sourceDisplayHeight * slotScale;
  const outputPageCount = Math.ceil(sourcePageCount / 2);

  const pageObjectStart = 4;
  const contentObjectStart = pageObjectStart + outputPageCount;
  const imageObjectNumber = contentObjectStart + outputPageCount;
  const kids = Array.from({ length: outputPageCount }, (_, index) => `${pageObjectStart + index} 0 R`).join(' ');

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${outputPageCount} >>`,
  ];

  for (let index = 0; index < outputPageCount; index += 1) {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LANDSCAPE_WIDTH} ${LANDSCAPE_HEIGHT}] /Resources << /XObject << /Im1 ${imageObjectNumber} 0 R >> >> /Contents ${contentObjectStart + index} 0 R >>`);
  }

  for (let index = 0; index < outputPageCount; index += 1) {
    let content = '';
    const leftSliceIndex = index * 2;
    const rightSliceIndex = leftSliceIndex + 1;
    const leftX = PAGE_MARGIN;
    const rightX = PAGE_MARGIN + slotWidth + horizontalGap;
    const y = PAGE_MARGIN;

    if (leftSliceIndex < sourcePageCount) {
      const leftY = PAGE_HEIGHT - PAGE_MARGIN - sourceDisplayHeight + leftSliceIndex * sourceUsableHeight;
      content += `q\n${slotScale.toFixed(6)} 0 0 ${slotScale.toFixed(6)} ${leftX.toFixed(2)} ${(y - leftY * slotScale).toFixed(2)} cm\n/Im1 Do\nQ\n`;
    }

    if (rightSliceIndex < sourcePageCount) {
      const rightY = PAGE_HEIGHT - PAGE_MARGIN - sourceDisplayHeight + rightSliceIndex * sourceUsableHeight;
      content += `q\n${slotScale.toFixed(6)} 0 0 ${slotScale.toFixed(6)} ${rightX.toFixed(2)} ${(y - rightY * slotScale).toFixed(2)} cm\n/Im1 Do\nQ`;
    }

    if (scaledSliceHeight < slotHeight) {
      const topRuleY = LANDSCAPE_HEIGHT - PAGE_MARGIN;
      const bottomRuleY = PAGE_MARGIN;
      content += `\n0.89 0.95 0.99 RG 0.6 w ${PAGE_MARGIN} ${topRuleY.toFixed(2)} m ${LANDSCAPE_WIDTH - PAGE_MARGIN} ${topRuleY.toFixed(2)} l S`;
      content += `\n0.89 0.95 0.99 RG 0.6 w ${PAGE_MARGIN} ${bottomRuleY.toFixed(2)} m ${LANDSCAPE_WIDTH - PAGE_MARGIN} ${bottomRuleY.toFixed(2)} l S`;
    }

    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }

  objects.push(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBinary.length} >>\nstream\n${jpegBinary}\nendstream`);

  return buildPdf(objects);
}

function createTextPdfBlob(content: string): Blob {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  return buildPdf(objects);
}

function buildPdf(objects: string[]): Blob {
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

  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index) & 0xff;
  }

  return new Blob([bytes], { type: 'application/pdf' });
}

function buildPdfLines(quote: Quotation): string[] {
  const clientEmail = quote.clientEmail ? ` | Email: ${quote.clientEmail}` : '';
  const itemLines = quote.items.flatMap((item, index) => wrapLine(
    `${index + 1}. ${item.code} | ${item.description} | Cant: ${item.quantity} | P.Unit: $${item.unitPrice.toFixed(2)} | Subtotal: $${(item.quantity * item.unitPrice).toFixed(2)}`,
    92,
  ));

  return [
    `Prefactura: ${quote.number}`,
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
    `TOTAL PREFACTURA: $${quote.finalTotal.toFixed(2)}`,
    '',
    'Validez y condiciones comerciales:',
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
