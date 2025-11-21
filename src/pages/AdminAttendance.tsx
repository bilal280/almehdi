import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserX, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AbsentStudent {
  id: string;
  student_id: string;
  date: string;
  student_name: string;
  circle_name: string;
  student_age: number;
}

const AdminAttendance = () => {
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAbsentStudents();
  }, [selectedDate]);

  const fetchAbsentStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_attendance')
        .select(`
          id,
          student_id,
          date,
          students (
            name,
            age,
            circles (
              name
            )
          )
        `)
        .eq('status', 'absent')
        .eq('date', selectedDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData: AbsentStudent[] = data.map((record: any) => ({
        id: record.id,
        student_id: record.student_id,
        date: record.date,
        student_name: record.students?.name || 'غير معروف',
        circle_name: record.students?.circles?.name || 'غير محدد',
        student_age: record.students?.age || 0,
      }));

      setAbsentStudents(formattedData);
    } catch (error) {
      console.error('Error fetching absent students:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الغياب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-right mb-4">
            سجل الطلاب الغائبين
          </h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-600" />
                اختر اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap justify-end">
                {weekDates.map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'short' });
                  const isToday = date === today;
                  const isSelected = date === selectedDate;
                  
                  return (
                    <Button
                      key={date}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center ${
                        isToday ? 'border-2 border-emerald-600' : ''
                      }`}
                    >
                      <span className="font-bold">{dayName}</span>
                      <span className="text-xs">{date}</span>
                      {isToday && <span className="text-xs">(اليوم)</span>}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-3">
              <UserX className="w-6 h-6 text-red-600" />
              الطلاب الغائبين في {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">جاري تحميل البيانات...</p>
              </div>
            ) : absentStudents.length === 0 ? (
              <div className="text-center py-8">
                <UserX className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-600">
                  لا يوجد طلاب غائبين في هذا اليوم
                </p>
                <p className="text-muted-foreground mt-2">
                  جميع الطلاب حاضرون أو لم يتم تسجيل الحضور بعد
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">العمر</TableHead>
                    <TableHead className="text-right">اسم الطالب</TableHead>
                    <TableHead className="text-right">#</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absentStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-right">{student.circle_name}</TableCell>
                      <TableCell className="text-right">{student.student_age} سنة</TableCell>
                      <TableCell className="text-right font-semibold">
                        {student.student_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {absentStudents.length - index}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && absentStudents.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-right font-semibold text-red-700">
                  إجمالي الطلاب الغائبين: {absentStudents.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;
