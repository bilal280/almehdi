import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import RewardsSection from "@/components/RewardsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Award, Download, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/exportToExcel";
import { resetStudentPoints } from "@/lib/generalPointsManager";

interface PointRecord {
  id: string;
  student_name: string;
  student_number: number;
  circle_name: string;
  circle_id?: string;
  enthusiasm_points: number;
  general_points: number;
  total_points: number;
}

interface Circle {
  id: string;
  name: string;
}

const AdminPointsRecords = () => {
  const [pointRecords, setPointRecords] = useState<PointRecord[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState<string>("all");
  const [resettingStudent, setResettingStudent] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
    fetchPointRecords();
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

  const fetchPointRecords = async () => {
    try {
      setLoading(true);
      
      // جلب جميع الطلاب النشطين
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          student_number,
          circle_id,
          circles (
            name
          )
        `);

      if (studentsError) throw studentsError;

      // استثناء المنقطعين
      const { data: discontinuedStudents } = await supabase
        .from('discontinued_students')
        .select('id');
      
      const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
      const activeStudents = studentsData?.filter(s => !discontinuedIds.has(s.id)) || [];

      // جلب نقاط الحماسة لكل طالب
      const { data: pointsData, error: pointsError } = await supabase
        .from('student_points')
        .select('*')
        .eq('point_type', 'enthusiasm')
        .in('student_id', activeStudents.map(s => s.id));

      if (pointsError) throw pointsError;

      // جلب النقاط العامة لكل طالب
      const { data: generalPointsData } = await supabase
        .from('student_general_points_summary')
        .select('*')
        .in('student_id', activeStudents.map(s => s.id));

      // حساب إجمالي نقاط الحماسة والنقاط العامة لكل طالب
      const studentPointsMap = new Map();
      activeStudents.forEach(student => {
        studentPointsMap.set(student.id, {
          id: student.id,
          student_name: student.name,
          student_number: student.student_number,
          circle_name: student.circles?.name || "غير محدد",
          circle_id: student.circle_id,
          enthusiasm_points: 0,
          general_points: 0,
          total_points: 0
        });
      });

      pointsData?.forEach(point => {
        const student = studentPointsMap.get(point.student_id);
        if (student) {
          student.enthusiasm_points += point.points;
        }
      });

      generalPointsData?.forEach(summary => {
        const student = studentPointsMap.get(summary.student_id);
        if (student) {
          student.general_points = summary.total_points;
        }
      });

      // حساب المجموع الكلي مع نقاط الحماسة التراكمية
      studentPointsMap.forEach(student => {
        // حساب نقاط الحماسة التراكمية
        // كل 5 أيام = milestone يعطي نقاط = رقمه
        // مثال: 20 يوم = 5 + 10 + 15 + 20 = 50 نقطة
        const milestones = Math.floor(student.enthusiasm_points / 5);
        let cumulativeEnthusiasmPoints = 0;
        for (let i = 1; i <= milestones; i++) {
          cumulativeEnthusiasmPoints += (i * 5);
        }
        
        student.enthusiasm_points = cumulativeEnthusiasmPoints;
        student.total_points = student.enthusiasm_points + student.general_points;
      });

      // تحويل إلى مصفوفة وترتيب من الأعلى إلى الأدنى حسب المجموع الكلي
      const sortedRecords = Array.from(studentPointsMap.values())
        .sort((a, b) => b.total_points - a.total_points);

      setPointRecords(sortedRecords);
    } catch (error) {
      console.error('Error fetching point records:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجلات النقاط",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPointTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      enthusiasm: "نقاط الحماسة",
      general: "نقاط عامة",
      bonus: "نقاط إضافية",
      penalty: "خصم نقاط",
    };
    return types[type] || type;
  };

  const filteredRecords = pointRecords.filter(record => {
    const circleMatch = selectedCircle === "all" || record.circle_id === selectedCircle;
    return circleMatch;
  });

  const handleExportPoints = () => {
    const exportData = filteredRecords.map((record, index) => ({
      'الترتيب': index + 1,
      'الرقم التسلسلي': record.student_number,
      'اسم الطالب': record.student_name,
      'الحلقة': record.circle_name,
      'نقاط الحماسة': record.enthusiasm_points,
      'النقاط العامة': record.general_points,
      'المجموع الكلي': record.total_points,
    }));

    const circleName = selectedCircle === "all" ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    exportToExcel(exportData, `نقاط_الطلاب_${circleName}_${new Date().toLocaleDateString('ar-SA')}`, 'نقاط_الطلاب');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير نقاط الطلاب إلى ملف Excel",
    });
  };

  const handleResetStudentPoints = async (studentId: string, studentName: string) => {
    if (!confirm(`هل أنت متأكد من تصفير النقاط العامة للطالب ${studentName}؟\n\nملاحظة: نقاط الحماسة لن تتأثر`)) {
      return;
    }

    try {
      setResettingStudent(studentId);
      const result = await resetStudentPoints(studentId);
      
      if (result.success) {
        toast({
          title: "تم التصفير بنجاح",
          description: `تم تصفير النقاط العامة للطالب ${studentName}`,
        });
        await fetchPointRecords();
      } else {
        throw new Error('فشل في تصفير النقاط');
      }
    } catch (error) {
      console.error('Error resetting points:', error);
      toast({
        title: "خطأ",
        description: "فشل في تصفير النقاط",
        variant: "destructive",
      });
    } finally {
      setResettingStudent(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 text-right mb-8">
          سجلات النقاط
        </h2>

        {/* قسم الترتيب الكلي - في الأعلى */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle className="text-right flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                ترتيب الطلاب - جميع النقاط
              </CardTitle>
              <div className="flex gap-4 items-center flex-wrap">
                {!loading && filteredRecords.length > 0 && (
                  <Button onClick={handleExportPoints} className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير إلى Excel
                  </Button>
                )}
                <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                  <SelectTrigger className="w-48 text-right bg-background">
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
            <div className="overflow-x-auto" dir="rtl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead className="text-center font-bold">الترتيب</TableHead>
                    <TableHead className="text-center font-bold">الرقم التسلسلي</TableHead>
                    <TableHead className="text-right font-bold">اسم الطالب</TableHead>
                    <TableHead className="text-right font-bold">الحلقة</TableHead>
                    <TableHead className="text-center font-bold">نقاط الحماسة</TableHead>
                    <TableHead className="text-center font-bold">النقاط العامة</TableHead>
                    <TableHead className="text-center font-bold">المجموع الكلي</TableHead>
                    <TableHead className="text-center font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        جاري تحميل السجلات...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات نقاط
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-muted text-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {record.student_number}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {record.student_name}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {record.circle_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                            {record.enthusiasm_points}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold ${
                            record.general_points > 0 ? 'bg-green-100 text-green-700' :
                            record.general_points < 0 ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.general_points}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-white font-bold text-lg">
                            {record.total_points}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetStudentPoints(record.id, record.student_name)}
                            disabled={resettingStudent === record.id || record.general_points === 0}
                            className="gap-2"
                          >
                            {resettingStudent === record.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                جاري...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                تصفير
                              </>
                            )}
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

        {/* قسم المكافآت */}
        <RewardsSection />
      </div>
    </div>
  );
};

export default AdminPointsRecords;
