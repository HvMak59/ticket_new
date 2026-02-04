import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeRequestDto {
    @IsString()
    @IsNotEmpty()
    note: string;
}
