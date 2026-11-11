<?php
// backend/config/cors.php

return [
    'allowed_origins' => explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'),
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    'exposed_headers' => ['Authorization'],
    'max_age' => 86400,
    'supports_credentials' => true,
];

