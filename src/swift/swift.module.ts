import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwiftService } from './swift.service';
import { SwiftController } from './swift.controller';
import { SwiftConfig, SwiftConfigSchema } from './schemas/swift-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SwiftConfig.name, schema: SwiftConfigSchema },
    ]),
  ],
  controllers: [SwiftController],
  providers: [SwiftService],
  exports: [SwiftService],
})
export class SwiftModule {}
