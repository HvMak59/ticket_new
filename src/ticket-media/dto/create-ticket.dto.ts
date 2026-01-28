// create-ticket-media.dto.ts
import { IsEnum, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { FileType } from '../../common/enums';
import { PartialType } from '@nestjs/mapped-types';
import { TicketMedia } from '../entities/ticket-media.entity';

export class CreateTicketMediaDto extends PartialType(TicketMedia) {
    // @IsUUID()
    // ticketId: string;

    // @IsEnum(FileType)
    // fileType: FileType;

    // @IsOptional()
    // @IsBoolean()
    // isResolutionProof?: boolean;
}