-- Create student_daily_work table for daily student activities
CREATE TABLE public.student_daily_work (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_recitation_pages INTEGER DEFAULT 0,
  new_recitation_grade TEXT,
  review_pages INTEGER DEFAULT 0,
  review_grade TEXT,
  hadith_count INTEGER DEFAULT 0,
  hadith_grade TEXT,
  behavior_grade TEXT,
  general_points INTEGER DEFAULT 0,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create circle_daily_activities table for daily circle activities
CREATE TABLE public.circle_daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL, -- 'recitation', 'review', 'hadith', 'behavior', 'general'
  description TEXT,
  target_pages INTEGER,
  completed_pages INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_points table for all student points tracking
CREATE TABLE public.student_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  point_type TEXT NOT NULL, -- 'recitation', 'review', 'hadith', 'behavior', 'general'
  points INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_attendance table for attendance tracking
CREATE TABLE public.student_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Enable RLS on all new tables
ALTER TABLE public.student_daily_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_daily_work
CREATE POLICY "Allow all operations on student_daily_work" 
ON public.student_daily_work 
FOR ALL 
USING (true);

-- Create RLS policies for circle_daily_activities
CREATE POLICY "Allow all operations on circle_daily_activities" 
ON public.circle_daily_activities 
FOR ALL 
USING (true);

-- Create RLS policies for student_points
CREATE POLICY "Allow all operations on student_points" 
ON public.student_points 
FOR ALL 
USING (true);

-- Create RLS policies for student_attendance
CREATE POLICY "Allow all operations on student_attendance" 
ON public.student_attendance 
FOR ALL 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_student_daily_work_updated_at
BEFORE UPDATE ON public.student_daily_work
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circle_daily_activities_updated_at
BEFORE UPDATE ON public.circle_daily_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_points_updated_at
BEFORE UPDATE ON public.student_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_attendance_updated_at
BEFORE UPDATE ON public.student_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_student_daily_work_student_date ON public.student_daily_work(student_id, date);
CREATE INDEX idx_circle_daily_activities_circle_date ON public.circle_daily_activities(circle_id, date);
CREATE INDEX idx_student_points_student_date ON public.student_points(student_id, date);
CREATE INDEX idx_student_attendance_student_date ON public.student_attendance(student_id, date);