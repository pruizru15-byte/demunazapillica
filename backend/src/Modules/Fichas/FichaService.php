<?php
namespace App\Modules\Fichas;

use App\Core\Database;
use PDO;
use Exception;

class FichaService {

    /**
     * Listar fichas de atención con filtros
     */
    public function listAll(array $filters = []): array {
        $db = Database::getConnection();

        // 1. Obtener fichas registradas en la tabla 'actas'
        // Tipos de fichas principales en DEMUNA:
        // 1 = Ficha de Recepción de Casos
        // 2 = Ficha de Entrevista
        // 3 = Ficha de Visita
        // 17 = Ficha de Seguimiento
        // 4 = Invitación, 5 = Invitación a Conciliar, etc.

        $sql = "
            SELECT 
                a.IdActa as id,
                'acta_ficha' as source,
                a.IdTipoActa as typeId,
                ta.NombreTipoActa as typeName,
                a.NombreActa as title,
                a.NumActa as actNumber,
                a.FechaActa as date,
                a.FechaCreacion as createdAt,
                a.HoraCreacion as createdTime,
                a.IdActaEspecifica as specificActId,
                e.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                e.Descripcion as expedienteSubject,
                e.IdEstado as expedienteStatusId,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                t.DNI as workerDni,
                -- Obtener nombre del NNA si existe
                (
                    SELECT CONCAT(u.Nombres, ' ', u.Apellidos)
                    FROM relacionesuserexp r
                    INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                    WHERE r.IdExpediente = e.IdExpediente AND r.IdRolPersona = 3
                    LIMIT 1
                ) as childName,
                -- Obtener solicitante si existe
                (
                    SELECT CONCAT(u.Nombres, ' ', u.Apellidos)
                    FROM relacionesuserexp r
                    INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                    WHERE r.IdExpediente = e.IdExpediente AND r.IdRolPersona = 1
                    LIMIT 1
                ) as applicantName,
                -- Datos de detalle específicos según el tipo
                f1.ResumenHecho as f1Resumen,
                f1.AtencionPrevia as f1AtencionPrevia,
                f1.AccionArealizar as f1Accion,
                f2.NumEntrevXexp as f2Num,
                f2.Ubicacion as f2Ubicacion,
                f3.NumVisitaXexp as f3Num,
                f3.Ubicacion as f3Ubicacion,
                f11.NumSeguimiento as f11Num,
                f11.Ubicacion as f11Ubicacion
            FROM actas a
            INNER JOIN tipos_actas ta ON a.IdTipoActa = ta.IdTipoActa
            INNER JOIN expedientes e ON a.IdExpediente = e.IdExpediente
            INNER JOIN trabajadores t ON a.IdTrabajador = t.IdTrabajador
            LEFT JOIN f1_fichareg f1 ON (a.IdTipoActa = 1 AND a.IdActaEspecifica = f1.IdF1)
            LEFT JOIN f2_fichaentrevista f2 ON (a.IdTipoActa = 2 AND a.IdActaEspecifica = f2.IdF2)
            LEFT JOIN f3_fichavisita f3 ON (a.IdTipoActa = 3 AND a.IdActaEspecifica = f3.IdF3)
            LEFT JOIN f11_fichaseguimiento f11 ON (a.IdTipoActa = 17 AND a.IdActaEspecifica = f11.IdF11)
            WHERE 1=1
        ";

        $params = [];

        // Filtro por tipo específico
        if (!empty($filters['typeId'])) {
            $sql .= " AND a.IdTipoActa = ?";
            $params[] = (int)$filters['typeId'];
        } elseif (!empty($filters['category'])) {
            switch ($filters['category']) {
                case 'recepcion':
                    $sql .= " AND a.IdTipoActa = 1";
                    break;
                case 'entrevista':
                    $sql .= " AND a.IdTipoActa = 2";
                    break;
                case 'visita':
                    $sql .= " AND a.IdTipoActa = 3";
                    break;
                case 'seguimiento':
                    $sql .= " AND a.IdTipoActa = 17";
                    break;
                case 'fichas_todas':
                    $sql .= " AND a.IdTipoActa IN (1, 2, 3, 17)";
                    break;
            }
        }

        // Filtro por expediente
        if (!empty($filters['expedienteId'])) {
            $sql .= " AND a.IdExpediente = ?";
            $params[] = (int)$filters['expedienteId'];
        }

        // Búsqueda por término
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (a.NombreActa LIKE ? OR e.NombreExpediente LIKE ? OR e.Descripcion LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY a.FechaActa DESC, a.IdActa DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $fichas = $stmt->fetchAll();

        // 2. Si no se filtró por un tipo incompatible, incluir orientaciones rápidas como tipo 'orientacion'
        $includeOrientaciones = empty($filters['typeId']) && (empty($filters['category']) || $filters['category'] === 'orientacion' || $filters['category'] === 'todas');

        if ($includeOrientaciones) {
            $sqlReg = "
                SELECT 
                    r.IdRegInfo as id,
                    'orientacion' as source,
                    99 as typeId,
                    'Orientación Rápida' as typeName,
                    CONCAT('Consulta: ', SUBSTRING(r.MotivoOrientacion, 1, 40), '...') as title,
                    r.IdRegInfo as actNumber,
                    r.Fecha as date,
                    r.Fecha as createdAt,
                    '00:00:00' as createdTime,
                    0 as specificActId,
                    NULL as expedienteId,
                    'ATENCIÓN EXPRESS' as expedienteCode,
                    r.MotivoOrientacion as expedienteSubject,
                    1 as expedienteStatusId,
                    CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                    t.DNI as workerDni,
                    NULL as childName,
                    CONCAT(u.Nombres, ' ', u.Apellidos) as applicantName,
                    r.MotivoOrientacion as f1Resumen,
                    NULL as f1AtencionPrevia,
                    'Orientación y Asesoría' as f1Accion,
                    NULL as f2Num,
                    u.Direccion as f2Ubicacion,
                    NULL as f3Num,
                    u.Direccion as f3Ubicacion,
                    NULL as f11Num,
                    NULL as f11Ubicacion
                FROM registroinfo r
                INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                INNER JOIN trabajadores t ON r.IdTrabajador = t.IdTrabajador
                WHERE 1=1
            ";

            $regParams = [];
            if (!empty($filters['search'])) {
                $term = '%' . trim($filters['search']) . '%';
                $sqlReg .= " AND (r.MotivoOrientacion LIKE ? OR u.Nombres LIKE ? OR u.Apellidos LIKE ? OR u.DNI LIKE ?)";
                $regParams[] = $term;
                $regParams[] = $term;
                $regParams[] = $term;
                $regParams[] = $term;
            }

            $sqlReg .= " ORDER BY r.Fecha DESC, r.IdRegInfo DESC";

            $stmtReg = $db->prepare($sqlReg);
            $stmtReg->execute($regParams);
            $orientaciones = $stmtReg->fetchAll();

            if (!empty($filters['category']) && $filters['category'] === 'orientacion') {
                return $orientaciones;
            }

            // Unir y ordenar por fecha descendente
            $all = array_merge($fichas, $orientaciones);
            usort($all, function ($a, $b) {
                return strcmp($b['date'] . ' ' . ($b['createdTime'] ?? '00:00:00'), $a['date'] . ' ' . ($a['createdTime'] ?? '00:00:00'));
            });
            return $all;
        }

        return $fichas;
    }

    /**
     * Obtener estadísticas / contadores por tipo de ficha
     */
    public function getStats(): array {
        $db = Database::getConnection();

        // Contar por tipo en tabla actas
        $stmt = $db->query("
            SELECT 
                COUNT(*) as totalFichas,
                SUM(CASE WHEN IdTipoActa = 1 THEN 1 ELSE 0 END) as recepcionCount,
                SUM(CASE WHEN IdTipoActa = 2 THEN 1 ELSE 0 END) as entrevistaCount,
                SUM(CASE WHEN IdTipoActa = 3 THEN 1 ELSE 0 END) as visitaCount,
                SUM(CASE WHEN IdTipoActa = 17 THEN 1 ELSE 0 END) as seguimientoCount
            FROM actas
            WHERE IdTipoActa IN (1, 2, 3, 17)
        ");
        $counts = $stmt->fetch();

        // Contar orientaciones express
        $stmtOrient = $db->query("SELECT COUNT(*) as totalOrientaciones FROM registroinfo");
        $orientCount = $stmtOrient->fetch()['totalOrientaciones'] ?? 0;

        $totalGeneral = (int)($counts['totalFichas'] ?? 0) + (int)$orientCount;

        return [
            'total' => $totalGeneral,
            'recepcion' => (int)($counts['recepcionCount'] ?? 0),
            'entrevista' => (int)($counts['entrevistaCount'] ?? 0),
            'visita' => (int)($counts['visitaCount'] ?? 0),
            'seguimiento' => (int)($counts['seguimientoCount'] ?? 0),
            'orientacion' => (int)$orientCount,
        ];
    }

    /**
     * Obtener detalle completo de una ficha
     */
    public function getById(int $id, string $source = 'acta_ficha'): ?array {
        $db = Database::getConnection();

        if ($source === 'orientacion') {
            $stmt = $db->prepare("
                SELECT 
                    r.IdRegInfo as id,
                    'orientacion' as source,
                    99 as typeId,
                    'Orientación Rápida' as typeName,
                    'Atención y Consulta Ciudadana' as title,
                    r.IdRegInfo as actNumber,
                    r.Fecha as date,
                    r.MotivoOrientacion as reason,
                    u.IdPersona as personId,
                    u.DNI as applicantDni,
                    CONCAT(u.Nombres, ' ', u.Apellidos) as applicantName,
                    u.Telefono as applicantPhone,
                    u.Direccion as applicantAddress,
                    r.edad as applicantAge,
                    r.unidad_edad as applicantAgeUnit,
                    CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                    t.DNI as workerDni
                FROM registroinfo r
                INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                INNER JOIN trabajadores t ON r.IdTrabajador = t.IdTrabajador
                WHERE r.IdRegInfo = ?
                LIMIT 1
            ");
            $stmt->execute([$id]);
            return $stmt->fetch() ?: null;
        }

        // Buscar en tabla actas
        $stmt = $db->prepare("
            SELECT 
                a.IdActa as id,
                'acta_ficha' as source,
                a.IdTipoActa as typeId,
                ta.NombreTipoActa as typeName,
                a.NombreActa as title,
                a.NumActa as actNumber,
                a.FechaActa as date,
                a.FechaCreacion as createdAt,
                a.HoraCreacion as createdTime,
                a.IdActaEspecifica as specificActId,
                e.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                e.Descripcion as expedienteSubject,
                e.Institucion as expedienteInstitution,
                e.FechaApertura as expedienteOpenDate,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                t.DNI as workerDni,
                -- Detalle F1
                f1.ResumenHecho as f1Resumen,
                f1.AtencionPrevia as f1AtencionPrevia,
                f1.DetalleAtencion as f1DetalleAtencion,
                f1.AccionArealizar as f1Accion,
                -- Detalle F2
                f2.NumEntrevXexp as f2Num,
                f2.Ubicacion as f2Ubicacion,
                -- Detalle F3
                f3.NumVisitaXexp as f3Num,
                f3.Ubicacion as f3Ubicacion,
                -- Detalle F11
                f11.NumSeguimiento as f11Num,
                f11.Ubicacion as f11Ubicacion
            FROM actas a
            INNER JOIN tipos_actas ta ON a.IdTipoActa = ta.IdTipoActa
            INNER JOIN expedientes e ON a.IdExpediente = e.IdExpediente
            INNER JOIN trabajadores t ON a.IdTrabajador = t.IdTrabajador
            LEFT JOIN f1_fichareg f1 ON (a.IdTipoActa = 1 AND a.IdActaEspecifica = f1.IdF1)
            LEFT JOIN f2_fichaentrevista f2 ON (a.IdTipoActa = 2 AND a.IdActaEspecifica = f2.IdF2)
            LEFT JOIN f3_fichavisita f3 ON (a.IdTipoActa = 3 AND a.IdActaEspecifica = f3.IdF3)
            LEFT JOIN f11_fichaseguimiento f11 ON (a.IdTipoActa = 17 AND a.IdActaEspecifica = f11.IdF11)
            WHERE a.IdActa = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $ficha = $stmt->fetch();

        if (!$ficha) return null;

        // Obtener partes involucradas del expediente
        $stmtParts = $db->prepare("
            SELECT 
                r.IdRolPersona as roleId,
                r.RelacionConNNA as relationship,
                r.Edad as age,
                r.unidad_edad as ageUnit,
                u.DNI as dni,
                CONCAT(u.Nombres, ' ', u.Apellidos) as fullName,
                u.sexo as gender,
                u.Telefono as phone,
                u.Direccion as address
            FROM relacionesuserexp r
            INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
            WHERE r.IdExpediente = ?
        ");
        $stmtParts->execute([$ficha['expedienteId']]);
        $parts = $stmtParts->fetchAll();

        $ficha['nna'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 3));
        $ficha['solicitantes'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 1));
        $ficha['citados'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 2));

        return $ficha;
    }

    /**
     * Crear nueva ficha de atención
     */
    public function create(array $data, int $workerId): int {
        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $typeId = (int)($data['typeId'] ?? 1); // 1 = Recepción, 2 = Entrevista, 3 = Visita, 17 = Seguimiento, 99 = Orientación
            $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
            $title = trim($data['title'] ?? '');

            // Caso Orientación Rápida (sin expediente previo)
            if ($typeId === 99) {
                $dni = !empty($data['dni']) ? trim($data['dni']) : null;
                $names = trim($data['names'] ?? 'Atención Ciudadana');
                $surnames = trim($data['surnames'] ?? '');
                $phone = !empty($data['phone']) ? trim($data['phone']) : null;
                $address = !empty($data['address']) ? trim($data['address']) : null;
                $reason = trim($data['reason'] ?? $title);
                $age = !empty($data['age']) ? (int)$data['age'] : null;
                $ageUnit = !empty($data['ageUnit']) ? $data['ageUnit'] : 'año';

                $personId = null;
                if ($dni) {
                    $stmtP = $db->prepare("SELECT IdPersona FROM userexternos WHERE DNI = ? LIMIT 1");
                    $stmtP->execute([$dni]);
                    $row = $stmtP->fetch();
                    if ($row) $personId = $row['IdPersona'];
                }

                if (!$personId) {
                    $stmtIns = $db->prepare("
                        INSERT INTO userexternos (DNI, Nombres, Apellidos, Telefono, Direccion)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    $stmtIns->execute([$dni, $names, $surnames, $phone, $address]);
                    $personId = (int)$db->lastInsertId();
                }

                $stmtReg = $db->prepare("
                    INSERT INTO registroinfo (Fecha, IdPersona, edad, unidad_edad, MotivoOrientacion, IdTrabajador)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmtReg->execute([$date, $personId, $age, $ageUnit, $reason, $workerId]);
                $regId = (int)$db->lastInsertId();

                $db->commit();
                return $regId;
            }

            // Ficha vinculada a expediente
            $expedienteId = (int)($data['expedienteId'] ?? 0);
            if ($expedienteId <= 0) {
                throw new Exception('Se requiere seleccionar un expediente válido para esta ficha.');
            }

            // Autogenerar número de acta correlativo dentro del tipo
            $stmtLast = $db->prepare("SELECT MAX(NumActa) as lastNum FROM actas WHERE IdTipoActa = ? AND IdExpediente = ?");
            $stmtLast->execute([$typeId, $expedienteId]);
            $lastNum = $stmtLast->fetch()['lastNum'] ?? 0;
            $actNumber = ((int)$lastNum) + 1;

            if (empty($title)) {
                $typeNames = [
                    1 => "Ficha de Recepción N° {$actNumber}",
                    2 => "Ficha de Entrevista N° {$actNumber}",
                    3 => "Ficha de Visita Domiciliaria N° {$actNumber}",
                    17 => "Ficha de Seguimiento y Monitoreo N° {$actNumber}"
                ];
                $title = $typeNames[$typeId] ?? "Ficha de Atención N° {$actNumber}";
            }

            // Crear registro específico según el tipo
            $specificActId = 0;

            if ($typeId === 1) { // Ficha 1: Recepción
                $prev = $data['atencionPrevia'] ?? 'No';
                $det = $data['detalleAtencion'] ?? null;
                $resumen = $data['resumenHecho'] ?? $title;
                $accion = $data['accionArealizar'] ?? 'Trámite e investigación preliminar';

                $stmtF1 = $db->prepare("
                    INSERT INTO f1_fichareg (AtencionPrevia, DetalleAtencion, ResumenHecho, AccionArealizar)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtF1->execute([$prev, $det, $resumen, $accion]);
                $specificActId = (int)$db->lastInsertId();

            } elseif ($typeId === 2) { // Ficha 2: Entrevista
                $ubicacion = $data['ubicacion'] ?? 'Oficina DEMUNA';
                $stmtF2 = $db->prepare("INSERT INTO f2_fichaentrevista (NumEntrevXexp, Ubicacion) VALUES (?, ?)");
                $stmtF2->execute([$actNumber, $ubicacion]);
                $specificActId = (int)$db->lastInsertId();

            } elseif ($typeId === 3) { // Ficha 3: Visita
                $ubicacion = $data['ubicacion'] ?? 'Domicilio de las partes';
                $stmtF3 = $db->prepare("INSERT INTO f3_fichavisita (NumVisitaXexp, Ubicacion) VALUES (?, ?)");
                $stmtF3->execute([$actNumber, $ubicacion]);
                $specificActId = (int)$db->lastInsertId();

            } elseif ($typeId === 17) { // Ficha 11 / 17: Seguimiento
                $ubicacion = $data['ubicacion'] ?? 'Domicilio o vía telefónica';
                $stmtF11 = $db->prepare("INSERT INTO f11_fichaseguimiento (NumSeguimiento, Ubicacion) VALUES (?, ?)");
                $stmtF11->execute([$actNumber, $ubicacion]);
                $specificActId = (int)$db->lastInsertId();
            }

            // Insertar en tabla actas
            $stmtActa = $db->prepare("
                INSERT INTO actas (
                    IdTipoActa, NombreActa, NumActa, FechaActa, FechaCreacion, HoraCreacion,
                    IdActaEspecifica, IdExpediente, IdTrabajador
                ) VALUES (?, ?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?)
            ");
            $stmtActa->execute([$typeId, $title, $actNumber, $date, $specificActId, $expedienteId, $workerId]);
            $actId = (int)$db->lastInsertId();

            $db->commit();
            return $actId;

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Eliminar ficha
     */
    public function delete(int $id, string $source = 'acta_ficha'): bool {
        $db = Database::getConnection();

        if ($source === 'orientacion') {
            $stmt = $db->prepare("DELETE FROM registroinfo WHERE IdRegInfo = ?");
            return $stmt->execute([$id]);
        }

        $stmt = $db->prepare("DELETE FROM actas WHERE IdActa = ?");
        return $stmt->execute([$id]);
    }
}

