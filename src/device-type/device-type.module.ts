import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceType } from './entity/device-type.entity';
import { DeviceTypeService } from './device-type.service';
import { DeviceTypeController } from './device-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceType])],
  controllers: [DeviceTypeController],
  providers: [DeviceTypeService],
  exports: [DeviceTypeService, TypeOrmModule],
})
export class DeviceTypeModule {}
