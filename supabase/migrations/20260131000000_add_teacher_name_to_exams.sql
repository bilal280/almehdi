-- إضافة عمود teacher_name إلى جدول student_exams
-- هذا يسمح بحفظ اسم المدرس عند إنشاء الاختبار
-- حتى لو انتقل الطالب لمدرس آخر، تبقى الاختبارات مرتبطة بالمدرس الأصلي

ALTER TABLE public.student_exams 
ADD COLUMN IF NOT EXISTS teacher_name text;

-- إضافة index لتحسين البحث بحسب اسم المدرس
CREATE INDEX IF NOT EXISTS idx_student_exams_teacher_name 
ON public.student_exams(teacher_name);

-- تحديث السجلات الموجودة لإضافة اسم المدرس من جدول الطلاب
-- (الطالب -> الحلقة -> المدرس)
UPDATE public.student_exams se
SET teacher_name = t.name
FROM public.students s
JOIN public.circles c ON s.circle_id = c.id
JOIN public.teachers t ON c.teacher_id = t.id
WHERE se.student_id = s.id 
AND se.teacher_name IS NULL;

-- إضافة تعليق على العمود
COMMENT ON COLUMN public.student_exams.teacher_name IS 'اسم المدرس الذي أجرى الاختبار - يحفظ عند إنشاء الاختبار ولا يتغير';
