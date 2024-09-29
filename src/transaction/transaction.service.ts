import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PaymentStatusEnum } from 'src/constants';
import { RedisService } from 'src/redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './schema/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private redisService: RedisService,
  ) {}

  async listAllTrx() {
    try {
      const data = await this.transactionModel.find();

      return data || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listOneTrx(transactionId: string) {
    try {
      const data = await this.transactionModel.findOne({ _id: transactionId });

      return data || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listAllUserTrx(userId: string) {
    try {
      const trx = await this.transactionModel.find({ userId });

      return trx || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listAllOneUserTrx(transactionId: string, userId: string) {
    try {
      const trx = await this.transactionModel.find({
        _id: transactionId,
        userId,
      });

      return trx || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
