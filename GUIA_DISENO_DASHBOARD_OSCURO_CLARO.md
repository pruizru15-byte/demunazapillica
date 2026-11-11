# Sistema de diseño UI — Dashboard analítico oscuro y claro

> **Referencia visual:** captura de un dashboard multipanel con barra lateral, tarjetas analíticas, gráficos, indicadores circulares y acentos neón discretos.  
> **Objetivo:** documentar cómo recrear **el lenguaje visual** de la interfaz —no copiar una marca o un producto concreto— y aplicarlo de manera consistente en un sistema web.  
> **Precisión:** los colores del tema oscuro son **aproximaciones obtenidas de la imagen suministrada**, que está comprimida y tiene resolución reducida (728 × 408 px). El tema claro es una **adaptación propuesta**, no un tema claro visible en la referencia. Los valores se pueden ajustar con capturas de mayor resolución.

---

## 1. Identidad visual y modelo de la interfaz

| Aspecto | Especificación |
|---|---|
| Categoría | Dashboard web, panel administrativo / analítico tipo SaaS |
| Enfoque | **Dark-first**, con tema claro equivalente |
| Estilo | **Dark Tech / Modern SaaS Dashboard**, minimalismo tecnológico con acentos luminosos |
| Composición | Sidebar fija + barra superior + cuadrícula de tarjetas modulares |
| Personalidad | Profesional, moderna, técnica, concentrada en los datos |
| Geometría | Tarjetas rectangulares de esquinas suavemente redondeadas, bordes finos |
| Profundidad | Superficies por niveles, sombras suaves, gradientes puntuales y halos muy discretos |
| Gráficos | Línea/área, dona circular, barras pequeñas y KPI compactos |
| Iconografía | Trazo lineal uniforme, ligera, sin mezcla de estilos |
| Principio central | **Jerarquía por contraste y espaciado**, no por exceso de adornos |

### Qué se aprecia en la referencia

- **Sidebar izquierda** muy oscura, con navegación agrupada, iconos pequeños y estado activo.
- **Zona de trabajo** azul marino/índigo, sensiblemente más clara que la barra lateral.
- **Header compacto** con secciones, pequeños controles y una acción destacada de color dorado.
- **Módulos en tarjetas**: gráfico principal, progreso circular, tabla/listado, datos rápidos y actividad reciente.
- **Acentos diferenciados por función**: violeta para identidad y acciones, azul para información, dorado para métricas importantes, verde/rojo para estados.
- **Gráficos con gradiente controlado**: las líneas pueden iluminarse, pero los textos y controles conservan un aspecto sobrio.

> No se recomienda imitar el texto extremadamente pequeño de la captura: en una implementación real, la legibilidad debe prevalecer sobre la fidelidad a la miniatura.

---

## 2. Paleta de color — Tema oscuro

### 2.1. Colores estructurales

| Token semántico | HEX | Uso recomendado |
|---|---|---|
| `--bg-canvas` | `#1D1E3A` | Fondo exterior o canvas general |
| `--bg-app` | `#15132A` | Zona central del dashboard |
| `--bg-sidebar` | `#0C0D22` | Barra de navegación izquierda |
| `--bg-card` | `#191731` | Fondo principal de las tarjetas |
| `--bg-card-raised` | `#211F3D` | Tarjeta elevada, subpanel, tooltip |
| `--bg-hover` | `#292546` | Hover de elementos y filas |
| `--bg-active` | `#35245D` | Opción o pestaña activa |
| `--border` | `#373351` | Bordes sutiles entre superficies |
| `--border-strong` | `#4B4269` | Bordes de controles resaltados |
| `--text-primary` | `#F5F4FF` | Titulares, cifras, etiquetas importantes |
| `--text-secondary` | `#B8B4D0` | Descripciones y labels secundarios |
| `--text-muted` | `#918CA9` | Metadatos, ayudantes y ejes |

**Jerarquía sugerida:** sidebar (`#0C0D22`) → aplicación (`#15132A`) → tarjeta (`#191731`) → tarjeta elevada (`#211F3D`). Evitar usar un único negro para todos los niveles.

### 2.2. Colores de acento y datos

