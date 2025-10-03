# 🤝 دليل المساهمة - Contributing Guide

**المشروع:** Telegram Bot Template  
**النسخة:** 1.0  
**التحديث الأخير:** 2025-10-03

---

## 🎯 مرحباً بك!

شكراً لاهتمامك بالمساهمة في **Telegram Bot Template**. هذا المشروع يهدف إلى توفير قالب متكامل ومتقدم لبناء بوتات تلغرام احترافية.

---

## 📋 قبل البدء

### متطلبات المساهمة
1. ✅ **تعرف على المشروع:** اقرأ [README.md](README.md)
2. ✅ **فهم البنية:** راجع [Architecture](docs/04-Architecture.md)
3. ✅ **معايير الكود:** اتبع [Naming Conventions](docs/05-Naming-Conventions.md)
4. ✅ **دليل الاختبارات:** [Testing Guide](docs/06-Testing-Guide.md)
5. ✅ **معايير Commit:** [Commit Guide](docs/07-Git-Commits.md)

---

## 🔄 عملية المساهمة

### 1. Fork المشروع
```bash
# Fork في GitHub، ثم clone
git clone https://github.com/YOUR_USERNAME/TelegramBotTemplate.git
cd TelegramBotTemplate

# إضافة الـ remote الأصلي
git remote add upstream https://github.com/alsaadacomp/TelegramBotTemplate.git
```

### 2. إنشاء Branch جديد
```bash
# تنسيق Branch Names
git checkout -b feature/new-amazing-feature    # ميزة جديدة
git checkout -b fix/bug-description             # إصلاح bug
git checkout -b docs/update-readme              # تحديث توثيق
git checkout -b test/add-validation-tests       # إضافة اختبارات
```

### 3. التطوير والكتابة
- 🔍 **اكتب كود نظيف وواضح**
- 📝 **أضف تعليقات JSDoc باللغة العربية**
- 🧪 **اكتب اختبارات شاملة**
- 📖 **حدّث التوثيق عند الحاجة**

### 4. اختبار الكود
```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات محددة
npm run test:unit
npm run test:integration  
npm run test:e2e

# فحص جودة الكود
npm run lint
npm run lint:fix

# فحص تغطية الاختبارات
npm test -- --coverage
```

### 5. Commit التغييرات
```bash
# مثال Commit Messages الصحيح
git add .
git commit -m "feat(auth): تحسين نظام المصادقة وإضافة متعدد العوامل

- إضافة دعم للمصادقة الثنائية
- تحسين استخراج معلومات المستخدم من تلغرام
- إضافة شاشة ترحيب جديدة للمستخدمين الجدد
- إضافة 5 اختبارات جديدة لنظام auth.middleware

يدعم: #123
Fixes: #456"

git push origin feature/new-amazing-feature
```

---

## 📝 معايير الكود

### قواعد JavaScript/Node.js
- ✅ استخدم **ES6+** syntax
- ✅ التزم بقواعد **ESLint** المحددة
- ✅ استخدم **const** و **let** بدلاً من **var**
- ✅ استخدم **template literals** للسلاسل النصية
- ✅ استخدم **async/await** بدلاً من Promises
- ✅ اتبع **camelCase** للمتغيرات والدوال

### قواعد التعليقات
```javascript
/**
 * معالجة طلبات الانضمام الجديدة
 * @async
 * @function handleJoinRequest
 * @param {Object} ctx - سياق التلغرام
 * @param {Object} payload - بيانات الطلب
 * @param {string} payload.email - البريد الإلكتروني
 * @param {string} payload.phone - رقم الهاتف
 * @returns {Promise<Object>} نتيجة المعالجة
 * @throws {ValidationError} عند خطأ في البيانات
 * @throws {PermissionError} عند عدم وجود الصلاحيات
 * 
 * @example
 * const result = await handleJoinRequest(ctx, {
 *   email: 'user@example.com',
 *   phone: '+966501234567'
 * });
 */
async function handleJoinRequest(ctx, payload) {
  // ... تطبيق الدالة
}
```

### قواعد الأخطاء
- 🚨 **استخدم Error Classes** الواردة في `src/utils/error-handler.util.js`
- 🚨 **قم بتدوين الأخطاء** باستخدام `logger.error()`
- 🚨 **أرج الأخطاء المناسبة** للسيرفر أو المستخدم
- 🚨 **اختبر سيناريوهات فشل الأخطاء**

---

## 🧪 الاختبارات

### أنواع الاختبارات المطلوبة

#### Unit Tests (اختبارات الوحدة)
```javascript
// tests/unit/services/permission.service.test.js
describe('Permission Service', () => {
  test('should allow admin access to admin features', async () => {
    const mockUser = { role: 'admin' };
    const result = await permissionService.checkAccess(mockUser, 'admin.settings');
    expect(result).toBe(true);
  });
});
```

