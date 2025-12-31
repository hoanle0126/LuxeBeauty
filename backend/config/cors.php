<?php

// Tính toán allowed_origins từ env
$corsOrigins = env('CORS_ALLOWED_ORIGINS');

if ($corsOrigins === '*') {
    $allowedOrigins = ['*'];
    $supportsCredentials = false; // Browser không cho phép * với credentials
} elseif ($corsOrigins) {
    $allowedOrigins = array_map('trim', explode(',', $corsOrigins));
    $supportsCredentials = true;
} else {
    // Mặc định cho development
    $allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    $supportsCredentials = true;
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Cấu hình CORS để bảo vệ backend, chỉ cho phép các domain được phép
    | mới có thể truy cập API.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Nếu allowed_origins là ['*'] thì không thể dùng credentials (browser sẽ từ chối)
    'supports_credentials' => $supportsCredentials,

];

