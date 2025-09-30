# 📛 معايير التسمية - Naming Conventions
# Professional Telegram Bot Template - Naming Standards

**Project:** Telegram Bot Template  
**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Document Status:** ✅ Approved

---

## 🎯 القاعدة الذهبية

```
⭐ لا تكرار للأسماء في المشروع بأكمله!
⭐ كل ملف ومجلد له اسم فريد لا يتكرر!
⭐ الأسماء يجب أن تكون وصفية ومعبرة!
```

---

## 📁 تسمية الملفات (Files Naming)

### القاعدة الأساسية

```
Pattern: {function}.{type}.js

حيث:
• function: الوظيفة الأساسية للملف
• type: نوع الملف (service, handler, middleware, etc.)
• js: الامتداد
```

### ✅ أمثلة صحيحة

```javascript
// Services
database.service.js          ✅
google-sheets.service.js     ✅
cache.service.js             ✅
excel.service.js             ✅
file.service.js              ✅
permission.service.js        ✅
notification.service.js      ✅
backup.service.js            ✅
sync.service.js              ✅

// Handlers
start.handler.js             ✅
help.handler.js              ✅
admin.handler.js             ✅
user.handler.js              ✅
system.handler.js            ✅
sections.handler.js          ✅
workflow.handler.js          ✅

// Middleware
auth.middleware.js           ✅
logger.middleware.js         ✅
error.middleware.js          ✅
cache.middleware.js          ✅
rate-limit.middleware.js     ✅
i18n.middleware.js           ✅

// Utilities
logger.util.js               ✅
error-handler.util.js        ✅
validators.util.js           ✅
formatters.util.js           ✅
arabic-numbers.util.js       ✅
helpers.util.js              ✅

// Models
user.model.js                ✅
section.model.js             ✅
log.model.js                 ✅

// Keyboards
main.keyboard.js             ✅
inline.keyboard.js           ✅
keyboard-builder.js          ✅

// Adapters
sqlite.adapter.js            ✅
sheets.adapter.js            ✅

// Core
database-adapter.core.js     ✅
workflow-engine.core.js      ✅
section-loader.core.js       ✅
permission-manager.core.js   ✅

// Config
bot.config.js                ✅
database.config.js           ✅
permissions.config.js        ✅
cache.config.js              ✅
logger.config.js             ✅

// Scripts
setup.script.js              ✅
create-workflow.script.js    ✅
create-section.script.js     ✅
sync-db.script.js            ✅

// Steps
input-step.handler.js        ✅
number-step.handler.js       ✅
select-step.handler.js       ✅
file-step.handler.js         ✅
confirm-step.handler.js      ✅
```

### ❌ أمثلة خاطئة

```javascript
// ❌ عام جداً - غير مقبول
service.js                   ❌
handler.js                   ❌
middleware.js                ❌
util.js                      ❌
helper.js                    ❌

// ❌ بدون نوع - غير مقبول
database.js                  ❌
cache.js                     ❌
logger.js                    ❌

// ❌ غامض - غير مقبول
admin.js                     ❌
user.js                      ❌
system.js                    ❌

// ❌ تكرار الاسم - غير مقبول
users.service.js + users.handler.js    ❌ (تكرار "users")
db.service.js + db.adapter.js          ❌ (تكرار "db")
```

### 🔍 قاعدة التحقق من التكرار

قبل إنشاء ملف جديد، تحقق:
```bash
# البحث عن الاسم في المشروع
find . -name "*keyword*"

# مثال: البحث عن "user"
find . -name "*user*"

# النتائج:
# ./src/models/user.model.js       ✅ موجود
# ./src/handlers/user.handler.js   ✅ موجود
# ❌ لا يمكن إنشاء user.service.js (سيتكرر user)
# ✅ يمكن إنشاء user-profile.service.js (اسم مختلف)
```

---

## 📂 تسمية المجلدات (Folders Naming)

### القاعدة الأساسية

