import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceManufacturer } from './entity/device-manufacturer.entity';
import { DeviceManufacturerService } from './device-manufacturer.service';
import { DeviceManufacturerController } from './device-manufacturer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceManufacturer])],
  controllers: [DeviceManufacturerController],
  providers: [DeviceManufacturerService],
  exports: [DeviceManufacturerService, TypeOrmModule],
})
export class DeviceManufacturerModule {}
