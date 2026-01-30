-- إصلاح قيود جدول الاختبارات لدعم المنهجية الجديدة
-- المشكلة: juz_number كان مطلوباً (NOT NULL) والقيد UNIQUE يمنع اختبارات التثبيت

-- الخطوة 1: حذف القيد UNIQUE القديم
ALTER TABLE public.student_exams 
DROP CONSTRAINT IF EXISTS student_exams_student_id_juz_number_attempt_number_key;

-- الخطوة 2: جعل juz_number اختياري (nullable) لأن ليس كل المستويات تستخدمه
ALTER TABLE public.student_exams 
ALTER COLUMN juz_number DROP NOT NULL;

-- الخطوة 3: إضافة قيد UNIQUE جديد يشمل جميع الحقول المميزة
-- هذا يسمح بتكرار الاختبارات لنفس الطالب في نفس الجزء بمحاولات مختلفة
-- ويسمح أيضاً باختبارات مختلفة (تمهيدي، تلاوة، حافظ)
ALTER TABLE public.student_exams 
ADD CONSTRAINT student_exams_unique_attempt 
UNIQUE NULLS NOT DISTINCT (
  student_id, 
  juz_number, 
  tamhidi_stage, 
  tilawah_section, 
  hifd_section, 
  attempt_number
);

-- ملاحظة: NULLS NOT DISTINCT يعني أن NULL = NULL في هذا القيد
-- هذا يمنع تكرار الاختبارات لنفس المرحلة/القسم بنفس رقم المحاولة

-- الخطوة 4: إضافة تعليق توضيحي
COMMENT ON CONSTRAINT student_exams_unique_attempt ON public.student_exams IS 
'يمنع تكرار الاختبار لنفس الطالب في نفس الجزء/المرحلة/القسم بنفس رقم المحاولة';
