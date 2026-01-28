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

  private readonly relations = serviceConfig.device.relations;

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

  private woking = 1;
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   this.logger.debug(`${fnName} : Creating ticket`);

  //   const device = await this.deviceService.findOrCreate({
  //     id: createTicketDto.id,
  //     serialNumber: createTicketDto.serialNumber,
  //     deviceManufacturerId: createTicketDto.deviceManufacturerId,
  //     deviceModelId: createTicketDto.deviceModelId,
  //     otherModelNumber: createTicketDto.otherModelNumber,
  //   });

  //   const id = await this.generateId();

  //   // const issueId: string | null = createTicketDto.issueId ?? null;

  //   const issueId: string | null = createTicketDto.issueId ?? null;
  //   const isOtherIssue = !createTicketDto.issueId;

  //   const ticket = this.repo.create({
  //     ...createTicketDto,
  //     id,
  //     deviceId: device.id,
  //     issueId,
  //     isOtherIssue,
  //     status: TicketStatus.OPEN,
  //   });

  //   // let issueId: string | null = null;
  //   //     let isOtherIssue = false;

  //   //     if (createTicketDto.issueId) {
  //   //       // Predefined issue
  //   //       issueId = createTicketDto.issueId;
  //   //     } else {
  //   //       // Customer typed issue
  //   //       isOtherIssue = true;
  //   //     }

  //   //     const ticket = this.repo.create({
  //   //       ...createTicketDto,
  //   //       id,
  //   //       deviceId: device.id,
  //   //       issueId,
  //   //       isOtherIssue,
  //   //       status: TicketStatus.OPEN,
  //   //     });

  //   const savedTicket = await this.repo.save(ticket);

  //   this.logger.debug(`${fnName} : Ticket created with id : ${savedTicket.id}`);

  //   await this.logActivity(
  //     savedTicket.id,
  //     'Ticket Created',
  //     'New service ticket has been created',
  //     null,
  //   );

  //   return savedTicket;
  // }

  private lastWorking = 4;
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   this.logger.debug(`${fnName} : Creating ticket`);

  //   const findOrCreateDeviceDto = {
  //     id: createTicketDto.id,
  //     serialNumber: createTicketDto.serialNumber,
  //     deviceManufacturerId: createTicketDto.deviceManufacturerId,
  //     deviceModelId: createTicketDto.deviceModelId,
  //     otherModelNumber: createTicketDto.otherModelNumber,
  //   }
  //   const device = await this.deviceService.findOrCreate(findOrCreateDeviceDto);

  //   const id = await this.generateId();

  //   const issueId: string | null = createTicketDto.issueId ?? null;
  //   const isOtherIssue: boolean = !createTicketDto.issueId;
  //   const otherIssueId: string | undefined = isOtherIssue ? createTicketDto.otherIssueId : undefined;
  //   const otherIssueDesc: string | undefined = isOtherIssue ? createTicketDto.otherIssueDesc : undefined;

  //   const isOtherManufacturer: boolean = !createTicketDto.deviceManufacturerId && !!createTicketDto.otherManufacturerName;
  //   const isOtherModel: boolean = !createTicketDto.deviceModelId && !!createTicketDto.otherDeviceModelName;

  //   const ticket = this.repo.create({
  //     ...createTicketDto,
  //     id,
  //     deviceId: device.id,
  //     issueId,
  //     // isOtherIssue,
  //     otherIssueId,
  //     otherIssueDesc,
  //     // isOtherManufacturer,
  //     // isOtherModel,
  //     status: TicketStatus.UNDER_REVIEW,
  //   });

  //   const savedTicket = await this.repo.save(ticket);
  //   this.logger.debug(`${fnName} : Ticket created with id : ${savedTicket.id}`);

  //   // await this.logActivity(
  //   //   savedTicket.id,
  //   //   'Ticket Created',
  //   //   'New service ticket has been created',
  //   //   null,
  //   // );

  //   return savedTicket;
  // }

  private mysimplified = 4
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   const input = `Input: creatTicketDto: ${JSON.stringify(createTicketDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const record = await this.repo.findOne({
  //     where: {
  //       customerId: createTicketDto.customerId,
  //       issueId: createTicketDto.issueId,
  //       deviceId: createTicketDto.deviceId
  //     }
  //   })

  //   if (record) {
  //     this.logger.error(`${fnName}: ${DUPLICATE_RECORD}: Ticket already exists`);
  //     throw new Error(`${DUPLICATE_RECORD}: Ticket already exists`);
  //   }
  //   else {
  //     const issueId = createTicketDto.issueId ?? null;
  //     const otherIssueId = createTicketDto.otherIssueId ?? undefined;
  //     const otherIssueDesc = createTicketDto.otherIssueDesc ?? undefined;

  //     const deviceModelId = createTicketDto.deviceModelId;
  //     const serialNumber = createTicketDto.serialNumber;
  //     let deviceId = null;

  //     if (deviceModelId) {
  //       const findDeviceDto: CreateDeviceDto = {
  //         deviceModelId: deviceModelId,
  //         serialNumber: serialNumber
  //       }
  //       // const device = await this.deviceService.findOne(findDeviceDto);
  //       const device = await this.deviceService.findOrCreate(findDeviceDto);
  //       deviceId = device?.id;
  //     }
  //     const id = await this.generateId();

  //     const ticket = this.repo.create({
  //       ...createTicketDto,
  //       id,
  //       issueId,
  //       otherIssueId,
  //       otherIssueDesc,
  //       otherDeviceModelName: createTicketDto.otherDeviceModelName,
  //       otherManufacturerName: createTicketDto.otherManufacturerName
  //     })

  //     const savedTicket = await this.repo.save(ticket);

  //     this.logger.debug(
  //       `${fnName} : Ticket created with id : ${savedTicket.id}`,
  //     );

  //     return savedTicket;
  //   }
  // }


  private todayCorrectIThink = 4
  // async create(createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   this.logger.debug(`${fnName} :: Input :: ${JSON.stringify(createTicketDto)}`);

  //   let deviceId: string | null = null;
  //   let issueId: string | null = null;

  //   // handle issue
  //   if (createTicketDto.issueId) {
  //     issueId = createTicketDto.issueId;
  //   }

  //   // handle device creation only if model & serial are present
  //   if (createTicketDto.device) {
  //     if (createTicketDto.device.deviceModelId && createTicketDto.device.serialNumber) {
  //       const device = await this.deviceService.findOrCreate({
  //         deviceModelId: createTicketDto.device.deviceModelId,
  //         serialNumber: createTicketDto.device.serialNumber,
  //       });
  //       deviceId = device.id;
  //     }

  //   }
  //   // duplicate check only when master references exist
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

  //   const createDto: any = {
  //     ...createTicketDto,
  //     id: id,
  //     customerId: createTicketDto.customerId,
  //     deviceId,
  //     issueId,
  //     otherIssueId: createTicketDto.otherIssueId ?? null,
  //     otherIssueDesc: createTicketDto.otherIssueDesc ?? null,
  //     otherManufacturerName: createTicketDto.otherManufacturerName ?? null,
  //     otherDeviceModelName: createTicketDto.otherDeviceModelName ?? null,

  //     dateOfPurchase: createTicketDto.dateOfPurchase ?? null,
  //     ticketMediaId: createTicketDto.ticketMediaId ?? null,
  //   }
  //   const ticket = this.repo.create({

  //   });

  //   const savedTicket = await this.repo.save(ticket);

  //   this.logger.debug(`${fnName} : Ticket Created :: ${savedTicket.id}`);

  //   return savedTicket;
  // }


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

    let deviceId: string | null = createTicketDto.deviceId || null;
    let issueId: string | null = createTicketDto.issueId || null;

    if (!deviceId && createTicketDto.device?.deviceModelId && createTicketDto.device.serialNumber) {
      const device = await this.deviceService.findOrCreate({
        deviceModelId: createTicketDto.device.deviceModelId,
        serialNumber: createTicketDto.device.serialNumber,
      });
      deviceId = device.id;
    }
    console.log(deviceId);

    if (createTicketDto.customerId && deviceId && issueId) {
      const duplicate = await this.repo.findOne({
        where: {
          customerId: createTicketDto.customerId,
          deviceId,
          issueId,
        },
      });

      if (duplicate) {
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

      const ticketMedias =
        this.ticketMediaService.buildFromFiles(movedFiles);


      const ticket = this.repo.create({
        ...createTicketDto,
        id: ticketId,
        status: TicketStatus.UNDER_REVIEW,
        ticketMedias,
      });

      return await this.repo.save(ticket);
    } catch (err) {
      await this.cleanupFiles(files);
      throw err;
    }
  }


  async moveFilesToFinal(
    files: Express.Multer.File[],
    ticketId: string,
  ) {
    const targetDir = join(process.cwd(), 'uploads', 'tickets', ticketId);
    await mkdir(targetDir, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        const newPath = join(targetDir, file.filename);
        await rename(file.path, newPath);
        return { ...file, path: newPath };
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

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Ticket by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const ticket = await this.repo.findOne({
      where: { id },
      relations: ['device', 'customer', 'issue'],
    });
    if (!ticket) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Ticket id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Ticket id : ${id} not found`);
    }
    return ticket;
  }

  async assignTicket(id: string, assignTo: string, userId: string) {
    const fnName = this.assignTicket.name;
    const input = `Input : Assign ticket ${id} to : ${assignTo}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const ticket = await this.findOneById(id);
    // console.log(ticket);

    const ticketTobeAssignedTo = await this.userService.findOneById(assignTo);
    ticket.assignedById = userId;
    ticket.assignedTo = ticketTobeAssignedTo;
    ticket.status = TicketStatus.ASSIGNED;
    const updatedTicket = await this.repo.save(ticket);

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
    await this.repo.restore(id);
    const device = await this.findOneById(id);
    // device.deletedBy = null;
    return device;
  }

  private async logActivity(ticketId: string, action: string, description: string, performedBy: string | null): Promise<TicketActivity> {
    const fnName = 'logActivity';
    this.logger.debug(`${fnName} : Logging activity for ticket ${ticketId} : ${action}`);

    const activity = this.activityRepo.create({ ticketId, action, description, performedBy: performedBy || undefined });
    return await this.activityRepo.save(activity);
  }
}
