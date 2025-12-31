<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Các routes xử lý authentication: đăng nhập, đăng ký, quên mật khẩu
|
*/

// Đăng ký
Route::post('/register', [RegisterController::class, 'register']);

// Đăng nhập
Route::post('/login', [LoginController::class, 'login']);

// Quên mật khẩu
Route::post('/forgot-password', [ResetPasswordController::class, 'forgotPassword']);

// Reset mật khẩu
Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);

