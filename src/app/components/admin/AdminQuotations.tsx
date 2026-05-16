import { Eye, Trash2, CheckCircle, Clock, MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';
import type { Quotation } from '../../store';

export function AdminQuotations() {
  const { quotations, setSelectedQuotationId, setView, updateQuotation, deleteQuotation } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered'>('all');

  const filtered = quotations
    .filter(q => {
      const matchS = q.clientName.toLowerCase().includes(search.toLowerCase()) || q.number.toLowerCase().includes(search.toLowerCase());
      const matchSt = filterStatus === 'all' || q.status === filterStatus;
      return matchS && matchSt;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalRevenue = quotations.reduce((s, q) => s + q.finalTotal, 0);
  const deliveredCount = quotations.filter(q => q.status === 'delivered').length;
  const pendingCount = quotations.filter(q => q.status === 'pending').length;

  const handleView = (id: string) => { setSelectedQuotationId(id); setView('quote-detail'); };

  const waNum = (phone: string) => {
    const n = phone.replace(/[^0-9]/g, '');
    return n.startsWith('0') ? `593${n.slice(1)}` : `593${n}`;
  };

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: '0 0 4px', color: '#0D47A1', fontWeight: 800 }}>Gestión de Cotizaciones</h1>
        <p style={{ color: '#78909C', margin: 0, fontSize: 13 }}>Administra todas las cotizaciones del sistema</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 22 }}>
        <SCard label="Total Cotizaciones" value={quotations.length} color="#1976D2" />
        <SCard label="Entregadas" value={deliveredCount} color="#2E7D32" />
        <SCard label="Pendientes" value={pendingCount} color="#E65100" />
        <SCard label="Total Facturado" value={`$${totalRevenue.toFixed(2)}`} color="#7B1FA2" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#90A4AE' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente o número..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '2px solid #E3F2FD', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'delivered'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, backgroundColor: filterStatus === s ? '#0D47A1' : 'white', color: filterStatus === s ? 'white' : '#546E7A', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {s === 'all' ? 'Todas' : s === 'pending' ? '⏳ Pendientes' : '✓ Entregadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFE', borderBottom: '2px solid #E3F2FD' }}>
                {['No. Cotización', 'Cliente', 'Fecha', 'Productos', 'Subtotal', 'IVA', 'Total', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#546E7A', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#90A4AE' }}>📋 No se encontraron cotizaciones</td></tr>
              ) : filtered.map((q, i) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #F5F5F5', backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0D47A1', whiteSpace: 'nowrap' }}>{q.number}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#1A237E' }}>{q.clientName}</div>
                    <div style={{ fontSize: 11, color: '#90A4AE', marginTop: 2 }}>CI: {q.clientCedula}</div>
                    <div style={{ fontSize: 11, color: '#90A4AE' }}>{q.clientPhone}</div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#546E7A', whiteSpace: 'nowrap' }}>
                    {new Date(q.date).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#546E7A' }}>{q.items.length}</td>
                  <td style={{ padding: '12px 14px', color: '#546E7A' }}>${q.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', color: '#546E7A' }}>${q.iva.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0D47A1', fontSize: 14, whiteSpace: 'nowrap' }}>${q.finalTotal.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: q.status === 'delivered' ? '#E8F5E9' : '#FFF3E0', color: q.status === 'delivered' ? '#2E7D32' : '#E65100', whiteSpace: 'nowrap' }}>
                      {q.status === 'delivered' ? '✓ Entregado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <IBtn onClick={() => handleView(q.id)} color="#1976D2" title="Ver detalle"><Eye size={14} /></IBtn>
                      <IBtn
                        onClick={() => updateQuotation(q.id, { status: q.status === 'pending' ? 'delivered' : 'pending' })}
                        color={q.status === 'pending' ? '#2E7D32' : '#FF7043'}
                        title={q.status === 'pending' ? 'Marcar entregado' : 'Marcar pendiente'}
                      >
                        {q.status === 'pending' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      </IBtn>
                      <a href={`https://wa.me/${waNum(q.clientPhone)}?text=${encodeURIComponent(`Hola ${q.clientName}, su cotización *${q.number}* por $${q.finalTotal.toFixed(2)} está lista. - SURTIMAX`)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <IBtn color="#25D366" title="WhatsApp al cliente"><MessageCircle size={14} /></IBtn>
                      </a>
                      <IBtn onClick={() => deleteQuotation(q.id)} color="#EF5350" title="Eliminar"><Trash2 size={14} /></IBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid #F0F4F8', backgroundColor: '#FAFBFC', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#78909C' }}>
          <span>Mostrando {filtered.length} de {quotations.length} cotizaciones</span>
          <span>Total filtrado: <strong style={{ color: '#0D47A1' }}>${filtered.reduce((s, q) => s + q.finalTotal, 0).toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
}

function SCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1A237E', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78909C' }}>{label}</div>
    </div>
  );
}

function IBtn({ children, onClick, color, title }: { children: React.ReactNode; onClick?: () => void; color: string; title: string }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${color}30`, backgroundColor: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}25`)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${color}12`)}
    >
      {children}
    </button>
  );
}
