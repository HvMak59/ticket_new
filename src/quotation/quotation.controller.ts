// @ApiTags('Quotations')
// @Controller('quotations')
// @UseGuards(JwtAuthGuard, RolesGuard, QuotationStatusGuard)
// export class QuotationController {
//   constructor(private readonly service: QuotationService) { }

// 

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

// 

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
  Body,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { QuotationAction } from './quotation-action.decorator';
import { QuotationService } from './quotation.service';
import { QuotationPdfInterceptor } from './interceptor/quotation-pdf.interceptor';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';

// @Controller('quotation')
// export class QuotationController {
//   private readonly logger = createLogger(QuotationController.name);

//   constructor(private readonly quotationService: QuotationService) { }

//   @Post()
//   // @UseGuards(JwtAuthGuard, RolesGuard)
//   // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER, RoleType.FIELD_ENGINEER)
//   async create(
//     @UserId() userId: string,
//     // @Query('ticketId') ticketId: string,
//     @Body() createQuotationDto: CreateQuotationDto,
//   ) {
//     const fnName = this.create.name;
//     // const input = `Input : Create quotation for ticket ${ticketId} : ${JSON.stringify(dto)}`;
//     const input = `Input : Create quotation for ticket ${JSON.stringify(createQuotationDto)}`;

//     this.logger.debug(fnName + KEY_SEPARATOR + input);

//     if (userId == null) {
//       this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
//       throw new Error(USER_NOT_IN_REQUEST_HEADER);
//     } else {
//       // createQuotationDto.createdBy = userId;
//       this.logger.debug(`${fnName} : Calling Create service`);
//       // return await this.quotationService.create(createQuotationDto);
//       // return await this.quotationService.create(ticketId, createQuotationDto, userId);
//     }
//   }

//   @Get()
//   async findByTicketId(@Query('ticketId') ticketId: string) {
//     const fnName = this.findByTicketId.name;
//     const input = `Input : Find quotation by ticketId : ${ticketId}`;

//     this.logger.debug(fnName + KEY_SEPARATOR + input);
//     this.logger.debug(`${fnName} : Calling findByTicketId service`);

//     return await this.quotationService.findByTicketId(ticketId);
//   }

//   @Put('respond')
//   async respond(@Query('id') id: string, @Body() dto: RespondQuotationDto) {
//     const fnName = this.respond.name;
//     const input = `Input : Respond to quotation ${id} : ${JSON.stringify(dto)}`;

//     this.logger.debug(fnName + KEY_SEPARATOR + input);
//     this.logger.debug(`${fnName} : Calling respond service`);

//     return await this.quotationService.respond(id, dto);
//   }
// }


@Controller('quotation')
export class QuotationController {
  private readonly logger = createLogger(QuotationController.name);
  constructor(private readonly quotationService: QuotationService) { }

  @Post('upload')
  // @Roles(RoleType.SERVICE_MANAGER)
  @UseInterceptors(QuotationPdfInterceptor)
  async uploadQuotation(
    @UserId() userId: string,
    @Body('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log("In controller");
    const fnName = this.uploadQuotation.name;
    const input = `Input: Updload quotation for ticket: ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if(userId == null){
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling upsertQuoation service`);
      return this.quotationService.upsertQuotation(ticketId, file);
    }
  }

  @Post('send')
  // @Roles(RoleType.SERVICE_MANAGER)
  async sendQuotation(
    @UserId() userId: string,
    @Query('ticketId') ticketId: string,
    @Query('emailId') emailId: string,
  ) {
     const fnName = this.sendQuotation.name;
    const input = `Input: Send quotation for ticket: ${ticketId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if(userId == null){
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling sendQuotation service`);
      return this.quotationService.sendQuotation(ticketId, emailId, userId);
    }
  }

  @Patch('accept')
  // @Roles(RoleType.CUSTOMER)
  @QuotationAction('ACCEPT')
  async accept(
    @UserId() userId: string,
    @Query('ticketId') ticketId: string
  ) {
    return await this.quotationService.acceptQuotation(ticketId, userId);
  }

  @Patch('reject')
  // @Roles(RoleType.CUSTOMER)
  async reject(
    @UserId() userId: string,
    @Query('ticketId') ticketId: string
  ) {
    return this.quotationService.reject(ticketId, userId);
  }

  @Get()
  async findByTicket(@Query('ticketId') ticketId: string) {
    return this.quotationService.findByTicketId(ticketId);
  }
}



  // @Post('upload')
  // @Roles(RoleType.SERVICE_MANAGER)
  // async upload(
  //   @Query('ticketId') ticketId: string,
  //   @Body() dto: UploadQuotationDto,
  //   @UserId() userId: string,
  // ) {
  //   return this.quotationService.upload(ticketId, dto, userId);
  // }

  // @Patch('revise')
  // @Roles(RoleType.SERVICE_MANAGER)
  // @QuotationAction('REVISE')
  // async revise(
  //   @Req() req: any,
  //   @Body() dto: ReviseQuotationDto,
  // ) {
  //   return this.quotationService.revise(req.quotation, dto);
  // }

  
  // @Patch('change-request')
  // @Roles(RoleType.CUSTOMER)
  // @QuotationAction('REQUEST_CHANGE')
  // async requestChange(
  //   @Req() req: any,
  //   @Body() dto: ChangeRequestDto,
  // ) {
  //   return this.quotationService.requestChange(req.quotation, dto, req.user.id);
  // }


// @Controller('quotations')
// export class QuotationController {
//   constructor(private readonly service: QuotationService) { }

//   @Post()
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   register(@Body() dto: RegisterQuotationDto) {
//     return this.service.registerQuotation(dto);
//   }

//   /** Admin/User sends quotation */
//   @Post('send')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   send(
//     @Query('id') id: string,
//     @Req() req: any,
//   ) {
//     return this.service.sendQuotation(id, req.user);
//   }

//   /** Customer accepts */
//   @Post('accept')
//   // @UseGuards(CustomerAuthGuard)
//   accept(@Query('id') id: string, @Req() req: any) {
//     return this.service.accept(id, req.user);
//   }

//   /** Customer rejects */
//   @Post(':id/reject')
//   // @UseGuards(CustomerAuthGuard)
//   reject(
//     @Query('id') id: string,
//     @Body('rejectionReason') reason: string,
//     @Req() req: any,
//   ) {
//     return this.service.reject(id, req.user, reason);
//   }

//   @Post('modify')
//   // @UseGuards(CustomerAuthGuard)
//   requestChange(
//     @Query('id') id: string,
//     @Body('changeRequestNote') note: string,
//     @Req() req: any,
//   ) {
//     return this.service.changeRequest(id, req.user, note);
//   }
// }