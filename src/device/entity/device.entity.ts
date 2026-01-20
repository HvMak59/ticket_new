import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entity/device-model.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { DeviceManufacturer } from 'src/device-manufacturer/entity/device-manufacturer.entity';

@Entity()
export class Device {
  constructor(device?: Partial<Device>) {
    Object.assign(this, device);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getKey();
  }

  @Column()
  serialNumber: string;

  @Column({ nullable: true })
  otherModelNumber: string;

  // @Column({ type: 'date', nullable: true })
  // purchaseDate: Date;

  // @Column({ type: 'date', nullable: true })
  // warrantyExpiry: Date;

  @Column()
  deviceManufacturerId: string;

  @ManyToOne(() => DeviceManufacturer, (dMfg) => dMfg.devices)
  deviceManufacturer: DeviceManufacturer;

  @Column({ nullable: true })
  deviceModelId: string;

  @ManyToOne(() => DeviceModel, (deviceModel) => deviceModel.devices)
  deviceModel: DeviceModel;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @DeleteDateColumn()
  deletedAt?: Date | number;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = (this.deviceManufacturerId ?? this.deviceManufacturer.id) +
      KEY_SEPARATOR +
      (this.deviceModelId ?? this.deviceModel.id ?? '') +
      KEY_SEPARATOR +
      (this.otherModelNumber ?? '')
  }

  getKey() {
    return (
      (this.deviceManufacturerId ?? this.deviceManufacturer.id) +
      KEY_SEPARATOR +
      (this.deviceModelId ?? this.deviceModel.id ?? '') +
      KEY_SEPARATOR +
      (this.otherModelNumber ?? '') +
      KEY_SEPARATOR +
      this.serialNumber
    );
  }
}




