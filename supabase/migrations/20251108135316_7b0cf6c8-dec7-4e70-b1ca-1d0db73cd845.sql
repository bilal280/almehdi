-- إضافة عمود رقم تسلسلي للطلاب
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_number SERIAL;

-- إنشاء فهرس فريد لرقم الطالب
CREATE UNIQUE INDEX IF NOT EXISTS students_student_number_idx ON students(student_number);