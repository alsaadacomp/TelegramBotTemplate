# 📖 دليل الاستخدام السريع - How To

> دليل مبسط وسريع لأهم العمليات الشائعة

---

## 🚀 تشغيل البوت

### 🐳 تشغيل بـ Docker (الأسهل والأكثر استقراراً):
```bash
# تشغيل كامل مع Docker Compose
docker-compose up -d

# أو تشغيل ملف الصورة مباشرة
docker build -t telegram-bot .
docker run -d --name telegram-bot telegram-bot
```

### 💻 تشغيل مباشر (للإصلاح أو الاختبار):
```bash
cd F:\_Alsaada_Telegram_Bot\TelegramBotTemplate
node src/bot.js
```

### 🔧 تشغيل في وضع التطوير (مع إعادة تشغيل تلقائية):
```bash
npm run dev
```
> يحتاج تثبيت nodemon أولاً: `npm install -D nodemon`

### إيقاف البوت:
```
اضغط Ctrl+C
```

---

## 🧪 تشغيل الاختبارات

### 🚀 اختبار شامل (موصى به):
```bash
# تشغيل جميع الاختبارات (269 اختبار)
npm test

# تشغيل الاختبارات مع تغطية الأكواد
npm run test:coverage
```

### 🧩 اختبارات محددة:

#### اختبارات الوحدة (Unit Tests):
```bash
npm run test:unit
```

#### اختبارات التكامل (Integration Tests):
```bash
npm run test:integration
```

#### اختبارات النهاية للنهاية (E2E Tests):
```bash
npm run test:e2e
```

### 📝 اختبارات يدوية فقط:

#### اختبار Logger المتقدم:
```bash
node tests/manual/test-logger.js
```

#### اختبار Cache عالي الأداء:
```bash
node tests/manual/test-cache.js
```

#### اختبار نظام الأخطاء الاحترافي:
```bash
node tests/manual/test-errors.js
```

#### اختبار الصلاحيات الهرمية:
```bash
node tests/manual/test-permissions.js
```

#### اختبار الأدوات المساعدة:
```bash
node tests/manual/test-helpers.js
node tests/manual/test-formatters.js  
node tests/manual/test-validators.js
```

---

## 📦 Git - رفع الملفات على GitHub

### 1. التحقق من الملفات المتغيرة:
```bash
git status
```

### 2. إضافة جميع الملفات:
```bash
git add .
```

أو إضافة ملف محدد:
```bash
git add src/bot.js
```

### 3. عمل Commit:
```bash
git commit -m "وصف التغييرات"
```

مثال:
```bash
git commit -m "feat: add new feature"
```

### 4. رفع على GitHub:
```bash
git push origin main
```

---

## 📥 Git - نسخ المشروع

### نسخ من GitHub لأول مرة:
```bash
git clone https://github.com/alsaadacomp/TelegramBotTemplate.git
cd TelegramBotTemplate
npm install
```

### تحديث من GitHub (Pull):
```bash
git pull origin main
```

---

## 🔧 إعداد المشروع من الصفر

### 1. نسخ المشروع:
```bash
git clone https://github.com/alsaadacomp/TelegramBotTemplate.git
cd TelegramBotTemplate
```

### 2. تثبيت المكتبات:
```bash
npm install
```

### 3. إعداد ملف .env:
```bash
cp .env.example .env
```

ثم افتح `.env` وعدّل:
```env
BOT_TOKEN=your_bot_token_here
SUPER_ADMIN_ID=your_telegram_id_here
```

### 4. تشغيل البوت:
```bash
node src/bot.js
```

---

## 📝 تعديل الكود

### إضافة أمر جديد:

1. أنشئ ملف handler جديد:
```javascript
// src/handlers/mycommand.handler.js
async function handleMyCommand(ctx) {
  await ctx.reply('مرحباً!');
}

module.exports = { handleMyCommand };
```

2. سجّل الأمر في bot.js:
```javascript
const { handleMyCommand } = require('./handlers/mycommand.handler.js');

// في registerCommands()
bot.command('mycommand', handleMyCommand);
```

---

## 🗄️ قاعدة البيانات

### مسح قاعدة البيانات:
```bash
rm data/database/bot.db
```
> سيتم إنشاؤها تلقائياً عند التشغيل التالي

### نسخة احتياطية:
```bash
cp data/database/bot.db data/backups/bot_backup_$(date +%Y%m%d).db
```

---

## 📊 السجلات (Logs)

### عرض آخر السجلات:
```bash
# في Windows PowerShell
Get-Content data/logs/combined.log -Tail 20

# في Linux/Mac
tail -f data/logs/combined.log
```

### مسح السجلات القديمة:
```bash
node scripts/rotate-logs.script.js
```

---

## 🔑 الحصول على Bot Token

