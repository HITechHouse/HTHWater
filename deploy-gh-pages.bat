@echo off
echo 🔄 بدء عملية النشر اليدوي إلى gh-pages...

:: انتقل إلى مجلد المشروع
cd /d %~dp0

:: حذف مجلد مؤقت إن وُجد
rmdir /s /q deploy
mkdir deploy
cd deploy

echo 🔁 نسخ ملفات البناء من dist...
xcopy ..\dist\*.* . /s /e /h /y

:: تهيئة git جديد داخل مجلد النشر
git init
git remote add origin https://github.com/HITechHouse/HTHWater.git
git checkout -b gh-pages

echo ➕ إضافة الملفات إلى git...
git add .
git commit -m "Manual deploy to gh-pages"

echo 📤 رفع الملفات إلى فرع gh-pages...
git push origin gh-pages --force

echo ✅ تم النشر بنجاح!
pause
