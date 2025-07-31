import { Module } from '@nestjs/common';
import { ObjectStorageController } from './object-storage.controller';
import { SwiftModule } from '../swift/swift.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SwiftModule, AuthModule],
  controllers: [ObjectStorageController],
})
export class ObjectStorageModule {}
