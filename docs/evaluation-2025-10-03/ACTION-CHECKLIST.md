# ✅ قائمة المهام - Action Checklist
## مهام قابلة للتنفيذ المباشر

**التاريخ:** 2025-10-03  
**الهدف:** إكمال المرحلة 1 بنسبة 100%

---

## 🎯 نظرة سريعة

```
المكتمل:  ████████░░  65%
المتبقي:   ░░░░░░████  35%
المدة:     12-14 ساعة
```

---

## 📋 المهام - مرتبة حسب الأولوية

### 🔴 مهام حرجة (اليوم - غداً)

#### ✅ المهمة 1: تنظيف Git (30 دقيقة)

```bash
# الخطوة 1: حذف ملفات backup
cd F:\_Alsaada_Telegram_Bot\TelegramBotTemplate
git rm -r backups/
git rm src/services/database.service.js.bak

# الخطوة 2: تحديث .gitignore
echo "" >> .gitignore
echo "# Backup files" >> .gitignore
echo "backups/" >> .gitignore
echo "*.bak" >> .gitignore
echo "*.backup" >> .gitignore
echo "*~" >> .gitignore

# الخطوة 3: Commit
git add .gitignore
git commit -m "chore: remove backup files and update gitignore"
git push origin main
```

**معايير الإنجاز:**
- [ ] لا يوجد backups/ في Git
- [ ] لا يوجد *.bak في Git
- [ ] .gitignore محدّث
- [ ] تم الـ push بنجاح

---

#### ✅ المهمة 2: إنشاء البنية الأساسية للاختبارات (1 ساعة)

```bash
# الخطوة 1: إنشاء المجلدات
mkdir -p tests/unit/utils
mkdir -p tests/unit/services
mkdir -p tests/integration
mkdir -p tests/e2e

# الخطوة 2: إنشاء jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/bot.js'
  ],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/tests/e2e/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  testTimeout: 10000
};
EOF

# الخطوة 3: تحديث package.json scripts
# أضف أو عدّل:
# "test": "jest",
# "test:watch": "jest --watch",
# "test:coverage": "jest --coverage",
# "test:unit": "jest tests/unit",
# "test:integration": "jest tests/integration",
# "test:e2e": "jest tests/e2e"
```

**معايير الإنجاز:**
- [ ] مجلدات الاختبارات موجودة
- [ ] jest.config.js موجود
- [ ] package.json محدّث
- [ ] `npm test` يعمل (حتى بدون tests)

---

#### ✅ المهمة 3: كتابة Unit Tests (6 ساعات)

##### 3.1 Validators Tests (1.5 ساعة)

```javascript
// tests/unit/utils/validators.test.js
const {
  validateEmail,
  validatePhone,
  validateArabicText,
  validateNumber,
  validateDate,
  validateURL,
  validateUsername,
  validatePassword
} = require('../../../src/utils/validators.util');

describe('Validators Utility - Email', () => {
  test('should validate correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid email', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
  });

  test('should reject email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
  });
});

describe('Validators Utility - Phone', () => {
  test('should validate Egyptian phone', () => {
    const result = validatePhone('+201234567890');
    expect(result.isValid).toBe(true);
  });

  test('should validate phone with Arabic numbers', () => {
    const result = validatePhone('٠١٢٣٤٥٦٧٨٩٠');
    expect(result.isValid).toBe(true);
  });

  test('should reject short phone', () => {
    const result = validatePhone('123');
    expect(result.isValid).toBe(false);
  });
});

describe('Validators Utility - Arabic Text', () => {
  test('should validate Arabic text', () => {
    const result = validateArabicText('مرحبا بك');
    expect(result.isValid).toBe(true);
  });

  test('should reject English text', () => {
    const result = validateArabicText('Hello World');
    expect(result.isValid).toBe(false);
  });
});

// ... أضف 7 tests إضافية للدوال الأخرى
```

**معايير الإنجاز:**
- [ ] 10+ tests للـ validators
- [ ] جميع الـ tests تنجح
- [ ] Coverage > 80% للـ validators.util.js

---

##### 3.2 Formatters Tests (1.5 ساعة)

```javascript
// tests/unit/utils/formatters.test.js
const {
  formatDate,
  formatTime,
  formatFileSize,
  formatCurrency,
  truncateText,
  pluralize
} = require('../../../src/utils/formatters.util');

describe('Formatters Utility - Date', () => {
  test('should format date in Arabic', () => {
    const date = new Date('2025-10-03');
    const result = formatDate(date, 'ar');
    expect(result).toContain('2025');
  });

  test('should format date with custom format', () => {
    const date = new Date('2025-10-03');
    const result = formatDate(date, 'ar', 'dd/MM/yyyy');
    expect(result).toBe('03/10/2025');
  });
});

describe('Formatters Utility - File Size', () => {
  test('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  test('should format KB', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
  });

  test('should format MB', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });
});

// ... أضف 7 tests إضافية
```

