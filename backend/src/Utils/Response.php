<?php
namespace App\Utils;

class Response {
    public static function json(mixed $data = null, int $status = 200, string $message = ''): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'success' => $status >= 200 && $status < 300,
            'status' => $status
        ];

        if ($message !== '') {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Operación exitosa', int $status = 200): void {
        self::json($data, $status, $message);
    }

    public static function error(string $message = 'Ha ocurrido un error', int $status = 400, mixed $errors = null): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'success' => false,
            'status' => $status,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function unauthorized(string $message = 'No autorizado'): void {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado. Permisos insuficientes'): void {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): void {
        self::error($message, 404);
    }
}

