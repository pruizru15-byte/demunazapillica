<?php
namespace App\Modules\Usuarios;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class UsuarioController extends Controller {
    private UsuarioService $service;

    public function __construct() {
        $this->service = new UsuarioService();
    }

    /**
     * Verificar que el usuario tenga rol de Administrador (2) o Desarrollador (1)
     */
    private function requireAdmin(): array {
        $user = AuthMiddleware::authenticate();
        $roleId = (int)($user['role_id'] ?? 3);
        if ($roleId > 2) {
            Response::forbidden('Acceso denegado: solo Administradores pueden gestionar el personal.');
        }
        return $user;
    }

    /**
     * Listar usuarios con filtros
     */
    public function index(): void {
        $this->requireAdmin();

        $filters = [
            'roleId' => $_GET['roleId'] ?? 'all',
            'status' => $_GET['status'] ?? 'all',
            'search' => $_GET['search'] ?? null,
            'limit' => $_GET['limit'] ?? null,
        ];

        $list = $this->service->list($filters);
        Response::success($list, 'Usuarios obtenidos correctamente');
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function stats(): void {
        $this->requireAdmin();
        $stats = $this->service->getStats();
        Response::success($stats, 'Estadísticas de usuarios obtenidas');
    }

    /**
     * Obtener roles disponibles
     */
    public function roles(): void {
        $this->requireAdmin();
        $roles = $this->service->getRoles();
        Response::success($roles, 'Roles obtenidos');
    }

    /**
     * Obtener un usuario por ID
     */
    public function show(string $id): void {
        $this->requireAdmin();
        $user = $this->service->getById((int)$id);

        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }

        Response::success($user, 'Usuario obtenido');
    }

    /**
     * Crear nuevo trabajador y cuenta de acceso
     */
    public function store(): void {
        $this->requireAdmin();
        $body = $this->getJsonBody();

        try {
            $id = $this->service->create($body);
            Response::success(['id' => $id], 'Usuario institucional registrado con éxito', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * Actualizar datos personales y rol
     */
    public function update(string $id): void {
        $this->requireAdmin();
        $body = $this->getJsonBody();

        try {
            $this->service->update((int)$id, $body);
            Response::success(['id' => (int)$id], 'Usuario actualizado correctamente');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * Cambiar o resetear contraseña administrativamente
     */
    public function changePassword(string $id): void {
        $this->requireAdmin();
        $body = $this->getJsonBody();

        $newPassword = trim($body['password'] ?? '');
        if (empty($newPassword)) {
            Response::error('La nueva contraseña es requerida.', 422);
        }

        try {
            $this->service->changePassword((int)$id, $newPassword);
            Response::success(['id' => (int)$id], 'Contraseña actualizada con éxito');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * Alternar estado Activo / Inactivo
     */
    public function toggleStatus(string $id): void {
        $this->requireAdmin();

        try {
            $newStatus = $this->service->toggleStatus((int)$id);
            Response::success([
                'id' => (int)$id,
                'status' => $newStatus
            ], "Estado del usuario cambiado a '{$newStatus}'");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * Eliminar usuario
     */
    public function destroy(string $id): void {
        $this->requireAdmin();

        try {
            $this->service->delete((int)$id);
            Response::success(null, 'Usuario y registro de trabajador eliminados correctamente');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }
}

