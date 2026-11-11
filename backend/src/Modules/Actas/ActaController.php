<?php
namespace App\Modules\Actas;

use App\Core\Controller;
use App\Core\Database;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class ActaController extends Controller {
    private ActaService $service;

    public function __construct() {
        $this->service = new ActaService();
    }

    public function index(): void {
        AuthMiddleware::authenticate();

        $filters = [
            'category' => $_GET['category'] ?? 'legal_actas',
            'typeId' => $_GET['typeId'] ?? null,
            'expedienteId' => $_GET['expedienteId'] ?? null,
            'search' => $_GET['search'] ?? null,
        ];

        $list = $this->service->listAll($filters);
        Response::success($list, 'Lista de actas obtenida');
    }

    public function stats(): void {
        AuthMiddleware::authenticate();
        $stats = $this->service->getStats();
        Response::success($stats, 'Estadísticas de actas');
    }

    public function show(string $id): void {
        AuthMiddleware::authenticate();
        $acta = $this->service->getById((int)$id);

        if (!$acta) {
            Response::notFound('Acta no encontrada');
        }

        Response::success($acta, 'Detalle del acta');
    }

    public function getTypes(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $stmt = $db->query("SELECT IdTipoActa as id, NombreTipoActa as name FROM tipos_actas ORDER BY IdTipoActa ASC");
        Response::success($stmt->fetchAll());
    }

    public function getByExpediente(string $expId): void {
        AuthMiddleware::authenticate();
        $list = $this->service->listAll(['expedienteId' => (int)$expId]);
        Response::success($list);
    }

    public function store(): void {
        $user = AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        try {
            $actId = $this->service->create($body, $user['user_id']);
            Response::success(['id' => $actId], 'Acta registrada con éxito', 201);
        } catch (Exception $e) {
            Response::error('Error al registrar el acta: ' . $e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void {
        AuthMiddleware::authenticate();
        $ok = $this->service->delete((int)$id);
        if ($ok) {
            Response::success(null, 'Acta eliminada correctamente');
        } else {
            Response::error('No se pudo eliminar el acta', 500);
        }
    }
}
