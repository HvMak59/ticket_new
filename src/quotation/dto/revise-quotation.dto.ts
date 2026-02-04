import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviseQuotationDto {
    @IsString()
    @IsNotEmpty()
    pdfPath: string;

    @IsOptional()
    @IsString()
    pdfName?: string;
}
