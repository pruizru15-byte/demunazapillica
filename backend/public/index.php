<?php
// backend/public/index.php

// 1. Manejo de errores y zona horaria
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
date_default_timezone_set('America/Lima');

// 2. Cargar variables de entorno si existe archivo .env local o en directorio padre
$envFiles = [__DIR__ . '/.env', __DIR__ . '/../.env'];
foreach ($envFiles as $envFile) {
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            putenv("{$k}={$v}");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
        break;
    }
}

// 3. Autoloader PSR-4 para el namespace App\
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = file_exists(__DIR__ . '/src/') ? __DIR__ . '/src/' : __DIR__ . '/../src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// 4. Manejo de cabeceras CORS
\App\Middlewares\CorsMiddleware::handle();

// 5. Inicializar Enrutador
use App\Core\Router;
use App\Modules\Auth\AuthController;
use App\Modules\Expedientes\ExpedienteController;
use App\Modules\Fichas\FichaController;
use App\Modules\Actas\ActaController;
use App\Modules\Pagos\PagoController;
use App\Modules\Agenda\AgendaController;
use App\Modules\Notificaciones\NotificacionController;
use App\Modules\Estadisticas\EstadisticaController;
use App\Modules\Personas\PersonaController;
use App\Modules\Usuarios\UsuarioController;
use App\Modules\Configuracion\ConfiguracionController;

$router = new Router();

// --- Rutas de Autenticación ---
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/verify-reset-code', [AuthController::class, 'verifyResetCode']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// --- Rutas de Expedientes ---
$router->get('/api/expedientes', [ExpedienteController::class, 'index']);
$router->post('/api/expedientes', [ExpedienteController::class, 'store']);
$router->get('/api/expedientes/next-code', [ExpedienteController::class, 'getNextCode']);
$router->get('/api/expedientes/{id}', [ExpedienteController::class, 'show']);
$router->put('/api/expedientes/{id}/status', [ExpedienteController::class, 'updateStatus']);

// --- Rutas de Fichas de Atención y Seguimiento ---
$router->get('/api/fichas', [FichaController::class, 'index']);
$router->get('/api/fichas/stats', [FichaController::class, 'stats']);
$router->get('/api/fichas/{id}', [FichaController::class, 'show']);
$router->post('/api/fichas', [FichaController::class, 'store']);
$router->delete('/api/fichas/{id}', [FichaController::class, 'destroy']);

// --- Rutas de Actas y Conciliación ---
$router->get('/api/actas', [ActaController::class, 'index']);
$router->get('/api/actas/stats', [ActaController::class, 'stats']);
$router->get('/api/actas/types', [ActaController::class, 'getTypes']);
$router->get('/api/actas/expediente/{id}', [ActaController::class, 'getByExpediente']);
$router->get('/api/actas/{id}', [ActaController::class, 'show']);
$router->post('/api/actas', [ActaController::class, 'store']);
$router->delete('/api/actas/{id}', [ActaController::class, 'destroy']);

// --- Rutas de Pagos / Pensiones ---
$router->get('/api/pagos', [PagoController::class, 'index']);
$router->post('/api/pagos/{id}/pay', [PagoController::class, 'markAsPaid']);
$router->post('/api/pagos/{id}/revert', [PagoController::class, 'revertPayment']);

// --- Rutas de Agenda y Eventos ---
$router->get('/api/agenda/events', [AgendaController::class, 'getEvents']);
$router->get('/api/agenda/stats', [AgendaController::class, 'stats']);
$router->post('/api/agenda/events', [AgendaController::class, 'store']);
$router->put('/api/agenda/events/{id}/status', [AgendaController::class, 'updateStatus']);
$router->delete('/api/agenda/events/{id}', [AgendaController::class, 'destroy']);
$router->get('/api/agenda/notifications', [AgendaController::class, 'getNotifications']);
$router->put('/api/agenda/notifications/{id}/read', [AgendaController::class, 'dismissNotification']);

// --- Rutas de Notificaciones y Avisos Institucionales ---
$router->get('/api/notificaciones', [NotificacionController::class, 'index']);
$router->get('/api/notificaciones/stats', [NotificacionController::class, 'stats']);
$router->post('/api/notificaciones', [NotificacionController::class, 'store']);
$router->put('/api/notificaciones/read-all', [NotificacionController::class, 'markAllAsRead']);
$router->delete('/api/notificaciones/clear-read', [NotificacionController::class, 'clearRead']);
$router->get('/api/notificaciones/{id}', [NotificacionController::class, 'show']);
$router->put('/api/notificaciones/{id}/read', [NotificacionController::class, 'markAsRead']);
$router->put('/api/notificaciones/{id}/unread', [NotificacionController::class, 'markAsUnread']);
$router->delete('/api/notificaciones/{id}', [NotificacionController::class, 'destroy']);

// --- Rutas de Estadísticas y MIMP ---
$router->get('/api/estadisticas/kpis', [EstadisticaController::class, 'getDashboardKpis']);
$router->get('/api/estadisticas/mimp', [EstadisticaController::class, 'getMimpReportData']);
$router->post('/api/estadisticas/mimp/save', [EstadisticaController::class, 'saveMimpConsolidated']);

// --- Rutas de Personas y Orientaciones ---
$router->get('/api/personas/search', [PersonaController::class, 'search']);
$router->get('/api/personas/lookup-dni/{dni}', [PersonaController::class, 'lookupDni']);
$router->get('/api/orientaciones', [PersonaController::class, 'getOrientaciones']);
$router->post('/api/orientaciones', [PersonaController::class, 'storeOrientacion']);

// --- Rutas de Usuarios y Personal Institucional ---
$router->get('/api/usuarios', [UsuarioController::class, 'index']);
$router->get('/api/usuarios/stats', [UsuarioController::class, 'stats']);
$router->get('/api/usuarios/roles', [UsuarioController::class, 'roles']);
$router->get('/api/usuarios/{id}', [UsuarioController::class, 'show']);
$router->post('/api/usuarios', [UsuarioController::class, 'store']);
$router->put('/api/usuarios/{id}', [UsuarioController::class, 'update']);
$router->put('/api/usuarios/{id}/password', [UsuarioController::class, 'changePassword']);
$router->put('/api/usuarios/{id}/status', [UsuarioController::class, 'toggleStatus']);
$router->delete('/api/usuarios/{id}', [UsuarioController::class, 'destroy']);

// --- Rutas de Configuración del Sistema y Entidades Aliadas ---
$router->get('/api/configuracion', [ConfiguracionController::class, 'index']);
$router->put('/api/configuracion', [ConfiguracionController::class, 'update']);
$router->get('/api/configuracion/entidades', [ConfiguracionController::class, 'getEntidades']);
$router->get('/api/configuracion/tipos-entidad', [ConfiguracionController::class, 'getTiposEntidad']);
$router->get('/api/configuracion/entidades/{id}', [ConfiguracionController::class, 'showEntidad']);
$router->post('/api/configuracion/entidades', [ConfiguracionController::class, 'storeEntidad']);
$router->put('/api/configuracion/entidades/{id}', [ConfiguracionController::class, 'updateEntidad']);
$router->delete('/api/configuracion/entidades/{id}', [ConfiguracionController::class, 'destroyEntidad']);
$router->post('/api/configuracion/test-email', [ConfiguracionController::class, 'testSmtp']);
$router->get('/api/configuracion/backup', [ConfiguracionController::class, 'backup']);

// 6. Despachar petición
$router->dispatch();

