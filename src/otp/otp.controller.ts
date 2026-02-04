import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Public } from 'src/auth/entities/public_route';
@Controller('otp')
export class OtpController {
    constructor(
        private readonly otpService: OtpService,
    ) { }

    @Public()
    @Post('send-otp')
    async sendOtp(@Body('email') email: string) {
        return this.otpService.sendOtp(email);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }) {
        return this.otpService.verifyOtp(body.email, body.otp);
    }

}
