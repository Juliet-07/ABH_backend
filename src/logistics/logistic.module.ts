import { Module } from '@nestjs/common';
import { LogisticController } from './controler/logistic.controller';
import { LogisticService } from './service/logistic.service';

@Module({
  controllers: [LogisticController],
  providers: [LogisticService],
  exports: [LogisticService],
})
export class LogisticModule {}
