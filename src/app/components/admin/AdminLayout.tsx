import { useState } from 'react';
import { LayoutDashboard, Package, ClipboardList, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminQuotations } from './AdminQuotations';

const NAV = [
  { id: 'admin-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', sub: 'Análisis y KPIs' },
  { id: 'admin-products',  icon: <Package size={18} />,         label: 'Productos',  sub: 'Gestión de inventario' },
  { id: 'admin-quotes',    icon: <ClipboardList size={18} />,   label: 'Cotizaciones', sub: 'Historial y estados' },
] as const;

export function AdminLayout() {
  const { view, setView } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const content = () => {
    if (view === 'admin-products') return <AdminProducts />;
    if (view === 'admin-quotes') return <AdminQuotations />;
    return <AdminDashboard />;
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>

      {/* Sidebar */}
      <aside style={{ width: collapsed ? 64 : 220, flexShrink: 0, backgroundColor: '#1A237E', transition: 'width 0.25s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 10px' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', padding: '9px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, marginBottom: 18 }}
          >
            {collapsed ? <Menu size={18} /> : <><X size={16} /><span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Cerrar menú</span></>}
          </button>

          {!collapsed && (
            <div style={{ padding: '10px 10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Panel Admin</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>SURTIMAX</div>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map(item => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
                    padding: collapsed ? '12px' : '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.65)',
                    fontSize: 13, fontWeight: active ? 700 : 400,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 0.15s', width: '100%', textAlign: 'left',
                    borderLeft: active ? '3px solid #42A5F5' : '3px solid transparent',
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && (
                    <div style={{ flex: 1 }}>
                      <div style={{ whiteSpace: 'nowrap' }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{item.sub}</div>
                    </div>
                  )}
                  {!collapsed && active && <ChevronRight size={14} style={{ color: '#42A5F5', flexShrink: 0 }} />}
                </button>
              );
            })}
          </nav>
        </div>

        {!collapsed && (
          <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>v1.0 · SURTIMAX 2026</div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowX: 'hidden', backgroundColor: '#F0F4F8' }}>
        {content()}
      </main>
    </div>
  );
}
