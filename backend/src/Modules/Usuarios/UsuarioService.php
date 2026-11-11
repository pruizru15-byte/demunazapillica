<?php
namespace App\Modules\Usuarios;

use App\Core\Database;
use PDO;
use Exception;

class UsuarioService {

    /**
     * Listar usuarios con información de trabajador, rol y métricas de carga
     */
    public function list(array $filters = []): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                u.IdLogin as id,
                u.IdTrabajador as workerId,
                u.IdRol as roleId,
                r.NombreRol as roleName,
                u.Estado as status,
                u.UltimoInicioSesion as lastLogin,
                t.Nombres as firstName,
                t.Apellidos as lastName,
                CONCAT(t.Nombres, ' ', t.Apellidos) as fullName,
                t.DNI as dni,
                t.Email as email,
                t.NumTelef as phone,
                t.Cargo as jobTitle,
                t.FechaRegistro as createdAt,
                (SELECT COUNT(*) FROM expedientes exp WHERE exp.IdTrabajador = t.IdTrabajador) as caseCount,
                (SELECT COUNT(*) FROM actas act WHERE act.IdTrabajador = t.IdTrabajador) as actaCount,
                (SELECT COUNT(*) FROM eventos ev WHERE ev.IdTrabajador = t.IdTrabajador) as eventCount
            FROM usuarioslg u
            INNER JOIN trabajadores t ON u.IdTrabajador = t.IdTrabajador
            INNER JOIN rol r ON u.IdRol = r.IdRol
            WHERE 1=1
        ";

        $params = [];

        // Filtro por Rol
        if (!empty($filters['roleId']) && $filters['roleId'] !== 'all') {
            $sql .= " AND u.IdRol = ?";
            $params[] = (int)$filters['roleId'];
        }

