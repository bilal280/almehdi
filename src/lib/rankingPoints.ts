// نظام حساب النقاط الوهمية للترتيب (غير مرئي للطلاب)

export interface RankingPointsCalculation {
  behaviorPoints: number;
  attendancePoints: number;
  homeworkPoints: number;
  examPoints: number;
  totalPoints: number;
}

/**
 * حساب نقاط الأدب بناءً على التقييم
 * ممتاز = 3 نقاط
 * كل درجة نقص عن ممتاز = -2 نقطة
 */
export const calculateBehaviorPoints = (behaviorGrade: string): number => {
  const behaviorMap: Record<string, number> = {
    'ممتاز': 3,
    'جيد جداً': 1,  // 3 - 2 = 1
    'جيد': -1,       // 3 - 4 = -1
    'مقبول': -3      // 3 - 6 = -3
  };
  
  return behaviorMap[behaviorGrade] || 0;
};

/**
 * حساب نقاط الغياب
 * حضور = 3 نقاط
 * غياب = -1 نقطة
 */
export const calculateAttendancePoints = (status: 'present' | 'absent'): number => {
  return status === 'present' ? 3 : -1;
};

/**
 * حساب نقاط المذاكرة (من 100)
 * العلامة الكاملة (100) = 3 نقاط
 * كل نقص 10 = -1 نقطة
 */
export const calculateHomeworkPoints = (grade: string | number): number => {
  const numericGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
  
  if (isNaN(numericGrade) || numericGrade === 0) return 0;
  
  // العلامة الكاملة 100 = 3 نقاط
  if (numericGrade >= 100) return 3;
  
  // كل نقص 10 = -1 نقطة
  const diff = 100 - numericGrade;
  const pointsLost = Math.floor(diff / 10);
  
  return Math.max(3 - pointsLost, -7); // حد أدنى -7 نقاط
};

/**
 * حساب نقاط الاختبارات
 * كل اختبار = 3 نقاط
 */
export const calculateExamPoints = (examScore: number): number => {
  if (examScore >= 50) return 3; // اجتاز الاختبار
  return 0; // لم يجتز
};

/**
 * حساب مجموع النقاط الإجمالية
 */
export const calculateTotalRankingPoints = (
  behaviorGrade?: string,
  attendanceStatus?: 'present' | 'absent',
  homeworkGrades?: (string | number)[],
  examsCount?: number
): RankingPointsCalculation => {
  const behaviorPoints = behaviorGrade ? calculateBehaviorPoints(behaviorGrade) : 0;
  const attendancePoints = attendanceStatus ? calculateAttendancePoints(attendanceStatus) : 0;
  
  let homeworkPoints: number = 0;
  if (homeworkGrades && homeworkGrades.length > 0) {
    // حساب متوسط نقاط المذاكرة
    const totalHomework = homeworkGrades.reduce<number>((sum, grade) => {
      return sum + calculateHomeworkPoints(grade);
    }, 0);
    homeworkPoints = totalHomework / homeworkGrades.length;
  }
  
  const examPoints = examsCount ? examsCount * 3 : 0;
  
  const totalPoints = behaviorPoints + attendancePoints + homeworkPoints + examPoints;
  
  return {
    behaviorPoints,
    attendancePoints,
    homeworkPoints,
    examPoints,
    totalPoints
  };
};
