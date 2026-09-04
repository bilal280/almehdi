# كيفية إصلاح مشكلة نقل الطلاب إلى المنقطعين

## المشكلة 🔴
عند محاولة نقل طالب إلى قائمة الطلاب المنقطعين، تظهر رسالة خطأ باللون الأحمر.

## الحل السريع ⚡

### الخطوات (5 دقائق فقط):

#### 1️⃣ افتح Supabase Dashboard
- اذهب إلى: https://supabase.com/dashboard
- سجل الدخول إلى حسابك
- اختر مشروعك (المعهد)

#### 2️⃣ افتح SQL Editor
- من القائمة الجانبية، اضغط على **SQL Editor**
- اضغط على **New Query** (استعلام جديد)

#### 3️⃣ انسخ والصق الكود
انسخ الكود التالي **كاملاً** والصقه في المحرر:

```sql
CREATE OR REPLACE FUNCTION public.move_student_to_discontinued(
  p_student_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  v_student_record RECORD;
  v_general_points INTEGER;
BEGIN
  -- جلب بيانات الطالب
  SELECT * INTO v_student_record
  FROM public.students
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  -- حفظ نقاط الطالب العامة قبل الحذف
  SELECT COALESCE(total_points, 0) INTO v_general_points
  FROM student_general_points_summary
  WHERE student_id = p_student_id;

  -- نقل الطالب إلى جدول المنقطعين
  INSERT INTO public.discontinued_students (
    id,
    student_number,
    name,
    age,
    photo_url,
    circle_id,
    level,
    contact_number,
    contact_number_2,
    notes,
    discontinued_reason,
    original_created_at
  ) VALUES (
    v_student_record.id,
    v_student_record.student_number,
    v_student_record.name,
    v_student_record.age,
    v_student_record.photo_url,
    v_student_record.circle_id,
    v_student_record.level,
    v_student_record.contact_number,
    v_student_record.contact_number_2,
    v_student_record.notes,
    p_reason,
    v_student_record.created_at
  );

  -- حذف السجلات من جداول النقاط العامة
  DELETE FROM student_general_points_summary WHERE student_id = p_student_id;
  DELETE FROM student_general_points_log WHERE student_id = p_student_id;

  -- حذف الطالب من جدول الطلاب النشطين
  DELETE FROM public.students WHERE id = p_student_id;

  RETURN true;
END;
$;
```

#### 4️⃣ شغل الكود
- اضغط على زر **Run** (تشغيل) أو اضغط `Ctrl+Enter`
- انتظر حتى تظهر رسالة النجاح: ✅ **Success**

#### 5️⃣ جرب النظام
- ارجع إلى صفحة إدارة الطلاب
- جرب نقل طالب إلى المنقطعين
- يجب أن تتم العملية بنجاح! ✅

---

## ماذا يفعل هذا الإصلاح؟

- ✅ يحل مشكلة الخطأ عند نقل الطلاب
- ✅ يحفظ جميع سجلات الطالب (الحضور، الاختبارات، التسميع)
- ✅ ينقل الطالب بأمان إلى قائمة المنقطعين
- ✅ يتم حذف النقاط العامة فقط (وهي مؤقتة)

---

## إذا لم ينجح الحل

### تأكد من:
1. أنك نسخت الكود **كاملاً** بدون نقصان
2. أنك ضغطت على زر **Run**
3. أنك سجلت الدخول إلى المشروع الصحيح

### جرب مرة أخرى:
1. حدث الصفحة في المتصفح (F5)
2. حاول مرة أخرى نقل الطالب

### لا يزال لا يعمل؟
- التقط صورة شاشة للخطأ
- تواصل مع الدعم الفني
- أرسل الصورة مع رقم الطالب الذي تحاول نقله

---

## ملاحظات مهمة ⚠️

### عند نقل طالب إلى المنقطعين:
- ✅ **يُحفظ**: جميع سجلات الحضور والغياب
- ✅ **يُحفظ**: جميع الاختبارات ودرجاتها
- ✅ **يُحفظ**: جميع الأعمال اليومية
- ✅ **يُحفظ**: نقاط الحماسة
- ✅ **يُحفظ**: المكافآت
- ✅ **يُحفظ**: المذاكرة الشهرية
- ❌ **يُحذف**: النقاط العامة (التحفيزية)

### عند استعادة طالب من المنقطعين:
- ✅ تعود جميع السجلات المحفوظة
- ⚠️ النقاط العامة تبدأ من صفر

---

## الدعم الفني 📞

إذا واجهت أي مشكلة، يرجى التواصل مع:
- البريد الإلكتروني: [your-email@domain.com]
- الواتساب: [رقم الهاتف]

---

**تم الإصلاح بتاريخ:** 20 أبريل 2026  
**رقم الإصدار:** 1.0  
**الحالة:** ✅ تم الاختبار والتأكيد
