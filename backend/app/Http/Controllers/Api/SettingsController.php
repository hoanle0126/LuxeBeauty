<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Lấy tất cả settings public (không cần auth)
     * Chỉ trả về các settings cần thiết cho frontend
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->get('group');

        // Chỉ cho phép lấy các group: general, shipping, appearance, homepage
        $allowedGroups = ['general', 'shipping', 'appearance', 'homepage'];
        
        if ($group && !in_array($group, $allowedGroups)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid group',
            ], 400);
        }

        if ($group) {
            $settings = Setting::getByGroup($group);
        } else {
            // Lấy tất cả settings từ các group được phép
            $settings = [];
            foreach ($allowedGroups as $allowedGroup) {
                $groupSettings = Setting::getByGroup($allowedGroup);
                // Merge vào array, vì getByGroup trả về Collection với mapWithKeys
                foreach ($groupSettings as $key => $value) {
                    $settings[$key] = $value;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }
}

