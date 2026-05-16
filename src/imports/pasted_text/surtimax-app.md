**PROMPT PROFESIONAL PARA FIGMA (React + Vercel + Sistema Web de Cotizaciones SURTIMAX)**

Diseña y genera una aplicación web profesional, moderna, elegante y completamente funcional en **React.js**, optimizada para ser desplegada en **Vercel**, para una distribuidora de productos llamada **SURTIMAX**.

El diseño debe ser atractivo, corporativo, limpio, intuitivo, rápido y enfocado en ventas, cotizaciones y administración comercial.

El logo principal de la aplicación será el logo de **SURTIMAX** (usar el logo proporcionado por el usuario).

La aplicación debe tener 2 roles principales:

1. **Cliente / Usuario**
2. **Administrador**

La aplicación debe tener diseño responsive (PC, tablet y móvil), excelente UX/UI y estructura profesional tipo sistema empresarial.

---

# MÓDULO CLIENTE / USUARIO

## Catálogo de Productos

Cualquier usuario puede ingresar y visualizar:

* Productos disponibles
* Imagen del producto
* Nombre del producto
* Código del producto
* Precio
* Presentación
* Unidades por paca
* Disponibilidad
* Botón “Agregar al carrito”

Debe existir:

* Barra de búsqueda por nombre
* Búsqueda por código
* Filtros por categorías
* Vista moderna tipo eCommerce profesional

---

## Registro e Inicio de Sesión

Los usuarios pueden ver productos sin registrarse, PERO:

### Para cotizar es obligatorio registrarse

Campos de registro:

* Nombre completo
* Cédula / RUC
* Dirección
* Teléfono
* Correo electrónico
* Contraseña

Importante:

La primera vez que cotizan deben llenar todos los datos.

Luego, en futuras cotizaciones:

### Los datos deben autocompletarse automáticamente

---

## Carrito de Cotización

El usuario puede:

* Agregar productos
* Modificar cantidades
* Eliminar productos
* Ver total parcial
* Confirmar cotización

Diseño moderno tipo carrito de compras profesional.

---

## Sistema de Cotización

Cuando el usuario confirme la cotización:

Debe generarse automáticamente una cotización con EXACTAMENTE este formato profesional basado en el PDF proporcionado:

### Formato requerido:

* Logo SURTIMAX
* Dirección: Quito
* RUC: 2200123456001
* Teléfono: 0989961041
* Email: [ventas@surtimax.com](mailto:ventas@surtimax.com)

### Datos del cliente:

* Nombre / Razón Social
* R.U.C. / C.I.
* Dirección
* Teléfono

### Tabla de cotización:

Columnas:

* Código
* Cantidad
* Descripción del ítem
* Precio Unitario
* Subtotal

### Sección financiera:

Debe calcular:

### TOTAL COTIZADO

Este valor será:

### suma total de todos los productos (porque ya incluyen IVA)

### SUBTOTAL

Debe calcularse así:

### Subtotal = Total / 1.15

(es decir quitar el IVA del 15%)

### IVA 15%

Debe calcularse:

### IVA = Total - Subtotal

### DESCUENTO

Campo editable por administrador

### TOTAL FINAL

Total real cotizado

Todo debe verse exactamente profesional como una cotización empresarial real.

---

## Acciones de la Cotización

El usuario podrá:

* Ver sus cotizaciones realizadas
* Editar cotización
* Eliminar cotización
* Descargar PDF
* Imprimir cotización
* Enviar cotización por WhatsApp

---

## WhatsApp Automático

Cuando se genera una cotización:

Debe existir opción para enviar automáticamente la cotización al WhatsApp del cliente usando su número registrado.

Número emisor de referencia:

### 0989961041

Además:

Debe existir un botón de:

### “Contactar por WhatsApp”

para comunicarse directamente con administración.

---

# MÓDULO ADMINISTRADOR

Debe existir login exclusivo de administrador.

Dashboard administrativo profesional estilo ERP/CRM.

---

# Gestión de Productos

El administrador puede:

## Registrar productos

Campos:

* Código del producto
* Nombre del producto
* Precio
* Presentación
* Unidades por paca
* Stock
* Imagen del producto

Opciones:

* Subir imagen
* Tomar foto desde cámara
* Editar producto
* Eliminar producto
* Confirmar registro

---

## Visualización de productos

El admin puede:

* Ver todos los productos
* Buscar por código
* Buscar por nombre
* Editar rápidamente
* Controlar inventario

---

# Gestión de Cotizaciones

El administrador puede:

* Ver todas las cotizaciones
* Editarlas
* Eliminarlas
* Imprimirlas
* Marcar como:

### Entregado

### Pendiente por entregar

* Registrar cotizaciones manualmente

Debe poder visualizar:

* Historial de cotizaciones
* Estado de cotizaciones
* Cliente que cotizó
* Fecha
* Total

---

# Dashboard Inteligente de Ventas

Crear dashboard analítico avanzado con:

* Ventas realizadas
* Cotizaciones entregadas
* Cotizaciones pendientes
* Productos más vendidos
* Productos menos vendidos
* Días con más ventas
* Ingresos por día
* Ingresos por semana
* Ingresos por mes
* Top clientes
* Reportes gráficos
* Indicadores KPI
* Análisis comercial profesional

Diseño tipo Power BI + ERP moderno.

---

# Notificaciones

Sistema de notificaciones para:

* Nueva cotización creada
* Pedido pendiente
* Cotización entregada
* Contacto vía WhatsApp
* Alertas de stock bajo

---

# PRODUCTOS INICIALES A CARGAR

Cargar automáticamente estos productos iniciales:

(usar todos los productos proporcionados por el usuario)

Ejemplo:

* MENTA GLACIAL
* KAUMAL MANZANILLA Y MIEL
* KAUMAL ORIGINAL
* KAUMAL JENGIBRE
* LECHE Y MIEL
* BARRILETE
* MANGO BICHE
* BOLA DE FUEGO
* KOLITA LOKA
* GELATINAS PEQUEÑA
* GELATINAS GRANDE
* MANICHO BOMBÓN
* etc...

(con toda la lista completa)

---

# TECNOLOGÍAS REQUERIDAS

Usar:

* React.js
* Next.js (preferible)
* Tailwind CSS
* Firebase o Supabase
* PostgreSQL si aplica
* Vercel Ready
* PDF Generator
* WhatsApp Integration
* Dashboard Charts
* Responsive Design
* Clean Architecture
* Código profesional escalable

---

# ESTILO VISUAL

Quiero:

* Diseño premium
* Profesional
* Moderno
* Elegante
* Comercial
* Corporativo
* Creativo
* Excelente UX/UI
* Interfaz intuitiva
* Animaciones suaves
* Colores corporativos azul/blanco/gris
* Estilo empresarial de alto nivel

Debe parecer un sistema real de empresa grande.

NO quiero algo básico.

QUIERO algo de nivel profesional alto.

Debe verse impresionante visualmente.

---
