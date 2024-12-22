import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AzureService } from 'src/utils/uploader/azure';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Category } from './schema/category.schema';

@Injectable()
export class CategoryService {
  cacheKey = 'all_category';

  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly azureService: AzureService,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    imageFile: Express.Multer.File,
  ): Promise<Category> {
    try {
      const { name, subcategories, description } = createCategoryDto;

      // Upload the image to Azure and get the URL
      const fileBuffer = Buffer.from(imageFile.buffer); // This line corrected
      const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(
        fileBuffer,
        imageFile.originalname,
        imageFile.mimetype,
      );

      const category = {
        name,
        subcategories,
        description,
        // Combine the URL and base64 string in the image field
        image: uploadedImageUrl,
      };

      const result = await this.categoryModel.create(category);

      return result;
    } catch (error) {
      this.logger.error('Unable to create category', error);
      throw new BadRequestException(error.message);
    }
  }

  // async findAll(page = 1, limit = 10): Promise<{ items: Category[], total: number }> {
  //   try {
  //     // Ensure page and limit are numbers
  //     const currentPage = Number(page);
  //     const pageSize = Number(limit);

  //     // Validate page and limit
  //     if (currentPage < 1 || pageSize < 1) {
  //       throw new BadRequestException('Page number and limit must be greater than zero');
  //     }

  //     // Fetch paginated items
  //     const [items, total] = await Promise.all([
  //       this.categoryModel.find()
  //         .skip((currentPage - 1) * pageSize)
  //         .limit(pageSize)
  //         .exec(),
  //       this.categoryModel.countDocuments().exec(),
  //     ]);

  //     return {
  //       items,
  //       total,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // REMOVED PAGINATION
  async findAll(): Promise<{ items: Category[]; total: number }> {
    try {
      // Fetch all items and their total count
      const [items, total] = await Promise.all([
        this.categoryModel.find().exec(),
        this.categoryModel.countDocuments().exec(),
      ]);

      return {
        items,
        total,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: mongoose.Types.ObjectId) {
    const category = await this.categoryModel.findOne({ _id: id });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async findOneSubcategory(subcategoryId: mongoose.Types.ObjectId) {
    const category = await this.categoryModel.findOne({ _id: subcategoryId });
    if (!category) {
      throw new NotFoundException(
        `Category with id ${subcategoryId} not found`,
      );
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.categoryModel.findOneAndUpdate({ _id: id }, updateCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.categoryModel.findOneAndDelete({ _id: id });
      if (!result) {
        throw new BadRequestException('Category not found');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
