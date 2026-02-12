import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Quotation } from "./entity/quotation.entity";
import { Repository } from "typeorm";
import { TicketService } from "src/ticket/ticket.service";
import { QuotationStatus, TicketStatus } from "src/common";
import { ReviseQuotationDto } from "./dto/revise-quotation.dto";
import { ChangeRequestDto } from "./dto/change-request.dto";
import { EmailService } from "src/email/email.service";
import { join } from "path";
import { mkdir, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";


@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation) private repo: Repository<Quotation>,
    private readonly ticketService: TicketService,
    private readonly emailService: EmailService,
  ) { }

  async upsertQuotation(
    ticketId: string,
    file: Express.Multer.File
  ) {
    const relativeDir = join('tickets', ticketId);
    console.log(relativeDir);

    const uploadsRoot = join(process.cwd(), 'uploads');
    console.log(uploadsRoot);


    const ticketDir = join(uploadsRoot, relativeDir);
    console.log(ticketDir);

    const fileName = 'quotation.pdf';
    const relativePath = join(relativeDir, fileName).replace(/\\/g, '/');
    const absolutePath = join(ticketDir, fileName);

    await mkdir(ticketDir, { recursive: true });

    let quotation = await this.repo.findOne({ where: { ticketId } });

    if (quotation?.filePath) {
      const oldPath = join(uploadsRoot, quotation.filePath);
      try {
        await unlink(oldPath);
      } catch (_) { }
    }

    // write new file   
    await writeFile(absolutePath, file.buffer);

    let status = QuotationStatus.DRAFT;
    let version;
    // let sentAt;
    // const sentById = userId;


    // if (quotation) {
    //   nextStatus =
    //     quotation.status === QuotationStatus.DRAFT
    //       ? QuotationStatus.DRAFT
    //       : QuotationStatus.REVISED;
    // }

    if (!quotation) {
      // First time upload
      status = QuotationStatus.DRAFT;
      // sentAt = new Date();
    } else if (quotation.status === QuotationStatus.REJECTED) {
      // Re-send after rejection
      status = QuotationStatus.REVISED;
      version = quotation.version + 1;
      // sentAt = new Date();
    } else {
      // normal update
      status =
        quotation.status === QuotationStatus.DRAFT
          ? QuotationStatus.DRAFT
          : QuotationStatus.REVISED;
    }
    // 117125013481

    quotation = this.repo.create({
      ...quotation,
      ticketId,
      fileName: file.originalname,
      filePath: relativePath,
      status,
      version
    });
    // 
    return this.repo.save(quotation);
  }


  // async upload(ticketId: string, dto: UploadQuotationDto, userId: string) {
  //   const ticket = await this.ticketService.findOneById(ticketId);
  //   if (!ticket) throw new Error('Ticket not found');

  //   const quotation = this.repo.create({
  //     ticketId,
  //     pdfPath: dto.pdfPath,
  //     pdfName: dto.pdfName,
  //     status: QuotationStatus.DRAFT,
  //     sentById: userId,
  //   });
  //   // 
  //   return this.repo.save(quotation);
  // }

  // async send(q: Quotation, userId: string) {
  //   q.status = QuotationStatus.SENT;
  //   q.sentAt = new Date();
  //   q.sentById = userId;

  //   q.ticket.status = TicketStatus.QUOTATION_SENT;
  //   await this.ticketService.update(q.ticketId, {
  //     status: TicketStatus.QUOTATION_SENT,
  //   });
  //   return this.repo.save(q);
  // } 

  // async send(q: Quotation, /*userId: string*/) {
  //   if (!q.ticket?.customer?.emailId) {
  //     throw new Error('Customer email not available');
  //   }

  //   await this.emailService.sendQuotationEmail(
  //     q.ticket.customer.emailId,
  //     q.ticket.customer.name,
  //     q.ticketId,
  //     q.id,
  //     q.version,
  //     q.pdfPath,
  //   );

  //   await this.ticketService.update(q.ticketId, {
  //     status: TicketStatus.QUOTATION_SENT,
  //   });
  //   q.status = QuotationStatus.SENT;
  //   q.sentAt = new Date();

  //   await this.repo.save(q);

  //   return q;
  // }


  private correctlyWorking = 4;
  // async sendQuotation(ticketId: string, emailId: string, sentBy: string) {
  //   // 1. Fetch quotation
  //   console.log("in service");
  //   const quotation = await this.repo.findOne({ where: { ticketId } });

  //   // console.log(quotation)
  //   if (!quotation || !quotation.pdfPath) {
  //     throw new Error('Quotation not found');
  //   }

  //   // 2. Build absolute file path
  //   const uploadsRoot = join(process.cwd(), 'uploads');
  //   const absolutePath = join(uploadsRoot, quotation.pdfPath);

  //   if (!existsSync(absolutePath)) {
  //     throw new Error('Quotation file missing on server');
  //   }

  //   // 3. Send email
  //   await this.emailService.sendEmail({
  //     to: emailId,
  //     subject: `Quotation for Ticket ${ticketId}`,
  //     html: `
  //       <p>Hello,</p>
  //       <p>Please find attached the quotation for your ticket.</p>
  //       <p>Regards,<br/>Support Team</p>
  //     `,
  //     attachments: [
  //       {
  //         filename: quotation.pdfName ?? 'quotation.pdf',
  //         path: absolutePath,
  //       },
  //     ],
  //   });

  //   quotation.status = QuotationStatus.SENT;
  //   quotation.sentById = sentBy;
  //   quotation.sentAt = new Date();

  //   await this.repo.save(quotation);

  //   return {
  //     message: 'Quotation sent successfully',
  //   };
  // }


  async sendQuotation(
    ticketId: string,
    emailId: string,
    sentByUserId: string,
  ) {
    // Fetch quotation
    const quotation = await this.repo.findOne({ where: { ticketId } });

    if (!quotation || !quotation.filePath) {
      throw new Error('Quotation not found');
    }

    const uploadsRoot = join(process.cwd(), 'uploads');
    const absolutePath = join(uploadsRoot, quotation.filePath);

    if (!existsSync(absolutePath)) {
      throw new Error('Quotation file missing on server');
    }

    // Send email
    await this.emailService.sendEmail({
      to: emailId,
      subject: `Quotation for Ticket ${ticketId}`,
      html: `
      <p>Hello,</p>
      <p>Please find attached the quotation for your ticket.</p>
      <p>Regards,<br/>Support Team</p>
    `,
      attachments: [
        {
          filename: quotation.fileName ?? 'quotation.pdf',
          path: absolutePath,
        },
      ],
    });

    // Update quotation state
    quotation.status = QuotationStatus.SENT;
    quotation.sentById = sentByUserId;
    quotation.sentAt = new Date();
    // 
    await this.repo.save(quotation);

    return {
      message: 'Quotation sent successfully',
    };
  }


  async acceptQuotation(ticketId: string, customerId: string) {
    const quotation = await this.repo.findOne({ where: { ticketId } });

    if (!quotation) {
      throw new Error('No qotation found');
    }

    quotation.status = QuotationStatus.ACCEPTED;
    console.log(customerId);
    quotation.respondedById = customerId;
    quotation.respondedAt = new Date();

    return this.repo.save(quotation);
  }


  // async revise(q: Quotation, dto: ReviseQuotationDto) {
  //   q.status = QuotationStatus.REVISED;
  //   q.version += 1;
  //   q.pdfPath = dto.pdfPath;
  //   // q.pdfName = dto.pdfName;

  //   return this.repo.save(q);
  // }

  // async accept(q: Quotation, customerId: string) {
  //   q.status = QuotationStatus.ACCEPTED;
  //   q.respondedById = customerId;
  //   q.respondedAt = new Date();
  //   // 
  //   // q.ticket.status = TicketStatus.APPROVED;
  //   await this.ticketService.update(q.ticketId, {
  //     status: TicketStatus.APPROVED,
  //   });
  //   return this.repo.save(q);
  // }

  async reject(ticketId: string, customerId: string) {
    // async reject(q: Quotation, dto: RejectQuotationDto, customerId: string) {
    const quotation = await this.repo.findOne({ where: { ticketId } });

    if (!quotation) {
      throw new Error('No qotation found');
    }

    quotation.status = QuotationStatus.REJECTED;
    quotation.respondedById = customerId;
    quotation.respondedAt = new Date();

    return this.repo.save(quotation!);
  }

  // async requestChange(q: Quotation, dto: ChangeRequestDto, customerId: string) {
  //   q.status = QuotationStatus.CHANGE_REQUESTED;
  //   q.changeRequestNote = dto.note;
  //   q.respondedById = customerId;
  //   q.respondedAt = new Date();

  //   return this.repo.save(q);
  // }

  async findByTicketId(ticketId: string) {
    return this.repo.find({
      where: { ticketId },
    });
  }
}





// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Quotation } from './entity/quotation.entity';
// import { TicketActivity } from '../ticket/entity/ticket-activity.entity';
// import { CreateQuotationDto, RespondQuotationDto } from './dto';
// import { EmailService } from '../email/email.service';
// import { QuotationStatus, TicketStatus } from 'src/common';
// import { TicketService } from 'src/ticket/ticket.service';
// // import { SmsService } from '../sms/sms.service';

// @Injectable()
// export class QuotationService {
//   constructor(
//     @InjectRepository(Quotation) private repo: Repository<Quotation>,
//     @InjectRepository(TicketActivity) private activityRepository: Repository<TicketActivity>,
//     private readonly ticketService: TicketService,
//     private emailService: EmailService,
//     // private smsService: SmsService,
//   ) { }

//   // async create(ticketId: string, dto: CreateQuotationDto, userId: string): Promise<Quotation> {
//   //   const ticket = await this.ticketRepository.findOne({
//   //     where: { id: ticketId },
//   //     relations: ['customer'],
//   //   });
//   //   if (!ticket) throw new NotFoundException('Ticket not found');
//   //   // if (!ticket.isChargeable) throw new BadRequestException('Cannot create quotation for warranty ticket');

//   //   const quotation = this.repo.create({ ticketId: ticketId, ...dto, createdBy: userId });
//   //   await this.repo.save(quotation);

