import { PartialType } from '@nestjs/mapped-types';
import { Ticket } from '../entity/ticket.entity';

export class CreateTicketDto extends PartialType(Ticket) {
  // Device info
  id: string;
  serialNumber: string;
  deviceModelId: string;
  deviceTypeId: string;
  otherModelNumber: string;
  deviceManufacturerId: string;
  purchaseDate?: string;
  warrantyExpiry?: string;

  // Customer info
  customerId: string;

  // Issue info
  issueId: string;
  description: string;
}
