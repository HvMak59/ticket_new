import { FindOptionsWhere } from 'typeorm';
import { DeviceType } from '../entity/device-type.entity';

export interface FindDeviceTypeDto extends FindOptionsWhere<DeviceType> {}
