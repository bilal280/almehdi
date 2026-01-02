import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save, UserSearch } from "lucide-react";

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
  const [selectedStudentLevel, setSelectedStudentLevel] = useState("");
  const [studentName, setStudentName] = useState("");
  const [showExamForm, setShowExamForm] = useState(false);
  
  // حقول مشتركة
  const [attemptNumber, setAttemptNumber] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examScore, setExamScore] = useState("");
  const [grade, setGrade] = useState("");
  const [tajweedScore, setTajweedScore] = useState("");

  // دالة لحساب التقدير تلقائياً بناءً على العلامة ومستوى الطالب
  const calculateGrade = (score: number, level: string): string => {
    if (!score || score < 0 || score > 100) return "";
    
    if (level === "تمهيدي") {
      // سلم التمهيدي
      if (score === 100) return "شرف";
      if (score >= 97 && score <= 99) return "تفوق";
      if (score >= 94 && score <= 96) return "ممتاز";
      if (score >= 90 && score <= 93) return "جيد جداً";
      if (score >= 85 && score <= 89) return "جيد";
      if (score >= 80 && score <= 84) return "مقبول";
      return "إعادة";
    } else if (level === "حافظ") {
      // سلم التوحيد (الحافظ)
      if (score === 100) return "شرف";
      if (score >= 98 && score <= 99) return "تفوق";
      if (score >= 96 && score <= 97) return "ممتاز";
      if (score >= 94 && score <= 95) return "جيد جداً";
      if (score >= 92 && score <= 93) return "جيد";
      if (score >= 90 && score <= 91) return "مقبول";
      return "إعادة";
    } else {
      // سلم التلاوة (افتراضي - نفس التمهيدي)
      if (score === 100) return "شرف";
      if (score >= 97 && score <= 99) return "تفوق";
      if (score >= 94 && score <= 96) return "ممتاز";
      if (score >= 90 && score <= 93) return "جيد جداً";
      if (score >= 85 && score <= 89) return "جيد";
      if (score >= 80 && score <= 84) return "مقبول";
      return "إعادة";
    }
  };

  // تحديث التقدير تلقائياً عند تغيير العلامة
  useEffect(() => {
    if (examScore && selectedStudentLevel) {
      const score = parseFloat(examScore);
      const calculatedGrade = calculateGrade(score, selectedStudentLevel);
      setGrade(calculatedGrade);
    } else {
      setGrade("");
    }
  }, [examScore, selectedStudentLevel]);
  const [surahMemoryScore, setSurahMemoryScore] = useState("");
  const [notes, setNotes] = useState("");
  
  // حقول التمهيدي
  const [tamhidiStage, setTamhidiStage] = useState("");
  
  // حقول التلاوة
  const [tilawahSection, setTilawahSection] = useState("");
  const [tafsirScore, setTafsirScore] = useState("");
  
  // حقول الحفاظ
  const [hifdSection, setHifdSection] = useState("");
  const [stabilityScore, setStabilityScore] = useState("");
  
  const [loading, setLoading] = useState(false);
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

  const handleStudentSelect = () => {
    if (!selectedCircleId || !selectedStudentId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الحلقة والطالب",
        variant: "destructive",
      });
      return;
    }
    
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentLevel(student.level);
      setStudentName(student.name);
      setShowExamForm(true);
    }
  };

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
    
    // التحقق من الحقول المطلوبة حسب المستوى
    if (!selectedCircleId || !selectedStudentId || !attemptNumber || !examDate) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // التحقق من اختيار المرحلة حسب المستوى
    if (selectedStudentLevel === 'تمهيدي' && !tamhidiStage) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المرحلة",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedStudentLevel === 'تلاوة' && !tilawahSection) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار القسم",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedStudentLevel === 'حافظ' && !hifdSection) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار القسم",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const insertData: any = {
        student_id: selectedStudentId,
        circle_id: selectedCircleId,
        attempt_number: parseInt(attemptNumber),
        exam_score: examScore ? parseFloat(examScore) : null,
        grade: grade || null,
        tajweed_score: tajweedScore ? parseFloat(tajweedScore) : null,
        surah_memory_score: surahMemoryScore ? parseFloat(surahMemoryScore) : null,
        notes: notes || null,
        exam_date: examDate
      };

      // إضافة الحقول حسب مستوى الطالب
      if (selectedStudentLevel === 'تمهيدي') {
        insertData.tamhidi_stage = tamhidiStage;
      } else if (selectedStudentLevel === 'تلاوة') {
        insertData.tilawah_section = tilawahSection;
        insertData.tafsir_score = tafsirScore ? parseFloat(tafsirScore) : null;
      } else if (selectedStudentLevel === 'حافظ') {
        insertData.hifd_section = hifdSection;
        insertData.stability_score = stabilityScore ? parseFloat(stabilityScore) : null;
      }

      const { error } = await supabase
        .from('student_exams')
        .insert(insertData);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "خطأ",
          description: "فشل في حفظ نتيجة الاختبار: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم بنجاح",
        description: "تم حفظ نتيجة الاختبار بنجاح",
      });

      // إعادة تعيين الحقول
      resetForm();
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

  const resetForm = () => {
    setAttemptNumber("");
    setExamDate(new Date().toISOString().split('T')[0]);
    setExamScore("");
    setGrade("");
    setTajweedScore("");
    setSurahMemoryScore("");
    setNotes("");
    setTamhidiStage("");
    setTilawahSection("");
    setHifdSection("");
    setTafsirScore("");
    setStabilityScore("");
    setShowExamForm(false);
    setSelectedStudentId("");
    setSelectedStudentLevel("");
    setStudentName("");
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

          {!showExamForm ? (
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-primary">اختيار الطالب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                            {student.name} - {student.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="button"
                    onClick={handleStudentSelect}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!selectedStudentId}
                  >
                    <UserSearch className="w-4 h-4 ml-2" />
                    إدخال الاختبار
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-primary">
                  اختبار الطالب: {studentName} - المستوى: {selectedStudentLevel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* حقول خاصة بالتمهيدي */}
                  {selectedStudentLevel === 'تمهيدي' && (
                    <div className="space-y-2">
                      <Label htmlFor="tamhidiStage" className="text-right block">المرحلة *</Label>
                      <Select value={tamhidiStage} onValueChange={setTamhidiStage}>
                        <SelectTrigger className="text-right bg-background">
                          <SelectValue placeholder="اختر المرحلة" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {/* المراحل الأساسية */}
                          <SelectItem value="مرحلة الحروف">مرحلة الحروف</SelectItem>
                          <SelectItem value="مرحلة الحركات">مرحلة الحركات</SelectItem>
                          <SelectItem value="مرحلة السكون">مرحلة السكون</SelectItem>
                          <SelectItem value="مرحلة الشدة">مرحلة الشدة</SelectItem>
                          <SelectItem value="مرحلة التنوين">مرحلة التنوين</SelectItem>
                          <SelectItem value="مرحلة المدود">مرحلة المدود</SelectItem>
                          <SelectItem value="مرحلة همزة الوصل">مرحلة همزة الوصل</SelectItem>
                          <SelectItem value="مرحلة كامل">مرحلة كامل</SelectItem>
                          {/* المراحل كل 5 صفحات */}
                          <SelectItem value="المرحلة الأولى (1-5)">المرحلة الأولى (1-5)</SelectItem>
                          <SelectItem value="المرحلة الثانية (6-10)">المرحلة الثانية (6-10)</SelectItem>
                          <SelectItem value="المرحلة الثالثة (11-15)">المرحلة الثالثة (11-15)</SelectItem>
                          <SelectItem value="المرحلة الرابعة (16-20)">المرحلة الرابعة (16-20)</SelectItem>
                          <SelectItem value="المرحلة الخامسة (21-25)">المرحلة الخامسة (21-25)</SelectItem>
                          <SelectItem value="المرحلة السادسة (26-30)">المرحلة السادسة (26-30)</SelectItem>
                          <SelectItem value="المرحلة السابعة (31-35)">المرحلة السابعة (31-35)</SelectItem>
                          <SelectItem value="المرحلة الثامنة (36-40)">المرحلة الثامنة (36-40)</SelectItem>
                          <SelectItem value="المرحلة التاسعة (41-45)">المرحلة التاسعة (41-45)</SelectItem>
                          <SelectItem value="المرحلة العاشرة (46-50)">المرحلة العاشرة (46-50)</SelectItem>
                          <SelectItem value="المرحلة الحادية عشر (51-55)">المرحلة الحادية عشر (51-55)</SelectItem>
                          <SelectItem value="المرحلة الثانية عشر (56-60)">المرحلة الثانية عشر (56-60)</SelectItem>
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* حقول خاصة بالتلاوة */}
                  {selectedStudentLevel === 'تلاوة' && (
                    <div className="space-y-2">
                      <Label htmlFor="tilawahSection" className="text-right block">القسم *</Label>
                      <Select value={tilawahSection} onValueChange={setTilawahSection}>
                        <SelectTrigger className="text-right bg-background">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50 max-h-[300px]">
                          {/* الأجزاء من 1 إلى 30 */}
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={`juz-${num}`} value={`الجزء ${num}`}>
                              الجزء {num}
                            </SelectItem>
                          ))}
                          {/* المراحل كل 5 أجزاء */}
                          <SelectItem value="المرحلة الأولى (1-5)">المرحلة الأولى (1-5)</SelectItem>
                          <SelectItem value="المرحلة الثانية (6-10)">المرحلة الثانية (6-10)</SelectItem>
                          <SelectItem value="المرحلة الثالثة (11-15)">المرحلة الثالثة (11-15)</SelectItem>
                          <SelectItem value="المرحلة الرابعة (16-20)">المرحلة الرابعة (16-20)</SelectItem>
                          <SelectItem value="المرحلة الخامسة (21-25)">المرحلة الخامسة (21-25)</SelectItem>
                          <SelectItem value="المرحلة السادسة (26-30)">المرحلة السادسة (26-30)</SelectItem>
                          {/* الأحزاب الأخيرة */}
                          <SelectItem value="الحزب 57">الحزب 57</SelectItem>
                          <SelectItem value="الحزب 58">الحزب 58</SelectItem>
                          <SelectItem value="الحزب 59">الحزب 59</SelectItem>
                          <SelectItem value="الحزب 60">الحزب 60</SelectItem>
                          {/* السور */}
                          <SelectItem value="عم وتبارك">عم وتبارك</SelectItem>
                          {/* أخرى */}
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* حقول خاصة بالحفاظ */}
                  {selectedStudentLevel === 'حافظ' && (
                    <div className="space-y-2">
                      <Label htmlFor="hifdSection" className="text-right block">القسم *</Label>
                      <Select value={hifdSection} onValueChange={setHifdSection}>
                        <SelectTrigger className="text-right bg-background">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50 max-h-[300px]">
                          {/* الأجزاء من 1 إلى 30 */}
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={`juz-${num}`} value={`الجزء ${num}`}>
                              الجزء {num}
                            </SelectItem>
                          ))}
                          {/* المراحل كل 5 أجزاء */}
                          <SelectItem value="المرحلة الأولى (1-5)">المرحلة الأولى (1-5)</SelectItem>
                          <SelectItem value="المرحلة الثانية (6-10)">المرحلة الثانية (6-10)</SelectItem>
                          <SelectItem value="المرحلة الثالثة (11-15)">المرحلة الثالثة (11-15)</SelectItem>
                          <SelectItem value="المرحلة الرابعة (16-20)">المرحلة الرابعة (16-20)</SelectItem>
                          <SelectItem value="المرحلة الخامسة (21-25)">المرحلة الخامسة (21-25)</SelectItem>
                          <SelectItem value="المرحلة السادسة (26-30)">المرحلة السادسة (26-30)</SelectItem>
                          {/* السور */}
                          <SelectItem value="عم وتبارك">عم وتبارك</SelectItem>
                          {/* أخرى */}
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* تاريخ الاختبار */}
                  <div className="space-y-2">
                    <Label htmlFor="examDate" className="text-right block">تاريخ الاختبار *</Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="text-right"
                    />
                  </div>

                  {/* رقم المحاولة */}
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
                        <SelectItem value="4">المحاولة الرابعة</SelectItem>
                        <SelectItem value="100">المرحلة</SelectItem>
                        {selectedStudentLevel === 'حافظ' && (
                          <SelectItem value="200">التثبيت</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-bold text-primary text-right">النتيجة</h3>
                    
                    {/* رسالة توضيحية عن سلم التقديرات */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
                      <p className="text-sm font-semibold text-blue-900 mb-2">📊 سلم التقديرات حسب المستوى:</p>
                      {selectedStudentLevel === "تمهيدي" && (
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>• شرف: 100 | تفوق: 97-99 | ممتاز: 94-96</p>
                          <p>• جيد جداً: 90-93 | جيد: 85-89 | مقبول: 80-84</p>
                        </div>
                      )}
                      {selectedStudentLevel === "حافظ" && (
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>• شرف: 100 | تفوق: 98-99 | ممتاز: 96-97</p>
                          <p>• جيد جداً: 94-95 | جيد: 92-93 | مقبول: 90-91</p>
                        </div>
                      )}
                      {selectedStudentLevel === "تلاوة" && (
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>• شرف: 100 | تفوق: 97-99 | ممتاز: 94-96</p>
                          <p>• جيد جداً: 90-93 | جيد: 85-89 | مقبول: 80-84</p>
                        </div>
                      )}
                      <p className="text-xs text-blue-700 mt-2 italic">* التقدير يُحسب تلقائياً عند إدخال العلامة</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* العلامة */}
                      <div className="space-y-2">
                        <Label htmlFor="examScore" className="text-right block">العلامة *</Label>
                        <Input
                          id="examScore"
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={examScore}
                          onChange={(e) => setExamScore(e.target.value)}
                          placeholder="أدخل العلامة"
                          className="text-right"
                        />
                      </div>

                      {/* التقييم - يتم حسابه تلقائياً */}
                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-right block">التقييم (تلقائي)</Label>
                        <Input
                          id="grade"
                          type="text"
                          value={grade}
                          readOnly
                          disabled
                          placeholder="يتم حسابه تلقائياً"
                          className="text-right bg-muted"
                        />
                      </div>

                      {/* علامة التجويد النظري (اختيارية) */}
                      <div className="space-y-2">
                        <Label htmlFor="tajweedScore" className="text-right block">علامة التجويد النظري (من 10) - اختياري</Label>
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

                      {/* علامة حفظ السور (اختيارية) */}
                      <div className="space-y-2">
                        <Label htmlFor="surahMemoryScore" className="text-right block">علامة حفظ السور (من 10) - اختياري</Label>
                        <Input
                          id="surahMemoryScore"
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={surahMemoryScore}
                          onChange={(e) => setSurahMemoryScore(e.target.value)}
                          placeholder="أدخل علامة حفظ السور"
                          className="text-right"
                        />
                      </div>

                      {/* علامة التفسير للتلاوة (اختيارية) */}
                      {selectedStudentLevel === 'تلاوة' && (
                        <div className="space-y-2">
                          <Label htmlFor="tafsirScore" className="text-right block">علامة التفسير (من 10) - اختياري</Label>
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
                      )}

                      {/* علامة الثبات للحفاظ (اختيارية) */}
                      {selectedStudentLevel === 'حافظ' && (
                        <div className="space-y-2">
                          <Label htmlFor="stabilityScore" className="text-right block">علامة الثبات (من 10) - اختياري</Label>
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
                    </div>

                    {/* ملاحظات */}
                    <div className="space-y-2">
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

                  <div className="flex gap-4">
                    <Button 
                      type="button"
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {loading ? "جاري الحفظ..." : "حفظ نتيجة الاختبار"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default ExamManagement;
