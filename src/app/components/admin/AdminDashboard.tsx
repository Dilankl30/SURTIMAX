import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react';
import { useStore } from '../../store';
import { useIsMobile } from '../ui/use-mobile';

const MONTHLY = [
  { mes: 'Dic', ingresos: 3200, cotizaciones: 8 },
  { mes: 'Ene', ingresos: 4850, cotizaciones: 12 },
  { mes: 'Feb', ingresos: 5200, cotizaciones: 14 },
  { mes: 'Mar', ingresos: 4600, cotizaciones: 11 },
  { mes: 'Abr', ingresos: 6800, cotizaciones: 18 },
  { mes: 'May', ingresos: 7200, cotizaciones: 20 },
];

const DAILY = [
  { dia: 'Lun', ventas: 320 },
  { dia: 'Mar', ventas: 480 },
  { dia: 'Mié', ventas: 380 },
  { dia: 'Jue', ventas: 520 },
  { dia: 'Vie', ventas: 680 },
  { dia: 'Sáb', ventas: 420 },
  { dia: 'Dom', ventas: 180 },
];

const PIE_COLORS = ['#0D47A1', '#1976D2', '#42A5F5', '#90CAF9', '#7B1FA2', '#546E7A', '#43A047'];

export function AdminDashboard() {
  const { quotations, products, users } = useStore();
  const isMobile = useIsMobile();

  const totalRevenue = quotations.reduce((s, q) => s + q.finalTotal, 0);
  const delivered = quotations.filter(q => q.status === 'delivered').length;
  const pending = quotations.filter(q => q.status === 'pending').length;
  const clients = users.filter(u => !u.isAdmin).length;
  const lowStock = products.filter(p => p.stock <= 10);

  // Pie: category distribution
  const catMap: Record<string, number> = {};
  products.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Top products
  const freq: Record<string, number> = {};
  quotations.forEach(q => q.items.forEach(i => { freq[i.description] = (freq[i.description] || 0) + i.quantity; }));
  const topProducts = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, qty }));

  // Top clients
  const clientRev: Record<string, number> = {};
  quotations.forEach(q => { clientRev[q.clientName] = (clientRev[q.clientName] || 0) + q.finalTotal; });
  const topClients = Object.entries(clientRev).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, total]) => ({ name, total }));

  const KPIS = [
    { icon: <DollarSign size={22} />, label: 'Ingresos Totales', value: `$${totalRevenue.toFixed(2)}`, color: '#0D47A1', bg: '#E3F2FD', trend: '+12.5%' },
    { icon: <ShoppingBag size={22} />, label: 'Total Cotizaciones', value: quotations.length, color: '#7B1FA2', bg: '#F3E5F5', trend: `+${quotations.length}` },
    { icon: <CheckCircle size={22} />, label: 'Entregadas', value: delivered, color: '#2E7D32', bg: '#E8F5E9', trend: '' },
    { icon: <Clock size={22} />, label: 'Pendientes', value: pending, color: '#E65100', bg: '#FFF3E0', trend: '' },
    { icon: <Users size={22} />, label: 'Clientes', value: clients, color: '#1565C0', bg: '#E3F2FD', trend: '' },
    { icon: <AlertTriangle size={22} />, label: 'Stock Bajo', value: lowStock.length, color: '#C62828', bg: '#FFEBEE', trend: '' },
  ];

  return (
    <div style={{ padding: isMobile ? 12 : 24, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', color: '#0D47A1', fontWeight: 800 }}>Dashboard de Ventas</h1>
        <p style={{ color: '#78909C', margin: 0, fontSize: 14 }}>Análisis comercial · SURTIMAX · 2026</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color }}>
                {k.icon}
              </div>
              {k.trend && (
                <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 700, backgroundColor: '#E8F5E9', padding: '2px 8px', borderRadius: 20 }}>
                  {k.trend}
                </span>
              )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1A237E', marginBottom: 4, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#78909C' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Area chart + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2fr) minmax(280px, 1fr)', gap: isMobile ? 12 : 18, marginBottom: 18, alignItems: 'stretch' }}>
        <ChartCard title="📈 Ingresos Mensuales">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976D2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1976D2" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#78909C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78909C' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, 'Ingresos']} contentStyle={{ borderRadius: 10, border: '1px solid #E3F2FD', fontSize: 12 }} />
              <Area type="monotone" dataKey="ingresos" stroke="#1976D2" strokeWidth={2.5} fill="url(#gradIngresos)" dot={{ r: 4, fill: '#1976D2' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🗂️ Categorías">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={48} outerRadius={82} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Bar charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: isMobile ? 12 : 18, marginBottom: 18 }}>
        <ChartCard title="📅 Ventas por Día (Esta Semana)">
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={DAILY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#78909C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78909C' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v}`, 'Ventas']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="ventas" fill="#1976D2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📊 Cotizaciones por Mes">
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={MONTHLY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#78909C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78909C' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="cotizaciones" fill="#7B1FA2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Top tables */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: isMobile ? 12 : 18, marginBottom: 18 }}>
        <ChartCard title="🏆 Productos Más Cotizados">
          <TableScroll>
            <table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E3F2FD' }}>
                <th style={rankTh}>#</th>
                <th style={{ ...rankTh, textAlign: 'left' }}>Producto</th>
                <th style={rankTh}>Und. Cotizadas</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '20px 0', textAlign: 'center', color: '#90A4AE', fontSize: 12 }}>Sin datos aún</td></tr>
              ) : topProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ ...rankTh, padding: '9px 8px' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: i === 0 ? '#FFF9C4' : '#E3F2FD', color: i === 0 ? '#F57F17' : '#1976D2', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: '9px 8px', fontWeight: 500, color: '#1A237E' }}>{p.name}</td>
                  <td style={{ ...rankTh, fontWeight: 700, color: '#0D47A1', padding: '9px 8px' }}>{p.qty} u</td>
                </tr>
              ))}
            </tbody>
            </table>
          </TableScroll>
        </ChartCard>

        <ChartCard title="👑 Top Clientes por Monto">
          <TableScroll>
            <table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E3F2FD' }}>
                <th style={rankTh}>#</th>
                <th style={{ ...rankTh, textAlign: 'left' }}>Cliente</th>
                <th style={rankTh}>Total</th>
              </tr>
            </thead>
            <tbody>
              {topClients.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '20px 0', textAlign: 'center', color: '#90A4AE', fontSize: 12 }}>Sin datos aún</td></tr>
              ) : topClients.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ ...rankTh, padding: '9px 8px' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: i === 0 ? '#FCE4EC' : '#F3E5F5', color: i === 0 ? '#AD1457' : '#7B1FA2', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: '9px 8px', fontWeight: 500, color: '#1A237E' }}>{c.name.split(' ').slice(0, 2).join(' ')}</td>
                  <td style={{ ...rankTh, fontWeight: 700, color: '#7B1FA2', padding: '9px 8px' }}>${c.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </TableScroll>
        </ChartCard>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#C62828', fontWeight: 700, fontSize: 14 }}>
            <AlertTriangle size={18} /> Alertas de Stock Bajo ({lowStock.length} productos)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lowStock.map(p => (
              <span key={p.id} style={{ backgroundColor: 'white', border: '1px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>
                ⚠️ {p.name} — {p.stock} u
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, padding: isMobile ? '14px 12px' : '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minWidth: 0, overflow: 'hidden' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1A237E' }}>{title}</h3>
      {children}
    </div>
  );
}

function TableScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
      {children}
    </div>
  );
}

const rankTh: React.CSSProperties = { padding: '9px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#78909C', whiteSpace: 'nowrap' };
