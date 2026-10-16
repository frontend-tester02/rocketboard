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
  createCustomerSchema,
  customerListQuerySchema,
  updateCustomerSchema,
  type CreateCustomer,
  type CustomerListQuery,
  type UpdateCustomer,
} from '@rocket/shared';
import { ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiCookieAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers (paginated, searchable)' })
  list(
    @Query(new ZodValidationPipe(customerListQuerySchema))
    query: CustomerListQuery,
  ) {
    return this.customers.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.customers.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  create(
    @Body(new ZodValidationPipe(createCustomerSchema)) dto: CreateCustomer,
  ) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateCustomerSchema)) dto: UpdateCustomer,
  ) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a customer' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.customers.remove(id);
  }
}
