import { FindOptionsWhere } from 'typeorm';
import { Device } from '../entity/device.entity';

export interface FindDeviceDto extends FindOptionsWhere<Device> {}
