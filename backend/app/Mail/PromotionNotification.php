<?php

namespace App\Mail;

use App\Models\Promotion;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PromotionNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $promotion;
    public $siteName;
    public $isNew;

    /**
     * Create a new message instance.
     */
    public function __construct(Promotion $promotion, bool $isNew = true)
    {
        $this->promotion = $promotion;
        $this->siteName = Setting::get('siteName', config('app.name', 'Bella Beauty'));
        $this->isNew = $isNew;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->isNew 
            ? 'Mã giảm giá mới - ' . $this->promotion->code . ' - ' . $this->siteName
            : 'Mã giảm giá đã được cập nhật - ' . $this->promotion->code . ' - ' . $this->siteName;
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.promotion-notification',
            with: [
                'promotion' => $this->promotion,
                'siteName' => $this->siteName,
                'isNew' => $this->isNew,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
