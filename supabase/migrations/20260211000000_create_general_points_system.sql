-- إنشاء جدول سجل النقاط العامة (تفصيلي)
CREATE TABLE IF NOT EXISTS student_general_points_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  point_type TEXT NOT NULL CHECK (point_type IN (
    'exam_grade',        -- نقاط تقدير الاختبار
    'weekly_bonus',      -- نقاط التسميع الأسبوعي (أكثر من 5 صفحات)
    'exam_bonus',        -- نقاط الاختبار (2 نقطة لكل اختبار)
    'behavior',          -- نقاط الأدب اليومي
    'recitation_retake', -- خصم إعادة التسميع
    'exam_retake'        -- خصم إعادة الاختبار
  )),
  points INTEGER NOT NULL, -- يمكن أن يكون موجب أو سالب
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول ملخص النقاط (للسرعة)
CREATE TABLE IF NOT EXISTS student_general_points_summary (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_general_points_log_student ON student_general_points_log(student_id);
CREATE INDEX IF NOT EXISTS idx_general_points_log_date ON student_general_points_log(date);
CREATE INDEX IF NOT EXISTS idx_general_points_log_type ON student_general_points_log(point_type);

-- Function لتحديث ملخص النقاط تلقائياً
CREATE OR REPLACE FUNCTION update_general_points_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- عند إضافة أو تعديل سطر
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    INSERT INTO student_general_points_summary (student_id, total_points, last_updated)
    VALUES (
      NEW.student_id,
      (SELECT COALESCE(SUM(points), 0) FROM student_general_points_log WHERE student_id = NEW.student_id),
      NOW()
    )
    ON CONFLICT (student_id) 
    DO UPDATE SET 
      total_points = (SELECT COALESCE(SUM(points), 0) FROM student_general_points_log WHERE student_id = NEW.student_id),
      last_updated = NOW();
    RETURN NEW;
  END IF;
  
  -- عند الحذف
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO student_general_points_summary (student_id, total_points, last_updated)
    VALUES (
      OLD.student_id,
      (SELECT COALESCE(SUM(points), 0) FROM student_general_points_log WHERE student_id = OLD.student_id),
      NOW()
    )
    ON CONFLICT (student_id) 
    DO UPDATE SET 
      total_points = (SELECT COALESCE(SUM(points), 0) FROM student_general_points_log WHERE student_id = OLD.student_id),
      last_updated = NOW();
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث الملخص تلقائياً
DROP TRIGGER IF EXISTS trigger_update_general_points_summary ON student_general_points_log;
CREATE TRIGGER trigger_update_general_points_summary
  AFTER INSERT OR UPDATE OR DELETE ON student_general_points_log
  FOR EACH ROW
  EXECUTE FUNCTION update_general_points_summary();

-- Function لحساب نقاط تقدير الاختبار
CREATE OR REPLACE FUNCTION calculate_exam_grade_points(grade TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE grade
    WHEN 'شرف' THEN RETURN 20;
    WHEN 'تفوق' THEN RETURN 15;
    WHEN 'ممتاز' THEN RETURN 10;
    WHEN 'جيد جداً' THEN RETURN 5;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function لحساب نقاط الأدب اليومي
CREATE OR REPLACE FUNCTION calculate_behavior_points(behavior TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE behavior
    WHEN 'ممتاز' THEN RETURN 3;
    WHEN 'جيد جداً' THEN RETURN 1;
    WHEN 'جيد' THEN RETURN 0;
    WHEN 'مقبول' THEN RETURN -5;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function لتصفير نقاط طالب معين
CREATE OR REPLACE FUNCTION reset_student_general_points(p_student_id UUID)
RETURNS VOID AS $$
BEGIN
  -- حذف جميع سجلات النقاط للطالب
  DELETE FROM student_general_points_log WHERE student_id = p_student_id;
  
  -- تحديث الملخص (سيتم تلقائياً عبر الـ trigger)
  -- لكن نضيف هذا للتأكد
  UPDATE student_general_points_summary 
  SET total_points = 0, last_updated = NOW() 
  WHERE student_id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- Function لتصفير نقاط جميع الطلاب
CREATE OR REPLACE FUNCTION reset_all_general_points()
RETURNS VOID AS $$
BEGIN
  -- حذف جميع السجلات
  TRUNCATE student_general_points_log;
  
  -- تصفير الملخصات
  UPDATE student_general_points_summary SET total_points = 0, last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- إضافة RLS policies
ALTER TABLE student_general_points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_general_points_summary ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Allow read access to all" ON student_general_points_log FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON student_general_points_summary FOR SELECT USING (true);

-- السماح بالإضافة والتعديل والحذف (سيتم التحكم من الكود)
CREATE POLICY "Allow insert for authenticated users" ON student_general_points_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON student_general_points_log FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated users" ON student_general_points_log FOR DELETE USING (true);

CREATE POLICY "Allow all operations on summary" ON student_general_points_summary FOR ALL USING (true);
