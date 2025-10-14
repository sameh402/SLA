# حل مشاكل Firebase - دليل استكشاف الأخطاء

## المشكلة الحالية
```
Something went wrong. Please try again.
Failed to fetch courses
```

## خطوات الحل

### 1. تحقق من Console في المتصفح

افتح Developer Tools (F12) واذهب إلى Console، يجب أن ترى رسائل مثل:
```
Firebase initialized: {app: true, analytics: true, auth: true, db: true, projectId: "lmssally-a0957"}
🔍 Starting Firebase Diagnostics...
```

### 2. تشغيل التشخيص اليدوي

في Console المتصفح، اكتب:
```javascript
testFirebase()
```

هذا سيعطيك تقرير مفصل عن حالة Firebase.

### 3. تحقق من إعدادات Firebase

#### أ) تحقق من Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `lmssally-a0957`
3. اذهب إلى Firestore Database
4. تحقق من وجود مجموعة `courses`

#### ب) تحقق من قواعد الأمان
في Firebase Console > Firestore > Rules، تأكد من وجود:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // مؤقت للاختبار
    }
  }
}
```

### 4. إضافة كورسات تجريبية

إذا لم تكن هناك كورسات، أضف كورس تجريبي:

#### من Firebase Console:
1. اذهب إلى Firestore Database
2. اضغط على "Start collection"
3. اسم المجموعة: `courses`
4. أضف المستند الأول:

```json
{
  "title": "دورة تجريبية",
  "description": "هذه دورة تجريبية للاختبار",
  "instructor": "مدرب تجريبي",
  "instructorAvatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
  "price": 99.99,
  "rating": 4.5,
  "reviews": 100,
  "students": 1000,
  "duration": "10 hours",
  "lessons": 20,
  "level": "Beginner",
  "category": "Development",
  "tags": ["test", "demo"],
  "features": ["Lifetime Access", "Certificate"],
  "isPopular": true,
  "isBestseller": false,
  "isNew": true,
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "language": "Arabic",
  "certificate": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. تحقق من الشبكة

#### أ) تحقق من اتصال الإنترنت
#### ب) تحقق من CORS (إذا كان هناك مشاكل)
#### ج) تحقق من Ad Blockers

### 6. إعادة تشغيل الخادم

```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

### 7. مسح Cache المتصفح

- اضغط Ctrl+Shift+R (أو Cmd+Shift+R على Mac)
- أو اذهب إلى Developer Tools > Network > Disable cache

## الحلول البديلة

### 1. البيانات الوهمية (Fallback)
النظام الآن يدعم البيانات الوهمية كبديل في حالة فشل Firebase. ستظهر رسالة:
```
تم تحميل البيانات الوهمية كبديل. تحقق من إعدادات Firebase.
```

### 2. إعداد Firebase محلي
إذا استمرت المشكلة، يمكنك إعداد Firebase محلياً:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

## رسائل الخطأ الشائعة

### 1. "Permission denied"
**الحل:** تحقق من قواعد الأمان في Firebase Console

### 2. "Network error"
**الحل:** تحقق من اتصال الإنترنت وإعدادات الشبكة

### 3. "Collection not found"
**الحل:** تأكد من وجود مجموعة `courses` في Firestore

### 4. "Firebase not initialized"
**الحل:** تحقق من ملف `src/lib/firebase.tsx`

## اختبار سريع

افتح Console في المتصفح واكتب:
```javascript
// اختبار Firebase
console.log('Firebase db:', window.firebase || 'Not found');

// اختبار البيانات
fetch('/api/test').then(r => r.json()).then(console.log);
```

## الدعم

إذا استمرت المشكلة:
1. تحقق من Console للأخطاء
2. تحقق من Network tab في Developer Tools
3. تأكد من إعدادات Firebase
4. جرب البيانات الوهمية كبديل

## ملاحظة مهمة

النظام الآن يدعم **Fallback للبيانات الوهمية**، لذلك حتى لو فشل Firebase، ستظهر الكورسات والواجهة ستعمل بشكل طبيعي.
