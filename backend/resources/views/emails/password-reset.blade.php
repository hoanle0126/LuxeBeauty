<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu - {{ config('app.name') }}</title>
    <style>
        /* Reset styles */
        body, table, td, p, a {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f2f2f5;
            line-height: 1.6;
            color: #1a1a1a;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fafafa;
        }
        
        .email-wrapper {
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 1px 3px 0px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, hsl(333, 71%, 50%) 0%, hsl(349, 89%, 60%) 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            font-family: 'Merriweather', Georgia, serif;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .content-text {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            padding: 16px 40px;
            background-color: hsl(333, 71%, 50%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 24px;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .reset-button:hover {
            background-color: hsl(333, 71%, 45%);
        }
        
        .divider {
            height: 1px;
            background-color: #d4d4d4;
            margin: 30px 0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6b6b6b;
            margin-top: 30px;
            line-height: 1.6;
        }
        
        .link-text {
            color: hsl(333, 71%, 50%);
            word-break: break-all;
            font-size: 14px;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .security-note {
            background-color: hsl(355, 100%, 97%);
            border-left: 4px solid hsl(333, 71%, 50%);
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        
        .security-note p {
            font-size: 14px;
            color: #4a4a4a;
            margin: 0;
        }
        
        .email-footer {
            background-color: #fafafa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        
        .email-footer p {
            font-size: 14px;
            color: #6b6b6b;
            margin: 5px 0;
        }
        
        .app-name {
            color: hsl(333, 71%, 50%);
            font-weight: 600;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .reset-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0;">
            <tr>
                <td align="center">
                    <div class="email-wrapper">
                        <!-- Header -->
                        <div class="email-header">
                            <h1>{{ config('app.name', 'Blooming Beauty') }}</h1>
                        </div>
                        
                        <!-- Body -->
                        <div class="email-body">
                            <div class="greeting">
                                @if (!empty($greeting))
                                    {{ $greeting }}
                                @else
                                    Xin chào!
                                @endif
                            </div>
                            
                            @foreach ($introLines as $line)
                                <p class="content-text">{{ $line }}</p>
                            @endforeach
                            
                            @isset($actionText)
                                <div class="button-container">
                                    <a href="{{ $actionUrl }}" class="reset-button">
                                        {{ $actionText }}
                                    </a>
                                </div>
                            @endisset
                            
                            @foreach ($outroLines as $line)
                                <p class="content-text">{{ $line }}</p>
                            @endforeach
                            
                            <div class="security-note">
                                <p><strong>Lưu ý bảo mật:</strong> Link này sẽ hết hạn sau 60 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                            </div>
                            
                            @isset($actionText)
                                <div class="divider"></div>
                                <div class="footer-text">
                                    <p>Nếu bạn không thể nhấp vào nút "{{ $actionText }}", hãy sao chép và dán URL sau vào trình duyệt của bạn:</p>
                                    <p class="link-text">{{ $displayableActionUrl }}</p>
                                </div>
                            @endisset
                        </div>
                        
                        <!-- Footer -->
                        <div class="email-footer">
                            <p>Trân trọng,<br><span class="app-name">{{ config('app.name', 'Blooming Beauty') }}</span></p>
                            <p style="margin-top: 15px; font-size: 12px; color: #9b9b9b;">
                                Email này được gửi tự động, vui lòng không trả lời.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

