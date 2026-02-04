import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Like, Between, DeepPartial } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ticket } from './entity/ticket.entity';
import { TicketActivity } from './entity/ticket-activity.entity';
import { CreateTicketDto, UpdateTicketStatusDto, FindTicketDto, UpdateTicketDto, AssignTicketDto, } from './dto';
import { DeviceService } from '../device/device.service';
import { CustomerService } from '../customer/customer.service';
import { EmailService } from '../email/email.service';
import { User } from '../user/entity/user.entity';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
import { TicketStatus } from 'src/common';
import { CreateDeviceDto, FindDeviceDto } from 'src/device/dto';
import { UserService } from 'src/user/user.service';
// import { TicketStatus } from '@/common';
import serviceConfig from '../app_config/service.config.json';
import { TicketMediaService } from 'src/ticket-media/ticket-media.services';
import { mkdir, rename, unlink } from 'fs/promises';
import { join } from 'path';


@Injectable()
export class TicketService {
  private readonly logger = createLogger(TicketService.name);

  private readonly relations = serviceConfig.ticket.relations;

  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
    @InjectRepository(TicketActivity)
    private readonly activityRepo: Repository<TicketActivity>,
    @InjectRepository(User)
    private readonly deviceService: DeviceService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly ticketMediaService: TicketMediaService,
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

  private workingwithoutMedia = 4
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   this.logger.debug(`${fnName}: createTicketDto: ${JSON.stringify(createTicketDto)}`);

  //   let deviceId: string | null = createTicketDto.deviceId || null;
  //   let issueId: string | null = createTicketDto.issueId || null;

  //   if (!deviceId && createTicketDto.device?.deviceModelId && createTicketDto.device.serialNumber) {
  //     const device = await this.deviceService.findOrCreate({
  //       deviceModelId: createTicketDto.device.deviceModelId,
  //       serialNumber: createTicketDto.device.serialNumber,
  //     });
  //     deviceId = device.id;
  //   }

  //   if (createTicketDto.customerId && deviceId && issueId) {
  //     const duplicate = await this.repo.findOne({
  //       where: {
  //         customerId: createTicketDto.customerId,
  //         deviceId,
  //         issueId,
  //       },
  //     });

  //     if (duplicate) {
  //       throw new Error(`${DUPLICATE_RECORD}: Ticket already exists`);
  //     }
  //   }

  //   const id = await this.generateId();

  //   const ticket = this.repo.create({
  //     ...createTicketDto,
  //     id: id,
  //     deviceId,
  //     issueId,
  //     status: TicketStatus.UNDER_REVIEW,
  //     dateOfPurchase: createTicketDto.dateOfPurchase
  //       ? new Date(createTicketDto.dateOfPurchase)
  //       : null,
  //   } as DeepPartial<Ticket>);

  //   const savedTicket = await this.repo.save(ticket);
  //   this.logger.debug(`${fnName} : Ticket Created :: ${savedTicket.id}`);

  //   return savedTicket;
  // }

  private codeForMedia = 5
  async create(
    createTicketDto: CreateTicketDto,
    files: Express.Multer.File[],
  ) {
    const fnName = this.create.name;
    this.logger.debug(`${fnName}: start`);

    let deviceId = createTicketDto.deviceId || null;
    let issueId = createTicketDto.issueId || null;

    if (!deviceId && createTicketDto.device?.deviceModelId && createTicketDto.device.serialNumber) {
      const device = await this.deviceService.findOrCreate({
        deviceModelId: createTicketDto.device.deviceModelId,
        serialNumber: createTicketDto.device.serialNumber,
      });
      deviceId = device.id;
    }
    // console.log(deviceId);
    console.log(createTicketDto.customerId);

    if (createTicketDto.customerId && deviceId && issueId) {
      const duplicate = await this.repo.findOne({
        where: {
          customerId: createTicketDto.customerId,
          deviceId,
          issueId,
        },
      });

      if (duplicate) {
        await this.cleanupFiles(files);
        throw new Error('DUPLICATE_RECORD: Ticket already exists');
      }
    }

    const ticketId = await this.generateId();

    // const ticketMedias = this.ticketMediaService.buildFromFiles(files);

    // console.log(ticketMedias);

    // const ticket = this.repo.create({
    //   ...createTicketDto,
    //   id: ticketId,
    //   deviceId,
    //   issueId,
    //   status: TicketStatus.UNDER_REVIEW,
    //   dateOfPurchase: createTicketDto.dateOfPurchase
    //     ? new Date(createTicketDto.dateOfPurchase)
    //     : null,
    //   ticketMedias,
    // } as DeepPartial<Ticket>);

    // const saved = await this.repo.save(ticket);

    // this.logger.debug(`${fnName}: Ticket Created ${saved.id}`);
    // return saved;

    try {
      const movedFiles = await this.moveFilesToFinal(files, ticketId);

      const ticketMedias = this.ticketMediaService.buildFromFiles(movedFiles);

      const ticket = this.repo.create({
        ...createTicketDto,
        id: ticketId,
        status: TicketStatus.UNDER_REVIEW,
        ticketMedias,
      });

      return await this.repo.save(ticket);
    } catch (err) {
      await this.cleanupFiles(files);
      throw new Error(`Error creating ticket, ${err}`);
    }
  }


