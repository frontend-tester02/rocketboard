import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Sends transactional email. In dev the reset link is also logged to the
 * console so the flow is testable without a running SMTP server (mailpit).
 * Delivery is best-effort — a send failure never breaks the request.
 *
 * NOTE: queueing with BullMQ/Redis (per 102-B) is deferred until Redis is
 * provisioned; delivery is currently inline + resilient.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: false,
    });
  }

  async sendPasswordReset(email: string, link: string): Promise<void> {
    if (this.config.get<string>('NODE_ENV') !== 'production') {
      this.logger.log(`🔗 Password reset link for ${email}: ${link}`);
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM', 'no-reply@rocket.local'),
        to: email,
        subject: 'Reset your Rocket password',
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${link}">Reset your password</a></p>
          <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `,
      });
    } catch (err) {
      this.logger.warn(
        `Could not send reset email to ${email}: ${(err as Error).message}`,
      );
    }
  }
}
