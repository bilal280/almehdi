-- استعلامات للتحقق من حفظ بيانات الطلاب التمهيديين

-- 1. عرض جميع تسميعات اليوم للطلاب التمهيديين
SELECT 
  s.name as اسم_الطالب,
  s.level as المستوى,
  sbr.page_number as رقم_الصفحة,
  sbr.line_numbers as أرقام_الأسطر,
  sbr.line_count as عدد_الأسطر,
  sbr.grade as التقدير,
  sbr.date as التاريخ,
  sbr.created_at as وقت_الإنشاء
FROM student_beginner_recitations sbr
JOIN students s ON s.id = sbr.student_id
WHERE sbr.date = CURRENT_DATE
  AND s.level = 'تمهيدي'
ORDER BY s.name, sbr.page_number;

-- 2. عدد التسميعات لكل طالب تمهيدي اليوم
SELECT 
  s.name as اسم_الطالب,
  COUNT(sbr.id) as عدد_التسميعات,
  SUM(sbr.line_count) as إجمالي_الأسطر
FROM students s
LEFT JOIN student_beginner_recitations sbr 
  ON s.id = sbr.student_id 
  AND sbr.date = CURRENT_DATE
WHERE s.level = 'تمهيدي'
GROUP BY s.id, s.name
ORDER BY s.name;

-- 3. الطلاب التمهيديين الذين لم يسمعوا اليوم
SELECT 
  s.name as اسم_الطالب,
  s.age as العمر,
  c.name as اسم_الحلقة
FROM students s
LEFT JOIN student_beginner_recitations sbr 
  ON s.id = sbr.student_id 
  AND sbr.date = CURRENT_DATE
LEFT JOIN circles c ON s.circle_id = c.id
WHERE s.level = 'تمهيدي'
  AND sbr.id IS NULL
  AND s.id NOT IN (SELECT id FROM discontinued_students)
ORDER BY s.name;

-- 4. تفاصيل كاملة لطالب تمهيدي معين (استبدل 'اسم الطالب' بالاسم الفعلي)
SELECT 
  s.name as اسم_الطالب,
  sbr.page_number as رقم_الصفحة,
  sbr.line_numbers as أرقام_الأسطر,
  sbr.line_count as عدد_الأسطر,
  sbr.grade as التقدير,
  sdw.behavior_grade as تقدير_السلوك,
  sdw.teacher_notes as ملاحظات_المعلم,
  sa.status as الحضور,
  sbr.date as التاريخ
FROM students s
LEFT JOIN student_beginner_recitations sbr 
  ON s.id = sbr.student_id 
  AND sbr.date = CURRENT_DATE
LEFT JOIN student_daily_work sdw 
  ON s.id = sdw.student_id 
  AND sdw.date = CURRENT_DATE
LEFT JOIN student_attendance sa 
  ON s.id = sa.student_id 
  AND sa.date = CURRENT_DATE
WHERE s.level = 'تمهيدي'
  -- AND s.name = 'اسم الطالب'  -- أزل التعليق واستبدل بالاسم
ORDER BY sbr.page_number;

-- 5. إحصائيات شاملة للطلاب التمهيديين لآخر 7 أيام
SELECT 
  s.name as اسم_الطالب,
  COUNT(DISTINCT sbr.date) as عدد_أيام_التسميع,
  COUNT(sbr.id) as إجمالي_التسميعات,
  SUM(sbr.line_count) as إجمالي_الأسطر,
  COUNT(DISTINCT sbr.page_number) as عدد_الصفحات_الفريدة
FROM students s
LEFT JOIN student_beginner_recitations sbr 
  ON s.id = sbr.student_id 
  AND sbr.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE s.level = 'تمهيدي'
  AND s.id NOT IN (SELECT id FROM discontinued_students)
GROUP BY s.id, s.name
ORDER BY s.name;

-- 6. التحقق من وجود تسميعات بدون بيانات يومية (للتشخيص)
SELECT 
  s.name as اسم_الطالب,
  sbr.page_number as رقم_الصفحة,
  sbr.grade as التقدير,
  CASE 
    WHEN sdw.id IS NULL THEN 'لا توجد بيانات يومية'
    ELSE 'موجودة'
  END as حالة_البيانات_اليومية
FROM student_beginner_recitations sbr
JOIN students s ON s.id = sbr.student_id
LEFT JOIN student_daily_work sdw 
  ON sbr.student_id = sdw.student_id 
  AND sbr.date = sdw.date
WHERE sbr.date = CURRENT_DATE
  AND s.level = 'تمهيدي'
ORDER BY s.name;

-- 7. التحقق من صحة البيانات (أخطاء محتملة)
SELECT 
  s.name as اسم_الطالب,
  sbr.page_number as رقم_الصفحة,
  sbr.line_numbers as أرقام_الأسطر,
  sbr.line_count as عدد_الأسطر,
  CASE 
    WHEN sbr.page_number IS NULL THEN 'رقم الصفحة فارغ'
    WHEN sbr.page_number < 1 OR sbr.page_number > 604 THEN 'رقم صفحة غير صحيح'
    WHEN sbr.line_count < 1 OR sbr.line_count > 10 THEN 'عدد أسطر غير صحيح'
    WHEN sbr.grade IS NULL THEN 'التقدير فارغ'
    ELSE 'صحيح'
  END as حالة_البيانات
FROM student_beginner_recitations sbr
JOIN students s ON s.id = sbr.student_id
WHERE sbr.date = CURRENT_DATE
  AND s.level = 'تمهيدي'
ORDER BY s.name;

-- 8. مقارنة بين الحضور والتسميع (للتأكد من التطابق)
SELECT 
  s.name as اسم_الطالب,
  sa.status as الحضور,
  COUNT(sbr.id) as عدد_التسميعات,
  CASE 
    WHEN sa.status = 'present' AND COUNT(sbr.id) = 0 THEN '⚠️ حاضر بدون تسميع'
    WHEN sa.status = 'absent' AND COUNT(sbr.id) > 0 THEN '⚠️ غائب مع تسميع'
    WHEN sa.status = 'present' AND COUNT(sbr.id) > 0 THEN '✓ صحيح'
    WHEN sa.status IS NULL AND COUNT(sbr.id) > 0 THEN '⚠️ تسميع بدون تسجيل حضور'
    ELSE 'لا توجد بيانات'
  END as الحالة
FROM students s
LEFT JOIN student_attendance sa 
  ON s.id = sa.student_id 
  AND sa.date = CURRENT_DATE
LEFT JOIN student_beginner_recitations sbr 
  ON s.id = sbr.student_id 
  AND sbr.date = CURRENT_DATE
WHERE s.level = 'تمهيدي'
  AND s.id NOT IN (SELECT id FROM discontinued_students)
GROUP BY s.id, s.name, sa.status
ORDER BY s.name;
