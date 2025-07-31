import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectStorageModule } from './object-storage/object-storage.module';
import { SwiftModule } from './swift/swift.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', 
    }),
    
    // MongoDB connection
    MongooseModule.forRoot(process.env.MONGODB_URL || 'mongodb://localhost:27017/swift-storage'),
    
    // Feature modules
    ObjectStorageModule,
    SwiftModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
