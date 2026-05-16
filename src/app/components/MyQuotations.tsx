import { Eye, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import type { Quotation } from '../store';

export function MyQuotations() {
  const { quotations, currentUser, setView, setSelectedQuotationId, deleteQuotation } = useStore();

  const myQuotes = quotations
    .filter(q => q.clientId === currentUser?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSpent = myQuotes.reduce((s, q) => s + q.finalTotal, 0);
  const delivered = myQuotes.filter(q => q.status === 'delivered').length;
  const pending = myQuotes.filter(q => q.status === 'pending').length;

  const handleView = (id: string) => { setSelectedQuotationId(id); setView('quote-detail'); };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', color: '#0D47A1', fontWeight: 800 }}>Mis Cotizaciones</h1>
          <p style={{ color: '#78909C', margin: 0, fontSize: 14 }}>Historial de cotizaciones — {currentUser?.name}</p>
        </div>
        <button onClick={() => setView('catalog')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          <ShoppingBag size={16} /> Nueva Cotización
        </button>
      </div>

      {/* Summary */}
      {myQuotes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total Cotizaciones" value={myQuotes.length} color="#1976D2" bg="#E3F2FD" />
          <StatCard label="Entregadas" value={delivered} color="#2E7D32" bg="#E8F5E9" />
          <StatCard label="Pendientes" value={pending} color="#E65100" bg="#FFF3E0" />
          <StatCard label="Total Cotizado" value={`$${totalSpent.toFixed(2)}`} color="#7B1FA2" bg="#F3E5F5" />
        </div>
      )}

      {myQuotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, backgroundColor: 'white', borderRadius: 16, color: '#90A4AE', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3 style={{ color: '#546E7A', margin: '0 0 8px' }}>Sin cotizaciones aún</h3>
          <p style={{ margin: '0 0 24px', fontSize: 14 }}>Agrega productos al carrito y genera tu primera cotización</p>
          <button onClick={() => setView('catalog')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
            Ver Catálogo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myQuotes.map(q => (
            <QuoteCard key={q.id} quote={q} onView={() => handleView(q.id)} onDelete={() => deleteQuotation(q.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg }: { label: string; value: any; color: string; bg: string }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1A237E', marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78909C' }}>{label}</div>
    </div>
  );
}

function QuoteCard({ quote, onView, onDelete }: { quote: Quotation; onView: () => void; onDelete: () => void }) {
  const waMsg = encodeURIComponent(`Hola SURTIMAX, quiero consultar sobre mi cotización ${quote.number} por $${quote.finalTotal.toFixed(2)}`);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F0F4F8', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: '#0D47A1', fontSize: 16 }}>{quote.number}</span>
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              backgroundColor: quote.status === 'delivered' ? '#E8F5E9' : '#FFF3E0',
              color: quote.status === 'delivered' ? '#2E7D32' : '#E65100',
            }}>
              {quote.status === 'delivered' ? '✓ Entregado' : '⏳ Pendiente'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#78909C', marginBottom: 6 }}>
            📅 {new Date(quote.date).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ fontSize: 13, color: '#546E7A', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>🛍️ {quote.items.length} producto{quote.items.length !== 1 ? 's' : ''}</span>
            <span>💰 Total: <strong style={{ color: '#0D47A1' }}>${quote.finalTotal.toFixed(2)}</strong></span>
            {quote.discount > 0 && <span style={{ color: '#388E3C' }}>🏷️ Descuento: ${quote.discount.toFixed(2)}</span>}
          </div>
          {/* Items preview */}
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quote.items.slice(0, 3).map((item, i) => (
              <span key={i} style={{ backgroundColor: '#E3F2FD', color: '#1565C0', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 500 }}>
                {item.description} x{item.quantity}
              </span>
            ))}
            {quote.items.length > 3 && (
              <span style={{ backgroundColor: '#F5F5F5', color: '#78909C', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
                +{quote.items.length - 3} más
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <ActionBtn onClick={onView} color="#1976D2" title="Ver detalle"><Eye size={15} /></ActionBtn>
          <a href={`https://wa.me/593989961041?text=${waMsg}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <ActionBtn color="#25D366" title="Enviar por WhatsApp"><MessageCircle size={15} /></ActionBtn>
          </a>
          <ActionBtn onClick={onDelete} color="#EF5350" title="Eliminar cotización"><Trash2 size={15} /></ActionBtn>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, color, title }: { children: React.ReactNode; onClick?: () => void; color: string; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ width: 38, height: 38, borderRadius: 9, border: `2px solid ${color}25`, backgroundColor: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}25`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}12`; }}
    >
      {children}
    </button>
  );
}
