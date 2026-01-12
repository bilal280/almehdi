-- Add column to store individual grades for each page
ALTER TABLE public.student_daily_work 
ADD COLUMN IF NOT EXISTS new_recitation_page_grades TEXT;

-- Add comment
COMMENT ON COLUMN public.student_daily_work.new_recitation_page_grades 
IS 'Comma-separated grades for each page in new_recitation_page_numbers (e.g., "ممتاز,جيد جداً,ممتاز")';
