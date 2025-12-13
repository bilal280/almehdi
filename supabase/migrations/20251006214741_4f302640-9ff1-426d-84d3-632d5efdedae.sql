-- Add level column to students table
ALTER TABLE public.students 
ADD COLUMN level text NOT NULL DEFAULT 'تلاوة' 
CHECK (level IN ('حافظ', 'تلاوة', 'تمهيدي'));