import { Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PaymentStatusEnum } from 'src/constants';
import { RedisService } from 'src/redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './schema/transaction.schema';

@Injectable()
export class TransactionService {
  cacheKey = 'all_transaction'
  cacheKeyPrefix = 'transactions:status:'

  constructor(
    
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private redisService: RedisService,

  ) { }

  // async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
  //   const transaction = this.transactionRepository.create(createTransactionDto);
  //   const savedTransaction = await this.transactionRepository.save(transaction);
  //   // Invalidate cache after a new transaction is created
  //   await this.cacheManager.del(this.cacheKey);

  //   return savedTransaction
  // }

  
  async findAll(): Promise<Transaction[]> {
    // Check if data is in cache
    const cacheData = await this.redisService.get({ key: this.cacheKey });
    if (Array.isArray(cacheData)) {
      console.log('Data loaded from cache');
      return cacheData;
    }
    // If not in cache, load data from the database
    const data = await this.transactionModel.find();
    console.log('Data loaded from database');

    // Store data in cache
    await this.redisService.set({ key: this.cacheKey, value: data, ttl: 3600 });

    return data;
  }


  async findByStatus(status: PaymentStatusEnum): Promise<Transaction[]> {
    // Generate cache key based on status
    const cacheKey = `${this.cacheKeyPrefix}${status}`;

    // Check if data is in cache
 
    const cachedData = await this.redisService.get({ key: this.cacheKey });
    if (Array.isArray(cachedData)) {
      console.log('Data loaded from cache');
      return cachedData;
    }

    // If not in cache, load data from the database
    const data = await this.transactionModel.find({ where: { status } });
    console.log('Data loaded from database');

    // Store data in cache
    await this.redisService.set({ key: this.cacheKey, value: data, ttl: 3600 });

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
