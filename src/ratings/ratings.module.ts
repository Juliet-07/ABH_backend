import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './schema/rating.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Rating', schema: RatingSchema },]),],

  controllers: [RatingsController],
  providers: [RatingsService]
})
export class RatingsModule {}
