import { PartialType } from '@nestjs/mapped-types';
import { DeviceModel } from '../entity/device-model.entity';

export class UpdateDeviceModelDto extends PartialType(DeviceModel) {}
