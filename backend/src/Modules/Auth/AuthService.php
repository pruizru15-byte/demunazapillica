<?php
namespace App\Modules\Auth;

use App\Core\Database;
use App\Utils\JWT;
use PDO;

class AuthService {
    public function login(string $dni, string $password, ?int $roleId = null): ?array {
        $db = Database::getConnection();

        // Limpiar identificador (puede ser DNI o correo institucional)
        $cleanIdentifier = trim($dni);
        if (str_contains($cleanIdentifier, '@')) {
            $parts = explode('@', $cleanIdentifier);
            $local = strtolower(trim($parts[0]));
            if ($local === 'admin' || $local === 'administrador') {
                $cleanIdentifier = '22222222';
            } elseif ($local === 'trabajador' || $local === 'defensor' || $local === 'operador') {
                $cleanIdentifier = '33333333';
            } elseif ($local === 'dev' || $local === 'desarrollador' || $local === 'soporte') {
                $cleanIdentifier = '11111111';
            } else {
                $cleanIdentifier = preg_replace('/\D/', '', $local);
            }
        }

        // 1. Verificar trabajador por DNI
        $stmt = $db->prepare("SELECT IdTrabajador, Nombres, Apellidos, DNI, NumTelef FROM trabajadores WHERE DNI = ? LIMIT 1");
        $stmt->execute([$cleanIdentifier]);
        $trabajador = $stmt->fetch();

        if (!$trabajador) {
            return null;
        }

        // 2. Verificar cuenta en usuarioslg (con rol si se especificó)
        $sql = "SELECT u.IdLogin, u.IdTrabajador, u.IdRol, u.Contraseña, u.Estado, r.NombreRol 
                FROM usuarioslg u 
                INNER JOIN rol r ON u.IdRol = r.IdRol
                WHERE u.IdTrabajador = ?";
        $params = [$trabajador['IdTrabajador']];

        if ($roleId !== null) {
            $sql .= " AND u.IdRol = ?";
            $params[] = $roleId;
        }

        $stmtUser = $db->prepare($sql);
        $stmtUser->execute($params);
        $user = $stmtUser->fetch();

        if (!$user) {
            return null;
        }

        // 3. Verificar si la cuenta está suspendida o inactiva
        if (($user['Estado'] ?? 'Activo') === 'Inactivo') {
            throw new \Exception('Su cuenta institucional se encuentra suspendida o inactiva. Comuníquese con la Coordinación DEMUNA.');
        }

        // 4. Verificar contraseña
        if (!password_verify($password, $user['Contraseña'])) {
            return null;
        }

        // 4. Actualizar fecha de último inicio de sesión
        $updateStmt = $db->prepare("UPDATE usuarioslg SET UltimoInicioSesion = NOW() WHERE IdLogin = ?");
        $updateStmt->execute([$user['IdLogin']]);

        // 5. Generar token JWT
        $payload = [
            'login_id' => $user['IdLogin'],
            'user_id' => $trabajador['IdTrabajador'],
            'dni' => $trabajador['DNI'],
            'name' => $trabajador['Nombres'] . ' ' . $trabajador['Apellidos'],
            'role_id' => (int)$user['IdRol'],
            'role_name' => $user['NombreRol']
        ];

        $token = JWT::encode($payload, 86400 * 7); // Token válido por 7 días

        return [
            'token' => $token,
            'user' => [
                'id' => $trabajador['IdTrabajador'],
                'loginId' => $user['IdLogin'],
                'dni' => $trabajador['DNI'],
                'fullName' => $trabajador['Nombres'] . ' ' . $trabajador['Apellidos'],
                'names' => $trabajador['Nombres'],
                'surnames' => $trabajador['Apellidos'],
                'phone' => $trabajador['NumTelef'],
                'roleId' => (int)$user['IdRol'],
                'roleName' => $user['NombreRol']
            ]
        ];
    }

    public function getProfile(int $loginId): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT t.IdTrabajador, t.Nombres, t.Apellidos, t.DNI, t.NumTelef,
                   u.IdLogin, u.IdRol, r.NombreRol, u.UltimoInicioSesion
            FROM usuarioslg u
            INNER JOIN trabajadores t ON u.IdTrabajador = t.IdTrabajador
            INNER JOIN rol r ON u.IdRol = r.IdRol
            WHERE u.IdLogin = ?
            LIMIT 1
        ");
        $stmt->execute([$loginId]);
        $row = $stmt->fetch();

        if (!$row) return null;

