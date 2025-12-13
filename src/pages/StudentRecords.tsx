import { useState, useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import TeacherNavbar from "@/components/TeacherNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentMonthlyRecord {
  student_id: string;
  studentName: string;
  totalPages: number;
  absenceCount: number;
  lastPage: string;
  examsCount: number;
  retakeCount: number;
  behaviorAverage: string;
  totalPoints: number;
}

const StudentRecords = () => {
  const [selectedView, setSelectedView] = useState<'weekly' | 'monthly' | 'quarterly' | 'monthWeeks'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [weeklyRecords, setWeeklyRecords] = useState<{weekNumber: number, weekLabel: string, records: StudentMonthlyRecord[]}[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{value: string, label: string}[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [records, setRecords] = useState<StudentMonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchAvailableMonthsAndYears();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedView, selectedMonth, selectedYear]);

  const fetchAvailableMonthsAndYears = async () => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) return;
      
      const teacher = JSON.parse(teacherData);

      // جلب الحلقات
      const { data: circles } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id);

      const circleIds = circles?.map(c => c.id) || [];
      if (circleIds.length === 0) return;

      // جلب الطلاب
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .in('circle_id', circleIds);

      const studentIds = students?.map(s => s.id) || [];
      if (studentIds.length === 0) return;

      // جلب التواريخ من الأعمال اليومية
      const { data: workDates } = await supabase
        .from('student_daily_work')
        .select('date')
        .in('student_id', studentIds);

      // جلب التواريخ من الحضور
      const { data: attendanceDates } = await supabase
        .from('student_attendance')
        .select('date')
        .in('student_id', studentIds);

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

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const teacher = JSON.parse(teacherData);
      const today = new Date();
      const startDate = new Date();
      
      if (selectedView === 'weekly') {
        startDate.setDate(today.getDate() - 7);
        await fetchWeeklyRecords(teacher.id, startDate);
      } else if (selectedView === 'monthWeeks') {
        // عرض أسابيع الشهر الحالي
        const monthNum = parseInt(selectedMonth);
        const yearNum = parseInt(selectedYear);
        await fetchMonthWeeksRecords(teacher.id, monthNum, yearNum);
      } else if (selectedView === 'monthly') {
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 1, 0);
        await fetchMonthlyRecords(teacher.id, startDate, endDate);
      } else {
        // فصلي - 4 أشهر
        const monthNum = parseInt(selectedMonth);
        startDate.setMonth(monthNum, 1);
        startDate.setDate(1);
        const endDate = new Date(startDate.getFullYear(), monthNum + 4, 0);
        await fetchMonthlyRecords(teacher.id, startDate, endDate);
      }
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

  const fetchMonthWeeksRecords = async (teacherId: string, month: number, year: number) => {
    // تقسيم الشهر إلى أسابيع
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks: {weekNumber: number, weekLabel: string, startDate: Date, endDate: Date}[] = [];
    let weekNumber = 1;
    let currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }
      
      const weekLabel = `الأسبوع ${weekNumber} (${weekStart.getDate()}/${month + 1} - ${weekEnd.getDate()}/${month + 1})`;
      
      weeks.push({
        weekNumber,
        weekLabel,
        startDate: weekStart,
        endDate: weekEnd
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    // جلب السجلات لكل أسبوع
    const allWeeklyRecords = [];
    
    for (const week of weeks) {
      const weekRecords = await fetchWeekRecords(teacherId, week.startDate, week.endDate);
      allWeeklyRecords.push({
        weekNumber: week.weekNumber,
        weekLabel: week.weekLabel,
        records: weekRecords
      });
    }
    
    setWeeklyRecords(allWeeklyRecords);
  };

  const fetchWeekRecords = async (teacherId: string, startDate: Date, endDate: Date) => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // جلب الحلقات الخاصة بالأستاذ
    const { data: circlesData } = await supabase
      .from('circles')
      .select('id')
      .eq('teacher_id', teacherId);
    
    const circleIds = circlesData?.map(c => c.id) || [];

    if (circleIds.length === 0) {
      return [];
    }

    // جلب جميع الطلاب في حلقات الأستاذ (استثناء المنقطعين)
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, name')
      .in('circle_id', circleIds)
      .order('name');

    const { data: discontinuedStudents } = await supabase
      .from('discontinued_students')
      .select('id');
    
    const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
    const activeStudents = allStudents?.filter(s => !discontinuedIds.has(s.id)) || [];

    // إنشاء Map لجميع الطلاب النشطين
    const studentMap = new Map<string, any>();
    activeStudents.forEach(student => {
      studentMap.set(student.id, {
        student_id: student.id,
        studentName: student.name,
        totalPages: 0,
        absenceCount: 0,
        lastPage: "لا يوجد",
        examsCount: 0,
        retakeCount: 0,
        behaviorAverage: "-",
        totalPoints: 0,
      });
    });

    // جلب بيانات الأعمال اليومية
    const { data: workData } = await supabase
      .from('student_daily_work')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentMap.keys()));

    // جلب بيانات تسميعات التمهيديين
    const { data: beginnerData } = await supabase
      .from('student_beginner_recitations')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentMap.keys()));

    // معالجة البيانات
    workData?.forEach(work => {
      const summary = studentMap.get(work.student_id);
      if (summary && work.new_recitation_grade !== 'إعادة') {
        summary.totalPages += work.new_recitation_pages || 0;
      }
    });

    // معالجة بيانات التمهيديين
    const studentUniquePages = new Map<string, Set<number>>();
    beginnerData?.forEach(rec => {
      if (rec.grade !== 'إعادة') {
        if (!studentUniquePages.has(rec.student_id)) {
          studentUniquePages.set(rec.student_id, new Set());
        }
        studentUniquePages.get(rec.student_id)?.add(rec.page_number);
      }
    });

    studentUniquePages.forEach((pages, studentId) => {
      const summary = studentMap.get(studentId);
      if (summary) {
        summary.totalPages += pages.size;
      }
    });

    return Array.from(studentMap.values());
  };

  const fetchWeeklyRecords = async (teacherId: string, startDate: Date) => {
    const dateFilter = startDate.toISOString().split('T')[0];

    // جلب الحلقات الخاصة بالأستاذ
    const { data: circlesData, error: circlesError } = await supabase
      .from('circles')
      .select('id')
      .eq('teacher_id', teacherId);

    if (circlesError) throw circlesError;
    
    const circleIds = circlesData?.map(c => c.id) || [];

    if (circleIds.length === 0) {
      setRecords([]);
      return;
    }

    // جلب جميع الطلاب في حلقات الأستاذ (استثناء المنقطعين)
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .in('circle_id', circleIds)
      .order('name');

    if (studentsError) throw studentsError;

    // جلب قائمة الطلاب المنقطعين لاستثنائهم
    const { data: discontinuedStudents } = await supabase
      .from('discontinued_students')
      .select('id');
    
    const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
    
    // تصفية الطلاب لاستثناء المنقطعين
    const activeStudents = allStudents?.filter(s => !discontinuedIds.has(s.id)) || [];

    // إنشاء Map لجميع الطلاب النشطين
    const studentMap = new Map<string, any>();
    activeStudents.forEach(student => {
      studentMap.set(student.id, {
        student_id: student.id,
        studentName: student.name,
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

    setRecords(Array.from(studentMap.values()));
  };

  const fetchMonthlyRecords = async (teacherId: string, startDate: Date, endDate: Date) => {
    // تحديث السنة والشهر في startDate و endDate
    startDate.setFullYear(parseInt(selectedYear));
    endDate.setFullYear(parseInt(selectedYear));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // جلب الحلقات
    const { data: circlesData, error: circlesError } = await supabase
      .from('circles')
      .select('id')
      .eq('teacher_id', teacherId);

    if (circlesError) throw circlesError;
    
    const circleIds = circlesData?.map(c => c.id) || [];

    if (circleIds.length === 0) {
      setRecords([]);
      return;
    }

    // جلب جميع الطلاب في الحلقات
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .in('circle_id', circleIds);

    if (studentsError) throw studentsError;

    const studentRecordsMap = new Map<string, StudentMonthlyRecord>();

    // تهيئة السجلات لكل طالب
    studentsData?.forEach(student => {
      studentRecordsMap.set(student.id, {
        student_id: student.id,
        studentName: student.name,
        totalPages: 0,
        absenceCount: 0,
        lastPage: '-',
        examsCount: 0,
        retakeCount: 0,
        behaviorAverage: '-',
        totalPoints: 0,
      });
    });

    // جلب الأعمال اليومية
    const { data: workData, error: workError } = await supabase
      .from('student_daily_work')
      .select('student_id, new_recitation_pages, new_recitation_grade, behavior_grade')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentRecordsMap.keys()));

    if (workError) throw workError;

    // جلب التسميع للطلاب التمهيديين
    const { data: beginnerData, error: beginnerError } = await supabase
      .from('student_beginner_recitations')
      .select('student_id, page_number, grade')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentRecordsMap.keys()));

    if (beginnerError) throw beginnerError;

    // جلب الحضور
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('student_attendance')
      .select('student_id, status')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentRecordsMap.keys()));

    if (attendanceError) throw attendanceError;

    // جلب الاختبارات
    const { data: examData, error: examError } = await supabase
      .from('student_exams')
      .select('student_id, grade')
      .gte('exam_date', startDateStr)
      .lte('exam_date', endDateStr)
      .in('student_id', Array.from(studentRecordsMap.keys()));

    if (examError) throw examError;

    // جلب النقاط
    const { data: pointsData, error: pointsError } = await supabase
      .from('student_points')
      .select('student_id, points')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .in('student_id', Array.from(studentRecordsMap.keys()));

    if (pointsError) throw pointsError;

    // معالجة البيانات (استثناء الإعادات من حساب الصفحات)
    workData?.forEach(work => {
      const record = studentRecordsMap.get(work.student_id);
      if (record) {
        // حساب الصفحات فقط إذا لم تكن إعادة
        if (work.new_recitation_grade !== 'إعادة') {
          record.totalPages += work.new_recitation_pages || 0;
        }
        
        // حساب عدد الإعادات
        if (work.new_recitation_grade === 'إعادة') {
          record.retakeCount++;
        }
      }
    });

    // معالجة الطلاب التمهيديين (حساب الصفحات الفريدة فقط، استثناء الإعادات)
    const studentLastPages = new Map<string, number>();
    const studentUniquePages = new Map<string, Set<number>>();
    
    beginnerData?.forEach(rec => {
      const record = studentRecordsMap.get(rec.student_id);
      if (record) {
        // تتبع آخر صفحة
        studentLastPages.set(rec.student_id, rec.page_number);
        
        // حساب الإعادات
        if (rec.grade === 'إعادة') {
          record.retakeCount++;
        } else {
          // حساب الصفحات الفريدة (فقط غير الإعادات)
          if (!studentUniquePages.has(rec.student_id)) {
            studentUniquePages.set(rec.student_id, new Set());
          }
          studentUniquePages.get(rec.student_id)!.add(rec.page_number);
        }
      }
    });

    // إضافة عدد الصفحات الفريدة لكل طالب تمهيدي
    studentUniquePages.forEach((pages, studentId) => {
      const record = studentRecordsMap.get(studentId);
      if (record) {
        record.totalPages += pages.size;
      }
    });

    // تحديث آخر صفحة للطلاب التمهيديين
    studentLastPages.forEach((page, studentId) => {
      const record = studentRecordsMap.get(studentId);
      if (record) {
        record.lastPage = `صفحة ${page}`;
      }
    });

    // معالجة الحضور
    attendanceData?.forEach(att => {
      const record = studentRecordsMap.get(att.student_id);
      if (record && att.status === 'غائب') {
        record.absenceCount++;
      }
    });

    // معالجة الاختبارات
    examData?.forEach(exam => {
      const record = studentRecordsMap.get(exam.student_id);
      if (record) {
        record.examsCount++;
      }
    });

    // معالجة النقاط
    pointsData?.forEach(point => {
      const record = studentRecordsMap.get(point.student_id);
      if (record) {
        record.totalPoints += point.points || 0;
      }
    });

    // حساب متوسط السلوك
    const behaviorScores = new Map<string, number[]>();
    workData?.forEach(work => {
      if (work.behavior_grade) {
        if (!behaviorScores.has(work.student_id)) {
          behaviorScores.set(work.student_id, []);
        }
        const behaviorValue = getBehaviorValue(work.behavior_grade);
        behaviorScores.get(work.student_id)!.push(behaviorValue);
      }
    });

    behaviorScores.forEach((scores, studentId) => {
      const record = studentRecordsMap.get(studentId);
      if (record && scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        record.behaviorAverage = getBehaviorLabel(avg);
      }
    });

    setRecords(Array.from(studentRecordsMap.values()));
  };

  const getBehaviorValue = (behavior: string): number => {
    switch (behavior) {
      case 'ممتاز': return 4;
      case 'جيد جداً': return 3;
      case 'جيد': return 2;
      case 'مقبول': return 1;
      default: return 0;
    }
  };

  const getBehaviorLabel = (value: number): string => {
    if (value >= 3.5) return 'ممتاز';
    if (value >= 2.5) return 'جيد جداً';
    if (value >= 1.5) return 'جيد';
    if (value >= 0.5) return 'مقبول';
    return '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
      <TeacherNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="islamic-card p-6 mb-8 fade-in-up">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">سجلات الطلاب</h1>
                <p className="text-muted-foreground">ملخص أعمال الطلاب والمحصلات</p>
              </div>
            </div>
            
            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'weekly' | 'monthly' | 'quarterly' | 'monthWeeks')}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                <TabsTrigger value="monthWeeks">أسابيع الشهر</TabsTrigger>
                <TabsTrigger value="monthly">شهري</TabsTrigger>
                <TabsTrigger value="quarterly">فصلي</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {(selectedView === 'monthly' || selectedView === 'quarterly' || selectedView === 'monthWeeks') && (
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <Calendar className="w-5 h-5 text-primary" />
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.length > 0 ? (
                    availableMonths.map(month => (
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
              
              {selectedView === 'quarterly' && (
                <p className="text-sm text-muted-foreground">
                  (الفصل يبدأ من {months[parseInt(selectedMonth)]?.label} ويستمر 4 أشهر)
                </p>
              )}
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
                لا توجد سجلات للفترة المحددة
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {selectedView === 'monthWeeks' ? (
                // عرض أسابيع الشهر
                <div className="space-y-8">
                  {weeklyRecords.map((week) => (
                    <div key={week.weekNumber} className="islamic-card p-6">
                      <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {week.weekLabel}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary/5">
                            <TableHead className="text-right font-bold">اسم الطالب</TableHead>
                            <TableHead className="text-center font-bold">الصفحات المسمعة</TableHead>
                            <TableHead className="text-center font-bold">الغيابات</TableHead>
                            <TableHead className="text-center font-bold">آخر صفحة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {week.records.length > 0 ? (
                            week.records.map((record) => (
                              <TableRow key={record.student_id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-semibold text-foreground">{record.studentName}</TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                                    {record.totalPages}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold ${
                                    record.absenceCount > 3 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {record.absenceCount}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-sm text-muted-foreground">{record.lastPage}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                لا توجد بيانات لهذا الأسبوع
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : selectedView === 'weekly' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الطالب</TableHead>
                      <TableHead className="text-center">صفحات التسميع</TableHead>
                      <TableHead className="text-center">صفحات المراجعة</TableHead>
                      <TableHead className="text-center">الأحاديث</TableHead>
                      <TableHead className="text-center">الاختبارات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: any) => (
                      <TableRow key={record.student_id}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell className="text-center">{record.totalRecitationPages}</TableCell>
                        <TableCell className="text-center">{record.totalReviewPages}</TableCell>
                        <TableCell className="text-center">{record.totalHadithCount}</TableCell>
                        <TableCell className="text-center">{record.totalExams}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="text-right font-bold">اسم الطالب</TableHead>
                      <TableHead className="text-center font-bold">الصفحات المسمعة</TableHead>
                      <TableHead className="text-center font-bold">الغيابات</TableHead>
                      <TableHead className="text-center font-bold">آخر صفحة</TableHead>
                      <TableHead className="text-center font-bold">الاختبارات</TableHead>
                      <TableHead className="text-center font-bold">الإعادات</TableHead>
                      <TableHead className="text-center font-bold">تقييم الأدب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.student_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-semibold text-foreground">{record.studentName}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                            {record.totalPages}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold ${
                            record.absenceCount > 3 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                          }`}>
                            {record.absenceCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{record.lastPage}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold">
                            {record.examsCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold ${
                            record.retakeCount > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'
                          }`}>
                            {record.retakeCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold ${
                            record.behaviorAverage === 'ممتاز' ? 'bg-green-500/10 text-green-600' :
                            record.behaviorAverage === 'جيد جداً' ? 'bg-blue-500/10 text-blue-600' :
                            record.behaviorAverage === 'جيد' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {record.behaviorAverage}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default StudentRecords;