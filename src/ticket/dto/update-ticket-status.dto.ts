import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../../common/enums';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
