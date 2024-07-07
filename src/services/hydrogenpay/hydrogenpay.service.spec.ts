import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenpayService } from './hydrogenpay.service';

describe('HydrogenpayService', () => {
  let service: HydrogenpayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HydrogenpayService],
    }).compile();

    service = module.get<HydrogenpayService>(HydrogenpayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
