import { PartialType } from '@nestjs/mapped-types';
import { TicketActivity } from '../entities/ticket-activity.entitiy';

export class CreateTicketActivityDto extends PartialType(TicketActivity) { }
