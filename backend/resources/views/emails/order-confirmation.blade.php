<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đơn hàng - Bella Beauty</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #ec4899;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            color: #ec4899;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .order-number {
            background-color: #fce7f3;
            color: #ec4899;
            padding: 10px 20px;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            color: #ec4899;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 8px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 600;
            color: #666;
        }
        .info-value {
            color: #333;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .items-table th {
            background-color: #fce7f3;
            color: #ec4899;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .product-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
        .total-section {
            background-color: #fce7f3;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .total-row.final {
            font-size: 20px;
            font-weight: bold;
            color: #ec4899;
            border-top: 2px solid #ec4899;
            padding-top: 12px;
            margin-top: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #f3f4f6;
            color: #666;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #d97706;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ec4899;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Bella Beauty</div>
            <h1 style="color: #333; margin: 10px 0;">Cảm ơn bạn đã đặt hàng!</h1>
            <div class="order-number">Mã đơn hàng: {{ $order->order_number }}</div>
        </div>

        <div class="section">
            <div class="section-title">Thông tin đơn hàng</div>
            <div class="info-row">
                <span class="info-label">Mã đơn hàng:</span>
                <span class="info-value">{{ $order->order_number }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày đặt hàng:</span>
                <span class="info-value">{{ $order->created_at->format('d/m/Y H:i') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Trạng thái:</span>
                <span class="info-value">
                    <span class="status-badge status-pending">
                        @if($order->status === 'pending') Chờ xử lý
                        @elseif($order->status === 'processing') Đang xử lý
                        @elseif($order->status === 'shipped') Đang giao hàng
                        @elseif($order->status === 'delivered') Đã giao hàng
                        @elseif($order->status === 'cancelled') Đã hủy
                        @endif
                    </span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Phương thức thanh toán:</span>
                <span class="info-value">
                    @if($order->payment_method === 'cod') Thanh toán khi nhận hàng (COD)
                    @elseif($order->payment_method === 'bank_transfer') Chuyển khoản ngân hàng
                    @else {{ $order->payment_method }}
                    @endif
                </span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Thông tin giao hàng</div>
            <div class="info-row">
                <span class="info-label">Người nhận:</span>
                <span class="info-value">{{ $order->shipping_name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Số điện thoại:</span>
                <span class="info-value">{{ $order->shipping_phone }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">{{ $order->shipping_address }}</span>
            </div>
            @if($order->notes)
            <div class="info-row">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value">{{ $order->notes }}</span>
            </div>
            @endif
        </div>

        <div class="section">
            <div class="section-title">Chi tiết sản phẩm</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                @if($item->product_image)
                                <img src="{{ $item->product_image }}" alt="{{ $item->product_name }}" class="product-image">
                                @endif
                                <div>
                                    <div style="font-weight: 600;">{{ $item->product_name }}</div>
                                </div>
                            </div>
                        </td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ number_format($item->product_price, 0, ',', '.') }} đ</td>
                        <td>{{ number_format($item->subtotal, 0, ',', '.') }} đ</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="total-section">
            <div class="total-row">
                <span>Tạm tính:</span>
                <span>{{ number_format($order->subtotal, 0, ',', '.') }} đ</span>
            </div>
            <div class="total-row">
                <span>Phí vận chuyển:</span>
                <span>{{ number_format($order->shipping_fee, 0, ',', '.') }} đ</span>
            </div>
            <div class="total-row final">
                <span>Tổng cộng:</span>
                <span>{{ number_format($order->total, 0, ',', '.') }} đ</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/orders/{{ $order->id }}" class="btn">
                Xem chi tiết đơn hàng
            </a>
        </div>

        <div class="footer">
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
            <p><strong>Email:</strong> hello@bellabeauty.vn | <strong>Hotline:</strong> 1900 1234 56</p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © {{ date('Y') }} Bella Beauty. Tất cả quyền được bảo lưu.
            </p>
        </div>
    </div>
</body>
</html>

