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
  student_id: string;
  student_name: string;
  circle_name: string;
  circle_id?: string;
  point_type: string;
  points: number;
  reason: string | null;
  date: string;
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
      const { data, error } = await supabase
        .from('student_points')
        .select(`
          *,
          students (
            name,
            circle_id,
            circles (
              name
            )
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const recordsWithDetails = data?.map(record => ({
        ...record,
        student_name: record.students?.name || "غير محدد",
        circle_name: record.students?.circles?.name || "غير محدد",
        circle_id: record.students?.circle_id
      })) || [];

      setPointRecords(recordsWithDetails);
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
    const typeMatch = selectedPointType === "all" || record.point_type === selectedPointType;
    return circleMatch && typeMatch;
  });

  const handleExportPoints = () => {
    const exportData = filteredRecords.map((record, index) => ({
      'الرقم': index + 1,
      'التاريخ': new Date(record.date).toLocaleDateString('ar-EG'),
      'اسم الطالب': record.student_name,
      'الحلقة': record.circle_name,
      'نوع النقاط': getPointTypeLabel(record.point_type),
      'عدد النقاط': record.points,
      'السبب': record.reason || '-',
    }));

    const circleName = selectedCircle === "all" ? 'جميع_الحلقات' : circles.find(c => c.id === selectedCircle)?.name || 'حلقة';
    const pointType = selectedPointType === "all" ? 'جميع_الأنواع' : getPointTypeLabel(selectedPointType);
    exportToExcel(exportData, `سجلات_النقاط_${circleName}_${pointType}_${new Date().toLocaleDateString('ar-SA')}`, 'النقاط');
    
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير سجلات النقاط إلى ملف Excel",
    });
  };

  const pointTypes = [
    { value: "all", label: "جميع الأنواع" },
    { value: "enthusiasm", label: "نقاط الحماسة" },
    { value: "general", label: "نقاط عامة" },
    { value: "bonus", label: "نقاط إضافية" },
    { value: "penalty", label: "خصم نقاط" },
  ];

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
                جميع سجلات النقاط
              </CardTitle>
              <div className="flex gap-4 items-center flex-wrap">
                {!loading && filteredRecords.length > 0 && (
                  <Button onClick={handleExportPoints} className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير إلى Excel
                  </Button>
                )}
                <Select value={selectedPointType} onValueChange={setSelectedPointType}>
                  <SelectTrigger className="w-48 text-right bg-background">
                    <SelectValue placeholder="نوع النقاط" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {pointTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-center">الطالب</TableHead>
                    <TableHead className="text-right">الحلقة</TableHead>
                    <TableHead className="text-right">نوع النقاط</TableHead>
                    <TableHead className="text-right">النقاط</TableHead>
                    <TableHead className="text-right">السبب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        جاري تحميل السجلات...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات نقاط
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-right">
                          {new Date(record.date).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {record.student_name}
                        </TableCell>
                        <TableCell className="text-right">{record.circle_name}</TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.point_type === 'enthusiasm' ? 'bg-purple-100 text-purple-800' :
                            record.point_type === 'general' ? 'bg-blue-100 text-blue-800' :
                            record.point_type === 'bonus' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getPointTypeLabel(record.point_type)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${record.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {record.points > 0 ? '+' : ''}{record.points}
                          </span>
                        </TableCell>
                        <TableCell className="text-right max-w-xs truncate">
                          {record.reason || '-'}
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