        return [
            'id' => $row['IdTrabajador'],
            'loginId' => $row['IdLogin'],
            'dni' => $row['DNI'],
            'fullName' => $row['Nombres'] . ' ' . $row['Apellidos'],
            'names' => $row['Nombres'],
            'surnames' => $row['Apellidos'],
            'phone' => $row['NumTelef'],
            'roleId' => (int)$row['IdRol'],
            'roleName' => $row['NombreRol'],
            'lastLogin' => $row['UltimoInicioSesion']
        ];
    }

    /**
     * Iniciar proceso de recuperación de contraseña:
     * Generar código de 6 dígitos, token y enviar correo electrónico.
     */
    public function forgotPassword(string $identifier, ?string $providedEmail = null): array {
        $db = Database::getConnection();

        $clean = trim($identifier);

        // Buscar trabajador por DNI o Email
        $stmt = $db->prepare("
            SELECT t.IdTrabajador, t.Nombres, t.Apellidos, t.DNI, t.Email, u.IdLogin
            FROM trabajadores t
            INNER JOIN usuarioslg u ON t.IdTrabajador = u.IdTrabajador
            WHERE t.DNI = ? OR t.Email = ?
            LIMIT 1
        ");
        $stmt->execute([$clean, $clean]);
        $user = $stmt->fetch();

        // Si no se encontró por DNI directo y es email
        if (!$user && str_contains($clean, '@')) {
            $parts = explode('@', $clean);
            $local = strtolower(trim($parts[0]));
            $fallbackDni = match ($local) {
                'admin', 'administrador' => '22222222',
                'trabajador', 'defensor', 'operador' => '33333333',
                'dev', 'desarrollador', 'soporte' => '11111111',
                default => preg_replace('/\D/', '', $local)
            };

            if (!empty($fallbackDni)) {
                $stmt->execute([$fallbackDni, $clean]);
                $user = $stmt->fetch();
            }
        }

        if (!$user) {
            throw new \Exception("No existe ninguna cuenta de usuario registrada con ese DNI o correo.");
        }

        // Determinar correo de destino
        $recipientEmail = trim($providedEmail ?: ($user['Email'] ?: ''));
        if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            // Si el trabajador aún no tiene email registrado en base de datos, usamos el configurado por defecto
            $recipientEmail = getenv('MAIL_FROM_ADDRESS') ?: 'datossistema@popydev.com';
        }

        // Si se actualizó el correo del trabajador
        if (!empty($providedEmail) && filter_var($providedEmail, FILTER_VALIDATE_EMAIL) && $providedEmail !== $user['Email']) {
            $upd = $db->prepare("UPDATE trabajadores SET Email = ? WHERE IdTrabajador = ?");
            $upd->execute([$providedEmail, $user['IdTrabajador']]);
        }

        // Generar código de 6 dígitos y token criptográfico
        $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $token = bin2hex(random_bytes(32));

        // Guardar solicitud en la tabla password_resets con 15 minutos de vigencia
        $ins = $db->prepare("
            INSERT INTO password_resets (IdTrabajador, email, token, code, expires_at)
            VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))
        ");
        $ins->execute([$user['IdTrabajador'], $recipientEmail, $token, $code]);

        // Construir enlace de frontend
        $frontendUrl = rtrim(getenv('FRONTEND_URL') ?: 'http://localhost:5173', '/');
        $resetLink = "{$frontendUrl}/recuperar-password?token={$token}&code={$code}";

        // Enviar correo vía Mailer
        $fullName = trim($user['Nombres'] . ' ' . $user['Apellidos']);
        $htmlBody = \App\Utils\Mailer::buildPasswordResetTemplate($fullName, $code, $resetLink, 15);

        \App\Utils\Mailer::send(
            $recipientEmail,
            $fullName,
            "Código de Recuperación: {$code} - Sistema DEMUNA Perú",
            $htmlBody
        );

        // Enmascarar correo para privacidad (ej: da***@popydev.com)
        $parts = explode('@', $recipientEmail);
        $namePart = $parts[0];
        $domain = $parts[1] ?? '';
        $maskedName = strlen($namePart) > 2 ? substr($namePart, 0, 2) . str_repeat('*', max(3, strlen($namePart) - 2)) : $namePart . '***';
        $maskedEmail = "{$maskedName}@{$domain}";

        return [
            'maskedEmail' => $maskedEmail,
            'token' => $token,
            'expiresInMinutes' => 15
        ];
    }

    /**
     * Verificar código de 6 dígitos
     */
    public function verifyResetCode(string $code, ?string $token = null): ?array {
        $db = Database::getConnection();

        $sql = "SELECT r.*, t.Nombres, t.Apellidos, t.DNI 
                FROM password_resets r
                INNER JOIN trabajadores t ON r.IdTrabajador = t.IdTrabajador
                WHERE r.code = ? AND r.used = 0 AND r.expires_at > NOW()";
        $params = [trim($code)];

        if ($token) {
            $sql .= " AND r.token = ?";
            $params[] = trim($token);
        }

        $sql .= " ORDER BY r.id DESC LIMIT 1";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * Restablecer contraseña y marcar solicitud como utilizada
     */
    public function resetPassword(string $identifier, string $newPassword): bool {
        $db = Database::getConnection();

        // Buscar por token o código válido
        $stmt = $db->prepare("
            SELECT id, IdTrabajador, used, expires_at 
            FROM password_resets 
            WHERE (token = ? OR code = ?) AND used = 0 AND expires_at > NOW()
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([trim($identifier), trim($identifier)]);
        $reset = $stmt->fetch();

        if (!$reset) {
            throw new \Exception("El código o enlace de recuperación ha expirado o ya fue utilizado.");
        }

        // Generar hash seguro con Bcrypt
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);

        // Actualizar contraseña en usuarioslg
        $updUser = $db->prepare("UPDATE usuarioslg SET Contraseña = ? WHERE IdTrabajador = ?");
        $updUser->execute([$hash, $reset['IdTrabajador']]);

        // Marcar solicitud como consumida
        $updReset = $db->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
        $updReset->execute([$reset['id']]);

        return true;
    }
}

