# OpenStack Swift Object Storage API - Tài liệu Tính năng

## Tổng quan

Hệ thống Object Storage sử dụng OpenStack Swift được xây dựng với NestJS, cung cấp API REST để quản lý file và container trong môi trường enterprise.

## Kiến trúc

```
┌─────────────────┬──────────────────┬─────────────────┐
│   Frontend      │   NestJS API     │   OpenStack     │
│                 │                  │   Swift         │
├─────────────────┼──────────────────┼─────────────────┤
│ JWT Token       │ Authentication   │ X-Auth-Token    │
│ (chứa Swift     │ Service          │                 │
│  token)         │                  │                 │
├─────────────────┼──────────────────┼─────────────────┤
│ File Upload/    │ Object Storage   │ Container/      │
│ Download        │ Controller       │ Object API      │
├─────────────────┼──────────────────┼─────────────────┤
│ Container Mgmt  │ Swift Service    │ Storage Engine  │
└─────────────────┴──────────────────┴─────────────────┘
                         │
                    ┌────▼────┐
                    │ MongoDB │
                    │ Config  │
                    └─────────┘
```

## Cấu hình Database

### Schema: SwiftConfig
```typescript
{
  name: string,              // Tên cấu hình (unique)
  authUrl?: string,          // URL Keystone (optional)
  storageUrl: string,        // Swift Storage URL
  username?: string,         // Username (optional)
  password?: string,         // Password (optional)
  tenantName: string,        // Project/Tenant ID
  tempUrlKey?: string,       // Key cho temporary URLs
  isActive: boolean,         // Trạng thái active
  description?: string       // Mô tả
}
```

### Cấu hình ITU đã được tạo:
```json
{
  "name": "ITU OpenStack Swift",
  "storageUrl": "https://openstack-ext.itu.vn:8081/swift",
  "tenantName": "14ccc7bf08b74206b1ae3fe5591032cb",
  "isActive": true,
  "description": "ITU OpenStack Swift Object Storage Configuration - Token từ JWT"
}
```

## Xác thực (Authentication)

### JWT Token Structure
Frontend truyền JWT token chứa OpenStack token:
```json
{
  "sub": "user_id",
  "openstack": {
    "token": "gAAAAABh...",
    "project_id": "14ccc7bf08b74206b1ae3fe5591032cb",
    "roles": ["member", "admin"]
  }
}
```

### Authentication Flow
1. Frontend gửi request với JWT token trong header `Authorization: Bearer <jwt_token>`
2. AuthService extract OpenStack token từ JWT
3. SwiftService sử dụng X-Auth-Token để gọi Swift API

## API Endpoints

### 1. Root & Health Check

#### `GET /api/v1`
Thông tin API và danh sách endpoints
```json
{
  "name": "OpenStack Swift Object Storage API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "objects": "/objects", 
    "swift": "/swift"
  }
}
```

#### `GET /api/v1/health`
Kiểm tra trạng thái hệ thống
```json
{
  "status": "ok",
  "timestamp": "2025-07-31T10:00:00.000Z",
  "service": "OpenStack Swift Object Storage API"
}
```

### 2. Swift Configuration Management

#### `POST /api/v1/swift/config`
Tạo cấu hình Swift mới
```bash
curl -X POST http://localhost:3000/api/v1/swift/config \
-H "Content-Type: application/json" \
-d '{
  "name": "My Swift Config",
  "storageUrl": "https://swift.example.com:8081/swift",
  "tenantName": "project_id_here",
  "isActive": true
}'
```

#### `GET /api/v1/swift/config`
Liệt kê tất cả cấu hình Swift
```json
{
  "message": "Swift configurations retrieved successfully",
  "data": {
    "count": 1,
    "configs": [...]
  }
}
```

#### `GET /api/v1/swift/config/:id`
Lấy cấu hình Swift theo ID

#### `PUT /api/v1/swift/config/:id`
Cập nhật cấu hình Swift

#### `DELETE /api/v1/swift/config/:id`
Xóa cấu hình Swift

#### `GET /api/v1/swift/config/active/current`
Lấy cấu hình Swift đang active

#### `POST /api/v1/swift/config/itu`
Tạo cấu hình ITU (shortcut)

### 3. Object Storage Operations

#### `POST /api/v1/objects/upload`
Upload file vào container
```bash
curl -X POST http://localhost:3000/api/v1/objects/upload \
-H "Authorization: Bearer <jwt_token>" \
-F "file=@document.pdf" \
-F "container=my-container" \
-F "objectName=documents/file.pdf" \
-F "metadata[author]=John Doe"
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "container": "my-container",
    "objectName": "documents/file.pdf",
    "size": 1024,
    "etag": "d41d8cd98f00b204e9800998ecf8427e",
    "url": "https://swift.itu.vn:8081/swift/v1/AUTH_123/my-container/documents/file.pdf"
  }
}
```

#### `GET /api/v1/objects/download/:container/:objectName`
Download file từ container
```bash
curl -X GET http://localhost:3000/api/v1/objects/download/my-container/file.pdf \
-H "Authorization: Bearer <jwt_token>" \
--output downloaded_file.pdf
```

