import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, MessageCircle, Edit2, Save, X } from 'lucide-react';
import { useStore } from '../store';
import type { QuotationClientData } from '../store';
import logoImg from '../../imports/DAME_CON_EL_FONDO_DE_202605160147.jpeg';

export function QuotationDetail() {
  const { quotations, selectedQuotationId, setView, updateQuotation, currentUser } = useStore();
  const quote = quotations.find(q => q.id === selectedQuotationId);
  const [discount, setDiscount] = useState(0);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [tempDiscount, setTempDiscount] = useState('0');
  const [editingClient, setEditingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState<QuotationClientData>({ clientName: '', clientCedula: '', clientAddress: '', clientPhone: '', clientEmail: '' });
  const [clientEditError, setClientEditError] = useState('');

  useEffect(() => {
    if (quote) {
      setDiscount(quote.discount);
      setTempDiscount(String(quote.discount));
      setClientDraft({
        clientName: quote.clientName,
        clientCedula: quote.clientCedula,
        clientAddress: quote.clientAddress,
        clientPhone: quote.clientPhone,
        clientEmail: quote.clientEmail ?? '',
      });
    }
  }, [quote]);

  if (!quote) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#78909C' }}>Prefactura no encontrada</p>
        <button onClick={() => setView('catalog')} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer' }}>Volver al catálogo</button>
      </div>
    );
  }

  const totalCotizado = quote.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal = totalCotizado / 1.15;
  const iva = totalCotizado - subtotal;
  const finalTotal = totalCotizado - discount;
  const emissionDate = quote.date && !Number.isNaN(new Date(quote.date).getTime()) ? quote.date : new Date().toISOString().slice(0, 10);
  const generatedPrefacturaNumber = quote.number?.trim() ? quote.number : `COT-${new Date(emissionDate).toISOString().slice(0, 10).replace(/-/g, '')}-${String(quote.id).slice(-4).padStart(4, '0')}`;
  const generatedClientCode = quote.clientCedula?.trim()
    ? `C${quote.clientCedula.replace(/[^0-9A-Za-z]/g, '').slice(0, 8).padEnd(8, '0')}-${String(quote.id).slice(-3).padStart(3, '0')}`
    : `C${String(quote.id).slice(-8).padStart(8, '0')}-${String(quote.id).slice(-3).padStart(3, '0')}`;

  const handleSaveDiscount = () => {
    const d = Math.max(0, parseFloat(tempDiscount) || 0);
    setDiscount(d);
    updateQuotation(quote.id, { discount: d, finalTotal: totalCotizado - d });
    setEditingDiscount(false);
  };

  const handleClientDraftChange = (field: keyof QuotationClientData, value: string) => {
    setClientDraft(prev => ({ ...prev, [field]: value }));
    if (clientEditError) setClientEditError('');
  };

  const handleSaveClient = () => {
    const requiredFields: Array<keyof QuotationClientData> = ['clientName', 'clientCedula', 'clientAddress', 'clientPhone', 'clientEmail'];
    if (requiredFields.some(field => !String(clientDraft[field] ?? '').trim())) {
      setClientEditError('Completa todos los datos del cliente antes de guardar.');
      return;
    }
    updateQuotation(quote.id, {
      clientName: clientDraft.clientName.trim(),
      clientCedula: clientDraft.clientCedula.trim(),
      clientAddress: clientDraft.clientAddress.trim(),
      clientPhone: clientDraft.clientPhone.trim(),
      clientEmail: clientDraft.clientEmail?.trim(),
    });
    setEditingClient(false);
  };

  const clientWANum = normalizeWhatsAppNumber(quote.clientPhone);
  const clientWAMsg = encodeURIComponent(
    `Hola ${quote.clientName}, su prefactura *${quote.number}* por un total de *${finalTotal.toFixed(2).replace('.', ',')}* está lista.\n\nProductos:\n` +
    quote.items.map(i => `• ${i.description} x${i.quantity} = $${(i.quantity * i.unitPrice).toFixed(2)}`).join('\n') +
    `\n\n_SURTIMAX - variedad y buen precio_`
  );
  const adminWAMsg = encodeURIComponent(`Hola SURTIMAX, quiero información sobre mi prefactura ${quote.number}`);
  const clientWAUrl = `https://wa.me/${clientWANum}?text=${clientWAMsg}`;

  const handlePrintPreview = () => {
    window.print();
  };

  const backView = currentUser?.isAdmin ? 'admin-quotes' : 'my-quotes';

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px' }}>

      {/* Action bar */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setView(backView)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: '2px solid #E0E0E0', background: 'white', cursor: 'pointer', color: '#000', fontSize: 14 }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <button onClick={handlePrintPreview} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Printer size={16} /> Visualizar / Imprimir
        </button>
        {currentUser?.isAdmin ? (
          <a
            href={clientWAUrl}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
          >
            <MessageCircle size={16} /> Enviar por WhatsApp
          </a>
        ) : (
          <a
            href={`https://wa.me/593958737004?text=${adminWAMsg}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
          >
            <MessageCircle size={16} /> WhatsApp SURTIMAX
          </a>
        )}
        {currentUser?.isAdmin && (
          <button
            onClick={() => updateQuotation(quote.id, { status: quote.status === 'pending' ? 'delivered' : 'pending' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: quote.status === 'pending' ? '#388E3C' : '#FF7043', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            {quote.status === 'pending' ? '✓ Marcar Entregado' : '↩ Marcar Pendiente'}
          </button>
        )}
      </div>

      {/* Document */}
      <div className="quotation-print-root format-a5-print invoice-page">
      <div id="quotation-document" style={{ backgroundColor: 'white', borderRadius: 0, overflow: 'hidden', boxShadow: 'none', border: '1px solid #000', maxWidth: 980, margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif', padding: 16 }}>

        <div className="print-keep invoice-section" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, alignItems: 'start' }}>
          <div>
            <img src={logoImg} alt="SURTIMAX" style={{ height: 170, width: '100%', maxWidth: 340, objectFit: 'contain', objectPosition: 'left center', marginBottom: 2 }} />
            <div style={{ marginTop: 8, marginLeft: 8, fontSize: 18, fontWeight: 700 }}><strong>No. Prefactura:</strong> {generatedPrefacturaNumber}</div>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 20, letterSpacing: 0.2, fontWeight: 800 }}>DISTRIBUIDORA & COMERCIALIZADORA</h1>
            <div style={{ fontSize: 14, lineHeight: 1.35, marginTop: 8 }}>
              <div><span style={{ color: '#C62828', marginRight: 8 }}>👤</span>RUC: 210020260001</div>
              <div><span style={{ color: '#C62828', marginRight: 8 }}>📍</span>Dirección: QUITO</div>
              <div><span style={{ color: '#C62828', marginRight: 8 }}>📞</span>Teléfono: 0980320848</div>
              <div><span style={{ color: '#C62828', marginRight: 8 }}>✉</span>Email: GQ_SurtiMax@outlook.com</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 24, alignItems: 'start' }}>
              <div />
              <div style={{ fontSize: 12, lineHeight: 1.45 }}>
                <div style={{ fontWeight: 700 }}>REGIMEN GENERAL:</div>
                <div>Código Cliente:&nbsp; {generatedClientCode}</div>
                <div>Fecha Emisión:&nbsp; {new Date(emissionDate).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="print-keep invoice-section" style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', marginTop: 12, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: 14, letterSpacing: 1 }}>INFORMACIÓN DEL CLIENTE:</strong>
            {editingClient ? (
              <div className="no-print" style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveClient} style={miniSaveBtn}><Save size={13} /> Guardar</button>
                <button onClick={() => { setEditingClient(false); setClientEditError(''); }} style={miniCancelBtn}><X size={13} /> Cancelar</button>
              </div>
            ) : (
              <button className="no-print" onClick={() => setEditingClient(true)} style={miniEditBtn}><Edit2 size={13} /> Editar datos del cliente</button>
            )}
          </div>

          {editingClient ? (
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ClientEditField label="Nombre / Razón Social" value={clientDraft.clientName} onChange={v => handleClientDraftChange('clientName', v)} />
              <ClientEditField label="Teléfono" value={clientDraft.clientPhone} onChange={v => handleClientDraftChange('clientPhone', v)} />
              <ClientEditField label="RUC / C.I." value={clientDraft.clientCedula} onChange={v => handleClientDraftChange('clientCedula', v)} />
              <ClientEditField label="Dirección" value={clientDraft.clientAddress} onChange={v => handleClientDraftChange('clientAddress', v)} />
              <div style={{ gridColumn: '1 / -1' }}>
                <ClientEditField label="Correo" value={clientDraft.clientEmail ?? ''} onChange={v => handleClientDraftChange('clientEmail', v)} type="email" />
              </div>
              {clientEditError ? <div style={{ gridColumn: '1 / -1', color: '#B71C1C', fontSize: 12 }}>{clientEditError}</div> : null}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ClientRow label="Nombre / Razón Social" value={quote.clientName} />
              <ClientRow label="Teléfono" value={quote.clientPhone} />
              <ClientRow label="RUC / C.I." value={quote.clientCedula} />
              <ClientRow label="Dirección" value={quote.clientAddress} />
              <div style={{ gridColumn: '1 / -1' }}><ClientRow label="Correo" value={quote.clientEmail || '-'} /></div>
            </div>
          )}
        </div>


        <div className="invoice-table" style={{ marginTop: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={bigTh}>Código</th>
                <th style={bigThDesc}>Descripción</th>
                <th style={bigTh}>Cant.</th>
                <th style={bigTh}>Precio</th>
                <th style={bigTh}>% Dscto</th>
                <th style={bigTh}>IVA</th>
                <th style={bigTh}>Subtotal</th>
                <th style={bigTh}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, i) => (
                <tr key={i}>
                  <td style={bigTd}>{item.code}</td>
                  <td style={{ ...bigTd, textAlign: 'left' }}>{item.description}</td>
                  <td style={bigTd}>{item.quantity}</td>
                  <td style={bigTd}>{item.unitPrice.toFixed(2).replace('.', ',')}</td>
                  <td style={bigTd}>{discount > 0 ? `${((discount / totalCotizado) * 100).toFixed(2)}%` : '0,00%'}</td>
                  <td style={bigTd}>15%</td>
                  <td style={bigTd}>{(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}</td>
                  <td style={bigTd}>{(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}
              <tr className="filler-row"><td colSpan={8} style={{ ...bigTd, height: 170, borderTop: 'none' }} /></tr>
            </tbody>
          </table>
        </div>

        <div className="print-keep totals-section" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 10 }}>
          <div style={{ border: '1px solid #000', minHeight: 94, padding: '8px 10px', fontSize: 11 }}>OBSERVACION:</div>
          <div style={{ border: '1px solid #000', padding: '8px 10px', fontSize: 12 }}>
            <div style={sumRow}><span>SUBTOTAL</span><span>{subtotal.toFixed(2).replace('.', ',')}</span></div>
            <div style={sumRow}><span>DESCUENTO</span><span>{discount.toFixed(2).replace('.', ',')}</span></div>
            <div style={sumRow}><span>SUBTOTAL 2</span><span>{(subtotal - discount).toFixed(2).replace('.', ',')}</span></div>
            <div style={sumRow}><span>BASE IVA 15%</span><span>{(subtotal - discount).toFixed(2).replace('.', ',')}</span></div>
            <div style={sumRow}><span>IVA 15%</span><span>{iva.toFixed(2).replace('.', ',')}</span></div>
            <div style={{ ...sumRow, fontWeight: 700 }}><span>TOTAL</span><span>{finalTotal.toFixed(2).replace('.', ',')}</span></div>
          </div>
        </div>

        <div className="print-keep" style={{ marginTop: 10, fontSize: 10, lineHeight: 1.35, padding: '0 4px' }}>
          Debo y pagaré al vencimiento incondicionalmente en esta ciudad o en el lugar que se me reconvenga a la orden de DISTRIBUIDORA Y COMERCIALIZADORA SURTIMAX SA la suma de dinero indicada en el "VALOR TOTAL" de este documento. En caso de mora pagaré la tasa de interés máxima vigente a la fecha de vencimiento.
        </div>

        <div className="print-keep signature-section" style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: 11, textAlign: 'center' }}>
          <div><div style={{ borderTop: '2px solid #000', paddingTop: 6 }}>Firma autorizada</div></div>
          <div><div style={{ borderTop: '2px solid #000', paddingTop: 6 }}>Firma cliente</div></div>
        </div>

        <div className="print-keep" style={{ marginTop: 12, fontSize: 9, lineHeight: 1.35, padding: '0 4px' }}>
          Cordiales y su distribuidor garantizan el adecuado tratamiento de sus datos personales conforme a la ley. Sus datos serán usados para procesar transacciones, enviar comunicaciones comerciales y gestionar la relación comercial.
        </div>
      </div>
      </div>

      <style>{`
        @media print {
          :root {
            --print-scale: 1;
            --print-top-padding: 0px;
            --print-page-margin: 0mm;
            --print-translate-y: 0mm;
          }

          @page { margin: var(--print-page-margin); }

          body * { visibility: hidden !important; }
          .quotation-print-root, .quotation-print-root * { visibility: visible !important; }
          .quotation-print-root { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .only-print { display: inline !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }

          #quotation-document, #quotation-document * { color: #000 !important; text-shadow: none !important; }

          .invoice-section,
          .totals-section,
          .signature-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .invoice-table {
            break-inside: auto;
            page-break-inside: auto;
          }

          #quotation-document { box-shadow: none !important; border: none !important; border-radius: 0 !important; background: #fff !important; }
          #quotation-document [style*="background"],
          #quotation-document [style*="background-color"] { background: #fff !important; background-color: #fff !important; }
          #quotation-document table, #quotation-document th, #quotation-document td, #quotation-document div, #quotation-document span, #quotation-document p, #quotation-document h1, #quotation-document h2, #quotation-document h3, #quotation-document h4 { border-color: #000 !important; }
          #quotation-document img { filter: grayscale(1) contrast(1.1); }

          #quotation-document {
            border: none !important;
            width: calc(100% / var(--print-scale)) !important;
            max-width: 100% !important;
            margin: 0 !important;
            height: auto !important;
            position: relative;
            padding: var(--print-top-padding) 16px 16px 16px !important;
            font-size: inherit !important;
            transform: translateY(var(--print-translate-y)) scale(var(--print-scale)) !important;
            transform-origin: top left !important;
          }

          #quotation-document table {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          #quotation-document tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #quotation-document .filler-row {
            display: none !important;
          }
          #quotation-document .signature-block {
            position: absolute;
            bottom: 6mm;
            left: 0;
            width: 100%;
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @media print and (max-width: 148mm) {
            :root {
              --print-scale: 0.76;
              --print-translate-y: -1mm;
            }
          }

          .status-badge {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('593')) return digits;
  if (digits.startsWith('0')) return `593${digits.slice(1)}`;
  return `593${digits}`;
}

function ClientRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 11 }}>
      <span style={{ color: '#000', opacity: 0.75 }}>{label}: </span>
      <strong style={{ color: '#000' }}>{value}</strong>
    </div>
  );
}

