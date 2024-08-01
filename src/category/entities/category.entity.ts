import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Product } from '../../products/entities/product.entity';


@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column('text', { array: true })
  subcategories: string[]

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', default: '' })
  image: string


  @OneToMany(() => Product, product => product.category, { cascade: true, onDelete: 'CASCADE' })
  products: Product[];


}
