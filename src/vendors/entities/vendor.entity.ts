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
import { BaseEntity } from "../../common/base.entity";

@Entity()
export class Vendor extends BaseEntity {

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phoneNumber: string;

    @Column({nullable: true})
    alternatePhoneNumber: string;

    @Column({nullable: true})
    address: string;

    @Column()
    code: string;

    @Column()
    store: string;

    @Column()
    country: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column({enum: VendorStatusEnums, default: VendorStatusEnums.PENDING})
    status: string;

    // Operational Details
    @Column({ nullable: true })
    businessType: string;

    @Column({ nullable: true })
    nationalIdentificationNumber: string;

    @Column({ nullable: true })
    taxIdentificationNumber: string;

    @Column({ nullable: true })
    cacRegistrationNumber: string;

    @Column({ nullable: true })
    cacCertificateUrl: string;

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

    @Column({nullable: true, select: false})
    password: string;

    // @BeforeInsert()
    // async hashPassword() {
    //     this.password = await bcrypt.hash(this.password, 10);
    // }

    async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    @UpdateDateColumn({
        nullable: true,
        type: 'timestamp'
    })
    lastLoginAt: Date;
}