#### Integration Tests (اختبارات التكامل)
```javascript
// tests/integration/database-cache.test.js
describe('Database + Cache Integration', () => {
  test('should cache user after database fetch', async () => {
    // ... اختبار التكامل بين قواعد البيانات والكاش
  });
});
```

#### E2E Tests (اختبارات النهاية)
```javascript
// tests/e2e/start-command.test.js
describe('Start Command E2E', () => {
  test('should register new user on /start', async () => {
    // ... اختبار تدفق المستخدم الكامل
  });
});
```

### المعايير المطلوبة
- ✅ **تغطية اختبارات > 60%** للكود الرئيسي
- ✅ **جميع الاختبارات يجب أن تنجح** قبل الـ merge
- ✅ **اختبارات التكامل** مع قاعدة البيانات والكاش
- ✅ **اختبارات أخطاء** للسيناريوهات المختلفة
- ✅ **اختبارات الأداء** للعمليات الحرجة

---

## 📚 التوثيق

### تحديث التوثيق
عند إضافة ميزات جديدة:
1. 📝 **حدّث [README.md](README.md)** في قسم الميزات
2. 📝 **أضف إلى [CHANGELOG.md](CHANGELOG.md)** مع وصف التغيير
3. 📝 **حدّث [docs/04-Architecture.md](docs/04-Architecture.md)** إذا تغيرت البنية
4. 📝 **أضف JSDoc** للدوال والكلاسات الجديدة

### مثال تحديث CHANGELOG
```markdown
## [1.1.0] - 2025-10-xx

### Added
- 🚀 إضافة نظام المصادقة الثنائية
- 📊 لوحة تحكم جديدة للإحصائيات المفصلة
- 🔔 نظام إشعارات ذكي للمشرفين

### Changed
- ⚡ تحسين أداء استعلامات قاعدة البيانات بنسبة 40%
- 🎨 تحديث تصميم لوحة التحكم الرئيسية

### Fixed
- 🐛 إصلاح مشكلة تحديث حالة المحادثات
- 🐛 تحسين معالجة أخطاء الاتصال بقاعدة البيانات
```

---

## 🔄 Pull Request Process

### قبل فتح PR
```bash
# اجلب آخر التحديثات
git fetch upstream
git checkout main
git merge upstream/main

# حدّث branch الخاص بك
git checkout feature/new-amazing-feature
git rebase main

# تأكد أن جميع الاختبارات تنجح
npm test && npm run lint
```

### فتح Pull Request
1. 📝 **اكتب عنوان واضح ومفصل**
2. 📝 **اشرح التغييرات والأسباب**
3. 📝 **أذكر الارتباط بـ Issues ذات الصلة**
4. 📝 **أرفق لقطات شاشة** إذا كان هناك تغييرات مرئية
5. 📝 **حدّد Reviewer** منفصلاً

### مثال PR Title والوصف
```
feat(auth): إضافة نظام المصادقة الثنائية واحتبار تحليلي متقدم

## 📝 الوصف

هذا PR يضيف نظام مصادقة ثنائية متطور لإدارة أفضل للمستخدمين والتأكد من الأمان.

## 🚀 الميزات الجديدة
- مصادقة ثنائية عبر SMS وفيريمير
- لوحة تحكم أمنية للمشرفين
- إحصائيات تحليلية متقدمة للنشاط
- نظام إنذارات ذكي للأحداث الحرجة

## 🧪 التغييرات التقنية
- إضافة auth.middleware.ts جديد
- تحديث permission.service.js لدعم أدوار أمنية جديدة
- إضافة 15 وحدة اختبار جديدة
- تحديث migration 2025-10-xx لجدول الأمان الجديد

## 🔗 المرتبط بـ Issues
- Closes #123
- Related to #456

## ✅ الاختبارات
- [x] Unit tests: 15/15 نجحوا
- [x] Integration tests: 5/5 نجحوا  
- [x] E2E tests: 3/3 نجحوا
- [x] Coverage: 67% (أعلى من الحد الأدنى 60%)
- [x] Lint: لا أخطاء

## 📸 لقطات الشاشة
- ![صفحة إعدادات الأمان الجديدة](screenshots/security-settings.png)
- ![لوحة الإحصائيات](screenshots/stats-dashboard.png)

## 🔧 كيفية الاختبار
1. قم بـ checkout على Branch هذا
2. شغّل `npm install && npm test`
3. اختبر المصادقة الثنائية في `tests/manuali/test-auth.js`
```

