# 📋 متطلبات قالب بوت تليجرام الاحترافي
# Professional Telegram Bot Template - Complete Requirements

**Project Name:** Telegram Bot Template  
**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Document Status:** ✅ Approved

---

## 🎯 نظرة عامة | Overview

قالب احترافي متكامل لبناء بوتات تليجرام بنظام إدارة متقدم، يدعم SQLite و Google Sheets، مع نظام صلاحيات متعدد المستويات وإدارة أقسام ديناميكية.

**الأهداف الرئيسية:**
- ✅ سهولة الاستخدام للمطورين المبتدئين
- ✅ مرونة عالية للمطورين المحترفين
- ✅ نظام إدارة احترافي للشركات
- ✅ قابلية التوسع والتطوير
- ✅ معايير جودة عالمية

---

## 🏗️ المتطلبات التقنية | Technical Requirements

### 1. البنية التقنية الأساسية

#### 1.1 البيئة التقنية
- **Node.js**: v18.x أو أحدث
- **Package Manager**: npm أو yarn
- **Framework**: Telegraf.js v4.x
- **Database**: SQLite 3.x + Google Sheets API v4
- **Cache**: node-cache v5.x
- **Logging**: Winston v3.x

#### 1.2 المكتبات الأساسية
```json
{
  "telegraf": "^4.15.0",
  "sqlite3": "^5.1.6",
  "googleapis": "^126.0.0",
  "node-cache": "^5.1.2",
  "winston": "^3.11.0",
  "dotenv": "^16.3.1",
  "exceljs": "^4.4.0",
  "joi": "^17.11.0"
}
```

#### 1.3 هيكل المشروع
```
TelegramBotTemplate/
├── config/                    # Configuration files
├── src/                       # Source code
│   ├── core/                  # Core engine
│   ├── adapters/              # Database adapters
│   ├── middleware/            # Middleware functions
│   ├── handlers/              # Command handlers
│   ├── services/              # Business services
│   ├── utils/                 # Utility functions
│   ├── keyboards/             # Keyboard builders
│   └── models/                # Data models
├── data/                      # Data storage
│   ├── database/              # SQLite files
│   ├── cache/                 # Cache files
│   ├── logs/                  # Log files
│   └── backups/               # Backup files
├── sections/                  # Dynamic sections (JSON)
├── workflows/                 # Workflow definitions (JSON)
├── templates/                 # Message templates (JSON)
├── uploads/                   # Temporary uploads
├── scripts/                   # Helper scripts
├── docs/                      # Documentation
└── tests/                     # Test files (optional)
```

---

## 💾 نظام قاعدة البيانات | Database System

### 2. نظام قاعدة البيانات المزدوج

#### 2.1 المتطلبات الوظيفية
- ✅ دعم SQLite كقاعدة بيانات رئيسية
- ✅ دعم Google Sheets كبديل أو مكمل
- ✅ إمكانية التبديل بين النظامين بدون تعديل الكود
- ✅ مزامنة تلقائية بين SQLite و Google Sheets (اختيارية)
- ✅ نظام Adapter Pattern لتوحيد الواجهة

#### 2.2 أوضاع التشغيل
1. **SQLite Only**: الأسرع، للبوتات الصغيرة والمتوسطة
2. **Google Sheets Only**: الأسهل للإدارة غير التقنية
3. **Hybrid Mode**: SQLite للأداء + مزامنة مع Sheets

#### 2.3 جداول قاعدة البيانات الأساسية

**users** - جدول المستخدمين
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  telegram_id INTEGER UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME,
  metadata TEXT
);
```

**sections** - جدول الأقسام
```sql
CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT 1,
  permissions TEXT,
  handler TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);
