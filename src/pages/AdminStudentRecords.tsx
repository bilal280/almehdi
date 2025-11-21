import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentSummary {
  student_id: string;
  studentName: string;
  circleName: string;
  totalRecitationPages: number;
  totalReviewPages: number;
  totalHadithCount: number;
  totalExams: number;
}

interface StudentMonthlyRecord {
  student_id: string;
  studentName: string;
  circleName: string;
  totalPages: number;
  absenceCount: number;
  lastPage: string;
  examsCount: number;
  retakeCount: number;
  behaviorAverage: string;
  totalPoints: number;
}

interface Circle {
  id: string;
  name: string;
}

const AdminStudentRecords = () => {
  const [selectedView, setSelectedView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [records, setRecords] = useState<StudentSummary[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // للمحصلات الشهرية والفصلية
  const [summaryView, setSummaryView] = useState<'monthly' | 'quarterly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [summaryRecords, setSummaryRecords] = useState<StudentMonthlyRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedView, selectedCircle]);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from('circles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date();
      
      if (selectedView === 'weekly') {
        startDate.setDate(today.getDate() - 7);
      } else {
        startDate.setMonth(today.getMonth() - 1);
      }

      const dateFilter = startDate.toISOString().split('T')[0];

      // جلب بيانات الأعمال اليومية
      let workQuery = supabase
        .from('student_daily_work')
        .select(`
          student_id,
          new_recitation_pages,
          review_pages,
          hadith_count,
          students (
            name,
            circle_id,
            circles (
              name
            )
          )
        `)
        .gte('date', dateFilter);

      const { data: workData, error: workError } = await workQuery;
      if (workError) throw workError;

      // جلب بيانات الاختبارات
      let examQuery = supabase
        .from('student_exams')
        .select('student_id, id, circle_id')
        .gte('exam_date', dateFilter);

      const { data: examData, error: examError } = await examQuery;
      if (examError) throw examError;

      // دمج البيانات وحساب المجاميع لكل طالب
      const studentMap = new Map<string, StudentSummary>();

      workData?.forEach(work => {
        const studentId = work.student_id;
        const studentName = work.students?.name || 'غير محدد';
        const circleId = work.students?.circle_id;
        const circleName = work.students?.circles?.name || 'غير محدد';
        
        // فلترة حسب الحلقة المختارة
        if (selectedCircle !== 'all' && circleId !== selectedCircle) {
          return;
        }

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student_id: studentId,
            studentName,
            circleName,
            totalRecitationPages: 0,
            totalReviewPages: 0,
            totalHadithCount: 0,
            totalExams: 0,
          });
        }

        const summary = studentMap.get(studentId)!;
        summary.totalRecitationPages += work.new_recitation_pages || 0;
        summary.totalReviewPages += work.review_pages || 0;
        summary.totalHadithCount += work.hadith_count || 0;
      });

      // إضافة عدد الاختبارات
      examData?.forEach(exam => {
        const studentId = exam.student_id;
        if (studentMap.has(studentId)) {
          // فلترة حسب الحلقة المختارة
          if (selectedCircle !== 'all' && exam.circle_id !== selectedCircle) {
            return;
          }
          studentMap.get(studentId)!.totalExams += 1;
        }
      });

      const summaryArray = Array.from(studentMap.values());
      setRecords(summaryArray);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل السجلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryRecords = async () => {
    setLoadingSummary(true);
    try {
      const today = new Date();
      const startDate = new Date();
      
      if (summaryView === 'monthly') {
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 1, 0);
        await fetchMonthlyRecordsForAllStudents(startDate, endDate);
      } else {
        // فصلي - 4 أشهر
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 4, 0);
        await fetchMonthlyRecordsForAllStudents(startDate, endDate);
      }
    } catch (error) {
      console.error('Error fetching summary records:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المحصلات",
        variant: "destructive",
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchMonthlyRecordsForAllStudents = async (startDate: Date, endDate: Date) => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // جلب جميع الطلاب
    let studentsQuery = supabase
      .from('students')
      .select(`
        id,
        name,
        circle_id,
        level,
        circles (
          name
        )
      `)
      .order('name');

    if (selectedCircle !== 'all') {
      studentsQuery = studentsQuery.eq('circle_id', selectedCircle);
    }

    const { data: students, error: studentsError } = await studentsQuery;
    if (studentsError) throw studentsError;

    // جلب بيانات الأعمال اليومية
    const { data: dailyWorkData } = await supabase
      .from('student_daily_work')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    // جلب تسميعات التمهيدي
    const { data: beginnerData } = await supabase
      .from('student_beginner_recitations')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    // جلب الغياب
    const { data: attendanceData } = await supabase
      .from('student_attendance')
      .select('*')
      .eq('status', 'absent')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    // جلب الاختبارات
    const { data: examsData } = await supabase
      .from('student_exams')
      .select('*')
      .gte('exam_date', startDateStr)
      .lte('exam_date', endDateStr);

    // جلب النقاط
    const { data: pointsData } = await supabase
      .from('student_points')
      .select('*')
      .eq('point_type', 'general')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    // حساب الإحصائيات لكل طالب
    const summaryRecordsArray: StudentMonthlyRecord[] = [];

    students?.forEach(student => {
      const studentId = student.id;
      const studentName = student.name;
      const circleName = student.circles?.name || 'غير محدد';

      // حساب الصفحات
      let totalPages = 0;
      let behaviorSum = 0;
      let behaviorCount = 0;

      // من الأعمال اليومية
      const studentDailyWork = dailyWorkData?.filter(w => w.student_id === studentId) || [];
      studentDailyWork.forEach(work => {
        totalPages += (work.new_recitation_pages || 0) + (work.review_pages || 0);
        
        if (work.behavior_grade) {
          const behaviorValue = getBehaviorValue(work.behavior_grade);
          if (behaviorValue > 0) {
            behaviorSum += behaviorValue;
            behaviorCount++;
          }
        }
      });

      // من تسميعات التمهيدي
      const studentBeginnerWork = beginnerData?.filter(b => b.student_id === studentId) || [];
      totalPages += studentBeginnerWork.length;

      // الغيابات
      const absenceCount = attendanceData?.filter(a => a.student_id === studentId).length || 0;

      // الاختبارات
      const studentExams = examsData?.filter(e => e.student_id === studentId) || [];
      const examsCount = studentExams.length;
      const retakeCount = studentExams.filter(e => e.attempt_number > 1).length;

      // متوسط السلوك
      const behaviorAverage = behaviorCount > 0 ? getBehaviorLabel(behaviorSum / behaviorCount) : "غير محدد";

      // النقاط
      const studentPoints = pointsData?.filter(p => p.student_id === studentId) || [];
      const totalPointsSum = studentPoints.reduce((sum, p) => sum + p.points, 0);

      // آخر صفحة
      const lastWork = studentDailyWork[studentDailyWork.length - 1];
      const lastPage = lastWork ? `${lastWork.new_recitation_pages || 0}` : "لا يوجد";

      summaryRecordsArray.push({
        student_id: studentId,
        studentName,
        circleName,
        totalPages,
        absenceCount,
        lastPage,
        examsCount,
        retakeCount,
        behaviorAverage,
        totalPoints: totalPointsSum
      });
    });

    setSummaryRecords(summaryRecordsArray);
  };

  const getBehaviorValue = (behavior: string): number => {
    switch (behavior) {
      case "ممتاز": return 4;
      case "جيد جداً": return 3;
      case "جيد": return 2;
      case "مقبول": return 1;
      default: return 0;
    }
  };

  const getBehaviorLabel = (value: number): string => {
    if (value >= 3.5) return "ممتاز";
    if (value >= 2.5) return "جيد جداً";
    if (value >= 1.5) return "جيد";
    if (value >= 0.5) return "مقبول";
    return "غير محدد";
  };

  const months = [
    { value: "0", label: "يناير" },
    { value: "1", label: "فبراير" },
    { value: "2", label: "مارس" },
    { value: "3", label: "أبريل" },
    { value: "4", label: "مايو" },
    { value: "5", label: "يونيو" },
    { value: "6", label: "يوليو" },
    { value: "7", label: "أغسطس" },
    { value: "8", label: "سبتمبر" },
    { value: "9", label: "أكتوبر" },
    { value: "10", label: "نوفمبر" },
    { value: "11", label: "ديسمبر" },
  ];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <AdminNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="islamic-card p-6 mb-8 fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <FileText className="w-12 h-12 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">سجلات الطلاب</h1>
                  <p className="text-muted-foreground">ملخص أعمال الطلاب والمحصلات</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue placeholder="اختر الحلقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحلقات</SelectItem>
                    {circles.map((circle) => (
                      <SelectItem key={circle.id} value={circle.id}>
                        {circle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'weekly' | 'monthly')}>
                  <TabsList className="grid w-48 grid-cols-2">
                    <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                    <TabsTrigger value="monthly">شهري</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Tabs للسجلات الأساسية والمحصلات */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic">السجلات الأساسية</TabsTrigger>
                <TabsTrigger value="summary" onClick={() => fetchSummaryRecords()}>المحصلات الشهرية والفصلية</TabsTrigger>
              </TabsList>

              {/* السجلات الأساسية */}
              <TabsContent value="basic">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">جاري تحميل السجلات...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا توجد سجلات</h3>
                    <p className="text-muted-foreground">
                      لا توجد سجلات للفترة {selectedView === 'weekly' ? 'الأسبوعية' : 'الشهرية'} المحددة
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم الطالب</TableHead>
                          <TableHead className="text-right">الحلقة</TableHead>
                          <TableHead className="text-center">صفحات التسميع</TableHead>
                          <TableHead className="text-center">صفحات المراجعة</TableHead>
                          <TableHead className="text-center">الأحاديث</TableHead>
                          <TableHead className="text-center">الاختبارات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.student_id}>
                            <TableCell className="font-medium">{record.studentName}</TableCell>
                            <TableCell>{record.circleName}</TableCell>
                            <TableCell className="text-center">{record.totalRecitationPages}</TableCell>
                            <TableCell className="text-center">{record.totalReviewPages}</TableCell>
                            <TableCell className="text-center">{record.totalHadithCount}</TableCell>
                            <TableCell className="text-center">{record.totalExams}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* المحصلات الشهرية والفصلية */}
              <TabsContent value="summary">
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <Tabs value={summaryView} onValueChange={(v) => setSummaryView(v as 'monthly' | 'quarterly')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">شهري</TabsTrigger>
                        <TabsTrigger value="quarterly">فصلي (4 أشهر)</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-48 bg-background">
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={fetchSummaryRecords} disabled={loadingSummary}>
                      {loadingSummary ? "جاري التحميل..." : "عرض المحصلات"}
                    </Button>
                  </div>

                  {loadingSummary ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : summaryRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">اسم الطالب</TableHead>
                            <TableHead className="text-right">الحلقة</TableHead>
                            <TableHead className="text-center">مجموع الصفحات</TableHead>
                            <TableHead className="text-center">الغيابات</TableHead>
                            <TableHead className="text-center">آخر صفحة</TableHead>
                            <TableHead className="text-center">عدد الاختبارات</TableHead>
                            <TableHead className="text-center">الإعادة</TableHead>
                            <TableHead className="text-center">متوسط السلوك</TableHead>
                            <TableHead className="text-center">مجموع النقاط</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summaryRecords.map((record) => (
                            <TableRow key={record.student_id}>
                              <TableCell className="font-medium">{record.studentName}</TableCell>
                              <TableCell>{record.circleName}</TableCell>
                              <TableCell className="text-center">{record.totalPages}</TableCell>
                              <TableCell className="text-center">{record.absenceCount}</TableCell>
                              <TableCell className="text-center">{record.lastPage}</TableCell>
                              <TableCell className="text-center">{record.examsCount}</TableCell>
                              <TableCell className="text-center">{record.retakeCount}</TableCell>
                              <TableCell className="text-center">{record.behaviorAverage}</TableCell>
                              <TableCell className="text-center font-bold text-primary">{record.totalPoints}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      اضغط على "عرض المحصلات" لعرض البيانات
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminStudentRecords;
