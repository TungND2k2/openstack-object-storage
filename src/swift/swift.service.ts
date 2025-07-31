import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SwiftConfig, SwiftConfigDocument } from './schemas/swift-config.schema';
import { CreateSwiftConfigDto, UpdateSwiftConfigDto } from './dto/swift-config.dto';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface SwiftObjectMetadata {
  name: string;
  bytes: number;
  lastModified: string;
  contentType: string;
  hash: string;
}

export interface SwiftContainerInfo {
  name: string;
  count: number;
  bytes: number;
}

@Injectable()
export class SwiftService {
  private readonly logger = new Logger(SwiftService.name);
  private httpClient: AxiosInstance;

  constructor(
    @InjectModel(SwiftConfig.name)
    private swiftConfigModel: Model<SwiftConfigDocument>,
  ) {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Helper method to create Swift headers with provided token
  private getSwiftHeaders(token: string): Record<string, string> {
    return {
      'X-Auth-Token': token,
      'Content-Type': 'application/json',
    };
  }

  // Swift Configuration Management
  async createConfig(createDto: CreateSwiftConfigDto): Promise<SwiftConfig> {
    try {
      const config = new this.swiftConfigModel(createDto);
      return await config.save();
    } catch (error) {
      this.logger.error(`Error creating Swift config: ${error.message}`);
      throw new BadRequestException('Failed to create Swift configuration');
    }
  }

  async getConfigs(): Promise<SwiftConfig[]> {
    return await this.swiftConfigModel.find({ isActive: true }).exec();
  }

  async getConfigById(id: string): Promise<SwiftConfig> {
    const config = await this.swiftConfigModel.findById(id).exec();
    if (!config) {
      throw new NotFoundException('Swift configuration not found');
    }
    return config;
  }

  async getActiveConfig(): Promise<SwiftConfig> {
    const config = await this.swiftConfigModel.findOne({ isActive: true }).exec();
    if (!config) {
      throw new NotFoundException('No active Swift configuration found');
    }
    return config;
  }

  async updateConfig(id: string, updateDto: UpdateSwiftConfigDto): Promise<SwiftConfig> {
    const config = await this.swiftConfigModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    
    if (!config) {
      throw new NotFoundException('Swift configuration not found');
    }
    return config;
  }

  async deleteConfig(id: string): Promise<void> {
    const result = await this.swiftConfigModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Swift configuration not found');
    }
  }

