import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Edit, X, Save } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Exam>>({});
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

  const handleEditClick = (exam: Exam) => {
    setExamToEdit(exam);
    setEditFormData({
      exam_date: exam.exam_date,
      juz_number: exam.juz_number,
      attempt_number: exam.attempt_number,
      exam_score: exam.exam_score,
      tajweed_score: exam.tajweed_score,
      tafsir_score: exam.tafsir_score,
      surah_memory_score: exam.surah_memory_score,
      stability_score: exam.stability_score,
      grade: exam.grade,
      notes: exam.notes,
      tamhidi_stage: exam.tamhidi_stage,
      tilawah_section: exam.tilawah_section,
      hifd_section: exam.hifd_section,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!examToEdit) return;

    try {
      const { error } = await supabase
        .from('student_exams')
        .update(editFormData)
        .eq('id', examToEdit.id);

      if (error) throw error;

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الاختبار",
      });

      setEditDialogOpen(false);
      setExamToEdit(null);
      setEditFormData({});
      fetchExams();
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات الاختبار",
        variant: "destructive",
      });
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
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(exam)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(exam.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل بيانات الاختبار</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل بيانات الاختبار للطالب: {examToEdit?.student_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exam_date" className="text-right">تاريخ الاختبار</Label>
              <Input
                id="exam_date"
                type="date"
                value={editFormData.exam_date || ''}
                onChange={(e) => setEditFormData({...editFormData, exam_date: e.target.value})}
                className="text-right"
              />
            </div>

            {examToEdit?.student_level === 'حافظ' && (
              <div className="grid gap-2">
                <Label htmlFor="juz_number" className="text-right">رقم الجزء</Label>
                <Input
                  id="juz_number"
                  type="number"
                  min="1"
                  max="30"
                  value={editFormData.juz_number || ''}
                  onChange={(e) => setEditFormData({...editFormData, juz_number: parseInt(e.target.value) || null})}
                  className="text-right"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="attempt_number" className="text-right">رقم المحاولة</Label>
              <Input
                id="attempt_number"
                type="number"
                min="1"
                value={editFormData.attempt_number || 1}
                onChange={(e) => setEditFormData({...editFormData, attempt_number: parseInt(e.target.value) || 1})}
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exam_score" className="text-right">العلامة الكلية</Label>
              <Input
                id="exam_score"
                type="number"
                min="0"
                max="100"
                value={editFormData.exam_score || ''}
                onChange={(e) => setEditFormData({...editFormData, exam_score: parseFloat(e.target.value) || null})}
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="grade" className="text-right">التقييم</Label>
              <Select 
                value={editFormData.grade || ''} 
                onValueChange={(value) => setEditFormData({...editFormData, grade: value})}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ممتاز">ممتاز</SelectItem>
                  <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                  <SelectItem value="جيد">جيد</SelectItem>
                  <SelectItem value="مقبول">مقبول</SelectItem>
                  <SelectItem value="إعادة">إعادة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tajweed_score" className="text-right">التجويد النظري (من 10)</Label>
              <Input
                id="tajweed_score"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={editFormData.tajweed_score || ''}
                onChange={(e) => setEditFormData({...editFormData, tajweed_score: parseFloat(e.target.value) || null})}
                className="text-right"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="surah_memory_score" className="text-right">حفظ السور (من 10)</Label>
              <Input
                id="surah_memory_score"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={editFormData.surah_memory_score || ''}
                onChange={(e) => setEditFormData({...editFormData, surah_memory_score: parseFloat(e.target.value) || null})}
                className="text-right"
              />
            </div>

            {examToEdit?.student_level === 'تلاوة' && (
              <div className="grid gap-2">
                <Label htmlFor="tafsir_score" className="text-right">التفسير (من 10)</Label>
                <Input
                  id="tafsir_score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={editFormData.tafsir_score || ''}
                  onChange={(e) => setEditFormData({...editFormData, tafsir_score: parseFloat(e.target.value) || null})}
                  className="text-right"
                />
              </div>
            )}

            {examToEdit?.student_level === 'حافظ' && (
              <div className="grid gap-2">
                <Label htmlFor="stability_score" className="text-right">الثبات (من 10)</Label>
                <Input
                  id="stability_score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={editFormData.stability_score || ''}
                  onChange={(e) => setEditFormData({...editFormData, stability_score: parseFloat(e.target.value) || null})}
                  className="text-right"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-right">ملاحظات</Label>
              <Textarea
                id="notes"
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                className="text-right min-h-[100px]"
                placeholder="أضف ملاحظات إضافية..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button onClick={handleEditSave} className="bg-primary">
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
