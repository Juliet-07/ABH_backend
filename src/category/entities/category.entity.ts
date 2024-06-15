import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/base.entity";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class Category extends BaseEntity {
    @Column({unique: true})
    name: string;

    @Column()
    description: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
