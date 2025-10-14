# حل مشكلة Permission Denied

## المشكلة الحالية
```
Something went wrong. Please try again.
Permission denied. Please check Firebase security rules.
```

## السبب
المشكلة في الشرط المعقد في قواعد الأمان:
```javascript
(!isAuthenticated() && request.resource == null)
```

هذا الشرط لا يعمل بشكل صحيح مع Firestore.

## الحل السريع

### 1. استخدم هذه القواعد المبسطة:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return isAuthenticated() ? 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data : null;
    }

    function isAdmin() {
      return isAuthenticated() && getUserData().role in ['admin', 'editor'];
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // =============================
    // USERS
    // =============================
    match /users/{userId} {
      allow create, read, update, delete: if isAuthenticated();
    }

    // =============================
    // COURSES - FIXED RULES
    // =============================
    match /courses/{courseId} {
      // السماح بالقراءة للجميع (الكورسات المنشورة فقط)
      allow read: if resource.data.status == 'published';
      
      // فقط المسجلون يمكنهم إنشاء/تعديل/حذف
      allow create, update, delete: if isAuthenticated();
    }

    // =============================
    // ENROLLMENTS
    // =============================
    match /enrollments/{enrollmentId} {
      allow create, read, update, delete: if isAuthenticated();
    }

    // =============================
    // PAYMENTS
    // =============================
    match /payments/{paymentId} {
      allow create, read, update, delete: if isAuthenticated();
    }

    // =============================
    // CERTIFICATES
    // =============================
    match /certificates/{certificateId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create, update: if isAdmin() || (isOwner(request.resource.data.userId));
    }

    // =============================
    // ANALYTICS
    // =============================
    match /analytics/{document=**} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // =============================
    // SETTINGS
    // =============================
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // =============================
    // NOTIFICATIONS
    // =============================
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isAdmin() || isOwner(request.resource.data.userId);
      allow update: if isOwner(resource.data.userId) && 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'readAt']);
    }

    // =============================
    // SUPPORT
    // =============================
    match /support/{ticketId} {
      allow read, create, update: if isOwner(resource.data.userId) || 
                                   isOwner(request.resource.data.userId) || 
                                   isAdmin();
    }

    // =============================
    // LOGS
    // =============================
    match /logs/{document=**} {
      allow read: if isAdmin();
      allow write: if false;
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

### 2. إذا لم تعمل، استخدم هذه القواعد المؤقتة:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }

    // =============================
    // COURSES - TEMPORARY OPEN ACCESS
    // =============================
    match /courses/{courseId} {
      allow read: if true; // مؤقت - للاختبار فقط
      allow create, update, delete: if isAuthenticated();
    }

    // =============================
    // USERS
    // =============================
    match /users/{userId} {
      allow create, read, update, delete: if isAuthenticated();
    }

    // =============================
    // ENROLLMENTS
    // =============================
    match /enrollments/{enrollmentId} {
      allow create, read, update, delete: if isAuthenticated();
    }

    // =============================
    // PAYMENTS
    // =============================
    match /payments/{paymentId} {
      allow create, read, update, delete: if isAuthenticated();
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

## خطوات التطبيق

### 1. اذهب إلى Firebase Console
- [Firebase Console](https://console.firebase.google.com/)
- اختر مشروع `lmssally-a0957`
- اذهب إلى **Firestore Database** > **Rules**

### 2. انسخ والصق القواعد الجديدة
- استخدم القواعد المبسطة أعلاه
- اضغط **Publish**

### 3. تأكد من وجود حقل `status` في الكورسات
```json
{
  "title": "دورة تجريبية",
  "status": "published",  // ← مهم جداً
  "description": "...",
  // باقي البيانات
}
```

## اختبار الحل

### 1. أعد تحميل الصفحة الرئيسية
### 2. تحقق من Console للأخطاء
### 3. إذا استمرت المشكلة، استخدم القواعد المؤقتة

## ملاحظة مهمة

القواعد المؤقتة تسمح بالوصول الكامل للكورسات - استخدمها فقط للاختبار، ثم عد للقواعد الآمنة بعد التأكد من وجود حقل `status` في الكورسات.
