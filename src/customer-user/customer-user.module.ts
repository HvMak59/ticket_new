import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUser } from './entities/customer-user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerUser])],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule],
})
export class CustomerUserModule { }
