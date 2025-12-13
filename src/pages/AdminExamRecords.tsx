import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/exportToExcel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface Circle {
  id: string;
  name: string;
}

const AdminExamRecords = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
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
            level,
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
        student_level: exam.students?.level || "غير محدد",
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

  const handleDeleteClick = (examId: string) => {
    setExamToDelete(examId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;

    try {
      const { error } = await supabase
        .from('student_exams')
        .delete()
        .eq('id', examToDelete);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف سجل الاختبار",
      });

      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف سجل الاختبار",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    }
  };

  const getExamSection = (exam: Exam): string => {
    if (exam.tamhidi_stage) return exam.tamhidi_stage;
    if (exam.tilawah_section) return exam.tilawah_section;
    if (exam.hifd_section) return exam.hifd_section;
    if (exam.juz_number) return `الجزء ${exam.juz_number}`;
    return '-';
  };

  const filteredExams = selectedCircle === "all" 
    ? exams 
    : exams.filter(exam => exam.circle_id === selectedCircle);

  const handleExportExams = () => {
    const exportData = filteredExams.map((exam, index) => {
      const baseData: any = {
        'الرقم': index + 1,
        'التاريخ': new Date(exam.exam_date).toLocaleDateString('ar-EG'),
        'اسم الطالب': exam.student_name,
        'المستوى': exam.student_level,
        'الحلقة': exam.circle_name,
        'القسم/المرحلة': getExamSection(exam),
        'المحاولة': exam.attempt_number,
        'العلامة': exam.exam_score !== null ? exam.exam_score : '-',
        'التقييم': exam.grade || '-',
        'التجويد النظري': exam.tajweed_score !== null ? exam.tajweed_score : '-',
        'حفظ السور': exam.surah_memory_score !== null ? exam.surah_memory_score : '-',
      };

      if (exam.student_level === 'تلاوة') {
        baseData['التفسير'] = exam.tafsir_score !== null ? exam.tafsir_score : '-';
      }

      if (exam.student_level === 'حافظ') {
        baseData['الثبات'] = exam.stability_score !== null ? exam.stability_score : '-';
      }

      baseData['ملاحظات'] = exam.notes || '-';

      return baseData;
    });

    const circleName = selectedCircle === "all" ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    exportToExcel(exportData, `سجلات_الاختبارات_${circleName}_${new Date().toLocaleDateString('ar-SA')}`, 'الاختبارات');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير سجلات الاختبارات إلى ملف Excel",
    });
  };

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
              <div className="flex gap-4 items-center">
                {!loading && filteredExams.length > 0 && (
                  <Button onClick={handleExportExams} className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير إلى Excel
                  </Button>
                )}
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
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        جاري تحميل السجلات...
                      </TableCell>
                    </TableRow>
                  ) : filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(exam.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف سجل الاختبار هذا؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExamRecords;
