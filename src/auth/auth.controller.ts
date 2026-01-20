import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './entities/local_auth_guard';
import { Public } from './entities/public_route';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';
import { OtpService } from 'src/otp/otp.service';
import { RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  private readonly logger = winstonServerLogger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  //@Public()
  @Post('login')
  login(@Request() req: any) {
    //this.logger.debug(`request : ${JSON.stringify(req)}`);
    console.log("in login")
    return this.authService.login(req.user);
  }

  @Post('login-otp')
  async loginWithOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.loginWithOtp(dto);
    // // const valid = await this.otpService.verifyOtp(dto.phone, dto.otp);
    // const valid = await this.otpService.verifyOtp(dto.email, dto.otp);

    // if (!valid) {
    //   throw new UnauthorizedException('OTP invalid');
    // }

    // // return this.authService.loginWithOtp(dto.phone);
    // return this.authService.loginWithOtp(dto.email);
  }
}
