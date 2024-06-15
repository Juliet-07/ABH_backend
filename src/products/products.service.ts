import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '../utils/helpers/helpers.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { FileUploadService } from '../services/file-upload/file-upload.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ManageProductDto } from './dto/manage-product.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoryService: CategoryService,
    private helpers: HelpersService,
    private uploadService: FileUploadService,
  ) {}

  uploadGalleryImages = async (
    files,
  ): Promise<{ id: number; url: string }[]> => {
    try {
      if (!files) throw new NotFoundException('No Files Found');

      const uploads = await Promise.all(
        files.map((file) => {
          return this.uploadService.uploadFile(file);
        }),
      );

      return uploads.map((upload, index) => {
        return {
          id: index + 1,
          url: upload.Location,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  async create(
    createProductDto: CreateProductDto,
    vendor: Partial<Vendor>,
    files: {
      product_images?: Express.Multer.File[];
      featured_image?: Express.Multer.File[];
    },
  ) {
    try {
      const product = this.productRepository.create(createProductDto);

      // Validate category
      const category = await this.categoryService.findOne(
        createProductDto.categoryId,
      );
      if (!category) throw new NotFoundException('Invalid Category');

      if (!files) throw new BadRequestException('Image Files are empty');

      if (!files?.product_images?.length) {
        throw new BadRequestException(
          'You need to upload product gallery images',
        );
      }

      // Upload profile images
      product.images = await this.uploadGalleryImages(files.product_images);

      if (!files?.featured_image?.length)
        throw new BadRequestException('Feature image is required');
      const uploadedFeaturedImage = await this.uploadService.uploadFile(
        files.featured_image[0],
      );
      if (uploadedFeaturedImage) {
        product.featured_image = uploadedFeaturedImage?.Location;
      }

      // Generate Admin Unique Code
      product.code = this.helpers.genCode(10);
      product.slug = `${this.helpers.convertProductNameToSlug(product.name)}-${
        product.code
      }`;
      product.vendorId = vendor.id;
      product.createdBy = vendor.id;

      const result = await this.productRepository.save(product);

      // Invalidate cache after a new admin is created
      // await this.cacheManager.del(this.cacheKey);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Product>> {
    try {
      const res =  await this.productRepository.find({relations: ['vendor', 'category']})
      console.log({res})
      return paginate(query, this.productRepository, {
        sortableColumns: ['createdAt', 'name'],
        nullSort: 'last',
        relations: ['vendor', 'category'],
        defaultSortBy: [['createdAt', 'DESC']],
        filterableColumns: {
          name: true,
          id: true,
          category: true,
          status: true,
          vendorId: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  fetchTopProducts() {
    return [];
  }

  async manageProductStatus(
    manageProductDto: ManageProductDto,
    id: string | any,
  ): Promise<string> {
    try {
      const { status } = manageProductDto;

      const product = await this.productRepository.findOne({
        where: {
          id,
        },
      });

      if (!product) throw new NotFoundException(`Product not found`);

      // Update DB and set verification status
      const updateData = {
        status,
      };

      await this.productRepository.update(product.id, updateData);

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

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
