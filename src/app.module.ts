import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './user-role/user-role.module';
import { RoleModule } from './role/role.module';
import { DeviceModule } from './device/device.module';
import { DeviceTypeModule } from './device-type/device-type.module';
import { DeviceModelModule } from './device-model/device-model.module';
import { DeviceManufacturerModule } from './device-manufacturer/device-manufacturer.module';
import { CustomerModule } from './customer/customer.module';
import { TicketModule } from './ticket/ticket.module';
import { QuotationModule } from './quotation/quotation.module';
import { EmailModule } from './email/email.module';
import { IssueModule } from './issue/issue.module';
import { CustomerUserModule } from './customer-user/customer-user.module';
import { DistrictModule } from './district/district.module';
import { StateModule } from './state/state.module';
import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './common';
import { JwtAuthGuard } from './auth/entities/jwt-auth-guard';
import { TicketMediaModule } from './ticket-media/ticket-media.module';
import { RolesGuard } from './common/guards/roles.guard';
import { TicketActivityModule } from './ticket-activity/ticket-activity.module';
import { WebSocketModule } from './websockets/websocket.module';
import { TelemetryPayloadModule } from './telemetry-payload/telemetry-payload.module';
import { CurrentTelemetryPayloadModule } from './current-telemetry-payload/current-telemetry-payload.module';
import { MetricsAttributeModule } from './metrics-attribute/metrics-attribute.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VirtualDeviceModule } from './virtual-device/virtual.device.module';
// import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'hiten1234'),
        database: config.get('DB_NAME', 'hermes'),
        autoLoadEntities: true,
        // synchronize: config.get('NODE_ENV') !== 'production',
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'your-secret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    UserRoleModule,
    RoleModule,
    DeviceModule,
    DeviceTypeModule,
    DeviceModelModule,
    DeviceManufacturerModule,
    CustomerModule,
    // CustomerUserModule,
    TicketModule,
    TicketActivityModule,
    TicketMediaModule,
    QuotationModule,
    IssueModule,
    EmailModule,
    // SmsModule,
    DistrictModule,
    StateModule,
    WebSocketModule,

    VirtualDeviceModule,
    TelemetryPayloadModule,
    CurrentTelemetryPayloadModule,
    MetricsAttributeModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // authentication
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // authorization
    },
  ]
})
export class AppModule { }




// Pgadmin pass: hiten1234

// For Andhra : 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/LNGStrg/RtBn1/Andh1/inf -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrRtvAttaV1/info/2026010016 -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrRtvAttaV1/info/2026010016 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq 'select(.deviceId == "2026010016")'
// 

// punasan :
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"
// mosquitto_sub -h hermesmqtt.com -t HermesIOT/DrRtvGrwtV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"

// Twadartham 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"

// {"RID":1,"DID":"117125013481","IMEI":"866082073599459","PV":553.7,"PI":8.0,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.5,"TMRH":0.5,"LPM":296,"TKWH":2.1,"TLKWH":2.1,"TKL":8.4,"TKLH":8.4,"RUN":1,"FAULT":0,"TMP":41.4,"LAT":0.0,"LON":0.0,"INT":10,"SIG":80,"LGT":"2026-02-07 17:02:38"}

// {"RID":1,"DID":"117125013481","IMEI":"866082073599459","PV":539.3,"PI":8.2,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.6,"TMRH":0.6,"LPM":296,"TKWH":2.8,"TLKWH":2.8,"TKL":11.4,"TKLH":11.4,"RUN":1,"FAULT":0,"TMP":41.2,"LAT":0.0,"LON":0.0,"INT":10,"SIG":70,"LGT":"2026-02-07 17:12:53"}

// {"RID":1,"DID":"117125013480","IMEI":"866082073736127","PV":531.9,"PI":8.3,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.2,"TMRH":0.2,"LPM":296,"TKWH":0.7,"TLKWH":0.7,"TKL":3.0,"TKLH":3.0,"RUN":1,"FAULT":0,"TMP":40.2,"LAT":0.0,"LON":0.0,"INT":10,"SIG":64,"LGT":"2026-02-07 17:28:25"}

// {"RID":1,"DID":"117125013480","IMEI":"866082073736127","PV":532.0,"PI":8.3,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.3,"TMRH":0.3,"LPM":296,"TKWH":1.5,"TLKWH":1.5,"TKL":5.9,"TKLH":5.9,"RUN":1,"FAULT":0,"TMP":39.7,"LAT":0.0,"LON":0.0,"INT":10,"SIG":67,"LGT":"2026-02-07 17:38:40"}




// PSI : 
// GPRB/202526/1/76481
// confirmaion no : 97327152


// Ojas : 
// Regd : 37302843
// PSI (Wireless): GPRB/202526/2/4454
// confirmation no : 97789923

// ngrok installation : 
// choco install ngrok -y
// ngrok config add-authtoken your-auth-token(this will be from ngrok login account)


// to use sequence we need to create it : 
// CREATE SEQUENCE ticket_seq;


// for email : 
// npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs nodemailer
// npm install --save-dev @types/bcryptjs


// Election : 
// EPIC : NHJ2231512


// 1 - ivt,invt
// 2 - invt , sngr
// 3 - invt, invt, sngr
// 4 - grwt, grwt
// 5 - invt, invt
// 6 - sngrw 


// Gitlab 
// git clone https://gitlab.com .....
// cd apni-repo
// git pull origin main
// git checkout -b 'branch-name'
// now make changes in file 
// git status  ye command esa kuch dikhayega modified: config/prod.json
// git add .
// git commit -m "Update MQTT host in prod config"
// git push origin 'branch-name'


// For Login 
// Request
// → LocalAuthGuard
// → LocalStrategy.validate()
// → User returned
// → AuthService.login()
// → JWT generated
// → Response


// For Protected route 
// Request
// → JwtAuthGuard.canActivate()
// → Passport JWT verification
// → JwtStrategy.validate()
// → request.user set
// → RolesGuard.canActivate()
// → Role check
// → Controller method
// → Response

// sebi :
// 1401000207 
// 717051567


// License : 3185254025

// cg (crompton grave) drive - check rmu with this drive 




