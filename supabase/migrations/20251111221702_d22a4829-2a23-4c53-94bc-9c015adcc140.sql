-- Add columns to store page numbers for non-beginner students
ALTER TABLE student_daily_work 
ADD COLUMN new_recitation_page_numbers text,
ADD COLUMN review_page_numbers text;

-- Create table for ranking points (hidden from students, visible to admins only)
CREATE TABLE student_ranking_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  behavior_points numeric DEFAULT 0,
  attendance_points numeric DEFAULT 0,
  homework_points numeric DEFAULT 0,
  exam_points numeric DEFAULT 0,
  total_points numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE student_ranking_points ENABLE ROW LEVEL SECURITY;

-- Create policy for ranking points
CREATE POLICY "Allow all operations on student_ranking_points" 
ON student_ranking_points 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_ranking_points_updated_at
BEFORE UPDATE ON student_ranking_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_student_ranking_points_student_date ON student_ranking_points(student_id, date);
CREATE INDEX idx_student_ranking_points_date ON student_ranking_points(date);