import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SwiftConfigDocument = SwiftConfig & Document;

@Schema({ timestamps: true })
export class SwiftConfig {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  authUrl?: string;

  @Prop({ required: true })
  storageUrl: string;

  @Prop()
  username?: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  tenantName: string;

  @Prop()
  tempUrlKey?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;
}

export const SwiftConfigSchema = SchemaFactory.createForClass(SwiftConfig);
