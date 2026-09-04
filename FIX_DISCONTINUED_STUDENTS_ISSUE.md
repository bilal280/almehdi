# إصلاح مشكلة نقل الطلاب إلى المنقطعين

## المشكلة
عند محاولة نقل طالب إلى قائمة المنقطعين، يظهر الخطأ التالي:
```
insert or update on table "student_general_points_summary" violates foreign key constraint "student_general_points_summary_student_id_fkey"
```

## السبب
- عند نقل الطالب، يتم حذفه من جدول `students`
- جدول `student_general_points_summary` يحتوي على قيد مفتاح خارجي يربطه بجدول `students`
- عند حذف الطالب، يحاول النظام حذف السجلات المرتبطة، لكن يحدث تعارض في التوقيت

## الحل
تم إنشاء ملف هجرة جديد: `20260420000000_fix_discontinued_students_foreign_keys.sql`

هذا الملف يعدل دالة `move_student_to_discontinued` لحذف سجلات النقاط العامة يدوياً قبل حذف الطالب.

## خطوات تطبيق الإصلاح

### الطريقة 1: عبر Supabase Dashboard (موصى بها)
1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اذهب إلى مشروعك
3. افتح SQL Editor
4. انسخ محتوى الملف `supabase/migrations/20260420000000_fix_discontinued_students_foreign_keys.sql`
5. الصق في المحرر
6. اضغط Run

### الطريقة 2: عبر Supabase CLI
```bash
# تأكد من أن Supabase CLI مثبت
supabase --version

# قم بتسجيل الدخول (إذا لم تكن قد فعلت)
supabase login

# اربط المشروع
supabase link --project-ref YOUR_PROJECT_REF

# طبق الهجرة
supabase db push
```

### الطريقة 3: يدوياً عبر SQL
قم بتشغيل الكود SQL التالي في Supabase SQL Editor:

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

  -- حفظ نقاط الطالب العامة قبل الحذف (اختياري - للسجل)
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

  -- حذف السجلات من student_general_points_summary يدوياً
  DELETE FROM student_general_points_summary WHERE student_id = p_student_id;

  -- حذف السجلات من student_general_points_log يدوياً
  DELETE FROM student_general_points_log WHERE student_id = p_student_id;

  -- حذف الطالب من جدول الطلاب النشطين
  DELETE FROM public.students WHERE id = p_student_id;

  RETURN true;
END;
$;
```

## التحقق من نجاح الإصلاح
بعد تطبيق الإصلاح:
1. جرب نقل طالب إلى المنقطعين
2. يجب أن تتم العملية بنجاح دون أخطاء
3. تحقق من أن الطالب ظهر في قائمة المنقطعين
4. تحقق من أن السجلات القديمة ما زالت محفوظة

## ملاحظات مهمة

### ما يتم حفظه:
- ✅ معلومات الطالب الأساسية
- ✅ جميع سجلات الحضور والغياب (student_attendance)
- ✅ جميع الأعمال اليومية (student_daily_work)
- ✅ جميع الاختبارات (student_exams)
- ✅ جميع نقاط الحماسة (student_points - نوع enthusiasm)
- ✅ جميع نقاط الترتيب (student_ranking_points)
- ✅ المذاكرة الشهرية (monthly_reviews)
- ✅ المكافآت (student_rewards)

### ما يتم حذفه:
- ❌ سجلات النقاط العامة (student_general_points_log)
- ❌ ملخص النقاط العامة (student_general_points_summary)

**السبب:** النقاط العامة هي نقاط تحفيزية مؤقتة، وليست جزءاً من السجل الأكاديمي الدائم.

### استعادة طالب من المنقطعين:
عند استعادة طالب من المنقطعين:
- ✅ تُستعاد جميع معلوماته
- ✅ جميع السجلات القديمة تبقى موجودة (لأنها مرتبطة بنفس الـ ID)
- ⚠️ النقاط العامة تبدأ من الصفر (لأنها حُذفت)

## في حالة استمرار المشكلة
إذا استمرت المشكلة بعد تطبيق الإصلاح:

1. **تحقق من تطبيق الهجرة:**
```sql
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version = '20260420000000';
```

2. **تحقق من وجود الدالة المحدثة:**
```sql
SELECT pg_get_functiondef('public.move_student_to_discontinued(uuid, text)'::regprocedure);
```

3. **تحقق من القيود الحالية:**
```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'student_general_points_summary'::regclass;
```

4. إذا لم تنجح الحلول، اتصل بالدعم الفني مع لقطة شاشة للخطأ.

## التحديثات المستقبلية
- يمكن إضافة جدول منفصل لحفظ النقاط العامة للطلاب المنقطعين
- يمكن تحسين الدالة لحفظ نسخة من النقاط قبل الحذف

## التاريخ
- **تاريخ الإنشاء:** 2026-04-20
- **الإصدار:** 1.0
- **المطور:** Kiro AI Assistant
