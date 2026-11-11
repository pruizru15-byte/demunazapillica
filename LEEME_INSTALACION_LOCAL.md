# 🏛️ SISTEMA DEMUNA ZAPILLICA — GUÍA DE EJECUCIÓN EN LOCAL

Plataforma integral de gestión tutelar, expedientes, actas de conciliación extrajudicial, fichas de seguimiento, agenda, notificaciones e informes estadísticos MIMP para la **DEMUNA ZAPILLICA** (Municipalidad Distrital de Zapillica).

---

## 🚀 OPCIÓN 1: Ejecución con Docker (Recomendada - Automática)

Si tienes **Docker Desktop** instalado, esta es la forma más rápida y sin configurar nada manualmente.

### Pasos:
1. Asegúrate de tener **Docker Desktop** abierto y en ejecución.
2. Haz doble clic en el archivo:
   ```cmd
   iniciar-docker.bat
   ```
   *(O desde una terminal en la carpeta del proyecto ejecuta: `docker compose up -d --build`)*
3. Los contenedores se construirán e inicializarán la base de datos automáticamente con todos los datos precargados.

### Enlaces locales:
- **🌐 Sistema Web (Frontend):** [http://localhost:5173/](http://localhost:5173/)
- **⚙️ Backend REST API:** [http://localhost:8000/api/](http://localhost:8000/api/)
- **🗄️ phpMyAdmin (Gestor de BD):** [http://localhost:8081/](http://localhost:8081/)
  - *Usuario:* `root`
  - *Contraseña:* `demuna2026`

Para detener el sistema, haz doble clic en `detener-docker.bat` (o ejecuta `docker compose down`).

---

## 💻 OPCIÓN 2: Ejecución Sin Docker (XAMPP / PHP + Node.js)

Si prefieres levantarlo con tu entorno tradicional (XAMPP / WampServer / PHP local):

### 1. Base de Datos
1. Inicia **Apache** y **MySQL** en XAMPP.
2. Abre phpMyAdmin ([http://localhost/phpmyadmin](http://localhost/phpmyadmin)) y crea una base de datos llamada:
   ```sql
   sistdemuna
   ```
3. Haz clic en **Importar** y selecciona el archivo:
   ```
   backend/database/sistdemuna.sql
   ```
   *(Contiene las 31 tablas del sistema con más de 13 registros de prueba por módulo y configuración lista).*

### 2. Configurar Backend
1. En la carpeta `backend/`, verifica que el archivo `.env` tenga la conexión local:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=sistdemuna
   DB_USER=root
   DB_PASS=
   JWT_SECRET=super_secret_jwt_key_demuna_2026_zapillica
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   FRONTEND_URL=http://localhost:5173
   ```
   *(En XAMPP la contraseña de root por defecto es vacía `DB_PASS=`)*.

2. Inicia el servidor PHP abriendo una terminal en la raíz del proyecto y ejecutando:
   ```bash
   php -S localhost:8000 -t backend/public
   ```

### 3. Iniciar Frontend
1. Abre otra terminal, entra a la carpeta del frontend e inicia Vite:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Abre tu navegador en:
   ```
   http://localhost:5173/
   ```

---

## 🔑 CREDENCIALES DE ACCESO AL SISTEMA

Puedes ingresar con cualquiera de estos roles preconfigurados (en la pantalla de inicio de sesión también hay botones de selección rápida):

| Rol | Correo Institucional | DNI | Contraseña | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@demuna.gob.pe` | `22222222` | `password123` | Acceso 100% total (MIMP, Usuarios, Configuración, etc.) |
| **Defensor / Trabajador** | `trabajador@demuna.gob.pe` | `33333333` | `password123` | Gestión de casos, actas, agenda, conciliación y pagos |
| **Desarrollador / TI** | `dev@demuna.gob.pe` | `11111111` | `password123` | Supervisión técnica y auditoría |

---

## 📦 ESTRUCTURA PRINCIPAL DEL PROYECTO

```text
sistema-demuna/
├── backend/
│   ├── config/              # Conexión PDO y configuración de entorno
│   ├── database/
│   │   └── sistdemuna.sql   # Volcado SQL completo con 31 tablas y datos DEMUNA ZAPILLICA
│   ├── public/              # Punto de entrada index.php y .htaccess
│   ├── src/
│   │   ├── Middlewares/     # Autenticación JWT y control de roles
│   │   ├── Modules/         # Expedientes, Actas, Fichas, Agenda, Usuarios, Configuración...
│   │   └── Utils/           # Generador JWT, Respuestas JSON, Mailer
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente Axios con interceptor dual de autorización
│   │   ├── components/      # Navbar, Sidebar, Badges, Modales, Layouts
│   │   ├── pages/           # Vistas de los 10 módulos del sistema
│   │   └── routes/          # Rutas protegidas y públicas
│   ├── public/              # Logotipos e imágenes institucionales
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml       # Orquestación de 4 contenedores (Front, API, MySQL, phpMyAdmin)
├── iniciar-docker.bat       # Script de inicio en 1 clic
├── detener-docker.bat       # Script de parada en 1 clic
└── LEEME_INSTALACION_LOCAL.md
```
