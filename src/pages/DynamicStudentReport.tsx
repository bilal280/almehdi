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
import MonthlyReviewSection from "@/components/MonthlyReviewSection";
import { RotateCcw, BookOpen, AlertCircle, ArrowLeft, FileText, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
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
  
  // دالة لتحديد التاريخ الافتراضي بناءً على الوقت الحالي (بتوقيت مكة المكرمة UTC+3)
  const getInitialDate = () => {
    // الحصول على الوقت بتوقيت مكة المكرمة (UTC+3)
    const now = new Date();
    const meccaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    const hours = meccaTime.getHours();
    const minutes = meccaTime.getMinutes();
    
    // إذا كان الوقت قبل الساعة 5:30 مساءً (17:30), نعرض بيانات الأمس
    if (hours < 17 || (hours === 17 && minutes < 30)) {
      const yesterday = new Date(meccaTime);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    
    // بعد الساعة 5:30 مساءً (17:30), نعرض بيانات اليوم
    return meccaTime.toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [effectiveDisplayDate, setEffectiveDisplayDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<{value: string, label: string, dayName: string, isToday?: boolean}[]>([]);
  const [dateChanging, setDateChanging] = useState(false);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examsDialogOpen, setExamsDialogOpen] = useState(false);

  useEffect(() => {
    if (studentNumber) {
      generateAvailableDates();
      fetchStudentData();
    }
  }, [studentNumber]);

  useEffect(() => {
    if (studentNumber && selectedDate) {
      setDateChanging(true);
      fetchStudentData().finally(() => setDateChanging(false));
    }
  }, [selectedDate]);

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

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // إنشاء قائمة بالأيام السابقة لمدة أسبوع (أيام الدوام: السبت إلى الأربعاء)
    for (let i = 0; i < 14; i++) { // أسبوعين للتأكد من وجود أيام دوام كافية
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayOfWeek = date.getDay();
      // أيام الدوام: السبت (6), الأحد (0), الاثنين (1), الثلاثاء (2), الأربعاء (3)
      if (dayOfWeek >= 0 && dayOfWeek <= 3 || dayOfWeek === 6) {
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
      }
      
      // توقف عند الحصول على 7 أيام دوام
      if (dates.length >= 7) break;
    }
    
    setAvailableDates(dates.map(dateStr => ({
      value: dateStr,
      label: '',
      dayName: '',
      isToday: false
    })));
  };

  const getCurrentDateInfo = () => {
    const date = new Date(selectedDate);
    const dayName = getDayName(date);
    const formattedDate = date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    
    return { dayName, formattedDate, isToday };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      // البحث عن اليوم السابق من أيام الدوام
      do {
        newDate.setDate(newDate.getDate() - 1);
      } while (![0, 1, 2, 3, 6].includes(newDate.getDay()));
    } else {
      // البحث عن اليوم التالي من أيام الدوام
      do {
        newDate.setDate(newDate.getDate() + 1);
      } while (![0, 1, 2, 3, 6].includes(newDate.getDay()));
    }
    
    const newDateStr = newDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // لا نسمح بالذهاب لتاريخ مستقبلي
    if (direction === 'next' && newDateStr > today) {
      return;
    }
    
    setSelectedDate(newDateStr);
  };

  // دالة لحساب التاريخ الفعلي للعرض (مع مراعاة الخميس والجمعة)
  const getEffectiveDisplayDate = async (studentId: string, requestedDate: string) => {
    const date = new Date(requestedDate);
    const dayOfWeek = date.getDay(); // 0=الأحد, 1=الاثنين, ..., 4=الخميس, 5=الجمعة, 6=السبت
    
    // إذا كان اليوم خميس (4) أو جمعة (5)
    if (dayOfWeek === 4 || dayOfWeek === 5) {
      // أولاً: تحقق من وجود بيانات يوم الخميس
      const thursday = new Date(date);
      if (dayOfWeek === 5) {
        // إذا كان اليوم جمعة، نرجع ليوم الخميس
        thursday.setDate(thursday.getDate() - 1);
      }
      const thursdayStr = thursday.toISOString().split('T')[0];
      
      // تحقق من وجود بيانات الخميس
      const { data: thursdayWork } = await supabase
        .from('student_daily_work')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', thursdayStr)
        .maybeSingle();
      
      const { data: thursdayRecitations } = await supabase
        .from('student_beginner_recitations')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', thursdayStr)
        .maybeSingle();
      
      // إذا وُجدت بيانات الخميس، استخدمها
      if (thursdayWork || thursdayRecitations) {
        return thursdayStr;
      }
      
      // إذا لم توجد بيانات الخميس، استخدم بيانات الأربعاء
      const wednesday = new Date(thursday);
      wednesday.setDate(wednesday.getDate() - 1);
      return wednesday.toISOString().split('T')[0];
    }
    
    // لباقي الأيام، استخدم التاريخ المطلوب
    return requestedDate;
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

      // حساب التاريخ الفعلي للعرض (مع مراعاة الخميس والجمعة)
      const effectiveDate = await getEffectiveDisplayDate(studentId, selectedDate);
      setEffectiveDisplayDate(effectiveDate);
      
      // التحقق من حضور الطالب في التاريخ الفعلي
      const targetDate = effectiveDate;
      const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', studentId)
        .eq('date', targetDate)
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
          .eq('date', targetDate)
          .maybeSingle();

        dailyWork = work;
        hasDataRecorded = !!work;

        // جلب تسميعات التمهيدي إن وجدت
        if (student.level === 'تمهيدي') {
          const { data: beginnerData } = await supabase
            .from('student_beginner_recitations')
            .select('*')
            .eq('student_id', studentId)
            .eq('date', targetDate)
            .order('created_at', { ascending: true });
          
          beginnerRecitations = beginnerData || [];
        }
      }

      // جلب نشاطات الحلقة للتاريخ المحدد
      const { data: circleActivities } = await supabase
        .from('circle_daily_activities')
        .select('*')
        .eq('circle_id', student.circle_id)
        .eq('date', targetDate);

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

      // جلب نتائج الاختبارات للتاريخ المحدد
      const { data: exams } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', studentId)
        .eq('exam_date', targetDate)
        .order('created_at', { ascending: false });

      // جلب المذاكرة الشهرية للشهر الحالي
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      // @ts-ignore
      const { data: monthlyReview } = await (supabase as any)
        .from('monthly_reviews')
        .select('*')
        .eq('student_id', studentId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

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

      // تحضير بيانات المذاكرة الشهرية
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthlyReviewData = monthlyReview ? {
        score: monthlyReview.score,
        notes: monthlyReview.notes,
        month: months[currentMonth - 1]
      } : null;

      setCurrentStudentId(studentId);
      setStudentData({
        name: student.name,
        photoUrl: student.photo_url,
        level: student.level || "تلاوة",
        date: targetDate,
        dayName: getDayName(new Date(targetDate)),
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
        exams: exams || [],
        monthlyReview: monthlyReviewData
      });

    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('فشل في تحميل بيانات الطالب');
    } finally {
      setLoading(false);
    }
  };

  if (loading || dateChanging) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? 'جاري تحميل بيانات الطالب...' : 'جاري تحديث البيانات...'}
          </p>
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
          
          {/* مؤشر التحميل عند تغيير التاريخ */}
          {dateChanging && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-primary font-semibold">جاري تحميل البيانات...</p>
              </div>
            </div>
          )}
          
          {/* اختيار التاريخ */}
          <div className="islamic-card p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-lg font-bold text-primary">
                المستوى: {studentData.level}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[200px]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-lg">{getCurrentDateInfo().dayName}</span>
                    {getCurrentDateInfo().isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        اليوم
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{getCurrentDateInfo().formattedDate}</span>
                  {effectiveDisplayDate && effectiveDisplayDate !== selectedDate && (
                    <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                      📅 عرض بيانات {new Date(effectiveDisplayDate).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-center text-lg text-red-700 font-bold">
                الطالب غائب في هذا اليوم - لا توجد أنشطة مسجلة
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
          
          {/* مؤشر التحميل عند تغيير التاريخ */}
          {dateChanging && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-primary font-semibold">جاري تحميل البيانات...</p>
              </div>
            </div>
          )}
          
          {/* التنقل بين التواريخ */}
          <div className="islamic-card p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-lg font-bold text-primary">
                المستوى: {studentData.level}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[200px]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-lg">{getCurrentDateInfo().dayName}</span>
                    {getCurrentDateInfo().isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        اليوم
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{getCurrentDateInfo().formattedDate}</span>
                  {effectiveDisplayDate && effectiveDisplayDate !== selectedDate && (
                    <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                      📅 عرض بيانات {new Date(effectiveDisplayDate).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-center text-lg text-yellow-700 font-semibold">
                لم يتم تسجيل بيانات الطالب في هذا اليوم
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

  const fetchAllExams = async () => {
    if (!currentStudentId) return;
    
    setLoadingExams(true);
    try {
      const { data, error } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', currentStudentId)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setAllExams(data || []);
    } catch (error) {
      console.error('Error fetching all exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  const getExamSection = (exam: any): string => {
    if (exam.tamhidi_stage) return exam.tamhidi_stage;
    if (exam.tilawah_section) return exam.tilawah_section;
    if (exam.hifd_section) return exam.hifd_section;
    if (exam.juz_number) return `الجزء ${exam.juz_number}`;
    return '-';
  };

  const handleOpenExamsDialog = () => {
    setExamsDialogOpen(true);
    fetchAllExams();
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
            <div className="flex items-center gap-2 relative z-10">
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

            <Sheet open={examsDialogOpen} onOpenChange={setExamsDialogOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleOpenExamsDialog}
                  className="relative flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-lg"
                >
                  <ClipboardList className="w-4 h-4 animate-pulse" />
                  اختباراتي
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping"></span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-right">جميع اختباراتي</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {loadingExams ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-4">جاري تحميل الاختبارات...</p>
                    </div>
                  ) : allExams.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">لا توجد اختبارات مسجلة</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto" dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">القسم/المرحلة</TableHead>
                            <TableHead className="text-right">المحاولة</TableHead>
                            <TableHead className="text-right">العلامة</TableHead>
                            <TableHead className="text-right">التقييم</TableHead>
                            <TableHead className="text-right">التجويد</TableHead>
                            <TableHead className="text-right">حفظ السور</TableHead>
                            <TableHead className="text-right">إضافي</TableHead>
                            <TableHead className="text-right">ملاحظات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allExams.map((exam) => (
                            <TableRow key={exam.id}>
                              <TableCell className="text-right">
                                {new Date(exam.exam_date).toLocaleDateString('ar-EG')}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {getExamSection(exam)}
                              </TableCell>
                              <TableCell className="text-right">{exam.attempt_number}</TableCell>
                              <TableCell className="text-right font-bold">
                                {exam.exam_score !== null ? exam.exam_score : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  exam.grade === 'ممتاز' ? 'bg-green-100 text-green-800' :
                                  exam.grade === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                                  exam.grade === 'جيد' ? 'bg-yellow-100 text-yellow-800' :
                                  exam.grade === 'مقبول' ? 'bg-orange-100 text-orange-800' :
                                  exam.grade === 'إعادة' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {exam.grade || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {exam.tajweed_score !== null ? `${exam.tajweed_score}/10` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {exam.surah_memory_score !== null ? `${exam.surah_memory_score}/10` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {studentData.level === 'تلاوة' && exam.tafsir_score !== null ? (
                                  <span className="text-xs">تفسير: {exam.tafsir_score}/10</span>
                                ) : studentData.level === 'حافظ' && exam.stability_score !== null ? (
                                  <span className="text-xs">ثبات: {exam.stability_score}/10</span>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-right max-w-xs truncate">
                                {exam.notes || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            </div>

            <div className="relative z-10 text-primary-foreground font-bold flex items-center gap-2 sm:gap-3 bg-primary-foreground/10 px-3 sm:px-6 py-2 rounded-full backdrop-blur-sm border border-primary-foreground/20">
              {studentData.photoUrl && (
                <img 
                  src={studentData.photoUrl} 
                  alt={studentData.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-foreground object-cover flex-shrink-0"
                />
              )}
              <span className="text-sm sm:text-lg md:text-xl truncate max-w-[120px] sm:max-w-none">
                {studentData.name}
              </span>
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
        
        {/* مؤشر التحميل عند تغيير التاريخ */}
        {dateChanging && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-primary font-semibold">جاري تحميل البيانات...</p>
            </div>
          </div>
        )}
        
        {/* التنقل بين التواريخ */}
        <div className="islamic-card p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-lg font-bold text-primary">
              المستوى: {studentData.level}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="text-center min-w-[200px]">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-lg">{getCurrentDateInfo().dayName}</span>
                  {getCurrentDateInfo().isToday && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      اليوم
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{getCurrentDateInfo().formattedDate}</span>
                {effectiveDisplayDate && effectiveDisplayDate !== selectedDate && (
                  <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    📅 عرض بيانات {new Date(effectiveDisplayDate).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
                    <span className="text-sm text-muted-foreground">({studentData.reviews.length} جزء)</span>
                  </div>
                  <div className="space-y-3">
                    {studentData.reviews.map((rec: any) => (
                      <div 
                        key={rec.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl hover:shadow-md transition-all duration-300 border border-primary/20"
                      >
                        <span className="text-lg font-semibold text-foreground">
                          جزء {rec.pageNumber}
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
          
          {/* الكاردات التي تحتوي على بيانات تظهر أولاً */}
          
          {/* 1. الاختبارات (إن وجدت) */}
          {studentData.exams && studentData.exams.length > 0 && (
            <ExamSection exams={studentData.exams} />
          )}
          
          {/* 2. الأحاديث (إن وجدت) */}
          {studentData.hadiths.length > 0 && (
            <HadithSection hadiths={studentData.hadiths} />
          )}
          
          {/* 3. المراجعة الشهرية (إن وجدت) */}
          {studentData.monthlyReview && (
            <MonthlyReviewSection 
              score={studentData.monthlyReview.score}
              notes={studentData.monthlyReview.notes}
              month={studentData.monthlyReview.month}
            />
          )}
          
          {/* 4. الملاحظات (إن وجدت) */}
          {studentData.notes.length > 0 && (
            <NotesSection notes={studentData.notes} />
          )}
          
          {/* الكاردات الثابتة (تظهر دائماً) */}
          
          {/* 5. السلوك */}
          <BehaviorSection behavior={studentData.behavior} />
          
          {/* 6. النقاط */}
          <PointsSection 
            enthusiasmPoints={studentData.enthusiasmPoints}
            generalPoints={0}
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
};

export default DynamicStudentReport;