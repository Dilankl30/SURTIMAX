# Configuración Supabase para SURTIMAX

## 1. Crear proyecto y variables
1. Crea un proyecto en Supabase.
2. Copia `Project URL` y `anon public key`.
3. Crea un archivo `.env.local` en la raíz con:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## 2. Crear base limpia
1. Abre **SQL Editor** en Supabase.
2. Ejecuta `supabase/schema.sql`.
3. Ese script deja la base limpia: conserva el administrador inicial y el catálogo de productos; cotizaciones, items y notificaciones quedan vacíos.

## 3. Seguridad por correo y recuperación
1. En Supabase, ve a **Authentication > Providers > Email**.
2. Activa email OTP / magic link y recuperación de contraseña.
3. Crea el usuario de autenticación `admin@surtimax.com` desde **Authentication > Users**.
4. Asigna la contraseña temporal que quieras y luego usa recuperación por correo para cambiarla.

## 4. Imágenes de productos
La app ya permite cargar una foto al crear/editar productos. En esta etapa se guarda como URL/base64 en `image_url`; si deseas Storage real, crea un bucket `product-images` y guarda ahí las imágenes para usar su URL pública en ese campo.
