import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { fetchProductsFromSupabase, isSupabaseConfigured, requestEmailLoginCode, requestPasswordRecovery, verifyEmailLoginCode } from './lib/supabase';

export type ViewType =
  | 'catalog'
  | 'my-quotes'
  | 'quote-detail'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-quotes';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  presentation: string;
  unitsPerPack: number;
  stock: number;
  available: boolean;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  cedula: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface QuotationItem {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  clientCedula: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail?: string;
  items: QuotationItem[];
  totalCotizado: number;
  subtotal: number;
  iva: number;
  discount: number;
  finalTotal: number;
  status: 'pending' | 'delivered';
}

export type QuotationClientData = Pick<Quotation, 'clientName' | 'clientCedula' | 'clientAddress' | 'clientPhone' | 'clientEmail'>;

export interface AppNotification {
  id: string;
  type: 'new-quote' | 'delivered' | 'pending' | 'low-stock' | 'whatsapp';
  message: string;
  date: string;
  read: boolean;
}

// ─── Initial Data ────────────────────────────────────────────────────────────

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1',  code: 'CAR-001', name: 'MENTA GLACIAL',           category: 'Caramelos',  price: 3.50,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 50, available: true },
  { id: 'p2',  code: 'CAR-002', name: 'KAUMAL MANZANILLA Y MIEL',category: 'Caramelos',  price: 3.80,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 45, available: true },
  { id: 'p3',  code: 'CAR-003', name: 'KAUMAL ORIGINAL',         category: 'Caramelos',  price: 3.80,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 60, available: true },
  { id: 'p4',  code: 'CAR-004', name: 'KAUMAL JENGIBRE',         category: 'Caramelos',  price: 3.80,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 40, available: true },
  { id: 'p5',  code: 'CAR-005', name: 'LECHE Y MIEL',            category: 'Caramelos',  price: 4.20,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 35, available: true },
  { id: 'p6',  code: 'CAR-006', name: 'BARRILETE',               category: 'Caramelos',  price: 2.50,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 80, available: true },
  { id: 'p7',  code: 'CAR-007', name: 'MANGO BICHE',             category: 'Caramelos',  price: 3.20,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 55, available: true },
  { id: 'p8',  code: 'CAR-008', name: 'BOLA DE FUEGO',           category: 'Caramelos',  price: 3.50,  presentation: 'Paca x 100u',  unitsPerPack: 100, stock: 70, available: true },
  { id: 'p9',  code: 'CAR-009', name: 'CHUPETIN GRANDE',         category: 'Caramelos',  price: 5.00,  presentation: 'Bolsa x 50u',  unitsPerPack: 50,  stock: 30, available: true },
  { id: 'p10', code: 'CAR-010', name: 'CARAMELOS SURTIDOS',      category: 'Caramelos',  price: 5.20,  presentation: 'Paca x 200u',  unitsPerPack: 200, stock: 45, available: true },
  { id: 'p11', code: 'CON-001', name: 'KOLITA LOKA',             category: 'Confites',   price: 5.50,  presentation: 'Paca x 50u',   unitsPerPack: 50,  stock: 40, available: true },
  { id: 'p12', code: 'CON-002', name: 'MARSHMALLOWS',            category: 'Confites',   price: 4.80,  presentation: 'Bolsa x 250g', unitsPerPack: 1,   stock: 25, available: true },
  { id: 'p13', code: 'PAL-001', name: 'PALETA CHAMOYADA',        category: 'Confites',   price: 6.00,  presentation: 'Caja x 24u',   unitsPerPack: 24,  stock: 20, available: true },
  { id: 'p14', code: 'GEL-001', name: 'GELATINAS PEQUEÑA',       category: 'Gelatinas',  price: 8.00,  presentation: 'Caja x 24u',   unitsPerPack: 24,  stock: 20, available: true },
  { id: 'p15', code: 'GEL-002', name: 'GELATINAS GRANDE',        category: 'Gelatinas',  price: 15.00, presentation: 'Caja x 12u',   unitsPerPack: 12,  stock: 15, available: true },
  { id: 'p16', code: 'CHO-001', name: 'MANICHO BOMBÓN',          category: 'Chocolates', price: 12.00, presentation: 'Caja x 24u',   unitsPerPack: 24,  stock: 18, available: true },
  { id: 'p17', code: 'CHO-002', name: 'CHOCOLATINAS',            category: 'Chocolates', price: 18.00, presentation: 'Caja x 48u',   unitsPerPack: 48,  stock: 22, available: true },
  { id: 'p18', code: 'CHO-003', name: 'TRUFFLES SURTIDOS',       category: 'Chocolates', price: 25.00, presentation: 'Caja x 12u',   unitsPerPack: 12,  stock: 8,  available: true },
  { id: 'p19', code: 'CHI-001', name: 'CHICLE TUTTI FRUTI',      category: 'Chicles',    price: 4.50,  presentation: 'Bolsa x 100u', unitsPerPack: 100, stock: 65, available: true },
  { id: 'p20', code: 'CHI-002', name: 'CHICLE MENTA',            category: 'Chicles',    price: 4.50,  presentation: 'Bolsa x 100u', unitsPerPack: 100, stock: 60, available: true },
  { id: 'p21', code: 'GOM-001', name: 'GOMITAS OSITOS',          category: 'Gomas',      price: 7.50,  presentation: 'Bolsa x 500g', unitsPerPack: 1,   stock: 28, available: true },
  { id: 'p22', code: 'GOM-002', name: 'GOMITAS GUSANOS',         category: 'Gomas',      price: 7.50,  presentation: 'Bolsa x 500g', unitsPerPack: 1,   stock: 32, available: true },
  { id: 'p23', code: 'GAL-001', name: 'GALLETAS RELLENAS',       category: 'Otros',      price: 22.00, presentation: 'Caja x 12u',   unitsPerPack: 12,  stock: 10, available: true },
  { id: 'p24', code: 'WAF-001', name: 'WAFER CHOCOLATE',         category: 'Otros',      price: 15.00, presentation: 'Caja x 24u',   unitsPerPack: 24,  stock: 16, available: true },
];