| Token | HEX | Función |
|---|---|---|
| `--primary` | `#6C3AED` | Acción primaria, enlaces seleccionados, marca |
| `--primary-hover` | `#814EFF` | Hover/énfasis del violeta |
| `--primary-soft` | `#35245D` | Fondo de chips violeta |
| `--secondary` | `#2FAAF7` | Información, puntos de gráfico, métricas |
| `--cyan` | `#36D9E9` | Segmentos y series secundarias |
| `--accent-gold` | `#FFC36C` | CTA dorado / KPI destacado |
| `--accent-orange` | `#F6A14D` | Serie de gráfico o advertencia suave |
| `--accent-pink` | `#F16AA3` | Serie complementaria |
| `--success` | `#38D7A7` | Estado correcto, mejora |
| `--warning` | `#FFC36C` | Atención / prevención |
| `--danger` | `#F47791` | Error, descenso, estado crítico |
| `--info` | `#43B4FF` | Notificación informativa |

**Referencia visual más cercana:** la imagen concentra grandes masas de azul marino/índigo (`#0C0D22`, `#15132A`, `#1D1E3A`) y pequeños focos de violeta intenso (aprox. `#6020F0`–`#7030F0`) y dorado (aprox. `#F0C060`–`#FFC36C`).

### 2.3. Gradientes del tema oscuro

```css
/* CTA violeta: reservar para 1 o 2 acciones destacadas por pantalla */
background: linear-gradient(135deg, #814EFF 0%, #6C3AED 55%, #5228B8 100%);

/* Área del gráfico, aplicada con poca opacidad */
background: linear-gradient(180deg, rgb(108 58 237 / 28%) 0%, rgb(108 58 237 / 0%) 100%);

/* Línea analítica azul-violeta */
background: linear-gradient(90deg, #2FAAF7 0%, #814EFF 100%);

/* Gráfico cálido: línea amarilla/naranja */
background: linear-gradient(90deg, #FFC36C 0%, #F6A14D 100%);
```

**Regla de uso:** el gradiente pertenece a las acciones principales, a los datos o a un acento puntual. No aplicar gradientes intensos a todas las tarjetas ni a todos los fondos.

---

## 3. Paleta de color — Tema claro

El tema claro conserva la misma identidad violeta/azul/dorado, pero invierte la jerarquía de superficies y oscurece las tonalidades usadas en texto o botones para conservar contraste.

| Token semántico | HEX | Uso recomendado |
|---|---|---|
| `--bg-canvas` | `#F0F1F8` | Fondo exterior |
| `--bg-app` | `#F6F7FC` | Zona de trabajo |
| `--bg-sidebar` | `#FFFFFF` | Navegación lateral |
| `--bg-card` | `#FFFFFF` | Tarjetas |
| `--bg-card-raised` | `#F5F3FC` | Subpanel, tooltip |
| `--bg-hover` | `#F0EDFA` | Hover y filas |
| `--bg-active` | `#EDE5FF` | Navegación activa |
| `--border` | `#E3E4F0` | Borde general |
| `--border-strong` | `#CCC8DF` | Borde resaltado |
| `--text-primary` | `#1A1B36` | Encabezados y cifras |
| `--text-secondary` | `#585D77` | Contenido secundario |
| `--text-muted` | `#62627D` | Metadatos con contraste adecuado |
| `--primary` | `#6636D4` | Botones y enlaces violeta |
| `--primary-hover` | `#5324B8` | Hover violeta |
| `--primary-soft` | `#EDE5FF` | Chip/selección violeta |
| `--secondary` | `#0D6FB7` | Azul de texto, botones o enlaces |
| `--cyan` | `#087C92` | Texto o etiqueta cian |
| `--accent-gold` | `#92590D` | Texto dorado legible sobre blanco |
| `--accent-orange` | `#A6530A` | Etiqueta naranja legible |
| `--accent-pink` | `#A92E6B` | Etiqueta rosada legible |
| `--success` | `#167D59` | Mensajes positivos |
| `--warning` | `#92590D` | Advertencias |
| `--danger` | `#B32647` | Error |
| `--info` | `#0D6FB7` | Mensajes informativos |

**Importante:** para **series de gráficos y ornamentos** en el tema claro se pueden conservar colores más brillantes (por ejemplo, `#2FAAF7`, `#FFC36C` o `#F16AA3`), pero **no usarlos como texto pequeño** sobre blanco. La tonalidad funcional y la del gráfico pueden ser distintas.

### 3.1. Conversión de un elemento oscuro a claro

