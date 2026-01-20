import { PartialType } from '@nestjs/mapped-types';
import { Device } from '../entity/device.entity';

export class CreateDeviceDto extends PartialType(Device) {}
