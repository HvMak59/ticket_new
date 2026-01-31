// @ApiTags('Quotations')
// @Controller('quotations')
// @UseGuards(JwtAuthGuard, RolesGuard, QuotationStatusGuard)
// export class QuotationController {
//   constructor(private readonly service: QuotationService) { }

//   /* ============ MANAGER ============ */

//   @Post(':ticketId/upload')
//   @Roles(Role.MANAGER)
//   async upload(
//     @Param('ticketId') ticketId: string,
//     @Body() dto: UploadQuotationDto,
//     @Req() req,
//   ) {
//     return this.service.upload(ticketId, dto, req.user);
//   }

//   @Patch(':quotationId/send')
//   @Roles(Role.MANAGER)
//   @QuotationAction('SEND')
//   async send(@Req() req) {
//     return this.service.send(req.quotation, req.user);
//   }

//   @Patch(':quotationId/revise')
//   @Roles(Role.MANAGER)
//   @QuotationAction('REVISE')
//   async revise(
//     @Req() req,
//     @Body() dto: ReviseQuotationDto,
//   ) {
//     return this.service.revise(req.quotation, dto, req.user);
//   }

//   /* ============ CUSTOMER ============ */

//   @Patch(':quotationId/accept')
//   @Roles(Role.CUSTOMER)
//   @QuotationAction('ACCEPT')
//   async accept(@Req() req) {
//     return this.service.accept(req.quotation, req.user);
//   }

//   @Patch(':quotationId/reject')
//   @Roles(Role.CUSTOMER)
//   @QuotationAction('REJECT')
//   async reject(
//     @Req() req,
//     @Body() dto: RejectQuotationDto,
//   ) {
//     return this.service.reject(req.quotation, dto, req.user);
//   }

//   @Patch(':quotationId/change-request')
//   @Roles(Role.CUSTOMER)
//   @QuotationAction('REQUEST_CHANGE')
//   async requestChange(
//     @Req() req,
//     @Body() dto: ChangeRequestDto,
//   ) {
//     return this.service.requestChange(req.quotation, dto, req.user);
//   }
// }





import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto, RespondQuotationDto } from './dto';
import { Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';

@Controller('quotation')
export class QuotationController {
  private readonly logger = createLogger(QuotationController.name);

  constructor(private readonly quotationService: QuotationService) { }

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER, RoleType.FIELD_ENGINEER)
  async create(
    @UserId() userId: string,
    // @Query('ticketId') ticketId: string,
    @Body() createQuotationDto: CreateQuotationDto,
  ) {
    const fnName = this.create.name;
    // const input = `Input : Create quotation for ticket ${ticketId} : ${JSON.stringify(dto)}`;
    const input = `Input : Create quotation for ticket ${JSON.stringify(createQuotationDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      // createQuotationDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      // return await this.quotationService.create(createQuotationDto);
      // return await this.quotationService.create(ticketId, createQuotationDto, userId);
    }
  }

  @Get()
  async findByTicketId(@Query('ticketId') ticketId: string) {
    const fnName = this.findByTicketId.name;
    const input = `Input : Find quotation by ticketId : ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findByTicketId service`);

    return await this.quotationService.findByTicketId(ticketId);
  }

  @Put('respond')
  async respond(@Query('id') id: string, @Body() dto: RespondQuotationDto) {
    const fnName = this.respond.name;
    const input = `Input : Respond to quotation ${id} : ${JSON.stringify(dto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling respond service`);

    return await this.quotationService.respond(id, dto);
  }
}