**معايير الإنجاز:**
- [ ] 10+ tests للـ formatters
- [ ] جميع الـ tests تنجح
- [ ] Coverage > 80%

---

##### 3.3 Helpers Tests (1.5 ساعة)

```javascript
// tests/unit/utils/helpers.test.js
const {
  generateId,
  sleep,
  retry,
  sanitizeInput,
  deepClone,
  isEmpty
} = require('../../../src/utils/helpers.util');

describe('Helpers Utility - generateId', () => {
  test('should generate unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  test('should generate ID with prefix', () => {
    const id = generateId('user');
    expect(id).toContain('user');
  });
});

describe('Helpers Utility - sleep', () => {
  test('should sleep for specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });
});

// ... أضف 6 tests إضافية
```

**معايير الإنجاز:**
- [ ] 8+ tests للـ helpers
- [ ] جميع الـ tests تنجح
- [ ] Coverage > 80%

---

##### 3.4 Cache Service Tests (1.5 ساعة)

```javascript
// tests/unit/services/cache.service.test.js
const cacheService = require('../../../src/services/cache.service');

describe('Cache Service - Basic Operations', () => {
  beforeEach(() => {
    cacheService.clearAll();
  });

  test('should set and get value', () => {
    cacheService.set('test', 'key1', 'value1');
    const result = cacheService.get('test', 'key1');
    expect(result).toBe('value1');
  });

  test('should return undefined for missing key', () => {
    const result = cacheService.get('test', 'missing');
    expect(result).toBeUndefined();
  });

  test('should delete key', () => {
    cacheService.set('test', 'key1', 'value1');
    cacheService.delete('test', 'key1');
    const result = cacheService.get('test', 'key1');
    expect(result).toBeUndefined();
  });
});

// ... أضف 5 tests إضافية
```

**معايير الإنجاز:**
- [ ] 8+ tests للـ cache
- [ ] جميع الـ tests تنجح
- [ ] Coverage > 70%

---

#### ✅ المهمة 4: كتابة Integration Tests (3 ساعات)

##### 4.1 Database + Cache Integration (1.5 ساعة)

```javascript
// tests/integration/database-cache.test.js
const dbService = require('../../src/services/database.service');
const cacheService = require('../../src/services/cache.service');

describe('Database + Cache Integration', () => {
  beforeAll(async () => {
    await dbService.initialize();
  });

  afterAll(async () => {
    await dbService.close();
  });

  beforeEach(() => {
    cacheService.clearAll();
  });

  test('should cache user after database fetch', async () => {
    const testUser = {
      telegram_id: 123456789,
      username: 'testuser',
      first_name: 'Test',
      role: 'user'
    };

    // Create user in DB
    await dbService.createUser(testUser);

    // Fetch (should cache automatically)
    const user1 = await dbService.getUserByTelegramId(123456789);
    
    // Check cache
    const cached = cacheService.get('users', `user:123456789`);
    
    expect(cached).toBeDefined();
    expect(cached.username).toBe('testuser');
    
    // Cleanup
    await dbService.deleteUser(123456789);
  });

  // ... أضف 4 tests إضافية
});
```

**معايير الإنجاز:**
- [ ] 5+ integration tests
- [ ] جميع الـ tests تنجح
- [ ] تنظيف البيانات بعد كل test

---

##### 4.2 Auth + Permission Integration (1.5 ساعة)

```javascript
// tests/integration/auth-permission.test.js
const permissionService = require('../../src/services/permission.service');
const dbService = require('../../src/services/database.service');

describe('Auth + Permission Integration', () => {
  beforeAll(async () => {
    await dbService.initialize();
  });

  test('should check permission for user', async () => {
    // Create test user
    await dbService.createUser({
      telegram_id: 111,
      username: 'admin_user',
      role: 'admin'
    });

    // Check permission
    const hasAccess = await permissionService.checkAccess(111, 'users.view');
    
    expect(hasAccess).toBe(true);
    
    // Cleanup
    await dbService.deleteUser(111);
  });

  // ... أضف 5 tests إضافية
});
```

**معايير الإنجاز:**
- [ ] 6+ integration tests
- [ ] جميع الـ tests تنجح

---

#### ✅ المهمة 5: إضافة الملفات الناقصة (1.5 ساعة)

##### 5.1 CONTRIBUTING.md (30 دقيقة)

```bash
cat > CONTRIBUTING.md << 'EOF'
# 🤝 دليل المساهمة

## مرحباً بك

شكراً لاهتمامك بالمساهمة.

## البدء

1. Fork المشروع
2. Clone: `git clone https://github.com/YOUR_USERNAME/TelegramBotTemplate.git`
3. Install: `npm install`
4. Branch: `git checkout -b feature/new-feature`

