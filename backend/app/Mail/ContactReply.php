<?php

namespace App\Mail;

use App\Models\ContactMessage;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReply extends Mailable
{
    use Queueable, SerializesModels;

    public $contactMessage;
    public $reply;
    public $siteName;

    /**
     * Create a new message instance.
     */
    public function __construct(ContactMessage $contactMessage, string $reply)
    {
        $this->contactMessage = $contactMessage;
        $this->reply = $reply;
        $this->siteName = Setting::get('siteName', config('app.name', 'Bella Beauty'));
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Phản hồi từ ' . $this->siteName . ' - ' . $this->contactMessage->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-reply',
            with: [
                'contactMessage' => $this->contactMessage,
                'reply' => $this->reply,
                'siteName' => $this->siteName,
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
