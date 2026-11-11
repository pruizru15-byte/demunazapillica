<?php
namespace App\Modules\Notificaciones;

use App\Core\Database;
use PDO;
use Exception;

class NotificacionService {

    /**
     * Listar notificaciones con filtros
     */
    public function list(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                n.IdNotificacion as id,
                n.IdEvento as eventId,
                n.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                e.Descripcion as expedienteSubject,
                n.IdPersonaInvolucrada as personId,
                CONCAT(u.Nombres, ' ', u.Apellidos) as personName,
                n.Titulo as title,
                n.Mensaje as message,
                n.FechaProgramada as scheduledDate,
                n.HoraProgramada as scheduledTime,
                n.Estado as status,
                n.EstadoToast as toastStatus,
                n.Tipo as type,
                n.Prioridad as priority,
                n.CreatedAt as createdAt
            FROM notificaciones n
            LEFT JOIN expedientes e ON n.IdExpediente = e.IdExpediente
            LEFT JOIN userexternos u ON n.IdPersonaInvolucrada = u.IdPersona
            WHERE 1=1
        ";

        $params = [];

        // Filtro por estado: 'Activa' (no leídas), 'Leida', 'Archivada', o 'all'
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= " AND n.Estado = ?";
            $params[] = $filters['status'];
        }

