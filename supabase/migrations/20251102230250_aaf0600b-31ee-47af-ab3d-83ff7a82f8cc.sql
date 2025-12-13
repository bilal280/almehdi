-- إنشاء جدول تسميع الطلاب التمهيديين
CREATE TABLE IF NOT EXISTS public.student_beginner_recitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  page_number INTEGER NOT NULL,
  line_count INTEGER NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.student_beginner_recitations ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بكل العمليات
CREATE POLICY "Allow all operations on student_beginner_recitations" 
ON public.student_beginner_recitations 
FOR ALL 
USING (true);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_student_beginner_recitations_student_date 
ON public.student_beginner_recitations(student_id, date);

-- إضافة trigger للتحديث التلقائي
CREATE TRIGGER update_student_beginner_recitations_updated_at
BEFORE UPDATE ON public.student_beginner_recitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();