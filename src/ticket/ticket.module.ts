import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entity/ticket.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { DeviceModule } from '../device/device.module';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from '../user/user.module';
import { TicketMediaModule } from 'src/ticket-media/ticket-media.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    DeviceModule,
    CustomerModule,
    UserModule,
    TicketMediaModule
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService, TypeOrmModule],
})
export class TicketModule { }
