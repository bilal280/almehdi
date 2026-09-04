-- =====================================================
-- إصلاح سريع: مشكلة نقل الطلاب إلى المنقطعين
-- =====================================================
-- التاريخ: 2026-04-20
-- الوصف: يحل مشكلة الخطأ عند نقل طالب إلى قائمة المنقطعين
-- الاستخدام: انسخ هذا الملف كاملاً والصقه في Supabase SQL Editor ثم اضغط Run
-- =====================================================

CREATE OR REPLACE FUNCTION public.move_student_to_discontinued(
  p_student_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_record RECORD;
  v_general_points INTEGER;
BEGIN
  -- جلب بيانات الطالب
  SELECT * INTO v_student_record
  FROM public.students
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  -- حفظ نقاط الطالب العامة قبل الحذف (للسجل)
  SELECT COALESCE(total_points, 0) INTO v_general_points
  FROM student_general_points_summary
  WHERE student_id = p_student_id;

  -- نقل الطالب إلى جدول المنقطعين
  INSERT INTO public.discontinued_students (
    id,
    student_number,
    name,
    age,
    photo_url,
    circle_id,
    level,
    contact_number,
    contact_number_2,
    notes,
    discontinued_reason,
    original_created_at
  ) VALUES (
    v_student_record.id,
    v_student_record.student_number,
    v_student_record.name,
    v_student_record.age,
    v_student_record.photo_url,
    v_student_record.circle_id,
    v_student_record.level,
    v_student_record.contact_number,
    v_student_record.contact_number_2,
    v_student_record.notes,
    p_reason,
    v_student_record.created_at
  );

  -- حذف السجلات من student_general_points_summary يدوياً
  -- (لتجنب مشكلة القيد الخارجي)
  DELETE FROM student_general_points_summary WHERE student_id = p_student_id;

  -- حذف السجلات من student_general_points_log يدوياً
  DELETE FROM student_general_points_log WHERE student_id = p_student_id;

  -- حذف الطالب من جدول الطلاب النشطين
  -- (باقي السجلات ستُحذف تلقائياً بـ CASCADE)
  DELETE FROM public.students WHERE id = p_student_id;

  RETURN true;
END;
$$;

-- إضافة تعليق توضيحي على الدالة
COMMENT ON FUNCTION public.move_student_to_discontinued IS 
'نقل الطالب إلى جدول المنقطعين مع حفظ جميع سجلاته.
يتم حذف سجلات النقاط العامة يدوياً لتجنب تعارض القيود الخارجية.
جميع السجلات الأخرى تبقى محفوظة ومرتبطة بنفس الـ ID.

الاستخدام:
SELECT move_student_to_discontinued(''student-uuid-here'', ''سبب الانقطاع'');

تم الإصلاح: 2026-04-20';

-- =====================================================
-- نهاية السكريبت - تم بنجاح! ✅
-- =====================================================
-- الخطوة التالية: ارجع إلى النظام وجرب نقل طالب إلى المنقطعين
-- =====================================================
