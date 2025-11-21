-- Add second contact number field to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS contact_number_2 text;