import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductsDto } from './dto/update-product.dto';
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
import { CreateMultipleWholeSaleProductsDto, CreateWholeSaleProductDto } from './dto/wholesale-product.dto';
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
    private vendorService: VendorsService
  ) { }



  async create(
    createProductDto: CreateProductDto,
    vendor: string,
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

      const vendorCheck = await this.vendorModel.findOne({ _id: vendor })

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `)

      // Generate unique code and slug
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;

      // Create a new product instance
      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendor: vendorCheck._id,
        createdBy: vendorCheck._id,
      });

      // Handle product images

      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(
          productImages.map(async (file, index) => {
            const fileBuffer = Buffer.from(file.buffer); // This line corrected
            const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(fileBuffer, file.originalname, file.mimetype);
            return {
              id: index + 1,
              url: uploadedImageUrl,
            };
          })
        );
        product.images = imageUrls;
      }

      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(fileBuffer, featuredImage.originalname, featuredImage.mimetype);
        product.featured_image = uploadedImageUrl;
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
    vendor: string,
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


      const vendorCheck = await this.vendorModel.findOne({ vendor })

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `)


      // Generate Admin Unique Code
      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;



      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendorId: vendorCheck.id,
        createdBy: vendorCheck.id,
      });



      if (productImages && productImages.length > 0) {
        const imageUrls = await Promise.all(
          productImages.map(async (file, index) => {
            const fileBuffer = Buffer.from(file.buffer); // This line corrected
            const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(fileBuffer, file.originalname, file.mimetype);
            return {
              id: index + 1,
              url: uploadedImageUrl,
            };
          })
        );
        product.images = imageUrls;
      }

      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(fileBuffer, featuredImage.originalname, featuredImage.mimetype);
        product.featured_image = uploadedImageUrl;
      }




      // Save the product
      const result = await product.save();

      return result;
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }
  }


  async createWholesaleProduct(payload: CreateWholeSaleProductDto, vendor: string,
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

      const vendorCheck = await this.vendorModel.findOne({ vendor })

      if (!vendorCheck) throw new NotFoundException(`Vendor not found `)


      const code = this.helpers.genCode(10);
      const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;


      const product = new this.productModel({
        ...productData,
        code,
        slug,
        vendor: vendorCheck.id,
        createdBy: vendorCheck.id,
      });



      if (productImages && productImages.length > 0) {
        // Prepare arrays for buffers, names, and MIME types
        const fileBuffers: Buffer[] = productImages.map(file => Buffer.from(file.buffer));
        const fileNames: string[] = productImages.map(file => file.originalname);
        const mimeTypes: string[] = productImages.map(file => file.mimetype);

        // Upload files to Azure Blob Storage
        const imageUrls = await this.azureService.uploadMultipleToBlobStorage(fileBuffers, fileNames, mimeTypes);

        // Map returned URLs to include an ID
        product.images = imageUrls.map((url, index) => ({
          id: index + 1,
          url,
        }));


      }

      // Handle featured image
      if (featuredImage) {
        const fileBuffer = Buffer.from(featuredImage.buffer); // This line corrected
        const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(fileBuffer, featuredImage.originalname, featuredImage.mimetype);
        product.featured_image = uploadedImageUrl;
      }

      const result = await product.save();

      return result;
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }

  }


  async addMultipleWholesaleProducts(createMultipleWholeSaleProductsDto: CreateMultipleWholeSaleProductsDto, vendor: string) {
    try {
      // Validation phase
      const { products } = createMultipleWholeSaleProductsDto;

      // Validate categories and vendors

      const vendorCheck = await this.vendorModel.findOne({ vendor });
      if (!vendorCheck) throw new NotFoundException(`Vendor not found`);





      // Create products
      const productDocs = products.map(productData => {
        const code = this.helpers.genCode(10);
        const slug = `${this.helpers.convertProductNameToSlug(productData.name)}-${code}`;

        const product = new this.productModel({
          ...productData,
          code,
          slug,
          createdBy: vendorCheck.id,
        });

        return product;
      });

      // **Image Uploads** (Replace with your image upload logic)
      // - Loop through productDocs
      // - For each product, upload its images (if any) to Azure Blob Storage
      // - Update the product document with image URLs

      const createdProducts = await this.productModel.insertMany(productDocs);
      return createdProducts;
    } catch (error) {
      throw new error; // Consider more specific error handling
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


      const vendor = await this.vendorService.listOneVendor(product.vendor)

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

  async updateVendorProduct(productId: string, vendor: string, payload: UpdateProductsDto) {
    try {
      const product = await this.productModel.findOne({ _id: productId, vendor: vendor })

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


  async removeForVendor(productId: string, vendor: string): Promise<string> {
    try {
      const product = await this.productModel.findOne({ _id: productId, vendor });

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

  async findAllForAdmin({
    status,
    limit = 10,
    page = 1,
  }: {
    status?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;


      const defaultStatus = "PENDING";

      // Build search criteria
      const searchCriteria: Record<string, any> = {};

      if (status) {
        searchCriteria.status = status.toUpperCase();
      } else {
        searchCriteria.status = defaultStatus;
      }

      console.log('Search criteria:', searchCriteria);

      const data = await this.productModel.find(searchCriteria)
        .select('-images -featured_image')
        .populate({
          path: 'vendor',
          select: ['-password', '-cacCertificateUrl']
        })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(pageSize)
        .exec();

      const totalCount = await this.productModel.countDocuments(searchCriteria);

      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      return result;
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



      const data = await this.productModel.find(filter)
        .select('-images -featured_image')
        .populate({
          path: 'vendor',
          select: ['-password', '-cacCertificateUrl']
        })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit);

      const totalCount = await this.productModel.countDocuments(filter);
      console.log(data.length)
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

  async listAllVendorProduct(vendor: string) {
    try {


      const products = await this.productModel.find({ vendor: vendor })

        .populate('categoryId')
        .populate('subcategoryId')


      return {
        totalCount: products.length,
        products,
      };
    } catch (error) {
      throw error
    }
  }



  //For USERS

  async getAllRetailProduct(page = 1, limit = 10) {
    try {

      page = Math.max(page, 1);
      limit = Math.max(limit, 1);

      // Calculate skip (offset) and limit
      const skip = (page - 1) * limit;


      const products = await this.productModel.find({
        status: 'APPROVED',
        productType: 'RETAIL'
      })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        status: 'APPROVED',
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

  async getOneRetailProduct(productId: string) {
    try {
      const product = await this.productModel.findOne({ _id: productId, productType: 'RETAIL' })

      if (!product) throw new NotFoundException(`Product not found`)

      return product
    } catch (error) {
      throw error
    }
  }



  async getAllWholeSaleProduct(page = 1, limit = 10) {
    try {


      page = Math.max(page, 1);
      limit = Math.max(limit, 1);


      const skip = (page - 1) * limit;



      const products = await this.productModel.find({
        status: 'APPROVED',
        productType: 'WHOLESALE'
      })

        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        status: 'APPROVED',
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

  async getOneWholesaleProduct(productId: string) {
    try {
      const product = await this.productModel.findOne({ _id: productId, productType: 'WHOLESALE' })

      if (!product) throw new NotFoundException(`Product not found`)

      return product
    } catch (error) {
      throw error
    }
  }

  async getAllSampleProduct(page = 1, limit = 10) {
    try {

      page = Math.max(page, 1);
      limit = Math.max(limit, 1);

      // Calculate skip (offset) and limit
      const skip = (page - 1) * limit;

      const products = await this.productModel.find({
        status: 'APPROVED',
        productType: 'SAMPLE_PRODUCT'
      })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCount = await this.productModel.countDocuments({
        status: 'APPROVED',
        productType: 'SAMPLE_PRODUCT'
      }).exec();


      return {

        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        products
      };
    } catch (error) {
      throw error
    }
  }


  async getOneSampleProduct(productId: string) {
    try {
      const product = await this.productModel.findOne({ _id: productId, productType: 'SAMPLE_PRODUCT' })

      if (!product) throw new NotFoundException(`Product not found`)

      return product
    } catch (error) {
      throw error
    }
  }


  async findAllForUser({
    filter = {},
    limit = 10,
    page = 1,
    search = {},
  }: {
    filter?: Record<string, any>;
    limit?: number;
    page?: number;
    search?: {
      categoryId?: string;
      subcategoryId?: string;
      sellingPrice?: number;
      name?: string;
    };
  }) {
    try {
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;

      // Build search criteria
      const searchCriteria: Record<string, any> = { ...filter };

      if (search.categoryId) {
        searchCriteria.categoryId = search.categoryId;
      }

      if (search.subcategoryId) {
        searchCriteria.subcategoryId = search.subcategoryId;
      }

      if (search.sellingPrice !== undefined) {
        searchCriteria.sellingPrice = search.sellingPrice;
      }

      if (search.name) {
        searchCriteria.name = { $regex: search.name, $options: 'i' };
      }

      const data = await this.productModel.find(searchCriteria)
        // .populate({
        //   path: 'vendor',
        //   select: ['-password'],
        // })
        .populate('categoryId')
        .populate('subcategoryId')
        .skip(skip)
        .limit(limit);

      const totalCount = await this.productModel.countDocuments(searchCriteria);

      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }



}
