import { PartialType } from '@nestjs/mapped-types';
import { Device } from '../entity/device.entity';

export class UpdateDeviceDto extends PartialType(Device) {
  constructor(updateDevice?: UpdateDeviceDto) {
    super();
    if (updateDevice) {
      Object.assign(this, updateDevice);
    }
  }
}
