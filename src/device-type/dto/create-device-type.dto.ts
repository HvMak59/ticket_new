import { PartialType } from '@nestjs/mapped-types';
import { DeviceType } from '../entity/device-type.entity';

export class CreateDeviceTypeDto extends PartialType(DeviceType) {}
