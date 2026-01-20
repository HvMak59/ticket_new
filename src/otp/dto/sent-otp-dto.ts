import { IsEmail, IsPhoneNumber } from "class-validator";

export class SendOtpDto {
    // @IsPhoneNumber('IN')
    // phone: string;

    @IsEmail()
    email: string;
}