        // Filtro por tipo/categoría: 'Audiencia', 'Visita', 'Pensión', 'Seguimiento', 'Sistema', etc.
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $sql .= " AND (n.Tipo = ? OR n.Titulo LIKE ?)";
            $params[] = $filters['type'];
            $params[] = '%' . $filters['type'] . '%';
        }

        // Filtro por prioridad: 'Alta', 'Media', 'Informativa'
        if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
            $sql .= " AND n.Prioridad = ?";
            $params[] = $filters['priority'];
        }

        // Filtro por expediente
        if (!empty($filters['expedienteId'])) {
            $sql .= " AND n.IdExpediente = ?";
            $params[] = (int)$filters['expedienteId'];
        }

        // Filtro por rango de fecha: 'today', 'upcoming_week', 'this_month'
        if (!empty($filters['dateRange'])) {
            if ($filters['dateRange'] === 'today') {
                $sql .= " AND n.FechaProgramada = CURDATE()";
            } else if ($filters['dateRange'] === 'week') {
                $sql .= " AND n.FechaProgramada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
            } else if ($filters['dateRange'] === 'month') {
                $sql .= " AND YEAR(n.FechaProgramada) = YEAR(CURDATE()) AND MONTH(n.FechaProgramada) = MONTH(CURDATE())";
            }
        }

        // Búsqueda libre
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (n.Titulo LIKE ? OR n.Mensaje LIKE ? OR e.NombreExpediente LIKE ? OR u.Nombres LIKE ? OR u.Apellidos LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY (n.Estado = 'Activa') DESC, n.FechaProgramada DESC, n.HoraProgramada DESC, n.IdNotificacion DESC";

        if (!empty($filters['limit'])) {
            $sql .= " LIMIT " . (int)$filters['limit'];
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Obtener estadísticas para Mini-KPIs
     */
    public function getStats(): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Estado = 'Activa' THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN Estado = 'Leida' THEN 1 ELSE 0 END) as readCount,
                SUM(CASE WHEN Estado = 'Activa' AND Prioridad = 'Alta' THEN 1 ELSE 0 END) as highPriority,
                SUM(CASE WHEN FechaProgramada = CURDATE() THEN 1 ELSE 0 END) as scheduledToday,
                SUM(CASE WHEN Estado = 'Activa' AND FechaProgramada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as upcomingWeek,
                SUM(CASE WHEN Tipo = 'Audiencia' OR Titulo LIKE '%Concilia%' THEN 1 ELSE 0 END) as audiencias,
                SUM(CASE WHEN Tipo = 'Pensión' OR Titulo LIKE '%Pensi%' THEN 1 ELSE 0 END) as pensiones,
                SUM(CASE WHEN Tipo = 'Seguimiento' OR Titulo LIKE '%Seguimiento%' OR Titulo LIKE '%F11%' THEN 1 ELSE 0 END) as seguimiento
            FROM notificaciones
        ";

        $stmt = $db->query($sql);
        $res = $stmt->fetch();

        return [
            'total' => (int)($res['total'] ?? 0),
            'unread' => (int)($res['unread'] ?? 0),
            'read' => (int)($res['readCount'] ?? 0),
            'highPriority' => (int)($res['highPriority'] ?? 0),
            'scheduledToday' => (int)($res['scheduledToday'] ?? 0),
            'upcomingWeek' => (int)($res['upcomingWeek'] ?? 0),
            'audiencias' => (int)($res['audiencias'] ?? 0),
            'pensiones' => (int)($res['pensiones'] ?? 0),
            'seguimiento' => (int)($res['seguimiento'] ?? 0),
        ];
    }

    /**
     * Crear una notificación o alerta manual institucional
     */
    public function create(array $data): int {
        $db = Database::getConnection();

        $expId = !empty($data['expedienteId']) ? (int)$data['expedienteId'] : null;
        $title = trim($data['title'] ?? '');
        $message = trim($data['message'] ?? '');
        $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
        $time = !empty($data['time']) ? $data['time'] : date('H:i:s');
        $type = !empty($data['type']) ? trim($data['type']) : 'General';
        $priority = !empty($data['priority']) ? trim($data['priority']) : 'Media';
        $personId = !empty($data['personId']) ? (int)$data['personId'] : null;

        if (empty($title)) {
            throw new Exception('El título de la alerta es obligatorio.');
        }

        $stmt = $db->prepare("
            INSERT INTO notificaciones 
                (IdExpediente, IdPersonaInvolucrada, Titulo, Mensaje, FechaProgramada, HoraProgramada, Estado, EstadoToast, Tipo, Prioridad)
            VALUES 
                (?, ?, ?, ?, ?, ?, 'Activa', 'Pendiente', ?, ?)
        ");
        $stmt->execute([$expId, $personId, $title, $message, $date, $time, $type, $priority]);
        return (int)$db->lastInsertId();
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE notificaciones SET Estado = 'Leida' WHERE IdNotificacion = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Marcar notificación como no leída (Activa)
     */
    public function markAsUnread(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE notificaciones SET Estado = 'Activa' WHERE IdNotificacion = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Marcar todas las notificaciones activas como leídas
     */
    public function markAllAsRead(): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE notificaciones SET Estado = 'Leida' WHERE Estado = 'Activa'");
        return $stmt->execute();
    }

    /**
     * Obtener una notificación por su ID con datos relacionados completos
     */
    public function getById(int $id): ?array {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT 
                n.IdNotificacion as id,
                n.IdEvento as eventId,
                n.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                e.Descripcion as expedienteSubject,
                n.IdPersonaInvolucrada as personId,
                CONCAT(u.Nombres, ' ', u.Apellidos) as personName,
                u.Dni as personDni,
                u.Telefono as personPhone,
                u.Direccion as personAddress,
                n.Titulo as title,
                n.Mensaje as message,
                n.FechaProgramada as scheduledDate,
                n.HoraProgramada as scheduledTime,
                n.Estado as status,
                n.EstadoToast as toastStatus,
                n.Tipo as type,
                n.Prioridad as priority,
                n.CreatedAt as createdAt,
                ev.TipoEvento as eventType,
                ev.Descripcion as eventDescription,
                ev.FechaEvento as eventDate,
                ev.HoraEvento as eventTime,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName
            FROM notificaciones n
            LEFT JOIN expedientes e ON n.IdExpediente = e.IdExpediente
            LEFT JOIN userexternos u ON n.IdPersonaInvolucrada = u.IdPersona
            LEFT JOIN eventos ev ON n.IdEvento = ev.IdEvento
            LEFT JOIN trabajadores t ON ev.IdTrabajador = t.IdTrabajador
            WHERE n.IdNotificacion = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Eliminar notificación
     */
    public function delete(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM notificaciones WHERE IdNotificacion = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Eliminar todas las notificaciones que ya fueron marcadas como leídas
     */
    public function clearRead(): int {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM notificaciones WHERE Estado = 'Leida'");
        $stmt->execute();
        return $stmt->rowCount();
    }
}

