import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './entity/quotation.entity';
// import { QuotationService } from './quotation.service';
// import { QuotationController } from './quotation.controller';
import { TicketModule } from '../ticket/ticket.module';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation]), TicketModule],
  controllers: [QuotationController],
  providers: [QuotationService],
  exports: [QuotationService],
})
export class QuotationModule { }