```

**logs** - جدول السجلات
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id INTEGER,
  action TEXT,
  metadata TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**settings** - جدول الإعدادات
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.4 Google Sheets Structure

**Sheet: Users**
```
| telegram_id | username | first_name | last_name | role | status | created_at | last_active |
```

**Sheet: Sections**
```
| id | parent_id | name | icon | type | order | enabled | permissions | handler |
```

**Sheet: Logs**
```
| timestamp | level | message | user_id | action | metadata |
```

---

## 🔐 نظام الصلاحيات والأدوار | Permissions & Roles System

### 3. نظام الصلاحيات متعدد المستويات

#### 3.1 الأدوار الأساسية
```javascript
const ROLES = {
  SUPER_ADMIN: 'super_admin',    // صلاحيات كاملة
  ADMIN: 'admin',                // إدارة النظام
  MANAGER: 'manager',            // إدارة محدودة
  MODERATOR: 'moderator',        // إشراف ومراقبة
  USER: 'user'                   // مستخدم عادي
};
```

#### 3.2 مصفوفة الصلاحيات
```javascript
const PERMISSIONS = {
  // نظام
  SYSTEM_MANAGE: ['super_admin'],
  SYSTEM_SETTINGS: ['super_admin', 'admin'],
  SYSTEM_BACKUP: ['super_admin', 'admin'],
  
  // المستخدمين
  USERS_VIEW: ['super_admin', 'admin', 'manager'],
  USERS_EDIT: ['super_admin', 'admin'],
  USERS_DELETE: ['super_admin'],
  
  // الأقسام
  SECTIONS_VIEW: ['super_admin', 'admin', 'manager'],
  SECTIONS_CREATE: ['super_admin', 'admin'],
  SECTIONS_EDIT: ['super_admin', 'admin'],
  SECTIONS_DELETE: ['super_admin'],
  SECTIONS_TOGGLE: ['super_admin', 'admin'],
  
  // البيانات
  DATA_VIEW: ['super_admin', 'admin', 'manager', 'moderator'],
  DATA_CREATE: ['super_admin', 'admin', 'manager'],
  DATA_EDIT: ['super_admin', 'admin', 'manager'],
  DATA_DELETE: ['super_admin', 'admin'],
  DATA_EXPORT: ['super_admin', 'admin', 'manager'],
  
  // الرسائل
  BROADCAST_ALL: ['super_admin'],
  BROADCAST_ROLE: ['super_admin', 'admin'],
  
  // السجلات
  LOGS_VIEW: ['super_admin', 'admin'],
  LOGS_DELETE: ['super_admin']
};
```

#### 3.3 صلاحيات على مستوى الأقسام
كل قسم يمكن أن يحتوي على:
```json
{
  "permissions": {
    "view": ["admin", "manager", "user"],
    "create": ["admin", "manager"],
    "edit": ["admin", "manager"],
    "delete": ["admin"],
    "execute": ["admin", "manager"]
  }
}
```

---

## 🗂️ نظام الأقسام الديناميكي | Dynamic Sections System

### 4. الأقسام متعددة المستويات

#### 4.1 المتطلبات الوظيفية
- ✅ دعم أقسام رئيسية (Keyboard Buttons)
- ✅ دعم أقسام فرعية لا نهائية (Inline Buttons)
- ✅ تحميل ديناميكي من ملفات JSON
- ✅ تفعيل/تعطيل الأقسام بدون تعديل الكود
- ✅ إعادة ترتيب الأقسام ديناميكياً
- ✅ صلاحيات مخصصة لكل قسم وقسم فرعي
- ✅ أيقونات وتنسيق مخصص
- ✅ معالجات (handlers) مخصصة لكل قسم

#### 4.2 هيكل ملف القسم (JSON)
```json
{
  "id": "sales",
  "parent_id": null,
  "name": "📊 المبيعات",
  "icon": "📊",
  "type": "main",
  "order_index": 1,
  "enabled": true,
  "permissions": {
    "view": ["admin", "manager", "user"],
    "access": ["admin", "manager"]
  },
  "handler": "sections/sales.handler.js",
  "metadata": {
    "description": "إدارة المبيعات والفواتير",
    "color": "#4CAF50"
  },
  "children": [
    {
      "id": "sales_daily",
      "name": "مبيعات يومية",
      "icon": "📅",
      "enabled": true,
      "permissions": {
        "view": ["admin", "manager", "user"],
        "execute": ["admin", "manager"]
      },
      "workflow": "add-daily-sale",
      "children": [
        {
          "id": "sales_add",
          "name": "➕ إضافة مبيعات",
          "workflow": "add-sale",
          "enabled": true
        },
        {
          "id": "sales_view",
          "name": "👁️ عرض المبيعات",
          "handler": "sections/view-sales.handler.js",
          "enabled": true
        }
      ]
    }
  ]
}
```

#### 4.3 أنواع الأقسام
- **main**: قسم رئيسي (Keyboard Button)
- **submenu**: قسم فرعي (Inline Button)
- **action**: إجراء مباشر
- **workflow**: سير عمل متعدد الخطوات

---

## ⚙️ نظام Workflows | Workflow Engine

### 5. محرك سير العمل

#### 5.1 المتطلبات الوظيفية
- ✅ تعريف workflows بملفات JSON بسيطة
- ✅ دعم خطوات متعددة (multi-step conversations)
- ✅ التحقق من البيانات (validation)
- ✅ تحويل البيانات (transformation)
- ✅ معالجة الأخطاء المتقدمة
- ✅ حفظ تلقائي في قاعدة البيانات
- ✅ إشعارات وتأكيدات

#### 5.2 أنواع الخطوات
```javascript
const STEP_TYPES = {
  INPUT: 'input',           // إدخال نصي
  NUMBER: 'number',         // إدخال رقمي
  SELECT: 'select',         // اختيار من قائمة
  MULTISELECT: 'multiselect', // اختيار متعدد
  DATE: 'date',             // تاريخ
  TIME: 'time',             // وقت
  FILE: 'file',             // رفع ملف
  PHOTO: 'photo',           // صورة
  LOCATION: 'location',     // موقع
  CONTACT: 'contact',       // جهة اتصال
  CONFIRM: 'confirm'        // تأكيد
};
```

#### 5.3 هيكل Workflow
```json
{
  "id": "add_customer",
  "name": "إضافة عميل جديد",
  "description": "سير عمل لإضافة عميل للنظام",
  "icon": "👤",
  "permissions": ["admin", "manager"],
  "steps": [
    {
      "id": "step_name",
      "type": "input",
      "field": "name",
      "question": "📝 ما اسم العميل؟",
      "placeholder": "أدخل الاسم الكامل",
      "validation": {
        "required": true,
        "minLength": 3,
        "maxLength": 50,
        "pattern": "^[\\u0600-\\u06FF\\s]+$"
      },
      "errorMessage": "❌ الاسم يجب أن يكون بالعربية ومن 3-50 حرف"
    },
    {
      "id": "step_phone",
      "type": "input",
      "field": "phone",
      "question": "📱 رقم الهاتف؟",
      "validation": {
        "required": true,
        "pattern": "^[0-9٠-٩+]{10,15}$"
      },
      "transform": "normalizeArabicNumbers",
      "format": "phoneNumber"
    },
    {
      "id": "step_type",
      "type": "select",
      "field": "customer_type",
      "question": "🏷️ نوع العميل؟",
      "options": [
        {"value": "vip", "label": "⭐ VIP", "icon": "⭐"},
        {"value": "regular", "label": "👤 عادي", "icon": "👤"},
        {"value": "wholesale", "label": "🏢 جملة", "icon": "🏢"}
      ]
    },
    {
      "id": "step_confirm",
      "type": "confirm",
      "question": "✅ هل تريد حفظ البيانات؟",
      "summary": "**الاسم:** {{name}}\n**الهاتف:** {{phone}}\n**النوع:** {{customer_type}}",
      "confirmText": "✅ حفظ",
      "cancelText": "❌ إلغاء"
    }
  ],
  "onComplete": {
    "action": "saveToDatabase",
    "table": "customers",
    "sheet": "العملاء",
    "notification": {
      "success": "✅ تم إضافة العميل **{{name}}** بنجاح!",
      "error": "❌ حدث خطأ أثناء حفظ البيانات"
    },
    "logAction": true,
    "nextAction": "show_customer_menu"
  },
  "onCancel": {
    "message": "❌ تم إلغاء العملية",
    "returnTo": "main_menu"
  }
}
```

---

## 🔢 نظام معالجة الأرقام العربية | Arabic Numbers Handler

### 6. معالجة الأرقام

#### 6.1 المتطلبات
- ✅ قبول الأرقام العربية (٠-٩) والإنجليزية (0-9)
- ✅ تحويل تلقائي للأرقام العربية عند التخزين
- ✅ عرض الأرقام بالعربية للمستخدمين دائماً
- ✅ إضافة فواصل للآلاف تلقائياً
- ✅ دعم الكسور العشرية
- ✅ دعم تنسيقات خاصة (عملات، نسب مئوية)

#### 6.2 أمثلة التحويل
```javascript
// Input → Storage → Display
"٢٥٠٠" → "2500" → "٢٬٥٠٠"
"1234567.89" → "1234567.89" → "١٬٢٣٤٬٥٦٧٫٨٩"
"٥٠٪" → "50" → "٥٠٪"
"١٢٣٫٤٥ ريال" → "123.45" → "١٢٣٫٤٥ ريال"
```

#### 6.3 دوال المعالجة
```javascript
// تحويل من عربي لإنجليزي
normalizeArabicNumbers(input)

