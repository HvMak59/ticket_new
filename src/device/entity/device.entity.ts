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
  deviceModelId: string;

  @ManyToOne(() => DeviceModel, (dvcMdl) => dvcMdl.devices, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  deviceModel: DeviceModel;

  @Column({ nullable: true })
  otherDeviceModel: string;

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
    this.searchTerm =
      (this.deviceModelId ?? this.deviceModel.id ?? '') +
      KEY_SEPARATOR +
      (this.otherDeviceModel ?? '')
  }

  getKey() {
    return (
      (this.deviceModelId ?? this.deviceModel.id ?? '') +
      KEY_SEPARATOR +
      this.serialNumber
    );
  }
}






