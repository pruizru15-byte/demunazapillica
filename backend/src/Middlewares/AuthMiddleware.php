<?php
namespace App\Middlewares;

use App\Utils\JWT;
use App\Utils\Response;

class AuthMiddleware {
    public static function authenticate(): array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? '';

        if (!$authHeader && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::unauthorized('Token de autorización no provisto o inválido');
        }

        $token = $matches[1];
        $payload = JWT::decode($token);

        if (!$payload) {
            Response::unauthorized('Token expirado o no válido. Por favor inicie sesión nuevamente');
        }

        return $payload;
    }

    public static function requireRole(array $allowedRoles): array {
        $user = self::authenticate();

        if (!in_array($user['role_id'], $allowedRoles)) {
            Response::forbidden('No cuentas con los permisos necesarios para realizar esta acción');
        }

        return $user;
    }
}

