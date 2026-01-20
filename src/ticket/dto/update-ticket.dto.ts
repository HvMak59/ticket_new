import { PartialType } from '@nestjs/mapped-types';
import { Ticket } from '../entity/ticket.entity';

export class UpdateTicketDto extends PartialType(Ticket) {}
