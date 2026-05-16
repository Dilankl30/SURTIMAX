import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Package } from 'lucide-react';
import { useStore } from '../store';
import { useIsMobile } from './ui/use-mobile';
import type { Product } from '../store';

const CAT_COLOR: Record<string, string> = {
  Caramelos: '#F4511E', Chocolates: '#6D4C41', Gelatinas: '#D81B60',
  Chicles: '#00ACC1', Confites: '#8E24AA', Gomas: '#43A047', Otros: '#546E7A',
};

const CAT_EMOJI: Record<string, string> = {
  Caramelos: '🍬', Chocolates: '🍫', Gelatinas: '🍮',
  Chicles: '🫧', Confites: '🍭', Gomas: '🐻', Otros: '📦',
};

export function Catalog() {
  const { products, addToCart, setCartOpen, setAuthOpen, cart } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [addedId, setAddedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory;
    return matchSearch && matchCat && p.available;
  }), [products, search, activeCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product.id);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const cartIds = new Set(cart.map(i => i.productId));
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '16px 12px 90px' : '24px 16px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%)',
        borderRadius: isMobile ? 14 : 18, padding: isMobile ? '20px 16px' : '32px 40px', marginBottom: isMobile ? 18 : 28, color: 'white',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -10, top: -20, fontSize: 130, opacity: 0.08, userSelect: 'none' }}>🍬</div>
        <div style={{ position: 'absolute', right: 130, bottom: -30, fontSize: 110, opacity: 0.06, userSelect: 'none' }}>🍫</div>
        <div style={{ position: 'absolute', left: -20, bottom: -10, fontSize: 100, opacity: 0.05, userSelect: 'none' }}>🍭</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: isMobile ? 24 : 30, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15 }}>Catálogo de Productos</h1>
          <p style={{ margin: '0 0 16px', opacity: 0.85, fontSize: isMobile ? 14 : 16 }}>Variedad y buen precio — Distribuidora SURTIMAX, Quito</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <HeroBadge emoji="📦" label="Productos" value={products.filter(p => p.available).length} />
            <HeroBadge emoji="🗂️" label="Categorías" value={categories.length - 1} />
            <HeroBadge emoji="📞" label="WhatsApp" value="0989961041" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <Search size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#90A4AE' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            style={{ width: '100%', padding: '11px 12px 11px 40px', border: '2px solid #E3F2FD', borderRadius: 10, fontSize: 14, outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', transition: 'border 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#1976D2')}
            onBlur={e => (e.target.style.borderColor = '#E3F2FD')}
          />
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px', borderRadius: 24, border: 'none', cursor: 'pointer',
              backgroundColor: activeCategory === cat ? '#0D47A1' : 'white',
              color: activeCategory === cat ? 'white' : '#546E7A',
              fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400,
              boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {cat !== 'Todos' && <span>{CAT_EMOJI[cat] || '📦'}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#78909C' }}>
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''} {activeCategory !== 'Todos' ? `en ${activeCategory}` : 'disponibles'}
      </p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, backgroundColor: 'white', borderRadius: 16, color: '#90A4AE' }}>
          <Package size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16 }}>No se encontraron productos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(210px, 1fr))', gap: isMobile ? 12 : 18 }}>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              isAdded={addedId === product.id}
              inCart={cartIds.has(product.id)}
            />
          ))}
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: isMobile ? 14 : 28, right: isMobile ? 12 : 28,
            backgroundColor: '#0D47A1', color: 'white',
            padding: isMobile ? '12px 16px' : '14px 22px', borderRadius: 50, border: 'none',
            boxShadow: '0 6px 24px rgba(13,71,161,0.45)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', zIndex: 50, fontSize: isMobile ? 13 : 14, fontWeight: 700, maxWidth: isMobile ? 'calc(100vw - 24px)' : undefined,
          }}
        >
          <ShoppingCart size={20} />
          Ver carrito ({cartCount})
        </button>
      )}
    </div>
  );
}

function HeroBadge({ emoji, label, value }: { emoji: string; label: string; value: any }) {
  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{value}</div>
        <div style={{ fontSize: 11, opacity: 0.8 }}>{label}</div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, isAdded, inCart }: {
  product: Product;
  onAddToCart: () => void;
  isAdded: boolean;
  inCart: boolean;
}) {
  const color = CAT_COLOR[product.category] || '#546E7A';
  const emoji = CAT_EMOJI[product.category] || '📦';

  return (
    <div
      style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #F0F4F8' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {/* Image area */}
      <div style={{ height: 130, background: `linear-gradient(135deg, ${color}18 0%, ${color}35 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 54 }}>{emoji}</span>
        <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: color, color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>
          {product.category}
        </div>
        {product.stock <= 10 && (
          <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#FF5722', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
            ¡Últimas!
          </div>
        )}
        {inCart && !isAdded && (
          <div style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: '#1976D2', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
            En carrito
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 10, color: '#90A4AE', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
          Cod: {product.code}
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1A237E', lineHeight: 1.35 }}>
          {product.name}
        </h3>
        <div style={{ fontSize: 11, color: '#78909C', marginBottom: 12 }}>
          {product.presentation} · {product.unitsPerPack} u/paca
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0D47A1', lineHeight: 1 }}>
              ${product.price.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: '#90A4AE' }}>incl. IVA</div>
          </div>
          <button
            onClick={onAddToCart}
            style={{
              backgroundColor: isAdded ? '#388E3C' : '#0D47A1',
              color: 'white', border: 'none', cursor: 'pointer',
              padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.2s, transform 0.1s',
              transform: isAdded ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <ShoppingCart size={13} />
            {isAdded ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
