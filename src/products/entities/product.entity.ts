import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Rating } from '../../ratings/entities/rating.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Category } from '../../category/entities/category.entity';
import { Currencies } from '../../utils/constants';
import { BaseEntity } from '../../common/base.entity';
import { ProductStatusEnums } from '../../constants';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';


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

  @Column({ nullable: true })
  categoryId: string;

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

  @Column({ name: 'sold_quantity', nullable: true, default: 0 })
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

  @Column({nullable: true})
  featured_image: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  comments: string;

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

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Cart, (cart) => cart.products)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];
}
