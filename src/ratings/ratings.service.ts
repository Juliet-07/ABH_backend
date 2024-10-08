import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Rating } from './schema/rating.schema';
import { Product } from 'src/products/schema/product.schema';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<Rating>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createRatingDto: CreateRatingDto) {
    try {
      const { userId, productId, rating, comment } = createRatingDto;

      const existingRating = await this.ratingModel.findOne({
        userId,
        productId,
      });

      if (existingRating)
        throw new ConflictException(` Already Submitted a Rating`);

      const checkProduct = await this.productModel.findById(productId);

      if (!checkProduct) throw new NotFoundException(`Product not found`);

      const data = await this.ratingModel.create({
        userId,
        productId,
        rating: rating,
        comment: comment || null,
      });

      return data;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getAllRatingsForOneProduct(productId: string) {
    try {
      const result = await this.ratingModel.find({ productId });

      return result || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Calculate the average rating
  async getAverageRating(productId: string): Promise<number> {
    const ratings = await this.ratingModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
    ]);

    return ratings.length ? ratings[0].avgRating : 0;
  }

  async update(id: string, userId: string, payload: UpdateRatingDto) {
    try {
      const checkRating = await this.ratingModel.findOne({
        _id: id,
        userId: userId,
      });

      if (!checkRating)
        throw new BadRequestException(
          `Rating not found or you do not have permission to update it.`,
        );
      const result = await this.ratingModel.findOneAndUpdate(
        { _id: checkRating.id },
        { $set: { rating: payload.rating, comment: payload.comment } },
        { new: true, runValidators: true },
      );

      return result;
    } catch (error) {
      console.error('Error updating rating:', error);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      const data = await this.ratingModel.findOne({ _id: id, userId: userId });

      if (!data) {
        throw new NotFoundException(`Rating not found`);
      }

      await this.ratingModel.findOneAndDelete({
        _id: data.id,
      });

      return 'Rating deleted successfully';
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error deleting rating:', error);
      throw new BadRequestException(error.message);
    }
  }
}
