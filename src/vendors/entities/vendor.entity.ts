import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { VendorStatusEnums } from "../../constants";

@Entity()
export class Vendor {
    @PrimaryGeneratedColumn('uuid')
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

    @Column()
    store: string;

    @Column({enum: VendorStatusEnums, default: VendorStatusEnums.PENDING})
    status: string;

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
        type: 'timestamp'
    })
    verifiedAt: Date

    @Column({ nullable: true })
    forgotPasswordVerificationCode: string;

    @Column({ nullable: true })
    forgotPasswordVerificationCodeExpiresIn: Date;

    @Column({
        nullable: true,
        type: 'timestamp'
    })
    lastPasswordResetAt: Date

    @Column()
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    @UpdateDateColumn({
        nullable: true,
        type: 'timestamp'
    })
    lastLoginAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

}
