-- تعديل جدول student_exams لإضافة حقول جديدة
ALTER TABLE student_exams 
ADD COLUMN IF NOT EXISTS stability_score numeric,
ADD COLUMN IF NOT EXISTS short_surah_name text,
ADD COLUMN IF NOT EXISTS short_surah_grade text;

-- تعديل جدول student_beginner_recitations لتخزين أرقام الأسطر
ALTER TABLE student_beginner_recitations 
ADD COLUMN IF NOT EXISTS line_numbers text;

-- تحديث البيانات القديمة (تحويل line_count إلى line_numbers إذا لزم الأمر)
-- هذا اختياري حسب احتياجك