1. افتح [@BotFather](https://t.me/BotFather) في تليجرام
2. أرسل `/newbot`
3. اتبع التعليمات (اسم البوت، username)
4. احفظ الـ Token الذي يعطيك إياه

---

## 🆔 الحصول على Telegram ID

### طريقة 1 - باستخدام بوت:
1. افتح [@userinfobot](https://t.me/userinfobot)
2. أرسل `/start`
3. سيعطيك الـ ID

### طريقة 2 - من بوتك:
1. شغّل بوتك
2. أرسل `/start` لبوتك
3. شاهد console، سيظهر user ID

---

## 🔄 Git - أوامر متقدمة

### إنشاء Branch جديد:
```bash
git checkout -b feature/new-feature
```

### التبديل بين Branches:
```bash
git checkout main
git checkout feature/new-feature
```

### دمج Branch:
```bash
git checkout main
git merge feature/new-feature
```

### التراجع عن آخر commit (قبل Push):
```bash
git reset --soft HEAD~1
```

### عرض السجل:
```bash
git log --oneline
```

---

## 📦 npm - إدارة المكتبات

### تثبيت مكتبة جديدة:
```bash
npm install package-name
```

### تثبيت مكتبة للتطوير فقط:
```bash
npm install -D package-name
```

### تحديث جميع المكتبات:
```bash
npm update
```

### حذف مكتبة:
```bash
npm uninstall package-name
```

---

## 🐛 حل المشاكل الشائعة

### مشكلة: Module not found
```bash
npm install
```

### مشكلة: Port already in use
```bash
# أوقف البوت القديم أولاً (Ctrl+C)
# ثم شغّل من جديد
```

### مشكلة: Database locked
```bash
# أغلق جميع البوتات العاملة
# امسح ملف bot.db-wal و bot.db-shm
rm data/database/bot.db-wal
rm data/database/bot.db-shm
```

### مشكلة: Git conflicts
```bash
# اسحب التغييرات أولاً
git pull origin main

# حل التعارضات يدوياً في الملفات
# ثم
git add .
git commit -m "resolve conflicts"
git push origin main
```

---

## 🎯 نصائح سريعة

### ✅ افعل:
- احفظ نسخة احتياطية من `.env`
- اعمل commit بعد كل ميزة مكتملة
- اختبر قبل الـ push
- اقرأ console للأخطاء

### ❌ لا تفعل:
- لا ترفع ملف `.env` على GitHub
- لا تشارك الـ Bot Token
- لا تحذف مجلد `node_modules` يدوياً
- لا تعدّل الملفات في `node_modules/`

---

## 📞 المساعدة

### مشاكل تقنية:
- راجع `docs/06-Testing-Guide.md`
- راجع `docs/04-Architecture.md`

### مشاكل Git:
- راجع `docs/08-Git-Guide-Phase-1.8.md`

### أسئلة عامة:
- راجع `README.md`
- راجع `docs/01-Requirements.md`

---

## 🚦 الأوامر الأكثر استخداماً

### 🚀 التشغيل السريع:
```bash
# تشغيل بـ Docker (الأسهل!)
docker-compose up -d

# تشغيل مباشر
node src/bot.js

# تثبيت المكتبات
npm install
```

### 🧪 الاختبارات:
```bash
# اختبار شامل (269 اختبار)
npm test

# اختبارات فرعية
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 📝 Git المطورين:
```bash
# حفظ التغييرات
git add .
git commit -m "message"
git push origin main

# تحديث من GitHub
git pull origin main
```

### 🐳 Docker المتقدم:
```bash
# بناء الصورة
docker build -t telegram-bot .

# تشغيل الحاوية
docker run -d --name telegram-bot telegram-bot

# عرض السجلات
Get-Content data/logs/combined.log -Tail 20
```

### 🔍 المراقبة والصيانة:
```bash
# فحص حالة Docker
docker ps
docker logs telegram-bot

# فحص الاختبارات التلقائية
# (GitHub Actions تُشغل تلقائياً عند كل push)
```

---

**آخر تحديث:** 2025-10-03  
**الإصدار:** 1.0.0 Production Ready  

---

## 🎉 خلاصة المشروع الحالية:

✅ **المشروع مكتمل 90%** مع إمكانية استخدام إنتاجية فورية!  
🧪 **269/269 اختبار نجح** - جودة عالمية مضمونة  
🐳 **Docker Ready** - نشر سهل عبر docker-compose  
🔄 **CI/CD Pipeline** - GitHub Actions للفوجات والانقسامات تلقائياً  
🛡️ **أمان شامل** - معالجة أخطاء متقدمة وسياسات أمان محددة

> 💡 **نصيحة:** هذا البوت جاهز للاستخدام الإنتاجي المباشر! رأسنا فقط `docker-compose up -d` للبدء بعد إعداد ملف `.env`