#### `DELETE /api/v1/objects/:container/:objectName`
Xóa object khỏi container
```bash
curl -X DELETE http://localhost:3000/api/v1/objects/my-container/file.pdf \
-H "Authorization: Bearer <jwt_token>"
```

#### `GET /api/v1/objects/list/:container`
Liệt kê objects trong container
```bash
curl -X GET "http://localhost:3000/api/v1/objects/list/my-container?prefix=docs/&limit=10" \
-H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "message": "Objects listed successfully",
  "data": {
    "container": "my-container",
    "objects": [
      {
        "name": "docs/file1.pdf",
        "bytes": 1024,
        "lastModified": "2025-07-31T10:00:00.000Z",
        "contentType": "application/pdf",
        "hash": "d41d8cd98f00b204e9800998ecf8427e"
      }
    ]
  }
}
```

#### `GET /api/v1/objects/info/:container/:objectName`
Lấy metadata của object
```json
{
  "message": "Object info retrieved successfully",
  "data": {
    "name": "file.pdf",
    "size": 1024,
    "contentType": "application/pdf",
    "lastModified": "2025-07-31T10:00:00.000Z",
    "etag": "d41d8cd98f00b204e9800998ecf8427e",
    "metadata": {
      "author": "John Doe",
      "department": "IT"
    }
  }
}
```

### 4. Container Management

#### `POST /api/v1/objects/containers`
Tạo container mới
```bash
curl -X POST http://localhost:3000/api/v1/objects/containers \
-H "Authorization: Bearer <jwt_token>" \
-H "Content-Type: application/json" \
-d '{
  "name": "my-new-container",
  "isPublic": false
}'
```

#### `GET /api/v1/objects/containers`
Liệt kê tất cả containers
```json
{
  "message": "Containers listed successfully",
  "data": {
    "containers": [
      {
        "name": "my-container",
        "count": 5,
        "bytes": 5120
      }
    ]
  }
}
```

### 5. Temporary URL Generation

#### `POST /api/v1/objects/temp-url`
Tạo temporary URL cho object
```bash
curl -X POST http://localhost:3000/api/v1/objects/temp-url \
-H "Authorization: Bearer <jwt_token>" \
-H "Content-Type: application/json" \
-d '{
  "container": "my-container",
  "objectName": "file.pdf",
  "expiresInSeconds": 3600,
  "method": "GET"
}'
```

**Response:**
```json
{
  "message": "Temporary URL generated successfully",
  "data": {
    "tempUrl": "https://swift.itu.vn/.../file.pdf?temp_url_sig=...&temp_url_expires=...",
    "expiresAt": "2025-07-31T11:00:00.000Z",
    "method": "GET"
  }
}
```

### 6. Health Check

#### `GET /api/v1/objects/health`
Kiểm tra kết nối với Swift
```bash
curl -X GET http://localhost:3000/api/v1/objects/health \
-H "Authorization: Bearer <jwt_token>"
```

## Tính năng Bảo mật

### 1. JWT Authentication
- Token validation
- OpenStack token extraction
- Project/tenant verification

### 2. Role-based Access
```typescript
// Kiểm tra role trong JWT
hasRole(requiredRole: string): boolean
```

### 3. Secure Headers
- X-Auth-Token cho Swift API
- Content-Type validation
- CORS enabled

## Error Handling

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Logging

### Log Levels
- `LOG` - Thông tin chung
- `WARN` - Cảnh báo
- `ERROR` - Lỗi hệ thống

### Log Format
```
[Nest] 1234 - 07/31/2025, 10:00:00 AM LOG [SwiftService] Successfully uploaded object: container/file.pdf
```

## Deployment

### Development
```bash
# Start MongoDB
npm run docker:mongo

# Start development server
npm run start:dev
```

### Production
```bash
# Build application
npm run build

# Start production server
npm run start:prod
```

### Environment Variables
```bash
PORT=3000
MONGODB_URL=mongodb://localhost:27017/swift-storage
```

## Performance & Scaling

### Features
- Connection pooling (MongoDB)
- HTTP timeout (30s)
- File size limits
- Concurrent request handling

### Monitoring
- Application logs
- MongoDB connection status
- Swift API response times

## Scripts Tiện ích

### Insert ITU Configuration
```bash
npm run insert:itu
```

### Build Project
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

## Tích hợp Frontend

### JWT Token Format
```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Headers cho mọi request
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### File Upload Example
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('container', 'my-container');
formData.append('objectName', 'path/to/file.pdf');

fetch('/api/v1/objects/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**
   - Kiểm tra MongoDB service
   - Verify connection string

2. **Swift Authentication Failed**
   - Kiểm tra JWT token
   - Verify OpenStack token validity

3. **File Upload Failed**
   - Check file size limits
   - Verify container exists
   - Check Swift storage quotas

### Debug Commands
```bash
# Check MongoDB status
docker ps | grep mongo

# Check application logs
npm run start:dev

# Test Swift connection
curl -X GET /api/v1/objects/health
```
