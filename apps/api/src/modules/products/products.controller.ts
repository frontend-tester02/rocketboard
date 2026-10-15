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
  bulkProductIdsSchema,
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
  type BulkProductIds,
  type CreateProduct,
  type ProductListQuery,
  type UpdateProduct,
} from '@rocket/shared';
import { ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiCookieAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated, filtered, searchable)' })
  list(
    @Query(new ZodValidationPipe(productListQuerySchema))
    query: ProductListQuery,
  ) {
    return this.products.list(query);
  }

  // Declared before ":id" so "counts" is not captured as an id.
  @Get('counts')
  @ApiOperation({ summary: 'Get All / Available / Disabled counts' })
  counts() {
    return this.products.counts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.products.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  create(@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProduct) {
    return this.products.create(dto);
  }

  @Post('bulk')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk delete products by id' })
  bulkRemove(
    @Body(new ZodValidationPipe(bulkProductIdsSchema)) dto: BulkProductIds,
  ) {
    return this.products.bulkRemove(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProduct,
  ) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.products.remove(id);
  }
}
