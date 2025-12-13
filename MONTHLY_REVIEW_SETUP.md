# إعداد ميزة المذاكرة الشهرية

## الخطوات المطلوبة:

### 1. تطبيق Migration في قاعدة البيانات

قم بتنفيذ الملف التالي في قاعدة بيانات Supabase:
`supabase/migrations/20251127000000_add_monthly_review.sql`

أو قم بتنفيذ الكود SQL التالي مباشرة في Supabase SQL Editor:

```sql
-- Create monthly_reviews table for monthly student reviews
CREATE TABLE IF NOT EXISTS public.monthly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on monthly_reviews" 
ON public.monthly_reviews 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_reviews_updated_at
BEFORE UPDATE ON public.monthly_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_monthly_reviews_student_month_year ON public.monthly_reviews(student_id, month, year);
```

### 2. تحديث Types في Supabase

بعد تطبيق الـ migration، قم بتحديث الـ types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

أو قم بتحديث الـ types يدوياً في ملف `src/integrations/supabase/types.ts`

## الميزات المضافة:

### 1. إصلاح عرض آخر صفحة
- تم تعديل الكود لعرض رقم آخر صفحة من حقل `new_recitation_page_numbers` بدلاً من عدد الصفحات

### 2. المذاكرة الشهرية
- صفحة جديدة للأستاذ: `/teacher/monthly-review`
- يمكن للأستاذ إضافة درجات المذاكرة الشهرية لكل طالب (من 100)
- الدرجات اختيارية
- تظهر في المحصلات الشهرية والفصلية
- يتم تصديرها مع البيانات إلى Excel

### 3. عرض المذاكرة في المحصلات
- عمود جديد في جدول المحصلات يعرض درجة المذاكرة الشهرية
- الدرجات ملونة حسب الأداء:
  - أخضر: 90-100
  - أزرق: 75-89
  - أصفر: 60-74
  - أحمر: أقل من 60

## الاستخدام:

1. الأستاذ يدخل إلى "المذاكرة الشهرية" من القائمة
2. يختار الشهر والسنة
3. يدخل الدرجات للطلاب (اختياري)
4. يضغط "حفظ الدرجات"
5. تظهر الدرجات تلقائياً في المحصلات الشهرية والفصلية
