import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Tag, User, CreditCard, MapPin, Phone, Mail } from 'lucide-react';
import { useStore } from '../store';
import type { Product, QuotationClientData } from '../store';

const emptyPhysicalClient: QuotationClientData = {
  clientName: '',
  clientCedula: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
};

export function CartSidebar() {
  const { cart, cartOpen, setCartOpen, products, updateCartQuantity, removeFromCart, currentUser, setAuthOpen, createQuotation } = useStore();
  const [physicalClient, setPhysicalClient] = useState<QuotationClientData>(emptyPhysicalClient);
  const [clientError, setClientError] = useState('');
  const [quoteStep, setQuoteStep] = useState<'summary' | 'client'>('summary');

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId),
  })).filter((i): i is { productId: string; quantity: number; product: Product } => i.product !== undefined);

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const subtotal = total / 1.15;
  const iva = total - subtotal;

  const handlePhysicalClientChange = (field: keyof QuotationClientData, value: string) => {
    setPhysicalClient(prev => ({ ...prev, [field]: value }));
    if (clientError) setClientError('');
  };

  const validatePhysicalClient = () => {
    if (!currentUser?.isAdmin) return true;
    const requiredFields: Array<keyof QuotationClientData> = ['clientName', 'clientCedula', 'clientAddress', 'clientPhone', 'clientEmail'];
    return requiredFields.every(field => String(physicalClient[field] ?? '').trim());
  };

  const handleQuote = () => {
    if (!currentUser) {
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    if (currentUser.isAdmin && quoteStep === 'summary') {
      setQuoteStep('client');
      return;
    }
    if (!validatePhysicalClient()) {
      setClientError('Completa todos los datos del cliente físico para generar la cotización.');
      return;
    }
    const items = cartItems.map(i => ({
      code: i.product.code,
      description: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
    }));
    createQuotation(items, 0, currentUser.isAdmin ? {
      clientName: physicalClient.clientName.trim(),
      clientCedula: physicalClient.clientCedula.trim(),
      clientAddress: physicalClient.clientAddress.trim(),
      clientPhone: physicalClient.clientPhone.trim(),
      clientEmail: physicalClient.clientEmail?.trim(),
    } : undefined);
    setPhysicalClient(emptyPhysicalClient);
    setQuoteStep('summary');
    setCartOpen(false);
  };

  if (!cartOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => { setCartOpen(false); setQuoteStep('summary'); }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(100vw, 460px)', maxWidth: '100vw', backgroundColor: 'white', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0D47A1, #1976D2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Carrito de Cotización</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{cart.reduce((s, i) => s + i.quantity, 0)} unidades · {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={() => { setCartOpen(false); setQuoteStep('summary'); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#90A4AE' }}>
              <ShoppingBag size={52} style={{ opacity: 0.25, marginBottom: 14 }} />
              <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>Tu carrito está vacío</p>
              <p style={{ fontSize: 13, margin: 0 }}>Agrega productos del catálogo para cotizar</p>
            </div>
          ) : cartItems.map(item => (
            <div key={item.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F5F5F5', flexWrap: 'wrap' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                {item.product.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍬'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A237E', marginBottom: 2, lineHeight: 1.3 }}>{item.product.name}</div>
                <div style={{ fontSize: 11, color: '#78909C' }}>Cod: {item.product.code} · ${item.product.price.toFixed(2)} c/u</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#546E7A' }}>
                  <Minus size={12} />
                </button>
                <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1A237E' }}>{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#546E7A' }}>
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ minWidth: 64, textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: '#0D47A1', fontSize: 14 }}>${(item.product.price * item.quantity).toFixed(2)}</div>
              </div>
              <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '16px 20px 24px', borderTop: '1px solid #E3F2FD', maxHeight: quoteStep === 'client' ? 'min(72vh, calc(100vh - 104px))' : 'none', overflowY: quoteStep === 'client' ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
            {/* Totals */}
            <div style={{ backgroundColor: '#F8FAFE', borderRadius: 12, padding: '14px 16px', marginBottom: 16, border: '1px solid #E3F2FD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#546E7A' }}>
                <span>Subtotal (sin IVA)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#546E7A' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={12} /> IVA 15%</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, color: '#0D47A1', borderTop: '1px solid #D0E8FF', paddingTop: 10 }}>
                <span>TOTAL COTIZADO</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!currentUser && (
              <div style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#E65100', display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ Debes registrarte para generar una cotización
              </div>
            )}

            {currentUser?.isAdmin && quoteStep === 'client' && (
              <div style={{ backgroundColor: '#F8FAFE', border: '1px solid #D0E8FF', borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0D47A1' }}>Datos del cliente físico</div>
                    <div style={{ fontSize: 11, color: '#78909C', marginTop: 2 }}>Completa estos datos para generar la cotización.</div>
                  </div>
                  <button onClick={() => { setQuoteStep('summary'); setClientError(''); }} style={{ background: 'white', border: '1px solid #BBDEFB', color: '#0D47A1', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Volver</button>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <ClientField label="Nombre completo / Razón social *" icon={<User size={13} />}>
                    <input value={physicalClient.clientName} onChange={e => handlePhysicalClientChange('clientName', e.target.value)} placeholder="Juan Carlos Pérez" style={clientInput} />
                  </ClientField>
                  <ClientField label="Cédula / RUC *" icon={<CreditCard size={13} />}>
                    <input value={physicalClient.clientCedula} onChange={e => handlePhysicalClientChange('clientCedula', e.target.value)} placeholder="1712345678" style={clientInput} />
                  </ClientField>
                  <ClientField label="Dirección *" icon={<MapPin size={13} />}>
                    <input value={physicalClient.clientAddress} onChange={e => handlePhysicalClientChange('clientAddress', e.target.value)} placeholder="Av. 10 de Agosto 123, Quito" style={clientInput} />
                  </ClientField>
                  <ClientField label="Teléfono *" icon={<Phone size={13} />}>
                    <input value={physicalClient.clientPhone} onChange={e => handlePhysicalClientChange('clientPhone', e.target.value)} placeholder="0991234567" style={clientInput} />
                  </ClientField>
                  <ClientField label="Correo electrónico *" icon={<Mail size={13} />}>
                    <input value={physicalClient.clientEmail ?? ''} onChange={e => handlePhysicalClientChange('clientEmail', e.target.value)} type="email" placeholder="correo@ejemplo.com" style={clientInput} />
                  </ClientField>
                </div>
                {clientError && (
                  <div style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', borderRadius: 8, padding: '8px 10px', marginTop: 10, fontSize: 12 }}>
                    ⚠️ {clientError}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleQuote}
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0D47A1, #1976D2)', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 16px rgba(13,71,161,0.3)', marginBottom: 10 }}
            >
              {currentUser?.isAdmin ? (quoteStep === 'summary' ? '🧾 Realizar Cotización' : '📋 Generar Cotización para Cliente') : currentUser ? '📋 Generar Cotización' : '🔐 Registrarse y Cotizar'}
            </button>

            <a
              href="https://wa.me/593989961041?text=Hola%20SURTIMAX%2C%20quiero%20hacer%20una%20consulta"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '2px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
            >
              <MessageCircle size={18} /> Consultar por WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function ClientField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#455A64', textTransform: 'uppercase', letterSpacing: 0.2 }}>
        <span style={{ color: '#1976D2' }}>{icon}</span> {label}
      </span>
      {children}
    </label>
  );
}

const clientInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 10px',
  border: '1px solid #BBDEFB',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
};
