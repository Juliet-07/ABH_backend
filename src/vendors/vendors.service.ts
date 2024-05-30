import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { LoginVendorDto } from './dto/login-vendor.dto';
import { LoginResponse } from '../user/user.interface';
import { Cache } from 'cache-manager';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { VendorStatusEnums } from '../constants';
import { ManageVendorDto } from './dto/manage-vendor.dto';

@Injectable()
export class VendorsService {
  cacheKey = 'all_vendor'

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    // private cacheManager: Cache,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingSerivce: MailingService
  ) { }

  async create(createVendorDto: CreateVendorDto): Promise<void> {
    try {

      const vendor = this.vendorRepository.create(createVendorDto);

      // Generate Vendor Unique Code
      vendor.code = this.helpers.genCode(10)

      await this.vendorRepository.save(vendor);

      // Invalidate cache after a new vendor is created
      await this.cacheManager.del(this.cacheKey);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<number> {
    // Get Valid Referrer.

    const referrer = await this.vendorRepository.findOne({ where: { code } });

    if (!referrer) throw new Error('Invalid Referrer Code')

    return referrer.id;
  }

  async login(loginVendorDto: LoginVendorDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginVendorDto;
      const vendor = await this.vendorRepository.findOne({
        where: {
          email
        }
      })
      if (!vendor) throw new NotFoundException('Vendor Not Found')
      const isPasswordCorrect = await vendor.comparePassword(password);
      if (!isPasswordCorrect) throw new UnauthorizedException('Incorrect Password')

      if (vendor.status !== VendorStatusEnums.ACTIVE) throw new ForbiddenException(`ACCOUNT ${vendor.status}`)

      const lastLoginAt = new Date().toISOString();
      await this.vendorRepository.update(vendor.id, {
        lastLoginAt
      })
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
      if (vendor.verified) throw new BadRequestException('Vendor already verified');

      const {
        token: verificationCode,
        expiresIn: verificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      await this.vendorRepository.update(vendor.id, {
        verificationCode,
        verificationCodeExpiresIn
      })

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: vendor.email,
          name: `${vendor.firstName} ${vendor.lastName}`,
          html: `Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(verificationCodeExpiresIn).toLocaleDateString()}`
        })
      } catch (error) {

      }

    } catch (error) {
      throw error
    }
  }

  async verifyVendorAccount(verifyVendorDto: VerifyVendorDto): Promise<void> {
    try {
      const { code, email } = verifyVendorDto;

      const vendor = await this.vendorRepository.findOne({
        where: {
          email
        }
      });

      if (!vendor) throw new NotFoundException(`Vendor with the email ${email} not found`)
      if (vendor.verified) throw new BadRequestException('Vendor already verified')
      if (vendor.verificationCode !== code) throw new BadRequestException('Invalid Code')

      // Verify Vendor Verification Code and Expiry Time
      const isExpired = this.helpers.hasCodeExpired(vendor.verificationCodeExpiresIn);

      if (isExpired) throw new BadRequestException('Expired Verification code, kindly request for a new one')

      // Update DB and set verification status
      const updateData = {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verificationCode: null,
        verificationCodeExpiresIn: null
      }

      await this.vendorRepository.update(vendor.id, updateData);

    } catch (error) {
      throw error
    }
  }

  async manageVendorRegistration(manageVendorDto: ManageVendorDto, id: string | any): Promise<void> {
    try {
      const { status } = manageVendorDto;

      const vendor = await this.vendorRepository.findOne({
        where: {
          id
        }
      });

      if (!vendor) throw new NotFoundException(`Vendor not found`)

      // Update DB and set verification status
      const updateData = {
        status
      }

      await this.vendorRepository.update(vendor.id, updateData);

    } catch (error) {
      throw error
    }
  }

  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const vendor = await this.vendorRepository.findOne({ where: { email } });
      if (!vendor) throw new NotFoundException('Vendor not found');

      const {
        token: verificationCode,
        expiresIn: verificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      await this.vendorRepository.update(vendor.id, {
        verificationCode,
        verificationCodeExpiresIn
      })

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: vendor.email,
          name: `${vendor.firstName} ${vendor.lastName}`,
          html: `Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(verificationCodeExpiresIn).toLocaleDateString()}`
        })
      } catch (error) {

      }

    } catch (error) {
      throw error
    }
  }

  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<Vendor[]> {
    try {
      const cacheData: Vendor[] = await this.cacheManager.get(this.cacheKey);
      if (cacheData) {
        console.log('Data loaded from cache');
        return cacheData;
      }

      const data = await this.vendorRepository.find();

      await this.cacheManager.set(this.cacheKey, data);

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findVendorWithToken(id: string | any): Promise<Vendor> {

    const data = await this.vendorRepository.findOne({ where: { id } });

    return data;
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