## معايير الكود

- التزم بـ ESLint
- اكتب tests
- أضف JSDoc
- اتبع [Naming Conventions](docs/05-Naming-Conventions.md)

## Commit Messages

```
feat(scope): وصف الميزة
fix(scope): وصف الإصلاح
docs: تحديث توثيق
test: إضافة اختبارات
```

## الاختبارات

```bash
npm test              # جميع الاختبارات
npm run test:unit     # unit tests
npm run lint          # فحص الكود
```

## Pull Request

1. تأكد أن tests تنجح
2. حدّث التوثيق
3. افتح PR على `develop`
4. انتظر المراجعة

شكراً! 🎉
EOF
```

**معايير الإنجاز:**
- [ ] CONTRIBUTING.md موجود
- [ ] يحتوي على جميع الأقسام المهمة

---

##### 5.2 LICENSE (5 دقائق)

```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Alsaada

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

**معايير الإنجاز:**
- [ ] LICENSE موجود
- [ ] MIT License صحيح

---

##### 5.3 Dockerfile (15 دقيقة)

```bash
cat > Dockerfile << 'EOF'
FROM node:18-alpine

LABEL maintainer="Alsaada"
LABEL version="1.0"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create data directories
RUN mkdir -p data/database data/logs data/cache data/backups

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('OK')" || exit 1

# Expose port (optional - for health endpoint)
EXPOSE 3000

# Run bot
CMD ["node", "src/bot.js"]
EOF
```

**معايير الإنجاز:**
- [ ] Dockerfile موجود
- [ ] يبني بنجاح: `docker build -t telegram-bot .`

---

##### 5.4 docker-compose.yml (10 دقيقة)

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
    networks:
      - bot-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  bot-network:
    driver: bridge
EOF
```

**معايير الإنجاز:**
- [ ] docker-compose.yml موجود
- [ ] يعمل: `docker-compose up -d`

---

##### 5.5 GitHub Actions (30 دقيقة)

```bash
mkdir -p .github/workflows
cat > .github/workflows/tests.yml << 'EOF'
name: Tests & Lint

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint || echo "No lint configured"
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: false
EOF
```

**معايير الإنجاز:**
- [ ] .github/workflows/tests.yml موجود
- [ ] يعمل عند الـ push

---

#### ✅ المهمة 6: Commit النهائي (15 دقيقة)

```bash
# إضافة جميع الملفات الجديدة
git add jest.config.js
git add tests/
git add CONTRIBUTING.md
git add LICENSE
git add Dockerfile
git add docker-compose.yml
git add .github/

# Commit
git commit -m "test: add comprehensive test suite and missing project files

- Add 82+ tests (unit/integration/e2e)
- Add jest configuration
- Add CONTRIBUTING.md
- Add LICENSE (MIT)
- Add Dockerfile and docker-compose.yml
- Add GitHub Actions for CI/CD
- Coverage target: 60%+

Phase 1.10 complete ✅"

# Push
git push origin main
```

**معايير الإنجاز:**
- [ ] جميع الملفات في Git
- [ ] Commit message واضح
- [ ] Push ناجح

---

## 📊 قائمة التحقق النهائية

### قبل إغلاق المهام:

```
□ Git نظيف (لا backups)
□ 82+ test مكتوب وناجح
□ Coverage > 60%
□ CONTRIBUTING.md موجود
□ LICENSE موجود
□ Dockerfile يعمل
□ docker-compose يعمل
□ GitHub Actions يعمل
□ جميع الملفات في Git
□ CHANGELOG محدّث
```

---

## 🎯 النتيجة المتوقعة

```
✅ المرحلة 1 مكتملة 100%
✅ التقييم: 85/100 ⭐⭐⭐⭐⭐
✅ جاهز للمرحلة 2
```

---

## ⏱️ التوقيت

| اليوم | المهام | المدة |
|-------|---------|-------|
| **اليوم 1** | تنظيف Git + بنية Tests | 1.5 ساعة |
| **اليوم 2** | Unit Tests | 6 ساعات |
| **اليوم 3** | Integration Tests | 3 ساعات |
| **اليوم 4** | الملفات الناقصة + Commit | 2 ساعة |
| **الإجمالي** | | **12.5 ساعة** |

---

## 💡 نصائح

1. ✅ نفّذ المهام بالترتيب
2. ✅ لا تتخطى الاختبارات
3. ✅ Commit بعد كل مهمة رئيسية
4. ✅ راجع النتائج قبل المتابعة
5. ✅ اطلب المساعدة عند الحاجة

---

**أُنشئ:** 2025-10-03  
**الحالة:** ⏳ جاهز للتنفيذ الفوري  
**الأولوية:** 🔴 حرجة

---

*🚀 ابدأ الآن - كل مهمة صغيرة خطوة للأمام!*
