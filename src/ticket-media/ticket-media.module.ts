// ticket-media.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketMediaController } from './ticket-media.controller';
import { TicketMedia } from './entities/ticket-media.entity';
import { TicketMediaService } from './ticket-media.services';
@Module({
    imports: [TypeOrmModule.forFeature([TicketMedia])],
    providers: [TicketMediaService],
    controllers: [TicketMediaController],
    exports: [TicketMediaService]
})
export class TicketMediaModule { }