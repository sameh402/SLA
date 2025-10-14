# إعداد الكورسات في Firebase

## نظرة عامة

تم تحديث الصفحة الرئيسية لاستدعاء الكورسات من Firebase بدلاً من البيانات الوهمية. النظام الآن يدعم:

- جلب الكورسات من Firebase Firestore
- عرض الإحصائيات الحقيقية (عدد الكورسات، عدد الطلاب)
- عرض فئات الكورسات مع العدد الحقيقي لكل فئة
- معالجة حالات التحميل والأخطاء
- دعم البيانات المفقودة مع قيم افتراضية

## هيكل البيانات في Firebase

### مجموعة `courses`

كل كورس يجب أن يحتوي على الحقول التالية:

```typescript
interface Course {
  id: string;                    // معرف فريد (يتم إنشاؤه تلقائياً)
  title: string;                 // عنوان الكورس
  description: string;           // وصف الكورس
  instructor: string;            // اسم المدرب
  instructorAvatar: string;      // صورة المدرب
  image: string;                 // صورة الكورس
  price: number;                 // السعر
  originalPrice?: number;        // السعر الأصلي (اختياري)
  discount?: number;             // نسبة الخصم (اختياري)
  rating: number;                // التقييم (0-5)
  reviews: number;               // عدد المراجعات
  students: number;              // عدد الطلاب
  duration: string;              // مدة الكورس
  lessons: number;               // عدد الدروس
  level: "Beginner" | "Intermediate" | "Advanced"; // المستوى
  category: string;              // الفئة (مهم جداً)
  tags: string[];                // العلامات
  features: string[];            // المميزات
  isPopular: boolean;            // هل هو شائع
  isBestseller: boolean;         // هل هو الأكثر مبيعاً
  isNew: boolean;                // هل هو جديد
  lastUpdated: string;           // آخر تحديث
  language: string;              // اللغة
  certificate: boolean;          // هل يحتوي على شهادة
  createdAt: string;             // تاريخ الإنشاء
  updatedAt: string;             // تاريخ التحديث
}
```

### الفئات المدعومة

النظام يدعم الفئات التالية:

- `Languages` - اللغات
- `Development` - البرمجة والتطوير
- `Design` - التصميم
- `Healthcare` - الرعاية الصحية
- `Business` - الأعمال
- `Math` - الرياضيات

## كيفية إضافة كورسات جديدة

### 1. من خلال Firebase Console

1. اذهب إلى Firebase Console
2. اختر مشروعك
3. اذهب إلى Firestore Database
4. اختر مجموعة `courses`
5. اضغط على "Add document"
6. املأ البيانات المطلوبة

### 2. من خلال الكود

```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const addCourse = async () => {
  const courseData = {
    title: "دورة البرمجة المتقدمة",
    description: "تعلم البرمجة من الصفر إلى الاحتراف",
    instructor: "أحمد محمد",
    instructorAvatar: "https://example.com/avatar.jpg",
    image: "https://example.com/course-image.jpg",
    price: 99.99,
    originalPrice: 199.99,
    discount: 50,
    rating: 4.8,
    reviews: 150,
    students: 2500,
    duration: "40 hours",
    lessons: 120,
    level: "Advanced",
    category: "Development", // مهم جداً
    tags: ["programming", "javascript", "react"],
    features: ["Lifetime Access", "Certificate", "Mobile App"],
    isPopular: true,
    isBestseller: false,
    isNew: true,
    lastUpdated: new Date().toISOString(),
    language: "Arabic",
    certificate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'courses'), courseData);
    console.log('Course added with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding course: ', error);
  }
};
```

## الميزات الجديدة

### 1. جلب الكورسات التلقائي

- يتم جلب الكورسات تلقائياً عند تحميل الصفحة
- دعم ترتيب الكورسات حسب تاريخ الإنشاء
- حد أقصى 20 كورس للصفحة الرئيسية

### 2. الإحصائيات الديناميكية

- عدد الكورسات الإجمالي
- عدد الطلاب الإجمالي
- عدد الكورسات لكل فئة

### 3. معالجة الأخطاء

- عرض رسائل خطأ واضحة
- إمكانية إعادة المحاولة
- قيم افتراضية للبيانات المفقودة

### 4. حالات التحميل

- عرض skeleton loading أثناء التحميل
- تحسين تجربة المستخدم

## استكشاف الأخطاء

### إذا لم تظهر الكورسات:

1. تحقق من اتصال Firebase
2. تحقق من وجود مجموعة `courses` في Firestore
3. تحقق من console في المتصفح للأخطاء
4. تأكد من أن الكورسات تحتوي على حقل `category`

### إذا ظهرت أخطاء:

1. تحقق من إعدادات Firebase
2. تحقق من قواعد الأمان في Firestore
3. تأكد من أن المستخدم لديه صلاحية القراءة

## ملاحظات مهمة

- حقل `category` مهم جداً لعرض الفئات بشكل صحيح
- تأكد من أن الصور متاحة ومتاحة للوصول العام
- استخدم تنسيق ISO للتواريخ
- تأكد من أن الأرقام صحيحة (rating بين 0-5)

## الدعم

إذا واجهت أي مشاكل، تحقق من:
1. Console في المتصفح
2. Network tab في Developer Tools
3. Firebase Console للأخطاء
