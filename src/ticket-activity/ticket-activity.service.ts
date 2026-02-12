import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketActivityDto } from './dto/create-ticket-activity.dto';
import { TicketActivity } from './entities/ticket-activity.entitiy';


@Injectable()
export class TicketActivityService {
    constructor(
        @InjectRepository(TicketActivity)
        private readonly repo: Repository<TicketActivity>,
    ) { }

    async log(input: CreateTicketActivityDto) {
        const activity = this.repo.create({
            ticketId: input.ticketId,
            action: input.action,
            performedById: input.performedById,
            description: input.description,
        });
        // 
        await this.repo.save(activity);
    }


    async logMany(inputs: CreateTicketActivityDto[]) {
        const activities = inputs.map((input) =>
            this.repo.create(input),
        );

        await this.repo.save(activities);
    }
}
