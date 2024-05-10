import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        name: 'John Doe',
        email: 'john@example.com',
        item: 'Product A',
        price: 10.99,
      };
      const expectedTransaction: Transaction = { ...createTransactionDto, id: 1 };

      jest.spyOn(service, 'create').mockResolvedValue(expectedTransaction);

      const result = await controller.create(createTransactionDto);

      expect(result).toEqual(expectedTransaction);
      expect(service.create).toHaveBeenCalledWith(createTransactionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      const expectedTransactions: Transaction[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', item: 'Product A', price: 10.99 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', item: 'Product B', price: 19.99 },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedTransactions);

      const result = await controller.findAll();

      expect(result).toEqual(expectedTransactions);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
