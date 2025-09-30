# 🧪 دليل الاختبار - Testing Guide
# Professional Telegram Bot Template - Complete Testing Manual

**Project:** Telegram Bot Template  
**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Document Status:** ✅ Approved

---

## 🎯 فلسفة الاختبار

```
"إذا لم يتم اختباره، فهو لا يعمل!"
"كل ميزة جديدة = اختبار جديد"
"الاختبار ليس خياراً، بل ضرورة"
```

---

## 📊 استراتيجية الاختبار

### هرم الاختبارات

```
           /\
          /  \      E2E Tests (5%)
         /────\     سيناريوهات المستخدم الكاملة
        /      \    
       /────────\   Integration Tests (15%)
      /          \  اختبار التكامل بين المكونات
     /────────────\ 
    /              \ Unit Tests (80%)
   /────────────────\ اختبار الوحدات الفردية
```

### الأولويات

1. **عالية الأولوية (يجب اختبارها):**
   - نظام الصلاحيات
   - نظام قاعدة البيانات
   - معالجة الأخطاء
   - Workflow Engine
   - نظام الكاش

2. **متوسطة الأولوية (يفضل اختبارها):**
   - الأدوات المساعدة
   - التنسيقات
   - التحققات

3. **منخفضة الأولوية (اختبار يدوي مقبول):**
   - واجهة المستخدم
   - الرسائل والقوالب

---

## 🔍 أنواع الاختبارات

### 1. اختبارات الوحدة (Unit Tests)

**الهدف:** اختبار دالة أو وحدة واحدة بمعزل عن الباقي

**الأدوات المقترحة:**
- Jest
- Mocha + Chai
- AVA

**مثال:**

```javascript
// tests/unit/utils/validators.util.test.js

const { validateEmail, validatePhone } = require('../../../src/utils/validators.util');

describe('Validators Utility', () => {
  describe('validateEmail', () => {
    test('should return true for valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });
    
    test('should return false for invalid email', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
    
    test('should handle empty input', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });
  
  describe('validatePhone', () => {
    test('should accept Arabic numerals', () => {
      expect(validatePhone('٠١٢٣٤٥٦٧٨٩')).toBe(true);
    });
    
    test('should accept English numerals', () => {
      expect(validatePhone('0123456789')).toBe(true);
    });
    
    test('should validate length', () => {
      expect(validatePhone('123')).toBe(false); // too short
      expect(validatePhone('12345678901234567')).toBe(false); // too long
    });
  });
});
```

---

### 2. اختبارات التكامل (Integration Tests)

**الهدف:** اختبار تفاعل عدة مكونات مع بعضها

**مثال:**

```javascript
// tests/integration/database/user-operations.test.js

const DatabaseService = require('../../../src/services/database.service');
const CacheService = require('../../../src/services/cache.service');

describe('User Operations Integration', () => {
  let dbService;
  let cacheService;
  
  beforeAll(async () => {
    dbService = new DatabaseService();
    cacheService = new CacheService();
    await dbService.connect();
  });
  
  afterAll(async () => {
    await dbService.disconnect();
  });
  
  test('should create user and cache it', async () => {
    const userData = {
      telegram_id: 123456,
      username: 'testuser',
      first_name: 'Test',
      role: 'user'
    };
    
    // Create user in database
    const user = await dbService.createUser(userData);
    expect(user.id).toBeDefined();
    
    // Check if cached
    const cachedUser = await cacheService.get(`user:${user.telegram_id}`);
    expect(cachedUser).toBeDefined();
    expect(cachedUser.username).toBe(userData.username);
  });
  
  test('should update user and invalidate cache', async () => {
    const userId = 123456;
    const updates = { first_name: 'Updated Name' };
    
    // Update user
    await dbService.updateUser(userId, updates);
    
    // Cache should be invalidated
    const cachedUser = await cacheService.get(`user:${userId}`);
    expect(cachedUser).toBeNull();
  });
});
```

---

### 3. اختبارات E2E (End-to-End Tests)

**الهدف:** اختبار سيناريوهات المستخدم الكاملة

**مثال:**

