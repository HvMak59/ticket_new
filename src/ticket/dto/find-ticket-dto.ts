import { FindOptionsWhere } from 'typeorm';
import { Ticket } from '../entity/ticket.entity';

export interface FindTicketDto extends FindOptionsWhere<Ticket> {
  search?: string;
  fromDate?: string;
  toDate?: string;
}
