<?php
namespace App\Modules\Agenda;

use App\Core\Database;
use PDO;
use Exception;

class AgendaService {

    /**
     * Listar eventos de la agenda con filtros
     */
    public function listEvents(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                ev.IdEvento as id,
                ev.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                e.Descripcion as expedienteSubject,
                ev.TipoEvento as type,
                ev.Descripcion as description,
                ev.FechaEvento as eventDate,
                ev.HoraEvento as eventTime,
                ev.Monto as amount,
                ev.MetodoPago as paymentMethod,
                ev.Frecuencia as frequency,
                ev.Estado as status,
                ev.IdPersonaInvolucrada as personId,
                CONCAT(u.Nombres, ' ', u.Apellidos) as involvedPersonName,
                u.Telefono as personPhone,
                u.Direccion as personAddress,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                t.DNI as workerDni
            FROM eventos ev
            LEFT JOIN expedientes e ON ev.IdExpediente = e.IdExpediente
            LEFT JOIN userexternos u ON ev.IdPersonaInvolucrada = u.IdPersona
            LEFT JOIN trabajadores t ON ev.IdTrabajador = t.IdTrabajador
            WHERE 1=1
        ";

        $params = [];

        // Filtro por estado (por defecto excluye cancelados a menos que se pida)
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= " AND ev.Estado = ?";
            $params[] = $filters['status'];
        } else {
            $sql .= " AND ev.Estado != 'Cancelado'";
        }

