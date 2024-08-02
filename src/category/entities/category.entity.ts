import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Product } from '../../products/entities/product.entity';


@Entity()
export class Category extends BaseEntity {

  @Column({ type: 'varchar' })
  name: string;

  @Column('json')
  subcategories: string[];

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', default: '' })
  image: string


  @OneToMany(() => Product, product => product.category, { cascade: true, onDelete: 'CASCADE' })
  products: Product[];


}
