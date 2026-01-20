import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
@Controller('otp')
export class OtpController {
    constructor(
        private readonly otpService: OtpService,
    ) { }

    // @Post('send')
    // async sendOtp(@Body() dto: SendOtpDto) {
    //     return this.otpService.sendOtp(dto.phone);
    // }

    // @Post('verify')
    // async verifyOtp(@Body() dto: VerifyOtpDto) {
    //     const valid = await this.otpService.verifyOtp(dto.phone, dto.otp);

    //     if (!valid) {
    //         throw new UnauthorizedException('Invalid or expired OTP');
    //     }

    //     return { verified: true };
    // }


    @Post('send-otp')
    async sendOtp(@Body('email') email: string) {
        return this.otpService.sendOtp(email);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }) {
        return this.otpService.verifyOtp(body.email, body.otp);
    }

    // /**
    //  * STEP 1: Send OTP
    //  */
    // @Public()
    // @Post('send')
    // async sendOtp(@Body() dto: SendOtpDto) {
    //     await this.otpService.sendOtp(dto.phone);
    //     return { message: 'OTP sent successfully' };
    // }

    // /**
    //  * STEP 2: Verify OTP & Login Customer
    //  */
    // @Public()
    // @Post('verify')
    // async verifyOtp(@Body() dto: VerifyOtpDto) {
    //     await this.otpService.verifyOtp(dto.phone, dto.otp);
    //     // return this.authService.loginCustomerWithPhone(dto.phone);
    // }
}
