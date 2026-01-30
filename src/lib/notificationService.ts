import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  studentId: string;
  title: string;
  message: string;
  type: 'daily_work' | 'exam' | 'attendance' | 'general';
}

/**
 * إرسال إشعار للطالب
 */
export async function sendNotification(data: NotificationData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        student_id: data.studentId,
        title: data.title,
        message: data.message,
        type: data.type
      });

    if (error) {
      console.error('Error sending notification:', error);
      return false;
    }

    console.log(`✅ تم إرسال إشعار للطالب: ${data.title}`);
    return true;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return false;
  }
}

/**
 * إرسال إشعارات لعدة طلاب
 */
export async function sendBulkNotifications(notifications: NotificationData[]): Promise<number> {
  try {
    const notificationsToInsert = notifications.map(n => ({
      student_id: n.studentId,
      title: n.title,
      message: n.message,
      type: n.type
    }));

    const { error, data } = await supabase
      .from('notifications')
      .insert(notificationsToInsert)
      .select();

    if (error) {
      console.error('Error sending bulk notifications:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`✅ تم إرسال ${count} إشعار`);
    return count;
  } catch (error) {
    console.error('Error in sendBulkNotifications:', error);
    return 0;
  }
}

/**
 * رسائل تحفيزية عشوائية
 */
const motivationalMessages = [
  "أحسنت! استمر في التقدم المميز 🌟",
  "ما شاء الله! نفتخر بك وبإنجازاتك 💪",
  "رائع! أنت تسير على الطريق الصحيح 🎯",
  "ممتاز! استمر في هذا الأداء الرائع ⭐",
  "بارك الله فيك! جهودك تؤتي ثمارها 🌱",
  "عمل رائع! نحن فخورون بك 🏆",
  "أداء مميز! و