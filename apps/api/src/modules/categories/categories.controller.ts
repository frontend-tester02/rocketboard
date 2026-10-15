import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategory,
  type UpdateCategory,
} from '@rocket/shared';
import { ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@ApiCookieAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  findAll() {
    return this.categories.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categories.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(
    @Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategory,
  ) {
    return this.categories.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) dto: UpdateCategory,
  ) {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.categories.remove(id);
  }
}