//   //   ticket.status = TicketStatus.QUOTATION_SENT;
//   //   await this.ticketRepository.save(ticket);
//   //   await this.logActivity(ticketId, 'Quotation Sent', `Quotation of ₹${dto.cost} sent`, userId);

//   //   // Send email notification to customer
//   //   // if (ticket.customer?.email) {
//   //   //   await this.emailService.sendQuotationNotification(
//   //   //     ticket.customer.email,
//   //   //     ticket.customer.name,
//   //   //     // ticket.ticketNumber,
//   //   //     dto.cost!,
//   //   //   );
//   //   // }

//   //   // Send SMS notification for quotation (disabled)
//   //   // if (ticket.customer?.phone) {
//   //   //   await this.smsService.sendQuotationSentSms(
//   //   //     ticket.customer.phone,
//   //   //     ticket.customer.name,
//   //   //     ticket.ticketNumber,
//   //   //     dto.cost,
//   //   //   );
//   //   // }

//   //   return quotation;
//   // }

//   async create(createQuotationDto: CreateQuotationDto, userId: string) {
//     const ticketId = createQuotationDto.ticketId ?? createQuotationDto.ticket?.id;

//     const ticket = await this.ticketService.findOneById(ticketId as string);
//     if (!ticket) throw new Error('Ticket not found');
//     // if (!ticket.isChargeable) throw new BadRequestException('Cannot create quotation for warranty ticket');

//     const quotation = this.repo.create(createQuotationDto);
//     await this.repo.save(quotation);

//     ticket.status = TicketStatus.QUOTATION_SENT;
//     // await this.ticketService.updateStatus(ticket);
//     // await this.logActivity(ticketId, 'Quotation Sent', `Quotation of ₹${createQuotationDto.cost} sent`, userId);

//     return quotation;
//   }

//   async findByTicketId(ticketId: string): Promise<Quotation | null> {
//     return this.repo.findOne({ where: { ticketId: ticketId } });
//   }

//   async respond(id: string, dto: RespondQuotationDto): Promise<Quotation> {
//     const quotation = await this.repo.findOne({ where: { id }, relations: ['ticket'] });
//     if (!quotation) throw new NotFoundException('Quotation not found');

//     quotation.status = dto.status;
//     quotation.respondedAt = new Date();
//     await this.repo.save(quotation);

//     quotation.ticket.status = dto.status === QuotationStatus.ACCEPTED ? TicketStatus.APPROVED : TicketStatus.UNDER_REVIEW;
//     // await this.ticketRepository.save(quotation.ticket);
//     await this.logActivity(quotation.ticketId, `Quotation ${dto.status}`, '', '');

//     return quotation;
//   }

//   private async logActivity(ticketId: string, action: string, description: string, performedBy: string) {
//     await this.activityRepository.save(this.activityRepository.create({ ticketId: ticketId, action, description, performedBy: performedBy }));
//   }
// }
