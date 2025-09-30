# 🏗️ المعمارية التفصيلية - System Architecture
# Professional Telegram Bot Template - Detailed Architecture

**Project:** Telegram Bot Template  
**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Document Status:** ✅ Approved

---

## 📐 نظرة عامة على المعمارية

### الأنماط المعمارية المستخدمة:
- **Layered Architecture** (معمارية الطبقات)
- **Adapter Pattern** (نمط المحول)
- **Strategy Pattern** (نمط الاستراتيجية)
- **Factory Pattern** (نمط المصنع)
- **Middleware Pattern** (نمط الوسيط)
- **Observer Pattern** (نمط المراقب)

---

## 🎯 الطبقات الرئيسية

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│              (Telegram Bot Interface)                        │
│  • Commands Handlers                                         │
│  • Keyboards (Main & Inline)                                │
│  • Message Templates                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    Middleware Layer                          │
│  • Authentication • Logging • Error Handling                │
│  • Caching • Rate Limiting • i18n                           │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  • Services (Database, Cache, Permissions, etc.)            │
│  • Core Engine (Workflow, Sections, Adapters)               │
│  • Utilities (Validators, Formatters, Helpers)              │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                        │
│  • Database Adapters (SQLite, Google Sheets)                │
│  • Models (User, Section, Log)                              │
│  • File System Access                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                      Data Storage                            │
│  • SQLite Database • Google Sheets • File System            │
│  • Cache (Memory) • Logs (Files)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 هيكل المشروع التفصيلي

