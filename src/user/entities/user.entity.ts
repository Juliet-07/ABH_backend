import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Order } from '../../orders/entities/order.entity';


@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  referredBy: number;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  verificationCodeExpiresIn: Date;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  verifiedAt: Date;

  @Column({ nullable: true })
  forgotPasswordVerificationCode: string;

  @Column({ nullable: true })
  forgotPasswordVerificationCodeExpiresIn: Date;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  lastPasswordResetAt: Date;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }


  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
  })
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;



  
}
