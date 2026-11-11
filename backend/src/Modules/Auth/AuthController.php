<?php
namespace App\Modules\Auth;

use App\Core\Controller;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;

class AuthController extends Controller {
    private AuthService $service;

    public function __construct() {
        $this->service = new AuthService();
    }

    public function login(): void {
        $body = $this->getJsonBody();

        $dni = trim($body['email'] ?? $body['dni'] ?? $body['username'] ?? '');
        $password = trim($body['password'] ?? '');
        $roleId = !empty($body['roleId']) ? (int)$body['roleId'] : null;

        if (empty($dni) || empty($password)) {
            Response::error('Debe ingresar su correo institucional o DNI y contraseña', 422);
        }

        try {
            $result = $this->service->login($dni, $password, $roleId);

            if (!$result) {
                Response::error('Credenciales incorrectas o usuario no registrado con ese rol', 401);
            }

            Response::success($result, 'Inicio de sesión exitoso');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 403);
        }
    }

    public function me(): void {
        $userPayload = AuthMiddleware::authenticate();
        $profile = $this->service->getProfile($userPayload['login_id']);

        if (!$profile) {
            Response::unauthorized('Perfil no encontrado');
        }

        Response::success($profile, 'Información de perfil obtenida');
    }

    public function forgotPassword(): void {
        $body = $this->getJsonBody();
        $identifier = trim($body['emailOrDni'] ?? $body['email'] ?? $body['dni'] ?? '');
        $providedEmail = trim($body['providedEmail'] ?? '');

        if (empty($identifier)) {
            Response::error('Debe ingresar su correo institucional o DNI', 422);
        }

        try {
            $data = $this->service->forgotPassword($identifier, $providedEmail ?: null);
            Response::success($data, 'Código de recuperación enviado correctamente a su correo');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function verifyResetCode(): void {
        $body = $this->getJsonBody();
        $code = trim($body['code'] ?? '');
        $token = trim($body['token'] ?? '');

        if (empty($code)) {
            Response::error('Debe ingresar el código de verificación de 6 dígitos', 422);
        }

        $row = $this->service->verifyResetCode($code, $token ?: null);

        if (!$row) {
            Response::error('Código de verificación inválido o expirado', 400);
        }

        Response::success([
            'valid' => true,
            'token' => $row['token'],
            'worker' => $row['Nombres'] . ' ' . $row['Apellidos']
        ], 'Código verificado con éxito');
    }

    public function resetPassword(): void {
        $body = $this->getJsonBody();
        $identifier = trim($body['token'] ?? $body['code'] ?? '');
        $newPassword = (string)($body['newPassword'] ?? $body['password'] ?? '');
        $confirmPassword = (string)($body['confirmPassword'] ?? '');

        if (empty($identifier)) {
            Response::error('Token o código de verificación no proporcionado', 422);
        }

        if (strlen($newPassword) < 6) {
            Response::error('La nueva contraseña debe tener al menos 6 caracteres', 422);
        }

        if (!empty($confirmPassword) && $newPassword !== $confirmPassword) {
            Response::error('Las contraseñas no coinciden', 422);
        }

        try {
            $this->service->resetPassword($identifier, $newPassword);
            Response::success(null, 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.');
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

