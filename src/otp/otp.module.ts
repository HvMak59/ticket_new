// import { Module } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
// import { OtpController } from './otp.controller';
// import { OtpService } from './otp.service';

// @Module({
//     imports: [HttpModule],
//     controllers: [OtpController],
//     providers: [OtpService],
//     exports: [OtpService],
// })
// export class OtpModule { }


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { Otp } from './entities/otp.entity';
import { AuthModule } from 'src/auth/auth.module';
import { jwtConstants } from 'src/auth/constants';

@Module({
    imports: [
        TypeOrmModule.forFeature([Otp]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [OtpService],
    controllers: [OtpController],
    exports: [OtpService],
})
export class OtpModule { }
