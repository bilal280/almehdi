import { useState, useEffect } from "react";
import { Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Circle {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

const PointsManagement = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCircle, setSelectedCircle] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [pointType, setPointType] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchStudents(selectedCircle);
    }
  }, [selectedCircle]);

  const fetchCircles = async () => {
    const { data, error } = await supabase
      .from('circles')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching circles:', error);
      return;
    }

    setCircles(data || []);
  };

  const fetchStudents = async (circleId: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('id, name')
      .eq('circle_id', circleId)
      .order('name');

    if (error) {
      console.error('Error fetching students:', error);
      return;
    }

    setStudents(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !pointType || !points) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('student_points')
        .insert({
          student_id: selectedStudent,
          point_type: pointType,
          points: parseInt(points),
          reason: reason || null,
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة النقاط بنجاح",
      });

      // Reset form
      setSelectedStudent("");
      setPointType("");
      setPoints("");
      setReason("");
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة النقاط",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pointTypes = [
    { value: "enthusiasm", label: "نقاط الحماسة" },
    { value: "general", label: "نقاط عامة" },
    { value: "bonus", label: "نقاط إضافية" },
    { value: "penalty", label: "خصم نقاط" },
  ];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <AdminNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="islamic-card p-6 max-w-2xl mx-auto fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <Award className="w-12 h-12 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">إدارة النقاط</h1>
                <p className="text-muted-foreground">إضافة نقاط للطلاب</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">الحلقة</Label>
                    <Select value={selectedCircle} onValueChange={setSelectedCircle} required>
                      <SelectTrigger className="mt-2 bg-background z-50">
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

                  {selectedCircle && (
                    <div>
                      <Label className="text-base font-semibold">بحث عن طالب</Label>
                      <Input
                        placeholder="ابحث عن طالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mt-2 text-right"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-base font-semibold">الطالب</Label>
                    <Select 
                      value={selectedStudent} 
                      onValueChange={setSelectedStudent}
                      disabled={!selectedCircle}
                      required
                    >
                      <SelectTrigger className="mt-2 bg-background z-40">
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-40">
                        {students
                          .filter(student => 
                            searchQuery === "" || 
                            student.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">نوع النقاط</Label>
                    <Select value={pointType} onValueChange={setPointType} required>
                      <SelectTrigger className="mt-2 bg-background z-30">
                        <SelectValue placeholder="اختر نوع النقاط" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-30">
                        {pointTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">عدد النقاط</Label>
                    <Input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      placeholder="أدخل عدد النقاط (استخدم - للخصم)"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">السبب (اختياري)</Label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="اكتب سبب إضافة/خصم النقاط"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {loading ? "جاري الإضافة..." : "إضافة النقاط"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

export default PointsManagement;
