const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

async function authRequest(path: string, body: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para usar autenticación por correo.');
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo completar la solicitud con Supabase.');
  }

  return response.json().catch(() => ({}));
}

export function requestEmailLoginCode(email: string) {
  return authRequest('otp', { email, create_user: false });
}

export async function verifyEmailLoginCode(email: string, token: string) {
  const result = await authRequest('verify', { email, token, type: 'email' });
  return result as { user?: { email?: string } };
}

export function requestPasswordRecovery(email: string) {
  return authRequest('recover', {
    email,
    redirect_to: `${window.location.origin}/`,
  });
}


async function restRequest<T>(table: string, query = 'select=*'): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para conectar la base de datos.');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo consultar Supabase.');
  }

  return response.json();
}

export interface SupabaseProductRow {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  presentation: string;
  units_per_pack: number;
  stock: number;
  available: boolean;
  image_url?: string | null;
}

export function fetchProductsFromSupabase() {
  return restRequest<SupabaseProductRow[]>('products', 'select=*&order=code.asc');
}