```javascript
// tests/e2e/workflows/add-customer.test.js

const TelegramBot = require('node-telegram-bot-api');
const { startBot } = require('../../../src/bot');

describe('Add Customer Workflow E2E', () => {
  let bot;
  let testUserId = 999999;
  
  beforeAll(async () => {
    bot = await startBot();
  });
  
  afterAll(async () => {
    await bot.stopPolling();
  });
  
  test('complete add customer workflow', async () => {
    // 1. Start workflow
    const response1 = await sendMessage('/start');
    expect(response1).toContain('مرحباً');
    
    // 2. Select "Add Customer" section
    const response2 = await clickButton('إضافة عميل');
    expect(response2).toContain('ما اسم العميل؟');
    
    // 3. Enter customer name
    const response3 = await sendMessage('أحمد محمد');
    expect(response3).toContain('رقم الهاتف؟');
    
    // 4. Enter phone with Arabic numerals
    const response4 = await sendMessage('٠١٢٣٤٥٦٧٨٩');
    expect(response4).toContain('نوع العميل؟');
    
    // 5. Select customer type
    const response5 = await clickButton('عادي');
    expect(response5).toContain('هل تريد حفظ البيانات؟');
    
    // 6. Confirm
    const response6 = await clickButton('✅ حفظ');
    expect(response6).toContain('تم إضافة العميل');
    
    // 7. Verify in database
    const customer = await db.findCustomer({ name: 'أحمد محمد' });
    expect(customer).toBeDefined();
    expect(customer.phone).toBe('0123456789'); // Normalized
  });
});
```

---

## 📋 قوائم الاختبار لكل مرحلة

### ✅ المرحلة 1: النواة والأساسيات

#### 1.1 نظام الإعدادات
```
□ تحميل جميع ملفات الإعدادات بدون أخطاء
□ التحقق من صحة القيم في كل ملف إعداد
□ اختبار القيم الافتراضية
□ اختبار الإعدادات الخاطئة
```

#### 1.2 نظام قاعدة البيانات
```
□ إنشاء قاعدة البيانات من الصفر
□ إنشاء جميع الجداول بنجاح
□ إدراج سجل (INSERT)
□ قراءة سجل (SELECT)
□ تحديث سجل (UPDATE)
□ حذف سجل (DELETE)
□ استعلام معقد (JOIN)
□ معالجة الأخطاء (duplicate key, etc.)
□ اختبار Transactions
□ اختبار Connection Pool
```

#### 1.3 نظام اللوج
```
□ كتابة لوج بمستوى ERROR
□ كتابة لوج بمستوى WARN
□ كتابة لوج بمستوى INFO
□ كتابة لوج بمستوى DEBUG
□ التحقق من تنسيق Console (إنجليزي)
□ التحقق من حفظ في الملفات
□ اختبار Log Rotation
□ اختبار حذف السجلات القديمة
```

#### 1.4 نظام الكاش
```
□ حفظ في الكاش (SET)
□ قراءة من الكاش (GET)
□ حذف من الكاش (DELETE)
□ انتهاء الكاش بعد TTL
□ تنظيف الكاش اليدوي
□ عرض إحصائيات الكاش
□ اختبار أنواع الكاش المختلفة
```

#### 1.5 نظام معالجة الأخطاء
```
□ رمي خطأ ValidationError
□ رمي خطأ PermissionError
□ رمي خطأ DatabaseError
□ رمي خطأ NotFoundError
□ التحقق من رسالة الخطأ للمستخدم (عربي)
□ التحقق من تسجيل الخطأ (إنجليزي)
□ اختبار إشعار المشرفين بالأخطاء الحرجة
□ اختبار معالجة الأخطاء غير المتوقعة
```

#### 1.6 نظام الصلاحيات
```
□ التحقق من صلاحية super_admin
□ التحقق من صلاحية admin
□ التحقق من صلاحية user
□ رفض صلاحية خاطئة
□ تعيين دور جديد
□ إزالة دور
□ التحقق من الصلاحيات على مستوى القسم
□ اختبار الصلاحيات المتداخلة
```

#### 1.7 نظام معالجة الأرقام العربية
```
□ تحويل أرقام عربية لإنجليزية
□ تحويل أرقام إنجليزية لعربية
□ إضافة فواصل للآلاف
□ تنسيق العملات
□ تنسيق النسب المئوية
□ اختبار الأرقام العشرية
□ اختبار الأرقام الكبيرة جداً
□ اختبار الأرقام السالبة
```

#### 1.8 البوت الأساسي
```
□ بدء البوت بنجاح
□ تنفيذ أمر /start
□ تنفيذ أمر /help
□ تسجيل مستخدم جديد
□ عرض رسالة ترحيب للمستخدم العادي
□ عرض رسالة ترحيب للمشرف
□ عرض لوحة المفاتيح الصحيحة
□ معالجة أمر غير موجود
```

---

### ✅ المرحلة 2: الأقسام و Workflows

#### 2.1 نظام الأقسام
```
□ تحميل الأقسام من JSON
□ بناء شجرة الأقسام
□ عرض الأقسام الرئيسية كـ Keyboard
□ عرض الأقسام الفرعية كـ Inline
□ التنقل بين الأقسام
□ التحقق من الصلاحيات على الأقسام
□ تفعيل/تعطيل قسم
□ إعادة ترتيب الأقسام
□ اختبار الأقسام متعددة المستويات
```

