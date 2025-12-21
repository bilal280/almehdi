import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/exportToExcel";

interface PointRecord {
  id: string;
  student_name: string;
  student_number: number;
  circle_name: string;
  circle_id?: string;
  enthusiasm_points: number;
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
  const [selectedPointType, setSelectedPointType] = useState<string>("all");
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

      // حساب إجمالي نقاط الحماسة لكل طالب
      const studentPointsMap = new Map();
      activeStudents.forEach(student => {
        studentPointsMap.set(student.id, {
          id: student.id,
          student_name: student.name,
          student_number: student.student_number,
          circle_name: student.circles?.name || "غير محدد",
          circle_id: student.circle_id,
          enthusiasm_points: 0
        });
      });

      pointsData?.forEach(point => {
        const student = studentPointsMap.get(point.student_id);
        if (student) {
          student.enthusiasm_points += point.points;
        }
      });

      // تحويل إلى مصفوفة وترتيب من الأعلى إلى الأدنى
      const sortedRecords = Array.from(studentPointsMap.values())
        .sort((a, b) => b.enthusiasm_points - a.enthusiasm_points);

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
    }));

    const circleName = selectedCircle === "all" ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    exportToExcel(exportData, `نقاط_الحماسة_${circleName}_${new Date().toLocaleDateString('ar-SA')}`, 'نقاط_الحماسة');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير نقاط الحماسة إلى ملف Excel",
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 text-right mb-8">
          سجلات النقاط
        </h2>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle className="text-right flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-600" />
                نقاط الحماسة - الترتيب العام
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        جاري تحميل السجلات...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-lg">
                            {record.enthusiasm_points}
                          </span>
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
    </div>
  );
};

export default AdminPointsRecords;
