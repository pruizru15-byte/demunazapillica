<?php
namespace App\Modules\Expedientes;

use App\Core\Database;
use PDO;
use Exception;

class ExpedienteService {
    public function listAll(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                e.IdExpediente as id,
                e.NombreExpediente as code,
                e.Descripcion as subject,
                e.Institucion as institution,
                e.FechaApertura as openDate,
                e.FechaCreacion as createdAt,
                e.IdEstado as statusId,
                es.estado as statusName,
                t.IdTrabajador as workerId,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                (SELECT COUNT(*) FROM actas a WHERE a.IdExpediente = e.IdExpediente) as totalActs
            FROM expedientes e
            INNER JOIN estadoexp es ON e.IdEstado = es.idesexp
            INNER JOIN trabajadores t ON e.IdTrabajador = t.IdTrabajador
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND e.IdEstado = ?";
            $params[] = (int)$filters['status'];
        }

        if (!empty($filters['workerId'])) {
            $sql .= " AND e.IdTrabajador = ?";
            $params[] = (int)$filters['workerId'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (e.NombreExpediente LIKE ? OR e.Descripcion LIKE ? OR e.Institucion LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($filters['year'])) {
            $sql .= " AND YEAR(e.FechaApertura) = ?";
            $params[] = (int)$filters['year'];
        }

        $sql .= " ORDER BY e.IdExpediente DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getNextCorrelative(): string {
        $db = Database::getConnection();
        $currentYear = date('Y');
        $fixedNumber = "20043";

        $stmt = $db->prepare("SELECT MAX(NombreExpediente) as lastCode FROM expedientes WHERE NombreExpediente LIKE ?");
        $stmt->execute(["%-$currentYear-%"]);
        $row = $stmt->fetch();

        $nextNumber = 1;
        if (!empty($row['lastCode'])) {
            $parts = explode('-', $row['lastCode']);
            if (isset($parts[0]) && is_numeric($parts[0])) {
                $nextNumber = intval($parts[0]) + 1;
            }
        }

        $formattedCorrelative = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        return "{$formattedCorrelative}-{$currentYear}-{$fixedNumber}";
    }

    public function getById(int $id): ?array {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT 
                e.IdExpediente as id,
                e.NombreExpediente as code,
                e.Descripcion as subject,
                e.Institucion as institution,
                e.FechaApertura as openDate,
                e.FechaCreacion as createdAt,
                e.HoraCreacion as createdTime,
                e.FechaResuelto as resolvedDate,
                e.FechaConclusion as conclusionDate,
                e.IdEstado as statusId,
                es.estado as statusName,
                t.IdTrabajador as workerId,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName,
                t.DNI as workerDni
            FROM expedientes e
            INNER JOIN estadoexp es ON e.IdEstado = es.idesexp
            INNER JOIN trabajadores t ON e.IdTrabajador = t.IdTrabajador
            WHERE e.IdExpediente = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $exp = $stmt->fetch();

        if (!$exp) return null;

        // Obtener relaciones (personas e instituciones involucradas)
        $stmtRel = $db->prepare("
            SELECT 
                r.IdRelacion as relId,
                r.IdRolPersona as roleId,
                r.SubRol_Inf as subRole,
                r.RelacionConNNA as relationshipWithChild,
                r.Edad as age,
                r.unidad_edad as ageUnit,
                r.Gestante as pregnant,
                u.IdPersona as personId,
                u.DNI as dni,
                u.Nombres as names,
                u.Apellidos as surnames,
                CONCAT(u.Nombres, ' ', u.Apellidos) as fullName,
                u.sexo as gender,
                u.FechaNac as birthDate,
                u.Direccion as address,
                u.Distrito as district,
                u.Telefono as phone,
                u.email as email,
                u.Discapacidad as disability,
                ent.IdEntidad as entityId,
                ent.NombreEntidad as entityName,
                te.NombreTipo as entityTypeName
            FROM relacionesuserexp r
            LEFT JOIN userexternos u ON r.IdPersona = u.IdPersona
            LEFT JOIN entidad ent ON r.IdEntidad = ent.IdEntidad
            LEFT JOIN tipoentidad te ON ent.IdTipoEntidad = te.IdTipoEntidad
            WHERE r.IdExpediente = ?
        ");
        $stmtRel->execute([$id]);
        $relations = $stmtRel->fetchAll();

        // Categorizar las personas según sus roles
        $informants = [];
        $children = [];
        $suspects = [];

        foreach ($relations as $rel) {
            // 1 = Informante, 2 = Presunto Transgresor, 3 = NNA
            if ($rel['roleId'] == 1 || !empty($rel['subRole'])) {
                $informants[] = $rel;
            } elseif ($rel['roleId'] == 2) {
                $suspects[] = $rel;
            } elseif ($rel['roleId'] == 3) {
                $children[] = $rel;
            } else {
                $informants[] = $rel;
            }
        }

        // Obtener actas emitidas
        $stmtActas = $db->prepare("
            SELECT 
                a.IdActa as id,
                a.IdTipoActa as typeId,
                ta.NombreTipoActa as typeName,
                a.NombreActa as title,
                a.FechaActa as actDate,
                a.FechaCreacion as createdAt,
                a.HoraCreacion as createdTime,
                a.IdActaEspecifica as specificActId,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName
            FROM actas a
            LEFT JOIN tipos_actas ta ON a.IdTipoActa = ta.IdTipoActa
            LEFT JOIN trabajadores t ON a.IdTrabajador = t.IdTrabajador
            WHERE a.IdExpediente = ?
            ORDER BY a.FechaActa ASC, a.IdActa ASC
        ");
        $stmtActas->execute([$id]);
        $acts = $stmtActas->fetchAll();

        // Obtener eventos agendados
        $stmtEv = $db->prepare("
            SELECT 
                ev.IdEvento as id,
                ev.TipoEvento as type,
                ev.Descripcion as description,
                ev.FechaEvento as eventDate,
                ev.HoraEvento as eventTime,
                ev.Monto as amount,
                ev.Estado as status
            FROM eventos ev
            WHERE ev.IdExpediente = ?
            ORDER BY ev.FechaEvento DESC
        ");
        $stmtEv->execute([$id]);
        $events = $stmtEv->fetchAll();

        // Obtener calendario de pensiones / pagos
        $stmtPagos = $db->prepare("
            SELECT 
                p.IdPago as id,
                p.NumPago as paymentNumber,
                p.Monto as amount,
                p.MontoPagado as paidAmount,
                p.FechaProgramada as dueDate,
                p.FechaPago as paidDate,
                p.EstadoPago as status,
                CONCAT(u.Nombres, ' ', u.Apellidos) as debtorName
            FROM pagos_realizados p
            LEFT JOIN userexternos u ON p.IdPersona = u.IdPersona
            WHERE p.IdExpediente = ?
            ORDER BY p.NumPago ASC
        ");
        $stmtPagos->execute([$id]);
        $payments = $stmtPagos->fetchAll();

        return [
            'expediente' => $exp,
            'informantes' => $informants,
            'nna' => $children,
            'transgresores' => $suspects,
            'actas' => $acts,
            'eventos' => $events,
            'pagos' => $payments
        ];
    }

    public function create(array $data, int $workerId): int {
        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $code = !empty($data['code']) ? trim($data['code']) : $this->getNextCorrelative();
            $subject = trim($data['subject'] ?? 'Atención de caso DEMUNA');
            $institution = !empty($data['institution']) ? trim($data['institution']) : null;
            $openDate = !empty($data['openDate']) ? $data['openDate'] : date('Y-m-d');
            $createdDate = date('Y-m-d');
            $createdTime = date('H:i:s');
            $statusId = 1; // Pendiente

            // 1. Insertar Expediente
            $stmtExp = $db->prepare("
                INSERT INTO expedientes (IdEstado, NombreExpediente, Descripcion, Institucion, IdTrabajador, FechaCreacion, HoraCreacion, FechaApertura)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtExp->execute([$statusId, $code, $subject, $institution, $workerId, $createdDate, $createdTime, $openDate]);
            $expId = (int)$db->lastInsertId();

            // 2. Procesar Informantes
            if (!empty($data['informants']) && is_array($data['informants'])) {
                foreach ($data['informants'] as $inf) {
                    $this->saveRelationPerson($db, $expId, $inf, 1);
                }
            }

            // 3. Procesar NNA (Beneficiarios)
            if (!empty($data['children']) && is_array($data['children'])) {
                foreach ($data['children'] as $child) {
                    $this->saveRelationPerson($db, $expId, $child, 3);
                }
            }

            // 4. Procesar Presunto Transgresor
            if (!empty($data['suspect']) && is_array($data['suspect'])) {
                $this->saveRelationPerson($db, $expId, $data['suspect'], 2);
            }

            $db->commit();
            return $expId;

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    private function saveRelationPerson(PDO $db, int $expId, array $p, int $roleId): void {
        // Si es informante anónimo
        if (!empty($p['isAnonymous'])) {
            $names = 'Informante';
            $surnames = 'Anónimo';
            $stmtP = $db->prepare("INSERT INTO userexternos (Nombres, Apellidos, IdentidadEstado) VALUES (?, ?, 'TEMPORAL')");
            $stmtP->execute([$names, $surnames]);
            $personId = (int)$db->lastInsertId();

            $stmtRel = $db->prepare("INSERT INTO relacionesuserexp (IdExpediente, IdPersona, SubRol_Inf, IdRolPersona) VALUES (?, ?, 'Informante', ?)");
            $stmtRel->execute([$expId, $personId, $roleId]);
            return;
        }

        // Si es una entidad institucional (ej. PNP, Centro de Salud)
        if (!empty($p['isEntity']) && !empty($p['entityName'])) {
            $stmtEnt = $db->prepare("INSERT INTO entidad (NombreEntidad, Direccion, Telefono) VALUES (?, ?, ?)");
            $stmtEnt->execute([$p['entityName'], $p['address'] ?? null, $p['phone'] ?? null]);
            $entityId = (int)$db->lastInsertId();

            $stmtRel = $db->prepare("INSERT INTO relacionesuserexp (IdExpediente, IdEntidad, SubRol_Inf, IdRolPersona) VALUES (?, ?, ?, ?)");
            $stmtRel->execute([$expId, $entityId, $p['subRole'] ?? 'Institución', $roleId]);
            return;
        }

        // Persona natural
        $dni = !empty($p['dni']) && strlen(trim($p['dni'])) === 8 ? trim($p['dni']) : null;
        $names = ucwords(strtolower(trim($p['names'] ?? '')));
        $surnames = ucwords(strtolower(trim($p['surnames'] ?? '')));
        $gender = !empty($p['gender']) ? trim($p['gender']) : null;
        $birthDate = !empty($p['birthDate']) ? $p['birthDate'] : null;
        $address = !empty($p['address']) ? trim($p['address']) : null;
        $district = !empty($p['district']) ? trim($p['district']) : null;
        $phone = !empty($p['phone']) ? trim($p['phone']) : null;
        $email = !empty($p['email']) ? trim($p['email']) : null;
        $identityStatus = $dni ? 'VALIDADA' : 'TEMPORAL';

        // Buscar si la persona ya existe por DNI
        $personId = null;
        if ($dni) {
            $stmtSearch = $db->prepare("SELECT IdPersona FROM userexternos WHERE DNI = ? LIMIT 1");
            $stmtSearch->execute([$dni]);
            $existing = $stmtSearch->fetch();
            if ($existing) {
                $personId = (int)$existing['IdPersona'];
                // Actualizar datos
                $stmtUp = $db->prepare("UPDATE userexternos SET Telefono = COALESCE(?, Telefono), Direccion = COALESCE(?, Direccion), email = COALESCE(?, email) WHERE IdPersona = ?");
                $stmtUp->execute([$phone, $address, $email, $personId]);
            }
        }

        if (!$personId) {
            $stmtInsert = $db->prepare("
                INSERT INTO userexternos (DNI, FechaNac, sexo, Nombres, Apellidos, Direccion, Distrito, Telefono, email, IdentidadEstado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtInsert->execute([$dni, $birthDate, $gender, $names, $surnames, $address, $district, $phone, $email, $identityStatus]);
            $personId = (int)$db->lastInsertId();
        }

        // Vincular a relacionesuserexp
        $subRole = !empty($p['subRole']) ? $p['subRole'] : null;
        $relationWithNna = !empty($p['relationship']) ? $p['relationship'] : null;
        $age = isset($p['age']) && is_numeric($p['age']) ? (int)$p['age'] : null;
        $ageUnit = !empty($p['ageUnit']) ? $p['ageUnit'] : 'año';
        $pregnant = !empty($p['pregnant']) ? 'Si' : 'No';

        $stmtRel = $db->prepare("
            INSERT INTO relacionesuserexp (IdExpediente, IdPersona, SubRol_Inf, RelacionConNNA, IdRolPersona, Edad, unidad_edad, Gestante)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtRel->execute([$expId, $personId, $subRole, $relationWithNna, $roleId, $age, $ageUnit, $pregnant]);
    }

    public function updateStatus(int $expId, int $newStatusId): bool {
        $db = Database::getConnection();
        $fields = ["IdEstado = ?"];
        $params = [$newStatusId];

        if ($newStatusId == 5) { // Resuelto
            $fields[] = "FechaResuelto = CURDATE(), HoraResuelto = CURTIME()";
        } elseif ($newStatusId == 6 || $newStatusId == 4) { // Concluido o Derivado
            $fields[] = "FechaConclusion = CURDATE(), HoraConclusion = CURTIME()";
        }

        $sql = "UPDATE expedientes SET " . implode(", ", $fields) . " WHERE IdExpediente = ?";
        $params[] = $expId;

        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }
}

