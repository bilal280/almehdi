-- تحديث جدول الاختبارات لدعم المنهجية الجديدة

-- إزالة القيد الفريد القديم
ALTER TABLE public.student_exams 
DROP CONSTRAINT IF EXISTS student_exams_student_id_juz_number_attempt_number_key;

-- تعديل عمود attempt_number ليسمح بـ 4 محاولات
ALTER TABLE public.student_exams 
DROP CONSTRAINT IF EXISTS student_exams_attempt_number_check;

ALTER TABLE public.student_exams 
ADD CONSTRAINT student_exams_attempt_number_check 
CHECK (attempt_number >= 1 AND attempt_number <= 4);

-- إضافة الحقول الجديدة

-- حقول التمهيدي
ALTER TABLE public.student_exams 
ADD COLUMN IF NOT EXISTS tamhidi_stage text;

-- حقول التلاوة
ALTER TABLE public.student_exams 
ADD COLUMN IF NOT EXISTS tilawah_section text;

-- حقول الحفاظ
ALTER TABLE public.student_exams 
ADD COLUMN IF NOT EXISTS hifd_section text,
ADD COLUMN IF NOT EXISTS stability_score numeric CHECK (stability_score >= 0 AND stability_score <= 10);

-- حقل مشترك لحفظ السور
ALTER TABLE public.student_exams 
ADD COLUMN IF NOT EXISTS surah_memory_score numeric CHECK (surah_memory_score >= 0 AND surah_memory_score <= 10);

-- إزالة عمود juz_number لأنه لم يعد مطلوباً (سيتم استخدام الحقول الجديدة بدلاً منه)
-- لكن سنبقيه للتوافق مع البيانات القديمة ونجعله اختيارياً
ALTER TABLE public.student_exams 
ALTER COLUMN juz_number DROP NOT NULL;

-- إنشاء فهرس للحقول الجديدة (للأداء فقط، بدون قيود فريدة)
CREATE INDEX IF NOT EXISTS idx_student_exams_tamhidi_stage ON public.student_exams(tamhidi_stage);
CREATE INDEX IF NOT EXISTS idx_student_exams_tilawah_section ON public.student_exams(tilawah_section);
CREATE INDEX IF NOT EXISTS idx_student_exams_hifd_section ON public.student_exams(hifd_section);