```
TelegramBotTemplate/
│
├── 📁 config/                          # إعدادات المشروع
│   ├── bot.config.js                   # إعدادات البوت
│   ├── database.config.js              # إعدادات قاعدة البيانات
│   ├── permissions.config.js           # الأدوار والصلاحيات
│   ├── cache.config.js                 # إعدادات الكاش
│   └── logger.config.js                # إعدادات اللوج
│
├── 📁 src/                             # الكود المصدري
│   │
│   ├── 📄 bot.js                       # نقطة البداية الرئيسية
│   │
│   ├── 📁 core/                        # النواة الأساسية
│   │   ├── database-adapter.core.js    # الواجهة الموحدة للـ DB
│   │   ├── workflow-engine.core.js     # محرك سير العمل
│   │   ├── section-loader.core.js      # محمل الأقسام الديناميكي
│   │   ├── permission-manager.core.js  # مدير الصلاحيات
│   │   └── 📁 steps/                   # معالجات خطوات Workflow
│   │       ├── input-step.handler.js
│   │       ├── number-step.handler.js
│   │       ├── select-step.handler.js
│   │       ├── file-step.handler.js
│   │       └── confirm-step.handler.js
│   │
│   ├── 📁 adapters/                    # محولات قواعد البيانات
│   │   ├── sqlite.adapter.js           # محول SQLite
│   │   └── sheets.adapter.js           # محول Google Sheets
│   │
│   ├── 📁 middleware/                  # الوسائط (Middleware)
│   │   ├── auth.middleware.js          # التحقق من الصلاحيات
│   │   ├── logger.middleware.js        # تسجيل الأحداث
│   │   ├── error.middleware.js         # معالجة الأخطاء
│   │   ├── cache.middleware.js         # إدارة الكاش
│   │   ├── rate-limit.middleware.js    # الحد من الطلبات
│   │   └── i18n.middleware.js          # معالجة الأرقام العربية
│   │
│   ├── 📁 handlers/                    # معالجات الأوامر
│   │   ├── start.handler.js            # أمر البدء
│   │   ├── help.handler.js             # أمر المساعدة
│   │   ├── admin.handler.js            # أوامر المشرف
│   │   ├── user.handler.js             # أوامر المستخدم
│   │   ├── system.handler.js           # أوامر النظام
│   │   ├── sections.handler.js         # معالج الأقسام
│   │   └── workflow.handler.js         # معالج Workflows
│   │
│   ├── 📁 services/                    # خدمات الأعمال
│   │   ├── database.service.js         # خدمة قاعدة البيانات
│   │   ├── google-sheets.service.js    # خدمة Google Sheets
│   │   ├── cache.service.js            # خدمة الكاش
│   │   ├── excel.service.js            # خدمة Excel
│   │   ├── file.service.js             # خدمة الملفات
│   │   ├── permission.service.js       # خدمة الصلاحيات
│   │   ├── notification.service.js     # خدمة الإشعارات
│   │   ├── backup.service.js           # خدمة النسخ الاحتياطي
│   │   └── sync.service.js             # خدمة المزامنة
│   │
│   ├── 📁 utils/                       # الأدوات المساعدة
│   │   ├── logger.util.js              # أداة اللوج
│   │   ├── error-handler.util.js       # معالج الأخطاء
│   │   ├── validators.util.js          # أدوات التحقق
│   │   ├── formatters.util.js          # أدوات التنسيق
│   │   ├── arabic-numbers.util.js      # معالج الأرقام العربية
│   │   └── helpers.util.js             # أدوات عامة
│   │
│   ├── 📁 keyboards/                   # لوحات المفاتيح
│   │   ├── main.keyboard.js            # لوحات رئيسية
│   │   ├── inline.keyboard.js          # أزرار داخلية
│   │   └── keyboard-builder.js         # بناء ديناميكي
│   │
│   └── 📁 models/                      # نماذج البيانات
│       ├── user.model.js               # نموذج المستخدم
│       ├── section.model.js            # نموذج القسم
│       └── log.model.js                # نموذج السجل
│
├── 📁 data/                            # البيانات
│   ├── 📁 database/                    # قاعدة بيانات SQLite
│   │   └── bot.db
│   ├── 📁 cache/                       # ملفات الكاش
│   ├── 📁 logs/                        # ملفات اللوج
│   │   ├── error.log
│   │   ├── combined.log
│   │   └── access.log
│   └── 📁 backups/                     # النسخ الاحتياطية
│
├── 📁 sections/                        # تعريفات الأقسام (JSON)
│   ├── main-sections.json              # الأقسام الرئيسية
│   └── 📁 definitions/                 # تعريفات مفصلة
│       ├── sales.section.json
│       ├── customers.section.json
│       ├── inventory.section.json
│       └── reports.section.json
│
├── 📁 workflows/                       # تعريفات سير العمل (JSON)
│   ├── add-customer.workflow.json
│   ├── add-sale.workflow.json
│   ├── add-product.workflow.json
│   └── generate-report.workflow.json
│
├── 📁 templates/                       # القوالب
│   ├── messages.json                   # قوالب الرسائل
│   ├── keyboards.json                  # قوالب لوحات المفاتيح
│   └── 📁 sheets/                      # قوالب Google Sheets
│       ├── customers.template.json
│       ├── sales.template.json
│       └── users.template.json
│
├── 📁 uploads/                         # المرفقات المؤقتة
│
├── 📁 scripts/                         # سكربتات مساعدة
│   ├── setup.script.js                 # الإعداد الأولي
│   ├── create-workflow.script.js       # إنشاء workflow
│   ├── create-section.script.js        # إنشاء قسم
│   └── sync-db.script.js               # مزامنة القواعد
│
├── 📁 docs/                            # التوثيق
│   ├── 01-Requirements.md
│   ├── 02-Implementation-Steps.md
│   ├── 03-Progress-Tracker.md
│   ├── 04-Architecture.md
│   ├── 05-Naming-Conventions.md
│   └── 06-Testing-Guide.md
│
├── 📁 tests/                           # الاختبارات (اختياري)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── 📄 .env                             # المتغيرات البيئية
├── 📄 .env.example                     # مثال المتغيرات
├── 📄 .gitignore                       # ملفات Git المستبعدة
├── 📄 package.json                     # إعدادات npm
├── 📄 package-lock.json
└── 📄 README.md                        # دليل المشروع
```

---

## 🔄 تدفق البيانات (Data Flow)

### 1. تدفق الأمر العادي

```
User Input (Telegram)
      ↓
Telegraf Bot Receives Message
      ↓
Logger Middleware (log request)
      ↓
Auth Middleware (check permissions)
      ↓
Rate Limit Middleware (check limits)
      ↓
i18n Middleware (normalize Arabic numbers)
      ↓
Command Handler (process command)
      ↓
Cache Check (get from cache if exists)
      ↓
Service Layer (business logic)
      ↓
Database Adapter (unified interface)
      ↓
SQLite / Google Sheets (data storage)
      ↓
Response Formatting (Arabic numbers, templates)
      ↓
Send to User (Telegram)
      ↓
Logger Middleware (log response)
```

---

### 2. تدفق Workflow

