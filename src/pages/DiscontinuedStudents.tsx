import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserX, RotateCcw, Download } from "lucide-react";
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

interface DiscontinuedStudent {
  id: string;
  student_number: number;
  name: string;
  age: number;
  level?: string;
  discontinued_date: string;
  discontinued_reason?: string;
  circleName?: string;
}

const DiscontinuedStudents = () => {
  const [students, setStudents] = useState<DiscontinuedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [studentToRestore, setStudentToRestore] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscontinuedStudents();
  }, []);

  const fetchDiscontinuedStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('discontinued_students')
        .select(`
          *,
          circles (
            name
          )
        `)
        .order('discontinued_date', { ascending: false });

      if (error) throw error;

      const studentsWithCircle = data?.map(student => ({
        ...student,
        circleName: student.circles?.name || 'غير محدد'
      })) || [];

      setStudents(studentsWithCircle);
    } catch (error) {
      console.error('Error fetching discontinued students:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة المنقطعين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (student: DiscontinuedStudent) => {
    setStudentToRestore({ id: student.id, name: student.name });
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!studentToRestore) return;

    try {
      const { data, error } = await supabase.rpc('restore_student_from_discontinued', {
        p_student_id: studentToRestore.id
      });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم استعادة الطالب ${studentToRestore.name} إلى قائمة الطلاب النشطين`,
      });

      await fetchDiscontinuedStudents();
    } catch (error: any) {
      console.error('Error restoring student:', error);
      toast({
        title: "خطأ",
        description: error?.message || "فشل في استعادة الطالب",
        variant: "destructive",
      });
    } finally {
      setRestoreDialogOpen(false);
      setStudentToRestore(null);
    }
  };

  const handleExport = () => {
    const exportData = students.map((student, index) => ({
      'الرقم': index + 1,
      'رقم الطالب': student.student_number,
      'اسم الطالب': student.name,
      'العمر': student.age,
      'المستوى': student.level || '-',
      'الحلقة السابقة': student.circleName,
      'تاريخ الانقطاع': new Date(student.discontinued_date).toLocaleDateString('ar-EG'),
      'سبب الانقطاع': student.discontinued_reason || '-',
    }));

    exportToExcel(exportData, `الطلاب_المنقطعين_${new Date().toLocaleDateString('ar-SA')}`, 'المنقطعين');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير قائمة المنقطعين إلى ملف Excel",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            {students.length > 0 && (
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                تصدير القائمة
              </Button>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-right">
            الطلاب المنقطعين
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <UserX className="w-6 h-6 text-orange-600" />
              قائمة الطلاب المنقطعين
            </CardTitle>
            <p className="text-sm text-muted-foreground text-right">
              جميع سجلات الطلاب محفوظة ويمكن استعادتهم في أي وقت
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الإجراءات</TableHead>
                  <TableHead className="text-right">سبب الانقطاع</TableHead>
                  <TableHead className="text-right">تاريخ الانقطاع</TableHead>
                  <TableHead className="text-right">الحلقة السابقة</TableHead>
                  <TableHead className="text-right">المستوى</TableHead>
                  <TableHead className="text-right">العمر</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">رقم الطالب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      جاري تحميل القائمة...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      لا يوجد طلاب منقطعين
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreClick(student)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          استعادة
                        </Button>
                      </TableCell>
                      <TableCell className="text-right max-w-xs truncate">
                        {student.discontinued_reason || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(student.discontinued_date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="text-right">{student.circleName}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.level === 'حافظ' ? 'bg-green-100 text-green-800' :
                          student.level === 'تلاوة' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.level || 'تلاوة'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{student.age}</TableCell>
                      <TableCell className="text-right font-medium">{student.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 font-mono">
                          #{student.student_number}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد استعادة الطالب</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من استعادة الطالب <span className="font-bold text-foreground">{studentToRestore?.name}</span> إلى قائمة الطلاب النشطين؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              نعم، استعادة الطالب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiscontinuedStudents;
