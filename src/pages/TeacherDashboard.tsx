import { useState, useEffect } from "react";
import { BookOpen, UserCheck, UserX, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStudentWork from "@/components/AddStudentWork";
import AttendanceEditor from "@/components/AttendanceEditor";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
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

const TeacherDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherName, setTeacherName] = useState<string>("الأستاذ");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    loadTeacherName();
  }, []);

  const loadTeacherName = () => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const teacher = JSON.parse(teacherData);
      setTeacherName(teacher.name || "الأستاذ");
    }
  };

  const fetchStudents = async () => {
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
      const { data, error } = await supabase
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

      if (error) throw error;

      // جلب سجلات الحضور لليوم
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('student_attendance')
        .select('student_id')
        .eq('date', today);

      if (attendanceError) throw attendanceError;

      // إنشاء مجموعة من معرفات الطلاب الذين لديهم حضور/غياب مسجل اليوم
      const studentsWithAttendance = new Set(attendanceData?.map(a => a.student_id) || []);

      // تصفية الطلاب لإخفاء من لديهم حضور/غياب مسجل
      const filteredStudents = data?.filter(student => !studentsWithAttendance.has(student.id)) || [];

      setStudents(filteredStudents);
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

  const handleAttendance = async (student: Student, status: "present" | "absent") => {
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

      const { error } = await supabase
        .from('student_attendance')
        .upsert({
          student_id: student.id,
          status: status,
          teacher_id: teacher.id,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'} ${student.name}`,
      });

      // إزالة الطالب من القائمة بعد تسجيل الحضور/الغياب
      setStudents(prevStudents => prevStudents.filter(s => s.id !== student.id));

      if (status === "present") {
        setSelectedStudent(student);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الحضور",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <TeacherNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="islamic-card p-6 mb-8 text-center fade-in-up">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">مرحباً {teacherName}</h2>
          <p className="text-muted-foreground">قم بتسجيل حضور الطلاب وإضافة أعمالهم اليومية</p>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري تحميل الطلاب...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <Card key={student.id} className={`islamic-card p-6 hover:shadow-xl transition-all duration-300 ${index % 2 === 0 ? 'fade-in-up' : 'fade-in-right'}`}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {student.name.split(' ')[0].charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{student.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{student.age} سنة</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAttendance(student, "present")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    حضور
                  </Button>
                  <Button
                    onClick={() => handleAttendance(student, "absent")}
                    variant="destructive"
                    className="flex-1 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    غياب
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا يوجد طلاب</h3>
            <p className="text-muted-foreground">لم يتم العثور على طلاب في هذه الحلقة</p>
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary text-center">
                إدارة الطلاب
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="work" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="work">إضافة أعمال</TabsTrigger>
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
              
              <TabsContent value="attendance" className="max-h-[70vh] overflow-y-auto">
                <AttendanceEditor 
                  students={students}
                  onAttendanceChange={() => {
                    // يمكن إضافة تحديث للبيانات هنا
                  }}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Quick Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg bg-primary hover:bg-primary-dark"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default TeacherDashboard;