-- إزالة قيد المفتاح الأجنبي على teacher_id من جدول student_points
-- لأن الأدمن قد يضيف نقاط أيضاً
ALTER TABLE student_points DROP CONSTRAINT IF EXISTS student_points_teacher_id_fkey;

-- جعل teacher_id اختيارياً
ALTER TABLE student_points ALTER COLUMN teacher_id DROP NOT NULL;