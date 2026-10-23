import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { exportFormatSchema } from '@rocket/shared';
import type { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('Export')
@ApiCookieAuth()
@Controller('export')
export class ExportController {
  constructor(private readonly exporter: ExportService) {}

  @Get(':resource')
  @ApiOperation({ summary: 'Export a resource as xlsx | csv | pdf (honors filters)' })
  async run(
    @Param('resource') resource: string,
    @Res() res: Response,
    @Query('format') format?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('favorite') favorite?: string,
  ): Promise<void> {
    const parsed = exportFormatSchema.safeParse(format ?? 'csv');
    if (!parsed.success) throw new BadRequestException('Invalid export format');

    const file = await this.exporter.export(resource, parsed.data, {
      search,
      status,
      favorite: favorite === 'true' || favorite === '1',
    });

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });
    res.send(file.buffer);
  }
}