| Elemento | Oscuro | Claro |
|---|---|---|
| Lienzo | Azul marino | Gris lavanda muy pálido |
| Sidebar | Negro azulado | Blanco con borde lateral |
| Tarjeta | Índigo profundo | Blanco con sombra muy tenue |
| Título | Blanco lavanda | Azul tinta |
| Texto secundario | Lavanda grisáceo | Gris azul oscuro |
| Selección | Violeta sobre índigo | Violeta sobre lavanda pálida |
| Gráfico | Violeta/azul/dorado luminosos | Mismas familias, saturación controlada |
| Separadores | Índigo gris | Gris lavanda |
| Sombra | Casi invisible | Gris azul translúcido |

---

## 4. Fundamentos del diseño

### 4.1. Tipografía

- **Principal:** `Inter`, `Manrope` o `Plus Jakarta Sans` (elegir **una** y mantenerla).
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Pesos:** 400 texto; 500 etiquetas; 600 encabezados de card; 700 métricas grandes.
- **Escala recomendada:**

| Rol | Escritorio | Móvil | Peso |
|---|---:|---:|---:|
| Título de página | 26–30 px | 22–24 px | 700 |
| Título de tarjeta | 15–17 px | 15–16 px | 600 |
| KPI principal | 28–36 px | 26–32 px | 700 |
| Texto base | 14–15 px | 14–16 px | 400 |
| Etiqueta | 12–13 px | 12–13 px | 500 |
| Metadato de gráfica | 12–13 px | 12–13 px | 400–500 |

No utilizar 9–10 px para información que el usuario necesita leer. **Base de lectura mínima recomendada: 14 px**.

### 4.2. Espaciado y geometría

Se propone una escala de 4 px: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`.

| Objeto | Recomendación |
|---|---|
| Sidebar | 220–240 px abierta; 68–76 px colapsada |
| Header | 64–72 px de alto |
| Separación entre cards | 16–20 px |
| Padding dentro de card | 18–24 px |
| Padding exterior del contenido | 24–32 px escritorio, 16 px móvil |
| Radio de cards | 12–16 px |
| Radio de botones | 8–10 px |
| Radio de chips | 999 px |
| Contorno estándar | 1 px sólido, bajo contraste |
| Altura de botón | 40–44 px |
| Altura mínima de control táctil | 44 px |

### 4.3. Sombras, bordes y brillo

**Tema oscuro:** priorizar diferencias de superficie y bordes sobre sombras negras. **Tema claro:** utilizar bordes finos y sombras dispersas.

```css
/* Oscuro */
box-shadow: 0 10px 30px rgba(2, 3, 14, .22);
border: 1px solid #373351;

/* Claro */
box-shadow: 0 6px 24px rgba(34, 36, 71, .06);
border: 1px solid #E3E4F0;

/* Glow violeta de un control activo, no de cada tarjeta */
box-shadow: 0 0 0 1px rgba(129, 78, 255, .24),
            0 10px 26px rgba(108, 58, 237, .13);
```

Evitar un **glassmorphism fuerte**: la imagen corresponde más a **superficies sólidas en capas** que a paneles transparentes o vidrios muy desenfocados.

---

## 5. Estructura del dashboard y comportamiento responsive

### 5.1. Modelo de escritorio (≥ 1200 px)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR 230px │ TOPBAR: título, búsqueda, filtros, notificaciones, perfil   │
│               ├──────────────────────────────────────────────────────────────┤
│ Marca         │ Título de página / resumen / filtros                       │
│               ├──────────────────────┬───────────────────┬───────────────────┤
│ Grupo 1       │ GRÁFICO PRINCIPAL    │ KPI + DONA        │ TABLA / RANKING   │
│  • opción     │ (span 6)             │ (span 3)          │ (span 3)          │
│  • opción     │                      │                   │                   │
│               ├──────────────────────┼───────────────────┴───────────────────┤
│ Grupo 2       │ LISTA / ESTADOS      │ PANEL DE CONFIG. / ACTIVIDAD         │
│  • opción     │ (span 6)             │ (span 6)                            │
│               └──────────────────────┴───────────────────────────────────────┤
└──────────────────────────────────────────────────────────────────────────────┘
```

- Aplicar **CSS Grid de 12 columnas** a la zona de tarjetas.
- Dar **6 columnas** al gráfico principal y **3 + 3** a las tarjetas laterales en una fila, cuando el ancho lo permita.
- Mantener la navegación y el encabezado distinguibles del área de contenidos.
- No forzar alturas iguales cuando el contenido requiera más espacio; usar `min-height` y contenido que crezca.

