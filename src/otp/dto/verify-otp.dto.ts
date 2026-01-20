import { IsEmail, IsPhoneNumber, Length } from "class-validator";

export class VerifyOtpDto {
    // @IsPhoneNumber('IN')
    // phone: string;

    @IsEmail()
    email: string;


    @Length(6, 6)
    otp: string;
}
