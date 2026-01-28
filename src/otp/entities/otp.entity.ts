import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Otp {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @Column()
    // phone: string;

    @Column()
    emailId: string;

    @Column()
    otpHash: string;

    @Column()
    expiresAt: Date;

    @Column({ default: 0 })
    attempts: number;

    @CreateDateColumn()
    createdAt: Date;
}
