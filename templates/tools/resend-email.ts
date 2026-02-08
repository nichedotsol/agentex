import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class ResendEmail {
  private resend: Resend;
  
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not set. Get from: https://resend.com/api-keys');
    }
    
    this.resend = new Resend(apiKey);
  }
  
  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions) {
    try {
      const result = await this.resend.emails.send({
        from: options.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        reply_to: options.reply_to,
        attachments: options.attachments
      });
      
      return {
        message_id: result.data?.id,
        status: 'sent',
        error: result.error
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Send bulk emails
   */
  async sendBulkEmail(emails: EmailOptions[]) {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );
    
    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
  
  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Get email status (if supported by Resend)
   */
  async getEmailStatus(messageId: string) {
    // Note: Resend API doesn't currently support status checking
    // This is a placeholder for future functionality
    return {
      message_id: messageId,
      status: 'unknown',
      note: 'Status checking not yet available in Resend API'
    };
  }
}
