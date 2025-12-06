import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  exam_date: string;
  juz_number: number | null;
  attempt_number: number;
  exam_score: number | null;
  tajweed_score: number | null;
  tafsir_score: number | null;
  surah_memory_score: number | null;
  stability_score: number | null;
  grade: string | null;
  notes: string | null;
  tamhidi_stage: string | null;
  tilawah_section: string | null;
  hifd_section: string | null;
  student_name?: string;
  student_level?: string;
  circle_name?: string;
  circle_id?: string;
}

const TeacherExamRecords = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) {
        navigate('/login');
        return;
      }
      
      const teacher = JSON.parse(teacherData);

      // جلب الحلقات التابعة للمعلم
      const { data: circles, error: circlesError } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id);

      if (circlesError) throw circlesError;

      if (!circles || circles.length === 0) {
        setExams([]);
        setFilteredExams([]);
        setLoading(false);
        return;
      }

      const circleIds = circles.map(c => c.id);

      // جلب الاختبارات للطلاب في حلقات المعلم
      const { data, error } = await supabase
        .from('student_exams')
        .select(`
          *,
          students (
            name,
            level,
            circle_id,
            circles (
              name
            )
          )
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;

      // تصفية الاختبارات للطلاب في حلقات المعلم فقط
      const examsWithDetails = data?.filter(exam => 
        circleIds.includes(exam.students?.circle_id)
      ).map(exam => ({
        ...exam,
        student_name: exam.students?.name || "غير محدد",
        student_level: exam.students?.level || "غير محدد",
        circle_name: exam.students?.circles?.name || "غير محدد",
        circle_id: exam.students?.circle_id
      })) || [];

      setExams(examsWithDetails);
      setFilteredExams(examsWithDetails);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجلات الاختبارات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    if (!searchTerm) {
      setFilteredExams(exams);
      return;
    }

    const filtered = exams.filter(exam =>
      exam.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getExamSection(exam).includes(searchTerm)
    );

    setFilteredExams(filtered);
  };

  const getExamSection = (exam: Exam): string => {
    if (exam.tamhidi_stage) return exam.tamhidi_stage;
    if (exam.tilawah_section) return exam.tilawah_section;
    if (exam.hifd_section) return exam.hifd_section;
    if (exam.juz_number) return `الجزء ${exam.juz_number}`;
    return '-';
  };

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <TeacherNavbar />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="islamic-card p-6 mb-8 text-center fade-in-up">
            <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-2">سجلات اختبارات الطلاب</h2>
            <p className="text-muted-foreground">عرض جميع اختبارات طلابك مع التفاصيل الكاملة</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-right">جميع الاختبارات</CardTitle>
                <div className="w-64">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث باسم الطالب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">المستوى</TableHead>
                      <TableHead className="text-right">الحلقة</TableHead>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          جاري تحميل السجلات...
                        </TableCell>
                      </TableRow>
                    ) : filteredExams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          لا توجد سجلات اختبارات
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="text-right">
                            {new Date(exam.exam_date).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {exam.student_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {exam.student_level}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{exam.circle_name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {getExamSection(exam)}
                          </TableCell>
                          <TableCell className="text-right">{exam.attempt_number}</TableCell>
                          <TableCell className="text-right">
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
                            {exam.student_level === 'تلاوة' && exam.tafsir_score !== null ? (
                              <span className="text-xs">تفسير: {exam.tafsir_score}/10</span>
                            ) : exam.student_level === 'حافظ' && exam.stability_score !== null ? (
                              <span className="text-xs">ثبات: {exam.stability_score}/10</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right max-w-xs truncate">
                            {exam.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default TeacherExamRecords;
