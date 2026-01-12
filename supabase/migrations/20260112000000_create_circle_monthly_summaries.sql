-- Create table for circle monthly summary images
CREATE TABLE public.circle_monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.circle_monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Allow all operations on circle_monthly_summaries" 
  ON public.circle_monthly_summaries FOR ALL USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_circle_monthly_summaries_updated_at
  BEFORE UPDATE ON public.circle_monthly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_circle_monthly_summaries_circle_id 
  ON public.circle_monthly_summaries(circle_id);

-- Add comment
COMMENT ON TABLE public.circle_monthly_summaries IS 'Stores monthly summary images for each circle';
