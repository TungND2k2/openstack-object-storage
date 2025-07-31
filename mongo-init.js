// MongoDB initialization script for Swift Storage
db = db.getSiblingDB('swift-storage');

// Create collections
db.createCollection('swiftconfigs');

// Create indexes
db.swiftconfigs.createIndex({ "name": 1 }, { unique: true });
db.swiftconfigs.createIndex({ "isActive": 1 });

// Insert sample configuration (optional)
db.swiftconfigs.insertOne({
  name: "default-swift",
  authUrl: "http://keystone:5000",
  storageUrl: "http://swift:8080",
  username: "swift_user",
  password: "swift_password",
  tenantName: "swift_tenant",
  tempUrlKey: "your_temp_url_key_here",
  isActive: true,
  description: "Default Swift configuration",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Swift Storage database initialized successfully!");
