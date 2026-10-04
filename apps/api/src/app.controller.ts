import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'rocket-api',
      timestamp: new Date().toISOString(),
    };
  }
}
