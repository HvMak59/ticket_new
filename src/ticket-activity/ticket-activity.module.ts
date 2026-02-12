import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketActivity } from './entities/ticket-activity.entitiy';
import { TicketActivityService } from './ticket-activity.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketActivity]),
    ],
    controllers: [],
    providers: [TicketActivityService],
    exports: [TicketActivityService, TypeOrmModule],
})
export class TicketActivityModule { }
