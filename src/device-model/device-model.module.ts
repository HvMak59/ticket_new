import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModel } from './entity/device-model.entity';
import { DeviceModelService } from './device-model.service';
import { DeviceModelController } from './device-model.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceModel])],
  controllers: [DeviceModelController],
  providers: [DeviceModelService],
  exports: [DeviceModelService, TypeOrmModule],
})
export class DeviceModelModule {}
