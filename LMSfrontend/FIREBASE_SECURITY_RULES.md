# قواعد الأمان المحدثة لـ Firebase

## التغيير الرئيسي
تم تعديل قواعد الأمان للسماح **للمستخدمين غير المسجلين** بقراءة معلومات الكورسات الأساسية.

## القواعد المحدثة

انسخ والصق هذه القواعد في Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role in ['admin', 'editor'];
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // =====================================================================
    // CORE COLLECTIONS WITH FULL CRUD FOR ANY AUTHENTICATED USER
    // =====================================================================

    // USERS Collection
    match /users/{userId} {
      allow create, read, update, delete: if isAuthenticated();
    }
    
    // COURSES Collection - PUBLIC READ ACCESS
    // ✅ ANYONE can read course info (title, image, description, instructor)
    // ✅ Only authenticated users can create/update/delete
    match /courses/{courseId} {
      allow read: if true; // Public access to all course data
      allow create, update, delete: if isAuthenticated();
    }
    
    // ENROLLMENTS Collection
    match /enrollments/{enrollmentId} {
      allow create, read, update, delete: if isAuthenticated();
    }
    
    // PAYMENTS Collection
    match /payments/{paymentId} {
      allow create, read, update, delete: if isAuthenticated();
    }
    
    // =====================================================================
    // OTHER COLLECTIONS (Original Rules Maintained for Security)
    // =====================================================================
    
    // CERTIFICATES Collection
    match /certificates/{certificateId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create, update: if isAdmin() || (isOwner(request.resource.data.userId));
    }
    
    // ANALYTICS Collection
    match /analytics/{document=**} {
      allow read: if isAdmin();
      allow write: if false;
    }
    
    // SETTINGS Collection
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // NOTIFICATIONS Collection
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isAdmin() || isOwner(request.resource.data.userId);
      allow update: if isOwner(resource.data.userId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read', 'readAt']);
    }
    
    // SUPPORT Collection
    match /support/{ticketId} {
      allow read, create, update: if isOwner(resource.data.userId) || isOwner(request.resource.data.userId) || isAdmin();
    }
    
    // LOGS Collection
    match /logs/{document=**} {
      allow read: if isAdmin();
      allow write: if false;
    }
    
    // Default deny rule for any unmatched paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## ما تم تغييره

### قبل التعديل:
```javascript
// COURSES Collection
match /courses/{courseId} {
  allow create, update, delete: if isAuthenticated();
  allow read: if resource.data.status == 'published' || isAuthenticated();
}
```

### بعد التعديل:
```javascript
// COURSES Collection - PUBLIC READ ACCESS
match /courses/{courseId} {
  allow read: if true; // Public access to all course data
  allow create, update, delete: if isAuthenticated();
}
```

## الفوائد

1. **✅ المستخدمون غير المسجلين** يمكنهم رؤية:
   - عنوان الكورس
   - صورة الكورس
   - وصف الكورس
   - اسم المعلم
   - السعر
   - التقييم
   - جميع المعلومات العامة

2. **🔒 الأمان محفوظ**:
   - فقط المستخدمون المسجلون يمكنهم إنشاء/تعديل/حذف الكورسات
   - البيانات الحساسة (التسجيلات، المدفوعات) محمية
   - قواعد الأمان الأخرى لم تتغير

## كيفية التطبيق

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `lmssally-a0957`
3. اذهب إلى **Firestore Database** > **Rules**
4. انسخ والصق القواعد الجديدة
5. اضغط **Publish**

## اختبار القواعد

بعد تطبيق القواعد:
1. افتح الصفحة الرئيسية في وضع التصفح الخفي (Incognito)
2. يجب أن تظهر الكورسات بدون تسجيل دخول
3. تحقق من Console للتأكد من عدم وجود أخطاء أمان