// تحويل من إنجليزي لعربي
toArabicNumbers(input)

// تنسيق بفواصل
formatNumber(number, options)

// تنسيق كعملة
formatCurrency(amount, currency)

// تنسيق كنسبة مئوية
formatPercentage(value)
```

---

## 📊 نظام تصدير واستيراد الملفات | Import/Export System

### 7. إدارة الملفات

#### 7.1 تصدير Excel
- ✅ تصدير البيانات من SQLite/Google Sheets إلى Excel
- ✅ تنسيق احترافي (ألوان، خطوط، حدود)
- ✅ أعمدة قابلة للتخصيص
- ✅ دعم صيغ Excel المتقدمة
- ✅ إضافة رسوم بيانية (Charts)
- ✅ حماية الملفات بكلمة مرور (اختياري)

#### 7.2 استيراد الملفات
**أنواع الملفات المدعومة:**
- ✅ Excel (.xlsx, .xls)
- ✅ CSV (.csv)
- ✅ JSON (.json)
- ✅ PDF (للعرض فقط)
- ✅ صور (.jpg, .png, .gif, .webp)
- ✅ مستندات (.docx - اختياري)

**المتطلبات:**
- ✅ التحقق من نوع الملف
- ✅ التحقق من حجم الملف (حد أقصى قابل للتخصيص)
- ✅ مسح الفيروسات (اختياري)
- ✅ معاينة قبل الاستيراد
- ✅ معالجة الأخطاء بشكل شامل

---

## 📝 نظام الرسائل والقوالب | Messages & Templates System

### 8. إدارة الرسائل

#### 8.1 المتطلبات
- ✅ جميع رسائل المستخدمين بالعربية فقط
- ✅ رسائل المطورين (console) بالإنجليزية فقط
- ✅ دعم المتغيرات الديناميكية {{variable}}
- ✅ رسائل مختلفة حسب الدور (Admin vs User)
- ✅ قوالب قابلة للتعديل بدون كود
- ✅ دعم التنسيق (Bold, Italic, Code)
- ✅ دعم الإيموجي

#### 8.2 هيكل ملف الرسائل
```json
{
  "welcome": {
    "super_admin": {
      "text": "🎉 مرحباً يا مدير النظام {{name}}!\n\n👑 لديك صلاحيات كاملة\n\n📊 **إحصائيات سريعة:**\n• المستخدمين: {{userCount}}\n• الأقسام النشطة: {{activeSections}}\n• الرسائل اليوم: {{todayMessages}}",
      "keyboard": "super_admin_main",
      "parse_mode": "Markdown"
    },
    "admin": {
      "text": "👋 أهلاً {{name}}!\n\n🔧 أنت مشرف في النظام\n\n💡 استخدم القائمة أدناه للبدء",
      "keyboard": "admin_main"
    },
    "user": {
      "text": "👋 مرحباً {{name}}!\n\nنحن سعداء بوجودك معنا 🌟\n\n💼 كيف يمكنني مساعدتك اليوم؟",
      "keyboard": "user_main"
    }
  },
  "errors": {
    "no_permission": "⛔ عذراً {{name}}، ليس لديك صلاحية لهذا الإجراء",
    "invalid_input": "❌ خطأ في {{field}}:\n{{error}}",
    "database_error": "⚠️ حدث خطأ في النظام\nتم تسجيل المشكلة وسيتم حلها قريباً",
    "network_error": "🌐 مشكلة في الاتصال\nيرجى المحاولة مرة أخرى",
    "file_too_large": "📦 الملف كبير جداً\nالحد الأقصى: {{maxSize}}",
    "invalid_file_type": "❌ نوع الملف غير مدعوم\nالأنواع المسموحة: {{allowedTypes}}"
  },
  "success": {
    "saved": "✅ تم الحفظ بنجاح!",
    "updated": "✅ تم التحديث بنجاح!",
    "deleted": "✅ تم الحذف بنجاح!",
    "exported": "✅ تم التصدير بنجاح!\n📁 {{filename}}"
  }
}
```

---

## 🛠️ أوامر الإدارة | Admin Commands

### 9. الأوامر الإدارية الشاملة

#### 9.1 أوامر النظام
```
/system status          - حالة النظام الكاملة
/system cache clear     - تنظيف الكاش
/system cache info      - معلومات الكاش
/system restart         - إعادة تشغيل البوت
/system backup create   - إنشاء نسخة احتياطية
/system backup restore  - استعادة نسخة احتياطية
/system backup list     - قائمة النسخ الاحتياطية
/system config show     - عرض الإعدادات
/system config edit     - تعديل إعداد
```

#### 9.2 أوامر قاعدة البيانات
```
/db mode [sqlite|sheets|hybrid]  - تبديل نظام DB
/db sync now                     - مزامنة فورية
/db sync auto [on|off]           - تفعيل/تعطيل المزامنة التلقائية
/db tables                       - قائمة الجداول
/db rows [table]                 - عدد السجلات
/db structure [table]            - بنية الجدول
/db query [sql]                  - استعلام مخصص (super_admin)
/db optimize                     - تحسين قاعدة البيانات
/db export [table]               - تصدير جدول
/db import [file]                - استيراد بيانات
```

#### 9.3 أوامر Google Sheets
```
/sheets create [name]              - إنشاء شيت جديد
/sheets delete [name]              - حذف شيت
/sheets rename [old] [new]         - إعادة تسمية
/sheets list                       - قائمة الشيتات
/sheets structure [name]           - بنية الشيت
/sheets columns [name]             - قائمة الأعمدة
/sheets rows [name]                - عدد الصفوف
/sheets clear [name]               - مسح البيانات
/sheets export [name]              - تصدير كـ Excel
/sheets import [file] [sheet]      - استيراد بيانات
/sheets format [name]              - تنسيق احترافي
/sheets permissions [name]         - إدارة الصلاحيات
```

#### 9.4 أوامر المستخدمين
```
/users list [role]                 - قائمة المستخدمين
/users search [query]              - البحث عن مستخدم
/users add [id] [role]             - إضافة مستخدم
/users remove [id]                 - حذف مستخدم
/users role [id] [role]            - تغيير الصلاحية
/users ban [id] [reason]           - حظر مستخدم
/users unban [id]                  - إلغاء الحظر
/users active                      - المستخدمين النشطين
/users stats                       - إحصائيات المستخدمين
/users export                      - تصدير قائمة المستخدمين
```

#### 9.5 أوامر الأقسام
```
/sections list                     - قائمة الأقسام
/sections tree                     - عرض الشجرة الكاملة
/sections add [parent]             - إضافة قسم
/sections edit [id]                - تعديل قسم
/sections delete [id]              - حذف قسم
/sections toggle [id]              - تفعيل/تعطيل
/sections reorder [parent]         - إعادة ترتيب
/sections permissions [id]         - إدارة صلاحيات القسم
/sections move [id] [newParent]    - نقل قسم
/sections duplicate [id]           - نسخ قسم
```

#### 9.6 أوامر Workflows
```
/workflows list                    - قائمة workflows
/workflows add                     - إضافة workflow
/workflows edit [id]               - تعديل workflow
/workflows delete [id]             - حذف workflow
/workflows test [id]               - اختبار workflow
/workflows enable [id]             - تفعيل workflow
/workflows disable [id]            - تعطيل workflow
/workflows stats [id]              - إحصائيات workflow
```

#### 9.7 أوامر التقارير والإحصائيات
```
/stats today                       - إحصائيات اليوم
/stats week                        - إحصائيات الأسبوع
/stats month                       - إحصائيات الشهر
/stats year                        - إحصائيات السنة
/stats users                       - إحصائيات المستخدمين
/stats sections                    - إحصائيات الأقسام
/stats commands                    - الأوامر الأكثر استخداماً
/stats errors                      - الأخطاء الأخيرة
/report generate [type]            - توليد تقرير شامل
/report schedule [type] [time]     - جدولة تقرير دوري
```

#### 9.8 أوامر البث والإشعارات
```
/broadcast all [message]           - رسالة للجميع
/broadcast role [role] [message]   - رسالة لصلاحية محددة
/broadcast active [message]        - رسالة للنشطين فقط
/notify admins [message]           - إشعار المشرفين
/notify user [id] [message]        - إشعار مستخدم محدد
```

#### 9.9 أوامر السجلات
```
/logs view [lines]                 - عرض آخر سجلات
/logs errors [lines]               - عرض آخر أخطاء
/logs user [id] [lines]            - سجلات مستخدم
/logs action [action]              - سجلات إجراء محدد
/logs export [from] [to]           - تصدير سجلات
/logs clear [before]               - مسح سجلات قديمة
```

#### 9.10 أوامر المحتوى
```
/messages list                     - قائمة الرسائل
/messages edit [key]               - تعديل رسالة
/messages preview [key]            - معاينة رسالة
/templates list                    - قائمة القوالب
/templates edit [id]               - تعديل قالب
```

---

## 🔒 نظام الأمان | Security System

### 10. الأمان والحماية

#### 10.1 المتطلبات الأمنية
- ✅ التحقق من صلاحيات كل أمر
- ✅ تسجيل جميع الإجراءات الحساسة
- ✅ حماية من SQL Injection
- ✅ حماية من الهجمات المتكررة (Rate Limiting)
- ✅ تشفير البيانات الحساسة
- ✅ نسخ احتياطية تلقائية
- ✅ التحقق من الملفات المرفوعة

#### 10.2 Rate Limiting
```javascript
{
  "user": {
    "commands_per_minute": 20,
    "messages_per_hour": 100
  },
  "admin": {
    "commands_per_minute": 60,
    "messages_per_hour": 500
  }
}
```

---

## 📊 نظام اللوج والمراقبة | Logging & Monitoring

### 11. نظام اللوج المتقدم

#### 11.1 مستويات اللوج
```javascript
const LOG_LEVELS = {
  ERROR: 'error',      // أخطاء حرجة
  WARN: 'warn',        // تحذيرات
  INFO: 'info',        // معلومات عامة
  DEBUG: 'debug',      // تفاصيل للتطوير
  VERBOSE: 'verbose'   // تفاصيل شاملة
};
```

#### 11.2 تصنيف السجلات
```javascript
const LOG_CATEGORIES = {
  SYSTEM: 'system',       // نظام
  DATABASE: 'database',   // قاعدة بيانات
  AUTH: 'auth',          // صلاحيات
  USER: 'user',          // مستخدمين
  COMMAND: 'command',    // أوامر
  ERROR: 'error',        // أخطاء
  SECURITY: 'security'   // أمان
};
```

#### 11.3 تنسيق السجلات
**للمطورين (Console - إنجليزي):**
```
[2025-09-30 10:30:45] [ERROR] [DATABASE] Failed to connect: Connection timeout
[2025-09-30 10:31:12] [INFO] [USER] User 12345 executed command: /users list
[2025-09-30 10:32:03] [WARN] [SECURITY] Rate limit exceeded for user 67890
```

**للمستخدمين (Telegram - عربي):**
```
⚠️ حدث خطأ في الاتصال بقاعدة البيانات
✅ تم تنفيذ الأمر بنجاح
⛔ تم تجاوز الحد المسموح من الطلبات
```

---

## 💾 نظام الكاش | Cache System

### 12. إدارة الكاش

#### 12.1 المتطلبات
- ✅ استخدام node-cache للكاش في الذاكرة
- ✅ كاش ذكي لبيانات المستخدمين
- ✅ كاش لبيانات Google Sheets
- ✅ كاش لحالات المحادثات
- ✅ كاش للإعدادات
- ✅ تنظيف تلقائي للكاش المنتهي
- ✅ إمكانية تنظيف الكاش يدوياً

#### 12.2 أنواع الكاش
```javascript
const CACHE_TYPES = {
  USERS: {
    ttl: 3600,        // ساعة واحدة
    checkperiod: 600  // فحص كل 10 دقائق
  },
  SECTIONS: {
    ttl: 7200,        // ساعتان
    checkperiod: 600
  },
  SHEETS_DATA: {
    ttl: 1800,        // 30 دقيقة
    checkperiod: 300
  },
  CONVERSATIONS: {
    ttl: 900,         // 15 دقيقة
    checkperiod: 120
  },
  SETTINGS: {
    ttl: 0,           // لا ينتهي
    checkperiod: 0
  }
};
```

---

## 🌐 نظام اللغة والترجمة | Language System

### 13. إدارة اللغات

#### 13.1 القواعد الصارمة
```javascript
const LANGUAGE_RULES = {
  USER_FACING: 'ar',     // كل ما يراه المستخدم: عربي فقط
  DEVELOPER_LOGS: 'en',  // كل console.log: إنجليزي فقط
  CODE_COMMENTS: 'mixed', // التعليقات: عربي/إنجليزي
  VARIABLES: 'en',       // أسماء المتغيرات: إنجليزي فقط
  ERRORS_USER: 'ar',     // رسائل الخطأ للمستخدم: عربي
  ERRORS_DEV: 'en'       // رسائل الخطأ في Console: إنجليزي
};
```

#### 13.2 أمثلة
```javascript
// ✅ صحيح
console.log('User authentication successful');
bot.reply('✅ تم تسجيل الدخول بنجاح');

