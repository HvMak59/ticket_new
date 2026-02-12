import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketStatusDto, FindTicketDto, UpdateTicketDto, AssignTicketDto } from './dto';
import { FileType, Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { TicketMedia } from 'src/ticket-media/entities/ticket-media.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TicketMediaInterceptor } from 'src/ticket-media/ticket-media.interceptor';

@Controller('ticket')
export class TicketController {
  private readonly logger = createLogger(TicketController.name);

  constructor(private readonly ticketService: TicketService) { }

  // @Post()
  // async create(@Body() createTicketDto: CreateTicketDto) {
  //   const fnName = this.create.name;
  //   const input = `Input : ${JSON.stringify(createTicketDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   this.logger.debug(`${fnName} : Calling Create service`);

  //   return await this.ticketService.create(createTicketDto);
  // }


  private check = 4;
  // @Post()
  // @UseInterceptors(FilesInterceptor('files'))
  // @UseInterceptors(TicketMediaInterceptor)
  // async create(
  //   @UserId() userId: string,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() createTicketDto: CreateTicketDto,
  // ) {
  //   const fnName = this.create.name;
  //   this.logger.debug(`${fnName} : Input : ${JSON.stringify(createTicketDto)}`);

  //   if (!userId) {
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   }

  //   if (!files || files.length === 0) {
  //     throw new Error('At least one media file is required');
  //   }

  //   // map files → TicketMedia entities
  //   const medias = files.map(file =>
  //     new TicketMedia({
  //       id: crypto.randomUUID(),
  //       filePath: file.path,          // already uploaded by multer
  //       fileName: file.originalname,
  //       mimeType: file.mimetype,
  //       size: file.size,
  //       fileType: FileType.IMAGE,
  //     }),
  //   );

  //   createTicketDto.createdBy = userId;
  //   createTicketDto.medias = medias;

  //   return this.ticketService.create(createTicketDto);
  // }

  @UseInterceptors(TicketMediaInterceptor)
  // @Roles(RoleType.ADMIN) 
  @Post()
  async create(
    @UserId() userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createTicketDto: CreateTicketDto,
  ) {
    // console.log("files", files)
    const fnName = this.create.name;
    const input = `Input: createTicketDto: ${JSON.stringify(createTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    console.log("in controller");

    if (!userId) {
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      createTicketDto.createdBy = userId;
      console.log("Calling create service");
      return this.ticketService.create(createTicketDto, files);
    }

  }

  private thisIsWorking = 5;
  // @Post()
  // async create(
  //   @UserId() userId: string,
  //   @Body() createTicketDto: CreateTicketDto
  // ) {
  //   const fnName = this.create.name;
  //   const input = `Input : ${JSON.stringify(createTicketDto,)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw new Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     createTicketDto.createdBy = userId;
  //     this.logger.debug(`${fnName} : Calling create service`);
  //     return await this.ticketService.create(
  //       createTicketDto,
  //     );
  //   }
  // }


  @Get()
  async findAll(@Query() findTicketDto: FindTicketDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Tickets with query : ${JSON.stringify(findTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.ticketService.findAll(findTicketDto);
  }

  @Get('relations')
  async findAllWthRelation(@Query() findTicketDto: FindTicketDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Tickets with relation with searchCriteria : ${JSON.stringify(findTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.ticketService.findAll(findTicketDto, relationsRequired);
  }

  @Get('stats')
  async getStats() {
    const fnName = this.getStats.name;

    this.logger.debug(`${fnName} : Getting ticket stats`);
    this.logger.debug(`${fnName} : Calling getStats service`);

    return await this.ticketService.getStats();
  }

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Ticket by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.ticketService.findOneById(id);
  }


  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id}, UpdateTicketDto : ${JSON.stringify(updateTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateTicketDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);
      return await this.ticketService.update(id, updateTicketDto);
    }
  }

  @Patch('assignTicket')
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER)
  async assignTicket(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body('assignTo') assignTo: string,
  ) {
    const fnName = this.assignTicket.name;
    const input = `Input : Assign ticket ${id} to : ${assignTo}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling assignTo service`);
      return await this.ticketService.assignTicket(id, assignTo, userId);
    }
  }

  @Patch('close')
  async closeTicket(
    @UserId() userId: string,
    @Query('id') id: string
  ) {
    const fnName = this.closeTicket.name;
    const input = `Input: close ticket : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling close service`);
      return this.ticketService.closeTicket(id);
    }
  }

  @Delete()
  // @UseGuards( RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : Ticket id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.ticketService.delete(id);
    }
  }


  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : SoftDelete Ticket : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling softDelete service`);
      return await this.ticketService.softDelete(id, userId);
    }
  }

  @Delete('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Ticket : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.ticketService.restore(id);
    }
  }

  @Post('auto-close')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN)
  async triggerAutoClose(@UserId() userId: string) {
    const fnName = this.triggerAutoClose.name;

    this.logger.debug(`${fnName} : Triggering auto-close`);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling autoCloseExpiredTickets service`);
      const count = await this.ticketService.autoCloseExpiredTickets();
      return { message: `Closed ${count} expired tickets` };
    }
  }
}