const INITIAL_USERS: User[] = [
  { id: 'admin', name: 'Administrador SURTIMAX', cedula: '2200123456001', address: 'Quito, Ecuador', phone: '0989961041', email: 'admin@surtimax.com', password: 'admin123', isAdmin: true },
];

function computeFinancials(items: QuotationItem[], discount: number) {
  const totalCotizado = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal = totalCotizado / 1.15;
  const iva = totalCotizado - subtotal;
  const finalTotal = totalCotizado - discount;
  return { totalCotizado, subtotal, iva, discount, finalTotal };
}

const INITIAL_QUOTATIONS: Quotation[] = [];

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextType {
  view: ViewType;
  setView: (v: ViewType) => void;
  selectedQuotationId: string | null;
  setSelectedQuotationId: (id: string | null) => void;
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  requestLoginCode: (email: string) => Promise<boolean>;
  verifyLoginCode: (email: string, code: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  logout: () => void;
  register: (data: Omit<User, 'id' | 'isAdmin'>) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  quotations: Quotation[];
  createQuotation: (items: QuotationItem[], discount?: number, clientData?: QuotationClientData) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('catalog');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchProductsFromSupabase()
      .then(rows => setProducts(rows.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        presentation: row.presentation,
        unitsPerPack: row.units_per_pack,
        stock: row.stock,
        available: row.available,
        imageUrl: row.image_url ?? '',
      }))))
      .catch(error => console.warn('No se pudieron cargar productos desde Supabase', error));
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const requestLoginCode = useCallback(async (email: string): Promise<boolean> => {
    await requestEmailLoginCode(email);
    return true;
  }, []);

  const verifyLoginCode = useCallback(async (email: string, code: string): Promise<boolean> => {
    await verifyEmailLoginCode(email, code);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [users]);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    await requestPasswordRecovery(email);
    return true;
  }, []);

  const logout = useCallback(() => { setCurrentUser(null); setView('catalog'); }, []);

  const register = useCallback((data: Omit<User, 'id' | 'isAdmin'>) => {
    const newUser: User = { ...data, id: `u${Date.now()}`, isAdmin: false };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  }, []);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: `p${Date.now()}` }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { productId, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const createQuotation = useCallback((items: QuotationItem[], discount = 0, clientData?: QuotationClientData) => {
    if (!currentUser) return;
    const totalCotizado = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const subtotal = totalCotizado / 1.15;
    const iva = totalCotizado - subtotal;
    const finalTotal = totalCotizado - discount;
    const month = new Date().toISOString().slice(0, 7).replace('-', '');
    const num = String(quotations.length + 1).padStart(3, '0');

    const quoteClient = clientData ?? {
      clientName: currentUser.name,
      clientCedula: currentUser.cedula,
      clientAddress: currentUser.address,
      clientPhone: currentUser.phone,
      clientEmail: currentUser.email,
    };

    const newQuote: Quotation = {
      id: `q${Date.now()}`,
      number: `COT-${month}-${num}`,
      date: new Date().toISOString().slice(0, 10),
      clientId: clientData ? `physical-${Date.now()}` : currentUser.id,
      clientName: quoteClient.clientName,
      clientCedula: quoteClient.clientCedula,
      clientAddress: quoteClient.clientAddress,
      clientPhone: quoteClient.clientPhone,
      clientEmail: quoteClient.clientEmail,
      items, totalCotizado, subtotal, iva, discount, finalTotal,
      status: 'pending',
    };

    setQuotations(prev => [...prev, newQuote]);
    setSelectedQuotationId(newQuote.id);
    setNotifications(prev => [{
      id: `n${Date.now()}`,
      type: 'new-quote',
      message: `Nueva cotización de ${quoteClient.clientName} (#${newQuote.number})`,
      date: newQuote.date,
      read: false,
    }, ...prev]);

    clearCart();
    setView('quote-detail');
  }, [currentUser, quotations, clearCart]);

  const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider value={{
      view, setView, selectedQuotationId, setSelectedQuotationId,
      currentUser, users, login, requestLoginCode, verifyLoginCode, requestPasswordReset, logout, register,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartOpen, setCartOpen, authOpen, setAuthOpen,
      quotations, createQuotation, updateQuotation, deleteQuotation,
      notifications, markNotificationRead, clearNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}