```
Pattern: {purpose}-{context}
أو
Pattern: {category}

• استخدم صيغة الجمع للمجلدات التي تحتوي على ملفات متعددة
• استخدم الشرطة (-) لفصل الكلمات
• استخدم أسماء وصفية
```

### ✅ أمثلة صحيحة

```
config/                      ✅ (إعدادات)
src/                         ✅ (الكود المصدري)
docs/                        ✅ (التوثيق)
data/                        ✅ (البيانات)
tests/                       ✅ (الاختبارات)
scripts/                     ✅ (السكربتات)
templates/                   ✅ (القوالب)
sections/                    ✅ (الأقسام)
workflows/                   ✅ (سير العمل)
uploads/                     ✅ (المرفقات)

// مجلدات فرعية مع سياق
core/                        ✅ (النواة)
adapters/                    ✅ (المحولات)
middleware/                  ✅ (الوسائط)
handlers/                    ✅ (المعالجات)
services/                    ✅ (الخدمات)
utils/                       ✅ (الأدوات)
keyboards/                   ✅ (لوحات المفاتيح)
models/                      ✅ (النماذج)

// مجلدات بسياق محدد
database-adapters/           ✅ (محولات قاعدة البيانات)
workflow-definitions/        ✅ (تعريفات سير العمل)
section-definitions/         ✅ (تعريفات الأقسام)
message-templates/           ✅ (قوالب الرسائل)
sheet-templates/             ✅ (قوالب الشيتات)
core-engine/                 ✅ (محرك النواة)
```

### ❌ أمثلة خاطئة

```
// ❌ عام جداً
files/                       ❌
stuff/                       ❌
misc/                        ❌
other/                       ❌

// ❌ اختصارات غير واضحة
cfg/                         ❌
srv/                         ❌
hdlr/                        ❌

// ❌ بدون سياق
new/                         ❌
temp/                        ❌
old/                         ❌
```

---

## 🔤 تسمية المتغيرات (Variables Naming)

### الثوابت (Constants)

```javascript
// UPPER_SNAKE_CASE

const DATABASE_CONFIG = {};               ✅
const MAX_FILE_SIZE = 5242880;            ✅
const API_TIMEOUT = 30000;                ✅
const CACHE_TTL = 3600;                   ✅
const LOG_LEVELS = {};                    ✅
const PERMISSIONS = {};                   ✅
const ROLES = {};                         ✅
const ERROR_MESSAGES = {};                ✅

// الثوابت المصدرة
export const DEFAULT_LANGUAGE = 'ar';     ✅
export const SUPPORTED_FILE_TYPES = [];   ✅
```

### المتغيرات العادية (Regular Variables)

```javascript
// camelCase

const userName = 'Ahmad';                 ✅
const userAge = 25;                       ✅
const isActive = true;                    ✅
const hasPermission = false;              ✅
const totalAmount = 1500;                 ✅
const createdAt = new Date();             ✅

// Arrays - صيغة الجمع
const users = [];                         ✅
const sections = [];                      ✅
const workflows = [];                     ✅
const permissions = [];                   ✅

// Objects - وصفي
const userProfile = {};                   ✅
const databaseConfig = {};                ✅
const cacheSettings = {};                 ✅

// Boolean - يبدأ بـ is/has/can/should
const isLoading = false;                  ✅
const hasAccess = true;                   ✅
const canEdit = false;                    ✅
const shouldSync = true;                  ✅
```

### المتغيرات الخاصة (Private Variables)

```javascript
// _camelCase (بادئة underscore)

const _internalCache = {};                ✅
const _privateKey = 'xxx';                ✅
const _tempData = null;                   ✅

class UserService {
  constructor() {
    this._connection = null;              ✅
    this._isInitialized = false;          ✅
  }
  
  _internalMethod() {}                    ✅
}
```

### دوال (Functions)

