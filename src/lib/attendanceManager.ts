import { supabase } from "@/integrations/supabase/client";

interface AttendanceResult {
  success: boolean;
  message: string;
  pointsDeleted?: number;
}

/**
 * إدارة حضور الطالب بشكل مركزي
 * - تسجيل الحضور/الغياب
 * - إضافة/حذف نقاط الحماسة
 * - المزامنة بين جميع الصفحات
 */
export async function manageStudentAttendance(
  studentId: string,
  teacherId: string,
  status: 'present' | 'absent',
  date: string
): Promise<AttendanceResult> {
  try {
    // 1. تسجيل أو تحديث الحضور
    const { data: existingAttendance } = await supabase
      .from('student_attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();

    if (existingAttendance) {
      // تحديث السجل الموجود
      const { error: updateError } = await supabase
        .from('student_attendance')
        .update({ status, teacher_id: teacherId })
        .eq('id', existingAttendance.id);

      if (updateError) throw updateError;
    } else {
      // إنشاء سجل جديد
      const { error: insertError } = await supabase
        .from('student_attendance')
        .insert({
          student_id: studentId,
          status,
          teacher_id: teacherId,
          date
        });

      if (insertError) throw insertError;
    }

    // 2. إدارة نقاط الحماسة
    if (status === 'present') {
      // إضافة نقطة حماسة إذا لم تكن موجودة
      const { data: existingPoints } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', date)
        .eq('point_type', 'enthusiasm')
        .maybeSingle();

      if (!existingPoints) {
        const { error: pointsError } = await supabase
          .from('student_points')
          .insert({
            student_id: studentId,
            date,
            point_type: 'enthusiasm',
            points: 1,
            reason: 'حضور'
          });

        if (pointsError) throw pointsError;
      }

      return {
        success: true,
        message: 'تم تسجيل الحضور وإضافة نقطة حماسة'
      };
    } else {
      // حذف جميع نقاط الحماسة التراكمية للطالب
      const { data: deletedPoints, error: deleteError } = await supabase
        .from('student_points')
        .delete()
        .eq('student_id', studentId)
        .eq('point_type', 'enthusiasm')
        .select();

      if (deleteError) throw deleteError;

      const pointsCount = deletedPoints?.length || 0;

      return {
        success: true,
        message: `تم تسجيل الغياب وحذف ${pointsCount} نقطة حماسة`,
        pointsDeleted: pointsCount
      };
    }
  } catch (error) {
    console.error('Error managing attendance:', error);
    return {
      success: false,
      message: 'فشل في تحديث الحضور'
    };
  }
}

/**
 * التحقق من حالة حضور الطالب في تاريخ معين
 */
export async function getStudentAttendanceStatus(
  studentId: string,
  date: string
): Promise<'present' | 'absent' | null> {
  try {
    const { data } = await supabase
      .from('student_attendance')
      .select('status')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();

    return data?.status || null;
  } catch (error) {
    console.error('Error getting attendance status:', error);
    return null;
  }
}

/**
 * الحصول على عدد نقاط الحماسة التراكمية للطالب
 */
export async function getStudentEnthusiasmPoints(studentId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('student_points')
      .select('points')
      .eq('student_id', studentId)
      .eq('point_type', 'enthusiasm');

    return data?.reduce((sum, p) => sum + p.points, 0) || 0;
  } catch (error) {
    console.error('Error getting enthusiasm points:', error);
    return 0;
  }
}