        // Filtro por tipo de evento
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $sql .= " AND ev.TipoEvento LIKE ?";
            $params[] = '%' . trim($filters['type']) . '%';
        }

        // Filtro por expediente
        if (!empty($filters['expedienteId'])) {
            $sql .= " AND ev.IdExpediente = ?";
            $params[] = (int)$filters['expedienteId'];
        }

        // Filtro por mes y año
        if (!empty($filters['year'])) {
            $sql .= " AND YEAR(ev.FechaEvento) = ?";
            $params[] = (int)$filters['year'];
        }
        if (!empty($filters['month'])) {
            $sql .= " AND MONTH(ev.FechaEvento) = ?";
            $params[] = (int)$filters['month'];
        }

        // Búsqueda libre
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (ev.Descripcion LIKE ? OR ev.TipoEvento LIKE ? OR e.NombreExpediente LIKE ? OR u.Nombres LIKE ? OR u.Apellidos LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY ev.FechaEvento ASC, ev.HoraEvento ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Estadísticas de eventos para Mini-KPIs
     */
    public function getStats(): array {
        $db = Database::getConnection();
        $currentMonth = date('m');
        $currentYear = date('Y');

        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as totalMonth,
                SUM(CASE WHEN TipoEvento LIKE '%Concilia%' THEN 1 ELSE 0 END) as audiencias,
                SUM(CASE WHEN TipoEvento LIKE '%Visita%' THEN 1 ELSE 0 END) as visitas,
                SUM(CASE WHEN TipoEvento LIKE '%Entrevista%' OR TipoEvento LIKE '%Atenci%' THEN 1 ELSE 0 END) as entrevistas,
                SUM(CASE WHEN Estado = 'Realizado' THEN 1 ELSE 0 END) as realizadas,
                SUM(CASE WHEN Estado = 'Pendiente' OR Estado = 'Activo' THEN 1 ELSE 0 END) as pendientes
            FROM eventos
            WHERE Estado != 'Cancelado' AND YEAR(FechaEvento) = ? AND MONTH(FechaEvento) = ?
        ");
        $stmt->execute([$currentYear, $currentMonth]);
        $res = $stmt->fetch();

        // Próximas actividades (próximos 7 días)
        $stmtUpcoming = $db->query("
            SELECT COUNT(*) as upcomingNext7Days
            FROM eventos
            WHERE Estado != 'Cancelado' AND FechaEvento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ");
        $upcoming = $stmtUpcoming->fetch()['upcomingNext7Days'] ?? 0;

        return [
            'totalMonth' => (int)($res['totalMonth'] ?? 0),
            'audiencias' => (int)($res['audiencias'] ?? 0),
            'visitas' => (int)($res['visitas'] ?? 0),
            'entrevistas' => (int)($res['entrevistas'] ?? 0),
            'realizadas' => (int)($res['realizadas'] ?? 0),
            'pendientes' => (int)($res['pendientes'] ?? 0),
            'upcomingNext7Days' => (int)$upcoming,
        ];
    }

    /**
     * Crear un nuevo evento en la agenda
     */
    public function createEvent(array $data, int $workerId): int {
        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $expId = !empty($data['expedienteId']) ? (int)$data['expedienteId'] : null;
            $type = trim($data['type'] ?? 'Audiencia de Conciliación');
            $description = trim($data['description'] ?? $type);
            $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
            $time = !empty($data['time']) ? $data['time'] : '10:00:00';
            $personId = !empty($data['personId']) ? (int)$data['personId'] : null;
            $amount = isset($data['amount']) ? (float)$data['amount'] : null;
            $status = !empty($data['status']) ? $data['status'] : 'Pendiente';

            if (empty($description)) {
                throw new Exception('La descripción o asunto del evento es requerida.');
            }

            // Si no se proporcionó persona citada pero hay expediente, buscar el citado (Rol 2)
            if (!$personId && $expId) {
                $stmtCit = $db->prepare("SELECT IdPersona FROM relacionesuserexp WHERE IdExpediente = ? AND IdRolPersona = 2 LIMIT 1");
                $stmtCit->execute([$expId]);
                $row = $stmtCit->fetch();
                if ($row) $personId = $row['IdPersona'];
            }

            $stmt = $db->prepare("
                INSERT INTO eventos (IdExpediente, IdPersonaInvolucrada, TipoEvento, Descripcion, FechaEvento, HoraEvento, Monto, Estado, IdTrabajador)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$expId, $personId, $type, $description, $date, $time, $amount, $status, $workerId]);
            $eventId = (int)$db->lastInsertId();

            // Crear notificación automática vinculada
            $stmtNotif = $db->prepare("
                INSERT INTO notificaciones (IdEvento, IdExpediente, IdPersonaInvolucrada, Titulo, Mensaje, FechaProgramada, HoraProgramada, Estado, EstadoToast)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Activa', 'Pendiente')
            ");
            $title = "{$type} programada";
            $message = "Se programó: {$description} para el {$date} a las {$time}.";
            $stmtNotif->execute([$eventId, $expId, $personId, $title, $message, $date, $time]);

            $db->commit();
            return $eventId;

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar estado del evento (ej. Realizado, Pendiente, Cancelado)
     */
    public function updateStatus(int $id, string $status): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE eventos SET Estado = ? WHERE IdEvento = ?");
        return $stmt->execute([$status, $id]);
    }

    /**
     * Eliminar evento
     */
    public function deleteEvent(int $id): bool {
        $db = Database::getConnection();
        $db->beginTransaction();
        try {
            $db->prepare("DELETE FROM notificaciones WHERE IdEvento = ?")->execute([$id]);
            $db->prepare("DELETE FROM eventos WHERE IdEvento = ?")->execute([$id]);
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }

    /**
     * Listar notificaciones
     */
    public function listNotifications(int $limit = 50): array {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT 
                n.IdNotificacion as id,
                n.IdEvento as eventId,
                n.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                n.Titulo as title,
                n.Mensaje as message,
                n.FechaProgramada as scheduledDate,
                n.HoraProgramada as scheduledTime,
                n.Estado as status,
                n.EstadoToast as toastStatus
            FROM notificaciones n
            LEFT JOIN expedientes e ON n.IdExpediente = e.IdExpediente
            WHERE n.Estado = 'Activa'
            ORDER BY n.FechaProgramada ASC, n.HoraProgramada ASC
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Marcar notificación como leída o descartada
     */
    public function dismissNotification(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE notificaciones SET Estado = 'Leida' WHERE IdNotificacion = ?");
        return $stmt->execute([$id]);
    }
}

