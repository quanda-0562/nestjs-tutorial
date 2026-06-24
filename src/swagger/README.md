# Swagger API Documentation

## Tài liệu Swagger

Swagger UI được setup tự động khi khởi động server.

### Truy cập

```bash
http://localhost:3000/api
```

### Cấu trúc

- **Title**: NestJS Tutorial API
- **Version**: 1.0.0
- **Base Path**: / (root)

### Endpoints

#### GET /
Lấy welcome message (hỗ trợ i18n)

**Query Parameters:**
- `name` (string, optional) - Tên để dùng trong greeting. Mặc định: "Developer"

**Headers:**
- `language` (string, optional) - Ngôn ngữ: "en" hoặc "vi". Mặc định: "en"

**Response (200):**
```json
{
  "message": "Welcome to NestJS",
  "greeting": "Hello Alice"
}
```

### Test API từ Swagger UI

1. Mở http://localhost:3000/api
2. Click vào GET / endpoint
3. Click "Try it out"
4. Nhập query parameter (tuỳ chọn)
5. Click "Execute"

### Decorators được sử dụng

- `@ApiTags()` - Nhóm API endpoints
- `@ApiOperation()` - Mô tả chi tiết endpoint
- `@ApiQuery()` - Khai báo query parameters
- `@ApiResponse()` - Khai báo response models
- `@ApiHeader()` - Khai báo headers (có thể thêm sau)

### Custom Headers trong Swagger

Để document header "language", thêm vào controller:

```typescript
import { ApiHeader } from '@nestjs/swagger';

@ApiHeader({
  name: 'language',
  description: 'Language for response (en, vi)',
  required: false,
  example: 'vi',
})
```
