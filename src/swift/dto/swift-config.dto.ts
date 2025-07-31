import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateSwiftConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  authUrl?: string;

  @IsUrl()
  storageUrl: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  tenantName: string;

  @IsOptional()
  @IsString()
  tempUrlKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSwiftConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  authUrl?: string;

  @IsOptional()
  @IsUrl()
  storageUrl?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  tenantName?: string;

  @IsOptional()
  @IsString()
  tempUrlKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
