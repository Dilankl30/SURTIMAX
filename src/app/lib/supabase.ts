import type { AppNotification, Product, Quotation, QuotationItem, User } from '../store';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export { isSupabaseConfigured } from './supabaseClient';

function throwIfSupabaseError(error: { message?: string } | null) {
  if (error) throw new Error(error.message || 'No se pudo completar la operación con Supabase.');
}

export async function requestEmailLoginCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  throwIfSupabaseError(error);
}


export async function requestEmailRegistrationCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  throwIfSupabaseError(error);
}

export async function verifyEmailLoginCode(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  throwIfSupabaseError(error);
  return data as { user?: { email?: string } };
}

export async function verifyEmailRegistrationCode(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  throwIfSupabaseError(error);
  return data as { user?: { email?: string } };
}

export async function requestPasswordRecovery(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
  throwIfSupabaseError(error);
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

interface SupabaseNotificationRow {
  id: string;
  type: AppNotification['type'];
  message: string;
  date: string;
  read: boolean;
  quotation_id?: string | null;
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

const notificationToRow = (notification: AppNotification): SupabaseNotificationRow => ({
  id: notification.id,
  type: notification.type,
  message: notification.message,
  date: notification.date,
  read: notification.read,
  quotation_id: notification.quotationId ?? null,
});

const notificationFromRow = (row: SupabaseNotificationRow): AppNotification => ({
  id: row.id,
  type: row.type,
  message: row.message,
  date: row.date,
  read: row.read,
  quotationId: row.quotation_id ?? undefined,
});

export async function fetchProductsFromSupabase() {
  const { data, error } = await supabase.from('products').select('*').order('code', { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []) as SupabaseProductRow[];
}

export async function saveProductToSupabase(product: Product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(productToRow(product), { onConflict: 'id' })
    .select();
  throwIfSupabaseError(error);
  return (data ?? []) as SupabaseProductRow[];
}

export async function deleteProductFromSupabase(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  throwIfSupabaseError(error);
}

export async function fetchProfilesFromSupabase() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []) as SupabaseProfileRow[];
}

export async function saveProfileToSupabase(user: User) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToRow(user), { onConflict: 'email' })
    .select();
  throwIfSupabaseError(error);
  return (data ?? []) as SupabaseProfileRow[];
}

export async function fetchQuotationsFromSupabase() {
  const [{ data: quotes, error: quotesError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('quotations').select('*').order('created_at', { ascending: false }),
    supabase.from('quotation_items').select('*'),
  ]);
  throwIfSupabaseError(quotesError);
  throwIfSupabaseError(itemsError);
  const quoteRows = (quotes ?? []) as SupabaseQuotationRow[];
  const itemRows = (items ?? []) as SupabaseQuotationItemRow[];
  return quoteRows.map(quote => quotationFromRow(
    quote,
    itemRows.filter(item => item.quotation_id === quote.id).map(quotationItemFromRow),
  ));
}

export async function fetchQuotationFromSupabase(id: string) {
  const [{ data: quotes, error: quoteError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', id).maybeSingle(),
    supabase.from('quotation_items').select('*').eq('quotation_id', id),
  ]);
  throwIfSupabaseError(quoteError);
  throwIfSupabaseError(itemsError);
  if (!quotes) return null;
  return quotationFromRow(
    quotes as SupabaseQuotationRow,
    ((items ?? []) as SupabaseQuotationItemRow[]).map(quotationItemFromRow),
  );
}

export async function saveQuotationToSupabase(quotation: Quotation) {
  const { error: quoteError } = await supabase
    .from('quotations')
    .upsert(quotationToRow(quotation), { onConflict: 'id' })
    .select();
  throwIfSupabaseError(quoteError);

  const { error: deleteError } = await supabase
    .from('quotation_items')
    .delete()
    .eq('quotation_id', quotation.id);
  throwIfSupabaseError(deleteError);

  if (quotation.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(quotation.items.map(item => quotationItemToRow(quotation.id, item)));
    throwIfSupabaseError(itemsError);
  }
}

export async function updateQuotationInSupabase(id: string, updates: Partial<Quotation>) {
  const row: Partial<SupabaseQuotationRow> = {};
  if (updates.clientName !== undefined) row.client_name = updates.clientName;
  if (updates.clientCedula !== undefined) row.client_cedula = updates.clientCedula;
  if (updates.clientAddress !== undefined) row.client_address = updates.clientAddress;
  if (updates.clientPhone !== undefined) row.client_phone = updates.clientPhone;
  if (updates.clientEmail !== undefined) row.client_email = updates.clientEmail;
  if (updates.discount !== undefined) row.discount = updates.discount;
  if (updates.finalTotal !== undefined) row.final_total = updates.finalTotal;
  if (updates.status !== undefined) row.status = updates.status;

  const { data, error } = await supabase.from('quotations').update(row).eq('id', id).select();
  throwIfSupabaseError(error);
  return (data ?? []) as SupabaseQuotationRow[];
}

export async function deleteQuotationFromSupabase(id: string) {
  const { error } = await supabase.from('quotations').delete().eq('id', id);
  throwIfSupabaseError(error);
}

export async function fetchNotificationsFromSupabase() {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  throwIfSupabaseError(error);
  return ((data ?? []) as SupabaseNotificationRow[]).map(notificationFromRow);
}

export async function saveNotificationToSupabase(notification: AppNotification) {
  const { data, error } = await supabase
    .from('notifications')
    .upsert(notificationToRow(notification), { onConflict: 'id' })
    .select();
  throwIfSupabaseError(error);
  return ((data ?? []) as SupabaseNotificationRow[]).map(notificationFromRow);
}

export async function markNotificationReadInSupabase(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select();
  throwIfSupabaseError(error);
  return ((data ?? []) as SupabaseNotificationRow[]).map(notificationFromRow);
}

export async function markAllNotificationsReadInSupabase() {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)
    .select();
  throwIfSupabaseError(error);
  return ((data ?? []) as SupabaseNotificationRow[]).map(notificationFromRow);
}

export function subscribeToNotificationsFromSupabase(onNotification: (notification: AppNotification) => void) {
  const channel = supabase
    .channel('surtimax-admin-notifications')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      (payload: { new: unknown }) => {
        const row = payload.new as SupabaseNotificationRow | null;
        if (row) onNotification(notificationFromRow(row));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
