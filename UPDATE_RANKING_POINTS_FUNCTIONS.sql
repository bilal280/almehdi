-- تحديث دوال نقاط الترتيب
-- قم بنسخ هذا الكود ولصقه في Supabase SQL Editor وتشغيله

-- حذف الدوال القديمة
DROP FUNCTION IF EXISTS public.calculate_monthly_ranking_points(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.calculate_all_students_ranking_points(integer, integer);

-- إنشاء الدالة المحدثة لحساب نقاط الترتيب الشهرية
CREATE OR REPLACE FUNCTION public.calculate_monthly_ranking_points(
  p_student_id uuid,
  p_month integer,
  p_year integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_behavior_points numeric := 0;
  v_behavior_perfect boolean := false;
  v_absence_points numeric := 0;
  v_absence_count integer := 0;
  v_perfect_attendance boolean := false;
  v_monthly_review_points numeric := 0;
  v_monthly_review_score numeric := NULL;
  v_exam_points numeric := 0;
  v_exam_count integer := 0;
  v_total_points numeric := 0;
  v_non_excellent_count integer := 0;
  v_behavior_count integer := 0;
  v_start_date date;
  v_end_date date;
BEGIN
  -- تحديد نطاق التاريخ
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + interval '1 month' - interval '1 day')::date;

  -- 1. حساب نقاط الأدب (شهرياً)
  -- أدب كامل شهرياً = 3 نقاط
  -- كل درجة نقص عن ممتاز = -2 نقطة
  SELECT 
    COUNT(*) FILTER (WHERE behavior_grade IS NOT NULL AND behavior_grade != 'ممتاز'),
    COUNT(*) FILTER (WHERE behavior_grade IS NOT NULL)
  INTO v_non_excellent_count, v_behavior_count
  FROM student_daily_work
  WHERE student_id = p_student_id
    AND date >= v_start_date
    AND date <= v_end_date;

  IF v_behavior_count > 0 THEN
    IF v_non_excellent_count = 0 THEN
      -- أدب كامل (ممتاز) طوال الشهر
      v_behavior_points := 3;
      v_behavior_perfect := true;
    ELSE
      -- كل درجة نقص عن ممتاز = -2 نقطة
      v_behavior_points := -2 * v_non_excellent_count;
    END IF;
  END IF;

  -- 2. حساب نقاط الغياب (شهرياً)
  -- عدم الغياب شهرياً = 3 نقاط
  -- كل غياب = -1 نقطة
  SELECT COUNT(*)
  INTO v_absence_count
  FROM student_attendance
  WHERE student_id = p_student_id
    AND date >= v_start_date
    AND date <= v_end_date
    AND status = 'absent';

  IF v_absence_count = 0 THEN
    -- لا غياب طوال الشهر
    v_absence_points := 3;
    v_perfect_attendance := true;
  ELSE
    -- كل غياب = -1 نقطة
    v_absence_points := -1 * v_absence_count;
  END IF;

  -- 3. حساب نقاط المذاكرة الشهرية (من 100)
  -- علامة كاملة (100) = 3 نقاط
  -- كل نقص 10 = -1 نقطة
  -- الحد الأقصى للخصم = 3 نقاط (أقل من 70 = -3 فقط)
  SELECT score
  INTO v_monthly_review_score
  FROM monthly_reviews
  WHERE student_id = p_student_id
    AND month = p_month
    AND year = p_year
  LIMIT 1;

  IF v_monthly_review_score IS NOT NULL THEN
    IF v_monthly_review_score >= 100 THEN
      v_monthly_review_points := 3;
    ELSIF v_monthly_review_score < 70 THEN
      -- أقل من 70 = -3 نقاط فقط (الحد الأقصى للخصم)
      v_monthly_review_points := -3;
    ELSE
      -- كل نقص 10 = -1 نقطة
      v_monthly_review_points := -1 * FLOOR((100 - v_monthly_review_score) / 10);
    END IF;
  END IF;

  -- 4. حساب نقاط الاختبارات
  -- كل اختبار ليس إعادة = 3 نقاط
  SELECT COUNT(*)
  INTO v_exam_count
  FROM student_exams
  WHERE student_id = p_student_id
    AND EXTRACT(MONTH FROM exam_date) = p_month
    AND EXTRACT(YEAR FROM exam_date) = p_year
    AND attempt_number = 1; -- فقط الاختبارات الأولى (ليست إعادة)

  -- كل اختبار ليس إعادة = 3 نقاط
  v_exam_points := v_exam_count * 3;

  -- حساب المجموع الكلي
  v_total_points := v_behavior_points + v_absence_points + v_monthly_review_points + v_exam_points;

  -- حفظ أو تحديث النقاط
  INSERT INTO student_ranking_points (
    student_id,
    month,
    year,
    behavior_points,
    behavior_perfect,
    absence_points,
    absence_count,
    perfect_attendance,
    monthly_review_points,
    monthly_review_score,
    exam_points,
    exam_count,
    total_points
  ) VALUES (
    p_student_id,
    p_month,
    p_year,
    v_behavior_points,
    v_behavior_perfect,
    v_absence_points,
    v_absence_count,
    v_perfect_attendance,
    v_monthly_review_points,
    v_monthly_review_score,
    v_exam_points,
    v_exam_count,
    v_total_points
  )
  ON CONFLICT (student_id, month, year)
  DO UPDATE SET
    behavior_points = v_behavior_points,
    behavior_perfect = v_behavior_perfect,
    absence_points = v_absence_points,
    absence_count = v_absence_count,
    perfect_attendance = v_perfect_attendance,
    monthly_review_points = v_monthly_review_points,
    monthly_review_score = v_monthly_review_score,
    exam_points = v_exam_points,
    exam_count = v_exam_count,
    total_points = v_total_points,
    updated_at = now();
END;
$$;

-- إنشاء الدالة المحدثة لحساب نقاط جميع الطلاب
CREATE OR REPLACE FUNCTION public.calculate_all_students_ranking_points(
  p_month integer,
  p_year integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_id uuid;
BEGIN
  FOR v_student_id IN 
    SELECT DISTINCT id FROM students
  LOOP
    PERFORM calculate_monthly_ranking_points(v_student_id, p_month, p_year);
  END LOOP;
END;
$$;

-- رسالة نجاح
DO $$
BEGIN
  RAISE NOTICE 'تم تحديث دوال نقاط الترتيب بنجاح!';
END $$;
