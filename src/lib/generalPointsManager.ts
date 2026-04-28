import { supabase } from "@/integrations/supabase/client";

/**
 * مدير النقاط العامة
 * يتعامل مع إضافة وحساب النقاط العامة للطلاب
 */

export interface PointsLogEntry {
  student_id: string;
  point_type: 'exam_grade' | 'weekly_bonus' | 'exam_bonus' | 'behavior' | 'recitation_retake' | 'exam_retake';
  points: number;
  date: string;
  notes?: string;
}

/**
 * حساب نقاط تقدير الاختبار
 */
export function calculateExamGradePoints(grade: string): number {
  switch (grade) {
    case 'شرف': return 20;
    case 'تفوق': return 15;
    case 'ممتاز': return 10;
    case 'جيد جداً': return 5;
    default: return 0;
  }
}

/**
 * حساب نقاط الأدب اليومي
 */
export function calculateBehaviorPoints(behavior: string): number {
  switch (behavior) {
    case 'ممتاز': return 3;
    case 'جيد جداً': return 1;
    case 'جيد': return 0;
    case 'مقبول': return -5;
    default: return 0;
  }
}

/**
 * إضافة نقاط إلى سجل الطالب
 */
export async function addGeneralPoints(entry: PointsLogEntry) {
  try {
    const { error } = await supabase
      .from('student_general_points_log')
      .insert({
        student_id: entry.student_id,
        point_type: entry.point_type,
        points: entry.points,
        date: entry.date,
        notes: entry.notes
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding general points:', error);
    return { success: false, error };
  }
}

/**
 * إضافة نقاط اختبار (تقدير + بونص)
 */
export async function addExamPoints(studentId: string, grade: string, examDate: string, examName: string) {
  const gradePoints = calculateExamGradePoints(grade);
  
  // إضافة نقاط التقدير
  if (gradePoints > 0) {
    await addGeneralPoints({
      student_id: studentId,
      point_type: 'exam_grade',
      points: gradePoints,
      date: examDate,
      notes: `نقاط تقدير ${grade} - ${examName}`
    });
  }
  
  // إضافة بونص الاختبار (2 نقطة لكل اختبار غير إعادة)
  if (grade !== 'إعادة') {
    await addGeneralPoints({
      student_id: studentId,
      point_type: 'exam_bonus',
      points: 2,
      date: examDate,
      notes: `بونص اختبار - ${examName}`
    });
  }
}

/**
 * إضافة خصم إعادة اختبار
 */
export async function addExamRetakePenalty(studentId: string, examDate: string, examName: string) {
  await addGeneralPoints({
    student_id: studentId,
    point_type: 'exam_retake',
    points: -20,
    date: examDate,
    notes: `خصم إعادة اختبار - ${examName}`
  });
}

/**
 * إضافة نقاط الأدب اليومي
 */
export async function addBehaviorPoints(studentId: string, behavior: string, date: string) {
  const points = calculateBehaviorPoints(behavior);
  
  if (points !== 0) {
    await addGeneralPoints({
      student_id: studentId,
      point_type: 'behavior',
      points: points,
      date: date,
      notes: `أدب يومي: ${behavior}`
    });
  }
}

/**
 * إضافة خصم إعادة تسميع
 */
export async function addRecitationRetakePenalty(studentId: string, date: string) {
  await addGeneralPoints({
    student_id: studentId,
    point_type: 'recitation_retake',
    points: -5,
    date: date,
    notes: 'خصم إعادة تسميع'
  });
}

/**
 * حساب وإضافة نقاط التسميع الأسبوعي
 * (نقطة إضافية لكل صفحة بعد 5 صفحات)
 */
export async function calculateWeeklyBonusPoints(studentId: string, weekStartDate: string, weekEndDate: string) {
  try {
    // جلب عدد الصفحات المسمعة في الأسبوع (استثناء الإعادات)
    const { data: workData } = await supabase
      .from('student_daily_work')
      .select('new_recitation_pages, new_recitation_grade')
      .eq('student_id', studentId)
      .gte('date', weekStartDate)
      .lte('date', weekEndDate);

    // جلب صفحات التمهيديين (الفريدة فقط)
    const { data: beginnerData } = await supabase
      .from('student_beginner_recitations')
      .select('page_number, grade')
      .eq('student_id', studentId)
      .gte('date', weekStartDate)
      .lte('date', weekEndDate);

    // حساب مجموع الصفحات
    let totalPages = 0;
    
    // من الأعمال اليومية
    workData?.forEach(work => {
      if (work.new_recitation_grade !== 'إعادة') {
        totalPages += work.new_recitation_pages || 0;
      }
    });
    
    // من التمهيديين (صفحات فريدة فقط)
    const uniquePages = new Set<number>();
    beginnerData?.forEach(rec => {
      if (rec.grade !== 'إعادة') {
        uniquePages.add(rec.page_number);
      }
    });
    totalPages += uniquePages.size;

    // إذا كان أكثر من 5 صفحات، أضف نقطة لكل صفحة إضافية
    if (totalPages > 5) {
      const bonusPages = totalPages - 5;
      await addGeneralPoints({
        student_id: studentId,
        point_type: 'weekly_bonus',
        points: bonusPages,
        date: weekEndDate,
        notes: `بونص أسبوعي: ${bonusPages} صفحة إضافية (المجموع: ${totalPages})`
      });
    }

    return { success: true, totalPages, bonusPages: totalPages > 5 ? totalPages - 5 : 0 };
  } catch (error) {
    console.error('Error calculating weekly bonus:', error);
    return { success: false, error };
  }
}

/**
 * جلب مجموع نقاط طالب
 */
export async function getStudentTotalPoints(studentId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('student_general_points_summary')
      .select('total_points')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data?.total_points || 0;
  } catch (error) {
    console.error('Error getting student points:', error);
    return 0;
  }
}

/**
 * جلب سجل نقاط طالب (تفصيلي)
 */
export async function getStudentPointsLog(studentId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('student_general_points_log')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting points log:', error);
    return [];
  }
}

/**
 * تصفير نقاط طالب
 */
export async function resetStudentPoints(studentId: string) {
  try {
    const { error } = await supabase.rpc('reset_student_general_points', {
      p_student_id: studentId
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error resetting student points:', error);
    return { success: false, error };
  }
}

/**
 * تصفير نقاط جميع الطلاب
 */
export async function resetAllPoints() {
  try {
    const { error } = await supabase.rpc('reset_all_general_points');

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error resetting all points:', error);
    return { success: false, error };
  }
}
