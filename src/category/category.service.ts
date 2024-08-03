import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { AzureService } from 'src/utils/uploader/azure';


@Injectable()
export class CategoryService {
  cacheKey = 'all_category';

  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly azureService: AzureService,

  ) { }
  async create(createCategoryDto: CreateCategoryDto, imageFile: Express.Multer.File): Promise<Category> {
    try {
      const { name, subcategories, description } = createCategoryDto;

      // Upload the image to Azure and get the URL
      const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(imageFile);
      // Convert the image buffer to a base64 string
      const base64Image = imageFile.buffer.toString('base64');

      const category = this.categoryRepository.create({
        name,
        subcategories,
        description,
        // Combine the URL and base64 string in the image field
        image: `data:${imageFile.mimetype};base64,${base64Image}`,
      });

      const result = await this.categoryRepository.save(category);

      return result;
    } catch (error) {
      this.logger.error('Unable to create category', error);
      throw new BadRequestException(error.message);
    }

  }



  findAll(query: PaginateQuery): Promise<Paginated<Category>> {
    try {
      return paginate(query, this.categoryRepository, {
        sortableColumns: ['createdAt', 'name'],
        nullSort: 'last',
        defaultSortBy: [['createdAt', 'DESC']],
        filterableColumns: {
          name: true,
          id: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }


  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.categoryRepository.update(id, updateCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



  async remove(id: string) {
    try {
      const result = await this.categoryRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException('Category not found');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


}