```
User Starts Workflow
      ↓
Workflow Engine Loads Definition (JSON)
      ↓
Initialize Conversation State (cache)
      ↓
┌─────────────────────────┐
│   For Each Step:        │
│   ↓                     │
│   Display Question      │
│   ↓                     │
│   Wait for User Input   │
│   ↓                     │
│   Validate Input        │
│   ↓                     │
│   Transform Data        │
│   ↓                     │
│   Save to State         │
│   ↓                     │
│   Next Step?            │
└─────────────────────────┘
      ↓
All Steps Completed
      ↓
Execute onComplete Action
      ↓
Save to Database
      ↓
Send Notification
      ↓
Clear State
      ↓
Return to Menu
```

---

### 3. تدفق المزامنة

```
Sync Trigger (Manual / Auto)
      ↓
Sync Service Activated
      ↓
┌────────────────────────────┐
│  SQLite → Google Sheets:   │
│  1. Get changed records    │
│  2. Format data            │
│  3. Update sheets          │
│  4. Mark as synced         │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│  Google Sheets → SQLite:   │
│  1. Get sheet data         │
│  2. Compare with SQLite    │
│  3. Resolve conflicts      │
│  4. Update SQLite          │
└────────────────────────────┘
      ↓
Log Sync Status
      ↓
Update Cache
      ↓
Notify Admin (if errors)
```

---

## 🔌 نمط Adapter (محول قاعدة البيانات)

### الواجهة الموحدة (Unified Interface)

```javascript
// src/core/database-adapter.core.js

class DatabaseAdapter {
  // CRUD Operations
  async create(table, data) {}
  async read(table, id) {}
  async update(table, id, data) {}
  async delete(table, id) {}
  
  // Query Operations
  async find(table, query) {}
  async findOne(table, query) {}
  async count(table, query) {}
  
  // Connection
  async connect() {}
  async disconnect() {}
  
  // Transaction
  async beginTransaction() {}
  async commit() {}
  async rollback() {}
}
```

### المحولات المحددة

```javascript
// src/adapters/sqlite.adapter.js
class SQLiteAdapter extends DatabaseAdapter {
  // تطبيق محدد لـ SQLite
}

// src/adapters/sheets.adapter.js
class GoogleSheetsAdapter extends DatabaseAdapter {
  // تطبيق محدد لـ Google Sheets
}
```

### الاستخدام

```javascript
// يمكن التبديل بسهولة
const adapter = config.DB_MODE === 'sqlite' 
  ? new SQLiteAdapter() 
  : new GoogleSheetsAdapter();

// نفس الواجهة للجميع
await adapter.create('users', userData);
```

---

## ⚙️ نمط Middleware (الوسيط)

### سلسلة Middleware

```javascript
bot.use(loggerMiddleware);      // 1. تسجيل الطلب
bot.use(authMiddleware);        // 2. التحقق من الصلاحيات
bot.use(rateLimitMiddleware);   // 3. الحد من الطلبات
bot.use(i18nMiddleware);        // 4. معالجة الأرقام
bot.use(cacheMiddleware);       // 5. التحقق من الكاش
// Command Handlers...
bot.use(errorMiddleware);       // 6. معالجة الأخطاء
```

### مثال: Auth Middleware

```javascript
// src/middleware/auth.middleware.js

async function authMiddleware(ctx, next) {
  const userId = ctx.from.id;
  
  // Get user from cache or database
  let user = await cacheService.get(`user:${userId}`);
  
  if (!user) {
    user = await databaseService.getUser(userId);
    await cacheService.set(`user:${userId}`, user);
  }
  
  // Attach to context
  ctx.user = user;
  
  // Check if command requires permission
  const command = ctx.message?.text?.split(' ')[0];
  const requiredPermission = getRequiredPermission(command);
  
  if (requiredPermission) {
    const hasPermission = await permissionService.checkPermission(
      userId, 
      requiredPermission
    );
    
    if (!hasPermission) {
      await ctx.reply('⛔ ليس لديك صلاحية لهذا الإجراء');
      return; // Stop execution
    }
  }
  
  // Continue to next middleware
  await next();
}
```

---

## 🏭 نمط Factory (المصنع)

### Workflow Step Factory

```javascript
// src/core/workflow-engine.core.js

class WorkflowStepFactory {
  static createStep(stepDefinition) {
    switch (stepDefinition.type) {
      case 'input':
        return new InputStepHandler(stepDefinition);
      case 'number':
        return new NumberStepHandler(stepDefinition);
      case 'select':
        return new SelectStepHandler(stepDefinition);
      case 'file':
        return new FileStepHandler(stepDefinition);
      case 'confirm':
        return new ConfirmStepHandler(stepDefinition);
      default:
        throw new Error(`Unknown step type: ${stepDefinition.type}`);
    }
  }
}

// الاستخدام
const step = WorkflowStepFactory.createStep(stepDef);
await step.execute(ctx);
```

