import { IsNotEmpty, IsString } from 'class-validator';

export class RejectQuotationDto {
    @IsString()
    @IsNotEmpty()
    reason: string;
}
