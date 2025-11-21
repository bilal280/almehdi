import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import StudentCard from "@/components/StudentCard";
import QuranSection from "@/components/QuranSection";
import HadithSection from "@/components/HadithSection";
import BehaviorSection from "@/components/BehaviorSection";
import NotesSection from "@/components/NotesSection";
import IslamicTime from "@/components/IslamicTime";
import PointsSection from "@/components/PointsSection";
import ExamSection from "@/components/ExamSection";
import { RotateCcw, BookOpen, AlertCircle, ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DynamicStudentReport = () => {
  const { studentNumber } = useParams();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedView, setSelectedView] = useState<'monthly' | 'quarterly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (studentNumber) {
      fetchStudentData();
    }
  }, [studentNumber]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDayName = (date: Date) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات الطالب باستخدام الرقم التسلسلي
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          circles (
            id,
            name,
            teachers (
              name
            )
          )
        `)
        .eq('student_number', parseInt(studentNumber || '0'))
        .single();

      if (studentError) throw studentError;
      if (!student) {
        setError('لم يتم العثور على الطالب');
        setLoading(false);
        return;
      }

      const studentId = student.id;
      setCurrentStudentId(studentId);

      // التحقق من حضور الطالب اليوم
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', studentId)
        .eq('date', today)
        .maybeSingle();

      const isPresent = attendance?.status === 'present';
      const isAbsent = attendance?.status === 'absent';

      // إذا كان حاضر، جلب أعماله اليوم
      let dailyWork = null;
      let beginnerRecitations = [];
      let hasDataRecorded = false;
      
      if (isPresent) {
        const { data: work } = await supabase
          .from('student_daily_work')
          .select('*')
          .eq('student_id', studentId)
          .eq('date', today)
          .maybeSingle();

        dailyWork = work;
        hasDataRecorded = !!work;

        // جلب تسميعات التمهيدي إن وجدت
        if (student.level === 'تمهيدي') {
          const { data: beginnerData } = await supabase
            .from('student_beginner_recitations')
            .select('*')
            .eq('student_id', studentId)
            .eq('date', today)
            .order('created_at', { ascending: true });
          
          beginnerRecitations = beginnerData || [];
        }
      }

      // جلب نشاطات الحلقة لهذا اليوم
      const { data: circleActivities } = await supabase
        .from('circle_daily_activities')
        .select('*')
        .eq('circle_id', student.circle_id)
        .eq('date', today);

      // جلب النقاط التراكمية
      const { data: allEnthusiasmPoints } = await supabase
        .from('student_points')
        .select('points')
        .eq('student_id', studentId)
        .eq('point_type', 'enthusiasm');
      
      const enthusiasmPoints = allEnthusiasmPoints?.reduce((sum, p) => sum + p.points, 0) || 0;

      const { data: allGeneralPoints } = await supabase
        .from('student_points')
        .select('points')
        .eq('student_id', studentId)
        .eq('point_type', 'general');
      
      const generalPoints = allGeneralPoints?.reduce((sum, p) => sum + p.points, 0) || 0;
      setTotalPoints(generalPoints);

      // جلب نتائج الاختبارات - اليوم فقط
      const { data: exams } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', studentId)
        .eq('exam_date', today)
        .order('created_at', { ascending: false });

      // تحضير البيانات حسب المستوى
      let newRecitations = [];
      let reviews = [];

      if (student.level === 'تمهيدي') {
        // للطلاب التمهيديين: عرض كل سطر بصفحته
        newRecitations = beginnerRecitations.map((rec: any) => ({
          id: rec.id,
          pageNumber: rec.page_number,
          lineNumbers: rec.line_numbers,
          grade: rec.grade,
          gradeText: rec.grade
        }));
      } else {
        // للطلاب العاديين: عرض أرقام الصفحات الفعلية
        if (dailyWork && dailyWork.new_recitation_page_numbers) {
          const pageNumbers = dailyWork.new_recitation_page_numbers.split(',');
          newRecitations = pageNumbers.map((pageNum: string, i: number) => ({
            id: i + 1,
            pageNumber: parseInt(pageNum.trim()),
            grade: dailyWork.new_recitation_grade,
            gradeText: dailyWork.new_recitation_grade
          }));
        }
        
        if (dailyWork && dailyWork.review_page_numbers) {
          const pageNumbers = dailyWork.review_page_numbers.split(',');
          reviews = pageNumbers.map((pageNum: string, i: number) => ({
            id: i + 1,
            pageNumber: parseInt(pageNum.trim()),
            grade: dailyWork.review_grade,
            gradeText: dailyWork.review_grade
          }));
        }
      }

      setCurrentStudentId(studentId);
      setStudentData({
        name: student.name,
        photoUrl: student.photo_url,
        level: student.level || "تلاوة",
        date: today,
        dayName: getDayName(new Date()),
        instituteName: "معهد المهدي",
        teacherName: student.circles?.teachers?.name || "غير محدد",
        className: student.circles?.name || "غير محدد",
        circleId: student.circle_id,
        isPresent,
        isAbsent,
        hasDataRecorded,
        circleActivities: circleActivities || [],
        newRecitations,
        reviews,
        hadiths: dailyWork && dailyWork.hadith_count > 0 ? [
          { id: 1, title: `${dailyWork.hadith_count} أحاديث`, grade: dailyWork.hadith_grade, gradeText: dailyWork.hadith_grade }
        ] : [],
        behavior: dailyWork?.behavior_grade || "غير محدد",
        enthusiasmPoints,
        generalPoints,
        notes: dailyWork?.teacher_notes ? [dailyWork.teacher_notes] : [],
        exams: exams || []
      });

    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('فشل في تحميل بيانات الطالب');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات الطالب...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'الطالب غير موجود'}</AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للصفحة الرئيسية
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (studentData.isAbsent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <StudentHeader 
            instituteName={studentData.instituteName}
            teacherName={studentData.teacherName}
            className={studentData.className}
          />
          
          <IslamicTime />
          
          <StudentCard 
            studentName={studentData.name}
            photoUrl={studentData.photoUrl}
            date={studentData.date}
            dayName={studentData.dayName}
          />
          
          <div className="mt-8 space-y-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-center text-lg text-red-700 font-bold">
                الطالب غائب اليوم - لا توجد أنشطة مسجلة
              </AlertDescription>
            </Alert>
            
            <PointsSection 
              enthusiasmPoints={studentData.enthusiasmPoints}
              generalPoints={studentData.generalPoints}
            />
          </div>
          
          <footer className="mt-12 text-center text-muted-foreground">
            <div className="islamic-card p-4">
              <p className="text-sm">
                تم إنشاء هذا التقرير بواسطة نظام متابعة الطلاب الإلكتروني
              </p>
              <p className="text-xs mt-1">
                {studentData.instituteName} - جميع الحقوق محفوظة
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  if (studentData.isPresent && !studentData.hasDataRecorded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <StudentHeader 
            instituteName={studentData.instituteName}
            teacherName={studentData.teacherName}
            className={studentData.className}
          />
          
          <IslamicTime />
          
          <StudentCard 
            studentName={studentData.name}
            photoUrl={studentData.photoUrl}
            date={studentData.date}
            dayName={studentData.dayName}
          />
          
          <div className="mt-8 space-y-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-center text-lg text-yellow-700 font-semibold">
                لم يتم تسجيل بيانات الطالب بعد
              </AlertDescription>
            </Alert>
            
            <PointsSection 
              enthusiasmPoints={studentData.enthusiasmPoints}
              generalPoints={studentData.generalPoints}
            />
          </div>
          
          <footer className="mt-12 text-center text-muted-foreground">
            <div className="islamic-card p-4">
              <p className="text-sm">
                تم إنشاء هذا التقرير بواسطة نظام متابعة الطلاب الإلكتروني
              </p>
              <p className="text-xs mt-1">
                {studentData.instituteName} - جميع الحقوق محفوظة
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const today = new Date();
      const startDate = new Date();
      
      if (selectedView === 'monthly') {
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 1, 0);
        await fetchMonthlyRecords(startDate, endDate);
      } else {
        // فصلي - 4 أشهر
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 4, 0);
        await fetchMonthlyRecords(startDate, endDate);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchMonthlyRecords = async (startDate: Date, endDate: Date) => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // جلب معلومات الطالب والحلقة
    const { data: student } = await supabase
      .from('students')
      .select('circle_id')
      .eq('id', currentStudentId)
      .single();

    if (!student) return;

    // جلب جميع طلاب الحلقة
    const { data: circleStudents } = await supabase
      .from('students')
      .select('id, name')
      .eq('circle_id', student.circle_id);

    const studentIds = circleStudents?.map(s => s.id) || [];

    // جلب بيانات جميع الطلاب
    const recordsPromises = studentIds.map(async (id) => {
      // جلب بيانات الأعمال اليومية
      const { data: dailyWorkData } = await supabase
        .from('student_daily_work')
        .select('*')
        .eq('student_id', id)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // جلب تسميعات التمهيدي
      const { data: beginnerData } = await supabase
        .from('student_beginner_recitations')
        .select('*')
        .eq('student_id', id)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // جلب الغياب
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', id)
        .eq('status', 'absent')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // جلب الاختبارات
      const { data: examsData } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', id)
        .gte('exam_date', startDateStr)
        .lte('exam_date', endDateStr);

      // جلب النقاط
      const { data: pointsData } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', id)
        .eq('point_type', 'general')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // حساب الإحصائيات
      let totalPages = 0;
      let behaviorSum = 0;
      let behaviorCount = 0;

      dailyWorkData?.forEach(work => {
        totalPages += (work.new_recitation_pages || 0) + (work.review_pages || 0);
        
        if (work.behavior_grade) {
          const behaviorValue = getBehaviorValue(work.behavior_grade);
          if (behaviorValue > 0) {
            behaviorSum += behaviorValue;
            behaviorCount++;
          }
        }
      });

      totalPages += beginnerData?.length || 0;

      const absenceCount = attendanceData?.length || 0;
      const examsCount = examsData?.length || 0;
      const retakeCount = examsData?.filter(e => e.attempt_number > 1).length || 0;
      const behaviorAverage = behaviorCount > 0 ? getBehaviorLabel(behaviorSum / behaviorCount) : "غير محدد";
      const totalPointsSum = pointsData?.reduce((sum, p) => sum + p.points, 0) || 0;

      const lastWork = dailyWorkData?.[dailyWorkData.length - 1];
      const lastPage = lastWork ? `${lastWork.new_recitation_pages || 0}` : "لا يوجد";

      return {
        studentId: id,
        studentName: circleStudents?.find(s => s.id === id)?.name || '',
        totalPages,
        absenceCount,
        lastPage,
        examsCount,
        retakeCount,
        behaviorAverage,
        totalPoints: totalPointsSum
      };
    });

    const allRecords = await Promise.all(recordsPromises);
    setRecords(allRecords);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Fixed Navbar with animations */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-primary to-primary/90 backdrop-blur-md shadow-2xl border-b-2 border-primary-foreground/30 animate-in slide-in-from-top duration-500">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent animate-pulse"></div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="relative flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-lg">
                  <FileText className="w-4 h-4 animate-pulse" />
                  المحصلات
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping"></span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>المحصلات الشهرية والفصلية</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'monthly' | 'quarterly')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="monthly">شهري</TabsTrigger>
                      <TabsTrigger value="quarterly">فصلي (4 أشهر)</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Select value={selectedMonth} onValueChange={(value) => {
                    setSelectedMonth(value);
                    setTimeout(() => fetchRecords(), 100);
                  }}>
                    <SelectTrigger>
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

                  {loadingRecords ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : records.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم الطالب</TableHead>
                          <TableHead className="text-right">مجموع الصفحات</TableHead>
                          <TableHead className="text-right">الغيابات</TableHead>
                          <TableHead className="text-right">آخر صفحة</TableHead>
                          <TableHead className="text-right">عدد الاختبارات</TableHead>
                          <TableHead className="text-right">الإعادة</TableHead>
                          <TableHead className="text-right">متوسط السلوك</TableHead>
                          <TableHead className="text-right">مجموع النقاط</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record, index) => (
                          <TableRow key={index} className={record.studentId === currentStudentId ? "bg-primary/10" : ""}>
                            <TableCell className="font-bold">{record.studentName}</TableCell>
                            <TableCell className="font-medium">{record.totalPages}</TableCell>
                            <TableCell>{record.absenceCount}</TableCell>
                            <TableCell>{record.lastPage}</TableCell>
                            <TableCell>{record.examsCount}</TableCell>
                            <TableCell>{record.retakeCount}</TableCell>
                            <TableCell>{record.behaviorAverage}</TableCell>
                            <TableCell className="font-bold text-primary">{record.totalPoints}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      لا توجد سجلات للفترة المحددة
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <div className="relative z-10 text-primary-foreground font-bold text-lg flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
              <span className="text-sm hidden sm:inline">النقاط العامة:</span>
              <span className="text-xl sm:text-2xl animate-pulse">{totalPoints}</span>
            </div>
            <div className="relative z-10 text-primary-foreground font-bold text-lg sm:text-2xl flex items-center gap-3 bg-primary-foreground/10 px-6 py-2 rounded-full backdrop-blur-sm border border-primary-foreground/20">
              {studentData.photoUrl && (
                <img 
                  src={studentData.photoUrl} 
                  alt={studentData.name}
                  className="w-10 h-10 rounded-full border-2 border-primary-foreground object-cover"
                />
              )}
              {studentData.name}
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <StudentHeader 
          instituteName={studentData.instituteName}
          teacherName={studentData.teacherName}
          className={studentData.className}
        />
        
        <IslamicTime />
        
        <StudentCard 
          studentName={studentData.name}
          photoUrl={studentData.photoUrl}
          date={studentData.date}
          dayName={studentData.dayName}
        />
        
        {/* مستوى الطالب */}
        <div className="islamic-card p-4 text-center mb-4">
          <span className="text-lg font-bold text-primary">
            المستوى: {studentData.level}
          </span>
        </div>
        
        <div className="grid gap-6">
          {/* نشاطات الحلقة اليومية */}
          {studentData.circleActivities && studentData.circleActivities.length > 0 && (
            <div className="islamic-card p-6 fade-in-up">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                نشاطات الحلقة اليوم
              </h3>
              <div className="space-y-3">
                {studentData.circleActivities.map((activity: any) => (
                  <div key={activity.id} className="p-4 bg-muted/30 rounded-lg border border-primary/20">
                    <h4 className="font-bold text-lg text-primary mb-2">{activity.activity_type}</h4>
                    {activity.description && (
                      <p className="text-muted-foreground mb-2">{activity.description}</p>
                    )}
                    {activity.target_pages && (
                      <p className="text-sm text-muted-foreground">
                        الهدف: {activity.target_pages} صفحة
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground italic mt-2">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* عرض التسميعات حسب المستوى */}
          {studentData.level === 'تمهيدي' ? (
            // للطلاب التمهيديين: عرض كل سطر
            studentData.newRecitations.length > 0 && (
              <div className="islamic-card p-6 fade-in-right">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-primary">التسميع اليومي</h3>
                </div>
                <div className="space-y-3">
                  {studentData.newRecitations.map((rec: any) => (
                    <div 
                      key={rec.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl hover:shadow-md transition-all duration-300 border border-primary/20"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-lg font-semibold text-foreground">
                          صفحة {rec.pageNumber}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          الأسطر: {rec.lineNumbers}
                        </span>
                      </div>
                      <span className="grade-badge bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-lg font-bold">
                        {rec.gradeText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            // للطلاب العاديين
            <>
              {studentData.newRecitations.length > 0 && (
                <div className="islamic-card p-6 fade-in-right">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-primary">التسميع الجديد</h3>
                    <span className="text-sm text-muted-foreground">({studentData.newRecitations.length} صفحة)</span>
                  </div>
                  <div className="space-y-3">
                    {studentData.newRecitations.map((rec: any) => (
                      <div 
                        key={rec.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl hover:shadow-md transition-all duration-300 border border-primary/20"
                      >
                        <span className="text-lg font-semibold text-foreground">
                          صفحة {rec.pageNumber}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="grade-badge bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-lg font-bold">
                            {rec.gradeText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {studentData.reviews.length > 0 && (
                <div className="islamic-card p-6 fade-in-right">
                  <div className="flex items-center gap-3 mb-4">
                    <RotateCcw className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-primary">المراجعة والتعاهد</h3>
                    <span className="text-sm text-muted-foreground">({studentData.reviews.length} صفحة)</span>
                  </div>
                  <div className="space-y-3">
                    {studentData.reviews.map((rec: any) => (
                      <div 
                        key={rec.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl hover:shadow-md transition-all duration-300 border border-primary/20"
                      >
                        <span className="text-lg font-semibold text-foreground">
                          صفحة {rec.pageNumber}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="grade-badge bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-lg font-bold">
                            {rec.gradeText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {studentData.hadiths.length > 0 && (
            <HadithSection hadiths={studentData.hadiths} />
          )}
          
          <PointsSection 
            enthusiasmPoints={studentData.enthusiasmPoints}
            generalPoints={studentData.generalPoints}
          />
          
          <BehaviorSection behavior={studentData.behavior} />
          
          {studentData.notes.length > 0 && (
            <NotesSection notes={studentData.notes} />
          )}

          {studentData.exams && studentData.exams.length > 0 && (
            <ExamSection exams={studentData.exams} />
          )}
        </div>
        
        <footer className="mt-12 text-center text-muted-foreground">
          <div className="islamic-card p-4">
            <p className="text-sm">
              تم إنشاء هذا التقرير بواسطة نظام متابعة الطلاب الإلكتروني
            </p>
            <p className="text-xs mt-1">
              {studentData.instituteName} - جميع الحقوق محفوظة
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DynamicStudentReport;