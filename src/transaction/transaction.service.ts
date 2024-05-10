import { Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TransactionService {
  cacheKey = 'all_transaction'

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    // private cacheManager: Cache,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create(createTransactionDto);
    const savedTransaction = await this.transactionRepository.save(transaction);
    // Invalidate cache after a new transaction is created
    await this.cacheManager.del(this.cacheKey);

    return savedTransaction
  }

  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<Transaction[]> {
    // Check if data is in cache
    const cacheData: Transaction[] = await this.cacheManager.get(this.cacheKey);
    if (cacheData) {
      console.log('Data loaded from cache');
      return cacheData;
    }

    // If not in cache, load data from the database
    const data = await this.transactionRepository.find();
    console.log('Data loaded from database');

    // Store data in cache
    await this.cacheManager.set(this.cacheKey, data);

    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
