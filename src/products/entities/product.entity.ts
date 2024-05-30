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

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'sale_price', nullable: true })
  salePrice: number;

  @Column({ default: 'EN' })
  language: string;

  // @Column({ name: 'min_price' })
  // minPrice: number;

  // @Column({ name: 'max_price' })
  // maxPrice: number;

  @Column()
  sku: string;

  @Column()
  quantity: number;

  @Column({ name: 'sold_quantity', nullable: true })
  soldQuantity: number;

  @Column({ name: 'in_stock' })
  inStock: boolean;

  @Column({ name: 'is_taxable' })
  isTaxable: boolean;

  @Column({ name: 'in_flash_sale' })
  inFlashSale: boolean;

  @Column({ name: 'shipping_class_id', nullable: true })
  shippingClassId: number;

  @Column({default: 'PENDING'})
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

  @Column({ name: 'manufacturer_id', nullable: true })
  manufacturerId: number;

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

  @Column({ name: 'in_wishlist' })
  inWishlist: boolean;


  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
