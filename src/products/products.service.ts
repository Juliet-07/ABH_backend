import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
    private readonly redisService: RedisService
  ) { }



  async create(
    createProductDto: CreateProductDto,
    vendorId: string,
    productImages: Express.Multer.File[], // Accepting multiple image files
    featuredImage?: Express.Multer.File,
  ): Promise<Product> {
    try {
      const { categoryId, ...productData } = createProductDto;

      // Validate category
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new BadRequestException('Category not found');
      }

      const vendor = await this.vendorModel.findOne({ _id:vendorId })

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
        product.featuredImage = `data:${featuredImage.mimetype};base64,${base64Image}`;
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
    productImages: Express.Multer.File[], // Accepting multiple image files
    featuredImage?: Express.Multer.File,
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
        product.featuredImage = `data:${featuredImage.mimetype};base64,${base64Image}`;
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
    featuredImage?: Express.Multer.File,): Promise<Product> {


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
        product.featuredImage = `data:${featuredImage.mimetype};base64,${base64Image}`;
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
      

      const product = await this.productModel.findOne({_id: id });

      if (!product) throw new NotFoundException(`Product not found`);

         
      const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: id },
        manageProductDto,
        { new: true } // Return the updated document
      );
  
      // Log the sellingPrice or the entire product object
      console.log('Updated Product:', updatedProduct);
      console.log('Selling Price:', updatedProduct?.sellingPrice);

      //  Send Email to user

      // const text = `Hello ${vendor.firstName}, your account has been verified and active now. Login with your registered email and password ${rawPassword} \n \n \n Kindly ensure you change your paassword on login`

      // await this.mailingSerivce.send({
      //   subject: 'Vendor Account Approved',
      //   text,
      //   email: vendor.email,
      //   name: `${vendor.firstName} ${vendor.lastName}`
      // })

      // TODO: Remove this before Production
      return null;
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

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
    filter?: Record<string, any>,
    limit?: number,
    page?: number,
  }): Promise<Product[]> {
    try {
      // Validate and ensure pagination values are positive integers
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;

      // Check cache first
      const data = await this.productModel.find({});

      return data;


    } catch (error) {
      throw error;

    }

  }
}