### 5.2. Tableta (768–1199 px)

- Sidebar **colapsable**, preferiblemente de 72 px o tipo drawer.
- Grid de **6 columnas** o **2 columnas de tarjetas**.
- Gráfico principal ocupa el ancho completo; tarjetas de KPI a continuación.
- Reducir el padding del contenido a 20 px y mantener un gap de 16 px.

### 5.3. Móvil (< 768 px)

- Sidebar convertida en **drawer** accesible; no debe tapar contenido permanentemente.
- Topbar compacta con título, botón de menú y acciones prioritarias.
- Una columna para todas las tarjetas.
- Gráficos adaptados sin desplazamiento horizontal de página; las tablas grandes pueden tener scroll en su propio contenedor.
- Evitar depender de hover; ofrecer estados visibles de pulsación, foco y selección.

---

## 6. Catálogo de componentes y cómo estilarlos

### Sidebar

Usar `aside` + `nav` semánticos, logo arriba, grupos con separadores suaves y rutas activas. Cada elemento debe tener icono lineal, texto y `aria-current="page"` al estar activo. El activo utiliza fondo violeta tenue, un indicador lateral o texto violeta más intenso; no usar tres marcas de selección simultáneas.

### Header / topbar

Contiene el título o breadcrumb, buscador, filtros y acciones globales. Se puede usar un botón dorado **solo para la acción más destacada** (por ejemplo, “Nuevo reporte”), dejando violeta para la acción primaria habitual. El cambio de tema debe estar visible en un control accesible.

### Tarjeta / card

Aplicar `background: var(--bg-card)`, borde `var(--border)`, radio de 14 px y padding de 20 px. La cabecera separa título y acciones; el contenido alinea KPIs, series o actividad. Una tarjeta no necesita gradiente propio para parecer moderna.

### KPI

Mostrar **etiqueta → cifra → variación → contexto temporal**. Por ejemplo: `Ingresos`, `S/ 24 580`, `+8.2 %`, `vs. mes anterior`. Colorear la variación según su significado; **no asumir que cualquier aumento es positivo** (ejemplo: incidencias).

### Gráficos

- **Línea + área:** curvas con trazo de 2–3 px; relleno degradado con opacidad 8–22%; cuadrícula tenue; tooltip de alto contraste.
- **Dona:** 2–4 segmentos, espesor visual consistente y valor agregado al centro. Evitar 10 segmentos difíciles de distinguir.
- **Barras pequeñas:** usar una paleta categórica consistente en toda la plataforma.
- **Etiquetas:** ofrecer cifras, unidades y periodo visible; no depender solo del color.
- **Leyendas:** preferir debajo o a un lado, según el espacio real.

### Botones, inputs y filtros

Botón primario violeta con texto blanco; secundario con superficie elevada y borde; terciario tipo texto. Inputs con fondo de superficie, borde visible y **anillo de foco violeta** de 3 px. Mostrar estados `idle`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error` y `success`.

### Tablas y actividad

Filas de 44–52 px de alto con línea divisoria muy tenue; primera columna fija solo si está justificado. Para actividad, avatar o icono, nombre, acción y tiempo. No colocar 7 colores simultáneos en un mismo registro.

---

## 7. Tokens CSS listos para aplicar

Guardar como `src/styles/tokens.css`. La aplicación debe definir **una sola vez** sus colores semánticos. Los componentes deben referenciar las variables y nunca depender de `#HEX` dispersos.

