// MongoDB script để import ITU Swift configuration
// Chạy script này trong MongoDB shell hoặc MongoDB Compass

// Sử dụng database
use('swift-storage');

// Insert document vào collection swiftconfigs
db.swiftconfigs.insertOne({
  "name": "ITU OpenStack Swift",
  "storageUrl": "https://openstack-ext.itu.vn:8081/swift",
  "tenantName": "14ccc7bf08b74206b1ae3fe5591032cb",
  "tempUrlKey": "your_temp_url_key", // Optional - cho temporary URL generation
  "isActive": true,
  "description": "ITU OpenStack Swift Object Storage Configuration - Token từ JWT",
  "createdAt": new Date(),
  "updatedAt": new Date()
});

// Hoặc nếu muốn update existing document
/*
db.swiftconfigs.updateOne(
  { "name": "ITU OpenStack Swift" },
  {
    $set: {
      "storageUrl": "https://openstack-ext.itu.vn:8081/swift",
      "tenantName": "14ccc7bf08b74206b1ae3fe5591032cb",
      "isActive": true,
      "updatedAt": new Date()
    }
  },
  { upsert: true }
);
*/
