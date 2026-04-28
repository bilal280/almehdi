import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save, UserSearch, Download, Trash2, Edit, X, Search, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Circle {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  level: string;
}

interface Exam {
  id: string;
  exam_date: string;
  juz_number: number | null;
  attempt_number: number;
  exam_score: number | null;
  tajweed_score: number | null;
  tafsir_score: number | null;
  surah_memory_score: number | null;
  stability_score: number | null;
  grade: string | null;
  notes: string | null;
  tamhidi_stage: string | null;
  tilawah_section: string | null;
  hifd_section: string | null;
  student_name?: string;
  student_level?: string;
  circle_name?: string;
  circle_id?: string;
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
  const calculateGrade = (score: number, level: string, examStage?: string): string => {
    if (!score || score < 0 || score > 100) return "";

    if (level === "تمهيدي") {
      // سلم التمهيدي الكامل (حد النجاح من 85)
      if (examStage === "مرحلة كامل") {
        if (score === 100) return "شرف";
        if (score >= 97) return "تفوق";
        if (score >= 94) return "ممتاز";
        if (score >= 90) return "جيد جداً";
        if (score >= 87) return "جيد";
        if (score >= 85) return "مقبول";
        return "إعادة";
      }
      
      // سلم التمهيدي العادي
      if (score === 100) return "شرف";
      if (score >= 98) return "تفوق";
      if (score >= 96) return "ممتاز";
      if (score >= 94) return "جيد جداً";
      if (score >= 92) return "جيد";
      if (score >= 90) return "مقبول";
      if (score == 0) return "إعادة";

      return "إعادة";
    } else if (level === "حافظ") {
      // سلم الحافظ
      if (score === 100) return "شرف";
      if (score >= 97) return "تفوق";
      if (score >= 94) return "ممتاز";
      if (score >= 90) return "جيد جداً";
      if (score >= 85) return "جيد";
      if (score >= 80 ) return "مقبول";
      

      return "إعادة";
    } else {
      // سلم التلاوة
      if (score === 100) return "شرف";
      if (score >= 98 ) return "تفوق";
      if (score >= 95) return "ممتاز";
      if (score >= 92) return "جيد جداً";
      if (score >= 89) return "جيد";
      if (score >= 85) return "مقبول";
     

      return "إعادة";
    }
  };

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
  
  // حالات تبويب سجلات الاختبارات
  const [activeTab, setActiveTab] = useState("new");
  const [previousExams, setPreviousExams] = useState<Exam[]>([]);

  // تحديث التقدير تلقائياً عند تغيير العلامة
  useEffect(() => {
    if (examScore && selectedStudentLevel) {
      const score = parseFloat(examScore);
      const calculatedGrade = calculateGrade(score, selectedStudentLevel, tamhidiStage);
      setGrade(calculatedGrade);
    } else {
      setGrade("");
    }
  }, [examScore, selectedStudentLevel, tamhidiStage]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [filterCircleId, setFilterCircleId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Exam>>({});

  const { toast } = useToast();

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (activeTab === "records") {
      fetchPreviousExams();
    }
  }, [activeTab]);

