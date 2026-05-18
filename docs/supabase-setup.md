# Configuración Supabase para SURTIMAX

## 0. Instalar SDK oficial

La app usa el cliente oficial `@supabase/supabase-js` para Auth y para leer/escribir las tablas de la aplicación.

```bash
npm install @supabase/supabase-js
```

> Nota: el comando `npx shadcn@latest add @supabase/supabase-client-react-router` es opcional para proyectos que ya usan shadcn/React Router. SURTIMAX ya tiene su propio cliente en `src/app/lib/supabaseClient.ts`, por lo que no es obligatorio para que la base funcione.

## 1. Variables de entorno

Crea un archivo `.env.local` en la raíz con los valores que entregó Supabase:

```bash
VITE_SUPABASE_URL=https://naecqhkaggepagnymzww.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Mv04ClO1Q5Gjm83laJUhng_Pt_l6vEF
```

También puedes copiar `.env.example` y reemplazar los valores si cambias de proyecto.

## 2. Crear base limpia adaptada a la app

1. Abre **SQL Editor** en Supabase.
2. Ejecuta completo el archivo `supabase/schema.sql`.
3. El script recrea las tablas con los nombres y tipos que usa la app: `profiles`, `products`, `quotations`, `quotation_items` y `notifications`.
4. La tabla `notifications` queda vinculada a `quotations` por `quotation_id` y se agrega a la publicación `supabase_realtime` para que el administrador reciba avisos sin recargar la página.
5. La base queda limpia: conserva el administrador inicial y el catálogo; cotizaciones, items y notificaciones empiezan en cero.

## 3. Autenticación por correo y recuperación

1. En Supabase, ve a **Authentication > Providers > Email**.
2. Activa email OTP / magic link y recuperación de contraseña.
3. Crea el usuario de autenticación `admin@surtimax.com` desde **Authentication > Users**.
4. El perfil de ese admin ya queda creado por `supabase/schema.sql` con `id = 'admin'`, el mismo identificador que usa la app local.

## 4. Imágenes de productos

La app permite cargar una foto al crear/editar productos. En esta etapa se guarda como URL/base64 en `products.image_url`; si deseas Storage real, crea un bucket `product-images` y guarda ahí las imágenes para usar su URL pública en ese campo.

## 5. Persistencia desde la app

El script SQL incluye políticas RLS de lectura/escritura y configuración Realtime para que la app pueda guardar productos, perfiles, cotizaciones, items y notificaciones usando la publishable key. Para producción, restringe estas políticas a usuarios autenticados/admin antes de publicar.

La sesión del usuario se maneja con Supabase Auth y la app conserva el usuario actual en `localStorage` hasta pulsar **Cerrar sesión**.