```javascript
// camelCase - فعل + مفعول

// ✅ أمثلة صحيحة
function getUserById(id) {}               ✅
function createNewUser(data) {}           ✅
function updateUserProfile(id, data) {}   ✅
function deleteUser(id) {}                ✅
function validateEmail(email) {}          ✅
function formatDate(date) {}              ✅
function sendNotification(message) {}     ✅
function checkPermission(userId, perm) {} ✅

// Boolean functions - يبدأ بـ is/has/can/should
function isValid(data) {}                 ✅
function hasAccess(userId) {}             ✅
function canEdit(userId, resource) {}     ✅
function shouldSync() {}                  ✅

// Async functions - نفس القواعد
async function fetchUserData(id) {}       ✅
async function saveToDatabase(data) {}    ✅
async function syncWithSheets() {}        ✅
```

---

## 🏛️ تسمية الفئات (Classes Naming)

### PascalCase

```javascript
// ✅ أمثلة صحيحة
class User {}                             ✅
class DatabaseAdapter {}                  ✅
class WorkflowEngine {}                   ✅
class SectionLoader {}                    ✅
class PermissionManager {}                ✅
class CacheService {}                     ✅
class GoogleSheetsService {}              ✅
class ExcelExporter {}                    ✅
class FileUploadHandler {}                ✅

// مع واصفات
class SQLiteAdapter {}                    ✅
class BaseController {}                   ✅
class AbstractAdapter {}                  ✅
class CustomError extends Error {}        ✅
```

---

## 📋 تسمية ملفات JSON

### القاعدة

```
{name}.{type}.json

أو

{category}/{specific-name}.json
```

### ✅ أمثلة صحيحة

```json
// Configuration
bot.config.json              ✅
database.config.json         ✅

// Templates
messages.json                ✅
keyboards.json               ✅

// Sections
main-sections.json           ✅
sales.section.json           ✅
customers.section.json       ✅

// Workflows
add-customer.workflow.json   ✅
add-sale.workflow.json       ✅
generate-report.workflow.json ✅

// Sheets Templates
customers.template.json      ✅
sales.template.json          ✅
users.template.json          ✅
```

---

## 📝 تسمية ملفات التوثيق

### القاعدة

```
{number}-{Title-With-Caps}.md

• رقم تسلسلي
• عنوان بالإنجليزية
• كل كلمة تبدأ بحرف كبير
• الشرطة بين الكلمات
```

### ✅ أمثلة صحيحة

```markdown
01-Requirements.md           ✅
02-Implementation-Steps.md   ✅
03-Progress-Tracker.md       ✅
04-Architecture.md           ✅
05-Naming-Conventions.md     ✅
06-Testing-Guide.md          ✅
07-User-Manual.md            ✅
08-Admin-Guide.md            ✅
09-API-Reference.md          ✅
10-Deployment-Guide.md       ✅
```

---

## 🗄️ تسمية جداول قاعدة البيانات

### القاعدة

```
{table_name}

• صيغة الجمع
• snake_case
• أسماء واضحة
```

### ✅ أمثلة صحيحة

```sql
users                        ✅
sections                     ✅
logs                         ✅
settings                     ✅
conversation_states          ✅
permissions                  ✅
user_permissions             ✅
section_permissions          ✅
```

### تسمية الأعمدة

```sql
-- Primary Key
id                           ✅

-- Foreign Keys
user_id                      ✅
parent_id                    ✅
section_id                   ✅

-- Regular Columns
first_name                   ✅
last_name                    ✅
email_address                ✅
phone_number                 ✅
created_at                   ✅
updated_at                   ✅
deleted_at                   ✅
is_active                    ✅
has_permission               ✅
```

---

## 🔑 تسمية المفاتيح في JSON

### القاعدة

```javascript
// camelCase للمفاتيح

{
  "userId": 123,             ✅
  "userName": "Ahmad",       ✅
  "createdAt": "2025-09-30", ✅
  "isActive": true,          ✅
  "hasPermission": false,    ✅
  "profileData": {}          ✅
}
```

---

## 📋 قوائم التحقق (Checklists)

### ✅ قبل إنشاء ملف جديد:

```
□ هل الاسم وصفي ومعبر؟
□ هل يتبع نمط التسمية الصحيح؟
□ هل تم البحث عن التكرار؟
□ هل يحتوي على نوع الملف (.service, .handler, etc.)؟
□ هل الاسم باللغة الإنجليزية؟
```

