import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    const userId = req.user;

    return this.ratingsService.create({ ...createRatingDto, userId });
  }

  @Get(':productId')
  getAllRatingsForOneProduct(@Param('productId') productId: string) {
    return this.ratingsService.getAllRatingsForOneProduct(productId);
  }

  @Get('average/:productId')
  getAverageRating(@Param('productId') productId: string) {
    return this.ratingsService.getAverageRating(productId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    const userId = req.user;

    return this.ratingsService.update(id, userId, updateRatingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user;
    return this.ratingsService.remove(id, userId);
  }
}
