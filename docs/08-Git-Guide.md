# 🔄 دليل أوامر Git - نسخة المرحلة 1.5

## 📋 الخطوات

### 1️⃣ التحضير

افتح PowerShell أو Git Bash في مجلد المشروع:
```powershell
cd F:\_Alsaada_Telegram_Bot\TelegramBotTemplate
```

---

### 2️⃣ تحديث ملف التقدم

انسخ الملف المحدث:
```powershell
# احذف الملف القديم
Remove-Item docs\03-Progress-Tracker.md

# انسخ الملف الجديد (ستجده في التحميلات)
Copy-Item "المسار_للملف_المحدث\03-Progress-Tracker-UPDATED.md" "docs\03-Progress-Tracker.md"
```

---

### 3️⃣ التحقق من الحالة

```bash
git status
```

يجب أن ترى:
```
modified:   docs/03-Progress-Tracker.md
```

---

### 4️⃣ إضافة التغييرات

```bash
# إضافة جميع التغييرات
git add .

# أو إضافة ملف محدد
git add docs/03-Progress-Tracker.md
```

---

### 5️⃣ عمل Commit

```bash
git commit -m "feat(phase-1.5): complete error handling system

✅ Error Handler Utility (100%)
✅ Error Middleware (100%)
✅ 10 Custom Error Classes
✅ All tests passed (12/12)
✅ Arabic user messages
✅ English console logs

Phase 1.5 completed successfully!
Progress: 50% of Phase 1"
```

---

### 6️⃣ دفع التغييرات لـ GitHub

```bash
# إذا كانت أول مرة تدفع للريبو
git remote add origin https://github.com/alsaadacomp/TelegramBotTemplate.git

# دفع التغييرات
git push -u origin main

# إذا كان الفرع الرئيسي اسمه master
git push -u origin master
```

---

### 7️⃣ التحقق من النجاح

بعد الدفع، افتح:
```
https://github.com/alsaadacomp/TelegramBotTemplate
```

تأكد من:
- ✅ الملفات محدثة
- ✅ الـ commit message ظاهر
- ✅ تاريخ آخر تحديث صحيح

---

## 🔍 حل المشاكل المحتملة

### مشكلة: Git لم يتم تهيئته

```bash
git init
git remote add origin https://github.com/alsaadacomp/TelegramBotTemplate.git
```

### مشكلة: تعارض في الملفات

```bash
# سحب التغييرات من GitHub أولاً
git pull origin main --rebase

# ثم دفع التغييرات
git push origin main
```

### مشكلة: رفض الدفع (rejected)

```bash
# فرض الدفع (احذر: يحذف التاريخ البعيد)
git push -f origin main
```

### مشكلة: نسيت إضافة ملفات

```bash
# إضافة الملفات المنسية
git add path/to/forgotten/file

# تعديل آخر commit
git commit --amend --no-edit

# دفع مع فرض التحديث
git push -f origin main
```

---

## 📊 التحقق من السجل

```bash
# عرض آخر commit
git log -1

# عرض التغييرات في آخر commit
git show

# عرض جميع الملفات المتتبعة
git ls-files
```

---

## 🎯 الخطوات التالية بعد الدفع

1. ✅ تحقق من GitHub
2. ✅ أغلق هذا الـ milestone
3. ✅ ابدأ المرحلة 1.6 (نظام الصلاحيات)

---

## 📝 ملاحظات

- استخدم `git status` قبل أي أمر
- اقرأ رسائل الخطأ بعناية
- لا تستخدم `-f` (force) إلا للضرورة
- احتفظ بنسخة احتياطية قبل أي عملية force

---

**تم إنشاؤه:** 2025-10-01 19:00  
**الإصدار:** المرحلة 1.5  
**التقدم:** 50% من المرحلة 1
