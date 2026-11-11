<?php
namespace App\Modules\Notificaciones;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class NotificacionController extends Controller {
    private NotificacionService $service;

    public function __construct() {
        $this->service = new NotificacionService();
    }

    public function index(): void {
        AuthMiddleware::authenticate();

        $filters = [
            'status' => $_GET['status'] ?? 'all',
            'type' => $_GET['type'] ?? 'all',
            'priority' => $_GET['priority'] ?? 'all',
            'expedienteId' => $_GET['expedienteId'] ?? null,
            'dateRange' => $_GET['dateRange'] ?? null,
            'search' => $_GET['search'] ?? null,
            'limit' => $_GET['limit'] ?? null,
        ];

        $list = $this->service->list($filters);
        Response::success($list, 'Notificaciones obtenidas');
    }

    public function stats(): void {
        AuthMiddleware::authenticate();
        $stats = $this->service->getStats();
        Response::success($stats, 'Estadísticas de notificaciones');
    }

    public function store(): void {
        AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        try {
            $id = $this->service->create($body);
            Response::success(['id' => $id], 'Notificación creada con éxito', 201);
        } catch (Exception $e) {
            Response::error('Error al crear notificación: ' . $e->getMessage(), 422);
        }
    }

    public function markAsRead(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->markAsRead((int)$id);
        if ($ok) {
            Response::success(null, 'Notificación marcada como leída');
        } else {
            Response::error('No se pudo marcar la notificación', 500);
        }
    }

    public function markAsUnread(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->markAsUnread((int)$id);
        if ($ok) {
            Response::success(null, 'Notificación marcada como no leída');
        } else {
            Response::error('No se pudo marcar la notificación', 500);
        }
    }

    public function markAllAsRead(): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->markAllAsRead();
        if ($ok) {
            Response::success(null, 'Todas las notificaciones han sido marcadas como leídas');
        } else {
            Response::error('Error al actualizar las notificaciones', 500);
        }
    }

    public function show(string $id): void {
        AuthMiddleware::authenticate();
        $item = $this->service->getById((int)$id);
        if (!$item) {
            Response::notFound('Notificación no encontrada');
        }
        Response::success($item, 'Detalle de notificación obtenido');
    }

    public function clearRead(): void {
        AuthMiddleware::authenticate();
        $count = $this->service->clearRead();
        Response::success(['deleted' => $count], "Se eliminaron {$count} notificaciones leídas");
    }

    public function destroy(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->delete((int)$id);
        if ($ok) {
            Response::success(null, 'Notificación descartada correctamente');
        } else {
            Response::error('No se pudo eliminar la notificación', 500);
        }
    }
}

