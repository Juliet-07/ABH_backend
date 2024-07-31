import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { PaymentGatewayEnums, PaymentStatusEnum } from '../../constants';



@Entity()
export class Transaction extends BaseEntity {


    @Column()
    reference: string;

    @OneToMany(() => Order, order => order.transaction)
    orders: Order[];

    @Column({ type: 'numeric' })
    amount: number;

    @Column({ type: 'numeric' })
    totalProductAmount: number;

    @Column({ type: 'numeric' })
    shippingFee: number;

    @Column({ enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
    status: string;

    @Column({ nullable: true, default: 'ONLINE' })
    paymentMethod: string;

    @Column({ nullable: true, enum: PaymentGatewayEnums, default: PaymentGatewayEnums.HYDROGENPAY })
    paymentGateway: string;

    // Reference from Payment Provider
    @Column({ nullable: true })
    paymentReference: string;


}