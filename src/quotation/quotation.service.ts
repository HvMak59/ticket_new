// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { Quotation } from "./entity/quotation.entity";

// @Injectable()
// export class QuotationService {
//   constructor(
//     @InjectRepository(Quotation)
//     private repo: Repository<Quotation>,
//   ) { }

//   upload(ticketId: string, dto: UploadQuotationDto, user) {
//     const quotation = this.repo.create({
//       ticketId,
//       pdfPath: dto.pdfPath,
//       status: QuotationStatus.DRAFT,
//       sentById: user.id,
//     });
//     return this.repo.save(quotation);
//   }

//   send(q: Quotation, user) {
//     q.status = QuotationStatus.SENT;
//     q.sentAt = new Date();
//     q.sentById = user.id;
//     return this.repo.save(q);
//   }

//   revise(q: Quotation, dto, user) {
//     q.status = QuotationStatus.REVISED;
//     q.version += 1;
//     q.pdfPath = dto.pdfPath;
//     return this.repo.save(q);
//   }

//   accept(q: Quotation, user) {
//     q.status = QuotationStatus.ACCEPTED;
//     q.respondedById = user.id;
//     q.respondedAt = new Date();
//     return this.repo.save(q);
//   }

//   reject(q: Quotation, dto, user) {
//     q.status = QuotationStatus.REJECTED;
//     q.rejectionReason = dto.reason;
//     q.respondedById = user.id;
//     q.respondedAt = new Date();
//     return this.repo.save(q);
//   }

//   requestChange(q: Quotation, dto, user) {
//     q.status = QuotationStatus.CHANGE_REQUESTED;
//     q.changeRequestNote = dto.note;
//     q.respondedById = user.id;
//     q.respondedAt = new Date();
//     return this.repo.save(q);
//   }
// }





import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from './entity/quotation.entity';
import { TicketActivity } from '../ticket/entity/ticket-activity.entity';
import { CreateQuotationDto, RespondQuotationDto } from './dto';
import { EmailService } from '../email/email.service';
import { QuotationStatus, TicketStatus } from 'src/common';
import { TicketService } from 'src/ticket/ticket.service';
// import { SmsService } from '../sms/sms.service';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation) private repo: Repository<Quotation>,
    @InjectRepository(TicketActivity) private activityRepository: Repository<TicketActivity>,
    private readonly ticketService: TicketService,
    private emailService: EmailService,
    // private smsService: SmsService,
  ) { }

  // async create(ticketId: string, dto: CreateQuotationDto, userId: string): Promise<Quotation> {
  //   const ticket = await this.ticketRepository.findOne({
  //     where: { id: ticketId },
  //     relations: ['customer'],
  //   });
  //   if (!ticket) throw new NotFoundException('Ticket not found');
  //   // if (!ticket.isChargeable) throw new BadRequestException('Cannot create quotation for warranty ticket');

  //   const quotation = this.repo.create({ ticketId: ticketId, ...dto, createdBy: userId });
  //   await this.repo.save(quotation);

  //   ticket.status = TicketStatus.QUOTATION_SENT;
  //   await this.ticketRepository.save(ticket);
  //   await this.logActivity(ticketId, 'Quotation Sent', `Quotation of ₹${dto.cost} sent`, userId);

  //   // Send email notification to customer
  //   // if (ticket.customer?.email) {
  //   //   await this.emailService.sendQuotationNotification(
  //   //     ticket.customer.email,
  //   //     ticket.customer.name,
  //   //     // ticket.ticketNumber,
  //   //     dto.cost!,
  //   //   );
  //   // }

  //   // Send SMS notification for quotation (disabled)
  //   // if (ticket.customer?.phone) {
  //   //   await this.smsService.sendQuotationSentSms(
  //   //     ticket.customer.phone,
  //   //     ticket.customer.name,
  //   //     ticket.ticketNumber,
  //   //     dto.cost,
  //   //   );
  //   // }

  //   return quotation;
  // }

  async create(createQuotationDto: CreateQuotationDto, userId: string) {
    const ticketId = createQuotationDto.ticketId ?? createQuotationDto.ticket?.id;

    const ticket = await this.ticketService.findOneById(ticketId as string);
    if (!ticket) throw new Error('Ticket not found');
    // if (!ticket.isChargeable) throw new BadRequestException('Cannot create quotation for warranty ticket');

    const quotation = this.repo.create(createQuotationDto);
    await this.repo.save(quotation);

    ticket.status = TicketStatus.QUOTATION_SENT;
    // await this.ticketService.updateStatus(ticket);
    // await this.logActivity(ticketId, 'Quotation Sent', `Quotation of ₹${createQuotationDto.cost} sent`, userId);

    return quotation;
  }

  async findByTicketId(ticketId: string): Promise<Quotation | null> {
    return this.repo.findOne({ where: { ticketId: ticketId } });
  }

  async respond(id: string, dto: RespondQuotationDto): Promise<Quotation> {
    const quotation = await this.repo.findOne({ where: { id }, relations: ['ticket'] });
    if (!quotation) throw new NotFoundException('Quotation not found');

    quotation.status = dto.status;
    quotation.respondedAt = new Date();
    await this.repo.save(quotation);

    quotation.ticket.status = dto.status === QuotationStatus.ACCEPTED ? TicketStatus.APPROVED : TicketStatus.UNDER_REVIEW;
    // await this.ticketRepository.save(quotation.ticket);
    await this.logActivity(quotation.ticketId, `Quotation ${dto.status}`, '', '');

    return quotation;
  }

  private async logActivity(ticketId: string, action: string, description: string, performedBy: string) {
    await this.activityRepository.save(this.activityRepository.create({ ticketId: ticketId, action, description, performedBy: performedBy }));
  }
}
