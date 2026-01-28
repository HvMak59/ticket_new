import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { DeviceModel } from '../../device-model/entity/device-model.entity';
import { Issue } from 'src/issue/entities/issue.entity';

@Entity()
export class DeviceType {
  constructor(deviceType?: Partial<DeviceType>) {
    Object.assign(this, deviceType);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  // @OneToMany(() => DeviceModel, (deviceModel) => deviceModel.deviceType)
  // deviceModels: DeviceModel[];

  @OneToMany(() => DeviceModel, (device) => device.deviceType, {
    cascade: ['update'],
    onDelete: 'SET NULL',
  })
  deviceModels: DeviceModel[];

  @OneToMany(() => Issue, (issue) => issue.deviceType)
  issues: Issue[];

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





