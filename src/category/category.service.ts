import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { Subcategory } from './entities/subcategory.entity';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class CategoryService {
  cacheKey = 'all_category';
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createSubcategory(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: createSubcategoryDto.categoryId },
      });
      if (!category) throw new Error('Invalid category passed');
      const subcategory = await this.subcategoryRepository.create(
        createSubcategoryDto,
      );
      return await this.subcategoryRepository.save(subcategory);
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

  findAllSubcategory(query: PaginateQuery): Promise<Paginated<Subcategory>> {
    try {
      return paginate(query, this.subcategoryRepository, {
        sortableColumns: ['createdAt', 'name'],
        nullSort: 'last',
        defaultSortBy: [['createdAt', 'DESC']],
        filterableColumns: {
          name: true,
          id: true,
          categoryId: true,
        },
        relations: ['category'],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async findOneSubcategory(id: string) {
    return await this.subcategoryRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.categoryRepository.update(id, updateCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateSubcategory(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    try {
      await this.subcategoryRepository.update(id, updateSubcategoryDto);
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

  async removeSubcategory(id: string) {
    try {
      await this.subcategoryRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
