<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isNew ? 'Mã giảm giá mới' : 'Mã giảm giá đã được cập nhật' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .promotion-box {
            background: white;
            border: 2px dashed #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .promotion-code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 3px;
            margin: 10px 0;
        }
        .promotion-name {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .promotion-details {
            text-align: left;
            margin-top: 20px;
        }
        .promotion-details p {
            margin: 8px 0;
        }
        .discount-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $siteName }}</h1>
        <p>{{ $isNew ? 'Mã giảm giá mới!' : 'Mã giảm giá đã được cập nhật!' }}</p>
    </div>
    <div class="content">
        <h2>{{ $isNew ? 'Chúng tôi có mã giảm giá mới dành cho bạn!' : 'Mã giảm giá đã được cập nhật!' }}</h2>
        
        <div class="promotion-box">
            <div class="promotion-code">{{ $promotion->code }}</div>
            <div class="promotion-name">{{ $promotion->name }}</div>
            
            @if($promotion->description)
            <p style="color: #666; margin: 15px 0;">{{ $promotion->description }}</p>
            @endif

            <div class="discount-badge">
                @if($promotion->type === 'percentage')
                    Giảm {{ $promotion->value }}%
                @else
                    Giảm {{ number_format($promotion->value, 0, ',', '.') }} ₫
                @endif
            </div>

            <div class="promotion-details">
                @if($promotion->min_order_amount)
                <p><strong>Đơn tối thiểu:</strong> {{ number_format($promotion->min_order_amount, 0, ',', '.') }} ₫</p>
                @endif
                
                @if($promotion->max_discount_amount)
                <p><strong>Giảm tối đa:</strong> {{ number_format($promotion->max_discount_amount, 0, ',', '.') }} ₫</p>
                @endif

                <p><strong>Thời gian:</strong> 
                    Từ {{ \Carbon\Carbon::parse($promotion->start_date)->format('d/m/Y H:i') }} 
                    đến {{ \Carbon\Carbon::parse($promotion->end_date)->format('d/m/Y H:i') }}
                </p>

                @if($promotion->usage_limit)
                <p><strong>Số lượng có hạn:</strong> {{ $promotion->usage_limit }} lượt sử dụng</p>
                @endif
            </div>
        </div>

        <p>Hãy sử dụng mã <strong>{{ $promotion->code }}</strong> khi thanh toán để nhận được ưu đãi đặc biệt này!</p>
        
        <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/products" class="button">Mua ngay</a>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} {{ $siteName }}. Tất cả quyền được bảo lưu.</p>
        <p>Nếu bạn không muốn nhận email này nữa, vui lòng liên hệ với chúng tôi.</p>
    </div>
</body>
</html>

