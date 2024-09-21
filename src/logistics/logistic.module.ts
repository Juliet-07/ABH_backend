import { Module } from '@nestjs/common';
import { LogisticController } from './controler/logistic.controller';
import { LogisticService } from './service/logistic.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [LogisticController],
  providers: [LogisticService],
  exports: [LogisticService],
})
export class LogisticModule {}
