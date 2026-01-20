import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');
    
    this.isEnabled = !!(accountSid && authToken && this.fromNumber);
    
    if (this.isEnabled) {
      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized');
    } else {
      this.logger.warn('Twilio SMS service not configured - SMS notifications disabled');
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If already has country code
    if (cleaned.length > 10 && !phone.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone.startsWith('+') ? phone : `+${cleaned}`;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('SMS not sent - Twilio not configured');
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
      });

      this.logger.log(`SMS sent successfully to ${formattedNumber}: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  async sendTicketCreatedSms(
    phone: string,
    customerName: string,
    ticketNumber: string,
  ): Promise<boolean> {
    const message = `Hello ${customerName}, your service ticket ${ticketNumber} has been created. Track status at our portal. - Hermes Service`;
    return this.sendSms(phone, message);
  }

  async sendEngineerAssignedSms(
    phone: string,
    customerName: string,
    ticketNumber: string,
    engineerName: string,
  ): Promise<boolean> {
    const message = `Hello ${customerName}, engineer ${engineerName} has been assigned to your ticket ${ticketNumber}. They will contact you shortly. - Hermes Service`;
    return this.sendSms(phone, message);
  }

  async sendTicketResolvedSms(
    phone: string,
    customerName: string,
    ticketNumber: string,
  ): Promise<boolean> {
    const message = `Hello ${customerName}, your ticket ${ticketNumber} has been resolved. Please confirm within 5 days or it will auto-close. - Hermes Service`;
    return this.sendSms(phone, message);
  }

  async sendQuotationSentSms(
    phone: string,
    customerName: string,
    ticketNumber: string,
    amount: number,
  ): Promise<boolean> {
    const message = `Hello ${customerName}, a quotation of ₹${amount.toFixed(2)} has been sent for ticket ${ticketNumber}. Please review and respond. - Hermes Service`;
    return this.sendSms(phone, message);
  }

  async sendEngineerNewAssignmentSms(
    phone: string,
    engineerName: string,
    ticketNumber: string,
    customerName: string,
  ): Promise<boolean> {
    const message = `Hello ${engineerName}, you have been assigned ticket ${ticketNumber} for customer ${customerName}. Please check the portal for details. - Hermes Service`;
    return this.sendSms(phone, message);
  }

  async sendUrgentStatusUpdateSms(
    phone: string,
    customerName: string,
    ticketNumber: string,
    newStatus: string,
  ): Promise<boolean> {
    const message = `Hello ${customerName}, your ticket ${ticketNumber} status updated to: ${newStatus}. - Hermes Service`;
    return this.sendSms(phone, message);
  }
}
