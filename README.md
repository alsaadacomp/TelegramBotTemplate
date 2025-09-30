# 🤖 Telegram Bot Template

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**قالب احترافي متكامل لبناء بوتات تليجرام**

[Features](#-features) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Architecture](#-architecture) •
[Contributing](#-contributing)

</div>

---

## 📋 نظرة عامة

قالب احترافي شامل لبناء بوتات تليجرام بنظام إدارة متقدم يدعم:
- 💾 **نظام قاعدة بيانات مزدوج**: SQLite و Google Sheets
- 🔐 **نظام صلاحيات متعدد المستويات**: 5 أدوار مختلفة
- 🗂️ **أقسام ديناميكية**: تحميل من JSON بدون تعديل الكود
- ⚙️ **محرك Workflows**: بناء عمليات متعددة الخطوات من JSON
- 🔢 **معالجة أرقام عربية**: تحويل وتنسيق تلقائي
- 📊 **تصدير Excel**: تقارير احترافية منسقة
- 📁 **إدارة ملفات**: رفع واستيراد ملفات متعددة
- 🚀 **أداء عالي**: نظام كاش متعدد المستويات

---

## ✨ Features

### 🎯 المزايا الرئيسية

#### 💾 نظام قاعدة البيانات المرن
- **SQLite**: أداء عالي للاستخدام المحلي
- **Google Sheets**: إدارة سهلة عبر الإنترنت
- **Hybrid Mode**: مزامنة تلقائية بين النظامين
- واجهة موحدة (Adapter Pattern) للتبديل السلس

#### 🔐 نظام صلاحيات احترافي
```
Super Admin → Admin → Manager → Moderator → User
```
- صلاحيات على مستوى الأوامر
- صلاحيات على مستوى الأقسام
- صلاحيات على مستوى البيانات
- سهولة إضافة وإدارة المشرفين

#### 🗂️ أقسام ديناميكية لا نهائية
```
📊 المبيعات
  ├── 📅 مبيعات يومية
  │   ├── ➕ إضافة مبيعات
  │   └── 👁️ عرض المبيعات
  └── 📈 تقارير المبيعات
```
- تعريف الأقسام في ملفات JSON
- تداخل لا نهائي (Infinite Nesting)
- تفعيل/تعطيل ديناميكي
- إعادة ترتيب سهلة

#### ⚙️ محرك Workflows متقدم
```json
{
  "id": "add_customer",
  "steps": [
    { "type": "input", "field": "name" },
    { "type": "phone", "field": "phone" },
    { "type": "select", "field": "type" }
  ]
}
```
- بناء workflows من JSON بدون كود
- 10+ أنواع خطوات مختلفة
- تحقق وتنسيق تلقائي
- معالجة أخطاء شاملة

#### 🔢 معالجة الأرقام العربية
```javascript
Input:  "٢٥٬٥٠٠"
Store:  "25500"
Display: "٢٥٬٥٠٠"
```
- قبول الأرقام العربية والإنجليزية
- تحويل تلقائي للتخزين
- عرض بالعربية دائماً للمستخدم
- فواصل الآلاف تلقائياً

#### 📊 تصدير Excel احترافي
- تنسيق تلقائي (ألوان، حدود، خطوط)
- رسوم بيانية (Charts)
- صيغ Excel متقدمة
- حماية بكلمة مرور (اختياري)

---

## 🚀 Quick Start

### المتطلبات الأساسية

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### 1️⃣ التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-username/telegram-bot-template.git
cd telegram-bot-template

# تثبيت المكتبات
npm install
```

### 2️⃣ الإعداد

```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل المتغيرات الأساسية
nano .env
```

**المتغيرات الإلزامية:**
```env
BOT_TOKEN=your_bot_token_here
SUPER_ADMIN_ID=your_telegram_id
```

### 3️⃣ التشغيل

```bash
# وضع التطوير (مع hot reload)
npm run dev

# وضع الإنتاج
npm start
```

### 4️⃣ اختبار البوت

1. افتح تليجرام
2. ابحث عن البوت الخاص بك
3. أرسل `/start`
4. استمتع! 🎉

---

## 📚 Documentation

### الوثائق الكاملة

| المستند | الوصف |
|---------|-------|
| [📋 Requirements](docs/01-Requirements.md) | المتطلبات الكاملة |
| [🗺️ Implementation Steps](docs/02-Implementation-Steps.md) | خطوات التنفيذ |
| [📈 Progress Tracker](docs/03-Progress-Tracker.md) | تتبع التقدم |
| [🏗️ Architecture](docs/04-Architecture.md) | المعمارية التفصيلية |
| [📛 Naming Conventions](docs/05-Naming-Conventions.md) | معايير التسمية |
| [🧪 Testing Guide](docs/06-Testing-Guide.md) | دليل الاختبار |

### أدلة الاستخدام

```bash
# قريباً...
docs/07-User-Manual.md        # دليل المستخدم
docs/08-Admin-Guide.md        # دليل المشرف
docs/09-API-Reference.md      # مرجع API
docs/10-Deployment-Guide.md   # دليل النشر
```

---

## 🏗️ Architecture

### هيكل المشروع

```
TelegramBotTemplate/
├── config/                 # الإعدادات
├── src/                    # الكود المصدري
│   ├── core/              # النواة الأساسية
│   ├── adapters/          # محولات قواعد البيانات
│   ├── middleware/        # الوسائط
│   ├── handlers/          # معالجات الأوامر
│   ├── services/          # الخدمات
│   ├── utils/             # الأدوات المساعدة
│   ├── keyboards/         # لوحات المفاتيح
│   └── models/            # نماذج البيانات
├── data/                  # البيانات والسجلات
├── sections/              # تعريفات الأقسام
├── workflows/             # تعريفات Workflows
├── templates/             # القوالب
├── uploads/               # المرفقات
└── scripts/               # سكربتات مساعدة
```

### الأنماط المعمارية

- ✅ Layered Architecture
- ✅ Adapter Pattern
- ✅ Strategy Pattern
- ✅ Factory Pattern
- ✅ Middleware Pattern
- ✅ Observer Pattern

[اقرأ المزيد →](docs/04-Architecture.md)

---

## 🎮 Usage Examples

### إضافة قسم جديد

```json
// sections/definitions/products.section.json
{
  "id": "products",
  "name": "📦 المنتجات",
  "type": "main",
  "enabled": true,
  "permissions": {
    "view": ["admin", "manager", "user"]
  },
  "children": [
    {
      "id": "add_product",
      "name": "➕ إضافة منتج",
      "workflow": "add-product"
    }
  ]
}
```

### إنشاء Workflow

```json
// workflows/add-product.workflow.json
{
  "id": "add_product",
  "name": "إضافة منتج جديد",
  "steps": [
    {
      "type": "input",
      "field": "name",
      "question": "📝 ما اسم المنتج؟",
      "validation": { "required": true }
    },
    {
      "type": "number",
      "field": "price",
      "question": "💰 ما السعر؟",
      "transform": "normalizeArabicNumbers"
    }
  ],
  "onComplete": {
    "action": "saveToDatabase",
    "table": "products"
  }
}
```

---

## 🛠️ Scripts

### الأوامر المتاحة

```bash
# التشغيل
npm start              # بدء البوت
npm run dev            # وضع التطوير

# الاختبار
npm test               # تشغيل جميع الاختبارات
npm run test:unit      # اختبارات الوحدة
npm run test:e2e       # اختبارات E2E

# الجودة
npm run lint           # فحص الكود
npm run format         # تنسيق الكود

# المساعدة
npm run setup          # الإعداد الأولي
npm run create:workflow   # إنشاء workflow جديد
npm run create:section    # إنشاء قسم جديد
npm run sync:db           # مزامنة قواعد البيانات
npm run backup            # نسخ احتياطي
```

---

## 🔧 Configuration

### ملف .env

```env
# الإعدادات الأساسية
BOT_TOKEN=your_token
SUPER_ADMIN_ID=123456789

# قاعدة البيانات
DB_MODE=sqlite              # sqlite | sheets | hybrid

# الكاش
CACHE_ENABLED=true
CACHE_TTL_USERS=3600

# الأمان
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS_USER=20
```

[عرض جميع الإعدادات →](.env.example)

---

## 🧪 Testing

```bash
# تشغيل جميع الاختبارات
npm test

# مع تغطية الكود
npm run test:coverage

# اختبارات محددة
npm run test:unit
npm run test:integration
npm run test:e2e
```

**معايير الجودة:**
- ✅ تغطية الكود: 80%+
- ✅ جميع الاختبارات ناجحة: 100%
- ✅ صفر أخطاء حرجة

[دليل الاختبار الكامل →](docs/06-Testing-Guide.md)

---

## 📊 Features Checklist

- [x] نظام قاعدة بيانات مزدوج
- [x] نظام صلاحيات متعدد المستويات
- [x] أقسام ديناميكية لا نهائية
- [x] محرك Workflows
- [x] معالجة الأرقام العربية
- [x] تصدير Excel
- [x] استيراد ملفات
- [x] نظام لوج احترافي
- [x] نظام كاش متقدم
- [x] معالجة أخطاء شاملة
- [ ] لوحة تحكم ويب (قريباً)
- [ ] نظام 2FA (قريباً)
- [ ] إشعارات خارجية (قريباً)

---

## 🤝 Contributing

نرحب بمساهماتكم! 🎉

### كيف تساهم؟

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. التزم بمعايير التسمية في [Naming Conventions](docs/05-Naming-Conventions.md)
4. اكتب اختبارات لكودك
5. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
6. Push للفرع (`git push origin feature/AmazingFeature`)
7. افتح Pull Request

### المعايير

- ✅ اتبع معايير التسمية
- ✅ اكتب اختبارات
- ✅ وثق التغييرات
- ✅ جميع رسائل المستخدم بالعربية
- ✅ جميع console.log بالإنجليزية

---

## 📄 License

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🙏 Acknowledgments

- [Telegraf.js](https://telegraf.js.org/) - إطار عمل Telegram Bot
- [Winston](https://github.com/winstonjs/winston) - نظام اللوج
- [ExcelJS](https://github.com/exceljs/exceljs) - معالجة Excel
- [Google Sheets API](https://developers.google.com/sheets/api) - تكامل Google Sheets

---

## 📞 Support

هل تحتاج مساعدة؟

- 📖 [التوثيق الكامل](docs/)
- 💬 [فتح Issue](https://github.com/your-username/telegram-bot-template/issues)
- 📧 Email: support@example.com

---

## 🗺️ Roadmap

### النسخة 1.0 (الحالية)
- [x] النواة الأساسية
- [x] نظام قاعدة البيانات
- [x] نظام الصلاحيات
- [x] الأقسام الديناميكية
- [x] محرك Workflows

### النسخة 1.1 (قريباً)
- [ ] لوحة تحكم ويب
- [ ] تقارير PDF
- [ ] نظام 2FA
- [ ] إشعارات Email/SMS

### النسخة 2.0 (المستقبل)
- [ ] دعم لغات متعددة
- [ ] نظام Plugins
- [ ] AI Integration
- [ ] Advanced Analytics

---

## 📈 Stats

![GitHub Stars](https://img.shields.io/github/stars/your-username/telegram-bot-template)
![GitHub Forks](https://img.shields.io/github/forks/your-username/telegram-bot-template)
![GitHub Issues](https://img.shields.io/github/issues/your-username/telegram-bot-template)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/your-username/telegram-bot-template)

---

<div align="center">

**صُنع بـ ❤️ بواسطة Alsaada**

⭐ إذا أعجبك المشروع، لا تنسَ النجمة!

[⬆ العودة للأعلى](#-telegram-bot-template)

</div>
