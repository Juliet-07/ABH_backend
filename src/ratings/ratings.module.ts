import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './schema/rating.schema';
import { ProductsModule } from 'src/products/products.module';
import { ProductSchema } from 'src/products/schema/product.schema';
import { UserSchema } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { MailingService } from 'src/utils/mailing/mailing.service';
import { AzureService } from 'src/utils/uploader/azure';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Rating', schema: RatingSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
    ]),
    ProductsModule,
  ],

  controllers: [RatingsController],
  providers: [
    RatingsService,
    UserService,
    HelpersService,
    MailingService,
    AzureService,
  ],
})
export class RatingsModule {}
