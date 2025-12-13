-- إنشاء جدول الاختبارات
CREATE TABLE IF NOT EXISTS public.student_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  juz_number integer NOT NULL CHECK (juz_number >= 1 AND juz_number <= 30),
  attempt_number integer NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
  exam_score numeric,
  grade text,
  tafsir_score numeric CHECK (tafsir_score >= 0 AND tafsir_score <= 10),
  tajweed_score numeric CHECK (tajweed_score >= 0 AND tajweed_score <= 10),
  exam_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, juz_number, attempt_number)
);

-- تفعيل RLS
ALTER TABLE public.student_exams ENABLE ROW LEVEL SECURITY;

-- سياسة السماح بكل العمليات
CREATE POLICY "Allow all operations on student_exams"
ON public.student_exams
FOR ALL
USING (true);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_student_exams_updated_at
BEFORE UPDATE ON public.student_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة indexes لتحسين الأداء
CREATE INDEX idx_student_exams_student_id ON public.student_exams(student_id);
CREATE INDEX idx_student_exams_circle_id ON public.student_exams(circle_id);
CREATE INDEX idx_student_exams_juz_number ON public.student_exams(juz_number);