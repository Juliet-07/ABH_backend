import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';


@Injectable()
export class CategoryService {
  cacheKey = 'all_category';

  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

  ) { }
  async create(createCategoryDto: CreateCategoryDto) {
    try {

      const { name, subcategories, description } = createCategoryDto;

      const category = this.categoryRepository.create({
        name,
        subcategories,
        description,

      });
      // const category = this.categoryRepository.create(createCategoryDto);
      const result = await this.categoryRepository.save(category);

      return result
    } catch (error) {
      console.log(error)
      this.logger.error('Unable to create  category', error)
      throw new BadRequestException(error.message);


    }
  }


  async uploadImage(categoryId: string, image: string) {
    try {
      // Check if the category exists
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
  
      if (!category) {
        throw new NotFoundException('Category not found');
      }
  
      // Update the image field
      await this.categoryRepository.update(categoryId, { image });
  
      // Fetch the updated category (optional)
      const updatedCategory = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
  
      return updatedCategory;
    } catch (error) {
      this.logger.error('Unable to update category image', error);
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
