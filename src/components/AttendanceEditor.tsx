import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  age: number;
  photo_url?: string;
  circle_id: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: 'present' | 'absent';
  date: string;
}

interface AttendanceEditorProps {
  students: Student[];
  onAttendanceChange?: () => void;
}

const AttendanceEditor = ({ students, onAttendanceChange }: AttendanceEditorProps) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
  }, [students]);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('date', today)
        .in('student_id', students.map(s => s.id));

      if (error) throw error;

      const attendanceMap: Record<string, AttendanceRecord> = {};
      data?.forEach(record => {
        attendanceMap[record.student_id] = {
          id: record.id,
          student_id: record.student_id,
          status: record.status as 'present' | 'absent',
          date: record.date
        };
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الحضور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (student: Student, newStatus: 'present' | 'absent') => {
    setUpdating(student.id);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingRecord = attendance[student.id];

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('student_attendance')
          .update({ status: newStatus })
          .eq('id', existingRecord.id);

        if (error) throw error;

        setAttendance(prev => ({
          ...prev,
          [student.id]: { ...existingRecord, status: newStatus }
        }));
      } else {
        // Create new record
        const teacherData = localStorage.getItem('teacher');
        if (!teacherData) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }
        
        const teacher = JSON.parse(teacherData);
        
        const { data, error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: student.id,
            status: newStatus,
            teacher_id: teacher.id,
            date: today,
          })
          .select()
          .single();

        if (error) throw error;

        setAttendance(prev => ({
          ...prev,
          [student.id]: {
            id: data.id,
            student_id: data.student_id,
            status: data.status as 'present' | 'absent',
            date: data.date
          }
        }));
      }

      // إدارة نقاط الحماسة
      if (newStatus === 'present') {
        // إضافة نقطة حماسة واحدة عند الحضور
        const { data: existingPoints } = await supabase
          .from('student_points')
          .select('*')
          .eq('student_id', student.id)
          .eq('date', today)
          .eq('point_type', 'enthusiasm')
          .maybeSingle();

        if (!existingPoints) {
          await supabase
            .from('student_points')
            .insert({
              student_id: student.id,
              date: today,
              point_type: 'enthusiasm',
              points: 1,
              reason: 'حضور'
            });
        }
      } else if (newStatus === 'absent') {
        // حذف جميع نقاط الحماسة عند الغياب
        await supabase
          .from('student_points')
          .delete()
          .eq('student_id', student.id)
          .eq('point_type', 'enthusiasm');
      }

      // نقاط الترتيب تُحسب شهرياً وليس يومياً
      // سيتم حسابها تلقائياً عند نهاية الشهر

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل ${newStatus === 'present' ? 'حضور' : 'غياب'} ${student.name}`,
      });

      onAttendanceChange?.();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحضور",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">جاري تحميل بيانات الحضور...</p>
      </div>
    );
  }

  return (
    <Card className="islamic-card">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-3">
          <Edit2 className="w-6 h-6 text-primary" />
          إدارة الحضور والغياب
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {students.map((student) => {
            const record = attendance[student.id];
            const isPresent = record?.status === 'present';
            const isAbsent = record?.status === 'absent';
            const isUpdating = updating === student.id;

            return (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {student.name.split(' ')[0].charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">{student.age} سنة</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {record && (
                    <Badge variant={isPresent ? "default" : "destructive"}>
                      {isPresent ? "حاضر" : "غائب"}
                    </Badge>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAttendanceChange(student, "present")}
                      disabled={isUpdating}
                      variant={isPresent ? "default" : "outline"}
                      size="sm"
                      className={isPresent ? 
                        "bg-green-600 hover:bg-green-700 text-white" : 
                        "border-green-600 text-green-600 hover:bg-green-50"
                      }
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      حضور
                    </Button>
                    
                    <Button
                      onClick={() => handleAttendanceChange(student, "absent")}
                      disabled={isUpdating}
                      variant={isAbsent ? "destructive" : "outline"}
                      size="sm"
                      className={isAbsent ? 
                        "" : 
                        "border-red-600 text-red-600 hover:bg-red-50"
                      }
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      غياب
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceEditor;