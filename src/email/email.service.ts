import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Issue } from 'src/issue/entities/issue.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@hermes.com'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      // console.log(mailOptions);

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendTicketCreatedNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Ticket Created - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>Your service ticket has been created successfully.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p>You can track your ticket status using this number.</p>
        <br>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }

  async sendTicketStatusUpdateNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
    newStatus: string,
    description?: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Ticket Update - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>Your ticket status has been updated.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
        <br>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }

  async sendEngineerAssignedNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
    engineerName: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Engineer Assigned - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>An engineer has been assigned to your ticket.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Assigned Engineer:</strong> ${engineerName}</p>
        <p>Our engineer will contact you shortly.</p>
        <br>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }

  async sendEngineerAssignmentNotification(
    engineerEmail: string,
    engineerName: string,
    ticketNumber: string,
    customerName: string,
    issue: Partial<Issue>,
    // issueId: string,
    // description: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: engineerEmail,
      subject: `New Ticket Assigned - ${ticketNumber}`,
      html: `
        <h2>Hello ${engineerName},</h2>
        <p>A new ticket has been assigned to you.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Issue:</strong> ${issue.name}</p>
  <p><strong>Description:</strong> ${issue.description}</p>
        <br>
        <p>Please review and take appropriate action.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }


  async sendQuotationNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
    amount: number,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Quotation Sent - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>A quotation has been prepared for your service ticket.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Quotation Amount:</strong> ₹${amount.toFixed(2)}</p>
        <p>Please review and respond to the quotation to proceed with the service.</p>
        <br>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }

  async sendTicketResolvedNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Ticket Resolved - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>Your service ticket has been resolved.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p>If you have any concerns, please respond within 5 days. Otherwise, the ticket will be automatically closed.</p>
        <br>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }

  async sendTicketClosedNotification(
    customerEmail: string,
    customerName: string,
    ticketNumber: string,
    reason: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Ticket Closed - ${ticketNumber}`,
      html: `
        <h2>Hello ${customerName},</h2>
        <p>Your service ticket has been closed.</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <br>
        <p>If you need further assistance, please create a new ticket.</p>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br>Hermes Service Team</p>
      `,
    });
  }
}
