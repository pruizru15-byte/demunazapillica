<?php
namespace App\Modules\Expedientes;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class ExpedienteController extends Controller {
    private ExpedienteService $service;

    public function __construct() {
        $this->service = new ExpedienteService();
    }

    public function index(): void {
        AuthMiddleware::authenticate();

        $filters = [
            'status' => $_GET['status'] ?? null,
            'workerId' => $_GET['workerId'] ?? null,
            'search' => $_GET['search'] ?? null,
            'year' => $_GET['year'] ?? null,
        ];

        $list = $this->service->listAll($filters);
        Response::success($list, 'Lista de expedientes obtenida');
    }

    public function getNextCode(): void {
        AuthMiddleware::authenticate();
        $code = $this->service->getNextCorrelative();
        Response::success(['code' => $code]);
    }

    public function show(string $id): void {
        AuthMiddleware::authenticate();
        $exp = $this->service->getById((int)$id);

        if (!$exp) {
            Response::notFound('Expediente no encontrado');
        }

        Response::success($exp, 'Detalle del expediente');
    }

    public function store(): void {
        $user = AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        if (empty($body['subject'])) {
            Response::error('La materia o descripción del expediente es requerida', 422);
        }

        try {
            $expId = $this->service->create($body, $user['user_id']);
            Response::success(['id' => $expId], 'Expediente registrado con éxito', 201);
        } catch (Exception $e) {
            Response::error('Error al registrar el expediente: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus(string $id): void {
        AuthMiddleware::authenticate();
        $body = $this->getJsonBody();
        $statusId = (int)($body['statusId'] ?? 0);

        if ($statusId <= 0) {
            Response::error('ID de estado no válido', 422);
        }

        $ok = $this->service->updateStatus((int)$id, $statusId);
        if ($ok) {
            Response::success(null, 'Estado actualizado correctamente');
        } else {
            Response::error('No se pudo actualizar el estado', 500);
        }
    }
}

