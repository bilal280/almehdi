// نظام حساب النقاط الوهمية للترتيب (غير مرئي للطلاب)
// ملاحظة: هذه النقاط تُحسب شهرياً وليس يومياً

export interface RankingPointsCalculation {
  behaviorPoints: number;
  attendancePoints: number;
  homeworkPoints: number;
  examPoints: number;
  totalPoints: number;
}

/**
 * حساب نقاط الأدب الشهرية
 * أدب كامل شهرياً (كل الأيام ممتاز) = 3 نقاط
 * كل درجة نقص عن ممتاز = -2 نقطة
 * ملاحظة: يتم الحساب على مستوى الشهر وليس اليوم
 */
export const calculateMonthlyBehaviorPoints = (
  behaviorGrades: string[]
): number => {
  if (behaviorGrades.length === 0) return 0;
  
  // عدد الأيام التي لم تكن ممتازة
  const nonExcellentDays = behaviorGrades.filter(grade => grade !== 'ممتاز').length;
  
  if (nonExcellentDays === 0) {
    // أدب كامل طوال الشهر
    return 3;
  } else {
    // كل درجة نقص عن ممتاز = -2 نقطة
    return -2 * nonExcellentDays;
  }
};

/**
 * حساب نقاط الغياب الشهرية
 * عدم الغياب شهرياً = 3 نقاط
 * كل غياب = -1 نقطة
 * ملاحظة: يتم الحساب على مستوى الشهر وليس اليوم
 */
export const calculateMonthlyAttendancePoints = (absenceCount: number): number => {
  if (absenceCount === 0) {
    // لا غياب طوال الشهر
    return 3;
  } else {
    // كل غياب = -1 نقطة
    return -1 * absenceCount;
  }
};

/**
 * حساب نقاط المذاكرة الشهرية (من 100)
 * علامة كاملة (100) = 3 نقاط
 * كل نقص 10 = -1 نقطة
 * الحد الأقصى للخصم = 3 نقاط (أقل من 70 = -3 فقط)
 */
export const calculateMonthlyReviewPoints = (score: number): number => {
  if (score >= 100) {
    return 3;
  } else if (score < 70) {
    // أقل من 70 = -3 نقاط فقط (الحد الأقصى للخصم)
    return -3;
  } else {
    // كل نقص 10 = -1 نقطة
    return -1 * Math.floor((100 - score) / 10);
  }
};

/**
 * حساب نقاط الاختبارات
 * كل اختبار ليس إعادة = 3 نقاط
 * التسميع: لا نقاط عليه
 */
export const calculateExamPoints = (examCount: number): number => {
  // كل اختبار ليس إعادة = 3 نقاط
  return examCount * 3;
};

/**
 * حساب مجموع النقاط الشهرية الإجمالية
 */
export const calculateMonthlyRankingPoints = (
  behaviorGrades: string[],
  absenceCount: number,
  monthlyReviewScore: number | null,
  examCount: number
): RankingPointsCalculation => {
  const behaviorPoints = calculateMonthlyBehaviorPoints(behaviorGrades);
  const attendancePoints = calculateMonthlyAttendancePoints(absenceCount);
  const homeworkPoints = monthlyReviewScore !== null ? calculateMonthlyReviewPoints(monthlyReviewScore) : 0;
  const examPoints = calculateExamPoints(examCount);
  
  const totalPoints = behaviorPoints + attendancePoints + homeworkPoints + examPoints;
  
  return {
    behaviorPoints,
    attendancePoints,
    homeworkPoints,
    examPoints,
    totalPoints
  };
};
