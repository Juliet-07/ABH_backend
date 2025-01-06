import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtService } from '@nestjs/jwt';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { LoginVendorDto } from './dto/login-vendor.dto';
import { LoginResponse } from '../user/user.interface';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { BlockStatusEnums, VendorStatusEnums } from '../constants';
import { ManageVendorDto } from './dto/manage-vendor.dto';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/redis/redis.service';
import { AzureService } from 'src/utils/uploader/azure';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vendor } from './schema/vendor.schema';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDataType } from 'src/notification/dto/notification.dto';
import { VendorWelcomeOnboard } from 'src/template/welcome';

@Injectable()
export class VendorsService {
  cacheKey = 'all_vendor';

  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    private jwtService: JwtService,
    private helpers: HelpersService,
    private mailingService: MailingService,
    private redisService: RedisService,
    private readonly azureService: AzureService,
    private readonly notificationService: NotificationService,
  ) {}

  private decodeBase64ToBuffer(base64: string): Buffer {
    const base64Data = base64.replace(/^data:application\/pdf;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  async create(
    createVendorDto: CreateVendorDto,
    pdfFile?: Express.Multer.File,
  ): Promise<Vendor> {
    try {
      // Generate Vendor Unique Code
      const code = this.helpers.genCode(10);

      let cacCertificateUrl: string | undefined;

      if (pdfFile) {
        // Use pdfFile to get the buffer and other details
        const fileBuffer = Buffer.from(pdfFile.buffer); // Corrected
        cacCertificateUrl = await this.azureService.uploadDocumentToBlobStorage(
          fileBuffer,
          pdfFile.originalname,
          pdfFile.mimetype,
        );
      }

      // Create the vendor with or without the PDF URL
      const result = await this.vendorModel.create({
        ...createVendorDto,
        code,
        cacCertificateUrl,
      });

      delete result.password;

      return result;
    } catch (error) {
      console.error('the ERROR', error);
      throw new BadRequestException(error.message);
    }
  }

  async validateReferredBy(code: string): Promise<string> {
    // Get Valid Referrer.

    const referrer = await this.vendorModel.findOne({ code });

    if (!referrer) throw new Error('Invalid Referrer Code');

    return referrer.id;
  }

  async login(loginVendorDto: LoginVendorDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginVendorDto;

      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const vendor = await this.vendorModel
        .findOne({ email })
        .select('password status');

      if (!vendor) throw new NotFoundException('Vendor Not Found');
      if (!vendor.password)
        throw new BadRequestException(
          'Vendor password is not set or is missing.',
        );

      const isPasswordCorrect = await bcrypt.compare(password, vendor.password);

      if (!isPasswordCorrect)
        throw new UnauthorizedException('Incorrect Password');

      if (vendor.status !== VendorStatusEnums.ACTIVE)
        throw new ForbiddenException(`ACCOUNT ${vendor.status}`);

      const lastLoginAt = new Date().toISOString();
      await this.vendorModel.findOneAndUpdate(
        { _id: vendor.id },
        { $set: { lastLoginAt } },
      );

      const payload = { _id: vendor._id, email, lastLoginAt };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async requstVerification(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const vendor = await this.vendorModel.findOne({ email });
      if (!vendor) throw new NotFoundException('Vendor not found');
      if (vendor.verified)
        throw new BadRequestException('Vendor already verified');

      const { token: verificationCode, expiresIn: verificationCodeExpiresIn } =
        this.helpers.generateVerificationCode();

      await this.vendorModel.findOneAndUpdate(
        { _id: vendor.id },
        {
          $set: {
            verificationCode,
            verificationCodeExpiresIn,
          },
        },
      );

      // Send Email For Token
      try {
        await this.mailingService.send({
          subject: 'Email Verification',
          email: vendor.email,
          html: `name: ${vendor.firstName} ${
            vendor.lastName
          },Pls use the OTP code <b style="font-size: 20px;">${verificationCode}</b> for verification, code expires by ${new Date(
            verificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });
      } catch (error) {}
    } catch (error) {
      throw error;
    }
  }

  async verifyVendorAccount(verifyVendorDto: VerifyVendorDto): Promise<void> {
    try {
      const { code, email } = verifyVendorDto;

      const vendor = await this.vendorModel.findOne({
        email,
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

      await this.vendorModel.findOneAndUpdate({ _id: vendor.id }, updateData);
    } catch (error) {
      throw error;
    }
  }

  async manageVendorRegistration(
    manageVendorDto: ManageVendorDto,
    id: string,
  ): Promise<string> {
    try {
      const { status } = manageVendorDto;

      const vendor = await this.vendorModel.findOne({
        _id: id,
      });

      if (!vendor) throw new NotFoundException(`Vendor not found`);

      const rawPassword = this.helpers.generateDefaultPassword(20);

      const saltRounds = await bcrypt.genSalt(9);
      const password = await bcrypt.hash(rawPassword, saltRounds);

      // Update DB and set verification status
      const updateData = {
        status,
        ...(status === VendorStatusEnums.ACTIVE && { password }),
      };

      await this.vendorModel.findOneAndUpdate({ _id: vendor.id }, updateData);

      await this.mailingService.send({
        subject: 'Welcome Email',
        html: VendorWelcomeOnboard(vendor.firstName, rawPassword),
        email: vendor.email,
      });

      const data: CreateNotificationDataType = {
        message: 'Your account has been approved',
        receiverId: vendor.id,
      };

      await this.notificationService.createNotification(data);

      return 'Account Approved successfully';
    } catch (error) {
      throw error;
    }
  }

  async requestForgotPasswordVerificationCode(email: string): Promise<void> {
    try {
      if (!email) {
        throw new BadRequestException("Email can't be empty");
      }

      const vendor = await this.vendorModel.findOne({ email });
      if (!vendor) throw new NotFoundException('Vendor not found');

      const {
        token: forgotPasswordVerificationCode,
        expiresIn: forgotPasswordVerificationCodeExpiresIn,
      } = this.helpers.generateVerificationCode();

      await this.vendorModel.findOneAndUpdate(
        { _id: vendor.id },
        {
          $set: {
            forgotPasswordVerificationCode,
            forgotPasswordVerificationCodeExpiresIn,
          },
        },
      );

      // Send Email For Token
      try {
        await this.mailingService.send({
          subject: 'Email Verification',
          email: vendor.email,
          html: `  ${vendor.firstName} ${
            vendor.lastName
          }, Pls use the OTP code <b style="font-size: 20px;">${forgotPasswordVerificationCode}</b> for verification, code expires by ${new Date(
            forgotPasswordVerificationCodeExpiresIn,
          ).toLocaleDateString()}`,
        });
      } catch (error) {}
    } catch (error) {
      throw error;
    }
  }

  // async findAll(
  //   page = 1,
  //   limit = 10,
  //   filter?: { status?: VendorStatusEnums },
  // ): Promise<{ items: Vendor[]; total: number }> {
  //   try {
  //     // Ensure page and limit are numbers
  //     const currentPage = Number(page);
  //     const pageSize = Number(limit);

  //     // Validate page and limit
  //     if (currentPage < 1 || pageSize < 1) {
  //       throw new BadRequestException(
  //         'Page number and limit must be greater than zero',
  //       );
  //     }

  //     // Initialize the filter
  //     const query: {
  //       status?: VendorStatusEnums | { $in: VendorStatusEnums[] };
  //     } = {};

  //     // Apply the filter only if a specific status is provided
  //     if (filter?.status) {
  //       if (
  //         filter.status === VendorStatusEnums.ACTIVE ||
  //         filter.status === VendorStatusEnums.INACTIVE ||
  //         filter.status === VendorStatusEnums.PENDING
  //       ) {
  //         // Filter by a single status
  //         query.status = filter.status;
  //       } else {
  //         // If you want to filter by multiple statuses (e.g., ACTIVE and INACTIVE)
  //         query.status = {
  //           $in: [VendorStatusEnums.ACTIVE, VendorStatusEnums.INACTIVE],
  //         };
  //       }
  //     }

  //     // Fetch paginated items based on the query
  //     const [items, total] = await Promise.all([
  //       this.vendorModel
  //         .find(query) // Use the constructed query
  //         .skip((currentPage - 1) * pageSize)
  //         .limit(pageSize)
  //         .exec(),
  //       this.vendorModel.countDocuments(query).exec(),
  //     ]);

  //     return {
  //       items,
  //       total,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // REMOVING PAGINATION
  async findAll(
    filter?: { status?: VendorStatusEnums },
  ): Promise<{ items: Vendor[]; total: number }> {
    try {
      // Initialize the filter
      const query: {
        status?: VendorStatusEnums | { $in: VendorStatusEnums[] };
      } = {};
  
      // Apply the filter only if a specific status is provided
      if (filter?.status) {
        if (
          filter.status === VendorStatusEnums.ACTIVE ||
          filter.status === VendorStatusEnums.INACTIVE ||
          filter.status === VendorStatusEnums.PENDING
        ) {
          // Filter by a single status
          query.status = filter.status;
        } else {
          // If you want to filter by multiple statuses (e.g., ACTIVE and INACTIVE)
          query.status = {
            $in: [VendorStatusEnums.ACTIVE, VendorStatusEnums.INACTIVE],
          };
        }
      }
  
      // Fetch all items based on the query
      const [items, total] = await Promise.all([
        this.vendorModel.find(query).exec(),
        this.vendorModel.countDocuments(query).exec(),
      ]);
  
      return {
        items,
        total,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  async findVendorWithToken(id: string | any): Promise<Vendor> {
    const data = await this.vendorModel.findOne({ id });

    return data;
  }

  async blockAndUnblockVendor(vendorId: string): Promise<string> {
    try {
      // Find the vendor by ID
      const vendor = await this.vendorModel.findById(vendorId);

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }

      // Toggle the vendor's status
      const newStatus =
        vendor.status === BlockStatusEnums.INACTIVE
          ? BlockStatusEnums.ACTIVE
          : BlockStatusEnums.INACTIVE;

      // Update the vendor's status
      await this.vendorModel.findByIdAndUpdate(vendorId, { status: newStatus });

      return `Vendor ${
        newStatus === BlockStatusEnums.INACTIVE ? 'inactive' : 'active'
      } `;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listOneVendor(id: string) {
    try {
      const vendor = await this.vendorModel.findById(id);

      if (!vendor) throw new NotFoundException(`Vendor with ${id} not found`);

      return vendor;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(email: string, otp: string, newPassword: string) {
    try {
      const user = await this.vendorModel.findOne({ email: email });

      if (!user) throw new NotFoundException(`User not found`);

      if (user.forgotPasswordVerificationCode !== otp)
        throw new BadGatewayException(`Incorrect otp`);

      const checkExpiredOtp = await this.helpers.hasCodeExpired(
        user.forgotPasswordVerificationCodeExpiresIn,
      );

      if (checkExpiredOtp) throw new BadGatewayException(`OTP has expired`);

      const saltRounds = 8;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.vendorModel.findByIdAndUpdate(
        { _id: user._id },
        {
          $set: {
            forgotPasswordVerificationCode: null,
            forgotPasswordVerificationCodeExpiresIn: null,
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

  async uploadImage(vendorId: string, image: Express.Multer.File) {
    try {
      const user = await this.vendorModel.findOne({ _id: vendorId });

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

      await this.vendorModel.findByIdAndUpdate(
        { _id: user._id },
        { $set: { image: imageUrl } },
      );

      return `Profile photo updated successfully `;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(vendorId: string, updateVendorDto: UpdateVendorDto) {
    await this.vendorModel.findOneAndUpdate({ _id: vendorId }, updateVendorDto);

    const user = await this.vendorModel.findOne({ _id: vendorId });

    if (!user) throw new NotFoundException(`User not found`);

    await this.vendorModel.findOneAndUpdate({ _id: vendorId }, updateVendorDto);

    return `Profile Updated `;
  }

  remove(id: number) {
    return `This action removes a #${id} vendor`;
  }
}
