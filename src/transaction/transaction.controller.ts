import {
  Controller,
  Get,
  Request,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/admin-auth/admin-auth.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Transaction')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('trx')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.transactionService.listAllTrx();
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('trx/:transactionId')
  async listOneTrx(
    @Param('transactionId')
    transactionId: string,
  ) {
    return this.transactionService.listOneTrx(transactionId);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user-trx')
  async listAllUserTrx(@Request() req) {
    const userId = req.user;
    console.log(userId);
    return this.transactionService.listAllUserTrx(userId);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user-trx/:transactionId')
  async listAllOneUserTrx(
    @Param('transactionId')
    transactionId: string,
    @Request() req,
  ) {
    const userId = req.user;
    return this.transactionService.listAllOneUserTrx(transactionId, userId);
  }
}
