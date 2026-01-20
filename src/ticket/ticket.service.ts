import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Like, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ticket } from './entity/ticket.entity';
import { TicketActivity } from './entity/ticket-activity.entity';
import { CreateTicketDto, UpdateTicketStatusDto, AssignEngineerDto, FindTicketDto, UpdateTicketDto, } from './dto';
import { DeviceService } from '../device/device.service';
import { CustomerService } from '../customer/customer.service';
import { EmailService } from '../email/email.service';
import { User } from '../user/entity/user.entity';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
import { TicketStatus } from 'src/common';
// import { TicketStatus } from '@/common';

@Injectable()
export class TicketService {
  private readonly logger = createLogger(TicketService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    @InjectRepository(TicketActivity)
    private readonly activityRepo: Repository<TicketActivity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly deviceService: DeviceService,
    private readonly emailService: EmailService,
  ) { }

  // async generateid(): Promise<string> {
  //   const fnName = this.generateid.name;
  //   this.logger.debug(`${fnName} : Generating new ticket number`);

  //   const year = new Date().getFullYear();
  //   const prefix = `SR-${year}-`;

  //   const tickets = await this.repo.find({
  //     where: { id: Like(`${prefix}%`) },
  //     order: { id: 'DESC' },
  //     take: 1,
  //   });

  //   let nextNumber = 1;
  //   if (tickets.length > 0) {
  //     const lastNumber = parseInt(tickets[0].id.split('-')[2], 10);
  //     nextNumber = lastNumber + 1;
  //   }

  //   const id = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  //   this.logger.debug(`${fnName} : Generated ticket number : ${id}`);
  //   return id;
  // }

  async generateId() {
    const result = await this.repo.query(
      `SELECT nextval('ticket_sequence')`
    );

    const seq = result[0].nextval; // typeorm will return array of rows like this :[{nextval: '101' }]
    const now = new Date();
    const year = now.getFullYear();

    return `SR-${year}-${String(seq).padStart(6, '0')}`;
  }


  //   async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
  //     const fnName = this.create.name;
  //     const input = `Input : Create Ticket : ${JSON.stringify(createTicketDto)}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     const createDeviceDto = {
  //   serialNumber: createTicketDto.serialNumber,
  //       deviceModelId: createTicketDto.deviceModelId,
  //       otherModelNumber: createTicketDto.otherModelNumber,
  //       deviceManufacturerId: createTicketDto.devicmanufacturerId,
  //       deviceTypeId: createTicketDto.deviceType,
  //     }
  //     const device = await this.deviceService.findOrCreate({

  //     });
  // // deviceid, dmodlid, dvcmfgid,dvctypid,
  //     const customer = await this.customerService.findOrCreate({
  //       name: createTicketDto.customerName,
  //       phoneNumber: createTicketDto.customerPhone,
  //       email: createTicketDto.customerEmail,
  //       address: createTicketDto.customerAddress,
  //     });

  //     const isUnderWarranty = await this.deviceService.isUnderWarranty(device.id);
  //     const id = await this.generateid();

  //     const ticket = this.repo.create({
  //       id,
  //       deviceId: device.id,
  //       customerId: customer.id,
  //       issueId: createTicketDto.issueId,
  //       description: createTicketDto.description,
  //       // isChargeable: !isUnderWarranty,
  //       status: TicketStatus.OPEN,
  //     });

  //     const savedTicket = await this.repo.save(ticket);
  //     this.logger.debug(`${fnName} : Ticket created with number : ${id}`);

  //     await this.logActivity(savedTicket.id, 'Ticket Created', 'New service ticket has been created', null);

  //     if (customer.email) {
  //       await this.emailService.sendTicketCreatedNotification(customer.email, customer.name, id);
  //     }

  //     return this.findOneById(savedTicket.id);
  //   }