```css
:root,
:root[data-theme="dark"] {
  color-scheme: dark;

  --bg-canvas: #1D1E3A;
  --bg-app: #15132A;
  --bg-sidebar: #0C0D22;
  --bg-card: #191731;
  --bg-card-raised: #211F3D;
  --bg-hover: #292546;
  --bg-active: #35245D;

  --border: #373351;
  --border-strong: #4B4269;
  --text-primary: #F5F4FF;
  --text-secondary: #B8B4D0;
  --text-muted: #918CA9;

  --primary: #6C3AED;
  --primary-hover: #814EFF;
  --primary-soft: #35245D;
  --secondary: #2FAAF7;
  --cyan: #36D9E9;
  --accent-gold: #FFC36C;
  --accent-orange: #F6A14D;
  --accent-pink: #F16AA3;
  --success: #38D7A7;
  --warning: #FFC36C;
  --danger: #F47791;
  --info: #43B4FF;

  --chart-violet: #814EFF;
  --chart-blue: #2FAAF7;
  --chart-gold: #FFC36C;
  --chart-pink: #F16AA3;

  --shadow-card: 0 10px 30px rgba(2, 3, 14, .22);
  --focus-ring: 0 0 0 3px rgba(129, 78, 255, .38);
}

:root[data-theme="light"] {
  color-scheme: light;

  --bg-canvas: #F0F1F8;
  --bg-app: #F6F7FC;
  --bg-sidebar: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-card-raised: #F5F3FC;
  --bg-hover: #F0EDFA;
  --bg-active: #EDE5FF;

  --border: #E3E4F0;
  --border-strong: #CCC8DF;
  --text-primary: #1A1B36;
  --text-secondary: #585D77;
  --text-muted: #62627D;

  --primary: #6636D4;
  --primary-hover: #5324B8;
  --primary-soft: #EDE5FF;
  --secondary: #0D6FB7;
  --cyan: #087C92;
  --accent-gold: #92590D;
  --accent-orange: #A6530A;
  --accent-pink: #A92E6B;
  --success: #167D59;
  --warning: #92590D;
  --danger: #B32647;
  --info: #0D6FB7;

  /* Los gráficos tienen su propia paleta, distinta del texto. */
  --chart-violet: #7544E6;
  --chart-blue: #238FCA;
  --chart-gold: #E5A544;
  --chart-pink: #D7528F;

  --shadow-card: 0 6px 24px rgba(34, 36, 71, .06);
  --focus-ring: 0 0 0 3px rgba(102, 54, 212, .25);
}

:root {
  --font-ui: Inter, Manrope, ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", sans-serif;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-card: 14px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --sidebar-width: 232px;
  --topbar-height: 68px;
  --ease-ui: cubic-bezier(.2, .8, .2, 1);
  --duration-fast: 140ms;
  --duration-normal: 220ms;
}
```

### 7.1. Estilos base y estructura

Guardar como `src/styles/dashboard.css`.

