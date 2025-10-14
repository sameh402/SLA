# دليل إعداد Firebase للكورسات

## المشكلة الحالية
النظام يحاول جلب الكورسات من Firebase ولكن لا يجد أي كورسات.

## الحل السريع

### 1. تحقق من Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `lmssally-a0957`
3. اذهب إلى **Firestore Database**

### 2. إنشاء مجموعة الكورسات
إذا لم تكن موجودة:
1. اضغط على **"Start collection"**
2. اسم المجموعة: `courses`
3. أضف المستند الأول:

**اسم المستند:** `course-1`

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
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. تحقق من قواعد الأمان
في Firebase Console > Firestore > Rules، استخدم هذه القواعد المحدثة:

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
    // Anyone can read basic course info (title, image, description, instructor)
    // Only authenticated users can create/update/delete
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

### 4. اختبار النظام
1. أعد تحميل الصفحة الرئيسية
2. يجب أن تظهر الكورسات من Firebase
3. تحقق من Console للأخطاء

## رسائل الخطأ الشائعة

### "No courses found in Firebase database"
**الحل:** أضف كورسات إلى مجموعة `courses` في Firestore

### "Firebase database not initialized"
**الحل:** تحقق من ملف `src/lib/firebase.tsx`

### "Permission denied"
**الحل:** تحقق من قواعد الأمان في Firebase Console

## ملاحظة مهمة
النظام الآن **لا يستخدم أي بيانات وهمية** - يجب أن تكون الكورسات موجودة في Firebase لتعمل الواجهة.
