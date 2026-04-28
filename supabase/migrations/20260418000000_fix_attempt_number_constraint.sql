-- إصلاح قيد attempt_number لدعم المرحلة (100) والتثبيت (200)
-- المشكلة: القيد الحالي يسمح فقط بالقيم من 1 إلى 4

-- حذف القيد القديم
ALTER TABLE public.student_exams 
DROP CONSTRAINT IF EXISTS student_exams_attempt_number_check;

-- إضافة قيد جديد يسمح بـ:
-- 1-4: المحاولات العادية
-- 100: المرحلة
-- 200: التثبيت (للحفاظ فقط)
ALTER TABLE public.student_exams 
ADD CONSTRAINT student_exams_attempt_number_check 
CHECK (
  attempt_number IN (1, 2, 3, 4, 100, 200)
);

-- إضافة تعليق توضيحي
COMMENT ON CONSTRAINT student_exams_attempt_number_check ON public.student_exams IS 
'يسمح بالمحاولات 1-4 للاختبارات العادية، 100 للمرحلة، 200 للتثبيت';