```css
* { box-sizing: border-box; }
html { min-width: 320px; }
body {
  margin: 0;
  background: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 0; box-shadow: var(--focus-ring); }

.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100dvh;
  background: var(--bg-app);
}

.sidebar {
  grid-row: 1 / span 2;
  padding: 24px 14px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
}

.nav-group { margin-top: 28px; }
.nav-label {
  padding: 0 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: .03em;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: background var(--duration-fast) var(--ease-ui),
              color var(--duration-fast) var(--ease-ui);
}
.nav-link:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-link[aria-current="page"] {
  background: var(--bg-active);
  color: var(--text-primary);
  font-weight: 600;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  height: var(--topbar-height);
  padding: 0 28px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-app);
}
.topbar-actions { display: flex; align-items: center; gap: 10px; }
.main-content { min-width: 0; padding: 28px; }
.page-title { margin: 0 0 8px; font-size: 28px; line-height: 1.2; }
.page-subtitle { margin: 0 0 24px; color: var(--text-secondary); }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}
.span-6 { grid-column: span 6; }
.span-3 { grid-column: span 3; }
.span-4 { grid-column: span 4; }
.span-12 { grid-column: span 12; }

.dashboard-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.card-title { margin: 0; font-size: 16px; font-weight: 600; }
.card-caption { margin: 6px 0 0; font-size: 13px; color: var(--text-muted); }
.kpi-value { margin: 4px 0; font-size: 32px; font-weight: 700; letter-spacing: -.035em; }
.kpi-trend { color: var(--success); font-size: 13px; font-weight: 600; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-weight: 600;
  transition: background var(--duration-fast), transform var(--duration-fast);
}
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--primary); color: #FFF; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary {
  background: var(--bg-card-raised);
  color: var(--text-primary);
  border-color: var(--border);
}
.btn-secondary:hover { background: var(--bg-hover); }
.btn:disabled { opacity: .5; cursor: not-allowed; }

.field {
  min-height: 44px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: var(--bg-card-raised);
  color: var(--text-primary);
}
.field::placeholder { color: var(--text-muted); }
.field:focus-visible { border-color: var(--primary); }

.chart-box { min-width: 0; height: 260px; }
.chart-box > * { width: 100%; height: 100%; }

@media (max-width: 1199px) {
  :root { --sidebar-width: 76px; }
  .sidebar .nav-label, .sidebar .nav-text { display: none; }
  .sidebar { padding-inline: 12px; }
  .nav-link { justify-content: center; }
  .span-6 { grid-column: span 12; }
  .span-3, .span-4 { grid-column: span 6; }
}

@media (max-width: 767px) {
  .app-shell { display: block; }
  /* En móvil la sidebar se gestiona como drawer, no fija. */
  .sidebar { display: none; }
  .sidebar[data-open="true"] {
    display: block;
    position: fixed;
    inset: 0 auto 0 0;
    width: min(280px, 85vw);
    z-index: 100;
    overflow-y: auto;
    box-shadow: 12px 0 36px rgba(0, 0, 0, .28);
  }
  .topbar { padding-inline: 16px; }
  .main-content { padding: 16px; }
  .page-title { font-size: 23px; }
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .span-3, .span-4, .span-6, .span-12 { grid-column: 1; }
  .dashboard-card { padding: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Nota responsive:** los iconos deben tener un nombre accesible cuando la sidebar colapsa; si se usa drawer móvil hay que agregar backdrop, botón cerrar, control de foco y posibilidad de cerrar con `Escape`. El CSS anterior define la apariencia, pero esa lógica se implementa en el framework.

---

## 8. Ejemplo de estructura React

Se recomienda **React + TypeScript**, CSS variables como fuente de verdad y una biblioteca de gráficos como **Recharts** o **Apache ECharts**. Como opción de estilos, Tailwind CSS puede convivir con los tokens, pero **no es obligatorio**. Evitar mezclar varias bibliotecas de componentes que produzcan radios, alturas o sombras incompatibles.

### 8.1. Organización de carpetas

```text
src/
├── app/
│   ├── App.tsx
│   └── routes.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ThemeToggle.tsx
│   └── charts/
│       ├── LineAreaChart.tsx
│       ├── DonutChart.tsx
│       └── MiniBarChart.tsx
├── features/
│   └── analytics/
│       ├── AnalyticsPage.tsx
│       └── analytics.types.ts
├── hooks/
│   └── useTheme.ts
└── styles/
    ├── tokens.css
    └── dashboard.css
```

### 8.2. Cambio de tema funcional

Archivo `src/hooks/useTheme.ts`:

```tsx
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Se evalúa en navegador; para SSR, inicializar en un efecto o script temprano.
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("dashboard-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === "dark" ? "light" : "dark"),
  };
}
```

Archivo `src/components/ui/ThemeToggle.tsx`:

```tsx
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "claro" : "oscuro";

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={toggleTheme}
      aria-label={`Activar tema ${next}`}
      title={`Activar tema ${next}`}
    >
      {theme === "dark" ? "☀ Tema claro" : "☾ Tema oscuro"}
    </button>
  );
}
```

> Para producción, elevar `useTheme` a un `ThemeProvider` compartido si varias partes de la UI requieren leer o modificar el tema; así se evita mantener estados independientes. Si se aplica SSR, manejar la hidratación y el tema inicial antes del primer pintado.

### 8.3. Página base con tarjetas

```tsx
import { ThemeToggle } from "../../components/ui/ThemeToggle";

