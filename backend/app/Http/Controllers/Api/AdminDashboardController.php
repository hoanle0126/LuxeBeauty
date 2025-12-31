<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Lấy thống kê tổng quan cho dashboard (Admin only)
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Tính toán thống kê
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();
        
        // Tổng doanh thu (tất cả thời gian)
        $totalRevenue = Order::where('status', '!=', 'cancelled')
            ->sum('total');
        
        // Doanh thu tháng này
        $currentMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('total');
        
        // Doanh thu tháng trước
        $lastMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->sum('total');
        
        // Tính % thay đổi doanh thu
        $revenueChange = $lastMonthRevenue > 0 
            ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : ($currentMonthRevenue > 0 ? 100 : 0);
        
        // Tổng số đơn hàng
        $totalOrders = Order::count();
        
        // Đơn hàng tháng này
        $currentMonthOrders = Order::whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();
        
        // Đơn hàng tháng trước
        $lastMonthOrders = Order::whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();
        
        // Tính % thay đổi đơn hàng
        $ordersChange = $lastMonthOrders > 0 
            ? (($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 
            : ($currentMonthOrders > 0 ? 100 : 0);
        
        // Tổng số khách hàng (chỉ role user)
        $totalCustomers = User::role('user', 'web')->count();
        
        // Khách hàng mới tháng này
        $currentMonthCustomers = User::role('user', 'web')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();
        
        // Khách hàng mới tháng trước
        $lastMonthCustomers = User::role('user', 'web')
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();
        
        // Tính % thay đổi khách hàng
        $customersChange = $lastMonthCustomers > 0 
            ? (($currentMonthCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100 
            : ($currentMonthCustomers > 0 ? 100 : 0);
        
        // Tổng số sản phẩm
        $totalProducts = Product::where('status', 'available')->count();
        
        // Sản phẩm tháng này
        $currentMonthProducts = Product::where('status', 'available')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();
        
        // Sản phẩm tháng trước
        $lastMonthProducts = Product::where('status', 'available')
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();
        
        // Tính % thay đổi sản phẩm
        $productsChange = $lastMonthProducts > 0 
            ? (($currentMonthProducts - $lastMonthProducts) / $lastMonthProducts) * 100 
            : ($currentMonthProducts > 0 ? 100 : 0);

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => [
                    'total' => (float) $totalRevenue,
                    'currentMonth' => (float) $currentMonthRevenue,
                    'change' => round($revenueChange, 1),
                    'trend' => $revenueChange >= 0 ? 'up' : 'down',
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'currentMonth' => $currentMonthOrders,
                    'change' => round($ordersChange, 1),
                    'trend' => $ordersChange >= 0 ? 'up' : 'down',
                ],
                'customers' => [
                    'total' => $totalCustomers,
                    'currentMonth' => $currentMonthCustomers,
                    'change' => round($customersChange, 1),
                    'trend' => $customersChange >= 0 ? 'up' : 'down',
                ],
                'products' => [
                    'total' => $totalProducts,
                    'currentMonth' => $currentMonthProducts,
                    'change' => round($productsChange, 1),
                    'trend' => $productsChange >= 0 ? 'up' : 'down',
                ],
            ],
        ]);
    }

    /**
     * Lấy dữ liệu biểu đồ doanh thu theo tháng (6 tháng gần nhất)
     *
     * @return JsonResponse
     */
    public function revenueChart(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $now = Carbon::now();
        $months = [];
        $revenues = [];

        // Lấy 6 tháng gần nhất
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $months[] = $month->format('Y-m');
            
            $revenue = Order::where('status', '!=', 'cancelled')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total');
            
            $revenues[] = (float) $revenue;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'months' => $months,
                'revenues' => $revenues,
            ],
        ]);
    }

    /**
     * Lấy dữ liệu biểu đồ đơn hàng theo tháng (6 tháng gần nhất)
     *
     * @return JsonResponse
     */
    public function ordersChart(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $now = Carbon::now();
        $months = [];
        $orders = [];

        // Lấy 6 tháng gần nhất
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $months[] = $month->format('Y-m');
            
            $count = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            
            $orders[] = $count;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'months' => $months,
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Lấy top 5 sản phẩm bán chạy nhất
     *
     * @return JsonResponse
     */
    public function topProducts(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $topProducts = OrderItem::select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as sold'),
                DB::raw('SUM(order_items.subtotal) as revenue')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('products.id', 'products.name')
            ->orderBy('sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sold' => (int) $item->sold,
                    'revenue' => (float) $item->revenue,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }

    /**
     * Lấy 5 đơn hàng gần nhất
     *
     * @return JsonResponse
     */
    public function recentOrders(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $recentOrders = Order::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderNumber' => $order->order_number,
                    'customer' => $order->user ? $order->user->name : 'N/A',
                    'total' => (float) $order->total,
                    'status' => $order->status,
                    'date' => $order->created_at->format('Y-m-d'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $recentOrders,
        ]);
    }
}
