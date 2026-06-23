# i18n Setup Guide

## Cấu hình i18n cho NestJS

Dự án này đã được cấu hình i18n sử dụng `i18next`.

### Tệp hỗ trợ

- **English (en)**: `src/i18n/locales/en.json`
- **Vietnamese (vi)**: `src/i18n/locales/vi.json`

### Cách sử dụng

#### 1. Trong Controllers

```typescript
import { Get } from '@nestjs/common';
import { I18n } from './i18n/i18n.decorator';
import i18next from 'i18next';

@Get()
getHello(@I18n() i18n: typeof i18next): object {
  return {
    message: i18n.t('welcome'),
    greeting: i18n.t('hello', { name: 'John' }),
  };
}
```

#### 2. Trong Services

```typescript
import { Injectable } from '@nestjs/common';
import { getI18n } from './i18n/i18n.config';

@Injectable()
export class AppService {
  getHello(): object {
    const i18n = getI18n();
    return {
      message: i18n.t('welcome'),
    };
  }
}
```

### Đổi ngôn ngữ

#### Header: `language`

```bash
# Tiếng Anh (mặc định)
curl http://localhost:3000

# Tiếng Việt
curl -H "language: vi" http://localhost:3000
```

#### Cookie: `i18next`

```bash
curl -H "Cookie: i18next=vi" http://localhost:3000
```

### Thêm ngôn ngữ mới

1. Tạo file `src/i18n/locales/[language].json`
2. Thêm translations
3. Cập nhật `i18n.config.ts` - thêm ngôn ngữ vào `preload` array:

```typescript
preload: ['en', 'vi', 'ja'], // Thêm 'ja' cho tiếng Nhật
```

### Cấu trúc translation file

```json
{
  "key": "value",
  "nested": {
    "key": "value"
  },
  "interpolation": "Hello {{name}}"
}
```

### Sử dụng với interpolation

```typescript
i18n.t('hello', { name: 'Alice' })
// Tiếng Anh: "Hello Alice"
// Tiếng Việt: "Xin chào Alice"
```

### Production

Locale files tự động được copy vào `dist/i18n/locales/` khi build nhờ cấu hình trong `nest-cli.json`.

