// import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Otp } from "./entities/otp.entity";
// import { MoreThan, Repository } from "typeorm";
// import { SmsService } from "src/sms/sms.service";
// import * as bcrypt from 'bcrypt';
// import { HttpService } from "@nestjs/axios";
// import { firstValueFrom } from "rxjs";
// import { JwtService } from "@nestjs/jwt";

// // @Injectable()
// // export class OtpService {
// //     private readonly OTP_EXPIRY_MIN = 5;
// //     private readonly RESEND_COOLDOWN_SEC = 60;
// //     private readonly MAX_OTP_PER_DAY = 5;

// //     // constructor(
// //     //     @InjectRepository(Otp)
// //     //     private readonly otpRepo: Repository<Otp>,
// //     //     private readonly smsService: SmsService,
// //     // ) { }

// //     private readonly BASE_URL = 'https://api.msg91.com/api/v5/otp';

// //     constructor(private readonly httpService: HttpService) { }

// //     async sendOtp(phone: string) {
// //         const url = `${this.BASE_URL}?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${process.env.MSG91_AUTH_KEY}&otp_expiry=${process.env.MSG91_OTP_EXPIRY}`;

// //         try {
// //             await firstValueFrom(this.httpService.get(url));
// //             return { message: 'OTP sent successfully' };
// //         } catch (error) {
// //             throw new HttpException(
// //                 'OTP sending failed',
// //                 HttpStatus.BAD_GATEWAY,
// //             );
// //         }
// //     }

// //     async verifyOtp(phone: string, otp: string): Promise<boolean> {
// //         const url = `${this.BASE_URL}/verify?mobile=91${phone}&otp=${otp}&authkey=${process.env.MSG91_AUTH_KEY}`;

// //         try {
// //             const response = await firstValueFrom(this.httpService.get(url));
// //             return response.data?.type === 'success';
// //         } catch {
// //             return false;
// //         }
// //     }

// //     // async sendOtp(phone: string): Promise<void> {
// //     //     const lastOtp = await this.otpRepo.findOne({
// //     //         where: { phone },
// //     //         order: { createdAt: 'DESC' },
// //     //     });

// //     //     if (lastOtp) {
// //     //         const diff = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
// //     //         if (diff < this.RESEND_COOLDOWN_SEC) {
// //     //             throw new Error('Please wait before requesting another OTP');
// //     //         }
// //     //     }

// //     //     const otp = this.generateOtp();
// //     //     const otpHash = await bcrypt.hash(otp, 10);

// //     //     // Invalidate previous OTPs
// //     //     await this.otpRepo.delete({ phone });

// //     //     // Save OTP
// //     //     await this.otpRepo.save({
// //     //         phone,
// //     //         otpHash,
// //     //         attempts: 0,
// //     //         expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MIN * 60 * 1000),
// //     //     });

// //     //     // 6️⃣ Send OTP via SMS provider
// //     //     // await this.smsService.sendOtp(phone, otp);
// //     // }


// //     // private generateOtp(): string {
// //     //     return Math.floor(100000 + Math.random() * 900000).toString();
// //     // }
// // }


// @Injectable()
// export class OtpService {
// constructor(
//     @InjectRepository(Otp) private repo: Repository<Otp>,
//     private jwtService: JwtService,
//   ) {}

//   // Generate 6-digit OTP
//   private generateOtp() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }

//   async sendOtp(email: string) {
//     const otp = this.generateOtp();

//     const otpEntity = this.repo.create({ email, otp });
//     await this.repo.save(otpEntity);

//     // Send email
//     const transporter = this.repo.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//         user: 'your-email@gmail.com', // replace with your email
//         pass: 'your-app-password', // replace with your app password
//       },
//     });

//     await transporter.sendMail({
//       from: '"Your App" <your-email@gmail.com>',
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//     });

//     return { message: 'OTP sent to email' };
//   }

//   async verifyOtp(email: string, otp: string) {
//     const otpRecord = await this.repo.findOne({
//       where: { email, otp, isUsed: false },
//       order: { createdAt: 'DESC' },
//     });

//     if (!otpRecord) {
//       throw new Error('Invalid OTP');
//     }

//     // Mark OTP as used
//     otpRecord.isUsed = true;
//     await this.repo.save(otpRecord);

//     // Create JWT token
//     const token = this.jwtService.sign({ email });

//     return { token };
//   }
// }


import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Otp } from './entities/otp.entity';

@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otp) private repo: Repository<Otp>,
        private jwtService: JwtService,
    ) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    }

    private async sendEmail(emailId: string, otp: string) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            // port: 587,
            secure: true,
            auth: {
                user: 'mailforstudy.59@gmail.com',
                pass: 'dxkcvtbgqveowwda',
            },
        });

        // const transportOptions: SMTPTransport.Options = {
        //     host: 'smtp.gmail.com',
        //     port: 587,
        //     secure: false,
        //     family:4,
        //     auth: {
        //         user: 'mailforstudy.59@gmail.com',
        //         pass: 'dxkcvtbgqveowwda',
        //     },
        // };

        // const transporter = nodemailer.createTransport(transportOptions);

        await transporter.sendMail({
            from: '"Hermes Technologies" <norelpy@gmail.com>',
            to: emailId,
            subject: 'Login OTP',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });
    }

    async sendOtp(emailId: string) {
        console.log("In sending service");
        const otp = this.generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP valid 5 min

        const otpRecord = this.repo.create({
            emailId,
            otpHash,
            expiresAt,
        });

        await this.repo.save(otpRecord);

        await this.sendEmail(emailId, otp);

        console.log("Otp sent to email");

        return { message: 'OTP sent to email' };
    }

    async verifyOtp(emailId: string, otp: string) {
        const otpRecord = await this.repo.findOne({
            where: { emailId },
            order: { createdAt: 'DESC' },
        });

        if (!otpRecord) throw new BadRequestException('OTP not found');

        // Check if expired
        if (otpRecord.expiresAt < new Date()) {
            await this.repo.delete({ id: otpRecord.id });
            throw new BadRequestException('OTP expired');
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
            await this.repo.delete({ id: otpRecord.id });
            throw new BadRequestException('Maximum attempts reached');
        }

        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isValid) {
            otpRecord.attempts += 1;
            await this.repo.save(otpRecord);
            throw new BadRequestException('Invalid OTP');
        }

        // Mark OTP as used by setting attempts high
        otpRecord.attempts = 5;
        await this.repo.save(otpRecord);

        // Generate JWT token
        const token = this.jwtService.sign({ emailId });

        return token;
    }
}