  const fetchPreviousExams = async () => {
    try {
      setLoadingExams(true);
      const { data, error } = await supabase
        .from('student_exams')
        .select(`
          *,
          students (
            name,
            level,
            circle_id,
            circles (
              name
            )
          )
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;

      const examsWithDetails = data?.map(exam => ({
        ...exam,
        student_name: exam.students?.name || "غير محدد",
        student_level: exam.students?.level || "غير محدد",
        circle_name: exam.students?.circles?.name || "غير محدد",
        circle_id: exam.students?.circle_id
      })) || [];

      setPreviousExams(examsWithDetails);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجلات الاختبارات",
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  };

  const handleEditClick = (exam: Exam) => {
    setExamToEdit(exam);
    setEditFormData({
      exam_date: exam.exam_date,
      juz_number: exam.juz_number,
      attempt_number: exam.attempt_number,
      exam_score: exam.exam_score,
      tajweed_score: exam.tajweed_score,
      tafsir_score: exam.tafsir_score,
      surah_memory_score: exam.surah_memory_score,
      stability_score: exam.stability_score,
      grade: exam.grade,
      notes: exam.notes,
      tamhidi_stage: exam.tamhidi_stage,
      tilawah_section: exam.tilawah_section,
      hifd_section: exam.hifd_section,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!examToEdit) return;

    try {
      const { error } = await supabase
        .from('student_exams')
        .update(editFormData)
        .eq('id', examToEdit.id);

      if (error) throw error;

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الاختبار",
      });

      setEditDialogOpen(false);
      setExamToEdit(null);
      setEditFormData({});
      fetchPreviousExams();
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات الاختبار",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (examId: string) => {
    setExamToDelete(examId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;

    try {
      const { error } = await supabase
        .from('student_exams')
        .delete()
        .eq('id', examToDelete);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف سجل الاختبار",
      });

      fetchPreviousExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف سجل الاختبار",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    }
  };

  const getExamSection = (exam: Exam): string => {
    if (exam.tamhidi_stage) return exam.tamhidi_stage;
    if (exam.tilawah_section) return exam.tilawah_section;
    if (exam.hifd_section) return exam.hifd_section;
    if (exam.juz_number) return `الجزء ${exam.juz_number}`;
    return '-';
  };

  const filteredExams = previousExams.filter(exam => {
    // فلترة حسب الحلقة
    const circleMatch = filterCircleId === "all" || exam.circle_id === filterCircleId;
    
    // فلترة حسب البحث (الاسم)
    const searchMatch = !searchQuery || 
      exam.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return circleMatch && searchMatch;
  });

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
      // الحصول على اسم المدرس الحالي من localStorage
      const teacherData = localStorage.getItem('teacher');
      const teacher = teacherData ? JSON.parse(teacherData) : null;
      const teacherName = teacher?.name || null;

      const insertData: any = {
        student_id: selectedStudentId,
        circle_id: selectedCircleId,
        attempt_number: parseInt(attemptNumber),
        exam_score: examScore ? parseFloat(examScore) : null,
        grade: grade || null,
        tajweed_score: tajweedScore ? parseFloat(tajweedScore) : null,
        surah_memory_score: surahMemoryScore ? parseFloat(surahMemoryScore) : null,
        notes: notes || null,
        exam_date: examDate,
        teacher_name: teacherName // حفظ اسم المدرس
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

      // إضافة النقاط العامة للاختبار
      const { addExamPoints, addExamRetakePenalty } = await import("@/lib/generalPointsManager");
      const examName = tamhidiStage || tilawahSection || hifdSection || 'اختبار';
      
      if (grade === 'إعادة') {
        // إذا كان التقدير "إعادة" - خصم نقاط في كل الأحوال
        await addExamRetakePenalty(selectedStudentId, examDate, examName);
      } else if (grade && grade !== 'إعادة') {
        // إذا كان التقدير ناجحاً - إضافة نقاط التقدير
        // ملاحظة: بونص الاختبار (2 نقطة) يُضاف تلقائياً في addExamPoints للاختبارات الناجحة
        await addExamPoints(selectedStudentId, grade, examDate, examName);
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
            <p className="text-muted-foreground">إدارة اختبارات الطلاب والسجلات السابقة</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">تسجيل اختبار جديد</TabsTrigger>
              <TabsTrigger value="records">سجل الاختبارات السابقة</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
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
                              <p>• شرف: 100 | تفوق:98-99 | ممتاز: 97-96</p>
                              <p>• جيد جداً: 95-94 | جيد: 93-92 | مقبول: 90-91</p>
                            </div>
                          )}
                          {selectedStudentLevel === "حافظ" && (
                            <div className="text-xs text-blue-800 space-y-1">
                              <p>• شرف: 100 | تفوق: 97-99 | ممتاز: 96-94</p>
                              <p>• جيد جداً: 93-90 | جيد: 85-89 | مقبول: 81-80</p>
                            </div>
                          )}
                          {selectedStudentLevel === "تلاوة" && (
                            <div className="text-xs text-blue-800 space-y-1">
                              <p>• شرف: 100 | تفوق: 98-99 | ممتاز: 95-97</p>
                              <p>• جيد جداً: 92-94 | جيد: 89-91 | مقبول: 85-88</p>
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
            </TabsContent>

            <TabsContent value="records">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <CardTitle className="text-right">سجل الاختبارات</CardTitle>
                    <div className="flex gap-4 items-center flex-wrap">
                      <div className="w-64">
                        <Input
                          type="text"
                          placeholder="🔍 البحث عن طالب..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="text-right"
                        />
                      </div>
                      <div className="w-64">
                        <Select value={filterCircleId} onValueChange={setFilterCircleId}>
                          <SelectTrigger className="text-right bg-background">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto" dir="rtl">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">#</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">الطالب</TableHead>
                          <TableHead className="text-right">المستوى</TableHead>
                          <TableHead className="text-right">الحلقة</TableHead>
                          <TableHead className="text-right">القسم/المرحلة</TableHead>
                          <TableHead className="text-right">المحاولة</TableHead>
                          <TableHead className="text-right">العلامة</TableHead>
                          <TableHead className="text-right">التقييم</TableHead>
                          <TableHead className="text-right">التجويد</TableHead>
                          <TableHead className="text-right">حفظ السور</TableHead>
                          <TableHead className="text-right">إضافي</TableHead>
                          <TableHead className="text-right">ملاحظات</TableHead>
                          <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingExams ? (
                          <TableRow>
                            <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                              جاري تحميل السجلات...
                            </TableCell>
                          </TableRow>
                        ) : filteredExams.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                              لا توجد سجلات اختبارات
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredExams.map((exam, index) => (
                            <TableRow key={exam.id}>
                              <TableCell className="text-right font-bold text-primary">
                                {index + 1}
                              </TableCell>
                              <TableCell className="text-right">
                                {new Date(exam.exam_date).toLocaleDateString('ar-EG')}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {exam.student_name}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  {exam.student_level}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{exam.circle_name}</TableCell>
                              <TableCell className="text-right font-medium">
                                {getExamSection(exam)}
                              </TableCell>
                              <TableCell className="text-right">{exam.attempt_number}</TableCell>
                              <TableCell className="text-right">
                                {exam.exam_score !== null ? exam.exam_score : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  exam.grade === 'ممتاز' ? 'bg-green-100 text-green-800' :
                                  exam.grade === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                                  exam.grade === 'جيد' ? 'bg-yellow-100 text-yellow-800' :
                                  exam.grade === 'مقبول' ? 'bg-orange-100 text-orange-800' :
                                  exam.grade === 'إعادة' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {exam.grade || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {exam.tajweed_score !== null ? `${exam.tajweed_score}/10` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {exam.surah_memory_score !== null ? `${exam.surah_memory_score}/10` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {exam.student_level === 'تلاوة' && exam.tafsir_score !== null ? (
                                  <span className="text-xs">تفسير: {exam.tafsir_score}/10</span>
                                ) : exam.student_level === 'حافظ' && exam.stability_score !== null ? (
                                  <span className="text-xs">ثبات: {exam.stability_score}/10</span>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-right max-w-xs truncate">
                                {exam.notes || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(exam)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(exam.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل بيانات الاختبار</DialogTitle>
                <DialogDescription className="text-right">
                  قم بتعديل بيانات الاختبار للطالب: {examToEdit?.student_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="exam_date" className="text-right">تاريخ الاختبار</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={editFormData.exam_date || ''}
                    onChange={(e) => setEditFormData({...editFormData, exam_date: e.target.value})}
                    className="text-right"
                  />
                </div>

                {examToEdit?.student_level === 'حافظ' && (
                  <div className="grid gap-2">
                    <Label htmlFor="juz_number" className="text-right">رقم الجزء</Label>
                    <Input
                      id="juz_number"
                      type="number"
                      min="1"
                      max="30"
                      value={editFormData.juz_number || ''}
                      onChange={(e) => setEditFormData({...editFormData, juz_number: parseInt(e.target.value) || null})}
                      className="text-right"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="attempt_number" className="text-right">رقم المحاولة</Label>
                  <Input
                    id="attempt_number"
                    type="number"
                    min="1"
                    value={editFormData.attempt_number || 1}
                    onChange={(e) => setEditFormData({...editFormData, attempt_number: parseInt(e.target.value) || 1})}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exam_score" className="text-right">العلامة الكلية</Label>
                  <Input
                    id="exam_score"
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.exam_score || ''}
                    onChange={(e) => setEditFormData({...editFormData, exam_score: parseFloat(e.target.value) || null})}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="grade" className="text-right">التقييم</Label>
                  <Select 
                    value={editFormData.grade || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, grade: value})}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر التقييم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ممتاز">ممتاز</SelectItem>
                      <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                      <SelectItem value="جيد">جيد</SelectItem>
                      <SelectItem value="مقبول">مقبول</SelectItem>
                      <SelectItem value="إعادة">إعادة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tajweed_score" className="text-right">التجويد النظري (من 10)</Label>
                  <Input
                    id="tajweed_score"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={editFormData.tajweed_score || ''}
                    onChange={(e) => setEditFormData({...editFormData, tajweed_score: parseFloat(e.target.value) || null})}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="surah_memory_score" className="text-right">حفظ السور (من 10)</Label>
                  <Input
                    id="surah_memory_score"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={editFormData.surah_memory_score || ''}
                    onChange={(e) => setEditFormData({...editFormData, surah_memory_score: parseFloat(e.target.value) || null})}
                    className="text-right"
                  />
                </div>

                {examToEdit?.student_level === 'تلاوة' && (
                  <div className="grid gap-2">
                    <Label htmlFor="tafsir_score" className="text-right">التفسير (من 10)</Label>
                    <Input
                      id="tafsir_score"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={editFormData.tafsir_score || ''}
                      onChange={(e) => setEditFormData({...editFormData, tafsir_score: parseFloat(e.target.value) || null})}
                      className="text-right"
                    />
                  </div>
                )}

                {examToEdit?.student_level === 'حافظ' && (
                  <div className="grid gap-2">
                    <Label htmlFor="stability_score" className="text-right">الثبات (من 10)</Label>
                    <Input
                      id="stability_score"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={editFormData.stability_score || ''}
                      onChange={(e) => setEditFormData({...editFormData, stability_score: parseFloat(e.target.value) || null})}
                      className="text-right"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="text-right">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={editFormData.notes || ''}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    className="text-right min-h-[100px]"
                    placeholder="أضف ملاحظات إضافية..."
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button onClick={handleEditSave} className="bg-primary">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  هل أنت متأكد من حذف سجل الاختبار هذا؟ لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default ExamManagement;
