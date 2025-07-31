import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SwiftService } from '../swift/swift.service';
import { AuthService } from '../auth/auth.service';
import {
  UploadObjectDto,
  DownloadObjectDto,
  DeleteObjectDto,
  ListObjectsDto,
  CreateContainerDto,
  GenerateTempUrlDto,
} from './dto/object-storage.dto';

@Controller('objects')
export class ObjectStorageController {
  private readonly logger = new Logger(ObjectStorageController.name);

  constructor(
    private readonly swiftService: SwiftService,
    private readonly authService: AuthService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadObject(
    @Headers('authorization') authHeader: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadObjectDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const token = this.authService.extractOpenStackToken(authHeader);
    this.logger.log(`Uploading object: ${uploadDto.container}/${uploadDto.objectName}`);

    const result = await this.swiftService.uploadObject(
      token,
      uploadDto.container,
      uploadDto.objectName,
      file.buffer,
      uploadDto.contentType || file.mimetype,
      uploadDto.metadata,
    );

    return {
      message: 'Object uploaded successfully',
      data: {
        container: uploadDto.container,
        objectName: uploadDto.objectName,
        size: file.size,
        contentType: uploadDto.contentType || file.mimetype,
        etag: result.etag,
        url: result.url,
      },
    };
  }

  @Get('download/:container/:objectName')
  async downloadObject(
    @Headers('authorization') authHeader: string,
    @Param() params: DownloadObjectDto,
    @Res() res: Response,
  ) {
    this.logger.log(`Downloading object: ${params.container}/${params.objectName}`);

    const token = this.authService.extractOpenStackToken(authHeader);
    const { data, contentType, metadata } = await this.swiftService.downloadObject(
      token,
      params.container,
      params.objectName,
    );

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', data.length);
    res.setHeader('Content-Disposition', `attachment; filename="${params.objectName}"`);

    // Add custom metadata as headers
    Object.keys(metadata).forEach(key => {
      res.setHeader(`X-Object-Meta-${key}`, metadata[key]);
    });

    res.send(data);
  }

  @Delete(':container/:objectName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteObject(
    @Headers('authorization') authHeader: string,
    @Param() params: DeleteObjectDto,
  ) {
    this.logger.log(`Deleting object: ${params.container}/${params.objectName}`);

    const token = this.authService.extractOpenStackToken(authHeader);
    await this.swiftService.deleteObject(token, params.container, params.objectName);

    return {
      message: 'Object deleted successfully',
    };
  }

  @Get('list/:container')
  async listObjects(
    @Headers('authorization') authHeader: string,
    @Param('container') container: string,
    @Query() query: Omit<ListObjectsDto, 'container'>,
  ) {
    this.logger.log(`Listing objects in container: ${container}`);

    const token = this.authService.extractOpenStackToken(authHeader);
    const objects = await this.swiftService.listObjects(
      token,
      container,
      query.prefix,
      query.limit,
    );

    return {
      message: 'Objects retrieved successfully',
      data: {
        container,
        count: objects.length,
        objects,
      },
    };
  }

  @Post('containers')
  @HttpCode(HttpStatus.CREATED)
  async createContainer(
    @Headers('authorization') authHeader: string,
    @Body() createDto: CreateContainerDto,
  ) {
    this.logger.log(`Creating container: ${createDto.name}`);

    const token = this.authService.extractOpenStackToken(authHeader);
    await this.swiftService.createContainer(token, createDto.name, createDto.isPublic);

    return {
      message: 'Container created successfully',
      data: {
        name: createDto.name,
        isPublic: createDto.isPublic || false,
      },
    };
  }

  @Get('containers')
  async listContainers(@Headers('authorization') authHeader: string) {
    this.logger.log('Listing containers');

    const token = this.authService.extractOpenStackToken(authHeader);
    const containers = await this.swiftService.listContainers(token);

    return {
      message: 'Containers retrieved successfully',
      data: {
        count: containers.length,
        containers,
      },
    };
  }

  @Post('temp-url')
  async generateTempUrl(@Body() tempUrlDto: GenerateTempUrlDto) {
    this.logger.log(
      `Generating temp URL for: ${tempUrlDto.container}/${tempUrlDto.objectName}`,
    );

    const tempUrl = await this.swiftService.generateTempUrl(
      tempUrlDto.container,
      tempUrlDto.objectName,
      tempUrlDto.expiresInSeconds,
      tempUrlDto.method || 'GET',
    );

    return {
      message: 'Temporary URL generated successfully',
      data: {
        container: tempUrlDto.container,
        objectName: tempUrlDto.objectName,
        tempUrl,
        expiresAt: new Date(Date.now() + tempUrlDto.expiresInSeconds * 1000),
        method: tempUrlDto.method || 'GET',
      },
    };
  }

  @Get('health')
  async healthCheck(@Headers('authorization') authHeader: string) {
    const token = this.authService.extractOpenStackToken(authHeader);
    const health = await this.swiftService.checkConnection(token);

    return {
      message: 'Health check completed',
      data: health,
    };
  }

  @Get('info/:container/:objectName')
  async getObjectInfo(
    @Headers('authorization') authHeader: string,
    @Param() params: DownloadObjectDto,
  ) {
    this.logger.log(`Getting object info: ${params.container}/${params.objectName}`);

    try {
      const token = this.authService.extractOpenStackToken(authHeader);
      const { metadata, contentType } = await this.swiftService.downloadObject(
        token,
        params.container,
        params.objectName,
      );

      return {
        message: 'Object info retrieved successfully',
        data: {
          container: params.container,
          objectName: params.objectName,
          contentType,
          metadata,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
