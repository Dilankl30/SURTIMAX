import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, MessageCircle, Edit2, Save, X } from 'lucide-react';
import { useStore } from '../store';
import type { QuotationClientData } from '../store';
import { createQuotationPdfBlobFromElement } from '../utils/quotationPdf';
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
    `Hola ${quote.clientName}, su prefactura *${quote.number}* por un total de *$${finalTotal.toFixed(2)}* está lista.\n\nProductos:\n` +
    quote.items.map(i => `• ${i.description} x${i.quantity} = $${(i.quantity * i.unitPrice).toFixed(2)}`).join('\n') +
    `\n\n_SURTIMAX - variedad y buen precio_`
  );
  const adminWAMsg = encodeURIComponent(`Hola SURTIMAX, quiero información sobre mi prefactura ${quote.number}`);
  const clientWAUrl = `https://wa.me/${clientWANum}?text=${clientWAMsg}`;

  const downloadPdf = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSendClientWhatsApp = async () => {
    const documentElement = document.getElementById('quotation-document');
    if (!documentElement) {
      alert('No se pudo preparar la prefactura visual para PDF. Recarga la página e inténtalo de nuevo.');
      return;
    }
    let pdfBlob: Blob;

    try {
      pdfBlob = await createQuotationPdfBlobFromElement(documentElement);
    } catch {
      alert('No se pudo generar el PDF visual de la prefactura en este dispositivo. Intenta desde otro navegador o desde escritorio.');
      return;
    }

    const fileName = `${quote.number}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare?.({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: `Prefactura ${quote.number}`,
          text: decodeURIComponent(clientWAMsg),
          files: [pdfFile],
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    downloadPdf(pdfBlob, fileName);
    window.open(clientWAUrl, '_blank', 'noopener,noreferrer');
  };
  const handleDownloadPdf = async () => {
    const documentElement = document.getElementById('quotation-document');
    if (!documentElement) {
      alert('No se pudo preparar la prefactura visual para PDF. Recarga la página e inténtalo de nuevo.');
      return;
    }
    let pdfBlob: Blob;

    try {
      pdfBlob = await createQuotationPdfBlobFromElement(documentElement);
    } catch {
      alert('No se pudo generar el PDF visual de la prefactura en este dispositivo. Intenta desde otro navegador o desde escritorio.');
      return;
    }

    downloadPdf(pdfBlob, `${quote.number}.pdf`);
  };

  const backView = currentUser?.isAdmin ? 'admin-quotes' : 'my-quotes';

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px' }}>

      {/* Action bar */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setView(backView)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: '2px solid #E0E0E0', background: 'white', cursor: 'pointer', color: '#546E7A', fontSize: 14 }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <button onClick={handleDownloadPdf} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Printer size={16} /> Descargar PDF
        </button>
        {currentUser?.isAdmin ? (
          <button
            onClick={handleSendClientWhatsApp}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#25D366', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            <MessageCircle size={16} /> Enviar PDF por WhatsApp
          </button>
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
      <div id="quotation-document" style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.1)', border: '1px solid #E3F2FD' }}>

        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '3px solid #0D47A1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <img src={logoImg} alt="SURTIMAX" style={{ height: 110, objectFit: 'contain', marginBottom: 10 }} />
            <div style={{ fontSize: 12, color: '#546E7A', lineHeight: 1.8 }}>
              <div><strong style={{ color: '#0D47A1' }}>CIUDAD:</strong> QUITO</div>
              <div><strong style={{ color: '#0D47A1' }}>CI O RUC:</strong> 2100282249001</div>
              <div><strong style={{ color: '#0D47A1' }}>TLF:</strong> 0958737004</div>
              <div><strong style={{ color: '#0D47A1' }}>EMAIL:</strong> ventas@surtimax.com</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ color: '#0D47A1', fontSize: 30, fontWeight: 800, margin: '0 0 14px', letterSpacing: 2 }}>PREFACTURA</h1>
            <div style={{ fontSize: 13, color: '#546E7A', lineHeight: 1.8 }}>
              <div><strong>No. Prefactura:</strong> <span style={{ color: '#1A237E', fontWeight: 700 }}>{quote.number}</span></div>
              <div><strong>Fecha:</strong> {new Date(quote.date).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, backgroundColor: quote.status === 'delivered' ? '#E8F5E9' : '#FFF3E0', color: quote.status === 'delivered' ? '#2E7D32' : '#E65100' }}>
                {quote.status === 'delivered' ? '✓ ENTREGADO' : '⏳ PENDIENTE'}
              </span>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div style={{ padding: '18px 32px', backgroundColor: '#F8FAFE', borderBottom: '1px solid #E3F2FD' }}>
          <h3 style={{ margin: '0 0 12px', color: '#0D47A1', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #0D47A1', paddingBottom: 6, display: 'inline-block' }}>
            Información del cliente:
          </h3>
          {currentUser?.isAdmin && (
            <div className="no-print" style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {editingClient ? (
                <>
                  <button onClick={handleSaveClient} style={miniSaveBtn}><Save size={13} /> Guardar datos</button>
                  <button onClick={() => { setEditingClient(false); setClientEditError(''); }} style={miniCancelBtn}><X size={13} /> Cancelar</button>
                </>
              ) : (
                <button onClick={() => setEditingClient(true)} style={miniEditBtn}><Edit2 size={13} /> Editar datos del cliente</button>
              )}
            </div>
          )}
          {editingClient ? (
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px 14px', fontSize: 13 }}>
              <ClientEditField label="Nombre / Razón Social *" value={clientDraft.clientName} onChange={value => handleClientDraftChange('clientName', value)} />
              <ClientEditField label="Teléfono *" value={clientDraft.clientPhone} onChange={value => handleClientDraftChange('clientPhone', value)} />
              <ClientEditField label="R.U.C. / C.I. *" value={clientDraft.clientCedula} onChange={value => handleClientDraftChange('clientCedula', value)} />
              <ClientEditField label="Dirección *" value={clientDraft.clientAddress} onChange={value => handleClientDraftChange('clientAddress', value)} />
              <ClientEditField label="Correo electrónico *" value={clientDraft.clientEmail ?? ''} onChange={value => handleClientDraftChange('clientEmail', value)} type="email" />
              {clientEditError && <div style={{ gridColumn: '1 / -1', color: '#C62828', backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>⚠️ {clientEditError}</div>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px 24px', fontSize: 13 }}>
              <ClientRow label="Nombre / Razón Social" value={quote.clientName} />
              <ClientRow label="Teléfono" value={quote.clientPhone} />
              <ClientRow label="R.U.C. / C.I." value={quote.clientCedula} />
              <ClientRow label="Dirección" value={quote.clientAddress} />
              {quote.clientEmail && <ClientRow label="Correo" value={quote.clientEmail} />}
            </div>
          )}
        </div>

        {/* Items table */}
        <div style={{ padding: '0 32px 24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
              <thead>
                <tr style={{ backgroundColor: '#0D47A1', color: 'white' }}>
                  <th style={th}>CÓDIGO</th>
                  <th style={th}>CANTIDAD</th>
                  <th style={{ ...th, textAlign: 'left', paddingLeft: 16 }}>DESCRIPCIÓN DEL ÍTEM</th>
                  <th style={th}>P. UNITARIO</th>
                  <th style={th}>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#F8FAFE', borderBottom: '1px solid #E3F2FD' }}>
                    <td style={tdC}><span style={{ backgroundColor: '#E3F2FD', color: '#1565C0', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>{item.code}</span></td>
                    <td style={tdC}>{item.quantity}</td>
                    <td style={{ ...tdC, textAlign: 'left', paddingLeft: 16, fontWeight: 500, color: '#1A237E' }}>{item.description}</td>
                    <td style={tdC}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ ...tdC, fontWeight: 700, color: '#0D47A1' }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #E3F2FD', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 420 }}>
            <h4 style={{ color: '#0D47A1', margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>VALIDEZ Y CONDICIONES COMERCIALES:</h4>
            <p style={{ color: '#546E7A', margin: 0, fontSize: 12 }}>• Tiempo de entrega estimado: Según disponibilidad de inventario.</p>
          </div>

          <div style={{ minWidth: 280, width: 300 }}>
            <TotalRow label="SUBTOTAL:" value={`$${subtotal.toFixed(2)}`} />
            <TotalRow label="I.V.A. 15%:" value={`$${iva.toFixed(2)}`} />
            <TotalRow
              label="DESCUENTO:"
              value={
                currentUser?.isAdmin ? (
                  editingDiscount ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number" value={tempDiscount}
                        onChange={e => setTempDiscount(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveDiscount()}
                        style={{ width: 80, padding: '3px 7px', border: '2px solid #1976D2', borderRadius: 6, fontSize: 13, outline: 'none' }}
                        autoFocus
                      />
                      <button onClick={handleSaveDiscount} style={{ background: '#388E3C', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                        <Save size={13} />
                      </button>
                      <button onClick={() => setEditingDiscount(false)} style={{ background: '#EF5350', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingDiscount(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0D47A1', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13, padding: 0 }}>
                      ${discount.toFixed(2)} <Edit2 size={12} style={{ color: '#1976D2' }} />
                    </button>
                  )
                ) : `$${discount.toFixed(2)}`
              }
            />
            <div style={{ height: 1, backgroundColor: '#E3F2FD', margin: '8px 0' }} />
            <TotalRow label="TOTAL PREFACTURA:" value={`$${finalTotal.toFixed(2)}`} highlight />
          </div>
        </div>

        {/* Signature */}
        <div style={{ padding: '10px 32px 36px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', borderTop: '2px solid #0D47A1', paddingTop: 10, minWidth: 220, color: '#546E7A', fontSize: 13, letterSpacing: 1 }}>
            RECIBÍ CONFORME
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #quotation-document { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          @page { margin: 10mm; }
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
    <div style={{ fontSize: 13 }}>
      <span style={{ color: '#78909C' }}>{label}: </span>
      <strong style={{ color: '#1A237E' }}>{value}</strong>
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 14, alignItems: 'center', padding: highlight ? '10px 12px' : '7px 12px', backgroundColor: highlight ? '#0D47A1' : 'transparent', borderRadius: highlight ? 8 : 0, marginBottom: highlight ? 0 : 2 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? 'white' : '#546E7A', textAlign: 'left' }}>{label}</span>
      <span style={{ fontSize: highlight ? 17 : 13, fontWeight: 800, color: highlight ? 'white' : '#0D47A1', minWidth: 110, textAlign: 'right', justifySelf: 'end' }}>{value}</span>
    </div>
  );
}

const miniEditBtn: React.CSSProperties = { background: '#E3F2FD', border: '1px solid #BBDEFB', color: '#0D47A1', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };
const miniSaveBtn: React.CSSProperties = { background: '#388E3C', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };
const miniCancelBtn: React.CSSProperties = { background: '#EF5350', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 };

const th: React.CSSProperties = { padding: '11px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 };
const tdC: React.CSSProperties = { padding: '10px 12px', textAlign: 'center', fontSize: 13 };
