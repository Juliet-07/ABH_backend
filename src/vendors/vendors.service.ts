import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { LoginVendorDto } from './dto/login-vendor.dto';
import { LoginResponse } from '../user/user.interface';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { BlockStatusEnums, VendorStatusEnums } from '../constants';
import { ManageVendorDto } from './dto/manage-vendor.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class VendorsService {
  cacheKey = 'all_vendor';

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingService: MailingService,
    private redisService: RedisService,
  ) { }

  async create(
    createVendorDto: CreateVendorDto,
  ): Promise<Vendor> {
    try {
      const vendor = this.vendorRepository.create(createVendorDto);


      // Generate Vendor Unique Code
      vendor.code = this.helpers.genCode(10);

      const result = await this.vendorRepository.save(vendor);

      // Invalidate cache after a new vendor is created
      // await this.cacheManager.del(this.cacheKey);

      delete result.password;

      return result;
    } catch (error) {
      console.error("the ERROR", error)
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<string> {
    // Get Valid Referrer.

    const referrer = await this.vendorRepository.findOne({ where: { code } });

    if (!referrer) throw new Error('Invalid Referrer Code');

    return referrer.id;
  }

  async login(loginVendorDto: LoginVendorDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginVendorDto;
      const vendor = await this.vendorRepository.findOne({
        where: {
          email,
        },
        select: ['id', 'password', 'lastLoginAt', 'status']
      });
      console.log(vendor)
      if (!vendor) throw new NotFoundException('Vendor Not Found');
      const isPasswordCorrect = await vendor.comparePassword(password);
      if (!isPasswordCorrect)
        throw new UnauthorizedException('Incorrect Password');

      if (vendor.status !== VendorStatusEnums.ACTIVE)
        throw new ForbiddenException(`ACCOUNT ${vendor.status}`);

      const lastLoginAt = new Date().toISOString();
      await this.vendorRepository.update(vendor.id, {
        lastLoginAt,
      });
      const payload = { id: vendor.id, email, lastLoginAt };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async requstVerification(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const vendor = await this.vendorRepository.findOne({ where: { email } });
      if (!vendor) throw new NotFoundException('Vendor not found');
      if (vendor.verified)
        throw new BadRequestException('Vendor already verified');

      const { token: verificationCode, expiresIn: verificationCodeExpiresIn } =
        this.helpers.generateVerificationCode();

      await this.vendorRepository.update(vendor.id, {
        verificationCode,
        verificationCodeExpiresIn,
      });

      // Send Email For Token
      try {
        await this.mailingService.send({
          subject: 'Email Verification',
          email: vendor.email,
          html: `name: ${vendor.firstName} ${vendor.lastName},Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(
            verificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });
      } catch (error) { }
    } catch (error) {
      throw error;
    }
  }

  async verifyVendorAccount(verifyVendorDto: VerifyVendorDto): Promise<void> {
    try {
      const { code, email } = verifyVendorDto;

      const vendor = await this.vendorRepository.findOne({
        where: {
          email,
        },
      });

      if (!vendor)
        throw new NotFoundException(`Vendor with the email ${email} not found`);
      if (vendor.verified)
        throw new BadRequestException('Vendor already verified');
      if (vendor.verificationCode !== code)
        throw new BadRequestException('Invalid Code');

      // Verify Vendor Verification Code and Expiry Time
      const isExpired = this.helpers.hasCodeExpired(
        vendor.verificationCodeExpiresIn,
      );

      if (isExpired)
        throw new BadRequestException(
          'Expired Verification code, kindly request for a new one',
        );

      // Update DB and set verification status
      const updateData = {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verificationCode: null,
        verificationCodeExpiresIn: null,
      };

      await this.vendorRepository.update(vendor.id, updateData);
    } catch (error) {
      throw error;
    }
  }

  async manageVendorRegistration(
    manageVendorDto: ManageVendorDto,
    id: string | any,
  ): Promise<string> {
    try {
      const { status } = manageVendorDto;

      const vendor = await this.vendorRepository.findOne({
        where: {
          id,
        },
      });

      if (!vendor) throw new NotFoundException(`Vendor not found`);

      const rawPassword = this.helpers.generateDefaultPassword(20)
      const password = await bcrypt.hash(rawPassword, 10);

      // Update DB and set verification status
      const updateData = {
        status,
        ...(status === VendorStatusEnums.ACTIVE && { password })
      };

      await this.vendorRepository.update(vendor.id, updateData);

      //  Send Email to user

      const text = `Hello ${vendor.firstName}, your account has been verified and active now. Login with your registered email and password ${rawPassword} \n \n \n Kindly ensure you change your paassword on login`

      await this.mailingService.send({
        subject: 'Vendor Account Approved',
        html: text,
        email: vendor.email,

      })

      // TODO: Remove this before Production
      return text;

    } catch (error) {
      throw error;
    }
  }

  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const vendor = await this.vendorRepository.findOne({ where: { email } });
      if (!vendor) throw new NotFoundException('Vendor not found');

      const { token: verificationCode, expiresIn: verificationCodeExpiresIn } =
        this.helpers.generateVerificationCode();

      await this.vendorRepository.update(vendor.id, {
        verificationCode,
        verificationCodeExpiresIn,
      });

      // Send Email For Token
      try {
        await this.mailingService.send({
          subject: 'Email Verification',
          email: vendor.email,
          html: `  ${vendor.firstName} ${vendor.lastName}, Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(
            verificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });
      } catch (error) { }
    } catch (error) {
      throw error;
    }
  }

  
  async findAll(query: PaginateQuery): Promise<Paginated<Vendor>> {
    try {
      return paginate(query, this.vendorRepository, {
        sortableColumns: ['createdAt'],
        nullSort: 'last',
        defaultSortBy: [['createdAt', 'DESC']],
        // searchableColumns: ['name', 'color', 'age'],
        // select: ['id', 'name', 'color', 'age', 'lastVetVisit'],
        filterableColumns: {
          // name: [FilterOperator.EQ, FilterSuffix.NOT],
          // age: true,
          status: true
        },
      })

      // return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findVendorWithToken(id: string | any): Promise<Vendor> {
    const data = await this.vendorRepository.findOne({ where: { id } });

    return data;
  }

  async blockAndUnblockVendor(vendorId: string): Promise<string> {
    try {
      const vendor = await this.vendorRepository.findOne({
        where: {
          id: vendorId
        }
      });

      if (!vendor) throw new NotFoundException(`Vendor not found`);

      // Toggle the vendor's status
      vendor.status = vendor.status === BlockStatusEnums.BLOCKED ? BlockStatusEnums.ACTIVE : BlockStatusEnums.BLOCKED;
      await this.vendorRepository.save(vendor);

      return `Vendor ${vendor.status === BlockStatusEnums.BLOCKED ? 'blocked' : 'unblocked'} successfully`;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} vendor`;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto) {
    await this.vendorRepository.update(id, updateVendorDto);
  }

  remove(id: number) {
    return `This action removes a #${id} vendor`;
  }
}
