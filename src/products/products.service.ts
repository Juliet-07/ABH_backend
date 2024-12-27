import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, CreateProductsDto } from './dto/create-product.dto';
import { UpdateProductsDto } from './dto/update-product.dto';
import { HelpersService } from '../utils/helpers/helpers.service';
import { ManageProductDto } from './dto/manage-product.dto';
import { CategoryService } from '../category/category.service';
import { AzureService } from 'src/utils/uploader/azure';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from 'src/admin/schema/admin.schema';
import { Vendor } from 'src/vendors/schema/vendor.schema';
import { RedisService } from 'src/redis/redis.service';
import { Product } from './schema/product.schema';
import {
  CreateMultipleWholeSaleProductsDto,
  CreateWholeSaleProductDto,
} from './dto/wholesale-product.dto';
import { SampleProductDto } from './dto/sample-product.dto';
import { MailingService } from 'src/utils/mailing/mailing.service';
import { VendorsService } from 'src/vendors/vendors.service';

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
    private vendorService: VendorsService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    vendor: string,
    productImages: Express.Multer.File[],
    featuredImage: Express.Multer.File,
  ) {
    try {
      // Validate category
      const category = await this.categoryService.findOne(
        new mongoose.Types.ObjectId(createProductDto.categoryId),
      );
      if (!category) {
        throw new BadRequestException('Category not found');
      }

      const vendorCheck = await this.vendorModel.findOne({ _id: vendor });

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `);

      // Generate unique code and slug
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(
        createProductDto.name,
      )}-${code}`;

      // Create a new product instance
      const product = new this.productModel({
        ...createProductDto,
        code,
        slug,
        vendor: vendorCheck._id,
        createdBy: vendorCheck._id,
      });

      // Handle product images

      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(
          productImages.map(async (file, index) => {
            const fileBuffer = Buffer.from(file.buffer);
            const uploadedImageUrl =
              await this.azureService.uploadFileToBlobStorage(
                fileBuffer,
                file.originalname,
                file.mimetype,
              );
            return {
              id: index + 1,
              url: uploadedImageUrl,
            };
          }),
        );
        product.images = imageUrls;
      }

      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl =
          await this.azureService.uploadFileToBlobStorage(
            fileBuffer,
            featuredImage.originalname,
            featuredImage.mimetype,
          );
        product.featured_image = uploadedImageUrl;
      }

      // Save the product
      const result = await product.save();

      return {
        result,
        category,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new BadRequestException(error.message);
    }
  }

  async sampleProduct(
    payload: SampleProductDto,
    vendor: string,
    productImages: Express.Multer.File[],
    featuredImage: Express.Multer.File,
  ) {
    try {
      // Validate category
      const category = await this.categoryService.findOne(
        new mongoose.Types.ObjectId(payload.categoryId),
      );

      if (!category) {
        throw new BadRequestException('Category ID is missing');
      }

      const vendorCheck = await this.vendorModel.findOne({ _id: vendor });

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `);

      // Generate Admin Unique Code
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(
        payload.name,
      )}-${code}`;

      const product = new this.productModel({
        ...payload,
        code,
        slug,
        vendor: vendorCheck._id,
        createdBy: vendorCheck._id,
      });

      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(
          productImages.map(async (file, index) => {
            const fileBuffer = Buffer.from(file.buffer); // This line corrected
            const uploadedImageUrl =
              await this.azureService.uploadFileToBlobStorage(
                fileBuffer,
                file.originalname,
                file.mimetype,
              );
            return {
              id: index + 1,
              url: uploadedImageUrl,
            };
          }),
        );
        product.images = imageUrls;
      }

      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl =
          await this.azureService.uploadFileToBlobStorage(
            fileBuffer,
            featuredImage.originalname,
            featuredImage.mimetype,
          );
        product.featured_image = uploadedImageUrl;
      }

      // Save the product
      const result = await product.save();

      return {
        result,
        category,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async createWholesaleProduct(
    payload: CreateWholeSaleProductDto,
    vendor: string,
    productImages: Express.Multer.File[],
    featuredImage: Express.Multer.File,
  ) {
    try {
      // Validate category
      const category = await this.categoryService.findOne(
        new mongoose.Types.ObjectId(payload.categoryId),
      );

      if (!category) {
        throw new BadRequestException('Category ID is missing');
      }

      const vendorCheck = await this.vendorModel.findOne({ _id: vendor });

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `);

      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(
        payload.name,
      )}-${code}`;

      const currency = 'NGN';

      const product = new this.productModel({
        ...payload,
        code,
        slug,
        vendor: vendorCheck._id,
        createdBy: vendorCheck._id,
        currency,
      });

      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(
          productImages.map(async (file, index) => {
            const fileBuffer = Buffer.from(file.buffer);
            const uploadedImageUrl =
              await this.azureService.uploadFileToBlobStorage(
                fileBuffer,
                file.originalname,
                file.mimetype,
              );
            return {
              id: index + 1,
              url: uploadedImageUrl,
            };
          }),
        );
        product.images = imageUrls;
      }
      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl =
          await this.azureService.uploadFileToBlobStorage(
            fileBuffer,
            featuredImage.originalname,
            featuredImage.mimetype,
          );
        product.featured_image = uploadedImageUrl;
      }
      const result = await product.save();
      return {
        result,
        category,
      };
    } catch (error) {
      console.error('Error creating Wholesale product', error);
      throw new BadRequestException(error.message);
    }
  }

  async addMultipleWholesaleProducts(
    createMultipleWholeSaleProductsDto: CreateMultipleWholeSaleProductsDto,
    vendor: string,
    allProductImages: { [key: string]: Express.Multer.File[] },
    allFeaturedImages: { [key: string]: Express.Multer.File },
  ) {
    try {
      const { products } = createMultipleWholeSaleProductsDto;

      // Validate vendor
      const vendorCheck = await this.vendorModel.findOne({ _id: vendor });
      if (!vendorCheck) throw new NotFoundException(`Vendor not found`);

      // Process products with image handling
      const productDocs = await Promise.all(
        products.map(async (productData, index) => {
          const code = this.helpers.genCode(10);
          const slug = `${this.helpers.convertProductNameToSlug(
            productData.name,
          )}-${code}`;

          // Initialize the new product
          const product = new this.productModel({
            ...productData,
            code,
            slug,
            createdBy: vendorCheck._id,
          });

          // **Handle Product Images**
          const productImages = allProductImages[productData.name] || []; // Using the name as the key
          if (productImages.length > 0) {
            const imageUrls = await Promise.all(
              productImages.map(async (file, imageIndex) => {
                const fileBuffer = Buffer.from(file.buffer);
                const uploadedImageUrl =
                  await this.azureService.uploadFileToBlobStorage(
                    fileBuffer,
                    file.originalname,
                    file.mimetype,
                  );
                return {
                  id: imageIndex + 1,
                  url: uploadedImageUrl,
                };
              }),
            );
            product.images = imageUrls;
          }

          // **Handle Featured Image**
          const featuredImage = allFeaturedImages[productData.name]; // Using the name as the key
          if (featuredImage) {
            const fileBuffer = Buffer.from(featuredImage.buffer);
            const uploadedImageUrl =
              await this.azureService.uploadFileToBlobStorage(
                fileBuffer,
                featuredImage.originalname,
                featuredImage.mimetype,
              );
            product.featured_image = uploadedImageUrl;
          }

          return product;
        }),
      );

      // Save products to the database
      const createdProducts = await this.productModel.insertMany(productDocs);
      return createdProducts;
    } catch (error) {
      console.error('Error creating multiple wholesale products:', error);
      throw new BadRequestException(error.message);
    }
  }

  async createMultipleRetail(
    createProductsDto: CreateProductsDto,
    vendor: string,
    productImages: Express.Multer.File[], // Accepting multiple image files
    featuredImages: Express.Multer.File[], // Accepting multiple featured images
  ) {
    try {
      const vendorCheck = await this.vendorModel.findOne({ _id: vendor });
      if (!vendorCheck) throw new NotFoundException(`Vendor not found`);

      const products = [];

      for (let i = 0; i < createProductsDto.products.length; i++) {
        const createProductDto = createProductsDto.products[i];

        // Validate category
        const category = await this.categoryService.findOne(
          new mongoose.Types.ObjectId(createProductDto.categoryId),
        );
        if (!category) {
          throw new BadRequestException(
            `Category not found for product ${i + 1}`,
          );
        }

        // Generate unique code and slug
        const code = this.helpers.genCode(10);
        const slug = `${this.helpers.convertProductNameToSlug(
          createProductDto.name,
        )}-${code}`;

        // Create a new product instance
        const product = new this.productModel({
          ...createProductDto,
          code,
          slug,
          vendor: vendorCheck._id,
          createdBy: vendorCheck._id,
          subcategoryId: createProductDto.subcategoryId || undefined,
        });

        // Handle product images
        if (productImages && productImages.length > 0) {
          const imageUrls = await Promise.all(
            productImages.map(async (file, index) => {
              const fileBuffer = Buffer.from(file.buffer);
              const uploadedImageUrl =
                await this.azureService.uploadFileToBlobStorage(
                  fileBuffer,
                  file.originalname,
                  file.mimetype,
                );
              return {
                id: index + 1,
                url: uploadedImageUrl,
              };
            }),
          );
          product.images = imageUrls;
        }

        // Handle featured image
        if (featuredImages[i]) {
          // Ensure there's a corresponding featured image
          const fileBuffer = Buffer.from(featuredImages[i].buffer);
          const uploadedImageUrl =
            await this.azureService.uploadFileToBlobStorage(
              fileBuffer,
              featuredImages[i].originalname,
              featuredImages[i].mimetype,
            );
          product.featured_image = uploadedImageUrl;
        }

        // Save the product
        const result = await product.save();
        products.push(result);
      }

      return {
        products,
        vendor: vendorCheck,
      };
    } catch (error) {
      console.error('Error creating products:', error);
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
      const product = await this.productModel
        .findOne({ _id: id })
        .populate('vendor')
        .populate('categoryId');

      if (!product) throw new NotFoundException(`Product not found`);

      const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: id },
        manageProductDto,
        { new: true },
      );

      if (!updatedProduct) {
        throw new BadRequestException('Failed to update product');
      }

      const vendor = await this.vendorService.listOneVendor(product.vendor);

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
      const product = await this.productModel
        .findOne({
          id: id,
        })
        .populate('vendor')
        .populate('categoryId');

      if (!product) throw new NotFoundException(`Product not found`);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateVendorProduct(
    productId: string,
    vendor: string,
    payload: UpdateProductsDto,
  ) {
    try {
      const product = await this.productModel.findOne({
        _id: productId,
        vendor: vendor,
      });

      if (!product) throw new NotFoundException(`Product not found `);

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        productId,
        { $set: { ...payload, status: 'PENDING' } },
        { new: true },
      );

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async removeForVendor(productId: string, vendor: string): Promise<string> {
    try {
      const product = await this.productModel.findOne({
        _id: productId,
        vendor,
      });

      if (!product) {
        throw new NotFoundException(
          'Product not found or does not belong to this vendor',
        );
      }

      if (product.status === 'APPROVED') {
        throw new BadRequestException('Cannot delete an approved product');
      }

      await this.productModel.findByIdAndDelete(productId);

      return 'Product successfully deleted';
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }

  // async remove(productId: string): Promise<string> {
  //   try {
  //     const product = await this.productModel.findOne({
  //       _id: productId,
  //     });

  //     if (!product) throw new NotFoundException(`Product not found`);

  //     await this.productModel.findOneAndDelete({ product });

  //     return `Product deleted Successfully`;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async remove(productId: string): Promise<string> {
    try {
      const product = await this.productModel.findOne({ _id: productId });
  
      if (!product) {
        throw new NotFoundException(`Product not found`);
      }
  
      // Use the correct condition to delete the product
      await this.productModel.findOneAndDelete({ _id: productId });
  
      return `Product deleted successfully`;
    } catch (error) {
      throw error;
    }
  }
  

  async findAllForAdmin({ status }: { status?: string }) {
    try {
      const defaultStatus = 'PENDING';

      // Build search criteria
      const searchCriteria: Record<string, any> = {};

      if (status) {
        searchCriteria.status = status.toUpperCase();
      } else {
        searchCriteria.status = defaultStatus;
      }

      console.log('Search criteria:', searchCriteria);

      // Fetch all products matching the search criteria without pagination
      const data = await this.productModel
        .find(searchCriteria)
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .populate('categoryId')
        .populate('subcategoryId')
        .exec();

      return {
        data,
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
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

      const data = await this.productModel
        .find(filter)

        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit);

      const totalCount = await this.productModel.countDocuments(filter);
      console.log(data.length);
      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAllProductForAdmin() {
    try {
      const data = await this.productModel
        .find()
        .sort({ createdAt: -1 })

        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .populate('categoryId')
        .populate('subcategoryId');

      const result = {
        count: data.length,

        data,
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  async listAllVendorProduct(vendor: string) {
    try {
      const products = await this.productModel
        .find({ vendor: vendor })
        .sort({ createdAt: -1 })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .populate('categoryId')
        .populate('subcategoryId');

      return {
        totalCount: products.length,
        products,
      };
    } catch (error) {
      throw error;
    }
  }

  //For USERS

  async getAllRetailProduct() {
    try {
      const products = await this.productModel
        .find({
          status: 'APPROVED',
          productType: 'RETAIL',
        })

        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId')
        .populate('subcategoryId')
        .exec();

      // const totalCount = await this.productModel
      //   .countDocuments({
      //     status: 'APPROVED',
      //     productType: 'RETAIL',
      //   })
      //   .exec();

      return {
        products,
        totalCount: products.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOneRetailProduct(productId: string) {
    try {
      const product = await this.productModel
        .findOne({ _id: productId, productType: 'RETAIL' })

        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId');

      if (!product) throw new NotFoundException(`Product not found`);

      return product;
    } catch (error) {
      throw error;
    }
  }

  // async getAllWholeSaleProduct(page = 1, limit = 10) {
  //   try {
  //     page = Math.max(page, 1);
  //     limit = Math.max(limit, 1);

  //     const skip = (page - 1) * limit;

  //     const products = await this.productModel
  //       .find({
  //         status: 'APPROVED',
  //         productType: 'WHOLESALE',
  //       })
  //       .sort({ createdAt: -1 })
  //       .populate({
  //         path: 'vendor',
  //         select: ['-password'],
  //       })
  //       .populate('categoryId')
  //       .populate('subcategoryId')
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     const totalCount = await this.productModel
  //       .countDocuments({
  //         status: 'APPROVED',
  //         productType: 'WHOLESALE',
  //       })
  //       .exec();

  //     return {
  //       products,
  //       totalCount,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(totalCount / limit),
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // GET WHOLE PRODUCTS API WITHOUT PAGINATION
  async getAllWholeSaleProduct() {
    try {
      const products = await this.productModel
        .find({
          status: 'APPROVED',
          productType: 'WHOLESALE',
        })
        .sort({ createdAt: -1 })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .populate('categoryId')
        .populate('subcategoryId')
        .exec();

      return {
        products,
        totalCount: products.length, // Total number of products
      };
    } catch (error) {
      throw error;
    }
  }

  async getOneWholesaleProduct(productId: string) {
    try {
      const product = await this.productModel
        .findOne({ _id: productId, productType: 'WHOLESALE' })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId')
        .select('+unitPerCarton')
        // .populate('categoryId');

      if (!product) throw new NotFoundException(`Product not found`);

      console.log(product)

      return product;
    } catch (error) {
      throw error;
    }
  }

  async getAllSampleProduct(page = 1, limit = 10) {
    try {
      page = Math.max(page, 1);
      limit = Math.max(limit, 1);

      // Calculate skip (offset) and limit
      const skip = (page - 1) * limit;

      const products = await this.productModel
        .find({
          status: 'APPROVED',
          productType: 'SAMPLE_PRODUCT',
        })
        .sort({ createdAt: -1 })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })

        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel
        .countDocuments({
          status: 'APPROVED',
          productType: 'SAMPLE_PRODUCT',
        })
        .exec();

      return {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        products,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOneSampleProduct(productId: string) {
    try {
      const product = await this.productModel
        .findOne({ _id: productId, productType: 'SAMPLE_PRODUCT' })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId')
        .populate('categoryId');

      if (!product) throw new NotFoundException(`Product not found`);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async findAllForUser() {
    try {
      const data = await this.productModel
        .find({ status: 'APPROVED' })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId');

      const result = {
        count: data.length,
        data,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async listOne(productId: string) {
    try {
      const result = await this.productModel
        .findOne({ _id: productId, status: 'APPROVED' })
        .populate({
          path: 'vendor',
          select: ['-password'],
        })
        .sort({ createdAt: -1 })
        .populate('categoryId');

      return result;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductsByCategory(categoryId: string) {
    // Fetch products matching the category
    const products = await this.productModel
      .find({ categoryId: categoryId, status: 'APPROVED' })
      .sort({ createdAt: -1 })
      .exec();
    return {
      counts: products.length,
      products,
    };
  }
}
