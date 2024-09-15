import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './user.interface';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { AzureService } from 'src/utils/uploader/azure';

@Injectable()
export class UserService {
  cacheKey = 'all_user';

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingSerivce: MailingService,
    private redisService: RedisService,
    private readonly azureService: AzureService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    try {
      const { referralCode, password, ...rest } = createUserDto;

      // Initialize a new User instance
      const user = new this.userModel({
        ...rest, // Spread the rest of the properties from createUserDto
      });

      if (referralCode) {
        const referredBy = await this.validateReferredBy(referralCode);
        user.referredBy = referredBy;
      }

      // Hash the password
      const saltRounds = 10; // Use a constant or configurable value for salt rounds
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;

      // Generate User Unique Code
      user.code = this.helpers.genCode(10);

      // Save the user to the database
      await user.save();

      // Optionally: Invalidate cache here if necessary
    } catch (error) {
      console.error('The ERROR', error);
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<string> {
    // Get Valid Referrer.
    const referrer = await this.userModel.findOne({ code });

    if (!referrer) throw new Error('Invalid Referrer Code');

    return referrer.id;
  }
  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginUserDto;
      const user = await this.userModel
        .findOne({
          email,
        })
        .select('password status');
      if (!user) throw new NotFoundException('User Not Found');
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect)
        throw new UnauthorizedException('Incorrect Password');

      // if (!user.verified) throw new MisdirectedException('Pls verify your account')

      const lastLoginAt = new Date().toISOString();
      await this.userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            lastLoginAt,
          },
        },
      );
      const payload = { _id: user._id, email, lastLoginAt };
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

      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException('User not found');
      if (user.verified) throw new BadRequestException('User already verified');

      const { token: verificationCode, expiresIn: verificationCodeExpiresIn } =
        this.helpers.generateVerificationCode();

      await this.userModel.findOneAndUpdate(
        { _id: user.id },
        {
          $set: {
            verificationCode,
            verificationCodeExpiresIn,
          },
        },
      );

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: user.email,
          html: `${user.firstName} ${
            user.lastName
          }, Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(
            verificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });
      } catch (error) {}
    } catch (error) {
      throw error;
    }
  }

  async verifyUserAccount(verifyUserDto: VerifyUserDto): Promise<void> {
    try {
      const { code, email } = verifyUserDto;

      const user = await this.userModel.findOne({
        email,
      });

      if (!user)
        throw new NotFoundException(`User with the email ${email} not found`);
      if (user.verified) throw new BadRequestException('User already verified');
      if (user.verificationCode !== code)
        throw new BadRequestException('Invalid Code');

      // Verify User Verification Code and Expiry Time
      const isExpired = this.helpers.hasCodeExpired(
        user.verificationCodeExpiresIn,
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

      await this.userModel.findOneAndUpdate({ _id: user.id }, updateData);
    } catch (error) {
      throw error;
    }
  }
  // getProfile
  async getProfile(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        _id: userId,
      });

      if (!user)
        throw new NotFoundException(`User with the email ${userId} not found`);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const users = await this.userModel.find();

    return users;
  }

  async requestForgotPasswordVerificationCode(email: string): Promise<string> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException('User not found');

      const { token: verificationCode, expiresIn: verificationCodeExpiresIn } =
        this.helpers.generateVerificationCode();

      const check = await this.userModel.findOneAndUpdate(
        { _id: user.id },
        {
          $set: {
            verificationCode,
            verificationCodeExpiresIn,
          },
        },
      );

      // Send Email For Token
      try {
        await this.mailingSerivce.send({
          subject: 'Email Verification',
          email: user.email,
          html: ` ${user.firstName} ${
            user.lastName
          }, Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(
            verificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });

        return ' Otp sent to your mail';
      } catch (error) {}
    } catch (error) {
      throw error;
    }
  }

  async changePassword(email: string, otp: string, newPassword: string) {
    try {
      const user = await this.userModel.findOne({ email: email });

      if (!user) throw new NotFoundException(`User not found`);

      if (user.verificationCode !== otp)
        throw new BadGatewayException(`Incorrect otp`);

      const checkExpiredOtp = await this.helpers.hasCodeExpired(
        user.verificationCodeExpiresIn,
      );

      if (checkExpiredOtp) throw new BadGatewayException(`OTP has expired`);

      const saltRounds = 8;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.userModel.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            verificationCode: null,
            verificationCodeExpiresIn: null,
            password: hashedPassword,
            lastPasswordResetAt: Date().toString(),
          },
        },
      );

      return `Password  reset was successful`;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async uploadImage(userId: string, image: Express.Multer.File) {
    try {
      const user = await this.userModel.findOne({ _id: userId });

      if (!user) throw new NotFoundException(`User not found`);

      let imageUrl: string | undefined;

      if (image) {
        // Use pdfFile to get the buffer and other details
        const fileBuffer = Buffer.from(image.buffer); // Corrected
        imageUrl = await this.azureService.uploadFileToBlobStorage(
          fileBuffer,
          image.originalname,
          image.mimetype,
        );
      }

      await this.userModel.findByIdAndUpdate(
        { _id: user._id },
        { $set: { image: imageUrl } },
      );

      return `Profile photo updated successfully `;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async findAll(): Promise<User[]> {
  //   try {
  //     const cacheData = await this.redisService.get({ key: this.cacheKey });
  //     if (Array.isArray(cacheData)) {
  //       console.log('Data loaded from cache');
  //       return cacheData;
  //     }

  //     const data = await this.userRepository.find();

  //     await this.redisService.set({ key: this.cacheKey, value: data, ttl: 3600 });

  //     return data;
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async findUserWithToken(id: string | any): Promise<User> {
    const data = await this.userModel.findOne({ where: { id } });

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user) throw new NotFoundException(`User not found`);

    await this.userModel.findOneAndUpdate({ _id: userId }, updateUserDto);

    return `Profile Updated `
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