  // async moveFilesToFinal(
  //   files: Express.Multer.File[],
  //   ticketId: string,
  // ) {
  //   const targetDir = join(process.cwd(), 'uploads', 'tickets', ticketId);
  //   await mkdir(targetDir, { recursive: true });

  //   return Promise.all(
  //     files.map(async (file) => {
  //       const newPath = join(targetDir, file.filename);
  //       await rename(file.path, newPath);
  //       return { ...file, path: newPath };
  //     }),
  //   );
  // }

  async moveFilesToFinal(
    files: Express.Multer.File[],
    ticketId: string,
  ) {
    const relativeDir = join('tickets', ticketId);
    const targetDir = join(process.cwd(), 'uploads', relativeDir);

    await mkdir(targetDir, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        const newAbsolutePath = join(targetDir, file.filename);
        await rename(file.path, newAbsolutePath);

        return {
          ...file,
          path: join(relativeDir, file.filename).replace(/\\/g, '/'),
        };
      }),
    );
  }


  async cleanupFiles(files: Express.Multer.File[]) {
    await Promise.all(
      files.map(f => unlink(f.path).catch(() => null)),
    );
  }


  private commented = 4;
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

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const fnName = this.update.name;
    const input = `Input: Id: ${id}, updateTicketDto: ${JSON.stringify(updateTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (id == null) {
      throw new Error('Ticket id is not available');
    }
    else if (updateTicketDto.id == null) {
      updateTicketDto.id = id;
    }
    else if (updateTicketDto.id != id) {
      throw new Error('Ticket id does not match with update device object');
    }
    const mergedTicket = await this.repo.preload(updateTicketDto);
    this.logger.debug(
      `${fnName} : mergedTicket : ${JSON.stringify(mergedTicket)}`,
    );
    if (mergedTicket == null) {
      throw new Error(`Ticket id ${id} does not exist`);
    } else {
      return await this.repo.save(mergedTicket);
    }
  }

  async findAll(searchCriteria: FindTicketDto, relationsRequired?: boolean) {
    const fnName = this.findAll.name;
    const input = `Input : Find Tickets with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? this.relations : [];
    return await this.repo.find({
      where: searchCriteria,
      relations: relations
    });
  }

  async findOneById(id: string, relationsRequired?: boolean) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Ticket by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relation = relationsRequired ? this.relations : [];
    const ticket = await this.repo.findOne({
      where: { id },
      relations: relation
    });
    if (!ticket) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Ticket id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Ticket id : ${id} not found`);
    }
    return ticket;
  }

  // ticket raise -> send quotaion -> assing 
  async assignTicket(id: string, assignTo: string, userId: string) {
    const fnName = this.assignTicket.name;
    const input = `Input : Assign ticket ${id} to : ${assignTo}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const ticket = await this.findOneById(id, true);
    // console.log(ticket);

    const ticketTobeAssignedTo = await this.userService.findOneById(assignTo);

    ticket.assignedById = userId;
    ticket.assignedTo = ticketTobeAssignedTo;
    ticket.status = TicketStatus.ASSIGNED;
    // const updatedTicket = await this.repo.save(ticket);
    const updatedTicket = await this.update(id, ticket);

    // const customer = ticket.customer;
    const customer = ticket.customer;
    const engineerName = ticketTobeAssignedTo.name;
    // const engineerEmail = ticketTobeAssignedTo.email;

    if (customer.emailId) {
      await this.emailService.sendEngineerAssignedNotification(
        customer.emailId,
        customer.name,
        updatedTicket.id,
        engineerName
      );
    }

    if (ticketTobeAssignedTo.emailId) {
      await this.emailService.sendEngineerAssignmentNotification(
        ticketTobeAssignedTo.emailId,
        engineerName, ticket.id,
        customer?.name,
        ticket.issue
      );
    }
    return updatedTicket;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseExpiredTickets() {
    const fnName = this.autoCloseExpiredTickets.name;
    this.logger.log(`${fnName} : Running auto-close cron job...`);

    const now = new Date();
    const expiredTickets = await this.repo.find({
      where: {
        status: TicketStatus.RESOLVED,
        // autoCloseDeadline: LessThanOrEqual(now),
      },
    });

    // 
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

  async getStats() {
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

  async getActivities(ticketId: string) {
    const fnName = this.getActivities.name;
    const input = `Input : Get activities for ticket : ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.activityRepo.find({
      where: { ticketId },
      relations: ['performer'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : Ticket id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Ticket id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Ticket id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Ticket id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string) {
    const fnName = this.softDelete.name;
    const input = `Input : SoftDelete Ticket : ${id}`;

    const ticket = await this.findOneById(id);
    ticket.deletedBy = deletedBy
    await this.repo.save(ticket);

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    return await this.repo.softDelete(id);
  }

  async restore(id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Ticket : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : Ticket id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : Ticket id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} Ticket id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
  // 
  private async logActivity(ticketId: string, action: string, description: string, performedBy: string | null): Promise<TicketActivity> {
    const fnName = 'logActivity';
    this.logger.debug(`${fnName} : Logging activity for ticket ${ticketId} : ${action}`);

    const activity = this.activityRepo.create({ ticketId, action, description, performedBy: performedBy || undefined });
    return await this.activityRepo.save(activity);
  }
}
