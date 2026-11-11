<?php
namespace App\Modules\Actas;

use App\Core\Database;
use PDO;
use Exception;

class ActaService {

    /**
     * Listar todas las actas y documentos conciliatorios
     */
    public function listAll(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                a.IdActa as id,
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
                -- Beneficiario NNA
                (
                    SELECT CONCAT(u.Nombres, ' ', u.Apellidos)
                    FROM relacionesuserexp r
                    INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                    WHERE r.IdExpediente = e.IdExpediente AND r.IdRolPersona = 3
                    LIMIT 1
                ) as childName,
                -- Solicitante
                (
                    SELECT CONCAT(u.Nombres, ' ', u.Apellidos)
                    FROM relacionesuserexp r
                    INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                    WHERE r.IdExpediente = e.IdExpediente AND r.IdRolPersona = 1
                    LIMIT 1
                ) as applicantName,
                -- Citado / Obligado
                (
                    SELECT CONCAT(u.Nombres, ' ', u.Apellidos)
                    FROM relacionesuserexp r
                    INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
                    WHERE r.IdExpediente = e.IdExpediente AND r.IdRolPersona = 2
                    LIMIT 1
                ) as suspectName,
                -- Detalles de Conciliación F9A
                f9a.TipoAcuerdo as f9aTipoAcuerdo,
                f9a.Materias as f9aMaterias,
                f9a.TermyCond as f9aTermyCond,
                -- Detalles de Compromiso F10
                f10.Materias as f10Materias,
                f10.Compromisos as f10Compromisos,
                -- Detalles de Invitación F4/F5
                f4.FechaInvitacion as f4Fecha,
                f4.HoraInvitacion as f4Hora,
                -- Detalles de Derivación F7
                f7.InstitucionDest as f7Destino
            FROM actas a
            INNER JOIN tipos_actas ta ON a.IdTipoActa = ta.IdTipoActa
            INNER JOIN expedientes e ON a.IdExpediente = e.IdExpediente
            INNER JOIN trabajadores t ON a.IdTrabajador = t.IdTrabajador
            LEFT JOIN f9a_actaconciliacion f9a ON (a.IdTipoActa = 12 AND a.IdActaEspecifica = f9a.IdF9A)
            LEFT JOIN f10_actacompromiso f10 ON (a.IdTipoActa = 16 AND a.IdActaEspecifica = f10.IdF10)
            LEFT JOIN f4_invitacion f4 ON (a.IdTipoActa = 4 AND a.IdActaEspecifica = f4.IdF4)
            LEFT JOIN f7_ofderivacion f7 ON (a.IdTipoActa = 8 AND a.IdActaEspecifica = f7.IdF7)
            WHERE 1=1
        ";

        $params = [];

        // Filtro por categoría o tipo
        if (!empty($filters['category'])) {
            switch ($filters['category']) {
                case 'conciliacion':
                    $sql .= " AND a.IdTipoActa IN (12, 13, 14, 15)";
                    break;
                case 'invitacion':
                    $sql .= " AND a.IdTipoActa IN (4, 5)";
                    break;
                case 'inasistencia':
                    $sql .= " AND a.IdTipoActa IN (9, 10, 11)";
                    break;
                case 'compromiso':
                    $sql .= " AND a.IdTipoActa = 16";
                    break;
                case 'derivacion':
                    $sql .= " AND a.IdTipoActa = 8";
                    break;
                case 'legal_actas': // Excluir fichas preliminares 1, 2, 3, 17
                    $sql .= " AND a.IdTipoActa NOT IN (1, 2, 3, 17)";
                    break;
            }
        }

        if (!empty($filters['typeId'])) {
            $sql .= " AND a.IdTipoActa = ?";
            $params[] = (int)$filters['typeId'];
        }

        if (!empty($filters['expedienteId'])) {
            $sql .= " AND a.IdExpediente = ?";
            $params[] = (int)$filters['expedienteId'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (a.NombreActa LIKE ? OR e.NombreExpediente LIKE ? OR e.Descripcion LIKE ? OR ta.NombreTipoActa LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY a.FechaActa DESC, a.IdActa DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Estadísticas y contadores de Actas y Conciliaciones
     */
    public function getStats(): array {
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT 
                COUNT(*) as totalActas,
                SUM(CASE WHEN IdTipoActa = 12 THEN 1 ELSE 0 END) as conciliaciones,
                SUM(CASE WHEN IdTipoActa IN (4, 5) THEN 1 ELSE 0 END) as invitaciones,
                SUM(CASE WHEN IdTipoActa IN (9, 10, 11) THEN 1 ELSE 0 END) as inasistencias,
                SUM(CASE WHEN IdTipoActa = 16 THEN 1 ELSE 0 END) as compromisos,
                SUM(CASE WHEN IdTipoActa = 8 THEN 1 ELSE 0 END) as derivaciones
            FROM actas
            WHERE IdTipoActa NOT IN (1, 2, 3, 17)
        ");
        $res = $stmt->fetch();

        // Pensiones activas derivadas de acuerdos
        $stmtPagos = $db->query("
            SELECT 
                COUNT(*) as totalCuotas,
                SUM(CASE WHEN EstadoPago = 'Pagado' THEN 1 ELSE 0 END) as cuotasPagadas,
                SUM(CASE WHEN EstadoPago != 'Pagado' THEN 1 ELSE 0 END) as cuotasPendientes,
                COALESCE(SUM(Monto), 0) as montoTotalPactado
            FROM pagos_realizados
        ");
        $pagos = $stmtPagos->fetch();

        return [
            'total' => (int)($res['totalActas'] ?? 0),
            'conciliaciones' => (int)($res['conciliaciones'] ?? 0),
            'invitaciones' => (int)($res['invitaciones'] ?? 0),
            'inasistencias' => (int)($res['inasistencias'] ?? 0),
            'compromisos' => (int)($res['compromisos'] ?? 0),
            'derivaciones' => (int)($res['derivaciones'] ?? 0),
            'pensiones' => [
                'totalCuotas' => (int)($pagos['totalCuotas'] ?? 0),
                'cuotasPagadas' => (int)($pagos['cuotasPagadas'] ?? 0),
                'cuotasPendientes' => (int)($pagos['cuotasPendientes'] ?? 0),
                'montoTotalPactado' => (float)($pagos['montoTotalPactado'] ?? 0)
            ]
        ];
    }

    /**
     * Obtener detalle completo de un acta para previsualización e impresión
     */
    public function getById(int $id): ?array {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT 
                a.IdActa as id,
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
                -- Detalle F9A Conciliación
                f9a.HechosConciliacion as f9aHechos,
                f9a.Materias as f9aMaterias,
                f9a.PuntosControversia as f9aControversia,
                f9a.TipoAcuerdo as f9aTipoAcuerdo,
                f9a.TermyCond as f9aTermyCond,
                f9a.AccionesDna as f9aAccionesDna,
                f9a.RegistroAbogado as f9aRegAbogado,
                f9a.ColegioAbogados as f9aColAbogados,
                f9a.NyATestigo as f9aTestigoNombre,
                f9a.DniTestigo as f9aTestigoDni,
                -- Detalle F10 Compromiso
                f10.Materias as f10Materias,
                f10.Descripcion as f10Descripcion,
                f10.Compromisos as f10Compromisos,
                f10.AccionesDna as f10AccionesDna,
                -- Detalle F4/F5 Invitación
                f4.FechaInvitacion as f4Fecha,
                f4.HoraInvitacion as f4Hora,
                f4.Asunto as f4Asunto,
                f4.TrabEntrega as f4TrabEntrega,
                -- Detalle F7 Derivación
                f7.Destinatario as f7Destinatario,
                f7.CargoDest as f7Cargo,
                f7.InstitucionDest as f7Institucion,
                f7.Descripcion as f7Descripcion
            FROM actas a
            INNER JOIN tipos_actas ta ON a.IdTipoActa = ta.IdTipoActa
            INNER JOIN expedientes e ON a.IdExpediente = e.IdExpediente
            INNER JOIN trabajadores t ON a.IdTrabajador = t.IdTrabajador
            LEFT JOIN f9a_actaconciliacion f9a ON (a.IdTipoActa = 12 AND a.IdActaEspecifica = f9a.IdF9A)
            LEFT JOIN f10_actacompromiso f10 ON (a.IdTipoActa = 16 AND a.IdActaEspecifica = f10.IdF10)
            LEFT JOIN f4_invitacion f4 ON (a.IdTipoActa = 4 AND a.IdActaEspecifica = f4.IdF4)
            LEFT JOIN f7_ofderivacion f7 ON (a.IdTipoActa = 8 AND a.IdActaEspecifica = f7.IdF7)
            WHERE a.IdActa = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $acta = $stmt->fetch();

        if (!$acta) return null;

        // Obtener partes involucradas del caso
        $stmtParts = $db->prepare("
            SELECT 
                r.IdRolPersona as roleId,
                r.RelacionConNNA as relationship,
                r.Edad as age,
                r.unidad_edad as ageUnit,
                u.IdPersona as personId,
                u.DNI as dni,
                CONCAT(u.Nombres, ' ', u.Apellidos) as fullName,
                u.sexo as gender,
                u.Telefono as phone,
                u.Direccion as address
            FROM relacionesuserexp r
            INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
            WHERE r.IdExpediente = ?
        ");
        $stmtParts->execute([$acta['expedienteId']]);
        $parts = $stmtParts->fetchAll();

        $acta['nna'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 3));
        $acta['solicitantes'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 1));
        $acta['citados'] = array_values(array_filter($parts, fn($p) => $p['roleId'] == 2));

        // Obtener pagos / cronograma si fue conciliación de alimentos
        $stmtPagos = $db->prepare("
            SELECT 
                IdPago as id,
                NumPago as paymentNumber,
                Monto as amount,
                MontoPagado as paidAmount,
                FechaProgramada as dueDate,
                FechaPago as paidDate,
                EstadoPago as status
            FROM pagos_realizados
            WHERE IdExpediente = ?
            ORDER BY NumPago ASC
        ");
        $stmtPagos->execute([$acta['expedienteId']]);
        $acta['pagos'] = $stmtPagos->fetchAll();

        return $acta;
    }

    /**
     * Registrar nueva acta o acuerdo conciliatorio
     */
    public function create(array $data, int $workerId): int {
        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $expedienteId = (int)($data['expedienteId'] ?? 0);
            $typeId = (int)($data['typeId'] ?? 12); // Default 12: Acta de Conciliación
            $date = !empty($data['date']) ? $data['date'] : date('Y-m-d');
            $title = trim($data['title'] ?? '');

            if ($expedienteId <= 0) {
                throw new Exception('Se requiere seleccionar un expediente válido.');
            }

            // Autogenerar número de acta correlativo dentro del tipo
            $stmtLast = $db->prepare("SELECT MAX(NumActa) as lastNum FROM actas WHERE IdTipoActa = ? AND IdExpediente = ?");
            $stmtLast->execute([$typeId, $expedienteId]);
            $lastNum = $stmtLast->fetch()['lastNum'] ?? 0;
            $actNumber = ((int)$lastNum) + 1;

            if (empty($title)) {
                $typeNames = [
                    12 => "Acta de Conciliación N° {$actNumber}",
                    16 => "Acta de Compromiso N° {$actNumber}",
                    4 => "Invitación a Conciliar N° {$actNumber}",
                    5 => "Segunda Invitación a Conciliar N° {$actNumber}",
                    8 => "Oficio de Derivación N° {$actNumber}",
                    9 => "Acta de 1ra Inasistencia N° {$actNumber}",
                    10 => "Acta de 2da Inasistencia N° {$actNumber}",
                    11 => "Acta de Inasistencia de Ambas Partes N° {$actNumber}",
                    13 => "Acta de Desistimiento N° {$actNumber}",
                    14 => "Acta de Suspensión N° {$actNumber}",
                    15 => "Acta de Decisión Motivada N° {$actNumber}"
                ];
                $title = $typeNames[$typeId] ?? "Acta Oficial N° {$actNumber}";
            }

            $specificActId = 0;

            // 1. ACTA DE CONCILIACIÓN (F9A)
            if ($typeId === 12) {
                $hechos = $data['hechos'] ?? 'Las partes se presentan voluntariamente ante la DEMUNA.';
                $materias = $data['materias'] ?? 'Alimentos, Régimen de Visitas y Tenencia';
                $puntos = $data['puntosControversia'] ?? 'Fijación de pensión alimenticia y días de visitas del menor.';
                $tipoAcuerdo = $data['tipoAcuerdo'] ?? 'Acuerdo Total'; // 'Acuerdo Total', 'Acuerdo Parcial'
                $termyCond = $data['termyCond'] ?? 'Las partes acuerdan de mutuo acuerdo el cumplimiento estricto de las cláusulas.';
                $accionesDna = $data['accionesDna'] ?? 'Homologación y seguimiento continuo por parte de la DEMUNA.';
                $regAbogado = $data['regAbogado'] ?? 'CALL-48921';
                $colAbogados = $data['colAbogados'] ?? 'Colegio de Abogados de Piura';
                $nyaTestigo = $data['testigoNombre'] ?? null;
                $dniTestigo = $data['testigoDni'] ?? null;

                $stmtF9 = $db->prepare("
                    INSERT INTO f9a_actaconciliacion (
                        IdTrabajador, HechosConciliacion, Materias, PuntosControversia,
                        TipoAcuerdo, TermyCond, AccionesDna, RegistroAbogado, ColegioAbogados,
                        NyATestigo, DniTestigo, HoraActa
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURTIME())
                ");
                $stmtF9->execute([
                    $workerId, $hechos, $materias, $puntos,
                    $tipoAcuerdo, $termyCond, $accionesDna, $regAbogado, $colAbogados,
                    $nyaTestigo, $dniTestigo
                ]);
                $specificActId = (int)$db->lastInsertId();

                // Si se fijó pensión alimenticia con monto, generar cuotas en pagos_realizados
                $montoPension = !empty($data['montoPension']) ? (float)$data['montoPension'] : 0;
                $numCuotas = !empty($data['numCuotas']) ? (int)$data['numCuotas'] : 6;

                if ($montoPension > 0) {
                    // Buscar al citado / obligado
                    $stmtCitado = $db->prepare("SELECT IdPersona FROM relacionesuserexp WHERE IdExpediente = ? AND IdRolPersona = 2 LIMIT 1");
                    $stmtCitado->execute([$expedienteId]);
                    $citado = $stmtCitado->fetch();
                    $debtorId = $citado['IdPersona'] ?? null;

                    if ($debtorId) {
                        // Crear evento de compromiso en agenda
                        $stmtEvent = $db->prepare("
                            INSERT INTO eventos (TipoEvento, Descripcion, FechaEvento, HoraEvento, Monto, Frecuencia, Estado, IdExpediente, IdTrabajador, IdPersonaInvolucrada)
                            VALUES (?, ?, ?, CURTIME(), ?, 'Mensual', 'Activo', ?, ?, ?)
                        ");
                        $stmtEvent->execute(['Compromiso de Alimentos', "Acuerdo de pensión S/ {$montoPension}", $date, $montoPension, $expedienteId, $workerId, $debtorId]);
                        $alimonyEventId = (int)$db->lastInsertId();

                        for ($i = 1; $i <= $numCuotas; $i++) {
                            $dueDate = date('Y-m-d', strtotime("+$i month", strtotime($date)));
                            $status = ($i === 1) ? 'Próximo Pago' : 'Pendiente';

                            $stmtPago = $db->prepare("
                                INSERT INTO pagos_realizados (IdEvento, IdExpediente, IdPersona, NumPago, Monto, FechaProgramada, EstadoPago)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            ");
                            $stmtPago->execute([$alimonyEventId, $expedienteId, $debtorId, $i, $montoPension, $dueDate, $status]);
                        }
                    }
                }

                // Actualizar estado del caso a Resuelto (IdEstado = 5)
                $db->prepare("UPDATE expedientes SET IdEstado = 5, FechaResuelto = ? WHERE IdExpediente = ?")
                   ->execute([$date, $expedienteId]);

            // 2. ACTA DE COMPROMISO (F10)
            } elseif ($typeId === 16) {
                $materias = $data['materias'] ?? 'Normas de Comportamiento Familiar';
                $desc = $data['descripcion'] ?? $title;
                $compromisos = $data['compromisos'] ?? 'Las partes se comprometen al respeto mutuo y adecuado cuidado del NNA.';
                $accionesDna = $data['accionesDna'] ?? 'Verificación mensual del cumplimiento.';

                $stmtF10 = $db->prepare("
                    INSERT INTO f10_actacompromiso (IdTrabajador, Materias, Descripcion, Compromisos, AccionesDna, NumActaComp, anio, HoraActa)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURTIME())
                ");
                $stmtF10->execute([$workerId, $materias, $desc, $compromisos, $accionesDna, $actNumber, date('Y')]);
                $specificActId = (int)$db->lastInsertId();

                // Actualizar estado a Resuelto
                $db->prepare("UPDATE expedientes SET IdEstado = 5, FechaResuelto = ? WHERE IdExpediente = ?")
                   ->execute([$date, $expedienteId]);

            // 3. INVITACIÓN A CONCILIAR (F4 / F5)
            } elseif ($typeId === 4 || $typeId === 5) {
                $asunto = $data['asunto'] ?? 'Audiencia de Conciliación Extrajudicial';
                $horaCita = !empty($data['horaCita']) ? $data['horaCita'] : '10:00:00';
                $fechaCita = !empty($data['fechaCita']) ? $data['fechaCita'] : $date;
                $trabEntrega = $data['trabEntrega'] ?? 'Notificador DEMUNA';

                // Buscar persona citada
                $stmtCitado = $db->prepare("SELECT IdPersona FROM relacionesuserexp WHERE IdExpediente = ? AND IdRolPersona = 2 LIMIT 1");
                $stmtCitado->execute([$expedienteId]);
                $citado = $stmtCitado->fetch();
                $personId = $citado['IdPersona'] ?? 1;

                $stmtF4 = $db->prepare("
                    INSERT INTO f4_invitacion (
                        IdPersona, FechaInvitacion, HoraInvitacion, Asunto, AsuntoResumen,
                        TrabEntrega, NumeroInvitacion
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmtF4->execute([$personId, $fechaCita, $horaCita, $asunto, $title, $trabEntrega, ($typeId === 5 ? 2 : 1)]);
                $specificActId = (int)$db->lastInsertId();

                // Registrar en agenda / eventos
                $stmtEv = $db->prepare("
                    INSERT INTO eventos (TipoEvento, Descripcion, FechaEvento, HoraEvento, Estado, IdExpediente, IdTrabajador)
                    VALUES (?, ?, ?, ?, 'Pendiente', ?, ?)
                ");
                $stmtEv->execute(['Audiencia de Conciliación', $title, $fechaCita, $horaCita, $expedienteId, $workerId]);
                $eventId = (int)$db->lastInsertId();

                if ($eventId > 0 && $specificActId > 0) {
                    $db->prepare("UPDATE f4_invitacion SET IdEvento = ? WHERE IdF4 = ?")->execute([$eventId, $specificActId]);
                }

            // 4. OFICIO DE DERIVACIÓN (F7)
            } elseif ($typeId === 8) {
                $destinatario = $data['destinatario'] ?? 'Fiscalía Provincial de Familia';
                $cargo = $data['cargoDest'] ?? 'Fiscal Provincial';
                $institucion = $data['institucionDest'] ?? 'Ministerio Público';
                $desc = $data['descripcion'] ?? 'Se remite el expediente por materia no conciliable.';

                $stmtF7 = $db->prepare("
                    INSERT INTO f7_ofderivacion (Destinatario, CargoDest, InstitucionDest, Descripcion)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtF7->execute([$destinatario, $cargo, $institucion, $desc]);
                $specificActId = (int)$db->lastInsertId();

                // Actualizar estado a Derivado (IdEstado = 4)
                $db->prepare("UPDATE expedientes SET IdEstado = 4 WHERE IdExpediente = ?")
                   ->execute([$expedienteId]);

            // 5. ACTAS DE INASISTENCIA (F8A/B/C)
            } elseif ($typeId === 9 || $typeId === 10 || $typeId === 11) {
                $noAsistio = $data['parteNoAsistio'] ?? 'Parte Citada';
                $stmtF8 = $db->prepare("
                    INSERT INTO f8a_acta1rainasistencia (IdTrabajador, ParteNoAsistio, HoraActa)
                    VALUES (?, ?, CURTIME())
                ");
                $stmtF8->execute([$workerId, $noAsistio]);
                $specificActId = (int)$db->lastInsertId();
            }

            // Insertar en tabla general actas
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
     * Eliminar acta
     */
    public function delete(int $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM actas WHERE IdActa = ?");
        return $stmt->execute([$id]);
    }
}
