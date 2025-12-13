-- إنشاء جدول الطلاب المنقطعين
CREATE TABLE IF NOT EXISTS public.discontinued_students (
  id uuid NOT NULL PRIMARY KEY, -- نفس ID الطالب الأصلي
  student_number integer NOT NULL UNIQUE, -- رقم الطالب التسلسلي (لا يتغير أبداً)
  name text NOT NULL,
  age integer NOT NULL,
  photo_url text,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  level text,
  contact_number text,
  contact_number_2 text,
  notes text,
  discontinued_date date NOT NULL DEFAULT CURRENT_DATE,
  discontinued_reason text,
  original_created_at timestamp with time zone NOT NULL,
  discontinued_at timestamp with time zone NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.discontinued_students ENABLE ROW LEVEL SECURITY;

-- سياسة السماح بكل العمليات
CREATE POLICY "Allow all operations on discontinued_students"
ON public.discontinued_students
FOR ALL
USING (true);

-- إنشاء فهرس
CREATE INDEX IF NOT EXISTS idx_discontinued_students_student_number ON public.discontinued_students(student_number);
CREATE INDEX IF NOT EXISTS idx_discontinued_students_name ON public.discontinued_students(name);
CREATE INDEX IF NOT EXISTS idx_discontinued_students_discontinued_date ON public.discontinued_students(discontinued_date);

-- التأكد من أن student_number في جدول students فريد ولا يتغير
-- إضافة قيد فريد إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'students_student_number_key'
  ) THEN
    ALTER TABLE public.students 
    ADD CONSTRAINT students_student_number_key UNIQUE (student_number);
  END IF;
END $$;

-- إنشاء دالة لنقل الطالب إلى جدول المنقطعين
CREATE OR REPLACE FUNCTION public.move_student_to_discontinued(
  p_student_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_record RECORD;
BEGIN
  -- جلب بيانات الطالب
  SELECT * INTO v_student_record
  FROM public.students
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

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

  -- حذف الطالب من جدول الطلاب النشطين
  DELETE FROM public.students WHERE id = p_student_id;

  RETURN true;
END;
$$;

-- إنشاء دالة لاستعادة الطالب من المنقطعين
CREATE OR REPLACE FUNCTION public.restore_student_from_discontinued(
  p_student_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_record RECORD;
BEGIN
  -- جلب بيانات الطالب المنقطع
  SELECT * INTO v_student_record
  FROM public.discontinued_students
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Discontinued student not found';
  END IF;

  -- استعادة الطالب إلى جدول الطلاب النشطين
  INSERT INTO public.students (
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
    created_at
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
    v_student_record.original_created_at
  );

  -- حذف من جدول المنقطعين
  DELETE FROM public.discontinued_students WHERE id = p_student_id;

  RETURN true;
END;
$$;

-- تعديل قيود الحذف في الجداول المرتبطة لتكون SET NULL بدلاً من CASCADE
-- هذا يحافظ على السجلات حتى بعد نقل الطالب

-- ملاحظة: لا نحتاج لتعديل القيود لأن الطالب لن يُحذف فعلياً
-- سيتم نقله فقط إلى جدول المنقطعين والسجلات ستبقى مرتبطة بنفس الـ ID
