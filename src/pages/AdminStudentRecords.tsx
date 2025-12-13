import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/exportToExcel";

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
  monthlyReviewScore: number | null;
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
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableMonths, setAvailableMonths] = useState<{value: string, label: string}[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [summaryRecords, setSummaryRecords] = useState<StudentMonthlyRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
    fetchAvailableMonthsAndYears();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedView, selectedCircle]);

  const fetchAvailableMonthsAndYears = async () => {
    try {
      // جلب التواريخ من الأعمال اليومية
      const { data: workDates } = await supabase
        .from('student_daily_work')
        .select('date');

      // جلب التواريخ من الحضور
      const { data: attendanceDates } = await supabase
        .from('student_attendance')
        .select('date');

      // دمج التواريخ
      const allDates = [
        ...(workDates?.map(d => d.date) || []),
        ...(attendanceDates?.map(d => d.date) || [])
      ];

      // استخراج الأشهر والسنوات الفريدة
      const monthYearSet = new Set<string>();
      const yearSet = new Set<string>();

      allDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const month = date.getMonth();
        const year = date.getFullYear();
        monthYearSet.add(`${year}-${month}`);
        yearSet.add(year.toString());
      });

      // تحويل إلى مصفوفات
      const years = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(years);

      // تصفية الأشهر حسب السنة المختارة
      updateAvailableMonths(monthYearSet, selectedYear);

    } catch (error) {
      console.error('Error fetching available months:', error);
    }
  };

  const updateAvailableMonths = (monthYearSet: Set<string>, year: string) => {
    const monthsForYear = months.filter(m => 
      monthYearSet.has(`${year}-${m.value}`)
    );
    setAvailableMonths(monthsForYear);
    
    // إذا كان الشهر المختار غير موجود في القائمة، اختر أول شهر متاح
    if (monthsForYear.length > 0 && !monthsForYear.find(m => m.value === selectedMonth)) {
      setSelectedMonth(monthsForYear[0].value);
    }
  };

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

      // جلب جميع الطلاب أولاً (استثناء المنقطعين)
      let studentsQuery = supabase
        .from('students')
        .select(`
          id,
          name,
          circle_id,
          circles (
            name
          )
        `)
        .order('name');

      if (selectedCircle !== 'all') {
        studentsQuery = studentsQuery.eq('circle_id', selectedCircle);
      }

      const { data: allStudents, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;

      // جلب قائمة الطلاب المنقطعين لاستثنائهم
      const { data: discontinuedStudents } = await supabase
        .from('discontinued_students')
        .select('id');
      
      const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
      
      // تصفية الطلاب لاستثناء المنقطعين
      const activeStudents = allStudents?.filter(s => !discontinuedIds.has(s.id)) || [];

      // إنشاء Map لجميع الطلاب النشطين
      const studentMap = new Map<string, StudentSummary>();
      activeStudents.forEach(student => {
        studentMap.set(student.id, {
          student_id: student.id,
          studentName: student.name,
          circleName: student.circles?.name || 'غير محدد',
          totalRecitationPages: 0,
          totalReviewPages: 0,
          totalHadithCount: 0,
          totalExams: 0,
        });
      });

      // جلب بيانات الأعمال اليومية
      const { data: workData, error: workError } = await supabase
        .from('student_daily_work')
        .select('student_id, new_recitation_pages, review_pages, hadith_count, new_recitation_grade')
        .gte('date', dateFilter)
        .in('student_id', Array.from(studentMap.keys()));

      if (workError) throw workError;

      // جلب بيانات تسميعات التمهيديين
      const { data: beginnerData, error: beginnerError } = await supabase
        .from('student_beginner_recitations')
        .select('student_id, page_number, grade')
        .gte('date', dateFilter)
        .in('student_id', Array.from(studentMap.keys()));

      if (beginnerError) throw beginnerError;

      // جلب بيانات الاختبارات
      const { data: examData, error: examError } = await supabase
        .from('student_exams')
        .select('student_id, id')
        .gte('exam_date', dateFilter)
        .in('student_id', Array.from(studentMap.keys()));

      if (examError) throw examError;

      // إضافة بيانات الأعمال اليومية (استثناء الإعادات)
      workData?.forEach(work => {
        const summary = studentMap.get(work.student_id);
        if (summary) {
          // حساب الصفحات فقط إذا لم تكن إعادة
          if (work.new_recitation_grade !== 'إعادة') {
            summary.totalRecitationPages += work.new_recitation_pages || 0;
          }
          summary.totalReviewPages += work.review_pages || 0;
          summary.totalHadithCount += work.hadith_count || 0;
        }
      });

      // إضافة بيانات التمهيديين (حساب الصفحات الفريدة، استثناء الإعادات)
      const studentUniquePages = new Map<string, Set<number>>();
      beginnerData?.forEach(rec => {
        const summary = studentMap.get(rec.student_id);
        if (summary && rec.grade !== 'إعادة') {
          if (!studentUniquePages.has(rec.student_id)) {
            studentUniquePages.set(rec.student_id, new Set());
          }
          studentUniquePages.get(rec.student_id)!.add(rec.page_number);
        }
      });

      // إضافة عدد الصفحات الفريدة للتمهيديين
      studentUniquePages.forEach((pages, studentId) => {
        const summary = studentMap.get(studentId);
        if (summary) {
          summary.totalRecitationPages += pages.size;
        }
      });

      // إضافة عدد الاختبارات
      examData?.forEach(exam => {
        const summary = studentMap.get(exam.student_id);
        if (summary) {
          summary.totalExams += 1;
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
    // تحديث السنة في startDate و endDate
    startDate.setFullYear(parseInt(selectedYear));
    endDate.setFullYear(parseInt(selectedYear));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // جلب جميع الطلاب (استثناء المنقطعين)
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

    // جلب قائمة الطلاب المنقطعين لاستثنائهم
    const { data: discontinuedStudents } = await supabase
      .from('discontinued_students')
      .select('id');
    
    const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
    
    // تصفية الطلاب لاستثناء المنقطعين
    const activeStudents = students?.filter(s => !discontinuedIds.has(s.id)) || [];

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

    // جلب المذاكرة الشهرية
    const monthNum = startDate.getMonth() + 1;
    const yearNum = startDate.getFullYear();
    // @ts-ignore - monthly_reviews table will be added after migration
    const { data: monthlyReviewsData } = await (supabase as any)
      .from('monthly_reviews')
      .select('*')
      .eq('month', monthNum)
      .eq('year', yearNum);

    // حساب الإحصائيات لكل طالب
    const summaryRecordsArray: StudentMonthlyRecord[] = [];

    activeStudents.forEach(student => {
      const studentId = student.id;
      const studentName = student.name;
      const circleName = student.circles?.name || 'غير محدد';

      // حساب الصفحات
      let totalPages = 0;
      let behaviorSum = 0;
      let behaviorCount = 0;

      // من الأعمال اليومية (استثناء الإعادات)
      const studentDailyWork = dailyWorkData?.filter(w => w.student_id === studentId) || [];
      studentDailyWork.forEach(work => {
        // حساب صفحات التسميع الجديدة (إذا لم تكن إعادة)
        if (work.new_recitation_grade !== 'إعادة') {
          totalPages += (work.new_recitation_pages || 0);
        }
        
        // حساب صفحات المراجعة (إذا لم تكن إعادة)
        if (work.review_grade !== 'إعادة') {
          totalPages += (work.review_pages || 0);
        }
        
        if (work.behavior_grade) {
          const behaviorValue = getBehaviorValue(work.behavior_grade);
          if (behaviorValue > 0) {
            behaviorSum += behaviorValue;
            behaviorCount++;
          }
        }
      });

      // من تسميعات التمهيدي (حساب الصفحات الفريدة فقط، استثناء الإعادات)
      const studentBeginnerWork = beginnerData?.filter(b => b.student_id === studentId) || [];
      
      // إنشاء مجموعة من الصفحات الفريدة (استثناء الإعادات)
      const uniquePages = new Set<number>();
      studentBeginnerWork.forEach(work => {
        // فقط إذا لم يكن التقييم "إعادة"
        if (work.grade !== 'إعادة') {
          uniquePages.add(work.page_number);
        }
      });
      
      // إضافة عدد الصفحات الفريدة
      totalPages += uniquePages.size;

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

      // المذاكرة الشهرية
      // @ts-ignore
      const monthlyReview = monthlyReviewsData?.find(r => r.student_id === studentId);
      // @ts-ignore
      const monthlyReviewScore = monthlyReview?.score || null;

      // آخر صفحة - نحتاج لجلب رقم الصفحة من new_recitation_page_numbers
      let lastPage = "لا يوجد";
      
      // البحث عن آخر عمل يومي يحتوي على تسميع
      for (let i = studentDailyWork.length - 1; i >= 0; i--) {
        const work = studentDailyWork[i];
        if (work.new_recitation_page_numbers) {
          // استخراج آخر رقم صفحة من النص
          const pageNumbers = work.new_recitation_page_numbers.split(',').map((p: string) => p.trim()).filter((p: string) => p);
          if (pageNumbers.length > 0) {
            lastPage = pageNumbers[pageNumbers.length - 1];
            break;
          }
        } else if (work.new_recitation_pages && work.new_recitation_pages > 0) {
          // في حالة عدم وجود أرقام الصفحات، نعرض عدد الصفحات فقط
          lastPage = `${work.new_recitation_pages} صفحة`;
          break;
        }
      }
      
      // إذا لم نجد في الأعمال اليومية، نبحث في تسميعات التمهيدي
      if (lastPage === "لا يوجد" && studentBeginnerWork.length > 0) {
        const lastBeginnerWork = studentBeginnerWork[studentBeginnerWork.length - 1];
        if (lastBeginnerWork.page_number) {
          lastPage = `صفحة ${lastBeginnerWork.page_number}`;
        }
      }

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
        totalPoints: totalPointsSum,
        monthlyReviewScore
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

  const handleExportBasicRecords = () => {
    const exportData = records.map((record, index) => ({
      'الرقم': index + 1,
      'اسم الطالب': record.studentName,
      'الحلقة': record.circleName,
      'صفحات التسميع': record.totalRecitationPages,
      'صفحات المراجعة': record.totalReviewPages,
      'الأحاديث': record.totalHadithCount,
      'الاختبارات': record.totalExams,
    }));

    const viewType = selectedView === 'weekly' ? 'أسبوعي' : 'شهري';
    const circleName = selectedCircle === 'all' ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    exportToExcel(exportData, `سجلات_الطلاب_${viewType}_${circleName}_${new Date().toLocaleDateString('ar-SA')}`, 'السجلات الأساسية');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير السجلات إلى ملف Excel",
    });
  };

  const handleExportSummaryRecords = () => {
    const exportData = summaryRecords.map((record, index) => ({
      'الرقم': index + 1,
      'اسم الطالب': record.studentName,
      'الحلقة': record.circleName,
      'مجموع الصفحات': record.totalPages,
      'الغيابات': record.absenceCount,
      'آخر صفحة': record.lastPage,
      'عدد الاختبارات': record.examsCount,
      'الإعادة': record.retakeCount,
      'متوسط السلوك': record.behaviorAverage,
      'المذاكرة الشهرية': record.monthlyReviewScore !== null ? `${record.monthlyReviewScore}/100` : '-',
      'مجموع النقاط': record.totalPoints,
    }));

    const viewType = summaryView === 'monthly' ? 'شهري' : 'فصلي';
    const monthName = months[parseInt(selectedMonth)].label;
    const circleName = selectedCircle === 'all' ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    exportToExcel(exportData, `المحصلات_${viewType}_${monthName}_${circleName}_${new Date().toLocaleDateString('ar-SA')}`, 'المحصلات');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير المحصلات إلى ملف Excel",
    });
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <AdminNavbar />
        
        <main dir="rtl" className="container mx-auto px-4 py-8">
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
                {!loading && records.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <Button onClick={handleExportBasicRecords} className="gap-2">
                      <Download className="w-4 h-4" />
                      تصدير إلى Excel
                    </Button>
                  </div>
                )}
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
                  <div className="overflow-x-auto" dir="rtl">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">اسم الطالب</TableHead>
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
                            <TableCell className="text-center font-medium">{record.studentName}</TableCell>
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
                  {summaryRecords.length > 0 && (
                    <div className="flex justify-end">
                      <Button onClick={handleExportSummaryRecords} className="gap-2">
                        <Download className="w-4 h-4" />
                        تصدير إلى Excel
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-4 items-center flex-wrap">
                    <Tabs value={summaryView} onValueChange={(v) => setSummaryView(v as 'monthly' | 'quarterly')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">شهري</TabsTrigger>
                        <TabsTrigger value="quarterly">فصلي (4 أشهر)</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[150px] bg-background">
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-48 bg-background">
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMonths.length > 0 ? (
                          availableMonths.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            لا توجد بيانات لهذه السنة
                          </SelectItem>
                        )}
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
                    <div className="overflow-x-auto" dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">اسم الطالب</TableHead>
                            <TableHead className="text-right">الحلقة</TableHead>
                            <TableHead className="text-center">مجموع الصفحات</TableHead>
                            <TableHead className="text-center">الغيابات</TableHead>
                            <TableHead className="text-center">آخر صفحة</TableHead>
                            <TableHead className="text-center">عدد الاختبارات</TableHead>
                            <TableHead className="text-center">الإعادة</TableHead>
                            <TableHead className="text-center">متوسط السلوك</TableHead>
                            <TableHead className="text-center">المذاكرة الشهرية</TableHead>
                            <TableHead className="text-center">مجموع النقاط</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summaryRecords.map((record) => (
                            <TableRow key={record.student_id}>
                              <TableCell className="text-center font-medium">{record.studentName}</TableCell>
                              <TableCell>{record.circleName}</TableCell>
                              <TableCell className="text-center">{record.totalPages}</TableCell>
                              <TableCell className="text-center">{record.absenceCount}</TableCell>
                              <TableCell className="text-center">{record.lastPage}</TableCell>
                              <TableCell className="text-center">{record.examsCount}</TableCell>
                              <TableCell className="text-center">{record.retakeCount}</TableCell>
                              <TableCell className="text-center">{record.behaviorAverage}</TableCell>
                              <TableCell className="text-center">
                                {record.monthlyReviewScore !== null ? (
                                  <span className={`font-bold ${
                                    record.monthlyReviewScore >= 90 ? 'text-green-600' :
                                    record.monthlyReviewScore >= 75 ? 'text-blue-600' :
                                    record.monthlyReviewScore >= 60 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {record.monthlyReviewScore}/100
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
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
