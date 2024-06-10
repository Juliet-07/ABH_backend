import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rating } from '../../ratings/entities/rating.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../category/entities/category.entity';
import { Currencies } from '../../utils/constants';
import { BaseEntity } from '../../common/base.entity';
import { ProductStatusEnums } from '../../constants';


const currency_enums = Object.keys(Currencies)
@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  code: string;

  @Column('text')
  description: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  vendorId: string;

  @Column({ type: 'simple-array', nullable: true })
  categoryIds: string[];

  @Column({ name: 'sale_price', nullable: true })
  salePrice: number;

  @Column({ default: 'EN' })
  language: string;

  @Column({nullable: true})
  sku: string;

  @Column({nullable: true})
  videoUrl: string;

  @Column()
  quantity: number;

  @Column({type: 'float', nullable: true})
  size: number;

  @Column({ name: 'sold_quantity', nullable: true })
  soldQuantity: number;

  @Column({ name: 'in_stock', default: true })
  inStock: boolean;

  @Column({ name: 'is_taxable', default: true })
  isTaxable: boolean;

  @Column({ name: 'in_flash_sale', default: false })
  inFlashSale: boolean;

  @Column({ name: 'shipping_class_id', nullable: true })
  shippingClassId: number;

  @Column({default: ProductStatusEnums.PENDING, enum: ProductStatusEnums})
  status: string;

  @Column({ name: 'product_type', nullable: true })
  productType: string;

  @Column()
  unit: string;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  length: number;

  @Column({type: 'json', nullable: true})
  images: {
    id: number;
    url: string;
  }[];

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true, enum: currency_enums })
  currency: string;

  @Column({ name: 'is_digital', nullable: true })
  isDigital: boolean;

  @Column({nullable: true})
  ratings: number;

  @Column({ name: 'total_reviews', nullable: true })
  totalReviews: number;

  @OneToMany(() => Rating, (rating) => rating.id)
  rating: Rating[];

  @Column({ name: 'my_review', nullable: true })
  myReview: string;

  @Column({ name: 'in_wishlist', default: false })
  inWishlist: boolean;


  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
