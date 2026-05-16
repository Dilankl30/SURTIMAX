import type { Product, Quotation, QuotationItem, User } from '../store';

const DEFAULT_SUPABASE_URL = 'https://naecqhkaggepagnymzww.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Mv04ClO1Q5Gjm83laJUhng_Pt_l6vEF';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL) as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
) as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

function assertSupabaseConfigured(message: string) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error(message);
}

async function authRequest(path: string, body: Record<string, unknown>) {
  assertSupabaseConfigured('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para usar autenticación por correo.');

  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY!,
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

async function restRequest<T>(table: string, query = 'select=*', init: RequestInit = {}): Promise<T> {
  assertSupabaseConfigured('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para conectar la base de datos.');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY!,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo consultar Supabase.');
  }

  return response.json().catch(() => ({} as T));
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

interface SupabaseProfileRow {
  id: string;
  name: string;
  cedula: string;
  address: string;
  phone: string;
  email: string;
  is_admin: boolean;
}

interface SupabaseQuotationRow {
  id: string;
  number: string;
  date: string;
  client_id: string;
  client_name: string;
  client_cedula: string;
  client_address: string;
  client_phone: string;
  client_email?: string | null;
  total_cotizado: number;
  subtotal: number;
  iva: number;
  discount: number;
  final_total: number;
  status: 'pending' | 'delivered';
}

interface SupabaseQuotationItemRow {
  quotation_id: string;
  code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

const productToRow = (product: Product): SupabaseProductRow => ({
  id: product.id,
  code: product.code,
  name: product.name,
  category: product.category,
  price: product.price,
  presentation: product.presentation,
  units_per_pack: product.unitsPerPack,
  stock: product.stock,
  available: product.available,
  image_url: product.imageUrl || null,
});

export const productFromRow = (row: SupabaseProductRow): Product => ({
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
});

const profileToRow = (user: User): SupabaseProfileRow => ({
  id: user.id,
  name: user.name,
  cedula: user.cedula,
  address: user.address,
  phone: user.phone,
  email: user.email,
  is_admin: user.isAdmin,
});

export const profileFromRow = (row: SupabaseProfileRow): User => ({
  id: row.id,
  name: row.name,
  cedula: row.cedula,
  address: row.address,
  phone: row.phone,
  email: row.email,
  password: '',
  isAdmin: row.is_admin,
});

const quotationToRow = (quotation: Quotation): SupabaseQuotationRow => ({
  id: quotation.id,
  number: quotation.number,
  date: quotation.date,
  client_id: quotation.clientId,
  client_name: quotation.clientName,
  client_cedula: quotation.clientCedula,
  client_address: quotation.clientAddress,
  client_phone: quotation.clientPhone,
  client_email: quotation.clientEmail || null,
  total_cotizado: quotation.totalCotizado,
  subtotal: quotation.subtotal,
  iva: quotation.iva,
  discount: quotation.discount,
  final_total: quotation.finalTotal,
  status: quotation.status,
});

const quotationFromRow = (row: SupabaseQuotationRow, items: QuotationItem[]): Quotation => ({
  id: row.id,
  number: row.number,
  date: row.date,
  clientId: row.client_id,
  clientName: row.client_name,
  clientCedula: row.client_cedula,
  clientAddress: row.client_address,
  clientPhone: row.client_phone,
  clientEmail: row.client_email ?? '',
  items,
  totalCotizado: Number(row.total_cotizado),
  subtotal: Number(row.subtotal),
  iva: Number(row.iva),
  discount: Number(row.discount),
  finalTotal: Number(row.final_total),
  status: row.status,
});

const quotationItemToRow = (quotationId: string, item: QuotationItem): SupabaseQuotationItemRow => ({
  quotation_id: quotationId,
  code: item.code,
  description: item.description,
  quantity: item.quantity,
  unit_price: item.unitPrice,
});

const quotationItemFromRow = (row: SupabaseQuotationItemRow): QuotationItem => ({
  code: row.code,
  description: row.description,
  quantity: row.quantity,
  unitPrice: Number(row.unit_price),
});

export function fetchProductsFromSupabase() {
  return restRequest<SupabaseProductRow[]>('products', 'select=*&order=code.asc');
}

export function saveProductToSupabase(product: Product) {
  return restRequest<SupabaseProductRow[]>('products', 'on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(productToRow(product)),
  });
}

export function updateProductInSupabase(id: string, updates: Partial<Product>) {
  return restRequest<SupabaseProductRow[]>('products', `id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(productToRow({
      id,
      code: updates.code ?? '',
      name: updates.name ?? '',
      category: updates.category ?? '',
      price: updates.price ?? 0,
      presentation: updates.presentation ?? '',
      unitsPerPack: updates.unitsPerPack ?? 0,
      stock: updates.stock ?? 0,
      available: updates.available ?? true,
      imageUrl: updates.imageUrl,
    })),
  });
}

export function deleteProductFromSupabase(id: string) {
  return restRequest<unknown>('products', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchProfilesFromSupabase() {
  return restRequest<SupabaseProfileRow[]>('profiles', 'select=*&order=created_at.asc');
}

export function saveProfileToSupabase(user: User) {
  return restRequest<SupabaseProfileRow[]>('profiles', 'on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(profileToRow(user)),
  });
}

export async function fetchQuotationsFromSupabase() {
  const [quotes, items] = await Promise.all([
    restRequest<SupabaseQuotationRow[]>('quotations', 'select=*&order=created_at.desc'),
    restRequest<SupabaseQuotationItemRow[]>('quotation_items', 'select=*'),
  ]);
  return quotes.map(quote => quotationFromRow(quote, items.filter(item => item.quotation_id === quote.id).map(quotationItemFromRow)));
}

export async function saveQuotationToSupabase(quotation: Quotation) {
  await restRequest<SupabaseQuotationRow[]>('quotations', 'on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(quotationToRow(quotation)),
  });
  await restRequest<unknown>('quotation_items', `quotation_id=eq.${encodeURIComponent(quotation.id)}`, { method: 'DELETE' });
  if (quotation.items.length > 0) {
    await restRequest<SupabaseQuotationItemRow[]>('quotation_items', '', {
      method: 'POST',
      body: JSON.stringify(quotation.items.map(item => quotationItemToRow(quotation.id, item))),
    });
  }
}

export function updateQuotationInSupabase(id: string, updates: Partial<Quotation>) {
  const row: Partial<SupabaseQuotationRow> = {};
  if (updates.clientName !== undefined) row.client_name = updates.clientName;
  if (updates.clientCedula !== undefined) row.client_cedula = updates.clientCedula;
  if (updates.clientAddress !== undefined) row.client_address = updates.clientAddress;
  if (updates.clientPhone !== undefined) row.client_phone = updates.clientPhone;
  if (updates.clientEmail !== undefined) row.client_email = updates.clientEmail;
  if (updates.discount !== undefined) row.discount = updates.discount;
  if (updates.finalTotal !== undefined) row.final_total = updates.finalTotal;
  if (updates.status !== undefined) row.status = updates.status;
  return restRequest<SupabaseQuotationRow[]>('quotations', `id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(row),
  });
}

export function deleteQuotationFromSupabase(id: string) {
  return restRequest<unknown>('quotations', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}
