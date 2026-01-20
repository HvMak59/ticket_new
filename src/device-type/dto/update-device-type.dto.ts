import { PartialType } from '@nestjs/mapped-types';
import { DeviceType } from '../entity/device-type.entity';

export class UpdateDeviceTypeDto extends PartialType(DeviceType) {}
