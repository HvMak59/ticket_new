import { PartialType } from '@nestjs/mapped-types';
import { DeviceManufacturer } from '../entity/device-manufacturer.entity';

export class UpdateDeviceManufacturerDto extends PartialType(DeviceManufacturer) {}
