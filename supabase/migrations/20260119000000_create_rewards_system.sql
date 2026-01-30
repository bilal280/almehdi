-- Create table for tracking student rewards
CREATE TABLE public.student_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  reward_level INTEGER NOT NULL, -- 1 for 5 points, 2 for 10 points, etc.
  enthusiasm_points_at_reward INTEGER NOT NULL, -- نقاط الحماسة عند إعطاء المكافأة
  given_by UUID REFERENCES public.admins(id),
  given_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_rewards ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Allow all operations on student_rewards" 
  ON public.student_rewards FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_student_rewards_student_id ON public.student_rewards(student_id);
CREATE INDEX idx_student_rewards_reward_level ON public.student_rewards(reward_level);
CREATE INDEX idx_student_rewards_given_at ON public.student_rewards(given_at);

-- Add comment
COMMENT ON TABLE public.student_rewards IS 'Tracks rewards given to students based on enthusiasm points (every 5 points = 1 reward)';
COMMENT ON COLUMN public.student_rewards.reward_level IS 'Reward number: 1 for 5 points, 2 for 10 points, 3 for 15 points, etc.';
