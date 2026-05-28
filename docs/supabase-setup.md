# Configuración Supabase para SURTIMAX

## 0. Instalar SDK oficial

La app usa el cliente oficial `@supabase/supabase-js` para Auth y para leer/escribir las tablas de la aplicación.

```bash
npm install @supabase/supabase-js
```

> Nota: el comando `npx shadcn@latest add @supabase/supabase-client-react-router` es opcional para proyectos que ya usan shadcn/React Router. SURTIMAX ya tiene su propio cliente en `src/app/lib/supabaseClient.ts`, por lo que no es obligatorio para que la base funcione.

## 1. Variables de entorno de la app web

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

## 3. Autenticación por correo en la app

El frontend ya llama a Supabase Auth con estos métodos:

- **Ingresar con código** usa `supabase.auth.signInWithOtp()`.
- **Registrarse** usa `supabase.auth.signInWithOtp()` con creación de usuario habilitada.
- **Verificar código** usa `supabase.auth.verifyOtp()`.
- **Recuperar contraseña** usa `supabase.auth.resetPasswordForEmail()`.

Para habilitarlo en el panel:

1. En Supabase, ve a **Authentication > Providers > Email**.
2. Activa el proveedor **Email** y permite OTP / magic link.
3. Activa recuperación de contraseña si vas a usar el botón **Olvidé mi contraseña**.
4. En **Authentication > URL Configuration**, agrega tu dominio de SURTIMAX en **Site URL** y en **Redirect URLs**.
5. Crea el usuario de autenticación `admin@surtimax.com` desde **Authentication > Users** solo si necesitas un admin inicial. El perfil de ese admin ya queda creado por `supabase/schema.sql` con `id = 'admin'`.

## 4. Hook de Supabase para enviar correos con Resend

Este es el paso equivalente al video: Supabase genera el código OTP / magic link y llama a una **Edge Function** HTTPS; esa función valida la firma del hook y envía un correo personalizado de SURTIMAX usando Resend.

### 4.1. Crear API key y dominio en Resend

1. Entra a **Resend > Domains** y verifica tu dominio, por ejemplo `surtimax.com`.
2. Entra a **Resend > API Keys** y crea una API key con permiso para enviar correos.
3. Define un remitente real, por ejemplo `SURTIMAX <no-reply@surtimax.com>`.

> Para pruebas puedes usar `onboarding@resend.dev`, pero en producción conviene usar un dominio verificado para que no llegue a spam.

### 4.2. Preparar secretos locales para la función

Copia el ejemplo de variables de la función:

```bash
cp supabase/functions/.env.example supabase/functions/.env
```

Llena `supabase/functions/.env` así:

```bash
RESEND_API_KEY=re_tu_api_key_de_resend
SEND_EMAIL_HOOK_SECRET=v1,whsec_el_secreto_que_te_da_supabase
SUPABASE_URL=https://naecqhkaggepagnymzww.supabase.co
APP_URL=https://tu-dominio-surtimax.com
AUTH_EMAIL_FROM="SURTIMAX <no-reply@tu-dominio.com>"
```

El valor `SEND_EMAIL_HOOK_SECRET` es el campo **Secreto** que ves al crear el hook en Supabase. Debe conservar el prefijo `v1,whsec_`.

### 4.3. Subir secretos a Supabase

Después de llenar el archivo anterior, ejecuta:

```bash
supabase secrets set --env-file supabase/functions/.env
```

Si todavía no vinculaste el proyecto local con Supabase, primero ejecuta:

```bash
supabase login
supabase link --project-ref naecqhkaggepagnymzww
```

### 4.4. Desplegar la Edge Function

La función ya está en `supabase/functions/send-email/index.ts` y usa la plantilla de correo en `supabase/functions/send-email/_templates/surtimax-auth-email.tsx`.

Despliega con JWT desactivado para que Supabase Auth pueda llamar el hook:

```bash
supabase functions deploy send-email --no-verify-jwt
```

Al terminar, Supabase mostrará una URL parecida a:

```text
https://naecqhkaggepagnymzww.functions.supabase.co/send-email
```

### 4.5. Llenar el hook en Supabase

En la pantalla de tu captura:

1. Ve a **Authentication > Hooks**.
2. En **Send Email / Enviar correo electrónico**, crea un hook nuevo.
3. Activa **Habilitar el gancho de envío de correo electrónico**.
4. En **Tipo gancho**, selecciona **HTTPS**.
5. En **URL**, pega la URL de la función desplegada:
   ```text
   https://naecqhkaggepagnymzww.functions.supabase.co/send-email
   ```
6. En **Secreto**, pulsa **Generar secreto** y copia ese valor en `supabase/functions/.env` como `SEND_EMAIL_HOOK_SECRET`.
7. Vuelve a ejecutar:
   ```bash
   supabase secrets set --env-file supabase/functions/.env
   supabase functions deploy send-email --no-verify-jwt
   ```
8. Guarda con **Crear gancho**.

### 4.6. Probar desde SURTIMAX

1. Abre la app.
2. En el modal de login, pulsa **Ingresar con código**.
3. Escribe un correo existente en Supabase Auth y pulsa **Enviar código al correo**.
4. Debe llegar un correo personalizado con marca SURTIMAX, botón de confirmación y código OTP.
5. Copia el código en la app y verifica el acceso.

Si no llega:

- Revisa **Supabase > Edge Functions > send-email > Logs**.
- Revisa **Resend > Logs**.
- Confirma que `AUTH_EMAIL_FROM` usa un dominio verificado.
- Confirma que el secreto del hook en Supabase es exactamente el mismo que `SEND_EMAIL_HOOK_SECRET`.

## 5. Imágenes de productos

La app permite cargar una foto al crear/editar productos. En esta etapa se guarda como URL/base64 en `products.image_url`; si deseas Storage real, crea un bucket `product-images` y guarda ahí las imágenes para usar su URL pública en ese campo.

## 6. Persistencia desde la app

El script SQL incluye políticas RLS de lectura/escritura y configuración Realtime para que la app pueda guardar productos, perfiles, cotizaciones, items y notificaciones usando la publishable key. Para producción, restringe estas políticas a usuarios autenticados/admin antes de publicar.

La sesión del usuario se maneja con Supabase Auth y la app conserva el usuario actual en `localStorage` hasta pulsar **Cerrar sesión**.
