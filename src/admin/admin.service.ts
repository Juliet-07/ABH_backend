import { BadRequestException, Inject, Injectable, MisdirectedException, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginResponse } from './admin.interface';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { VerifyAdminDto } from './dto/verify-admin.dto';

@Injectable()
export class AdminService {
  cacheKey = 'all_admin'

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    // private cacheManager: Cache,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingSerivce: MailingService
  ) { }

  async create(createAdminDto: CreateAdminDto): Promise<void> {
    try {
      const admin = this.adminRepository.create(createAdminDto);

      // Generate Admin Unique Code
      admin.code = this.helpers.genCode(10)

      await this.adminRepository.save(admin);

      // Invalidate cache after a new admin is created
      await this.cacheManager.del(this.cacheKey);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<number> {
    // Get Valid Referrer.

    const referrer = await this.adminRepository.findOne({ where: { code } });

    if (!referrer) throw new Error('Invalid Referrer Code')

    return referrer.id;
  }

  async login(loginAdminDto: LoginAdminDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginAdminDto;
      const admin = await this.adminRepository.findOne({
        where: {
          email
        }
      })
      if (!admin) throw new NotFoundException('Admin Not Found')
      const isPasswordCorrect = await admin.comparePassword(password);
      if (!isPasswordCorrect) throw new UnauthorizedException('Incorrect Password')

      // if (!admin.verified) throw new MisdirectedException('Pls verify your account')

      const lastLoginAt = new Date().toISOString();
      await this.adminRepository.update(admin.id, {
        lastLoginAt
      })
      const payload = { id: admin.id, email, lastLoginAt };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }

  }

  

  

  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const admin = await this.adminRepository.findOne({ where: { email } });
      if (!admin) throw new NotFoundException('Admin not found');

      const {
        token: forgotPasswordVerificationCode,
        expiresIn: forgotPasswordVerificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      await this.adminRepository.update(admin.id, {
        forgotPasswordVerificationCode,
        forgotPasswordVerificationCodeExpiresIn
      })

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`,
          html: `Pls use the OTP code <b style="font-size: 20px;">${forgotPasswordVerificationCode}</b> for verification, code expires by ${new Date(forgotPasswordVerificationCodeExpiresIn).toLocaleDateString()}`
        })
      } catch (error) {

      }

    } catch (error) {
      throw error
    }
  }

  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<Admin[]> {
    try {
      const cacheData: Admin[] = await this.cacheManager.get(this.cacheKey);
      if (cacheData) {
        console.log('Data loaded from cache');
        return cacheData;
      }

      const data = await this.adminRepository.find();

      await this.cacheManager.set(this.cacheKey, data);

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAdminWithToken(id: string | any): Promise<Admin> {

    const data = await this.adminRepository.findOne({ where: { id } });

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    await this.adminRepository.update(id, updateAdminDto);
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}