#### 2.2 محرك Workflows
```
□ بدء workflow جديد
□ عرض السؤال الأول
□ استقبال إدخال المستخدم
□ التحقق من البيانات
□ الانتقال للخطوة التالية
□ حفظ البيانات المؤقتة
□ إكمال جميع الخطوات
□ حفظ في قاعدة البيانات
□ إرسال إشعار النجاح
□ مسح حالة المحادثة
□ إلغاء workflow
□ اختبار جميع أنواع الخطوات:
  □ Input
  □ Number
  □ Select
  □ File
  □ Confirm
```

---

### ✅ المرحلة 3: Google Sheets والملفات

#### 3.1 Google Sheets
```
□ الاتصال بـ Google Sheets API
□ إنشاء شيت جديد
□ قراءة البيانات من شيت
□ كتابة بيانات لشيت
□ تحديث بيانات في شيت
□ حذف بيانات من شيت
□ تطبيق تنسيق احترافي
□ إنشاء validation rules
□ معالجة الأخطاء
```

#### 3.2 نظام المزامنة
```
□ مزامنة SQLite → Sheets
□ مزامنة Sheets → SQLite
□ حل التعارضات
□ مزامنة تلقائية
□ إيقاف المزامنة التلقائية
□ معالجة أخطاء المزامنة
□ تسجيل عمليات المزامنة
```

#### 3.3 تصدير Excel
```
□ تصدير جدول بسيط
□ تطبيق التنسيق
□ إضافة رأس ملون
□ إضافة حدود للخلايا
□ دمج خلايا
□ إضافة رسم بياني
□ حماية الملف بكلمة مرور
□ اختبار ملفات كبيرة
```

#### 3.4 استيراد الملفات
```
□ رفع صورة
□ رفع ملف Excel
□ رفع ملف PDF
□ التحقق من نوع الملف
□ التحقق من حجم الملف
□ رفض ملف كبير جداً
□ رفض نوع غير مسموح
□ استيراد بيانات من Excel
□ معالجة ملف تالف
```

---

### ✅ المرحلة 4: الأوامر المتقدمة

#### 4.1 أوامر النظام
```
□ /system status
□ /system cache clear
□ /system cache info
□ /system restart
□ /system backup create
□ /system backup restore
```

#### 4.2 أوامر قاعدة البيانات
```
□ /db mode sqlite
□ /db mode sheets
□ /db sync now
□ /db tables
□ /db rows [table]
```

#### 4.3 أوامر المستخدمين
```
□ /users list
□ /users add [id] [role]
□ /users remove [id]
□ /users role [id] [role]
□ /users stats
```

#### 4.4 أوامر الأقسام
```
□ /sections list
□ /sections tree
□ /sections toggle [id]
□ /sections reorder
```

#### 4.5 أوامر التقارير
```
□ /stats today
□ /stats week
□ /stats month
□ /report generate [type]
```

---

## 🎯 سيناريوهات الاختبار الإلزامية

### سيناريو 1: تسجيل دخول مستخدم جديد

```
الخطوات:
1. مستخدم جديد يرسل /start
2. يتم تسجيله في قاعدة البيانات
3. يُعطى دور "user" افتراضياً
4. يتلقى رسالة ترحيب بالعربية
5. تظهر له القائمة الرئيسية

التوقعات:
✓ المستخدم موجود في users table
✓ المستخدم موجود في الكاش
✓ الرسالة بالعربية فقط
✓ القائمة صحيحة حسب الدور
```

### سيناريو 2: إكمال workflow كامل

```
الخطوات:
1. المستخدم يختار "إضافة عميل"
2. يدخل الاسم بالعربية
3. يدخل رقم الهاتف بأرقام عربية
4. يختار نوع العميل
5. يؤكد الحفظ
6. يتلقى إشعار النجاح

التوقعات:
✓ البيانات محفوظة في database
✓ الأرقام محولة لإنجليزية للتخزين
✓ الأرقام معروضة بالعربية للمستخدم
✓ حالة المحادثة ممسوحة
✓ السجل مكتوب في logs
```

### سيناريو 3: محاولة وصول بدون صلاحيات

```
الخطوات:
1. مستخدم عادي يحاول /users list
2. النظام يتحقق من الصلاحيات
3. يرفض الطلب
4. يرسل رسالة خطأ بالعربية
5. يسجل المحاولة في logs

التوقعات:
✓ الأمر مرفوض
✓ رسالة الخطأ بالعربية
✓ المحاولة مسجلة
✓ المشرفين ليسوا مشعرين (ليس خطأ حرج)
```

### سيناريو 4: تصدير تقرير Excel

