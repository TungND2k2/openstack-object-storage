import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class UploadObjectDto {
  @IsString()
  container: string;

  @IsString()
  objectName: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class DownloadObjectDto {
  @IsString()
  container: string;

  @IsString()
  objectName: string;
}

export class DeleteObjectDto {
  @IsString()
  container: string;

  @IsString()
  objectName: string;
}

export class ListObjectsDto {
  @IsString()
  container: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number;
}

export class CreateContainerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class GenerateTempUrlDto {
  @IsString()
  container: string;

  @IsString()
  objectName: string;

  @IsNumber()
  @Min(60)
  @Max(604800) // Max 7 days
  expiresInSeconds: number;

  @IsOptional()
  @IsString()
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
}
