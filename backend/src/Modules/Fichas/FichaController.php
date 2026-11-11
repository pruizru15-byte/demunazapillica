<?php
namespace App\Modules\Fichas;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class FichaController extends Controller {
    private FichaService $service;

    public function __construct() {
        $this->service = new FichaService();
    }

    public function index(): void {
        AuthMiddleware::authenticate();

        $filters = [
            'typeId' => $_GET['typeId'] ?? null,
            'category' => $_GET['category'] ?? null,
            'expedienteId' => $_GET['expedienteId'] ?? null,
            'search' => $_GET['search'] ?? null,
        ];

        $list = $this->service->listAll($filters);
        Response::success($list, 'Lista de fichas obtenida');
    }

    public function stats(): void {
        AuthMiddleware::authenticate();
        $stats = $this->service->getStats();
        Response::success($stats, 'Estadísticas de fichas');
    }

    public function show(string $id): void {
        AuthMiddleware::authenticate();
        $source = $_GET['source'] ?? 'acta_ficha';
        $ficha = $this->service->getById((int)$id, $source);

        if (!$ficha) {
            Response::notFound('Ficha de atención no encontrada');
        }

        Response::success($ficha, 'Detalle de la ficha');
    }

    public function store(): void {
        $user = AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        try {
            $fichaId = $this->service->create($body, $user['user_id']);
            Response::success(['id' => $fichaId], 'Ficha registrada exitosamente', 201);
        } catch (Exception $e) {
            Response::error('Error al registrar la ficha: ' . $e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void {
        AuthMiddleware::authenticate();
        $source = $_GET['source'] ?? 'acta_ficha';

        $ok = $this->service->delete((int)$id, $source);
        if ($ok) {
            Response::success(null, 'Ficha eliminada correctamente');
        } else {
            Response::error('No se pudo eliminar la ficha', 500);
        }
    }
}