// ❌ خطأ
console.log('تم تسجيل دخول المستخدم');
bot.reply('Authentication successful');
```

---

## 📛 معايير التسمية | Naming Conventions

### 14. نظام التسمية الفريد

#### 14.1 القواعد الأساسية
**لا تكرار للأسماء في المشروع بأكمله!**

#### 14.2 تسمية الملفات
```
Pattern: {function}.{type}.js

✅ أمثلة صحيحة:
- users.service.js
- database.adapter.js
- auth.middleware.js
- start.handler.js
- arabic-numbers.util.js

❌ أمثلة خاطئة:
- admin.js (غامض)
- service.js (عام جداً)
- users.js + users.service.js (تكرار اسم users)
```

#### 14.3 تسمية المجلدات
```
Pattern: {purpose}-{context}

✅ أمثلة صحيحة:
- core-engine/
- database-adapters/
- user-handlers/
- message-templates/
- workflow-definitions/

❌ أمثلة خاطئة:
- core/ (عام جداً)
- handlers/ (ممكن يتكرر)
```

#### 14.4 تسمية المتغيرات
```javascript
// الثوابت: UPPER_SNAKE_CASE
const DATABASE_CONFIG = {};
const MAX_FILE_SIZE = 5242880;

// المتغيرات: camelCase
const userName = 'Ahmad';
const isAuthenticated = true;