### ✅ قبل إنشاء مجلد جديد:

```
□ هل الاسم يعكس المحتوى؟
□ هل بصيغة الجمع (إن أمكن)؟
□ هل يختلف عن المجلدات الموجودة؟
□ هل الاسم باللغة الإنجليزية؟
```

### ✅ قبل تسمية متغير:

```
□ هل الاسم واضح ومفهوم؟
□ هل يتبع camelCase/UPPER_SNAKE_CASE حسب النوع؟
□ هل يبدأ بفعل (للدوال)؟
□ هل يبدأ بـ is/has/can (للـ boolean)؟
```

---

## 🚫 الأسماء المحظورة

### ممنوع استخدامها:

```javascript
// أسماء عامة جداً
data                         ❌
temp                         ❌
test                         ❌
new                          ❌
old                          ❌
main                         ❌
app                          ❌
file                         ❌
utils                        ❌ (استخدم اسم محدد)

// أسماء مضللة
manager                      ❌ (عام جداً)
handler                      ❌ (عام جداً)
helper                       ❌ (عام جداً)
processor                    ❌ (عام جداً)

// اختصارات غير واضحة
usr                          ❌ (استخدم user)
msg                          ❌ (استخدم message)
cfg                          ❌ (استخدم config)
db                           ❌ (استخدم database)
auth                         ✅ (مقبول - شائع)
```

---

## 📚 أمثلة كاملة من المشروع

### هيكل نموذجي مع الأسماء الصحيحة

```
TelegramBotTemplate/
│
├── config/
│   ├── bot.config.js                   ✅
│   ├── database.config.js              ✅
│   └── permissions.config.js           ✅
│
├── src/
│   ├── bot.js                          ✅
│   │
│   ├── core/
│   │   ├── database-adapter.core.js    ✅
│   │   ├── workflow-engine.core.js     ✅
│   │   └── section-loader.core.js      ✅
│   │
│   ├── services/
│   │   ├── database.service.js         ✅
│   │   ├── cache.service.js            ✅
│   │   └── excel.service.js            ✅
│   │
│   ├── handlers/
│   │   ├── start.handler.js            ✅
│   │   ├── admin.handler.js            ✅
│   │   └── workflow.handler.js         ✅
│   │
│   └── utils/
│       ├── logger.util.js              ✅
│       ├── validators.util.js          ✅
│       └── arabic-numbers.util.js      ✅
│
└── workflows/
    ├── add-customer.workflow.json      ✅
    └── add-sale.workflow.json          ✅
```

---

## 🎯 ملخص القواعد

### الملفات:
```
Pattern: {function}.{type}.js
مثال: database.service.js
```

### المجلدات:
```
Pattern: {purpose}-{context} أو {category}
مثال: database-adapters/ أو services/
```

### المتغيرات:
```
const CONSTANT_NAME = value;      // UPPER_SNAKE_CASE
const variableName = value;       // camelCase
const _privateName = value;       // _camelCase
```

### الفئات:
```
class ClassName {}                // PascalCase
```

### الدوال:
```
function functionName() {}        // camelCase
function isValid() {}             // is/has/can prefix for boolean
```

### قاعدة البيانات:
```
table_name                        // snake_case
column_name                       // snake_case
```

---

## ⚠️ تذكير مهم

```
🚨 قبل إنشاء أي ملف أو مجلد:
   1. تحقق من عدم وجود اسم مشابه
   2. اتبع نمط التسمية المحدد
   3. استخدم أسماء وصفية ومعبرة
   4. تجنب الأسماء العامة أو المضللة

🎯 الهدف: مشروع منظم ومفهوم بدون تكرار
```

---

**تاريخ الإنشاء:** 2025-09-30  
**آخر تحديث:** 2025-09-30  
**الحالة:** ✅ معتمد وإلزامي

---

*جميع المطورين يجب أن يلتزموا بهذه المعايير بدون استثناء*
