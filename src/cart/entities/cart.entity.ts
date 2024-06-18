import { Column, Entity, JoinColumn, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
class Item {
  @Column()
  productId: string;

  @Column()
  quantity: number;
}

@Entity()
export class Cart extends BaseEntity {
  @Column({ type: 'json', nullable: true })
  products: Item[];

  @Column({ unique: true })
  userId: string;

  // @ManyToMany(() => Product)
  // @JoinColumn({name: 'productId'})
  // product?: Product;
}
