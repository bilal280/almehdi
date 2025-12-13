-- إصلاح العلاقات لمنع حذف الطلاب عند حذف الحلقة أو المعلم
-- نحتاج لإزالة القيود الحالية وإعادة إنشائها بدون CASCADE

-- التحقق من القيود الموجودة وإزالتها
DO $$
BEGIN
    -- إزالة القيد على جدول students إذا كان موجوداً
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_circle_id_fkey' 
        AND table_name = 'students'
    ) THEN
        ALTER TABLE public.students DROP CONSTRAINT students_circle_id_fkey;
    END IF;
    
    -- إزالة القيد على جدول circles إذا كان موجوداً
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'circles_teacher_id_fkey' 
        AND table_name = 'circles'
    ) THEN
        ALTER TABLE public.circles DROP CONSTRAINT circles_teacher_id_fkey;
    END IF;
END $$;

-- إعادة إنشاء القيود بدون CASCADE (سيمنع الحذف إذا كان هناك طلاب مرتبطين)
ALTER TABLE public.students 
ADD CONSTRAINT students_circle_id_fkey 
FOREIGN KEY (circle_id) 
REFERENCES public.circles(id) 
ON DELETE RESTRICT;

ALTER TABLE public.circles 
ADD CONSTRAINT circles_teacher_id_fkey 
FOREIGN KEY (teacher_id) 
REFERENCES public.teachers(id) 
ON DELETE RESTRICT;