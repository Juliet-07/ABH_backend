import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: Repository<Transaction>;
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<TransactionService>(TransactionService);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
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
      jest.spyOn(repository, 'create').mockReturnValue(expectedTransaction);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTransaction);
      jest.spyOn(cacheManager, 'del').mockResolvedValue();

      const result = await service.create(createTransactionDto);

      expect(result).toEqual(expectedTransaction);
      expect(repository.create).toHaveBeenCalledWith(createTransactionDto);
      expect(repository.save).toHaveBeenCalledWith(expectedTransaction);
      expect(cacheManager.del).toHaveBeenCalledWith(service.cacheKey);
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions from cache if available', async () => {
      const expectedTransactions: Transaction[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', item: 'Product A', price: 10.99 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', item: 'Product B', price: 19.99 },
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(expectedTransactions);

      const result = await service.findAll();

      expect(result).toEqual(expectedTransactions);
      expect(cacheManager.get).toHaveBeenCalledWith(service.cacheKey);
    });

    it('should return an array of transactions from the database if not available in cache', async () => {
      const expectedTransactions: Transaction[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', item: 'Product A', price: 10.99 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', item: 'Product B', price: 19.99 },
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'find').mockResolvedValue(expectedTransactions);
      jest.spyOn(cacheManager, 'set').mockResolvedValue();

      const result = await service.findAll();

      expect(result).toEqual(expectedTransactions);
      expect(cacheManager.get).toHaveBeenCalledWith(service.cacheKey);
      expect(repository.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(service.cacheKey, expectedTransactions);
    });
  });

});
