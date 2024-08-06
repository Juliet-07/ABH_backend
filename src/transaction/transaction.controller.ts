import { Controller, Get, UsePipes, ValidationPipe, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentStatusEnum } from 'src/constants';
import { AdminAuthGuard } from 'src/auth/admin-auth/admin-auth.guard';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  // @Post()
  // @UsePipes(new ValidationPipe())
  // create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
  //   return this.transactionService.create(createTransactionDto);
  // }

  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @Get()
  findAll() {
    return this.transactionService.findAll();
  }


  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @Get('status')
  async getByStatus(
    @Query('status') status: PaymentStatusEnum,
  ){
    // Validate status (Optional: ensure the status is a valid enum value)
    if (!Object.values(PaymentStatusEnum).includes(status as PaymentStatusEnum)) {
      throw new BadRequestException('Invalid status value');
    }

    // Call the service method to fetch transactions by status
    return this.transactionService.findByStatus(status);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.transactionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionService.update(+id, updateTransactionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.transactionService.remove(+id);
  // }
}
