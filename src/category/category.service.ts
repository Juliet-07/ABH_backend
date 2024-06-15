import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class CategoryService {
  cacheKey = 'all_category';
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
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

  async findOne(id: string) {
    return await this.categoryRepository.findOne({ where: { id } });
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
      await this.categoryRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