---

## 💾 نمط Strategy (الاستراتيجية)

### استراتيجيات قاعدة البيانات

```javascript
// config/database.config.js

const strategies = {
  sqlite: {
    adapter: 'SQLiteAdapter',
    config: { path: './data/database/bot.db' }
  },
  
  sheets: {
    adapter: 'GoogleSheetsAdapter',
    config: { spreadsheetId: 'xxx' }
  },
  
  hybrid: {
    primary: 'sqlite',
    secondary: 'sheets',
    syncInterval: 300000 // 5 minutes
  }
};

// تحميل الاستراتيجية
const strategy = strategies[process.env.DB_MODE];
```

---

## 🔍 نمط Observer (المراقب)

### نظام الإشعارات

```javascript
// src/services/notification.service.js

class NotificationService {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify(event, data) {
    this.observers.forEach(observer => {
      observer.update(event, data);
    });
  }
}

// المراقبون
class AdminNotifier {
  update(event, data) {
    if (event === 'error') {
      // إرسال للمشرفين
    }
  }
}

class LoggerNotifier {
  update(event, data) {
    // تسجيل في اللوج
  }
}

// الاستخدام
notificationService.subscribe(new AdminNotifier());
notificationService.subscribe(new LoggerNotifier());
notificationService.notify('error', errorData);
```

---

## 🗄️ معمارية قاعدة البيانات

### SQLite Schema

```sql
-- users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME,
  metadata TEXT -- JSON
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- sections table
CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT 1,
  permissions TEXT, -- JSON
  handler TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (parent_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE INDEX idx_sections_parent_id ON sections(parent_id);
CREATE INDEX idx_sections_enabled ON sections(enabled);
CREATE INDEX idx_sections_order ON sections(order_index);

-- logs table
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id INTEGER,
  action TEXT,
  metadata TEXT, -- JSON
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);

-- settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- conversation_states table (for workflows)
CREATE TABLE conversation_states (
  user_id INTEGER PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_conversation_states_workflow ON conversation_states(workflow_id);
```

---

## 🔐 معمارية الأمان

### طبقات الحماية

```
┌─────────────────────────────────────────┐
│  Layer 1: Input Validation              │
│  • Sanitize all user inputs            │
│  • Validate data types                 │
│  • Check length limits                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 2: Authentication                │
│  • Verify Telegram user ID             │
│  • Check user registration             │
│  • Validate session                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 3: Authorization                 │
│  • Check user role                     │
│  • Verify permissions                  │
│  • Validate access to resources        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 4: Rate Limiting                 │
│  • Track request frequency             │
│  • Block excessive requests            │
│  • Prevent abuse                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 5: Data Protection               │
│  • Encrypt sensitive data              │
│  • Secure file uploads                 │
│  • Safe database queries               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 6: Audit Logging                 │
│  • Log all actions                     │
│  • Track security events               │
│  • Monitor suspicious activity         │
└─────────────────────────────────────────┘
```

---

## 📊 معمارية الكاش

### استراتيجية الكاش متعددة المستويات

```
┌─────────────────────────────────────────┐
│  L1 Cache: Memory (node-cache)          │
│  • User sessions (15 min TTL)          │
│  • Active conversations (15 min)       │
│  • Frequently accessed settings        │
│  Size: ~50MB                            │
└─────────────────────────────────────────┘
              ↓ (Cache Miss)
┌─────────────────────────────────────────┐
│  L2 Cache: Database (SQLite)            │
│  • User data                            │
│  • Sections configuration              │
│  • System settings                     │
└─────────────────────────────────────────┘
              ↓ (Cache Miss)
┌─────────────────────────────────────────┐
│  L3 Source: Google Sheets (optional)    │
│  • Master data source                  │
│  • Sync on demand                      │
└─────────────────────────────────────────┘
```

### استراتيجية Cache Invalidation