```
الخطوات:
1. المشرف يختار "تصدير تقرير"
2. يختار نوع التقرير (مبيعات)
3. يختار الفترة الزمنية
4. النظام يجمع البيانات
5. يولد ملف Excel منسق
6. يرسله للمستخدم

التوقعات:
✓ الملف موجود في uploads/
✓ التنسيق احترافي
✓ البيانات صحيحة
✓ الأرقام بالعربية في التقرير
✓ الملف قابل للفتح
```

### سيناريو 5: المزامنة مع Google Sheets

```
الخطوات:
1. إضافة عميل جديد في SQLite
2. تشغيل /db sync now
3. النظام يزامن مع Sheets
4. التحقق من وجود البيانات في Sheets
5. تعديل البيانات في Sheets
6. المزامنة العكسية
7. التحقق من التحديث في SQLite

التوقعات:
✓ البيانات موجودة في كلا النظامين
✓ التعارضات محلولة
✓ السجلات مكتوبة
✓ الكاش محدث
```

### سيناريو 6: معالجة خطأ في الإدخال

```
الخطوات:
1. المستخدم في workflow "إضافة عميل"
2. يُطلب منه رقم الهاتف
3. يدخل نصاً بدلاً من رقم
4. النظام يكتشف الخطأ
5. يرسل رسالة خطأ واضحة بالعربية
6. يطلب الإدخال مرة أخرى

التوقعات:
✓ الخطأ مكتشف
✓ رسالة الخطأ بالعربية
✓ المستخدم لم يخرج من الـ workflow
✓ يمكنه المحاولة مرة أخرى
```

### سيناريو 7: اختبار Rate Limiting

```
الخطوات:
1. المستخدم يرسل 30 أمر في دقيقة واحدة
2. النظام يسمح بـ 20 أمر فقط
3. يرفض الـ 10 الباقية
4. يرسل رسالة تحذير بالعربية
5. ينتظر دقيقة
6. يحاول مرة أخرى بنجاح

التوقعات:
✓ Rate limit يعمل
✓ المحاولات المرفوضة مسجلة
✓ الرسالة واضحة
✓ يمكن المحاولة لاحقاً
```

### سيناريو 8: اختبار النسخ الاحتياطي والاستعادة

```
الخطوات:
1. إنشاء بيانات اختبار
2. تشغيل /system backup create
3. النظام ينشئ نسخة احتياطية
4. حذف البيانات
5. تشغيل /system backup restore
6. التحقق من استعادة البيانات

التوقعات:
✓ النسخة الاحتياطية أنشئت
✓ البيانات استعيدت بالكامل
✓ لا توجد بيانات ناقصة
✓ السجلات صحيحة
```

---

## 🔧 أدوات الاختبار الموصى بها

### الاختبارات الآلية:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.5",
    "eslint": "^8.50.0",
    "prettier": "^3.0.3"
  }
}
```

### الاختبارات اليدوية:

```
□ جهاز محمول حقيقي
□ Telegram Desktop App
□ أكثر من حساب للاختبار (admin + user)
```

---

## 📊 معايير القبول

### لكل مرحلة يجب:

```
✓ نسبة نجاح الاختبارات: 100%
✓ تغطية الكود (Code Coverage): 80%+
✓ صفر أخطاء حرجة
✓ صفر تحذيرات أمنية
✓ جميع السيناريوهات الإلزامية ناجحة
✓ الأداء ضمن المعايير المحددة
✓ جميع رسائل المستخدم بالعربية
✓ جميع console.log بالإنجليزية
```

---

## 🐛 الإبلاغ عن الأخطاء

### قالب البلاغ:

```markdown
## 🐛 وصف الخطأ
[وصف واضح للخطأ]

## 🔁 خطوات إعادة الإنتاج
1. [خطوة 1]
2. [خطوة 2]
3. [خطوة 3]

## ✅ السلوك المتوقع
[ما كان يجب أن يحدث]

## ❌ السلوك الفعلي
[ما حدث فعلاً]

## 📸 لقطات الشاشة
[إن وجدت]

## 🔍 معلومات إضافية
- نظام التشغيل:
- إصدار Node.js:
- تاريخ ووقت الخطأ:
- سجل الأخطاء:
```

---

## ✅ قائمة الاختبار النهائية

### قبل الإطلاق:

```
□ جميع الاختبارات الآلية ناجحة
□ جميع السيناريوهات اليدوية مختبرة
□ معالجة جميع الأخطاء المعروفة
□ مراجعة الكود كاملة
□ توثيق كامل ومحدث
□ النسخ الاحتياطية تعمل
□ الأداء ضمن المعايير
□ الأمان محكم
□ اختبار على بيئة production-like
□ موافقة فريق الجودة
```

---

**تاريخ الإنشاء:** 2025-09-30  
**آخر تحديث:** 2025-09-30  
**الحالة:** ✅ معتمد

---

*الاختبار الجيد = منتج عالي الجودة*
