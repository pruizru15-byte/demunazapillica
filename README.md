# SISTDEMUNA · Sistema de Gestión Integral DEMUNA Sapillica

Sistema institucional completo para la **Defensoría Municipal del Niño, Niña y Adolescente (DEMUNA)** de la Municipalidad Distrital de Sapillica (Acreditación MIMP: `DEMUNA-ACR-020-PIU`).

Desarrollado bajo una arquitectura desacoplada full-stack con diseño Dark Tech moderno, conforme a las directivas y formatos normativos del **Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)** y el Código de los Niños y Adolescentes (Ley N° 27337).

---

## Módulos del Sistema

1. **Panel Principal (Dashboard):** Indicadores clave de desempeño (KPIs), gráficas de materias atendidas, balance de expedientes en trámite vs. concluidos y accesos directos.
2. **Casos y Expedientes:** Gestión integral del ciclo de vida de expedientes (apertura, calificación preliminar, materias de alimentos, tenencia, régimen de visitas, conducta y filiación).
3. **Fichas de Atención y Seguimiento:**
   * Ficha de Recepción de Casos (`F1`)
   * Ficha de Entrevista Reservada (`F2`)
   * Ficha de Visita Domiciliaria In Situ (`F3`)
   * Ficha de Seguimiento y Monitoreo (`F11`)
   * Orientaciones Rápidas Ciudadanas
4. **Actas y Conciliación Extrajudicial:** Emisión y registro de Actas de Conciliación (Acuerdo Total / Parcial), Actas de Compromiso, Inasistencias, Suspensiones y Oficios de Derivación (`F7`).
5. **Alimentos y Pensiones:** Cronograma mensual de pensiones acordadas, control de consignaciones y liquidación de cuotas devengadas.
6. **Agenda y Actividades:** Calendario interactivo con vistas por Mes, Semana y Lista para audiencias, visitas de campo y actividades de promoción preventiva.
7. **Centro de Notificaciones:** Notificaciones reactivas en tiempo real sobre citas del día, vencimiento de pensiones y alertas prioritarias.
8. **Documentos PDF e Informe MIMP:** Generación del informe anual oficial en 5 capítulos y centro de emisión para 15 formatos PDF estandarizados con membrete institucional y bloques de firmas.
9. **Usuarios y Personal:** Administración de defensores, psicólogos y personal administrativo (control de roles, asignación de carga laboral, reseteo de claves y estado activo/inactivo).
10. **Configuración y Red de Derivación:** Gestión de la acreditación MIMP, directorio de 14 entidades aliadas (Comisarías PNP, CEM, Salud, Colegios, Juzgados), directrices operativas, servidor SMTP y copias de seguridad de la base de datos.

---

## Tecnologías Utilizadas

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (iconografía 100% vectorial, cero emojis), Axios, React Router v6 (con opt-in flags v7).
* **Backend:** PHP 8.1 (Arquitectura modular MVC/Servicios, PSR-4 autoloader, PDO MySQL, JWT Auth, Apache HTTP Server).
* **Base de Datos:** MySQL 8.0 (`utf8mb4_unicode_ci`, 31 tablas relacionales, integridad referencial).
* **Contenedores:** Docker & Docker Compose (`demuna_frontend`, `demuna_api`, `demuna_db`, `demuna_pma`).

---

## Puesta en Marcha en Local (Docker)

### Prerrequisitos
* Docker Desktop instalado y en ejecución.

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/pruizru15-byte/demunazapillica.git
   cd demunazapillica
   ```
2. Levantar los contenedores con Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. Acceder a las aplicaciones:
   * **Frontend:** `http://localhost:5173`
   * **Backend REST API:** `http://localhost:8000/api`
   * **phpMyAdmin:** `http://localhost:8081`

### Credenciales por Defecto
* **Administrador:** `admin@demuna.gob.pe` | Clave: `password123` (o `admin123`)
* **Desarrollador:** `dev@demuna.gob.pe` | Clave: `password123`

---

## Despliegue en Servidores cPanel (`/demuna`)

1. Crear la base de datos MySQL en cPanel e importar el archivo [`demuna_cpanel_database.sql`](./demuna_cpanel_database.sql).
2. Crear la carpeta `demuna` dentro de `public_html/`.
3. Subir el paquete de despliegue extraído en `public_html/demuna/` (o compilar frontend con `npm run build` y colocar backend en `public_html/demuna/api/`).
4. Configurar el archivo `public_html/demuna/api/.env` con las credenciales de la base de datos y servidor SMTP.
5. Acceder a la plataforma desde `https://tudominio.com/demuna/`.

---

## Licencia y Derechos

Desarrollado para la Municipalidad Distrital de Sapillica · DEMUNA Perú.

