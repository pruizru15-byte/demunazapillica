<?php
namespace App\Middlewares;

class CorsMiddleware {
    public static function handle(): void {
        $config = require __DIR__ . '/../../config/cors.php';

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin && (in_array($origin, $config['allowed_origins']) || in_array('*', $config['allowed_origins']))) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            // Permitir en local si no viene origin estricto
            header("Access-Control-Allow-Origin: *");
        }

        header("Access-Control-Allow-Methods: " . implode(', ', $config['allowed_methods']));
        header("Access-Control-Allow-Headers: " . implode(', ', $config['allowed_headers']));
        header("Access-Control-Expose-Headers: " . implode(', ', $config['exposed_headers']));
        header("Access-Control-Max-Age: " . $config['max_age']);

        if ($config['supports_credentials']) {
            header("Access-Control-Allow-Credentials: true");
        }

        // Si es solicitud preflight OPTIONS, terminar inmediatamente con 200 OK
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}

