import { useState } from 'react';
import { ShoppingCart, Bell, User, LogOut, Menu, X, Package, ClipboardList, LayoutDashboard, MessageCircle } from 'lucide-react';
import { useStore } from '../store';
import type { AppNotification } from '../store';
import logoImg from '../../imports/DAME_CON_EL_FONDO_DE_202605160147.jpeg';

export function Header() {
  const { view, setView, cart, setCartOpen, cartOpen, currentUser, logout, setAuthOpen, notifications } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const nav = (v: typeof view, label: string, close = false) => {
    setView(v);
    if (close) setMobileOpen(false);
  };

  return (
    <header style={{ backgroundColor: '#0D47A1', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <button onClick={() => nav('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <img src={logoImg} alt="SURTIMAX" style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </button>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'center' }} className="hidden md:flex">
            <NavBtn active={view === 'catalog'} onClick={() => nav('catalog')}>
              <Package size={15} /> Catálogo
            </NavBtn>
            {currentUser && !currentUser.isAdmin && (
              <NavBtn active={view === 'my-quotes'} onClick={() => nav('my-quotes')}>
                <ClipboardList size={15} /> Mis Cotizaciones
              </NavBtn>
            )}
            {currentUser?.isAdmin && (
              <>
                <NavBtn active={view === 'admin-dashboard'} onClick={() => nav('admin-dashboard')}>
                  <LayoutDashboard size={15} /> Dashboard
                </NavBtn>
                <NavBtn active={view === 'admin-products'} onClick={() => nav('admin-products')}>
                  <Package size={15} /> Productos
                </NavBtn>
                <NavBtn active={view === 'admin-quotes'} onClick={() => nav('admin-quotes')}>
                  <ClipboardList size={15} /> Cotizaciones
                </NavBtn>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* WhatsApp */}
            <a
              href="https://wa.me/593989961041?text=Hola%20SURTIMAX%2C%20necesito%20informaci%C3%B3n"
              target="_blank" rel="noopener noreferrer"
              title="Contactar por WhatsApp"
              style={{ background: '#25D366', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <MessageCircle size={18} />
            </a>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              style={{ position: 'relative', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center' }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#FF5722', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications (admin only) */}
            {currentUser?.isAdmin && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ position: 'relative', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center' }}
                >
                  <Bell size={20} />
                  {unreadNotifs > 0 && (
                    <span style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#FF5722', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                      {unreadNotifs}
                    </span>
                  )}
                </button>
                {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
              </div>
            )}

            {/* User */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: currentUser.isAdmin ? '#FF9800' : '#4FC3F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                    {currentUser.name[0]}
                  </div>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 500 }} className="hidden md:block">
                    {currentUser.name.split(' ')[0]}
                    {currentUser.isAdmin && <span style={{ marginLeft: 4, fontSize: 10, backgroundColor: '#FF9800', padding: '1px 5px', borderRadius: 10 }}>Admin</span>}
                  </span>
                </div>
                <button
                  onClick={logout}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center' }}
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}
              >
                <User size={16} /> Ingresar
              </button>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center' }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 }} className="md:hidden">
            <MobileNavBtn onClick={() => nav('catalog', '', true)}>📦 Catálogo</MobileNavBtn>
            {currentUser && !currentUser.isAdmin && (
              <MobileNavBtn onClick={() => nav('my-quotes', '', true)}>📋 Mis Cotizaciones</MobileNavBtn>
            )}
            {currentUser?.isAdmin && (
              <>
                <MobileNavBtn onClick={() => nav('admin-dashboard', '', true)}>📊 Dashboard</MobileNavBtn>
                <MobileNavBtn onClick={() => nav('admin-products', '', true)}>📦 Productos</MobileNavBtn>
                <MobileNavBtn onClick={() => nav('admin-quotes', '', true)}>📋 Cotizaciones Admin</MobileNavBtn>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
        color: 'white', cursor: 'pointer', padding: '6px 14px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function MobileNavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', padding: '10px 8px', textAlign: 'left', borderRadius: 6, fontSize: 14, width: '100%' }}
    >
      {children}
    </button>
  );
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, clearNotifications } = useStore();

  const iconMap: Record<AppNotification['type'], string> = {
    'new-quote': '📋', 'delivered': '✅', 'pending': '⏳', 'low-stock': '⚠️', 'whatsapp': '💬',
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={onClose} />
      <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', backgroundColor: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', width: 340, zIndex: 150, overflow: 'hidden', border: '1px solid #E3F2FD' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E3F2FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFE' }}>
          <span style={{ fontWeight: 700, color: '#0D47A1', fontSize: 14 }}>🔔 Notificaciones</span>
          <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#1976D2', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
            Marcar todas leídas
          </button>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#90A4AE', fontSize: 13 }}>Sin notificaciones</div>
          ) : notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', backgroundColor: n.read ? 'white' : '#EEF6FF', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{iconMap[n.type]}</span>
              <div>
                <div style={{ fontSize: 13, color: '#263238', marginBottom: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#90A4AE' }}>{n.date}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1976D2', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
