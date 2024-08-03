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
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ManageProductDto } from './dto/manage-product.dto';
import { CategoryService } from '../category/category.service';
import { id } from '../../node_modules/webpack/lib/optimize/ConcatenatedModule';
import { AzureService } from 'src/utils/uploader/azure';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoryService: CategoryService,
    private helpers: HelpersService,
    private readonly azureService: AzureService,
  ) { }



  async create(
    createProductDto: CreateProductDto,
    vendor: Partial<Vendor>,
    productImages: Express.Multer.File[], // Accepting multiple image files
    featuredImage?: Express.Multer.File, 
  ) {
    try {
      const { categoryId } = createProductDto
      const product = this.productRepository.create(createProductDto);

      // Validate category
      const category = await this.categoryService.findOne(
        categoryId,
      );

      if (!category.id) {
        throw new BadRequestException('Category ID is missing');
      }


      // Generate Admin Unique Code
      product.code = this.helpers.genCode(10);
      product.slug = `${this.helpers.convertProductNameToSlug(product.name)}-${product.code
        }`;
      product.vendorId = vendor.id;
      product.createdBy = vendor.id;


      // product.images = productImagesUrls.map((url, index) => ({
      //   id: index + 1,
      //   url: url,
      // }));
      // product.featured_image = featuredImageUrl;

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

      const result = await this.productRepository.save(product);

      return result;
    } catch (error) {
      console.error("THE ERROR", error)
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Product>> {
    try {
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

 async  findOneProduct(id: string) {
    try {
      const product = await this.productRepository.findOne({where: {
        id: id
      }})

      if(!product) throw new NotFoundException(`Product not found`)

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
      const product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!product) throw new NotFoundException(`Product not found`);

      await this.productRepository.remove(product);

      return `Product deleted Successfully`
    } catch (error) {
      throw error;
    }
  }
}
