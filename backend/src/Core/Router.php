<?php
namespace App\Core;

use App\Utils\Response;

class Router {
    private array $routes = [];

    public function add(string $method, string $path, callable|array $handler, array $middlewares = []): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function get(string $path, callable|array $handler, array $middlewares = []): void {
        $this->add('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void {
        $this->add('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, callable|array $handler, array $middlewares = []): void {
        $this->add('PUT', $path, $handler, $middlewares);
    }

    public function delete(string $path, callable|array $handler, array $middlewares = []): void {
        $this->add('DELETE', $path, $handler, $middlewares);
    }

    public function dispatch(): void {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

        // Limpiar prefijo de subcarpeta si se ejecuta en subdirectorio cPanel (ej. /demuna/api)
        $baseScript = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
        if ($baseScript !== '/' && $baseScript !== '.' && !empty($baseScript) && str_starts_with($requestUri, $baseScript)) {
            $requestUri = substr($requestUri, strlen($baseScript));
        }

        // Quitar prefijo /demuna si aún persiste en la URI
        if (str_starts_with($requestUri, '/demuna')) {
            $requestUri = substr($requestUri, strlen('/demuna'));
        }

        $requestUri = '/' . trim($requestUri, '/');
        $uriWithoutApi = '/' . trim(preg_replace('#^/api(/|$)#', '/', $requestUri), '/');
        $uriWithApi = '/api' . ($uriWithoutApi === '/' ? '' : $uriWithoutApi);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $requestMethod) {
                continue;
            }

            // Convertir {param} a regex: /expedientes/{id} -> #^/expedientes/([^/]+)$#
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            // Coincidir de forma resiliente tanto con prefijo /api como sin él
            if (preg_match($pattern, $requestUri, $matches) ||
                preg_match($pattern, $uriWithApi, $matches) ||
                preg_match($pattern, $uriWithoutApi, $matches)) {
                array_shift($matches); // Quitar coincidencia completa

                // Ejecutar middlewares de ruta si existen
                foreach ($route['middlewares'] as $middleware) {
                    if (is_callable($middleware)) {
                        call_user_func($middleware);
                    }
                }

                // Ejecutar controlador
                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$class, $method] = $handler;
                    $controller = new $class();
                    call_user_func_array([$controller, $method], $matches);
                } else {
                    call_user_func_array($handler, $matches);
                }
                return;
            }
        }

        Response::notFound("Ruta no encontrada: [$requestMethod] $requestUri");
    }
}

