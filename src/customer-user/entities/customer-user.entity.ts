import { Customer } from "src/customer/entity/customer.entity";
import { Ticket } from "src/ticket/entity/ticket.entity";
import { User } from "src/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class CustomerUser {
    @PrimaryColumn()
    customerId: string;

    @PrimaryColumn()
    userId: string;

    // @ManyToOne(() => Customer, (customer) => customer.customerUsers)
    // customer: Customer;

    // @ManyToOne(() => User, (user) => user.customerUsers)
    // user: User;

    // @OneToMany(() => Ticket, (ticket) => ticket.raisedBy)
    // raisedTickets: Ticket[];

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: 'System' })
    createdBy: string;
}
