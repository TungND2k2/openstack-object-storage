import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      name: 'OpenStack Swift Object Storage API',
      version: '1.0.0',
      description: 'NestJS Object Storage module using OpenStack Swift',
      endpoints: {
        health: '/health',
        objects: '/objects',
        swift: '/swift',
      },
      documentation: 'See API_TESTING.md for detailed API usage',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'OpenStack Swift Object Storage API',
      version: '1.0.0',
    };
  }
}
