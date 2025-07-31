import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SwiftService } from '../swift/swift.service';

async function insertITUConfig() {
  console.log('🚀 Connecting to application...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const swiftService = app.get(SwiftService);

  try {
    console.log('📝 Creating ITU OpenStack Swift configuration...');
    
    const config = await swiftService.createConfig({
      name: 'ITU OpenStack Swift',
      storageUrl: 'https://openstack-ext.itu.vn:8081/swift',
      tenantName: '14ccc7bf08b74206b1ae3fe5591032cb',
      tempUrlKey: 'temp_url_key_for_itu', // Optional
      isActive: true,
      description: 'ITU OpenStack Swift Object Storage Configuration - Token từ JWT',
    });

    console.log('✅ Configuration created successfully!');
    console.log('📄 Config details:', {
      id: (config as any)._id,
      name: config.name,
      storageUrl: config.storageUrl,
      tenantName: config.tenantName,
      isActive: config.isActive,
      description: config.description,
    });

  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log('⚠️  Configuration already exists! Trying to update...');
      
      try {
        // Tìm config hiện tại
        const configs = await swiftService.getConfigs();
        const existingConfig = configs.find(c => c.name === 'ITU OpenStack Swift');
        
        if (existingConfig) {
          const updatedConfig = await swiftService.updateConfig((existingConfig as any)._id, {
            storageUrl: 'https://openstack-ext.itu.vn:8081/swift',
            tenantName: '14ccc7bf08b74206b1ae3fe5591032cb',
            isActive: true,
            description: 'ITU OpenStack Swift Object Storage Configuration - Token từ JWT (Updated)',
          });
          
          console.log('✅ Configuration updated successfully!');
          console.log('📄 Updated config:', {
            id: (updatedConfig as any)._id,
            name: updatedConfig.name,
            storageUrl: updatedConfig.storageUrl,
            tenantName: updatedConfig.tenantName,
            isActive: updatedConfig.isActive,
          });
        }
      } catch (updateError) {
        console.error('❌ Error updating configuration:', updateError.message);
      }
    } else {
      console.error('❌ Error creating configuration:', error.message);
    }
  } finally {
    await app.close();
    console.log('🔌 Application context closed');
  }
}

// Chạy script
insertITUConfig()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