### مراجعة Pull Request
سيتم مراجعة PR لديك بناءً على:
- ✅ **صحة الكود** والامتثال للمعايير
- ✅ **جودة الاختبارات** والتغطية
- ✅ **صحة التوثيق** والوصف
- ✅ **الأمان** والخصوصية
- ✅ **الأداء** والتأثير على السرعة

---

## 📋 قوالب مفيدة

### Template Commit Message
```
type(scope): وصف مختصر للتغيير

وصف مفصل للتغيير والإشارة إلى المشاكل المحلولة.

يمكن أن تحتوي على عدة فقرات تشرح المشاكل، التصحيحات، 
والتحسينات المرتبطة بالتغيير.

يرجى استخدام الأزرار المرجعية لإغلاق Issues تلقائياً، مثل:
Closes #123, #456
Relates to #789

Co-authored-by: اسم المساهم <email@example.com>
```

### Template Pull Request
```markdown
## 📝 التغيير المطلوب
وصف التغيير المطلوب والسبب وراءه.

## 🚀 نوع التغيير
- [ ] 🐛 Bug fix (إصلاح خطأ غير كسر للكود موجود)
- [ ] ✨ New feature (ميزة جديدة غير كسر للكود موجود)  
- [ ] 💥 Breaking change (إصلاح أو ميزة كسر للكود الموجود)
- [ ] 📖 Documentation updates
- [ ] 🧪 Test improvements
- [ ] ⚡ Performance improvements
- [ ] 🔧 Code refactor

## 🧪 الاختبارات
- [ ] الاختبارات الحالية تعمل
- [ ] تم إضافة اختبارات جديدة للوظائف الجديدة
- [ ] إجمالي التغطية أعلى من الحد الأدنى

## 📚 مراجعة التوثيق
- [ ] README.md محدث إذا لزم الأمر
- [ ] التوثيق التقني محدث إذا لزم الأمر
- [ ] تشير التغييرات إلى ملفات CHANGELOG.md

## 📞 شخص للتواصل
قائمة الأشخاص المهتمين بهذا التغيير عند الحاجة للمراجعة.
```

---

## ❓ أسئلة شائعة

### هل يمكنني المساهمة حتى لو لم أكن مطوراً؟
نعم! نحن نقبل المساهمات في:
- 📖 **التوثيق** وترجمة الكتب
- 🐛 **الإبلاغ عن أخطاء** واقتراح تحسينات
- 🎨 **الرسومات** والتصاميم
- 🧪 **الإرشادات** والكتابة والتدقيق اللغوي

### كيف أبدأ إذا كنت جديداً في JavaScript؟
1. 📚 **اطلع على** [JavaScript tutorial](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
2. 🧪 **تدرب على** كتابة اختبارات بسيطة
3. 🔧 **ابدأ بالأخطاء البسيطة** في Issues مُعلّمَة بـ "good first issue"
4. 💬 **اسأل في** [Discussions](https://github.com/alsaadacomp/TelegramBotTemplate/discussions)

### كيف أربط Issues بالـ Commits؟
```bash
# لإغلاق Issue تلقائياً عند commit
git commit -m "fix(auth): إصلاح المصادقة الصيفية 

Closes #123"

# لربط Commits بـ Issues موجودة
git commit -m "feat(ui): تحسين واجهة المستخدم

Related to: #456, #789"
```

---

## 🎯 نصائح للمساهمة الناجحة

### 1. البساطة أولاً
- 🎯 **ركز على مشكلة واحدة** في كل PR
- 🧪 **اكتب اختبارات بسيطة وواضحة**
- 📝 **اكتب توثيق واضح ومفهوم**

### 2. التفاعل الايجابي
- 💭 **اقرأ الكود الموجود** قبل كتابة جديد
- 🗓️ **رد على المراجعات** في غضون يومين
- 🤝 **كن متعاوناً** وتقبّل النقد البناء

### 3. التعلم المستمر
- 📖 **اقرأ التعليمات** الواردة في الـ Issues
- 🔍 **استفد من مراجعات** الـ PR للآخرين
- 💡 **اقترح تحسينات** على العملية

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل أو لديك أسئلة:

1. 📝 **افتح Issue** في [Issues](https://github.com/alsaadacomp/TelegramBotTemplate/issues)
2. 💬 **شارك في** [Discussions](https://github.com/alsaadacomp/TelegramBotTemplate/discussions)
3. 📧 **راسلنا** على alsaada@example.com
4. 📱 **انضم لقناة** المشروع على تلغرام

---

## 🙏 شكر خاص

شكراً لكل من يساهم في جعل هذا المشروع أفضل ليستفيد منه المجتمع! 🚀

**أُنشئ:** 2025-10-03  
**آخر تحديث:** 2025-10-03  
**الإصدار:** 1.0

---

*🚀 النجاح يبدأ بخطوة واحدة - ابدأ مساهمتك اليوم!*
