import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketStatusDto, AssignEngineerDto, FindTicketDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';

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

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createTicketDto: CreateTicketDto
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createTicketDto,)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createTicketDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling create service`);
      return await this.ticketService.create(
        createTicketDto,
      );
    }
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER, UserRole.FIELD_ENGINEER)
  async findAll(@Query() findTicketDto: FindTicketDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Tickets with query : ${JSON.stringify(findTicketDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.ticketService.findAll(findTicketDto);
  }

  @Get('stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER, UserRole.FIELD_ENGINEER)
  async getStats() {
    const fnName = this.getStats.name;

    this.logger.debug(`${fnName} : Getting ticket stats`);
    this.logger.debug(`${fnName} : Calling getStats service`);

    return await this.ticketService.getStats();
  }

  @Get('track')
  async findByTicketNumber(@Query('ticketNumber') ticketNumber: string) {
    const fnName = this.findByTicketNumber.name;
    const input = `Input : Find Ticket by ticketNumber : ${ticketNumber}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findByTicketNumber service`);

    // return await this.ticketService.findByTicketNumber(ticketNumber);
  }

  @Get('id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER, UserRole.FIELD_ENGINEER)
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Ticket by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.ticketService.findOneById(id);
  }

  @Get('activities')
  async getActivities(@Query('ticketId') ticketId: string) {
    const fnName = this.getActivities.name;
    const input = `Input : Get activities for ticket : ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling getActivities service`);

    return await this.ticketService.getActivities(ticketId);
  }

  @Put('status')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER, UserRole.FIELD_ENGINEER)
  async updateStatus(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    const fnName = this.updateStatus.name;
    const input = `Input : Update Ticket ${id} status : ${JSON.stringify(dto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling updateStatus service`);
      // return await this.ticketService.updateStatus(id, dto, userId);
    }
  }

  @Put('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SERVICE_MANAGER)
  async assignTo(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() dto: AssignEngineerDto,
  ) {
    const fnName = this.assignTo.name;
    const input = `Input : Assign engineer to ticket ${id} : ${JSON.stringify(dto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling assignEngineer service`);
      // return await this.ticketService.assignEngineer(id, dto, userId);
    }
  }

  @Post('auto-close')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
