import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
  Unique,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DeviceType } from '../../device-type/entity/device-type.entity';
import { DeviceManufacturer } from '../../device-manufacturer/entity/device-manufacturer.entity';
import { Device } from '../../device/entity/device.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class DeviceModel {
  constructor(deviceModel?: Partial<DeviceModel>) {
    Object.assign(this, deviceModel);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getPrimaryKey();
  }

  getPrimaryKey(): string {
    return (
      this.deviceManufacturerId +
      KEY_SEPARATOR +
      this.deviceTypeId +
      KEY_SEPARATOR +
      this.name
    );
  }

  @Column()
  name: string;

  @Column()
  deviceTypeId: string;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.deviceModels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  deviceType: DeviceType;

  @Column()
  deviceManufacturerId: string;

  @ManyToOne(() => DeviceManufacturer, (deviceManufacturer) => deviceManufacturer.deviceModels,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  deviceManufacturer: DeviceManufacturer;

  // @OneToMany(() => Device, (device) => device.deviceModel)
  // devices: Device[];

  @OneToMany(() => Device, (device) => device.deviceModel, {
    nullable: true,
    cascade: true,
  })
  devices?: Device[];

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}