```javascript
// Write-Through Cache
async function updateUser(userId, data) {
  // 1. Update database
  await database.update('users', userId, data);
  
  // 2. Update cache
  await cache.set(`user:${userId}`, data);
  
  // 3. Invalidate related caches
  await cache.delete(`user:${userId}:permissions`);
}

// Cache-Aside Pattern
async function getUser(userId) {
  // 1. Try cache first
  let user = await cache.get(`user:${userId}`);
  
  if (user) {
    return user; // Cache hit
  }
  
  // 2. Cache miss - get from DB
  user = await database.findOne('users', { telegram_id: userId });
  
  // 3. Store in cache
  await cache.set(`user:${userId}`, user, 3600);
  
  return user;
}
```

---

## 🔄 معمارية المزامنة

### نظام المزامنة الثنائي

```javascript
// src/services/sync.service.js

class SyncService {
  // SQLite → Google Sheets
  async syncToSheets() {
    const changes = await this.getChangedRecords();
    
    for (const change of changes) {
      switch (change.operation) {
        case 'INSERT':
          await sheetsAdapter.appendRow(change.table, change.data);
          break;
        case 'UPDATE':
          await sheetsAdapter.updateRow(change.table, change.id, change.data);
          break;
        case 'DELETE':
          await sheetsAdapter.deleteRow(change.table, change.id);
          break;
      }
      
      await this.markAsSynced(change.id);
    }
  }
  
  // Google Sheets → SQLite
  async syncFromSheets() {
    const tables = ['users', 'sections', 'settings'];
    
    for (const table of tables) {
      const sheetData = await sheetsAdapter.getAll(table);
      const dbData = await sqliteAdapter.getAll(table);
      
      const conflicts = this.detectConflicts(sheetData, dbData);
      
      for (const conflict of conflicts) {
        const resolved = await this.resolveConflict(conflict);
        await sqliteAdapter.update(table, conflict.id, resolved);
      }
    }
  }
  
  // حل التعارضات
  resolveConflict(conflict) {
    // استراتيجية: آخر تحديث يفوز
    return conflict.sheetTimestamp > conflict.dbTimestamp
      ? conflict.sheetData
      : conflict.dbData;
  }
}
```

---

## 📈 معمارية الأداء

### تحسينات الأداء

```javascript
// 1. Connection Pooling
const pool = new SQLitePool({
  max: 10,
  min: 2,
  acquireTimeout: 30000
});

// 2. Batch Operations
async function bulkInsert(table, records) {
  const transaction = await db.beginTransaction();
  
  try {
    for (const record of records) {
      await db.insert(table, record);
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// 3. Lazy Loading
class SectionLoader {
  async loadSection(id) {
    // Load only when needed
    if (!this.cache.has(id)) {
      const section = await db.findOne('sections', { id });
      this.cache.set(id, section);
    }
    return this.cache.get(id);
  }
}

// 4. Query Optimization
// Bad: N+1 queries
for (const user of users) {
  user.permissions = await getPermissions(user.id);
}

// Good: Single query with JOIN
const usersWithPermissions = await db.query(`
  SELECT u.*, p.permissions 
  FROM users u 
  LEFT JOIN permissions p ON u.id = p.user_id
`);
```

---

## 🧪 معمارية الاختبار

### هرم الاختبارات

```
        /\
       /  \      E2E Tests (5%)
      /────\     • Complete user flows
     /      \    • Real integrations
    /────────\   
   /          \  Integration Tests (15%)
  /────────────\ • API integration
 /              \• Database operations
/────────────────\
                  Unit Tests (80%)
                  • Functions
                  • Services
                  • Utilities
```

---

## 📝 ملخص المعمارية

### ✅ المزايا:
1. **قابلية التوسع**: إضافة ميزات جديدة بسهولة
2. **قابلية الصيانة**: كود منظم ومفصول
3. **قابلية الاختبار**: وحدات مستقلة قابلة للاختبار
4. **المرونة**: سهولة التبديل بين قواعد البيانات
5. **الأداء**: كاش متعدد المستويات
6. **الأمان**: طبقات حماية متعددة

### 🎯 الأنماط المطبقة:
- ✅ Layered Architecture
- ✅ Adapter Pattern
- ✅ Strategy Pattern
- ✅ Factory Pattern
- ✅ Middleware Pattern
- ✅ Observer Pattern
- ✅ Cache-Aside Pattern
- ✅ Repository Pattern

---

**تاريخ الإنشاء:** 2025-09-30  
**آخر تحديث:** 2025-09-30  
**الحالة:** ✅ معتمد

---

*هذا المستند يمثل المعمارية التفصيلية الكاملة للمشروع*
