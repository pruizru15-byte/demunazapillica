<?php
namespace App\Modules\Configuracion;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class ConfiguracionController extends Controller {

    private ConfiguracionService $service;

    public function __construct() {
        $this->service = new ConfiguracionService();
    }

    /**
     * Obtener configuraciones del sistema e información del servidor
     */
    public function index(): void {
        AuthMiddleware::authenticate();
        try {
            $data = $this->service->getAll();
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Actualizar configuraciones
     */
    public function update(): void {
        AuthMiddleware::authenticate();
        try {
            $body = $this->getJsonBody();
            if (empty($body)) {
                Response::error("No se recibieron datos para actualizar.", 400);
                return;
            }

            $this->service->updateBulk($body);
            Response::success(null, "Configuración actualizada correctamente.");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Listar Entidades Aliadas
     */
    public function getEntidades(): void {
        AuthMiddleware::authenticate();
        try {
            $filters = [
                'typeId' => $_GET['typeId'] ?? null,
                'search' => $_GET['search'] ?? null
            ];
            $data = $this->service->listEntidades($filters);
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Catálogo de Tipos de Entidad
     */
    public function getTiposEntidad(): void {
        AuthMiddleware::authenticate();
        try {
            $data = $this->service->getTiposEntidad();
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Ver detalle de entidad
     */
    public function showEntidad(string $id): void {
        AuthMiddleware::authenticate();
        try {
            $entidad = $this->service->getEntidadById((int)$id);
            if (!$entidad) {
                Response::error("Entidad aliada no encontrada.", 404);
                return;
            }
            Response::success($entidad);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Crear entidad aliada
     */
    public function storeEntidad(): void {
        AuthMiddleware::authenticate();
        try {
            $body = $this->getJsonBody();
            $id = $this->service->createEntidad($body);
            Response::success(['id' => $id], "Entidad aliada registrada con éxito.", 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * Modificar entidad aliada
     */
    public function updateEntidad(string $id): void {
        AuthMiddleware::authenticate();
        try {
            $body = $this->getJsonBody();
            $this->service->updateEntidad((int)$id, $body);
            Response::success(null, "Entidad aliada actualizada con éxito.");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * Eliminar entidad aliada
     */
    public function destroyEntidad(string $id): void {
        AuthMiddleware::authenticate();
        try {
            $this->service->deleteEntidad((int)$id);
            Response::success(null, "Entidad aliada eliminada del directorio.");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Test de conectividad SMTP
     */
    public function testSmtp(): void {
        AuthMiddleware::authenticate();
        try {
            $res = $this->service->testSmtp();
            Response::success($res, $res['message']);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Descarga de Respaldo SQL
     */
    public function backup(): void {
        AuthMiddleware::authenticate();
        try {
            $sql = $this->service->generateBackupSql();
            $filename = "backup_demuna_" . date('Ymd_His') . ".sql";

            header('Content-Type: application/sql; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . strlen($sql));
            header('Pragma: no-cache');
            header('Expires: 0');
            echo $sql;
            exit;
        } catch (Exception $e) {
            Response::error("Error al generar respaldo: " . $e->getMessage(), 500);
        }
    }
}

