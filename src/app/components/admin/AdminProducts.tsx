import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, AlertTriangle, Image as ImageIcon, Camera, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import type { Product } from '../../store';

const CATEGORIES = ['Caramelos', 'Chocolates', 'Gelatinas', 'Chicles', 'Confites', 'Gomas', 'Otros'];

const CAT_COLOR: Record<string, string> = {
  Caramelos: '#F4511E', Chocolates: '#6D4C41', Gelatinas: '#D81B60',
  Chicles: '#00ACC1', Confites: '#8E24AA', Gomas: '#43A047', Otros: '#546E7A',
};

const CAT_EMOJI: Record<string, string> = {
  Caramelos: '🍬', Chocolates: '🍫', Gelatinas: '🍮',
  Chicles: '🫧', Confites: '🍭', Gomas: '🐻', Otros: '📦',
};

type ImageAdjust = { zoom: number; offsetX: number; offsetY: number };

const DEFAULT_IMAGE_ADJUST: ImageAdjust = { zoom: 1, offsetX: 0, offsetY: 0 };

const CATALOG_IMAGE_SIZE = { width: 560, height: 260 };

const EMPTY: Omit<Product, 'id'> = {
  code: '', name: '', category: 'Caramelos', price: 0, presentation: '', unitsPerPack: 0, stock: 0, available: true, imageUrl: '',
};

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY);
  const [imageAdjust, setImageAdjust] = useState<ImageAdjust>(DEFAULT_IMAGE_ADJUST);
  const [filterCat, setFilterCat] = useState('Todos');

  const filtered = products.filter(p => {
    const matchS = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchC = filterCat === 'Todos' || p.category === filterCat;
    return matchS && matchC;
  });

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ code: p.code, name: p.name, category: p.category, price: p.price, presentation: p.presentation, unitsPerPack: p.unitsPerPack, stock: p.stock, available: p.available, imageUrl: p.imageUrl ?? '' });
    setImageAdjust(DEFAULT_IMAGE_ADJUST);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const imageUrl = form.imageUrl ? await fitImageForCatalog(form.imageUrl, imageAdjust) : '';
    const productToSave = { ...form, imageUrl };
    if (editId) { updateProduct(editId, productToSave); setEditId(null); }
    else addProduct(productToSave);
    setForm(EMPTY);
    setImageAdjust(DEFAULT_IMAGE_ADJUST);
    setShowForm(false);
  };

  const handleCancel = () => { setShowForm(false); setEditId(null); setForm(EMPTY); setImageAdjust(DEFAULT_IMAGE_ADJUST); };

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('imageUrl', String(reader.result || ''));
      setImageAdjust(DEFAULT_IMAGE_ADJUST);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 3px', color: '#0D47A1', fontWeight: 800 }}>Gestión de Productos</h1>
          <p style={{ color: '#78909C', margin: 0, fontSize: 13 }}>{products.length} productos · {products.filter(p => p.stock <= 10).length} con stock bajo</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); setImageAdjust(DEFAULT_IMAGE_ADJUST); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
        >
          <Plus size={17} /> Nuevo Producto
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 22, marginBottom: 22, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '2px solid #E3F2FD' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, color: '#0D47A1', fontWeight: 700 }}>
              {editId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h3>
            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78909C' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <FField label="Código *" value={form.code} onChange={v => set('code', v)} placeholder="CAR-001" />
            <FField label="Nombre del Producto *" value={form.name} onChange={v => set('name', v)} placeholder="MENTA GLACIAL" />
            <div>
              <label style={lbl}>Categoría</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <FField label="Precio ($)" value={String(form.price)} onChange={v => set('price', parseFloat(v) || 0)} placeholder="3.50" type="number" />
            <FField label="Presentación" value={form.presentation} onChange={v => set('presentation', v)} placeholder="Paca x 100u" />
            <FField label="Unidades por Paca" value={String(form.unitsPerPack)} onChange={v => set('unitsPerPack', parseInt(v) || 0)} placeholder="100" type="number" />
            <FField label="Stock Inicial" value={String(form.stock)} onChange={v => set('stock', parseInt(v) || 0)} placeholder="50" type="number" />
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)', gap: 14, alignItems: 'center', border: '1px dashed #BBDEFB', borderRadius: 12, padding: 12, backgroundColor: '#F8FAFE' }}>
              <div style={{ width: 96, height: 82, borderRadius: 10, background: form.imageUrl ? '#FFFFFF' : '#E3F2FD', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976D2', border: '1px solid #E3F2FD' }}>
                {form.imageUrl ? <img src={form.imageUrl} alt="Vista previa producto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={28} />}
              </div>
              <div>
                <label style={lbl}>Foto / imagen del producto</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0])} style={{ ...inp, padding: 8, backgroundColor: 'white', flex: '1 1 220px' }} />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: '2px solid #BBDEFB', background: 'white', color: '#0D47A1', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    <Camera size={15} /> Tomar foto
                    <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e.target.files?.[0])} style={{ display: 'none' }} />
                  </label>
                </div>
                {form.imageUrl && (
                  <button onClick={() => { set('imageUrl', ''); setImageAdjust(DEFAULT_IMAGE_ADJUST); }} style={{ marginTop: 8, background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>Quitar imagen</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#455A64', fontWeight: 500 }}>
                <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                Disponible en catálogo
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1', border: '1px solid #E3F2FD', borderRadius: 14, padding: 16, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFE 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div>
                  <label style={lbl}>Vista previa en catálogo</label>
                  <p style={{ margin: 0, color: '#78909C', fontSize: 12 }}>Así se verá la foto y la información antes de guardar los cambios.</p>
                </div>
                {!form.available && (
                  <span style={{ backgroundColor: '#FFEBEE', color: '#C62828', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>No visible en catálogo</span>
                )}
              </div>
              {form.imageUrl && (
                <ImageAdjustmentControls adjust={imageAdjust} onChange={setImageAdjust} />
              )}
              <div style={{ maxWidth: 280 }}>
                <CatalogPreviewCard product={form} imageAdjust={imageAdjust} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, border: 'none', background: '#388E3C', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              <Save size={16} /> {editId ? 'Actualizar' : 'Guardar'} Producto
            </button>
            <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 9, border: '2px solid #E0E0E0', background: 'white', cursor: 'pointer', color: '#546E7A', fontSize: 14 }}>
              <X size={15} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#90A4AE' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..." style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp, maxWidth: 160 }}>
          <option>Todos</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFE', borderBottom: '2px solid #E3F2FD' }}>
                {['Imagen', 'Código', 'Producto', 'Categoría', 'Precio', 'Presentación', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#546E7A', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#90A4AE' }}>No se encontraron productos</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F5', backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC', transition: 'background 0.1s' }}>
                  <td style={td}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, overflow: 'hidden', backgroundColor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976D2' }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={18} />}
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ backgroundColor: '#E3F2FD', color: '#1565C0', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{p.code}</span>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: '#1A237E', maxWidth: 180 }}>{p.name}</td>
                  <td style={td}>
                    <span style={{ backgroundColor: '#F3E5F5', color: '#7B1FA2', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500 }}>{p.category}</span>
                  </td>
                  <td style={{ ...td, fontWeight: 700, color: '#0D47A1', fontSize: 14 }}>${p.price.toFixed(2)}</td>
                  <td style={{ ...td, color: '#78909C' }}>{p.presentation}</td>
                  <td style={td}>
                    <span style={{ backgroundColor: p.stock <= 10 ? '#FFEBEE' : '#E8F5E9', color: p.stock <= 10 ? '#C62828' : '#2E7D32', padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {p.stock <= 10 && <AlertTriangle size={11} />} {p.stock} u
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ backgroundColor: p.available ? '#E8F5E9' : '#FFEBEE', color: p.available ? '#2E7D32' : '#C62828', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {p.available ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <IBtn onClick={() => startEdit(p)} color="#1976D2" title="Editar"><Edit size={14} /></IBtn>
                      <IBtn onClick={() => deleteProduct(p.id)} color="#EF5350" title="Eliminar"><Trash2 size={14} /></IBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid #F0F4F8', backgroundColor: '#FAFBFC', fontSize: 12, color: '#78909C' }}>
          Mostrando {filtered.length} de {products.length} productos
        </div>
      </div>
    </div>
  );
}

function ImageAdjustmentControls({ adjust, onChange }: { adjust: ImageAdjust; onChange: (adjust: ImageAdjust) => void }) {
  const update = <K extends keyof ImageAdjust>(key: K, value: ImageAdjust[K]) => onChange({ ...adjust, [key]: value });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 14, padding: 12, borderRadius: 12, backgroundColor: '#EEF6FF', border: '1px solid #BBDEFB' }}>
      <RangeControl label={`Tamaño ${Math.round(adjust.zoom * 100)}%`} min={0.5} max={1.6} step={0.05} value={adjust.zoom} onChange={value => update('zoom', value)} />
      <RangeControl label="Mover horizontal" min={-100} max={100} step={1} value={adjust.offsetX} onChange={value => update('offsetX', value)} />
      <RangeControl label="Mover vertical" min={-100} max={100} step={1} value={adjust.offsetY} onChange={value => update('offsetY', value)} />
      <button type="button" onClick={() => onChange(DEFAULT_IMAGE_ADJUST)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'end', padding: '9px 12px', borderRadius: 8, border: 'none', background: '#0D47A1', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
        <RotateCcw size={14} /> Restablecer
      </button>
    </div>
  );
}

function RangeControl({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#455A64', fontWeight: 700 }}>
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#0D47A1' }} />
    </label>
  );
}

function CatalogPreviewCard({ product, imageAdjust }: { product: Omit<Product, 'id'>; imageAdjust: ImageAdjust }) {
  const color = CAT_COLOR[product.category] || '#546E7A';
  const emoji = CAT_EMOJI[product.category] || '📦';
  const name = product.name.trim() || 'Nombre del producto';
  const code = product.code.trim() || 'COD-000';
  const presentation = product.presentation.trim() || 'Presentación';

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F0F4F8' }}>
      <div style={{ height: 130, background: product.imageUrl ? '#FFFFFF' : `linear-gradient(135deg, ${color}18 0%, ${color}35 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `translate(${imageAdjust.offsetX / 4}%, ${imageAdjust.offsetY / 4}%) scale(${imageAdjust.zoom})`, transformOrigin: 'center', transition: 'transform 0.15s' }} />
        ) : (
          <span style={{ fontSize: 54 }}>{emoji}</span>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: color, color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>
          {product.category}
        </div>
        {product.stock <= 10 && (
          <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#FF5722', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
            ¡Últimas!
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 10, color: '#90A4AE', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
          Cod: {code}
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1A237E', lineHeight: 1.35 }}>
          {name}
        </h3>
        <div style={{ fontSize: 11, color: '#78909C', marginBottom: 12 }}>
          {presentation} · {product.unitsPerPack || 0} u/paca
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0D47A1', lineHeight: 1 }}>
              ${(product.price || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: '#90A4AE' }}>incl. IVA</div>
          </div>
          <button disabled style={{ backgroundColor: '#0D47A1', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.9 }}>
            Vista previa
          </button>
        </div>
      </div>
    </div>
  );
}


function fitImageForCatalog(src: string, adjust: ImageAdjust): Promise<string> {
  if (!src.startsWith('data:image/')) return Promise.resolve(src);

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = CATALOG_IMAGE_SIZE.width;
      canvas.height = CATALOG_IMAGE_SIZE.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(src); return; }

      const baseScale = Math.min(canvas.width / img.width, canvas.height / img.height) * adjust.zoom;
      const drawWidth = img.width * baseScale;
      const drawHeight = img.height * baseScale;
      const availablePanX = Math.max(0, (canvas.width - drawWidth) / 2);
      const availablePanY = Math.max(0, (canvas.height - drawHeight) / 2);
      const overflowPanX = Math.max(0, (drawWidth - canvas.width) / 2);
      const overflowPanY = Math.max(0, (drawHeight - canvas.height) / 2);
      const panX = Math.max(availablePanX, overflowPanX);
      const panY = Math.max(availablePanY, overflowPanY);
      const dx = (canvas.width - drawWidth) / 2 + (adjust.offsetX / 100) * panX;
      const dy = (canvas.height - drawHeight) / 2 + (adjust.offsetY / 100) * panY;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

function FField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp}
        onFocus={e => (e.target.style.borderColor = '#1976D2')}
        onBlur={e => (e.target.style.borderColor = '#E3F2FD')}
      />
    </div>
  );
}

function IBtn({ children, onClick, color, title }: { children: React.ReactNode; onClick: () => void; color: string; title: string }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${color}30`, backgroundColor: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}25`)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${color}12`)}
    >
      {children}
    </button>
  );
}

const lbl: React.CSSProperties = { display: 'block', marginBottom: 5, fontSize: 11, fontWeight: 700, color: '#455A64', textTransform: 'uppercase', letterSpacing: 0.3 };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '2px solid #E3F2FD', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' };
const td: React.CSSProperties = { padding: '11px 14px', color: '#546E7A' };
