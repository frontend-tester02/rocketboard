import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createCardSchema,
  createTransactionSchema,
  transactionListQuerySchema,
  updateCardSchema,
  type CreateCard,
  type CreateTransaction,
  type TransactionListQuery,
  type UpdateCard,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiCookieAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Wallet balance / income / expense totals' })
  summary(@CurrentUser('id') userId: string) {
    return this.wallet.summary(userId);
  }

  // ── Cards ────────────────────────────────────────────────────────────────
  @Get('cards')
  @ApiOperation({ summary: 'List cards' })
  listCards(@CurrentUser('id') userId: string) {
    return this.wallet.listCards(userId);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Add a card' })
  createCard(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createCardSchema)) dto: CreateCard,
  ) {
    return this.wallet.createCard(userId, dto);
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Update a card' })
  updateCard(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateCardSchema)) dto: UpdateCard,
  ) {
    return this.wallet.updateCard(userId, id, dto);
  }

  @Delete('cards/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a card' })
  async removeCard(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.wallet.removeCard(userId, id);
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  @Get('transactions')
  @ApiOperation({ summary: 'List transactions (filter by type)' })
  listTransactions(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(transactionListQuerySchema)) query: TransactionListQuery,
  ) {
    return this.wallet.listTransactions(userId, query);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Add a transaction' })
  createTransaction(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createTransactionSchema)) dto: CreateTransaction,
  ) {
    return this.wallet.createTransaction(userId, dto);
  }

  @Delete('transactions/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a transaction' })
  async removeTransaction(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.wallet.removeTransaction(userId, id);
  }
}
