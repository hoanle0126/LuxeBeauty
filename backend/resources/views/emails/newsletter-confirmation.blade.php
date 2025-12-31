<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng ký nhận tin thành công</title>
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
    </div>
    <div class="content">
        <h2>Cảm ơn bạn đã đăng ký nhận tin giảm giá!</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi rất vui khi nhận được đăng ký nhận tin giảm giá từ email <strong>{{ $email }}</strong>.</p>
        <p>Bạn sẽ nhận được thông báo về:</p>
        <ul>
            <li>Mã giảm giá mới</li>
            <li>Ưu đãi đặc biệt</li>
            <li>Chương trình khuyến mãi</li>
            <li>Thông tin sản phẩm mới</li>
        </ul>
        <p>Hãy theo dõi email của bạn để không bỏ lỡ những ưu đãi hấp dẫn!</p>
        <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}" class="button">Khám phá sản phẩm</a>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} {{ $siteName }}. Tất cả quyền được bảo lưu.</p>
        <p>Nếu bạn không muốn nhận email này nữa, vui lòng liên hệ với chúng tôi.</p>
    </div>
</body>
</html>