function ClientEditField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label style={{ display: 'grid', gap: 5, color: '#455A64', fontSize: 12, fontWeight: 700 }}>
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} type={type} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #BBDEFB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
    </label>
  );
}

function TotalRow({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', columnGap: 14, alignItems: 'center', padding: highlight ? '10px 12px' : '7px 12px', backgroundColor: highlight ? '#0D47A1' : 'transparent', borderRadius: highlight ? 8 : 0, marginBottom: highlight ? 0 : 2 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: highlight ? 'white' : '#000', textAlign: 'left' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: highlight ? 'white' : '#000', minWidth: 120, textAlign: 'right', justifySelf: 'end', fontFamily: 'Arial, Helvetica, sans-serif' }}>{value}</span>
    </div>
  );
}


const bigTh: React.CSSProperties = { border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 700 };
const bigThDesc: React.CSSProperties = { ...bigTh, textAlign: 'center' };
const bigTd: React.CSSProperties = { borderLeft: '1px solid #000', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 5px', textAlign: 'center', verticalAlign: 'top' };
const sumRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr auto', marginBottom: 8 };

const miniEditBtn: React.CSSProperties = { background: '#E3F2FD', border: '1px solid #BBDEFB', color: '#000', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };
const miniSaveBtn: React.CSSProperties = { background: '#388E3C', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };
const miniCancelBtn: React.CSSProperties = { background: '#EF5350', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };

const th: React.CSSProperties = { padding: '6px 7px', textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: 0.3 };
const tdC: React.CSSProperties = { padding: '5px 7px', textAlign: 'center', fontSize: 10 };
