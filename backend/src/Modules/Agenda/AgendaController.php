<?php
namespace App\Modules\Agenda;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class AgendaController extends Controller {
    private AgendaService $service;

    public function __construct() {
        $this->service = new AgendaService();
    }

    public function getEvents(): void {
        AuthMiddleware::authenticate();

        $filters = [
            'status' => $_GET['status'] ?? 'all',
            'type' => $_GET['type'] ?? 'all',
            'expedienteId' => $_GET['expedienteId'] ?? null,
            'year' => $_GET['year'] ?? null,
            'month' => $_GET['month'] ?? null,
            'search' => $_GET['search'] ?? null,
        ];

        $events = $this->service->listEvents($filters);
        Response::success($events, 'Eventos de agenda obtenidos');
    }

    public function stats(): void {
        AuthMiddleware::authenticate();
        $stats = $this->service->getStats();
        Response::success($stats, 'Estadísticas de la agenda');
    }

    public function store(): void {
        $user = AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        try {
            $eventId = $this->service->createEvent($body, $user['user_id']);
            Response::success(['id' => $eventId], 'Evento agendado con éxito', 201);
        } catch (Exception $e) {
            Response::error('Error al agendar evento: ' . $e->getMessage(), 422);
        }
    }

    public function updateStatus(string $id): void {
        AuthMiddleware::authenticate();
        $body = $this->getJsonBody();
        $status = $body['status'] ?? 'Realizado';

        $ok = $this->service->updateStatus((int)$id, $status);
        if ($ok) {
            Response::success(null, 'Estado del evento actualizado');
        } else {
            Response::error('No se pudo actualizar el estado', 500);
        }
    }

    public function destroy(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->deleteEvent((int)$id);
        if ($ok) {
            Response::success(null, 'Evento eliminado de la agenda');
        } else {
            Response::error('No se pudo eliminar el evento', 500);
        }
    }

    public function getNotifications(): void {
        AuthMiddleware::authenticate();
        $list = $this->service->listNotifications();
        Response::success($list, 'Notificaciones activas obtenidas');
    }

    public function dismissNotification(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->dismissNotification((int)$id);
        if ($ok) {
            Response::success(null, 'Notificación marcada como leída');
        } else {
            Response::error('No se pudo actualizar la notificación', 500);
        }
    }
}
