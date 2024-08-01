import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  ) { }
  async create(createCategoryDto: CreateCategoryDto   & { image: any }) {
    try {
      const category = await this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      console.log(error)
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
