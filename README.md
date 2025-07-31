# NestJS Object Storage with OpenStack Swift

Một module Object Storage được xây dựng trên NestJS, tích hợp với OpenStack Swift để quản lý object storage trong hệ thống doanh nghiệp.

## ✨ Tính năng chính

- **Upload/Download Objects**: Upload và tải xuống file thông qua RESTful API
- **Container Management**: Tạo và quản lý container (bucket)
- **Metadata Support**: Hỗ trợ metadata tùy chỉnh cho objects
- **Temporary URLs**: Tạo URL truy cập tạm thời với thời gian hết hạn
- **Public URLs**: Hỗ trợ URL công khai cho objects
- **MongoDB Integration**: Lưu trữ cấu hình Swift endpoint trong MongoDB
- **Token-based Authentication**: Sử dụng JWT token chứa OpenStack token
- **Health Check**: Kiểm tra kết nối với Swift storage

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  NestJS API     │───▶│  OpenStack      │
│   (JWT Token)   │    │  (This Module)  │    │  Swift          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │  (Endpoints)    │
                       └─────────────────┘
```

## 🚀 Cài đặt

1. **Clone repository:**
```bash
git clone <repository-url>
cd object-storage
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình môi trường:**
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin MongoDB của bạn
```

4. **Chạy ứng dụng:**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📝 Cấu hình Swift Endpoint

Trước khi sử dụng, bạn cần cấu hình Swift endpoint trong database:

```bash
POST /swift/config
Content-Type: application/json

{
  "name": "production-swift",
  "authUrl": "http://keystone:5000",
  "storageUrl": "http://swift:8080",
  "username": "swift_user",
  "password": "swift_password", 
  "tenantName": "swift_tenant",
  "tempUrlKey": "your_temp_url_key",
  "isActive": true,
  "description": "Production Swift cluster"
}
```

## 🔧 API Endpoints

### Object Operations

#### Upload Object
```bash
POST /objects/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Form data:
- file: <binary-file>
- container: "my-container"
- objectName: "my-file.jpg"
- contentType: "image/jpeg" (optional)
- metadata: {"author": "user1", "project": "demo"} (optional)
```

#### Download Object
```bash
GET /objects/download/{container}/{objectName}
Authorization: Bearer <jwt-token>
```

#### Delete Object
```bash
DELETE /objects/{container}/{objectName}
Authorization: Bearer <jwt-token>
```

#### List Objects
```bash
GET /objects/list/{container}?prefix=folder/&limit=100
Authorization: Bearer <jwt-token>
```

#### Get Object Info
```bash
GET /objects/info/{container}/{objectName}
Authorization: Bearer <jwt-token>
```

### Container Operations

#### Create Container
```bash
POST /objects/containers
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "my-container",
  "isPublic": false
}
```

#### List Containers
```bash
GET /objects/containers
Authorization: Bearer <jwt-token>
```

### URL Generation

#### Generate Temporary URL
```bash
POST /objects/temp-url
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "container": "my-container",
  "objectName": "my-file.jpg",
  "expiresInSeconds": 3600,
  "method": "GET"
}
```

### Health Check
```bash
GET /objects/health
Authorization: Bearer <jwt-token>
```

## 🔐 Authentication

Module này sử dụng JWT token từ frontend, trong đó chứa OpenStack token:

```javascript
// JWT Payload structure
{
  "sub": "user-id",
  "iat": 1750236058,
  "exp": 1750239658,
  "iss": "x-or.cloud",
  "token": "gAAAAABoUn0jftHu...", // OpenStack token
  "domain": {
    "id": "default"
  },
  "project": {
    "id": "3792560ff73a41aebcc50599dab468d9",
    "role": {
      "name": "admin",
      "id": "3b54b06dbe38475c8372b98b55259c06"
    }
  }
}
```

Tất cả API endpoints yêu cầu header:
```
Authorization: Bearer <jwt-token>
```

## 🛠️ Phát triển

### Cấu trúc thư mục
```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   └── auth.service.ts
├── object-storage/            # Object storage controller
│   ├── object-storage.controller.ts
│   ├── object-storage.module.ts
│   └── dto/
│       └── object-storage.dto.ts
└── swift/                     # Swift service layer
    ├── swift.module.ts
    ├── swift.service.ts
    ├── dto/
    │   └── swift-config.dto.ts
    └── schemas/
        └── swift-config.schema.ts
```

### Commands hữu ích

```bash
# Build project
npm run build

# Start development server
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## 📚 Tài liệu tham khảo

- [OpenStack Swift API Documentation](https://docs.openstack.org/swift/latest/api/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
