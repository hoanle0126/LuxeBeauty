<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Http\Requests\Settings\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminSettingsController extends Controller
{
    /**
     * Kiểm tra quyền admin
     */
    private function checkAdmin()
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return null;
    }

    /**
     * Lấy tất cả settings hoặc theo group
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $group = $request->get('group');

        if ($group) {
            $settings = Setting::getByGroup($group);
        } else {
            $settings = Setting::all()->mapWithKeys(function ($setting) {
                return [$setting->key => Setting::castValue($setting->value, $setting->type)];
            });
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Lấy setting theo key
     *
     * @param string $key
     * @return JsonResponse
     */
    public function show(string $key): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'key' => $setting->key,
                'value' => Setting::castValue($setting->value, $setting->type),
                'group' => $setting->group,
                'type' => $setting->type,
            ],
        ]);
    }

    /**
     * Cập nhật settings (bulk update)
     *
     * @param UpdateSettingsRequest $request
     * @return JsonResponse
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        // Data đã được validated bởi UpdateSettingsRequest
        $validated = $request->validated();

        $settings = $validated['settings'];
        $group = $validated['group'] ?? 'general';

        $updated = [];
        $errors = [];

        foreach ($settings as $key => $value) {
            try {
                // Determine type
                $type = 'string';
                $processedValue = $value;
                
                if (is_bool($value)) {
                    $type = 'boolean';
                } elseif (is_numeric($value)) {
                    // Convert string numeric to actual number for storage
                    $processedValue = is_float($value) ? (float) $value : (int) $value;
                    $type = is_float($value) ? 'float' : 'number';
                } elseif (is_array($value) || is_object($value)) {
                    $type = 'json';
                } elseif (is_string($value) && preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
                    // Check if it's a color hex code
                    $type = 'color';
                }

                Setting::set($key, $processedValue, $group, $type);
                $updated[$key] = $processedValue;
            } catch (\Exception $e) {
                $errors[$key] = $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => [
                'updated' => $updated,
                'errors' => $errors,
            ],
        ]);
    }

    /**
     * Cập nhật một setting cụ thể
     *
     * @param UpdateSettingRequest $request
     * @param string $key
     * @return JsonResponse
     */
    public function updateSetting(UpdateSettingRequest $request, string $key): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        // Data đã được validated bởi UpdateSettingRequest
        $validated = $request->validated();

        $type = $validated['type'] ?? 'string';
        $group = $validated['group'] ?? 'general';

        Setting::set($key, $validated['value'], $group, $type);

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => [
                'key' => $key,
                'value' => Setting::get($key),
            ],
        ]);
    }
}
