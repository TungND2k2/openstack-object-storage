# OpenStack Swift Object Storage API Test Endpoints

## Mẫu JWT Token với OpenStack token
```json
{
  "sub": "x5yRDrCHIkLoMWyvZGSUcw==.1Cwp/5n8T8EfAu0FzNdtW...",
  "iat": 1750236058,
  "exp": 1750239658,
  "iss": "x-or.cloud",
  "token": "gAAAAABoUn0jftHulNjn9wXc_ys7xp6UHFEGEiuRiAx9dfwcTSM0Oen1q_XvXFhMGJ1jPxhvdThiKK5CKkyofHPbmTMvWAnLHClzBfQUXZP8g5NuodwGeeJEL0_hOMgu5HbpcBD7r-0AO1bx2Q2RNHbCKYvEfs2gn81kV83Hzh38uviMno2fOAw",
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

## 1. Swift Configuration Management

### Create Swift Configuration
```bash
POST http://localhost:3000/api/v1/swift/config
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

### Get All Configurations
```bash
GET http://localhost:3000/api/v1/swift/config
```

### Get Active Configuration
```bash
GET http://localhost:3000/api/v1/swift/config/active/current
```

### Update Configuration
```bash
PUT http://localhost:3000/api/v1/swift/config/{config_id}
Content-Type: application/json

{
  "description": "Updated production Swift cluster",
  "isActive": true
}
```

## 2. Object Storage Operations

### Upload Object
```bash
POST http://localhost:3000/api/v1/objects/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Form data:
- file: [binary file]
- container: "my-container"
- objectName: "test-file.jpg"
- contentType: "image/jpeg"
- metadata: {"author": "user1", "project": "demo"}
```

### Download Object
```bash
GET http://localhost:3000/api/v1/objects/download/my-container/test-file.jpg
Authorization: Bearer {jwt_token}
```

### Get Object Info
```bash
GET http://localhost:3000/api/v1/objects/info/my-container/test-file.jpg
Authorization: Bearer {jwt_token}
```

### Delete Object
```bash
DELETE http://localhost:3000/api/v1/objects/my-container/test-file.jpg
Authorization: Bearer {jwt_token}
```

### List Objects in Container
```bash
GET http://localhost:3000/api/v1/objects/list/my-container?prefix=folder/&limit=100
Authorization: Bearer {jwt_token}
```

## 3. Container Management

### Create Container
```bash
POST http://localhost:3000/api/v1/objects/containers
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "my-new-container",
  "isPublic": false
}
```

### List Containers
```bash
GET http://localhost:3000/api/v1/objects/containers
Authorization: Bearer {jwt_token}
```

## 4. Temporary URL Generation

### Generate Temporary URL
```bash
POST http://localhost:3000/api/v1/objects/temp-url
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "container": "my-container",
  "objectName": "test-file.jpg",
  "expiresInSeconds": 3600,
  "method": "GET"
}
```

## 5. Health Check

### Check Swift Connection
```bash
GET http://localhost:3000/api/v1/objects/health
Authorization: Bearer {jwt_token}
```

## Testing với cURL

### 1. Tạo Swift Configuration
```bash
curl -X POST http://localhost:3000/api/v1/swift/config \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-swift",
    "authUrl": "http://keystone:5000",
    "storageUrl": "http://swift:8080",
    "username": "swift_user",
    "password": "swift_password",
    "tenantName": "swift_tenant",
    "isActive": true,
    "description": "Test Swift configuration"
  }'
```

### 2. Upload File
```bash
curl -X POST http://localhost:3000/api/v1/objects/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg" \
  -F "container=test-container" \
  -F "objectName=my-test-file.jpg" \
  -F "contentType=image/jpeg"
```

### 3. Download File
```bash
curl -X GET http://localhost:3000/api/v1/objects/download/test-container/my-test-file.jpg \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded-file.jpg
```

### 4. Create Container
```bash
curl -X POST http://localhost:3000/api/v1/objects/containers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-test-container",
    "isPublic": false
  }'
```

### 5. List Objects
```bash
curl -X GET "http://localhost:3000/api/v1/objects/list/test-container?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Examples

### Successful Upload Response
```json
{
  "message": "Object uploaded successfully",
  "data": {
    "container": "test-container",
    "objectName": "my-test-file.jpg",
    "size": 1024000,
    "contentType": "image/jpeg",
    "etag": "d41d8cd98f00b204e9800998ecf8427e",
    "url": "http://swift:8080/v1/AUTH_swift_tenant/test-container/my-test-file.jpg"
  }
}
```

### List Objects Response
```json
{
  "message": "Objects retrieved successfully",
  "data": {
    "container": "test-container",
    "count": 2,
    "objects": [
      {
        "name": "my-test-file.jpg",
        "bytes": 1024000,
        "lastModified": "2025-07-31T10:30:00.000Z",
        "contentType": "image/jpeg",
        "hash": "d41d8cd98f00b204e9800998ecf8427e"
      }
    ]
  }
}
```

## Error Responses

### Authentication Error
```json
{
  "statusCode": 401,
  "message": "Invalid authorization header",
  "error": "Unauthorized"
}
```

### Object Not Found
```json
{
  "statusCode": 404,
  "message": "Object not found: test-container/nonexistent-file.jpg",
  "error": "Not Found"
}
```
