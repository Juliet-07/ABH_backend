import { BadRequestException, Inject, Injectable, MisdirectedException, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './user.interface';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { VerifyUserDto } from './dto/verify-user.dto';

@Injectable()
export class UserService {
  cacheKey = 'all_user'

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // private cacheManager: Cache,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingSerivce: MailingService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<void> {
    try {
      const { referralCode } = createUserDto;
      delete createUserDto.referralCode;

      const user = this.userRepository.create(createUserDto);

      let referredBy;

      if (referralCode) {
        referredBy = await this.validateReferredBy(referralCode);
        user.referredBy = referredBy;
      }

      // Generate User Unique Code
      user.code = this.helpers.genCode(10)

      await this.userRepository.save(user);

      // Invalidate cache after a new user is created
      await this.cacheManager.del(this.cacheKey);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<number> {
    // Get Valid Referrer.

    const referrer = await this.userRepository.findOne({ where: { code } });

    if (!referrer) throw new Error('Invalid Referrer Code')

    return referrer.id;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: {
          email
        }
      })
      if (!user) throw new NotFoundException('User Not Found')
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) throw new UnauthorizedException('Incorrect Password')

      if (!user.verified) throw new MisdirectedException('Pls verify your account')

      const lastLoginAt = new Date().toISOString();
      await this.userRepository.update(user.id, {
        lastLoginAt
      })
      const payload = { id: user.id, email, lastLoginAt };
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

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      if (user.verified) throw new BadRequestException('User already verified');

      const {
        token: verificationCode,
        expiresIn: verificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      await this.userRepository.update(user.id, {
        verificationCode,
        verificationCodeExpiresIn
      })

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          html: `Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(verificationCodeExpiresIn).toLocaleDateString()}`
        })
      } catch (error) {

      }

    } catch (error) {
      throw error
    }
  }

  async verifyUserAccount(verifyUserDto: VerifyUserDto): Promise<void> {
    try {
      const { code, email } = verifyUserDto;

      const user = await this.userRepository.findOne({
        where: {
          email
        }
      });

      if (!user) throw new NotFoundException(`User with the email ${email} not found`)
      if (user.verified) throw new BadRequestException('User already verified')
      if (user.verificationCode !== code) throw new BadRequestException('Invalid Code')

      // Verify User Verification Code and Expiry Time
      const isExpired = this.helpers.hasCodeExpired(user.verificationCodeExpiresIn);

      if (isExpired) throw new BadRequestException('Expired Verification code, kindly request for a new one')

      // Update DB and set verification status
      const updateData = {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verificationCode: null,
        verificationCodeExpiresIn: null
      }

      await this.userRepository.update(user.id, updateData);

    } catch (error) {
      throw error
    }
  }

  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new NotFoundException('User not found');

      const {
        token: verificationCode,
        expiresIn: verificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      await this.userRepository.update(user.id, {
        verificationCode,
        verificationCodeExpiresIn
      })

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          html: `Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(verificationCodeExpiresIn).toLocaleDateString()}`
        })
      } catch (error) {

      }

    } catch (error) {
      throw error
    }
  }

  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<User[]> {
    try {
      const cacheData: User[] = await this.cacheManager.get(this.cacheKey);
      if (cacheData) {
        console.log('Data loaded from cache');
        return cacheData;
      }

      const data = await this.userRepository.find();

      await this.cacheManager.set(this.cacheKey, data);

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findUserWithToken(id: string | any): Promise<User> {

    const data = await this.userRepository.findOne({ where: { id } });

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
