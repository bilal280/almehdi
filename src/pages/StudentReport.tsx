import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentHeader from "@/components/StudentHeader";
import StudentCard from "@/components/StudentCard";
import QuranSection from "@/components/QuranSection";
import HadithSection from "@/components/HadithSection";
import BehaviorSection from "@/components/BehaviorSection";
import NotesSection from "@/components/NotesSection";
import IslamicTime from "@/components/IslamicTime";
import PointsSection from "@/components/PointsSection";
import { RotateCcw, BookOpen, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StudentReport = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    } else {
      // استخدام البيانات التجريبية للصفحة الرئيسية
      setStudentData({
        name: "محمد أحمد الزهراني",
        date: new Date().toISOString().split('T')[0],
        dayName: getDayName(new Date()),
        instituteName: "معهد النور للقرآن الكريم",
        teacherName: "الأستاذ عبدالله السعيد",
        className: "حلقة الحفاظ المتقدمة",
        isPresent: true,
        newRecitations: [
          { id: 1, pageNumber: 157, grade: 95, gradeText: "ممتاز" },
          { id: 2, pageNumber: 158, grade: 88, gradeText: "جيد جداً" }
        ],
        reviews: [
          { id: 1, pageNumber: 145, grade: 92, gradeText: "ممتاز" },
          { id: 2, pageNumber: 146, grade: 87, gradeText: "جيد جداً" },
          { id: 3, pageNumber: 147, grade: 90, gradeText: "ممتاز" }
        ],
        hadiths: [
          { id: 1, title: "حديث الأعمال بالنيات", grade: 95, gradeText: "ممتاز" },
          { id: 2, title: "حديث بر الوالدين", grade: 85, gradeText: "جيد جداً" }
        ],
        behavior: "ممتاز" as const,
        enthusiasmPoints: 85,
        generalPoints: 145,
        notes: [
          "أحسن الطالب في التجويد اليوم وطبق الأحكام بشكل ممتاز",
          "يُنصح بمراجعة سورة البقرة من الآية 100 إلى 120",
          "الطالب متميز في الحفظ ومنضبط في الحضور"
        ]
      });
      setLoading(false);
    }
  }, [studentId]);

  const getDayName = (date: Date) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات الطالب
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          circles (
            name,
            teachers (
              name
            )
          )
        `)
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // التحقق من حضور الطالب اليوم
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', studentId)
        .eq('date', today)
        .single();

      const isPresent = attendance?.status === 'present';

      // إذا كان حاضر، جلب أعماله اليوم
      let dailyWork = null;
      if (isPresent) {
        const { data: work } = await supabase
          .from('student_daily_work')
          .select('*')
          .eq('student_id', studentId)
          .eq('date', today)
          .single();

        dailyWork = work;
      }

      // جلب النقاط
      const { data: points } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', today);

      const enthusiasmPoints = points?.find(p => p.point_type === 'enthusiasm')?.points || 0;
      const generalPoints = points?.filter(p => p.point_type === 'general').reduce((sum, p) => sum + p.points, 0) || 0;

      setStudentData({
        name: student.name,
        date: today,
        dayName: getDayName(new Date()),
        instituteName: "معهد النور للقرآن الكريم",
        teacherName: student.circles?.teachers?.name || "غير محدد",
        className: student.circles?.name || "غير محدد",
        isPresent,
        newRecitations: dailyWork ? [
          { id: 1, pageNumber: dailyWork.new_recitation_pages, grade: dailyWork.new_recitation_grade, gradeText: dailyWork.new_recitation_grade }
        ] : [],
        reviews: dailyWork ? [
          { id: 1, pageNumber: dailyWork.review_pages, grade: dailyWork.review_grade, gradeText: dailyWork.review_grade }
        ] : [],
        hadiths: dailyWork && dailyWork.hadith_count > 0 ? [
          { id: 1, title: `${dailyWork.hadith_count} أحاديث`, grade: dailyWork.hadith_grade, gradeText: dailyWork.hadith_grade }
        ] : [],
        behavior: dailyWork?.behavior_grade || "غير محدد",
        enthusiasmPoints,
        generalPoints,
        notes: dailyWork?.teacher_notes ? [dailyWork.teacher_notes] : []
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!studentData.isPresent && studentId) {
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
            date={studentData.date}
            dayName={studentData.dayName}
          />
          
          <div className="mt-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-center text-lg">
                الطالب غائب اليوم - لا توجد أنشطة مسجلة
              </AlertDescription>
            </Alert>
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
          date={studentData.date}
          dayName={studentData.dayName}
        />
        
        <div className="grid gap-6">
          <QuranSection 
            title="التسميع الجديد"
            recitations={studentData.newRecitations}
            icon={<BookOpen className="w-6 h-6 text-primary" />}
          />
          
          <QuranSection 
            title="المراجعة والتعاهد"
            recitations={studentData.reviews}
            icon={<RotateCcw className="w-6 h-6 text-primary" />}
          />
          
          <HadithSection hadiths={studentData.hadiths} />
          
          <PointsSection 
            enthusiasmPoints={studentData.enthusiasmPoints}
            generalPoints={studentData.generalPoints}
          />
          
          <BehaviorSection behavior={studentData.behavior} />
          
          <NotesSection notes={studentData.notes} />
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

export default StudentReport;