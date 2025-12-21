import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, User, Upload, Download } from "lucide-react";
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

interface Student {
  id: string;
  student_number?: number;
  name: string;
  age: number;
  photo_url?: string;
  circle_id: string;
  notes?: string;
  circleName?: string;
  father_name?: string;
  mother_name?: string;
  residence_area?: string;
  contact_number?: string;
  contact_number_2?: string;
  level?: string;
}

interface Circle {
  id: string;
  name: string;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    photo_url: "",
    circle_id: "",
    notes: "",
    father_name: "",
    mother_name: "",
    residence_area: "",
    contact_number: "",
    contact_number_2: "",
    level: "تلاوة"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchCircles();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          circles (
            name
          )
        `);

      if (error) throw error;

      const studentsWithCircle = data?.map(student => ({
        ...student,
        circleName: student.circles?.name || ''
      })) || [];

      setStudents(studentsWithCircle);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.age) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.circle_id) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار حلقة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            age: parseInt(formData.age),
            photo_url: formData.photo_url || null,
            circle_id: formData.circle_id,
            notes: formData.notes || null,
            father_name: formData.father_name || null,
            mother_name: formData.mother_name || null,
            residence_area: formData.residence_area || null,
            contact_number: formData.contact_number || null,
            contact_number_2: formData.contact_number_2 || null,
            level: formData.level || 'تلاوة'
          })
          .eq('id', editingStudent.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات الطالب بنجاح",
        });
      } else {
        // Add new student
        const { error } = await supabase
          .from('students')
          .insert({
            name: formData.name,
            age: parseInt(formData.age),
            photo_url: formData.photo_url || null,
            circle_id: formData.circle_id,
            notes: formData.notes || null,
            father_name: formData.father_name || null,
            mother_name: formData.mother_name || null,
            residence_area: formData.residence_area || null,
            contact_number: formData.contact_number || null,
            contact_number_2: formData.contact_number_2 || null,
            level: formData.level || 'تلاوة'
          });

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الطالب بنجاح",
        });
      }

      await fetchStudents();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast({
        title: "خطأ",
        description: error?.message || "فشل في حفظ بيانات الطالب",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      age: student.age.toString(),
      photo_url: student.photo_url || "",
      circle_id: student.circle_id,
      notes: student.notes || "",
      father_name: student.father_name || "",
      mother_name: student.mother_name || "",
      residence_area: student.residence_area || "",
      contact_number: student.contact_number || "",
      contact_number_2: student.contact_number_2 || "",
      level: student.level || "تلاوة"
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete({ id: student.id, name: student.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      // استدعاء دالة نقل الطالب إلى المنقطعين
      const { data, error } = await supabase.rpc('move_student_to_discontinued', {
        p_student_id: studentToDelete.id,
        p_reason: discontinueReason || null
      });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم نقل الطالب ${studentToDelete.name} إلى قائمة المنقطعين. جميع سجلاته محفوظة.`,
      });

      await fetchStudents();
    } catch (error: any) {
      console.error('Error moving student to discontinued:', error);
      toast({
        title: "خطأ",
        description: error?.message || "فشل في نقل الطالب إلى المنقطعين",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      setDiscontinueReason("");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      photo_url: "",
      circle_id: "",
      notes: "",
      father_name: "",
      mother_name: "",
      residence_area: "",
      contact_number: "",
      contact_number_2: "",
      level: "تلاوة"
    });
    setEditingStudent(null);
  };

  const handleExportAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          circles ( name )
        `)
        .order('name');

      if (error) throw error;

      const exportData = (data || []).map((s: any, index: number) => ({
        'الرقم': index + 1,
        'رقم الطالب': s.student_number || '-',
        'اسم الطالب': s.name || '-',
        'العمر': typeof s.age === 'number' ? s.age : '-',
        'الحلقة': s.circles?.name || '-',
        'المستوى': s.level || '-',
        'اسم الأب': s.father_name || '-',
        'اسم الأم': s.mother_name || '-',
        'منطقة السكن': s.residence_area || '-',
        'رقم التواصل 1': s.contact_number || '-',
        'رقم التواصل 2': s.contact_number_2 || '-',
        'رابط الصورة': s.photo_url || '-',
        'ملاحظات': s.notes || '-',
      }));

      exportToExcel(exportData, `بيانات_الطلاب_كاملة_${new Date().toLocaleDateString('ar-SA')}`, 'الطلاب');
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تصدير جميع معلومات الطلاب إلى ملف Excel',
      });
    } catch (err) {
      console.error('Export students failed:', err);
      toast({
        title: 'خطأ',
        description: 'فشل تصدير بيانات الطلاب',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                إضافة طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editingStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right block">اسم الطالب</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="أدخل اسم الطالب"
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-right block">العمر</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="أدخل عمر الطالب"
                      className="text-right"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="circle" className="text-right block">الحلقة *</Label>
                    <Select value={formData.circle_id} onValueChange={(value) => handleInputChange("circle_id", value)} required>
                      <SelectTrigger className="text-right bg-background">
                        <SelectValue placeholder="اختر الحلقة" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {circles.map((circle) => (
                          <SelectItem key={circle.id} value={circle.id}>
                            {circle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-right block">مستوى الطالب *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)} required>
                      <SelectTrigger className="text-right bg-background">
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="حافظ">حافظ</SelectItem>
                        <SelectItem value="تلاوة">تلاوة</SelectItem>
                        <SelectItem value="تمهيدي">تمهيدي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-right block">رابط الصورة</Label>
                  <div className="flex space-x-2 space-x-reverse">
                    <Input
                      id="photo"
                      value={formData.photo_url}
                      onChange={(e) => handleInputChange("photo_url", e.target.value)}
                      placeholder="أدخل رابط صورة الطالب"
                      className="text-right flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="father_name" className="text-right block">اسم الأب</Label>
                    <Input
                      id="father_name"
                      value={formData.father_name}
                      onChange={(e) => handleInputChange("father_name", e.target.value)}
                      placeholder="أدخل اسم الأب"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name" className="text-right block">اسم الأم</Label>
                    <Input
                      id="mother_name"
                      value={formData.mother_name}
                      onChange={(e) => handleInputChange("mother_name", e.target.value)}
                      placeholder="أدخل اسم الأم"
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residence_area" className="text-right block">منطقة السكن</Label>
                  <Input
                    id="residence_area"
                    value={formData.residence_area}
                    onChange={(e) => handleInputChange("residence_area", e.target.value)}
                    placeholder="أدخل منطقة السكن"
                    className="text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-right block">رقم التواصل 1</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => handleInputChange("contact_number", e.target.value)}
                      placeholder="أدخل رقم التواصل الأول"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number_2" className="text-right block">رقم التواصل 2</Label>
                    <Input
                      id="contact_number_2"
                      value={formData.contact_number_2}
                      onChange={(e) => handleInputChange("contact_number_2", e.target.value)}
                      placeholder="أدخل رقم التواصل الثاني"
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-right block">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="أدخل ملاحظات حول الطالب"
                    className="text-right"
                    rows={3}
                  />
                </div>

                <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 pt-4 flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingStudent ? "تحديث" : "إضافة"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <h2 className="text-3xl font-bold text-gray-900 text-right">
            إدارة الطلاب
          </h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-right">قائمة الطلاب المسجلين</CardTitle>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="ابحث عن طالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="w-64">
                  <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="فلترة حسب الحلقة" />
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
                </div>
                <Button onClick={handleExportAllStudents} className="gap-2">
                  <Download className="w-4 h-4" />
                  تصدير كل البيانات
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                  <TableHead className="text-right font-bold">ملاحظات</TableHead>
                  <TableHead className="text-right font-bold">المستوى</TableHead>
                  <TableHead className="text-right font-bold">الحلقة</TableHead>
                  <TableHead className="text-right font-bold">العمر</TableHead>
                  <TableHead className="text-right font-bold">الاسم</TableHead>
                  <TableHead className="text-center font-bold">الرقم التسلسلي</TableHead>
                  <TableHead className="text-right font-bold">الصورة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      جاري تحميل الطلاب...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      لا يوجد طلاب مسجلين
                    </TableCell>
                  </TableRow>
                ) : (
                  students
                    .filter(student => {
                      const matchesCircle = selectedCircle === "all" || student.circle_id === selectedCircle;
                      const matchesSearch = searchQuery === "" || 
                        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.father_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.mother_name?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesCircle && matchesSearch;
                    })
                    .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(student)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{student.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.level === 'حافظ' ? 'bg-green-100 text-green-800' :
                          student.level === 'تلاوة' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.level || 'تلاوة'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{student.circleName}</TableCell>
                      <TableCell className="text-right">{student.age}</TableCell>
                      <TableCell className="text-right font-medium">
                        <a 
                          href={`/student/${student.student_number}`}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {student.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                          {student.student_number || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {student.photo_url ? (
                          <img 
                            src={student.photo_url} 
                            alt={student.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                            onError={(e) => {
                              // في حالة فشل تحميل الصورة، نعرض الأيقونة الافتراضية
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ${student.photo_url ? 'hidden' : ''}`}>
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد نقل الطالب إلى المنقطعين</AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-4">
              <p>
                هل أنت متأكد من نقل الطالب <span className="font-bold text-foreground">{studentToDelete?.name}</span> إلى قائمة المنقطعين؟
              </p>
              <p className="text-sm text-muted-foreground">
                ملاحظة: لن يتم حذف أي بيانات. سيتم نقل الطالب إلى قائمة المنقطعين مع الحفاظ على جميع سجلاته (الحضور، الأعمال، الاختبارات، النقاط).
              </p>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-right block">سبب الانقطاع (اختياري)</Label>
                <Textarea
                  id="reason"
                  value={discontinueReason}
                  onChange={(e) => setDiscontinueReason(e.target.value)}
                  placeholder="مثال: انتقل إلى مدينة أخرى، ظروف عائلية، إلخ..."
                  className="text-right"
                  rows={3}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setStudentToDelete(null);
              setDiscontinueReason("");
            }}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              نعم، نقل إلى المنقطعين
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentManagement;