        // Filtro por Estado: 'Activo', 'Inactivo', o 'all'
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= " AND u.Estado = ?";
            $params[] = $filters['status'];
        }

        // Búsqueda libre
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (t.Nombres LIKE ? OR t.Apellidos LIKE ? OR t.DNI LIKE ? OR t.Email LIKE ? OR t.Cargo LIKE ? OR r.NombreRol LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY (u.Estado = 'Activo') DESC, u.IdRol ASC, t.Nombres ASC";

        if (!empty($filters['limit'])) {
            $sql .= " LIMIT " . (int)$filters['limit'];
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener estadísticas globales de usuarios
     */
    public function getStats(): array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN u.Estado = 'Activo' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN u.Estado = 'Inactivo' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN u.IdRol = 1 THEN 1 ELSE 0 END) as developers,
                SUM(CASE WHEN u.IdRol = 2 THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN u.IdRol = 3 THEN 1 ELSE 0 END) as workers,
                SUM(CASE WHEN u.UltimoInicioSesion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as activeRecently
            FROM usuarioslg u
        ";

        $stmt = $db->query($sql);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);

        return [
            'total' => (int)($res['total'] ?? 0),
            'active' => (int)($res['active'] ?? 0),
            'inactive' => (int)($res['inactive'] ?? 0),
            'developers' => (int)($res['developers'] ?? 0),
            'admins' => (int)($res['admins'] ?? 0),
            'workers' => (int)($res['workers'] ?? 0),
            'activeRecently' => (int)($res['activeRecently'] ?? 0),
        ];
    }

    /**
     * Listar todos los roles del sistema
     */
    public function getRoles(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT IdRol as id, NombreRol as name FROM rol ORDER BY IdRol ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener un usuario por su IdLogin con métricas 360°
     */
    public function getById(int $id): ?array {
        $db = Database::getConnection();

        $sql = "
            SELECT 
                u.IdLogin as id,
                u.IdTrabajador as workerId,
                u.IdRol as roleId,
                r.NombreRol as roleName,
                u.Estado as status,
                u.UltimoInicioSesion as lastLogin,
                t.Nombres as firstName,
                t.Apellidos as lastName,
                CONCAT(t.Nombres, ' ', t.Apellidos) as fullName,
                t.DNI as dni,
                t.Email as email,
                t.NumTelef as phone,
                t.Cargo as jobTitle,
                t.FechaRegistro as createdAt,
                (SELECT COUNT(*) FROM expedientes exp WHERE exp.IdTrabajador = t.IdTrabajador) as caseCount,
                (SELECT COUNT(*) FROM actas act WHERE act.IdTrabajador = t.IdTrabajador) as actaCount,
                (SELECT COUNT(*) FROM eventos ev WHERE ev.IdTrabajador = t.IdTrabajador) as eventCount
            FROM usuarioslg u
            INNER JOIN trabajadores t ON u.IdTrabajador = t.IdTrabajador
            INNER JOIN rol r ON u.IdRol = r.IdRol
            WHERE u.IdLogin = ?
            LIMIT 1
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    /**
     * Crear un nuevo usuario y su ficha de trabajador de forma transaccional
     */
    public function create(array $data): int {
        $db = Database::getConnection();

        $dni = preg_replace('/\D/', '', trim($data['dni'] ?? ''));
        $nombres = trim($data['firstName'] ?? $data['nombres'] ?? '');
        $apellidos = trim($data['lastName'] ?? $data['apellidos'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? $data['numTelef'] ?? '');
        $cargo = trim($data['jobTitle'] ?? $data['cargo'] ?? 'Especialista DEMUNA');
        $password = trim($data['password'] ?? '');
        $roleId = !empty($data['roleId']) ? (int)$data['roleId'] : 3;
        $estado = !empty($data['status']) && in_array($data['status'], ['Activo', 'Inactivo']) ? $data['status'] : 'Activo';

        // Validaciones
        if (strlen($dni) !== 8) {
            throw new Exception('El DNI debe tener exactamente 8 dígitos numéricos.');
        }

        if (empty($nombres) || empty($apellidos)) {
            throw new Exception('Los nombres y apellidos del trabajador son obligatorios.');
        }

        if (empty($password) || strlen($password) < 6) {
            throw new Exception('La contraseña debe tener al menos 6 caracteres.');
        }

        // Verificar DNI duplicado
        $stmtCheckDni = $db->prepare("SELECT IdTrabajador FROM trabajadores WHERE DNI = ? LIMIT 1");
        $stmtCheckDni->execute([$dni]);
        if ($stmtCheckDni->fetch()) {
            throw new Exception("Ya existe un trabajador registrado con el DNI {$dni}.");
        }

        // Verificar Email duplicado si se ingresó
        if (!empty($email)) {
            $stmtCheckEmail = $db->prepare("SELECT IdTrabajador FROM trabajadores WHERE Email = ? LIMIT 1");
            $stmtCheckEmail->execute([$email]);
            if ($stmtCheckEmail->fetch()) {
                throw new Exception("El correo {$email} ya está registrado en el sistema.");
            }
        }

        // Verificar rol existente
        $stmtCheckRol = $db->prepare("SELECT IdRol FROM rol WHERE IdRol = ? LIMIT 1");
        $stmtCheckRol->execute([$roleId]);
        if (!$stmtCheckRol->fetch()) {
            throw new Exception('El rol seleccionado no es válido.');
        }

        $db->beginTransaction();
        try {
            // 1. Insertar trabajador
            $stmtTrabajador = $db->prepare("
                INSERT INTO trabajadores (Nombres, Apellidos, DNI, NumTelef, Email, Cargo, FechaRegistro)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmtTrabajador->execute([$nombres, $apellidos, $dni, $phone, $email, $cargo]);
            $workerId = (int)$db->lastInsertId();

            // 2. Insertar cuenta de acceso
            $hashPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmtUsuario = $db->prepare("
                INSERT INTO usuarioslg (IdTrabajador, Contraseña, IdRol, Estado)
                VALUES (?, ?, ?, ?)
            ");
            $stmtUsuario->execute([$workerId, $hashPassword, $roleId, $estado]);
            $loginId = (int)$db->lastInsertId();

            $db->commit();
            return $loginId;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar datos personales y credenciales de rol/estado
     */
    public function update(int $id, array $data): bool {
        $db = Database::getConnection();

        $currentUser = $this->getById($id);
        if (!$currentUser) {
            throw new Exception('Usuario no encontrado.');
        }

        $workerId = (int)$currentUser['workerId'];

        $nombres = trim($data['firstName'] ?? $data['nombres'] ?? $currentUser['firstName']);
        $apellidos = trim($data['lastName'] ?? $data['apellidos'] ?? $currentUser['lastName']);
        $email = strtolower(trim($data['email'] ?? $currentUser['email']));
        $phone = trim($data['phone'] ?? $data['numTelef'] ?? $currentUser['phone']);
        $cargo = trim($data['jobTitle'] ?? $data['cargo'] ?? $currentUser['jobTitle']);
        $roleId = !empty($data['roleId']) ? (int)$data['roleId'] : (int)$currentUser['roleId'];
        $estado = !empty($data['status']) && in_array($data['status'], ['Activo', 'Inactivo']) ? $data['status'] : $currentUser['status'];

        if (empty($nombres) || empty($apellidos)) {
            throw new Exception('Los nombres y apellidos son requeridos.');
        }

        // Si se envió un nuevo DNI, validar formato y unicidad
        $dni = !empty($data['dni']) ? preg_replace('/\D/', '', trim($data['dni'])) : $currentUser['dni'];
        if (strlen($dni) !== 8) {
            throw new Exception('El DNI debe tener 8 dígitos.');
        }

        if ($dni !== $currentUser['dni']) {
            $stmtCheck = $db->prepare("SELECT IdTrabajador FROM trabajadores WHERE DNI = ? AND IdTrabajador != ? LIMIT 1");
            $stmtCheck->execute([$dni, $workerId]);
            if ($stmtCheck->fetch()) {
                throw new Exception("El DNI {$dni} ya pertenece a otro trabajador.");
            }
        }

        // Validar unicidad de correo
        if (!empty($email) && $email !== strtolower($currentUser['email'])) {
            $stmtCheck = $db->prepare("SELECT IdTrabajador FROM trabajadores WHERE Email = ? AND IdTrabajador != ? LIMIT 1");
            $stmtCheck->execute([$email, $workerId]);
            if ($stmtCheck->fetch()) {
                throw new Exception("El correo {$email} ya pertenece a otro usuario.");
            }
        }

        $db->beginTransaction();
        try {
            // Actualizar tabla trabajadores
            $stmtTrabajador = $db->prepare("
                UPDATE trabajadores 
                SET Nombres = ?, Apellidos = ?, DNI = ?, NumTelef = ?, Email = ?, Cargo = ?
                WHERE IdTrabajador = ?
            ");
            $stmtTrabajador->execute([$nombres, $apellidos, $dni, $phone, $email, $cargo, $workerId]);

            // Actualizar tabla usuarioslg
            $stmtUsuario = $db->prepare("
                UPDATE usuarioslg 
                SET IdRol = ?, Estado = ?
                WHERE IdLogin = ?
            ");
            $stmtUsuario->execute([$roleId, $estado, $id]);

            // Si se suministró una nueva contraseña opcional
            if (!empty($data['password']) && strlen(trim($data['password'])) >= 6) {
                $hash = password_hash(trim($data['password']), PASSWORD_BCRYPT);
                $stmtPass = $db->prepare("UPDATE usuarioslg SET Contraseña = ? WHERE IdLogin = ?");
                $stmtPass->execute([$hash, $id]);
            }

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Restablecer o cambiar contraseña directamente
     */
    public function changePassword(int $id, string $newPassword): bool {
        if (strlen(trim($newPassword)) < 6) {
            throw new Exception('La nueva contraseña debe tener al menos 6 caracteres.');
        }

        $db = Database::getConnection();
        $hash = password_hash(trim($newPassword), PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE usuarioslg SET Contraseña = ? WHERE IdLogin = ?");
        return $stmt->execute([$hash, $id]);
    }

    /**
     * Alternar estado Activo / Inactivo
     */
    public function toggleStatus(int $id): string {
        $db = Database::getConnection();
        $user = $this->getById($id);
        if (!$user) {
            throw new Exception('Usuario no encontrado.');
        }

        // Protección: evitar desactivar el único administrador activo
        if ($user['status'] === 'Activo' && (int)$user['roleId'] <= 2) {
            $stmtCount = $db->query("SELECT COUNT(*) FROM usuarioslg WHERE IdRol IN (1, 2) AND Estado = 'Activo'");
            $adminCount = (int)$stmtCount->fetchColumn();
            if ($adminCount <= 1) {
                throw new Exception('No es posible desactivar la única cuenta de Administrador activa en el sistema.');
            }
        }

        $newStatus = ($user['status'] === 'Activo') ? 'Inactivo' : 'Activo';
        $stmt = $db->prepare("UPDATE usuarioslg SET Estado = ? WHERE IdLogin = ?");
        $stmt->execute([$newStatus, $id]);

        return $newStatus;
    }

    /**
     * Eliminar usuario si no cuenta con registros vinculados
     */
    public function delete(int $id): bool {
        $db = Database::getConnection();
        $user = $this->getById($id);
        if (!$user) {
            throw new Exception('Usuario no encontrado.');
        }

        $workerId = (int)$user['workerId'];

        // Comprobar trazabilidad en expedientes y actas
        if ($user['caseCount'] > 0 || $user['actaCount'] > 0 || $user['eventCount'] > 0) {
            throw new Exception("No se puede eliminar permanentemente este trabajador porque tiene {$user['caseCount']} expedientes, {$user['actaCount']} actas o {$user['eventCount']} diligencias registradas. Para revocar su acceso, cámbielo a estado 'Inactivo'.");
        }

        $db->beginTransaction();
        try {
            $stmtUser = $db->prepare("DELETE FROM usuarioslg WHERE IdLogin = ?");
            $stmtUser->execute([$id]);

            $stmtWorker = $db->prepare("DELETE FROM trabajadores WHERE IdTrabajador = ?");
            $stmtWorker->execute([$workerId]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
}

