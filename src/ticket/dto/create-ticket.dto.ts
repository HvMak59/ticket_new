import { PartialType } from '@nestjs/mapped-types';
import { Ticket } from '../entity/ticket.entity';
import { TicketMedia } from 'src/ticket-media/entities/ticket-media.entity';

export class CreateTicketDto extends PartialType(Ticket) {
    medias: TicketMedia[];
}


// export class CreateTicketDto {
// customerId: string;
// issueId?: string;
// deviceId?: string;
// dateOfPurchase?: string;
// createdBy?: string;

// medias: TicketMedia[]; // required
// }
