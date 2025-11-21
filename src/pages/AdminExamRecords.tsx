import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  exam_date: string;
  juz_number: number;
  attempt_number: number;
  exam_score: number | null;
  tajweed_score: number | null;
  tafsir_score: number | null;
  grade: string | null;
  notes: string | null;
  student_name?: string;
  circle_name?: string;
  circle_id?: string;
}

interface Circle {
  id: string;
  name: string;
}

const AdminExamRecords = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
    fetchExams();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from('circles')
        .select('id, name');

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_exams')
        .select(`
          *,
          students (
            name,
            circle_id,
            circles (
              name
            )
          )
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;

      const examsWithDetails = data?.map(exam => ({
        ...exam,
        student_name: exam.students?.name || "غير محدد",
        circle_name: exam.students?.circles?.name || "غير محدد",
        circle_id: exam.students?.circle_id
      })) || [];

      setExams(examsWithDetails);
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

  const filteredExams = selectedCircle === "all" 
    ? exams 
    : exams.filter(exam => exam.circle_id === selectedCircle);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 text-right mb-8">
          سجلات الاختبارات
        </h2>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right">جميع الاختبارات</CardTitle>
              <div className="w-64">
                <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                  <SelectTrigger className="text-right bg-background">
                    <SelectValue placeholder="فلترة حسب الحلقة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">جميع الحلقات</SelectItem>
                    {circles.map((circle) => (
                      <SelectItem key={circle.id} value={circle.id}>
                        {circle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">الجزء</TableHead>
                    <TableHead className="text-right">المحاولة</TableHead>
                    <TableHead className="text-right">درجة الحفظ</TableHead>
                    <TableHead className="text-right">درجة التجويد</TableHead>
                    <TableHead className="text-right">درجة التفسير</TableHead>
                    <TableHead className="text-right">التقدير</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        جاري تحميل السجلات...
                      </TableCell>
                    </TableRow>
                  ) : filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
                        <TableCell className="text-right">{exam.circle_name}</TableCell>
                        <TableCell className="text-right">{exam.juz_number}</TableCell>
                        <TableCell className="text-right">{exam.attempt_number}</TableCell>
                        <TableCell className="text-right">
                          {exam.exam_score !== null ? exam.exam_score : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {exam.tajweed_score !== null ? exam.tajweed_score : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {exam.tafsir_score !== null ? exam.tafsir_score : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exam.grade === 'ممتاز' ? 'bg-green-100 text-green-800' :
                            exam.grade === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                            exam.grade === 'جيد' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {exam.grade || '-'}
                          </span>
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
      </div>
    </div>
  );
};

export default AdminExamRecords;
