import { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  level?: string;
}

interface TodayWork {
  id: string;
  new_recitation_pages: number;
  new_recitation_page_numbers: string;
  new_recitation_grade: string;
  review_pages: number;
  review_page_numbers: string;
  review_grade: string;
  hadith_count: number;
  hadith_grade: string;
  behavior_grade: string;
  general_points: number;
  teacher_notes: string;
}

interface BeginnerRecitation {
  id: string;
  page_number: number;
  line_numbers: string;
  grade: string;
}

interface EditTodayWorkProps {
  students: Student[];
}

const EditTodayWork = ({ students }: EditTodayWorkProps) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [todayWork, setTodayWork] = useState<TodayWork | null>(null);
  const [beginnerRecitations, setBeginnerRecitations] = useState<BeginnerRecitation[]>([]);
  const [studentLevel, setStudentLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    new_recitation_pages: "",
    new_recitation_page_numbers: "",
    new_recitation_grade: "",
    review_pages: "",
    review_page_numbers: "",
    review_grade: "",
    hadith_count: "",
    hadith_grade: "",
    behavior_grade: "",
    general_points: "",
    teacher_notes: "",
  });
  const { toast } = useToast();

  const gradeOptions = [
    { value: "100", label: "ممتاز (100%)" },
    { value: "95", label: "ممتاز- (95%)" },
    { value: "90", label: "جيد جداً+ (90%)" },
    { value: "85", label: "جيد جداً (85%)" },
    { value: "80", label: "جيد جداً- (80%)" },
    { value: "75", label: "جيد+ (75%)" },
    { value: "70", label: "جيد (70%)" },
    { value: "65", label: "مقبول+ (65%)" },
    { value: "60", label: "مقبول (60%)" },
    { value: "إعادة", label: "إعادة" },
  ];

  const behaviorOptions = [
    { value: "ممتاز", label: "ممتاز" },
    { value: "جيد جداً", label: "جيد جداً" },
    { value: "جيد", label: "جيد" },
    { value: "مقبول", label: "مقبول" },
  ];

  useEffect(() => {
    if (selectedStudent) {
      fetchTodayWork();
    }
  }, [selectedStudent]);

  const fetchTodayWork = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // جلب معلومات الطالب
      const student = students.find(s => s.id === selectedStudent);
      setStudentLevel(student?.level || "");
      
      // جلب أعمال اليوم
      const { data, error } = await supabase
        .from('student_daily_work')
        .select('*')
        .eq('student_id', selectedStudent)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTodayWork(data);
        setFormData({
          new_recitation_pages: data.new_recitation_pages?.toString() || "",
          new_recitation_page_numbers: data.new_recitation_page_numbers || "",
          new_recitation_grade: data.new_recitation_grade || "",
          review_pages: data.review_pages?.toString() || "",
          review_page_numbers: data.review_page_numbers || "",
          review_grade: data.review_grade || "",
          hadith_count: data.hadith_count?.toString() || "",
          hadith_grade: data.hadith_grade || "",
          behavior_grade: data.behavior_grade || "",
          general_points: data.general_points?.toString() || "",
          teacher_notes: data.teacher_notes || "",
        });
      } else {
        setTodayWork(null);
        toast({
          title: "تنبيه",
          description: "لا يوجد عمل مسجل لهذا الطالب اليوم",
          variant: "destructive",
        });
      }

      // إذا كان الطالب تمهيدي، جلب التسميعات
      if (student?.level === 'تمهيدي') {
        const { data: recitationsData, error: recitationsError } = await supabase
          .from('student_beginner_recitations')
          .select('*')
          .eq('student_id', selectedStudent)
          .eq('date', today)
          .order('created_at', { ascending: true });

        if (recitationsError) throw recitationsError;
        setBeginnerRecitations(recitationsData || []);
      } else {
        setBeginnerRecitations([]);
      }
    } catch (error) {
      console.error('Error fetching today work:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات اليوم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!todayWork && studentLevel !== 'تمهيدي') {
      toast({
        title: "خطأ",
        description: "لا يوجد عمل لتعديله",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // تحديث أعمال اليوم العادية إذا وجدت
      if (todayWork) {
        // حساب عدد الصفحات من أرقام الصفحات
        const newRecitationCount = formData.new_recitation_page_numbers 
          ? formData.new_recitation_page_numbers.split(',').filter(p => p.trim()).length 
          : parseInt(formData.new_recitation_pages) || 0;
        
        const reviewCount = formData.review_page_numbers 
          ? formData.review_page_numbers.split(',').filter(p => p.trim()).length 
          : parseInt(formData.review_pages) || 0;

        const { error } = await supabase
          .from('student_daily_work')
          .update({
            new_recitation_pages: newRecitationCount,
            new_recitation_page_numbers: formData.new_recitation_page_numbers || null,
            new_recitation_grade: formData.new_recitation_grade,
            review_pages: reviewCount,
            review_page_numbers: formData.review_page_numbers || null,
            review_grade: formData.review_grade,
            hadith_count: parseInt(formData.hadith_count) || 0,
            hadith_grade: formData.hadith_grade,
            behavior_grade: formData.behavior_grade,
            general_points: parseInt(formData.general_points) || 0,
            teacher_notes: formData.teacher_notes,
          })
          .eq('id', todayWork.id);

        if (error) throw error;
      }

      // تحديث تسميعات التمهيدي
      if (studentLevel === 'تمهيدي') {
        for (const recitation of beginnerRecitations) {
          const { error } = await supabase
            .from('student_beginner_recitations')
            .update({
              page_number: recitation.page_number,
              line_numbers: recitation.line_numbers,
              grade: recitation.grade
            })
            .eq('id', recitation.id);

          if (error) throw error;
        }
      }

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات اليوم بنجاح",
      });

      setSelectedStudent("");
      setTodayWork(null);
      setBeginnerRecitations([]);
      setStudentLevel("");
      setFormData({
        new_recitation_pages: "",
        new_recitation_page_numbers: "",
        new_recitation_grade: "",
        review_pages: "",
        review_page_numbers: "",
        review_grade: "",
        hadith_count: "",
        hadith_grade: "",
        behavior_grade: "",
        general_points: "",
        teacher_notes: "",
      });
    } catch (error) {
      console.error('Error saving work:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التعديلات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedStudent("");
    setTodayWork(null);
    setBeginnerRecitations([]);
    setStudentLevel("");
    setFormData({
      new_recitation_pages: "",
      new_recitation_page_numbers: "",
      new_recitation_grade: "",
      review_pages: "",
      review_page_numbers: "",
      review_grade: "",
      hadith_count: "",
      hadith_grade: "",
      behavior_grade: "",
      general_points: "",
      teacher_notes: "",
    });
  };

  const handleBeginnerRecitationChange = (index: number, field: keyof BeginnerRecitation, value: any) => {
    const updated = [...beginnerRecitations];
    updated[index] = { ...updated[index], [field]: value };
    setBeginnerRecitations(updated);
  };

  return (
    <Card className="islamic-card">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-3">
          <Edit className="w-6 h-6 text-primary" />
          تعديل أعمال اليوم الحالي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">اختر الطالب</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="mt-2 bg-background">
                <SelectValue placeholder="اختر طالب لتعديل أعماله" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          )}

          {(todayWork || (studentLevel === 'تمهيدي' && beginnerRecitations.length > 0)) && !loading && (
            <div className="space-y-6">
              <Separator />
              
              {/* تسميعات التمهيدي */}
              {studentLevel === 'تمهيدي' && beginnerRecitations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary">تسميعات التمهيدي</h3>
                  {beginnerRecitations.map((recitation, index) => (
                    <Card key={recitation.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>رقم الصفحة</Label>
                          <Input
                            type="number"
                            value={recitation.page_number}
                            onChange={(e) => handleBeginnerRecitationChange(index, 'page_number', parseInt(e.target.value))}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>أرقام الأسطر</Label>
                          <Input
                            value={recitation.line_numbers}
                            onChange={(e) => handleBeginnerRecitationChange(index, 'line_numbers', e.target.value)}
                            placeholder="مثال: 1، 2، 3"
                            className="mt-2 text-right"
                          />
                        </div>
                        <div>
                          <Label>التقدير</Label>
                          <Select 
                            value={recitation.grade} 
                            onValueChange={(value) => handleBeginnerRecitationChange(index, 'grade', value)}
                          >
                            <SelectTrigger className="mt-2 bg-background">
                              <SelectValue placeholder="اختر التقدير" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              {gradeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Separator className="my-6" />
                </div>
              )}
              
              {studentLevel !== 'تمهيدي' && (
                <>
                  <div>
                    <Label>أرقام صفحات التسميع الجديد (مفصولة بفاصلة)</Label>
                    <Input
                      type="text"
                      value={formData.new_recitation_page_numbers}
                      onChange={(e) => setFormData({...formData, new_recitation_page_numbers: e.target.value})}
                      placeholder="مثال: 1, 2, 3"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      أدخل أرقام الصفحات مفصولة بفاصلة (مثال: 1, 2, 3)
                    </p>
                  </div>
                  
                  <div>
                    <Label>أرقام صفحات المراجعة (مفصولة بفاصلة)</Label>
                    <Input
                      type="text"
                      value={formData.review_page_numbers}
                      onChange={(e) => setFormData({...formData, review_page_numbers: e.target.value})}
                      placeholder="مثال: 10, 11, 12"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      أدخل أرقام الصفحات مفصولة بفاصلة (مثال: 10, 11, 12)
                    </p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>تقدير التسميع الجديد</Label>
                  <Select value={formData.new_recitation_grade} onValueChange={(value) => setFormData({...formData, new_recitation_grade: value})}>
                    <SelectTrigger className="mt-2 bg-background">
                      <SelectValue placeholder="اختر التقدير" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {gradeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تقدير المراجعة</Label>
                  <Select value={formData.review_grade} onValueChange={(value) => setFormData({...formData, review_grade: value})}>
                    <SelectTrigger className="mt-2 bg-background">
                      <SelectValue placeholder="اختر التقدير" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {gradeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>عدد الأحاديث</Label>
                  <Input
                    type="number"
                    value={formData.hadith_count}
                    onChange={(e) => setFormData({...formData, hadith_count: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>تقدير الأحاديث</Label>
                  <Select value={formData.hadith_grade} onValueChange={(value) => setFormData({...formData, hadith_grade: value})}>
                    <SelectTrigger className="mt-2 bg-background">
                      <SelectValue placeholder="اختر التقدير" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {gradeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>تقييم السلوك</Label>
                  <Select value={formData.behavior_grade} onValueChange={(value) => setFormData({...formData, behavior_grade: value})}>
                    <SelectTrigger className="mt-2 bg-background">
                      <SelectValue placeholder="اختر التقييم" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {behaviorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>النقاط العامة</Label>
                  <Input
                    type="number"
                    value={formData.general_points}
                    onChange={(e) => setFormData({...formData, general_points: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>ملاحظات المعلم</Label>
                <Input
                  value={formData.teacher_notes}
                  onChange={(e) => setFormData({...formData, teacher_notes: e.target.value})}
                  className="mt-2 text-right"
                  placeholder="أدخل ملاحظاتك..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  إلغاء
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditTodayWork;
