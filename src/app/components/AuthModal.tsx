import { useState } from 'react';
import { X, User, Lock, Phone, MapPin, CreditCard, Mail } from 'lucide-react';
import { useStore } from '../store';

export function AuthModal() {
  const { authOpen, setAuthOpen, login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  if (!authOpen) return null;

  const switchMode = (m: 'login' | 'register') => { setMode(m); setError(''); };

  const handleLogin = () => {
    if (!loginEmail || !loginPass) { setError('Completa todos los campos'); return; }
    const ok = login(loginEmail, loginPass);
    if (ok) { setAuthOpen(false); setError(''); }
    else setError('Correo o contraseña incorrectos');
  };

  const handleRegister = () => {
    if (!regName || !regCedula || !regAddress || !regPhone || !regEmail || !regPass) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    if (regPass.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
    register({ name: regName, cedula: regCedula, address: regAddress, phone: regPhone, email: regEmail, password: regPass });
    setAuthOpen(false);
    setError('');
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 300, backdropFilter: 'blur(2px)' }} onClick={() => setAuthOpen(false)} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'white', borderRadius: 20, width: 440, maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', zIndex: 301, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0D47A1, #1976D2)', padding: '28px 24px', color: 'white', textAlign: 'center', position: 'relative' }}>
          <button onClick={() => setAuthOpen(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: 7, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <X size={17} />
          </button>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h2 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 20 }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>
            {mode === 'login' ? 'Accede a tu cuenta SURTIMAX' : 'Regístrate para cotizar productos'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #F0F4F8' }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{ flex: 1, padding: '13px', border: 'none', cursor: 'pointer', background: 'transparent', borderBottom: mode === m ? '3px solid #0D47A1' : '3px solid transparent', color: mode === m ? '#0D47A1' : '#90A4AE', fontWeight: mode === m ? 700 : 400, fontSize: 14, marginBottom: -2 }}
            >
              {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          {mode === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Correo electrónico" icon={<Mail size={15} />}>
                <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com" style={inp} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </Field>
              <Field label="Contraseña" icon={<Lock size={15} />}>
                <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" placeholder="••••••••" style={inp} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </Field>

              <div style={{ backgroundColor: '#E3F2FD', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#1565C0', lineHeight: 1.7, border: '1px solid #BBDEFB' }}>
                <strong>Demo usuario:</strong> juan@example.com / demo123<br />
                <strong>Demo admin:</strong> admin@surtimax.com / admin123
              </div>

              <button onClick={handleLogin} style={btn}>Ingresar a mi cuenta →</button>

              <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: '#1976D2', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
                ¿No tienes cuenta? Regístrate gratis
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nombre completo *" icon={<User size={15} />}>
                <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Juan Carlos Pérez" style={inp} />
              </Field>
              <Field label="Cédula / RUC *" icon={<CreditCard size={15} />}>
                <input value={regCedula} onChange={e => setRegCedula(e.target.value)} placeholder="1712345678" style={inp} />
              </Field>
              <Field label="Dirección *" icon={<MapPin size={15} />}>
                <input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Av. 10 de Agosto 123, Quito" style={inp} />
              </Field>
              <Field label="Teléfono *" icon={<Phone size={15} />}>
                <input value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="0991234567" style={inp} />
              </Field>
              <Field label="Correo electrónico *" icon={<Mail size={15} />}>
                <input value={regEmail} onChange={e => setRegEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com" style={inp} />
              </Field>
              <Field label="Contraseña *" icon={<Lock size={15} />}>
                <input value={regPass} onChange={e => setRegPass(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" style={inp} />
              </Field>

              <button onClick={handleRegister} style={btn}>Crear Cuenta Gratis →</button>
              <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: '#1976D2', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#455A64', textTransform: 'uppercase', letterSpacing: 0.3 }}>
        <span style={{ color: '#1976D2' }}>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 12px', border: '2px solid #E3F2FD', borderRadius: 8,
  fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
};

const btn: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg, #0D47A1, #1976D2)',
  color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 15,
  boxShadow: '0 4px 16px rgba(13,71,161,0.3)', marginTop: 4,
};