  // Swift Object Storage Operations
  async uploadObject(
    token: string,
    container: string,
    objectName: string,
    data: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<{ success: boolean; etag: string; url: string }> {
    const config = await this.getActiveConfig();
    
    try {
      const headers: Record<string, string> = {
        ...this.getSwiftHeaders(token),
        'Content-Type': contentType,
        'Content-Length': data.length.toString(),
      };

      // Add custom metadata
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          headers[`X-Object-Meta-${key}`] = metadata[key];
        });
      }

      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}/${container}/${objectName}`;
      const response = await this.httpClient.put(url, data, { headers });

      this.logger.log(`Successfully uploaded object: ${container}/${objectName}`);

      return {
        success: true,
        etag: response.headers.etag || '',
        url: this.getPublicUrl(config, container, objectName),
      };
    } catch (error) {
      this.logger.error(`Error uploading object: ${error.message}`);
      throw new BadRequestException(`Failed to upload object: ${error.message}`);
    }
  }

  async downloadObject(token: string, container: string, objectName: string): Promise<{
    data: Buffer;
    contentType: string;
    metadata: Record<string, string>;
  }> {
    const config = await this.getActiveConfig();
    
    try {
      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}/${container}/${objectName}`;
      const headers = this.getSwiftHeaders(token);
      const response = await this.httpClient.get(url, {
        headers,
        responseType: 'arraybuffer',
      });

      // Extract metadata
      const metadata: Record<string, string> = {};
      Object.keys(response.headers).forEach(key => {
        if (key.startsWith('x-object-meta-')) {
          const metaKey = key.replace('x-object-meta-', '');
          metadata[metaKey] = response.headers[key];
        }
      });

      return {
        data: Buffer.from(response.data),
        contentType: response.headers['content-type'] || 'application/octet-stream',
        metadata,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Object not found: ${container}/${objectName}`);
      }
      this.logger.error(`Error downloading object: ${error.message}`);
      throw new BadRequestException(`Failed to download object: ${error.message}`);
    }
  }

  async deleteObject(token: string, container: string, objectName: string): Promise<void> {
    const config = await this.getActiveConfig();
    
    try {
      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}/${container}/${objectName}`;
      const headers = this.getSwiftHeaders(token);
      await this.httpClient.delete(url, { headers });

      this.logger.log(`Successfully deleted object: ${container}/${objectName}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Object not found: ${container}/${objectName}`);
      }
      this.logger.error(`Error deleting object: ${error.message}`);
      throw new BadRequestException(`Failed to delete object: ${error.message}`);
    }
  }

  async listObjects(token: string, container: string, prefix?: string, limit?: number): Promise<SwiftObjectMetadata[]> {
    const config = await this.getActiveConfig();
    
    try {
      const params: Record<string, string> = { format: 'json' };
      if (prefix) params.prefix = prefix;
      if (limit) params.limit = limit.toString();

      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}/${container}`;
      const headers = this.getSwiftHeaders(token);
      const response = await this.httpClient.get(url, {
        headers,
        params,
      });

      return response.data.map((obj: any) => ({
        name: obj.name,
        bytes: obj.bytes,
        lastModified: obj.last_modified,
        contentType: obj.content_type,
        hash: obj.hash,
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Container not found: ${container}`);
      }
      this.logger.error(`Error listing objects: ${error.message}`);
      throw new BadRequestException(`Failed to list objects: ${error.message}`);
    }
  }

  async createContainer(token: string, name: string, isPublic = false): Promise<void> {
    const config = await this.getActiveConfig();
    
    try {
      const headers: Record<string, string> = {
        ...this.getSwiftHeaders(token),
      };

      if (isPublic) {
        headers['X-Container-Read'] = '.r:*,.rlistings';
      }

      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}/${name}`;
      await this.httpClient.put(url, null, { headers });

      this.logger.log(`Successfully created container: ${name}`);
    } catch (error) {
      this.logger.error(`Error creating container: ${error.message}`);
      throw new BadRequestException(`Failed to create container: ${error.message}`);
    }
  }

  async listContainers(token: string): Promise<SwiftContainerInfo[]> {
    const config = await this.getActiveConfig();
    
    try {
      const url = `${config.storageUrl}/v1/AUTH_${config.tenantName}`;
      const headers = this.getSwiftHeaders(token);
      const response = await this.httpClient.get(url, {
        headers,
        params: { format: 'json' },
      });

      return response.data.map((container: any) => ({
        name: container.name,
        count: container.count,
        bytes: container.bytes,
      }));
    } catch (error) {
      this.logger.error(`Error listing containers: ${error.message}`);
      throw new BadRequestException(`Failed to list containers: ${error.message}`);
    }
  }

  // URL Generation
  getPublicUrl(config: SwiftConfig, container: string, objectName: string): string {
    return `${config.storageUrl}/v1/AUTH_${config.tenantName}/${container}/${objectName}`;
  }

  generateTempUrl(
    container: string,
    objectName: string,
    expiresInSeconds: number,
    method: 'GET' | 'PUT' | 'POST' | 'DELETE' = 'GET',
  ): Promise<string> {
    return this.generateTempUrlWithConfig(container, objectName, expiresInSeconds, method);
  }

  private async generateTempUrlWithConfig(
    container: string,
    objectName: string,
    expiresInSeconds: number,
    method: string,
  ): Promise<string> {
    const config = await this.getActiveConfig();
    
    if (!config.tempUrlKey) {
      throw new BadRequestException('Temp URL key not configured');
    }

    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const path = `/v1/AUTH_${config.tenantName}/${container}/${objectName}`;
    
    const hmacBody = `${method}\n${expires}\n${path}`;
    const signature = crypto
      .createHmac('sha1', config.tempUrlKey)
      .update(hmacBody)
      .digest('hex');

    const tempUrl = `${config.storageUrl}${path}?temp_url_sig=${signature}&temp_url_expires=${expires}`;
    
    return tempUrl;
  }

  // Health Check
  async checkConnection(token: string): Promise<{ connected: boolean; message: string }> {
    try {
      const config = await this.getActiveConfig();
      const headers = this.getSwiftHeaders(token);
      const response = await this.httpClient.head(`${config.storageUrl}/v1/AUTH_${config.tenantName}`, {
        headers,
      });

      return {
        connected: response.status === 200,
        message: 'Successfully connected to Swift',
      };
    } catch (error) {
      return {
        connected: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}
