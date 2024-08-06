import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginResponse } from './admin.interface';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { RedisService } from 'src/redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/admin/schema/admin.schema'
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  cacheKey = 'all_admin'

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingSerivce: MailingService,
    private redisService: RedisService,
  ) { }

  async create(createAdminDto: CreateAdminDto): Promise<string> {
    try {
      const { password } = createAdminDto;

      // Generate Admin Unique Code
      const code = this.helpers.genCode(10);

      const saltRounds = await bcrypt.genSalt(9);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create the admin object with the DTO and additional fields
      const newAdmin = new this.adminModel({
        ...createAdminDto,
        password: hashedPassword, // Use the hashed password
        code, // Add the generated code
      });

      // Save the new admin to the database
      await newAdmin.save();

      return 'Created Successfully';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<number> {
    // Get Valid Referrer.

    const referrer = await this.adminModel.findOne({ where: { code } });

    if (!referrer) throw new Error('Invalid Referrer Code')

    return referrer.id;
  }

  async login(loginAdminDto: LoginAdminDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginAdminDto;
      const admin = await this.adminModel.findOne({

        email

      })
      if (!admin) throw new NotFoundException('Admin Not Found')
      const isPasswordCorrect = await bcrypt.compare(password, admin.password);
      if (!isPasswordCorrect) throw new UnauthorizedException('Incorrect Password')

      // if (!admin.verified) throw new MisdirectedException('Pls verify your account')

      const lastLoginAt = new Date().toISOString();
      await this.adminModel.findByIdAndUpdate(admin.id, { lastLoginAt }).exec();
      const payload = { _id: admin._id, email, role: admin.role, lastLoginAt };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }

  }





  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      // Find the admin by email
      const admin = await this.adminModel.findOne({ email }).exec();
      if (!admin) throw new NotFoundException('Admin not found');

      // Generate the verification code and its expiration
      const {
        token: forgotPasswordVerificationCode,
        expiresIn: forgotPasswordVerificationCodeExpiresIn
      } = this.helpers.generateVerificationCode();

      // Update the admin document with the verification code and expiration
      await this.adminModel.findByIdAndUpdate(admin.id, {
        forgotPasswordVerificationCode,
        forgotPasswordVerificationCodeExpiresIn,
      }).exec();

      // Prepare and send the email with the verification code
      try {
        await this.mailingSerivce.send({
          subject: 'Password Reset Request',
          email: admin.email,
          html: `${admin.firstName} ${admin.lastName}, please use the OTP code <b style="font-size: 20px;">${forgotPasswordVerificationCode}</b> to reset your password. The code expires on ${new Date(forgotPasswordVerificationCodeExpiresIn).toLocaleString()}.`
        });
      } catch (mailError) {
        throw new InternalServerErrorException('Failed to send email');
      }

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  async findAll(): Promise<Admin[]> {
    try {
      const cacheData = await this.redisService.get({ key: this.cacheKey });
      if (Array.isArray(cacheData)) {
        console.log('Data loaded from cache');
        return cacheData;
      }

      const data = await this.adminModel.find();

      await this.redisService.set({ key: this.cacheKey, value: data, ttl: 3600 });

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAdminWithToken(id: string | any): Promise<Admin> {

    const data = await this.adminModel.findOne({ id });

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    try {
      // Validate id (if needed)
      if (!id) throw new BadRequestException('ID cannot be empty');

      // Perform the update operation
      const updatedAdmin = await this.adminModel.findByIdAndUpdate(
        id,
        { $set: updateAdminDto },
        { new: true, useFindAndModify: false } // Return the updated document and avoid deprecation warnings
      ).exec();

      // Check if the document was found and updated
      if (!updatedAdmin) throw new NotFoundException('Admin not found');

      return updatedAdmin;

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
