import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import type { Product } from '../../store';

const CATEGORIES = ['Caramelos', 'Chocolates', 'Gelatinas', 'Chicles', 'Confites', 'Gomas', 'Otros'];

const EMPTY: Omit<Product, 'id'> = {
  code: '', name: '', category: 'Caramelos', price: 0, presentation: '', unitsPerPack: 0, stock: 0, available: true,
};

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY);
  const [filterCat, setFilterCat] = useState('Todos');

  const filtered = products.filter(p => {
    const matchS = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchC = filterCat === 'Todos' || p.category === filterCat;
    return matchS && matchC;
  });

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ code: p.code, name: p.name, category: p.category, price: p.price, presentation: p.presentation, unitsPerPack: p.unitsPerPack, stock: p.stock, available: p.available });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    if (editId) { updateProduct(editId, form); setEditId(null); }
    else addProduct(form);
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleCancel = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 3px', color: '#0D47A1', fontWeight: 800 }}>Gestión de Productos</h1>
          <p style={{ color: '#78909C', margin: 0, fontSize: 13 }}>{products.length} productos · {products.filter(p => p.stock <= 10).length} con stock bajo</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#455A64', fontWeight: 500 }}>
                <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                Disponible en catálogo
              </label>
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
                {['Código', 'Producto', 'Categoría', 'Precio', 'Presentación', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#546E7A', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#90A4AE' }}>No se encontraron productos</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F5', backgroundColor: i % 2 === 0 ? 'white' : '#FAFBFC', transition: 'background 0.1s' }}>
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