export function AnalyticsPage() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <strong>Marca</strong>
        <nav className="nav-group" aria-label="Secciones">
          <div className="nav-label">GENERAL</div>
          <a href="/dashboard" className="nav-link" aria-current="page">
            <span aria-hidden="true">◉</span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="/reportes" className="nav-link">
            <span aria-hidden="true">▤</span>
            <span className="nav-text">Reportes</span>
          </a>
        </nav>
      </aside>

      <header className="topbar">
        <strong>Panel de analítica</strong>
        <div className="topbar-actions"><ThemeToggle /></div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Resumen general</h1>
        <p className="page-subtitle">Actividad y tendencias del período.</p>

        <div className="dashboard-grid">
          <section className="dashboard-card span-6" aria-labelledby="trend-title">
            <div className="card-header">
              <div>
                <h2 className="card-title" id="trend-title">Tendencia</h2>
                <p className="card-caption">Evolución de los indicadores</p>
              </div>
            </div>
            <div className="chart-box">
              {/* Renderizar aquí LineAreaChart con datos reales y leyenda. */}
            </div>
          </section>

          <section className="dashboard-card span-3" aria-labelledby="kpi-title">
            <h2 className="card-title" id="kpi-title">Indicador clave</h2>
            <p className="kpi-value">64</p>
            <span className="kpi-trend">+8.2 %</span>
            <p className="card-caption">Respecto al período anterior</p>
          </section>

          <section className="dashboard-card span-3" aria-labelledby="summary-title">
            <h2 className="card-title" id="summary-title">Distribución</h2>
            <div className="chart-box">
              {/* Renderizar aquí DonutChart con datos reales. */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
```

Este ejemplo es **estructura de referencia**, no un dashboard completo ni un gráfico implementado. Las páginas adicionales deben reutilizar los mismos componentes y tokens.

---

## 9. Criterios de interacción y accesibilidad

1. **Contraste:** objetivo WCAG AA: texto normal ≥ 4.5:1, texto grande ≥ 3:1; los elementos esenciales de interfaz y gráficos deben diferenciarse claramente. Verificar combinaciones finales, no solo colores aislados.
2. **Violeta sobre blanco:** en modo claro, usar `#6636D4` para botón con texto blanco; no utilizar el violeta pastel como texto sobre blanco.
3. **Dorado:** en modo oscuro puede funcionar como botón claro con texto oscuro; en modo claro, el dorado luminoso es más adecuado para el gráfico y el dorado oscuro para texto.
4. **Foco:** `:focus-visible` visible y consistente; nunca depender únicamente de `outline: none` sin sustituto.
5. **Estado activo:** indicar mediante fondo, texto y/o icono; no exclusivamente mediante cambio de color.
6. **Gráficos:** incluir etiquetas y valores accesibles, tooltips utilizables por teclado y alternativa tabular si el gráfico es importante.
7. **Movimiento:** hover entre 140 y 220 ms; evitar animaciones continuas sin función y respetar `prefers-reduced-motion`.
8. **Navegación:** orden lógico del foco, encabezados jerárquicos y textos alternativos en botones de solo icono.
9. **Datos:** manejar `loading`, vacío, error y éxito con el mismo sistema visual.
10. **Pruebas:** verificar ambos temas y los puntos de corte de 320, 375, 768, 1024 y 1440 px, además del zoom al 200 %.

---

## 10. Guía de implementación por etapas

### Etapa 1. Definir el sistema visual

Configurar tipografía, tokens semánticos, radios, sombras, espaciados y los dos temas. Crear una página de demostración de colores y botones para revisar contrastes antes de construir el dashboard.

### Etapa 2. Construir el layout compartido

Implementar `AppShell`, `Sidebar`, `Topbar` y contenedor principal con Grid. Garantizar el colapso de navegación en tableta y su apertura/cierre en móvil antes de añadir gráficos.

### Etapa 3. Crear componentes reutilizables

Construir `Card`, `Button`, `Input`, `Select`, `Badge`, `KpiCard`, `DataTable` y `EmptyState`. Cada uno debe leer los tokens y tener variantes y estados accesibles.

### Etapa 4. Diseñar los gráficos con datos reales

Agregar áreas, líneas, dona y mini barras. Mantener una paleta de **series** separada de los colores de **texto** y fijar formatos consistentes de fechas, monedas y unidades. Evitar efectos y brillos que impidan leer tendencias.

### Etapa 5. Activar cambio de tema

Aplicar `data-theme` al nodo `html`, persistir la preferencia, comprobar todos los estados y evitar flashes de tema en carga inicial. En proyectos con renderizado del lado del servidor, utilizar inicialización temprana del tema.

### Etapa 6. Validar calidad

Revisar contraste, teclado, responsive, gráficos, estados de error y rendimiento. Corregir componentes individuales, no añadir CSS global de emergencia que rompa la consistencia.

---

## 11. Reglas para conservar el estilo de la imagen

### Sí hacer

- Crear una **estructura limpia, compacta y modular**.
- Reservar el **violeta** para navegación activa y acciones principales.
- Utilizar el **azul** para datos informativos y series de gráficos.
- Usar **dorado** de forma escasa en métricas o CTA priorizados.
- Respetar la **profundidad por capas** en ambos temas.
- Usar tarjetas de contenido sólido con borde tenue y radios coherentes.
- Mantener amplitud de lectura suficiente pese a la densidad de información.
- Cambiar colores siempre mediante **variables semánticas**.

### Evitar

- Mezclar negro puro, azul puro y violeta intenso en grandes superficies.
- Poner efectos de vidrio o blur en todas las tarjetas.
- Aplicar glow a todos los botones, tablas y gráficos.
- Utilizar fondos con gradientes fuertes debajo de texto pequeño.
- Repetir bordes, sombras y radios diferentes en cada módulo.
- Crear un tema claro mediante `filter: invert(1)`.
- Fijar colores oscuros directamente en los componentes.
- Tratar el dorado claro como texto normal sobre fondo blanco.
- Inventar datos o porcentajes para hacer que un dashboard parezca completo.

---

## 12. Prompt maestro para generar nuevas pantallas con IA

> Copiar este bloque como instrucción de diseño al desarrollar nuevas vistas, módulos o un sistema completo.

```text
Diseña e implementa una interfaz web tipo SaaS Analytics Dashboard,
inspirada en un panel tecnológico oscuro con sidebar izquierda,
header compacto y tarjetas modulares. La estética debe ser
Dark Tech / Modern SaaS, minimalista, profesional y centrada en datos.

DISEÑO GENERAL:
- Dark-first, con light mode completo mediante tokens CSS semánticos.
- Estructura: sidebar de 232px, topbar de 68px, main responsive,
  grid de 12 columnas en escritorio y una columna en móvil.
- Bordes de 1px discretos, cards con radio de 14px,
  padding 20px y separación de 18px.
- Tipografía Inter, texto base 14-15px; KPIs 28-36px.
- Iconos lineales consistentes. Animaciones de 140-220ms.

TEMA OSCURO:
- Canvas #1D1E3A; app #15132A; sidebar #0C0D22;
  card #191731; raised #211F3D; border #373351.
- Texto #F5F4FF, secundario #B8B4D0, muted #918CA9.
- Acento primario #6C3AED, hover #814EFF;
  azul #2FAAF7; dorado #FFC36C.

TEMA CLARO:
- Canvas #F0F1F8; app #F6F7FC; sidebar #FFFFFF;
  card #FFFFFF; raised #F5F3FC; border #E3E4F0.
- Texto #1A1B36, secundario #585D77, muted #62627D.
- Primario #6636D4; azul #0D6FB7; dorado funcional #92590D.

COMPONENTES:
Sidebar, Topbar, ThemeToggle, DashboardCard, KpiCard,
LineAreaChart, DonutChart, ActivityFeed, DataTable,
Button, Input, Select, Badge, EmptyState y LoadingState.

IMPLEMENTACIÓN:
- React + TypeScript con CSS variables globales.
- Los componentes nunca deben tener colores hardcodeados
  que impidan cambiar de tema.
- Usar Grid/Flexbox, componentes reutilizables,
  datos tipados y estados reales.
- Accesibilidad WCAG AA, controles por teclado,
  foco visible, responsive completo y reduced motion.
- Animaciones contenidas; no saturar de glow, glassmorphism
  ni gradientes.
- Entregar código organizado, mantenible y consistente.

RESULTADO ESPERADO:
Una interfaz que conserve el contraste de capas y la identidad
violeta/azul/dorado de la referencia, con un modo claro igualmente
refinado y legible. Mantener la jerarquía visual del dashboard.
```

---

## 13. Lista de verificación final

- [ ] Todos los componentes usan tokens semánticos de color.
- [ ] El cambio claro/oscuro funciona en todas las pantallas.
- [ ] Sidebar, topbar y tarjetas mantienen la misma geometría.
- [ ] Los KPIs tienen unidad, periodo y contexto.
- [ ] Los gráficos usan colores de series consistentes y leyendas legibles.
- [ ] Los botones tienen estados hover, foco, deshabilitado y carga.
- [ ] La navegación de móvil incluye drawer accesible.
- [ ] Hay estados vacío, error y carga.
- [ ] La interfaz sigue siendo usable a 320 px y con zoom.
- [ ] No existen textos ilegibles, contrastes deficientes ni barras horizontales inesperadas.
- [ ] No se han introducido efectos decorativos que compitan con los datos.

---

**Resultado:** una guía reutilizable que transforma la captura de referencia en un sistema de diseño oscuro/claro, aplicable a paneles administrativos, plataformas analíticas, CRM, sistemas de inventario y aplicaciones web profesionales.
