import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entity/ticket.entity';
import { TicketActivity } from './entity/ticket-activity.entity';
import { TicketMedia } from './entity/ticket-media.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { DeviceModule } from '../device/device.module';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketActivity, TicketMedia]),
    DeviceModule,
    CustomerModule,
    UserModule,
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService, TypeOrmModule],
})
export class TicketModule {}
