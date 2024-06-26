import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/base.entity";
import { OrderStatusEnum, PaymentGatewayEnums, PaymentStatusEnum } from "../../constants";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Order extends BaseEntity {
    @Column()
    totalAmount: number;

    @Column({enum: OrderStatusEnum, default: OrderStatusEnum.PENDING})
    status: string;

    @Column({nullable: true})
    deliveryStatus: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({type: 'json'})
    items: {
        productId: string;
        quantity: number;
    }[];

    @Column({type: 'json'})
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
    };

    @Column({type: 'json', nullable: true})
    billingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
    };

    @Column({ nullable: true, default: 'ONLINE' })
    paymentMethod: string;

    @Column({ nullable: true, enum: PaymentGatewayEnums, default: PaymentGatewayEnums.HYDROGENPAY})
    paymentGateway: string;

    @Column({ nullable: true, enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
    paymentStatus: string;

    @Column({nullable: true})
    paymentReference: string;

    @Column()
    reference: string;
}

