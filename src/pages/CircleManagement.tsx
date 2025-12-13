import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Circle {
  id: string;
  name: string;
  teacher_id: string;
  group_name: string;
  studentsCount: number;
  teacherName?: string;
}

interface Teacher {
  id: string;
  name: string;
}

const CircleManagement = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCircle, setEditingCircle] = useState<Circle | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    group_name: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
    fetchTeachers();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from('circles')
        .select(`
          *,
          teachers (
            name
          ),
          students (
            id
          )
        `);

      if (error) throw error;

      const circlesWithCount = data?.map(circle => ({
        ...circle,
        teacherName: circle.teachers?.name || '',
        studentsCount: circle.students?.length || 0
      })) || [];

      setCircles(circlesWithCount);
    } catch (error) {
      console.error('Error fetching circles:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الحلقات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCircle) {
        // Update existing circle
        const { error } = await supabase
          .from('circles')
          .update({
            name: formData.name,
            teacher_id: formData.teacher_id,
            group_name: formData.group_name
          })
          .eq('id', editingCircle.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات الحلقة بنجاح",
        });
      } else {
        // Add new circle
        const { error } = await supabase
          .from('circles')
          .insert({
            name: formData.name,
            teacher_id: formData.teacher_id,
            group_name: formData.group_name
          });

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الحلقة بنجاح",
        });
      }

      await fetchCircles();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving circle:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الحلقة",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (circle: Circle) => {
    setEditingCircle(circle);
    setFormData({
      name: circle.name,
      teacher_id: circle.teacher_id,
      group_name: circle.group_name
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('circles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الحلقة بنجاح",
      });

      await fetchCircles();
    } catch (error) {
      console.error('Error deleting circle:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الحلقة",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      teacher_id: "",
      group_name: ""
    });
    setEditingCircle(null);
  };

  const totalStudents = circles.reduce((sum, circle) => sum + circle.studentsCount, 0);

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
                إضافة حلقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editingCircle ? "تعديل بيانات الحلقة" : "إضافة حلقة جديدة"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">اسم الحلقة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="أدخل اسم الحلقة"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teacher" className="text-right block">الأستاذ المسؤول</Label>
                  <Select value={formData.teacher_id} onValueChange={(value) => handleInputChange("teacher_id", value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر الأستاذ المسؤول" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group" className="text-right block">فوج الحلقة</Label>
                  <Input
                    id="group"
                    value={formData.group_name}
                    onChange={(e) => handleInputChange("group_name", e.target.value)}
                    placeholder="أدخل فوج الحلقة"
                    className="text-right"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingCircle ? "تحديث" : "إضافة"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <h2 className="text-3xl font-bold text-gray-900 text-right">
            إدارة الحلقات
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <BookOpen className="w-8 h-8 text-emerald-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{circles.length}</p>
                  <p className="text-sm text-gray-600">إجمالي الحلقات</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-gray-600">الطلاب المسجلين</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{teachers.length}</p>
                  <p className="text-sm text-gray-600">إجمالي المعلمين</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">قائمة الحلقات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الإجراءات</TableHead>
                  <TableHead className="text-right">عدد الطلاب</TableHead>
                  <TableHead className="text-right">الفوج</TableHead>
                  <TableHead className="text-right">اسم الأستاذ</TableHead>
                  <TableHead className="text-right">اسم الحلقة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      جاري تحميل الحلقات...
                    </TableCell>
                  </TableRow>
                ) : circles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد حلقات مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  circles.map((circle) => (
                    <TableRow key={circle.id}>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(circle)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(circle.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {circle.studentsCount}
                      </TableCell>
                      <TableCell className="text-right">{circle.group_name}</TableCell>
                      <TableCell className="text-right">{circle.teacherName}</TableCell>
                      <TableCell className="text-right font-medium">{circle.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CircleManagement;