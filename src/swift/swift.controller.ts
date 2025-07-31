import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SwiftService } from './swift.service';
import { CreateSwiftConfigDto, UpdateSwiftConfigDto } from './dto/swift-config.dto';

@Controller('swift')
export class SwiftController {
  private readonly logger = new Logger(SwiftController.name);

  constructor(private readonly swiftService: SwiftService) {}

  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  async createConfig(@Body() createDto: CreateSwiftConfigDto) {
    this.logger.log(`Creating Swift config: ${createDto.name}`);

    const config = await this.swiftService.createConfig(createDto);

    return {
      message: 'Swift configuration created successfully',
      data: {
        id: (config as any)._id,
        name: config.name,
        authUrl: config.authUrl,
        storageUrl: config.storageUrl,
        tenantName: config.tenantName,
        isActive: config.isActive,
      },
    };
  }

  @Get('config')
  async getConfigs() {
    this.logger.log('Listing Swift configurations');

    const configs = await this.swiftService.getConfigs();

    return {
      message: 'Swift configurations retrieved successfully',
      data: {
        count: configs.length,
        configs: configs.map(config => ({
          id: (config as any)._id,
          name: config.name,
          authUrl: config.authUrl,
          storageUrl: config.storageUrl,
          tenantName: config.tenantName,
          isActive: config.isActive,
          description: config.description,
          createdAt: (config as any).createdAt,
          updatedAt: (config as any).updatedAt,
        })),
      },
    };
  }

  @Get('config/:id')
  async getConfigById(@Param('id') id: string) {
    this.logger.log(`Getting Swift config: ${id}`);

    const config = await this.swiftService.getConfigById(id);

    return {
      message: 'Swift configuration retrieved successfully',
      data: {
        id: (config as any)._id,
        name: config.name,
        authUrl: config.authUrl,
        storageUrl: config.storageUrl,
        tenantName: config.tenantName,
        isActive: config.isActive,
        description: config.description,
        createdAt: (config as any).createdAt,
        updatedAt: (config as any).updatedAt,
      },
    };
  }

  @Put('config/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() updateDto: UpdateSwiftConfigDto,
  ) {
    this.logger.log(`Updating Swift config: ${id}`);

    const config = await this.swiftService.updateConfig(id, updateDto);

    return {
      message: 'Swift configuration updated successfully',
      data: {
        id: (config as any)._id,
        name: config.name,
        authUrl: config.authUrl,
        storageUrl: config.storageUrl,
        tenantName: config.tenantName,
        isActive: config.isActive,
        description: config.description,
        updatedAt: (config as any).updatedAt,
      },
    };
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('id') id: string) {
    this.logger.log(`Deleting Swift config: ${id}`);

    await this.swiftService.deleteConfig(id);

    return {
      message: 'Swift configuration deleted successfully',
    };
  }

  @Get('config/active/current')
  async getActiveConfig() {
    this.logger.log('Getting active Swift configuration');

    const config = await this.swiftService.getActiveConfig();

    return {
      message: 'Active Swift configuration retrieved successfully',
      data: {
        id: (config as any)._id,
        name: config.name,
        authUrl: config.authUrl,
        storageUrl: config.storageUrl,
        tenantName: config.tenantName,
        description: config.description,
      },
    };
  }

  @Post('config/itu')
  @HttpCode(HttpStatus.CREATED)
  async createITUConfig() {
    this.logger.log('Creating ITU OpenStack Swift configuration');

    const createDto: CreateSwiftConfigDto = {
      name: 'ITU OpenStack Swift',
      authUrl: 'https://openstack-ext.itu.vn:5000/v3',
      storageUrl: 'https://openstack-ext.itu.vn:8081/swift',
      username: 'swift_user', // Placeholder - will be updated with actual credentials
      password: 'swift_password', // Placeholder - will be updated with actual credentials
      tenantName: '14ccc7bf08b74206b1ae3fe5591032cb',
      tempUrlKey: 'temp_url_key', // Optional - for temporary URL generation
      isActive: true,
      description: 'ITU OpenStack Swift Object Storage Configuration',
    };

    const config = await this.swiftService.createConfig(createDto);

    return {
      message: 'ITU OpenStack Swift configuration created successfully',
      data: {
        id: (config as any)._id,
        name: config.name,
        authUrl: config.authUrl,
        storageUrl: config.storageUrl,
        tenantName: config.tenantName,
        isActive: config.isActive,
        description: config.description,
        note: 'Please update username and password with actual credentials using PUT /api/v1/swift/config/{id}',
      },
    };
  }
}
