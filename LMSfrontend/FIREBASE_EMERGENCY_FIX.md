# حل طارئ لمشكلة Permission Denied

## المشكلة الحالية
```
Something went wrong. Please try again.
Permission denied. Please check Firebase security rules.
```

## الحل الطارئ - قواعد مبسطة 100%

### 1. استخدم هذه القواعد المبسطة جداً:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // =============================
    // COURSES - OPEN ACCESS
    // =============================
    match /courses/{courseId} {
      allow read, write: if true; // مؤقت - للاختبار فقط
    }

    // =============================
    // USERS
    // =============================
    match /users/{userId} {
      allow read, write: if true; // مؤقت - للاختبار فقط
    }

    // =============================
    // ENROLLMENTS
    // =============================
    match /enrollments/{enrollmentId} {
      allow read, write: if true; // مؤقت - للاختبار فقط
    }

    // =============================
    // PAYMENTS
    // =============================
    match /payments/{paymentId} {
      allow read, write: if true; // مؤقت - للاختبار فقط
    }

    // =============================
    // DEFAULT DENY
    // =============================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## خطوات التطبيق السريع

### 1. اذهب إلى Firebase Console
- [Firebase Console](https://console.firebase.google.com/)
- اختر مشروع `lmssally-a0957`
- اذهب إلى **Firestore Database** > **Rules**

### 2. انسخ والصق القواعد المبسطة أعلاه
### 3. اضغط **Publish**

## إضافة كورس تجريبي

### 1. اذهب إلى Firestore Database
### 2. اضغط على **"Start collection"**
### 3. اسم المجموعة: `courses`
### 4. أضف المستند الأول:

**اسم المستند:** `test-course`

**البيانات:**
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
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "status": "published"
}
```

## اختبار سريع

### 1. أعد تحميل الصفحة الرئيسية
### 2. أعد تحميل صفحة المتجر
### 3. تحقق من Console للأخطاء

## إذا لم تعمل

### 1. تحقق من Console في المتصفح (F12)
### 2. ابحث عن رسائل خطأ Firebase
### 3. تأكد من وجود الكورس في Firestore

## ملاحظة مهمة

هذه القواعد مؤقتة للاختبار فقط. بعد التأكد من عمل النظام، يمكنك تطبيق قواعد أمان أكثر صرامة.

## اختبار سريع في Console

افتح Console في المتصفح واكتب:
```javascript
// اختبار Firebase
console.log('Testing Firebase connection...');
```

يجب أن ترى رسائل Firebase في Console.