  private shouldCheck = 5;
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   const input = `Input : Create Ticket : ${JSON.stringify(createTicketDto)}`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const device = await this.deviceService.findOrCreate({
  //     id: createTicketDto.deviceId,
  //     serialNumber: createTicketDto.serialNumber,
  //     deviceModelId: createTicketDto.deviceModelId,
  //     otherModelNumber: createTicketDto.otherModelNumber,
  //     deviceManufacturerId: createTicketDto.deviceManufacturerId,
  //   });

  //   const customer = await this.customerService.findOrCreate({
  //     name: createTicketDto.customerName,
  //     phoneNumber: createTicketDto.customerPhone,
  //     email: createTicketDto.customerEmail,
  //     address: createTicketDto.customerAddress,
  //   });


  //   const ticket = this.repo.create({
  //     customerId: customer.id,
  //     raisedById: createTicketDto.raisedById ?? null,

  //     status: TicketStatus.OPEN,

  //     deviceId: device?.id ?? null,
  //     deviceManufacturerId: createTicketDto.deviceManufacturerId ?? null,
  //     deviceModelId: createTicketDto.deviceModelId ?? null,
  //     deviceTypeId: createTicketDto.deviceTypeId ?? null,

  //     issueId: createTicketDto.issueId ?? null,
  //     note: createTicketDto.note ?? null,
  //     dateOfPurchase: createTicketDto.dateOfPurchase ?? null,
  //   });

  //   const savedTicket = await this.repo.save(ticket);

  //   // this.logger.debug(`${fnName} : Ticket created with ID : ${savedTicket.id}`);

  //   await this.logActivity(
  //     // savedTicket.id,
  //     '',
  //     'Ticket Created',
  //     'New service ticket has been created',
  //     null,
  //   );

  //   /* ===========================
  //      5. Email Notification
  //      =========================== */
  //   if (customer.email) {
  //     await this.emailService.sendTicketCreatedNotification(
  //       customer.email,
  //       customer.name,
  //       // savedTicket.id,
  //       ''
  //     );
  //   }

  //   return savedTicket;
  // }

  async create(createTicketDto: CreateTicketDto) {
    const fnName = this.create.name;
    this.logger.debug(`${fnName} : Creating ticket`);

    const device = await this.deviceService.findOrCreate({
      id: createTicketDto.id,
      serialNumber: createTicketDto.serialNumber,
      deviceManufacturerId: createTicketDto.deviceManufacturerId,
      deviceModelId: createTicketDto.deviceModelId,
      otherModelNumber: createTicketDto.otherModelNumber,
    });

    const id = await this.generateId();

    const ticket = this.repo.create({
      ...createTicketDto,
      id,
      deviceId: device.id,
      status: TicketStatus.OPEN,
    });
    //

    const savedTicket = await this.repo.save(ticket);

    this.logger.debug(`${fnName} : Ticket created with id : ${savedTicket.id}`);

    await this.logActivity(
      savedTicket.id,
      'Ticket Created',
      'New service ticket has been created',
      null,
    );

    return savedTicket;
  }

  //  async update(id: string, updateDeviceDto: UpdateTicketDto) {
  //   const fnName = this.update.name;
  //   const input =
  //     'Input : id : ' +
  //     id +
  //     ' updateDevice : ' +
  //     JSON.stringify(updateDeviceDto);
  //   this.logger.debug(`${fnName} : ${input}`);
  //   if (id == null) {
  //     throw new Error('Device id is not available');
  //   } else if (updateDeviceDto.id == null) {
  //     updateDeviceDto.id = id;
  //   } else if (updateDeviceDto.id != id) {
  //     throw new Error('Device id does not match with update device object');
  //   }
  //   const mergedDevice = await this.repo.preload(updateDeviceDto);
  //   this.logger.debug(
  //     `${fnName} : mergedDevice : ${JSON.stringify(mergedDevice)}`,
  //   );
  //   if (mergedDevice == null) {
  //     throw new Error(`Device id ${id} does not exist`);
  //   } else {
  //     return await this.repo.save(mergedDevice);
  //   }
  // }

  // async update(id:string, updateTicketDto: UpdateTicketDto){
  //   const fnName = this.update.name;
  //     const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateTicketDto)}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     const mergedDevice = await this.repo.preload({ id, ...updateDeviceDto });
  //     if (mergedDevice == null) {
  //       this.logger.error(`${fnName} : ${NO_RECORD} : Device id : ${id} not found`);
  //       throw new Error(`${NO_RECORD} : Device id : ${id} not found`);
  //     } else {
  //       this.logger.debug(`${fnName} : Merged Device is : ${JSON.stringify(mergedDevice)}`);
  //       return await this.repo.save(mergedDevice);
  //     }
  // }

  async findAll(searchCriteria: FindTicketDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Tickets with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.repo.find({
      where: searchCriteria,
      relations: ['device', 'customer', 'assignee'],
    });

    // if (searchCriteria?.search) {
    //   const searchLower = searchCriteria.search.toLowerCase();
    //   tickets = tickets.filter(ticket =>
    //     ticket.id.toLowerCase().includes(searchLower) ||
    //     // ticket.customer?.name?.toLowerCase().includes(searchLower) ||
    //     ticket.device?.serialNumber?.toLowerCase().includes(searchLower)
    //   );
    // }

    // this.logger.debug(`${fnName} : Found ${tickets.length} tickets`);
    // return tickets;
  }

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Ticket by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const ticket = await this.repo.findOne({
      where: { id },
      relations: ['device', 'customer', 'assignee'],
    });
    if (!ticket) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Ticket id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Ticket id : ${id} not found`);
    }
    return ticket;
  }

  // async updateStatus(id: string, dto: UpdateTicketStatusDto, userId?: string): Promise<Ticket> {
  //   const fnName = this.updateStatus.name;
  //   const input = `Input : Update Ticket ${id} status : ${JSON.stringify(dto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const ticket = await this.findOneById(id);
  //   const updates: Partial<Ticket> = { status: dto.status };

  //   if (dto.status === TicketStatus.RESOLVED) {
  //     updates.resolvedAt = new Date();
  //     updates.autoCloseDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  //   }
  //   if (dto.status === TicketStatus.CLOSED) {
  //     updates.closeReason = dto.description || 'Closed by staff';
  //   }

  //   Object.assign(ticket, updates);
  //   await this.repo.save(ticket);
  //   this.logger.debug(`${fnName} : Ticket ${id} status updated to ${dto.status}`);

  //   await this.logActivity(id, `Status Changed to ${dto.status}`, dto.description || '', userId || null);

  //   const customer = ticket.customer;
  //   if (customer?.email) {
  //     if (dto.status === TicketStatus.RESOLVED) {
  //       await this.emailService.sendTicketResolvedNotification(customer.email, customer.name, ticket.id);
  //     } else if (dto.status === TicketStatus.CLOSED) {
  //       await this.emailService.sendTicketClosedNotification(customer.email, customer.name, ticket.id, updates.closeReason || 'Completed');
  //     } else {
  //       await this.emailService.sendTicketStatusUpdateNotification(customer.email, customer.name, ticket.id, dto.status, dto.description);
  //     }
  //   }

  //   return this.findOneById(id);
  // }

  async assignTicket(id: string, dto: AssignEngineerDto, userId?: string): Promise<Ticket> {
    const fnName = this.assignTicket.name;
    const input = `Input : Assign engineer ${dto.engineerId} to ticket ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const ticket = await this.findOneById(id);
    const engineer = await this.userRepo.findOne({ where: { id: dto.engineerId } });
    if (!engineer) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Engineer id : ${dto.engineerId} not found`);
      throw new Error(`${NO_RECORD} : Engineer id : ${dto.engineerId} not found`);
    }

    // ticket.assignedTo = dto.engineerId;
    ticket.status = TicketStatus.ASSIGNED;
    const updatedTicket = await this.repo.save(ticket);

    // const customer = ticket.customer;
    // const engineerName = engineer.fullName || engineer.email;
    const engineerName = engineer.email;

    // if (customer?.email) {
    //   await this.emailService.sendEngineerAssignedNotification(customer.email, customer.name, ticket.id, engineerName);
    // }  

    if (engineer.email) {
      // await this.emailService.sendEngineerAssignmentNotification(engineer.email, engineerName, ticket.id, customer?.name || 'Unknown', ticket.issueCategory, ticket.description);
    }

    return updatedTicket;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseExpiredTickets(): Promise<number> {
    const fnName = this.autoCloseExpiredTickets.name;
    this.logger.log(`${fnName} : Running auto-close cron job...`);

    const now = new Date();
    const expiredTickets = await this.repo.find({
      where: {
        status: TicketStatus.RESOLVED,
        // autoCloseDeadline: LessThanOrEqual(now),
      },
    });

    for (const ticket of expiredTickets) {
      ticket.status = TicketStatus.CLOSED;
      // ticket.closeReason = 'Auto-closed after 5 days with no customer response';
      await this.repo.save(ticket);
      await this.logActivity(ticket.id, 'Auto-Closed', 'Automatically closed after 5 days', null);
      this.logger.log(`${fnName} : Auto-closed ticket: ${ticket.id}`);
    }

    this.logger.log(`${fnName} : Auto-close completed. Closed ${expiredTickets.length} tickets.`);
    return expiredTickets.length;
  }

  async getStats(): Promise<any> {
    const fnName = this.getStats.name;
    this.logger.debug(`${fnName} : Getting ticket stats`);

    const tickets = await this.repo.find();
    return {
      open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter((t) =>
        [TicketStatus.UNDER_REVIEW, TicketStatus.ASSIGNED, TicketStatus.APPROVED].includes(t.status),
      ).length,
      resolved: tickets.filter((t) => [TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(t.status)).length,
      total: tickets.length,
    };
  }

  async getActivities(ticketId: string): Promise<TicketActivity[]> {
    const fnName = this.getActivities.name;
    const input = `Input : Get activities for ticket : ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.activityRepo.find({
      where: { ticketId },
      relations: ['performer'],
      order: { createdAt: 'DESC' },
    });
  }

  private async logActivity(ticketId: string, action: string, description: string, performedBy: string | null): Promise<TicketActivity> {
    const fnName = 'logActivity';
    this.logger.debug(`${fnName} : Logging activity for ticket ${ticketId} : ${action}`);

    const activity = this.activityRepo.create({ ticketId, action, description, performedBy: performedBy || undefined });
    return await this.activityRepo.save(activity);
  }
}
