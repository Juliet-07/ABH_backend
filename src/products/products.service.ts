import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductsDto } from './dto/update-product.dto';
import { HelpersService } from '../utils/helpers/helpers.service';
import { ManageProductDto } from './dto/manage-product.dto';
import { CategoryService } from '../category/category.service';
import { AzureService } from 'src/utils/uploader/azure';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from 'src/admin/schema/admin.schema';
import { Vendor } from 'src/vendors/schema/vendor.schema';
import { RedisService } from 'src/redis/redis.service';
import { Product } from './schema/product.schema';
import { CreateWholeSaleProductDto } from './dto/wholesale-product.dto';
import { SampleProductDto } from './dto/sample-product.dto';
import { MailingService } from 'src/utils/mailing/mailing.service';
import { VendorsService } from 'src/vendors/vendors.service';
import { ProductStatusEnums } from 'src/constants';

@Injectable()
export class ProductsService {
  cacheKey: string;
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private categoryService: CategoryService,
    private helpers: HelpersService,
    private readonly azureService: AzureService,
    private readonly redisService: RedisService,
    private mailingService: MailingService,
    private vendorService: VendorsService
  ) { }



  async create(
    createProductDto: CreateProductDto,
    vendorId: string,
    productImages: Express.Multer.File[], // Accepting multiple image files
    featuredImage: Express.Multer.File,
  ): Promise<Product> {
    try {
      const { categoryId, ...productData } = createProductDto;

      // Validate category
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new BadRequestException('Category not found');
      }

      const vendor = await this.vendorModel.findOne({ _id: vendorId })

      if (!vendor) throw new NotFoundException(`Vendor not found `)

      // Generate unique code and slug
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;

      // Create a new product instance
      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendorId: vendor._id,
        createdBy: vendor._id,
      });

      // Handle product images
      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(productImages.map(async (file, index) => {
          const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(file);
          const base64Image = file.buffer.toString('base64');
          return {
            id: index + 1, // Ensure this is a number if required by your model
            url: `data:${file.mimetype};base64,${base64Image}`, // Store base64 image
          };
        }));
        product.images = imageUrls;
      }

      // Handle featured image
      if (featuredImage) {
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(featuredImage);
        const base64Image = featuredImage.buffer.toString('base64');
        product.featured_image = `data:${featuredImage.mimetype};base64,${base64Image}`;
      }

      // Save the product
      const result = await product.save();

      return result;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new BadRequestException(error.message);
    }
  }




  async sampleProduct(
    payload: SampleProductDto,
    vendorId: string,
    productImages: Express.Multer.File[],
    featuredImage: Express.Multer.File,
  ): Promise<Product> {
    try {
      const { categoryId, ...productData } = payload


      // Validate category
      const category = await this.categoryService.findOne(
        categoryId,
      );

      if (!category) {
        throw new BadRequestException('Category ID is missing');
      }


      const vendor = await this.vendorModel.findOne({ vendorId })

      if (!vendor) throw new NotFoundException(`Vendor not found `)


      // Generate Admin Unique Code
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;



      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendorId: vendor.id,
        createdBy: vendor.id,
      });



      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(productImages.map(async (file, index) => {
          const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(file);
          const base64Image = file.buffer.toString('base64');
          return {
            id: index + 1, // Ensure this is a number if required by your model
            url: `data:${file.mimetype};base64,${base64Image}`,  // Store base64 image
          };
        }));
        product.images = imageUrls;
      }

      if (featuredImage) {
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(featuredImage);
        const base64Image = featuredImage.buffer.toString('base64');
        product.featured_image = `data:${featuredImage.mimetype};base64,${base64Image}`;
      }




      // Save the product
      const result = await product.save();

      return result;
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }
  }


  async createWholesaleProduct(payload: CreateWholeSaleProductDto, vendorId: string,
    productImages: Express.Multer.File[],
    featuredImage: Express.Multer.File,): Promise<Product> {


    try {
      const { categoryId, ...productData } = payload



      // Validate category
      const category = await this.categoryService.findOne(
        categoryId,
      );

      if (!category) {
        throw new BadRequestException('Category ID is missing');
      }

      const vendor = await this.vendorModel.findOne({ vendorId })

      if (!vendor) throw new NotFoundException(`Vendor not found `)


      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;


      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendorId: vendor.id,
        createdBy: vendor.id,
      });



      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(productImages.map(async (file, index) => {
          const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(file);
          const base64Image = file.buffer.toString('base64');
          return {
            id: index + 1, // Ensure this is a number if required by your model
            url: `data:${file.mimetype};base64,${base64Image}`,  // Store base64 image
          };
        }));
        product.images = imageUrls;
      }

      if (featuredImage) {
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(featuredImage);
        const base64Image = featuredImage.buffer.toString('base64');
        product.featured_image = `data:${featuredImage.mimetype};base64,${base64Image}`;
      }

      const result = await product.save();

      return result;
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }

  }


  fetchTopProducts() {
    return [];
  }



  async manageProductStatus(
    manageProductDto: ManageProductDto,
    id: string,
  ): Promise<string> {
    try {
      const product = await this.productModel.findOne({ _id: id }).populate('vendor');

      if (!product) throw new NotFoundException(`Product not found`);

      const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: id },
        manageProductDto,
        { new: true }
      );

      if (!updatedProduct) {
        throw new BadRequestException('Failed to update product');
      }


      const vendor = await this.vendorService.listOneVendor(product.vendorId)

      // Prepare email content based on status
      let emailSubject = '';
      let emailText = '';

      switch (manageProductDto.status) {
        case 'APPROVED':
          emailSubject = 'Product Approved';
          emailText = `Hello ${vendor.firstName},\n\nYour product "${product.name}" has been approved and is now active on our platform.`;
          break;
        case 'DECLINED':
          emailSubject = 'Product Declined';
          emailText = `Hello ${vendor.firstName},\n\nWe regret to inform you that your product "${product.name}" has been declined.\n\nReason: ${manageProductDto.comments}\n\nPlease review our guidelines and make necessary adjustments before resubmitting.`;
          break;
        // Add more cases as needed for other statuses
      }

      // Send email if subject and text are set
      if (emailSubject && emailText) {
        await this.mailingService.send({
          subject: emailSubject,
          html: emailText,
          email: vendor.email,

        });
      }

      return `Product status updated to ${manageProductDto.status}`;
    } catch (error) {
      throw error;
    }
  }



  async findOneProduct(id: string) {
    try {
      const product = await this.productModel.findOne({

        id: id

      })

      if (!product) throw new NotFoundException(`Product not found`)

      return product
    } catch (error) {
      throw error;
    }
  }

  async updateVendorProduct(productId: string, vendorId: string, payload: UpdateProductsDto) {
    try {
      const product = await this.productModel.findOne({ _id: productId, vendorId: vendorId })

      if (!product) throw new NotFoundException(`Product not found `)

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        productId,
        { $set: { ...payload, status: 'PENDING' } },
        { new: true }
      );

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }


  async removeForVendor(productId: string, vendorId: string): Promise<string> {
    try {
      const product = await this.productModel.findOne({ _id: productId, vendorId });

      if (!product) {
        throw new NotFoundException('Product not found or does not belong to this vendor');
      }

      if (product.status === 'APPROVED') {
        throw new BadRequestException('Cannot delete an approved product');
      }


      await this.productModel.findByIdAndDelete(productId);

      return 'Product successfully deleted';
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }



  async remove(productId: string): Promise<string> {
    try {
      const product = await this.productModel.findOne({

        _id: productId,

      });

      if (!product) throw new NotFoundException(`Product not found`);

      await this.productModel.findOneAndDelete({ product });

      return `Product deleted Successfully`
    } catch (error) {
      throw error;
    }
  }



  async findAll({
    filter = {},
    limit = 10,
    page = 1,
  }: {
    filter?: Record<string, any>;
    limit?: number;
    page?: number;
  }) {
    try {
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;

      const cacheKey = `products:key`;

      // Check cache first
      const cachedData = await this.redisService.get({ key: cacheKey });
      if (cachedData) {
        return cachedData;
      }

      const data = await this.productModel.find({})

        .populate('categoryId')
        .populate('subcategoryId')
        .populate('vendorId')
        .skip(skip)
        .limit(limit);

      const totalCount = await this.productModel.countDocuments();

      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      await this.redisService.set({ key: cacheKey, value: result, ttl: 60 * 60 });

      return result;
    } catch (error) {
      throw error;
    }
  }


  async getAllRetailProduct(vendorId: string, page = 1, limit = 10) {
    try {

      page = Math.max(page, 1);
      limit = Math.max(limit, 1);

      // Calculate skip (offset) and limit
      const skip = (page - 1) * limit;


      const products = await this.productModel.find({
        vendorId: vendorId,
        productType: 'RETAIL'
      })
        .populate('categoryId')
        .populate('subcategoryId')
        .populate('vendorId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        vendorId: vendorId,
        productType: 'RETAIL'
      }).exec();



      return {
        products,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw error
    }
  }



  async getAllWholeSaleProduct(vendorId: string, page = 1, limit = 10) {
    try {


      page = Math.max(page, 1);
      limit = Math.max(limit, 1);


      const skip = (page - 1) * limit;



      const products = await this.productModel.find({
        vendorId: vendorId,
        productType: 'WHOLESALE'
      })

        .populate('categoryId')
        .populate('subcategoryId')
        .populate('vendorId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        vendorId: vendorId,
        productType: 'WHOLESALE'
      }).exec();


      return {
        products,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw error
    }
  }

  async getAllSampleProduct(vendorId: string, page = 1, limit = 10) {
    try {

      page = Math.max(page, 1);
      limit = Math.max(limit, 1);

      // Calculate skip (offset) and limit
      const skip = (page - 1) * limit;

      const products = await this.productModel.find({
        vendorId: vendorId,
        productType: 'SAMPLE_PRODUCT'
      })
        .populate('categoryId')
        .populate('subcategoryId')
        .populate('vendorId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        vendorId: vendorId,
        productType: 'SAMPLE_PRODUCT'
      }).exec();


      return {
        products,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw error
    }
  }


}
