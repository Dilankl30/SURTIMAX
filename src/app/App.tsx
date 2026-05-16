import { AppProvider, useStore } from './store';
import { Header } from './components/Header';
import { Catalog } from './components/Catalog';
import { CartSidebar } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { MyQuotations } from './components/MyQuotations';
import { QuotationDetail } from './components/QuotationDetail';
import { AdminLayout } from './components/admin/AdminLayout';

function AppContent() {
  const { view, currentUser } = useStore();

  const renderView = () => {
    if (view === 'admin-dashboard' || view === 'admin-products' || view === 'admin-quotes') {
      if (!currentUser?.isAdmin) return <Catalog />;
      return <AdminLayout />;
    }
    if (view === 'my-quotes') return <MyQuotations />;
    if (view === 'quote-detail') return <QuotationDetail />;
    return <Catalog />;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F4F8' }}>
      <Header />
      <main>{renderView()}</main>
      <CartSidebar />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
