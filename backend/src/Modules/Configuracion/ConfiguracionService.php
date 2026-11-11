<?php
namespace App\Modules\Configuracion;

use App\Core\Database;
use PDO;
use Exception;

class ConfiguracionService {

    /**
     * Obtener todas las configuraciones organizadas por categoría y métricas del sistema
     */
    public function getAll(): array {
        $db = Database::getConnection();

        // 1. Obtener claves y valores
        $stmt = $db->query("SELECT clave, valor, categoria, descripcion, updated_at FROM configuracion_sistema ORDER BY categoria, clave");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $configs = [
            'general' => [],
            'operacion' => [],
            'smtp' => [],
            'raw' => []
        ];

        foreach ($rows as $row) {
            $cat = $row['categoria'] ?: 'general';
            $configs[$cat][$row['clave']] = $row['valor'];
            $configs['raw'][] = $row;
        }

        // 2. Información del entorno y métricas del sistema
        $dbVersion = $db->query("SELECT VERSION() as v")->fetchColumn();
        
        // Conteo de registros en tablas principales
        $counts = [
            'expedientes' => (int)$db->query("SELECT COUNT(*) FROM expedientes")->fetchColumn(),
            'actas' => (int)$db->query("SELECT COUNT(*) FROM actas")->fetchColumn(),
            'fichas' => (int)$db->query("SELECT COUNT(*) FROM actas WHERE IdTipoActa IN (1, 2, 3, 17)")->fetchColumn() + (int)$db->query("SELECT COUNT(*) FROM registroinfo")->fetchColumn(),
            'eventos' => (int)$db->query("SELECT COUNT(*) FROM eventos")->fetchColumn(),
            'notificaciones' => (int)$db->query("SELECT COUNT(*) FROM notificaciones")->fetchColumn(),
            'usuarios' => (int)$db->query("SELECT COUNT(*) FROM usuarioslg")->fetchColumn(),
            'entidades' => (int)$db->query("SELECT COUNT(*) FROM entidad")->fetchColumn(),
            'personas' => (int)$db->query("SELECT COUNT(*) FROM userexternos")->fetchColumn(),
        ];

        // Tamaño estimado de la base de datos
        $dbName = getenv('DB_NAME') ?: 'sistdemuna';
        $stmtSize = $db->prepare("
            SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
            FROM information_schema.tables 
            WHERE table_schema = ?
        ");
        $stmtSize->execute([$dbName]);
        $dbSizeMb = $stmtSize->fetchColumn() ?: '0.00';

        $systemInfo = [
            'phpVersion' => PHP_VERSION,
            'dbEngine' => 'MySQL ' . $dbVersion,
            'dbName' => $dbName,
            'dbSizeMb' => $dbSizeMb . ' MB',
            'serverTime' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get(),
            'counts' => $counts,
            'status' => 'Operativo'
        ];

        return [
            'configs' => $configs,
            'system' => $systemInfo
        ];
    }

    /**
     * Guardar/actualizar múltiples configuraciones
     */
    public function updateBulk(array $settings): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO configuracion_sistema (clave, valor)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE valor = VALUES(valor)
        ");

        $db->beginTransaction();
        try {
            foreach ($settings as $key => $val) {
                // No permitir claves vacías
                if (trim($key) === '') continue;
                $stmt->execute([trim($key), is_bool($val) ? ($val ? '1' : '0') : (string)$val]);
            }
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Listar Entidades Aliadas con filtros y relaciones
     */
    public function listEntidades(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                e.IdEntidad as id,
                e.NombreEntidad as name,
                e.Direccion as address,
                e.Distrito as district,
                e.Provincia as province,
                e.Departamento as department,
                e.Telefono as phone,
                e.IdTipoEntidad as typeId,
                te.NombreTipo as typeName
            FROM entidad e
            LEFT JOIN tipoentidad te ON e.IdTipoEntidad = te.IdTipoEntidad
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['typeId']) && $filters['typeId'] !== 'all') {
            $sql .= " AND e.IdTipoEntidad = ?";
            $params[] = (int)$filters['typeId'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (e.NombreEntidad LIKE ? OR e.Direccion LIKE ? OR e.Distrito LIKE ? OR e.Telefono LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY te.NombreTipo ASC, e.NombreEntidad ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener catálogo de tipos de entidad
     */
    public function getTiposEntidad(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT IdTipoEntidad as id, NombreTipo as name FROM tipoentidad ORDER BY NombreTipo ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener una entidad por ID
     */
    public function getEntidadById(int $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT 
                e.IdEntidad as id,
                e.NombreEntidad as name,
                e.Direccion as address,
                e.Distrito as district,
                e.Provincia as province,
                e.Departamento as department,
                e.Telefono as phone,
                e.IdTipoEntidad as typeId,
                te.NombreTipo as typeName
            FROM entidad e
            LEFT JOIN tipoentidad te ON e.IdTipoEntidad = te.IdTipoEntidad
            WHERE e.IdEntidad = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Crear nueva entidad aliada
     */
    public function createEntidad(array $data): int {
        if (empty($data['name'])) {
            throw new Exception("El nombre de la entidad es obligatorio.");
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO entidad (NombreEntidad, Direccion, Distrito, Provincia, Departamento, Telefono, IdTipoEntidad)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            trim($data['name']),
            !empty($data['address']) ? trim($data['address']) : null,
            !empty($data['district']) ? trim($data['district']) : 'Sapillica',
            !empty($data['province']) ? trim($data['province']) : 'Ayabaca',
            !empty($data['department']) ? trim($data['department']) : 'Piura',
            !empty($data['phone']) ? trim($data['phone']) : null,
            !empty($data['typeId']) ? (int)$data['typeId'] : null
        ]);

        return (int)$db->lastInsertId();
    }

    /**
     * Actualizar entidad aliada
     */
    public function updateEntidad(int $id, array $data): bool {
        if (empty($data['name'])) {
            throw new Exception("El nombre de la entidad es obligatorio.");
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE entidad SET 
                NombreEntidad = ?,
                Direccion = ?,
                Distrito = ?,
                Provincia = ?,
                Departamento = ?,
                Telefono = ?,
                IdTipoEntidad = ?
            WHERE IdEntidad = ?
        ");
        return $stmt->execute([
            trim($data['name']),
            !empty($data['address']) ? trim($data['address']) : null,
            !empty($data['district']) ? trim($data['district']) : null,
            !empty($data['province']) ? trim($data['province']) : null,
            !empty($data['department']) ? trim($data['department']) : null,
            !empty($data['phone']) ? trim($data['phone']) : null,
            !empty($data['typeId']) ? (int)$data['typeId'] : null,
            $id
        ]);
    }

    /**
     * Eliminar entidad aliada
     */
    public function deleteEntidad(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM entidad WHERE IdEntidad = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Test de conectividad SMTP
     */
    public function testSmtp(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT clave, valor FROM configuracion_sistema WHERE categoria = 'smtp'");
        $smtp = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $host = $smtp['smtp_host'] ?? getenv('MAIL_HOST') ?: 'mail.popydev.com';
        $port = (int)($smtp['smtp_port'] ?? getenv('MAIL_PORT') ?: 465);
        $user = $smtp['smtp_user'] ?? getenv('MAIL_USERNAME') ?: 'datossistema@popydev.com';

        // Intento de apertura de socket con timeout de 3 segundos
        $errno = 0;
        $errstr = '';
        $prefix = ($port == 465) ? 'ssl://' : '';
        
        $fp = @fsockopen($prefix . $host, $port, $errno, $errstr, 3);

        if ($fp) {
            $banner = fgets($fp, 512);
            fclose($fp);
            return [
                'success' => true,
                'message' => "Conexión exitosa con el servidor SMTP ({$host}:{$port}).",
                'banner' => trim($banner ?: '220 Service Ready'),
                'authenticatedUser' => $user
            ];
        } else {
            // Si el socket falla (por red o sandbox), reportar diagnóstico claro
            return [
                'success' => false,
                'message' => "No se pudo conectar al host {$host}:{$port} ({$errstr})",
                'host' => $host,
                'port' => $port
            ];
        }
    }

    /**
     * Generar Volcado SQL Completo de la Base de Datos para Descarga
     */
    public function generateBackupSql(): string {
        $db = Database::getConnection();
        $tables = $db->query("SHOW FULL TABLES WHERE Table_Type = 'BASE TABLE'")->fetchAll(PDO::FETCH_COLUMN);

        $sqlDump = "-- ===========================================================\n";
        $sqlDump .= "-- SISTEMA DEMUNA - RESPALDO OFICIAL DE BASE DE DATOS\n";
        $sqlDump .= "-- Fecha de Generación: " . date('Y-m-d H:i:s') . "\n";
        $sqlDump .= "-- Servidor: MySQL " . $db->query("SELECT VERSION()")->fetchColumn() . "\n";
        $sqlDump .= "-- ===========================================================\n\n";
        $sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n";
        $sqlDump .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
        $sqlDump .= "SET NAMES utf8mb4;\n\n";

        foreach ($tables as $table) {
            // Estructura
            $stmtCreate = $db->query("SHOW CREATE TABLE `{$table}`");
            $createRow = $stmtCreate->fetch(PDO::FETCH_NUM);
            $sqlDump .= "-- -----------------------------------------------------------\n";
            $sqlDump .= "-- Estructura de tabla `{$table}`\n";
            $sqlDump .= "-- -----------------------------------------------------------\n";
            $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sqlDump .= $createRow[1] . ";\n\n";

            // Datos
            $stmtRows = $db->query("SELECT * FROM `{$table}`");
            $rows = $stmtRows->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($rows)) {
                $sqlDump .= "-- Datos de tabla `{$table}` (" . count($rows) . " registros)\n";
                $columns = array_keys($rows[0]);
                $quotedCols = array_map(fn($c) => "`{$c}`", $columns);
                $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $quotedCols) . ") VALUES\n";

                $valRows = [];
                foreach ($rows as $row) {
                    $escapedVals = [];
                    foreach ($columns as $c) {
                        $val = $row[$c];
                        if ($val === null) {
                            $escapedVals[] = 'NULL';
                        } else {
                            $escapedVals[] = $db->quote($val);
                        }
                    }
                    $valRows[] = "(" . implode(', ', $escapedVals) . ")";
                }
                $sqlDump .= implode(",\n", $valRows) . ";\n\n";
            }
        }

        $sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
        $sqlDump .= "-- FIN DEL RESPALDO\n";

        return $sqlDump;
    }
}

