<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phản hồi từ {{ $siteName ?? config('app.name', 'Bella Beauty') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
            color: #d81b60;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .original-message {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #d81b60;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .original-message h3 {
            margin-top: 0;
            color: #333;
            font-size: 16px;
        }
        .original-message p {
            margin: 5px 0;
            color: #666;
        }
        .reply-section {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .reply-section h3 {
            color: #d81b60;
            margin-top: 0;
        }
        .reply-content {
            white-space: pre-wrap;
            line-height: 1.8;
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 12px;
        }
        .footer a {
            color: #d81b60;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $siteName ?? config('app.name', 'Bella Beauty') }}</h1>
        </div>

        <div class="content">
            <p>Xin chào <strong>{{ $contactMessage->name }}</strong>,</p>
            
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và xin được phản hồi như sau:</p>

            <div class="original-message">
                <h3>Tin nhắn của bạn:</h3>
                <p><strong>Chủ đề:</strong> {{ $contactMessage->subject }}</p>
                <p><strong>Nội dung:</strong></p>
                <p>{{ $contactMessage->message }}</p>
            </div>

            <div class="reply-section">
                <h3>Phản hồi từ chúng tôi:</h3>
                <div class="reply-content">{{ $reply }}</div>
            </div>

            <p>Nếu bạn còn có thắc mắc hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại hỗ trợ.</p>

            <p>Trân trọng,<br>
            <strong>Đội ngũ {{ $siteName ?? config('app.name', 'Bella Beauty') }}</strong></p>
        </div>

        <div class="footer">
            <p>Email này được gửi tự động từ hệ thống {{ $siteName ?? config('app.name', 'Bella Beauty') }}</p>
            <p>Vui lòng không trả lời email này. Nếu cần hỗ trợ, vui lòng liên hệ qua email hoặc số điện thoại trên website.</p>
        </div>
    </div>
</body>
</html>

