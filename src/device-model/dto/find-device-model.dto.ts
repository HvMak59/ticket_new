import { FindOptionsWhere } from 'typeorm';
import { DeviceModel } from '../entity/device-model.entity';

export interface FindDeviceModelDto extends FindOptionsWhere<DeviceModel> {}
