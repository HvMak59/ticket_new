import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entity/device-model.entity';
import { Device } from 'src/device/entity/device.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class DeviceManufacturer {
  constructor(deviceManufacturer?: Partial<DeviceManufacturer>) {
    Object.assign(this, deviceManufacturer);
  }

  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  // @OneToMany(() => Device, (device) => device.deviceManufacturer)
  // devices: Device[];

  @OneToMany(() => DeviceModel, (device) => device.deviceManufacturer, {
    nullable: true,
    cascade: true,
  })
  deviceModels: DeviceModel[];

  // @OneToMany(() => DeviceModel, (deviceModel) => deviceModel.deviceManufacturer)
  // deviceModels: DeviceModel[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.id + KEY_SEPARATOR + this.name;
  }
}
