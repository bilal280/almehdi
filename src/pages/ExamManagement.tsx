import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save } from "lucide-react";

interface Circle {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  level: string;
}

const ExamManagement = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [juzNumber, setJuzNumber] = useState("");
  const [attemptNumber, setAttemptNumber] = useState("");
  const [examScore, setExamScore] = useState("");
  const [grade, setGrade] = useState("");
  const [tafsirScore, setTafsirScore] = useState("");
  const [tajweedScore, setTajweedScore] = useState("");
  const [notes, setNotes] = useState("");
  const [stabilityScore, setStabilityScore] = useState("");
  const [shortSurahName, setShortSurahName] = useState("");
  const [shortSurahGrade, setShortSurahGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudentLevel, setSelectedStudentLevel] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircleId) {
      fetchStudents(selectedCircleId);
    } else {
      setStudents([]);
      setSelectedStudentId("");
      setSelectedStudentLevel("");
    }
  }, [selectedCircleId]);

  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setSelectedStudentLevel(student.level);
      }
    } else {
      setSelectedStudentLevel("");
    }
  }, [selectedStudentId, students]);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from('circles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الحلقات",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async (circleId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, level')
        .eq('circle_id', circleId)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلاب",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCircleId || !selectedStudentId || !juzNumber || !attemptNumber) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const insertData: any = {
        student_id: selectedStudentId,
        circle_id: selectedCircleId,
        juz_number: parseInt(juzNumber),
        attempt_number: parseInt(attemptNumber),
        exam_score: examScore ? parseFloat(examScore) : null,
        grade: grade || null,
        tafsir_score: tafsirScore ? parseFloat(tafsirScore) : null,
        tajweed_score: tajweedScore ? parseFloat(tajweedScore) : null,
        notes: notes || null,
        exam_date: new Date().toISOString().split('T')[0]
      };

      // إضافة الحقول الإضافية حسب مستوى الطالب
      if (selectedStudentLevel === 'حافظ' && stabilityScore) {
        insertData.stability_score = parseFloat(stabilityScore);
      }
      if (selectedStudentLevel === 'تمهيدي' && shortSurahName) {
        insertData.short_surah_name = shortSurahName;
        insertData.short_surah_grade = shortSurahGrade || null;
      }

      const { error } = await supabase
        .from('student_exams')
        .insert(insertData);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "خطأ",
            description: "هذا الطالب قد اختبر في هذا الجزء بنفس رقم المحاولة من قبل",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "تم بنجاح",
        description: "تم حفظ نتيجة الاختبار بنجاح",
      });

      // إعادة تعيين الحقول
      setJuzNumber("");
      setAttemptNumber("");
      setExamScore("");
      setGrade("");
      setTafsirScore("");
      setTajweedScore("");
      setNotes("");
      setStabilityScore("");
      setShortSurahName("");
      setShortSurahGrade("");
      setSelectedStudentId("");
      setSelectedStudentLevel("");
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ نتيجة الاختبار",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="islamic-card p-6 mb-8 text-center fade-in-up">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">إدارة الاختبارات</h1>
            <p className="text-muted-foreground">قم بإدخال نتائج اختبارات الطلاب</p>
          </div>

          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">نموذج إدخال الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="circle" className="text-right block">اختر الحلقة *</Label>
                  <Select value={selectedCircleId} onValueChange={setSelectedCircleId}>
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
                  <Label htmlFor="student" className="text-right block">اختر الطالب *</Label>
                  <Select 
                    value={selectedStudentId} 
                    onValueChange={setSelectedStudentId}
                    disabled={!selectedCircleId || students.length === 0}
                  >
                    <SelectTrigger className="text-right bg-background">
                      <SelectValue placeholder={students.length === 0 ? "لا يوجد طلاب في هذه الحلقة" : "اختر الطالب"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="juzNumber" className="text-right block">رقم الجزء (1-30) *</Label>
                    <Select value={juzNumber} onValueChange={setJuzNumber}>
                      <SelectTrigger className="text-right bg-background">
                        <SelectValue placeholder="اختر رقم الجزء" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50 max-h-[300px]">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            الجزء {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attemptNumber" className="text-right block">رقم المحاولة *</Label>
                    <Select value={attemptNumber} onValueChange={setAttemptNumber}>
                      <SelectTrigger className="text-right bg-background">
                        <SelectValue placeholder="اختر رقم المحاولة" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="1">المحاولة الأولى</SelectItem>
                        <SelectItem value="2">المحاولة الثانية</SelectItem>
                        <SelectItem value="3">المحاولة الثالثة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-primary mb-4 text-right">النتيجة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examScore" className="text-right block">علامة الاختبار</Label>
                      <Input
                        id="examScore"
                        type="number"
                        step="0.01"
                        value={examScore}
                        onChange={(e) => setExamScore(e.target.value)}
                        placeholder="أدخل علامة الاختبار"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-right block">التقدير</Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger className="text-right bg-background">
                          <SelectValue placeholder="اختر التقدير" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="ممتاز">ممتاز</SelectItem>
                          <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                          <SelectItem value="جيد">جيد</SelectItem>
                          <SelectItem value="مقبول">مقبول</SelectItem>
                          <SelectItem value="ضعيف">ضعيف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tafsirScore" className="text-right block">علامة التفسير (من 10)</Label>
                      <Input
                        id="tafsirScore"
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={tafsirScore}
                        onChange={(e) => setTafsirScore(e.target.value)}
                        placeholder="أدخل علامة التفسير"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tajweedScore" className="text-right block">علامة التجويد النظري (من 10)</Label>
                      <Input
                        id="tajweedScore"
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={tajweedScore}
                        onChange={(e) => setTajweedScore(e.target.value)}
                        placeholder="أدخل علامة التجويد"
                        className="text-right"
                      />
                    </div>

                    {selectedStudentLevel === 'حافظ' && (
                      <div className="space-y-2">
                        <Label htmlFor="stabilityScore" className="text-right block">علامة الثبات (من 10)</Label>
                        <Input
                          id="stabilityScore"
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={stabilityScore}
                          onChange={(e) => setStabilityScore(e.target.value)}
                          placeholder="أدخل علامة الثبات"
                          className="text-right"
                        />
                      </div>
                    )}

                    {selectedStudentLevel === 'تمهيدي' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="shortSurahName" className="text-right block">اسم السورة القصيرة</Label>
                          <Input
                            id="shortSurahName"
                            type="text"
                            value={shortSurahName}
                            onChange={(e) => setShortSurahName(e.target.value)}
                            placeholder="مثال: سورة الفاتحة"
                            className="text-right"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shortSurahGrade" className="text-right block">تقدير السورة القصيرة</Label>
                          <Select value={shortSurahGrade} onValueChange={setShortSurahGrade}>
                            <SelectTrigger className="text-right bg-background">
                              <SelectValue placeholder="اختر التقدير" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="ممتاز">ممتاز</SelectItem>
                              <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                              <SelectItem value="جيد">جيد</SelectItem>
                              <SelectItem value="مقبول">مقبول</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes" className="text-right block">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أدخل ملاحظات حول الاختبار"
                      className="text-right"
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 ml-2" />
                  {loading ? "جاري الحفظ..." : "حفظ نتيجة الاختبار"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default ExamManagement;
