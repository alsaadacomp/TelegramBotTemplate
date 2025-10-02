# 🤖 Telegram Bot Template - قالب بوت تليجرام احترافي

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/alsaadacomp/TelegramBotTemplate)
[![Phase](https://img.shields.io/badge/phase-1.8-green.svg)](https://github.com/alsaadacomp/TelegramBotTemplate)
[![Progress](https://img.shields.io/badge/progress-60%25-yellow.svg)](https://github.com/alsaadacomp/TelegramBotTemplate)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

> قالب احترافي متكامل لبناء بوتات تليجرام بنظام إدارة متقدم، يدعم SQLite و Google Sheets، مع نظام صلاحيات متعدد المستويات وإدارة أقسام ديناميكية.

---

## ✨ الميزات الرئيسية

### 🏗️ **بنية احترافية:**
- ✅ معمارية Layered Architecture
- ✅ نمط Adapter للتعامل مع قواعد البيانات
- ✅ Middleware متقدمة (Logger, Auth, i18n, Error)
- ✅ Handlers منفصلة لكل أمر
- ✅ Services Layer للمنطق التجاري

### 💾 **نظام قاعدة بيانات مزدوج:**
- ✅ SQLite (للأداء السريع)
- ✅ Google Sheets (للإدارة السهلة)
- ✅ إمكانية التبديل بدون تعديل الكود
- ✅ مزامنة تلقائية (اختياري)

### 🔐 **نظام صلاحيات متقدم:**
- ✅ 5 أدوار (Super Admin, Admin, Manager, Moderator, User)
- ✅ صلاحيات على مستوى الأوامر
- ✅ صلاحيات على مستوى الأقسام
- ✅ نظام كاش للأداء

### 📝 **نظام رسائل ذكي:**
- ✅ قوالب رسائل ديناميكية
- ✅ رسائل حسب الدور والوقت
- ✅ استبدال متغيرات تلقائي
- ✅ دعم كامل للعربية

### 🔧 **أدوات مساعدة شاملة:**
- ✅ Validators (email, phone, Arabic text, etc.)
- ✅ Formatters (date, time, numbers, currency)
- ✅ Arabic Numbers Handler
- ✅ Error Handler متقدم

---

## 📋 المتطلبات

### البرمجيات:
- **Node.js:** v18.x أو أحدث
- **npm:** v8.x أو أحدث
- **SQLite:** 3.x (مدمج)

### حساب Telegram Bot:
1. تحدث مع [@BotFather](https://t.me/BotFather)
2. أنشئ بوت جديد بأمر `/newbot`
3. احفظ الـ Bot Token

---

## 🚀 التثبيت والإعداد

### 1️⃣ استنساخ المشروع:
```bash
git clone https://github.com/alsaadacomp/TelegramBotTemplate.git
cd TelegramBotTemplate
```

### 2️⃣ تثبيت المكتبات:
```bash
npm install
```

### 3️⃣ إعداد المتغيرات البيئية:
```bash
# انسخ ملف المثال
cp .env.example .env

# عدّل الملف وأضف:
BOT_TOKEN=your_bot_token_here
SUPER_ADMIN_ID=your_telegram_id_here
```

### 4️⃣ تشغيل البوت:
```bash
npm start
```

---

## 📁 هيكل المشروع

```
TelegramBotTemplate/
├── config/                 # ملفات الإعدادات
│   ├── bot.config.js
│   ├── database.config.js
│   ├── permissions.config.js
│   ├── cache.config.js
│   └── logger.config.js
│
├── src/                    # الكود المصدري
│   ├── bot.js             # نقطة البداية
│   ├── core/              # النواة الأساسية
│   ├── adapters/          # محولات قواعد البيانات
│   ├── middleware/        # الوسائط
│   ├── handlers/          # معالجات الأوامر
│   ├── services/          # خدمات الأعمال
│   ├── utils/             # أدوات مساعدة
│   ├── keyboards/         # لوحات المفاتيح
│   └── models/            # نماذج البيانات
│
├── templates/              # قوالب الرسائل
│   └── messages.json
│
├── data/                   # البيانات
│   ├── database/          # قاعدة بيانات SQLite
│   ├── logs/              # ملفات السجلات
│   ├── cache/             # ملفات الكاش
│   └── backups/           # النسخ الاحتياطية
│
├── docs/                   # التوثيق
│   ├── 01-Requirements.md
│   ├── 02-Implementation-Steps.md
│   ├── 03-Progress-Tracker.md
│   └── ...
│
└── tests/                  # الاختبارات
    └── manual/
```

---

## 🎮 الأوامر المتاحة

### للجميع:
```
/start      - بدء البوت
/help       - عرض المساعدة
/menu       - القائمة التفاعلية
/profile    - الملف الشخصي
/settings   - الإعدادات
```

### للمشرفين (Admin+):
```
/stats      - الإحصائيات
/users      - إدارة المستخدمين
/logs       - السجلات
```

### للمالك (Super Admin):
```
/system     - إدارة النظام
```

---

## 🛠️ التطوير

### البنية التقنية:

#### **Middleware Pipeline:**
```
Request → Logger → i18n → Auth → Handler → Error
```

#### **تسجيل أمر جديد:**
```javascript
// في src/handlers/mycommand.handler.js
async function handleMyCommand(ctx) {
  // المنطق هنا
}

module.exports = { handleMyCommand };

// في src/bot.js
bot.command('mycommand', handleMyCommand);
```

#### **إضافة رسالة جديدة:**
```json
// في templates/messages.json
{
  "myMessage": {
    "title": "عنوان الرسالة",
    "content": "المحتوى مع {{variable}}"
  }
}
```

---

## 📊 الحالة الحالية

### ✅ المكتمل:
```
المرحلة 0: التوثيق والإعداد          100% ✅
المرحلة 1.1: نظام الإعدادات          100% ✅
المرحلة 1.2: قاعدة البيانات          100% ✅
المرحلة 1.3: نظام اللوج              100% ✅
المرحلة 1.4: نظام الكاش              100% ✅
المرحلة 1.5: معالجة الأخطاء          100% ✅
المرحلة 1.6: نظام الصلاحيات          100% ✅
المرحلة 1.7: الأدوات المساعدة        100% ✅
المرحلة 1.8: البوت الأساسي           100% ✅
```

### ⏳ قيد العمل:
```
المرحلة 1.9: اختبارات إضافية          0%
المرحلة 1.10: الاختبار الشامل         0%
```

### التقدم الإجمالي: **60%** من المرحلة 1

---

## 🧪 الاختبار

### اختبار يدوي:
```bash
# اختبار النظام الكامل
node src/bot.js

# اختبار مكونات محددة
node tests/manual/test-logger.js
node tests/manual/test-cache.js
node tests/manual/test-errors.js
node tests/manual/test-permissions.js
```

---

## 📚 التوثيق

للمزيد من التفاصيل، راجع:
- [المتطلبات الكاملة](docs/01-Requirements.md)
- [خطوات التنفيذ](docs/02-Implementation-Steps.md)
- [متتبع التقدم](docs/03-Progress-Tracker.md)
- [المعمارية](docs/04-Architecture.md)
- [معايير التسمية](docs/05-Naming-Conventions.md)
- [دليل الاختبار](docs/06-Testing-Guide.md)

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء Branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 📞 الدعم

- **GitHub Issues:** [فتح Issue](https://github.com/alsaadacomp/TelegramBotTemplate/issues)
- **التوثيق:** [docs/](docs/)
- **الموقع:** [قريباً]

---

## 🎯 الخارطة المستقبلية

### المرحلة 2: الأقسام و Workflows
- [ ] نظام أقسام ديناميكي
- [ ] محرك Workflows
- [ ] لوحات مفاتيح ديناميكية

### المرحلة 3: Google Sheets والملفات
- [ ] دعم Google Sheets كامل
- [ ] نظام مزامنة
- [ ] تصدير واستيراد Excel

### المرحلة 4: الأوامر المتقدمة
- [ ] أوامر إدارية شاملة
- [ ] نظام تقارير
- [ ] نظام إشعارات

### المرحلة 5: التحسينات النهائية
- [ ] لوحة تحكم ويب
- [ ] نظام نسخ احتياطي متقدم
- [ ] CI/CD Pipeline

---

## ⭐ إذا أعجبك المشروع

لا تنسَ إعطاء نجمة ⭐ للمشروع على GitHub!

---

**آخر تحديث:** 2025-10-02  
**الإصدار:** v1.0.0  
**المرحلة:** 1.8 Complete  
**الحالة:** ✅ جاهز للاختبار
