import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../products/entities/product.entity";
import { v4 as uuidv4 } from 'uuid';


@Entity()
export class Rating {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    rating: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    constructor() {
        this.id = uuidv4(); // Generate UUID when the entity is created
    }
}