// الفئات: PascalCase
class DatabaseAdapter {}
class WorkflowEngine {}

// الخاصة: _camelCase
const _internalCache = {};
```

#### 14.5 قائمة كاملة بالأسماء المحظورة من التكرار

**الملفات الأساسية:**
```
bot.js
index.js
config.js
database.js
cache.js
logger.js
```

**المعالجات:**
```
start.handler.js
help.handler.js
admin.handler.js
user.handler.js
system.handler.js
sections.handler.js
workflows.handler.js
```

**الخدمات:**
```
database.service.js
google-sheets.service.js
cache.service.js
excel.service.js
file.service.js
permission.service.js
notification.service.js
backup.service.js
```

---

## 🚀 متطلبات الأداء | Performance Requirements

### 15. معايير الأداء

#### 15.1 أوقات الاستجابة
```javascript
const PERFORMANCE_TARGETS = {
  COMMAND_RESPONSE: '< 500ms',      // استجابة الأوامر
  DATABASE_QUERY: '< 100ms',        // استعلامات DB
  CACHE_HIT: '< 10ms',              // قراءة من الكاش
  FILE_UPLOAD: '< 5s',              // رفع ملف
  SHEETS_SYNC: '< 3s',              // مزامنة Sheets
  WORKFLOW_STEP: '< 200ms'          // خطوة workflow
};
```

#### 15.2 استخدام الذاكرة
```javascript
const MEMORY_LIMITS = {
  CACHE_MAX_SIZE: '100MB',
  TEMP_FILES_MAX: '500MB',
  LOG_FILES_MAX: '200MB'
};
```

---

## 🧪 متطلبات الاختبار | Testing Requirements

### 16. استراتيجية الاختبار

#### 16.1 أنواع الاختبارات
- ✅ اختبار يدوي بعد كل مرحلة
- ✅ اختبار الصلاحيات
- ✅ اختبار Workflows
- ✅ اختبار معالجة الأخطاء
- ✅ اختبار الكاش
- ✅ اختبار قاعدة البيانات
- ✅ اختبار التحميل (Load Testing) - اختياري

#### 16.2 سيناريوهات الاختبار الإلزامية
1. تسجيل دخول المستخدم العادي
2. تسجيل دخول المشرف
3. تنفيذ workflow كامل
4. رفع ملف وحفظه
5. تصدير بيانات إلى Excel
6. المزامنة مع Google Sheets
7. معالجة خطأ في الإدخال
8. اختبار صلاحيات غير صحيحة
9. اختبار Rate Limiting
10. اختبار النسخ الاحتياطي والاستعادة

---

## 📦 متطلبات النشر | Deployment Requirements

### 17. بيئة الإنتاج

#### 17.1 متطلبات الخادم
```
- نظام التشغيل: Ubuntu 20.04+ أو Windows Server
- Node.js: v18.x+
- RAM: 512MB كحد أدنى، 1GB موصى به
- مساحة القرص: 5GB كحد أدنى
- معالج: 1 Core كحد أدنى
```

#### 17.2 المتغيرات البيئية
```env
# Bot Configuration
BOT_TOKEN=your_bot_token_here
BOT_USERNAME=your_bot_username

