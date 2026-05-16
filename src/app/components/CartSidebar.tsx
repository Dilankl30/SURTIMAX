import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Tag } from 'lucide-react';
import { useStore } from '../store';
import type { Product } from '../store';

export function CartSidebar() {
  const { cart, cartOpen, setCartOpen, products, updateCartQuantity, removeFromCart, currentUser, setAuthOpen, createQuotation } = useStore();

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId),
  })).filter((i): i is { productId: string; quantity: number; product: Product } => i.product !== undefined);

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const subtotal = total / 1.15;
  const iva = total - subtotal;

  const handleQuote = () => {
    if (!currentUser) {
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }
    const items = cartItems.map(i => ({
      code: i.product.code,
      description: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
    }));
    createQuotation(items);
    setCartOpen(false);
  };

  if (!cartOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setCartOpen(false)} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: Math.min(420, window.innerWidth), backgroundColor: 'white', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0D47A1, #1976D2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Carrito de Cotización</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{cart.reduce((s, i) => s + i.quantity, 0)} unidades · {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
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
            <div key={item.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                🍬
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
          <div style={{ padding: '16px 20px 24px', borderTop: '1px solid #E3F2FD' }}>
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

            <button
              onClick={handleQuote}
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0D47A1, #1976D2)', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 16px rgba(13,71,161,0.3)', marginBottom: 10 }}
            >
              {currentUser ? '📋 Generar Cotización' : '🔐 Registrarse y Cotizar'}
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
