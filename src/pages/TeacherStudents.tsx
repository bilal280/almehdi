import { useState, useEffect } from "react";
import { BookOpen, UserCheck, UserX, Users, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import AddStudentWork from "@/components/AddStudentWork";
import EditTodayWork from "@/components/EditTodayWork";
import AttendanceEditor from "@/components/AttendanceEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  age: number;
  photo_url?: string;
  circle_id: string;
  level?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: 'present' | 'absent';
  date: string;
  student: Student;
}

const TeacherStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, []);

  const fetchStudentsAndAttendance = async () => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) return;
      
      const teacher = JSON.parse(teacherData);

      // جلب الحلقات التابعة للمعلم
      const { data: circles, error: circlesError } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id);

      if (circlesError) throw circlesError;

      const circleIds = circles?.map(c => c.id) || [];

      // جلب طلاب الحلقات التابعة للمعلم فقط
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          age,
          photo_url,
          circle_id,
          level,
          circles (
            name
          )
        `)
        .in('circle_id', circleIds);

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // جلب بيانات الحضور لليوم الحالي
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('student_attendance')
        .select(`
          id,
          student_id,
          status,
          date,
          students (
            id,
            name,
            age,
            photo_url,
            circle_id,
            level
          )
        `)
        .eq('date', today)
        .in('student_id', studentsData?.map(s => s.id) || []);

      if (attendanceError) throw attendanceError;
      
      const formattedAttendance = attendanceData?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        status: record.status as 'present' | 'absent',
        date: record.date,
        student: record.students as Student
      })) || [];
      
      setAttendance(formattedAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (student: Student, status: 'present' | 'absent') => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        return;
      }
      
      const teacher = JSON.parse(teacherData);
      const today = new Date().toISOString().split('T')[0];
      const existingRecord = attendance.find(record => record.student_id === student.id);

      if (existingRecord) {
        // تحديث السجل الموجود
        const { error } = await supabase
          .from('student_attendance')
          .update({ status })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // إنشاء سجل جديد
        const { error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: student.id,
            status,
            teacher_id: teacher.id,
            date: today,
          });

        if (error) throw error;
      }

      // تحديث البيانات
      await fetchStudentsAndAttendance();
      
      toast({
        title: "تم بنجاح",
        description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'} ${student.name}`,
      });

      if (status === 'present') {
        setSelectedStudent(student);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحضور",
        variant: "destructive",
      });
    }
  };

  const presentStudents = attendance.filter(record => record.status === 'present');
  const absentStudents = attendance.filter(record => record.status === 'absent');
  const unmarkedStudents = students.filter(student => 
    !attendance.some(record => record.student_id === student.id)
  );

  if (loading) {
    return (
      <ProtectedTeacherRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
          <TeacherNavbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري تحميل بيانات الطلاب...</p>
            </div>
          </div>
        </div>
      </ProtectedTeacherRoute>
    );
  }

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <TeacherNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="islamic-card p-6 mb-8 text-center fade-in-up">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-primary mb-2">إدارة طلاب الحلقة</h2>
          <p className="text-muted-foreground">تسجيل الحضور والغياب وإدارة أعمال الطلاب اليومية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="islamic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card className="islamic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحاضرون اليوم</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentStudents.length}</div>
            </CardContent>
          </Card>
          <Card className="islamic-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الغائبون اليوم</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentStudents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Students Sections */}
        <div className="space-y-8">
          {/* غير المسجلين */}
          {unmarkedStudents.length > 0 && (
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-primary" />
                  الطلاب غير المسجلين ({unmarkedStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unmarkedStudents.map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {student.name.split(' ')[0].charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{student.name}</h4>
                            <p className="text-xs text-muted-foreground">{student.age} سنة</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAttendanceChange(student, "present")}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          حضور
                        </Button>
                        <Button
                          onClick={() => handleAttendanceChange(student, "absent")}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          غياب
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* الطلاب الحاضرون */}
          {presentStudents.length > 0 && (
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-green-600" />
                  الطلاب الحاضرون ({presentStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presentStudents.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-700">
                              {record.student.name.split(' ')[0].charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{record.student.name}</h4>
                            <p className="text-xs text-muted-foreground">{record.student.age} سنة</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">حاضر</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedStudent(record.student);
                            setIsDialogOpen(true);
                          }}
                          size="sm"
                          className="flex-1"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          تسجيل الأعمال
                        </Button>
                        <Button
                          onClick={() => handleAttendanceChange(record.student, "absent")}
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* الطلاب الغائبون */}
          {absentStudents.length > 0 && (
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-3">
                  <UserX className="w-6 h-6 text-red-600" />
                  الطلاب الغائبون ({absentStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {absentStudents.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-red-700">
                              {record.student.name.split(' ')[0].charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{record.student.name}</h4>
                            <p className="text-xs text-muted-foreground">{record.student.age} سنة</p>
                          </div>
                        </div>
                        <Badge variant="destructive">غائب</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAttendanceChange(record.student, "present")}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          تسجيل حضور
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* الرسالة في حالة عدم وجود طلاب */}
        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا يوجد طلاب</h3>
            <p className="text-muted-foreground">لم يتم العثور على طلاب في هذه الحلقة</p>
          </div>
        )}
      </main>

      {/* Dialog for Student Work */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary text-center">
              إدارة الطلاب - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="work" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work">إضافة أعمال</TabsTrigger>
              <TabsTrigger value="edit">تعديل أعمال اليوم</TabsTrigger>
              <TabsTrigger value="attendance">إدارة الحضور</TabsTrigger>
            </TabsList>
            
            <TabsContent value="work" className="max-h-[70vh] overflow-y-auto">
              <AddStudentWork 
                student={selectedStudent}
                onClose={() => {
                  setIsDialogOpen(false);
                  setSelectedStudent(null);
                }} 
              />
            </TabsContent>
            
            <TabsContent value="edit" className="max-h-[70vh] overflow-y-auto">
              <EditTodayWork students={students} />
            </TabsContent>
            
            <TabsContent value="attendance" className="max-h-[70vh] overflow-y-auto">
              <AttendanceEditor 
                students={students}
                onAttendanceChange={fetchStudentsAndAttendance}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default TeacherStudents;