# Database
DB_MODE=sqlite
SQLITE_PATH=./data/database/bot.db

# Google Sheets
GOOGLE_SHEETS_ENABLED=false
GOOGLE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Cache
CACHE_ENABLED=true
CACHE_TTL=3600

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_CONSOLE=true

# Security
SUPER_ADMIN_ID=123456789
RATE_LIMIT_ENABLED=true

# File Uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Backup
AUTO_BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=7
```

---

## 🎯 معايير القبول | Acceptance Criteria

### 18. معايير اكتمال المشروع

#### 18.1 المرحلة 1: النواة والأساسيات ✅
- [ ] إعداد المشروع وهيكل المجلدات
- [ ] نظام قاعدة البيانات (SQLite + Adapter)
- [ ] نظام الصلاحيات
- [ ] نظام اللوج
- [ ] نظام الكاش
- [ ] معالج الأخطاء الأساسي
- [ ] أوامر البدء الأساسية (/start, /help)

#### 18.2 المرحلة 2: الأقسام و Workflows ✅
- [ ] نظام الأقسام الديناميكي
- [ ] محرك Workflows
- [ ] لوحات المفاتيح الديناميكية
- [ ] معالجة الأرقام العربية
- [ ] نظام الرسائل والقوالب

#### 18.3 المرحلة 3: Google Sheets والملفات ✅
- [ ] Google Sheets Adapter
- [ ] المزامنة التلقائية
- [ ] إنشاء Sheets تلقائياً
- [ ] تصدير Excel
- [ ] استيراد الملفات
- [ ] معالجة المرفقات

#### 18.4 المرحلة 4: الأوامر المتقدمة ✅
- [ ] أوامر إدارة النظام
- [ ] أوامر إدارة قاعدة البيانات
- [ ] أوامر إدارة Sheets
- [ ] أوامر إدارة المستخدمين
- [ ] أوامر التقارير والإحصائيات
- [ ] نظام البث والإشعارات

#### 18.5 المرحلة 5: التحسينات النهائية ✅
- [ ] نظام النسخ الاحتياطي
- [ ] التوثيق الكامل
- [ ] دليل الاستخدام
- [ ] اختبارات شاملة
- [ ] تحسين الأداء
- [ ] إعداد للنشر

---

## 📚 مراجع | References

### 19. الموارد والوثائق

#### 19.1 التوثيق الرسمي
- Telegraf.js: https://telegraf.js.org/
- Google Sheets API: https://developers.google.com/sheets/api
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- Winston Logger: https://github.com/winstonjs/winston

#### 19.2 Design Patterns
- Adapter Pattern
- Factory Pattern
- Strategy Pattern
- Observer Pattern
- Command Pattern

---

## ✅ ملخص المتطلبات

### المتطلبات الإلزامية (Must Have):
1. ✅ نظام قاعدة بيانات مزدوج (SQLite + Google Sheets)
2. ✅ نظام صلاحيات متعدد المستويات
3. ✅ أقسام ديناميكية متعددة المستويات
4. ✅ محرك Workflows بـ JSON
5. ✅ معالجة الأرقام العربية
6. ✅ تصدير Excel
7. ✅ استيراد الملفات
8. ✅ نظام لوج احترافي
9. ✅ نظام كاش
10. ✅ أوامر إدارية شاملة
11. ✅ واجهة عربية للمستخدمين
12. ✅ Console إنجليزي للمطورين
13. ✅ نظام تسمية فريد

### المتطلبات الاختيارية (Nice to Have):
- ⭐ لوحة تحكم ويب
- ⭐ نظام 2FA
- ⭐ إشعارات خارجية (Email/SMS)
- ⭐ تقارير PDF
- ⭐ اختبارات آلية

---

**تاريخ الإنشاء:** 2025-09-30  
**آخر تحديث:** 2025-09-30  
**الحالة:** ✅ معتمد ومجهز للتنفيذ

---

*هذا المستند يمثل المتطلبات الكاملة والشاملة للمشروع*
