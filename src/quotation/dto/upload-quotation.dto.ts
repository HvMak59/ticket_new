import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadQuotationDto {
    @IsString()
    @IsNotEmpty()
    pdfPath: string;

    @IsOptional()
    @IsString()
    pdfName?: string;
}
