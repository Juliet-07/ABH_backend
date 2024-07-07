import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/base.entity";
import { OrderStatusEnum, PaymentGatewayEnums, PaymentStatusEnum, ShippingMethodEnums } from "../../constants";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../products/entities/product.entity";
import { Transaction } from "../../transaction/entities/transaction.entity";
import { Vendor } from "../../vendors/entities/vendor.entity";

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

    @Column()
    vendorId: string;

    @ManyToOne(() => Vendor, vendor => vendor.orders)
    @JoinColumn({ name: 'vendorId' })
    vendor: Vendor;

    // @Column({type: 'json'})
    // items: {
    //     productId: string;
    //     quantity: number;
    // }[];
    @Column()
    productId: string;

    @ManyToOne(() => Product, product => product.orders)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    transactionId: string;

    @ManyToOne(() => Transaction, transaction => transaction.orders)
    @JoinColumn({ name: 'transactionId' })
    transaction: Transaction;

    @Column({type: 'numeric'})
    quantity: number;

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

    @Column({type: 'enum', enum: ShippingMethodEnums})
    shippingMethod: string;

    @Column()
    reference: string;
}

