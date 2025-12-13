import { useState } from "react";
import { BookOpen, RotateCcw, Scroll, Heart, MessageSquare, Award, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  age: number;
  photo_url?: string;
  circle_id: string;
  level?: string;
}

interface AddStudentWorkProps {
  student: Student | null;
  onClose: () => void;
}

const AddStudentWork = ({ student, onClose }: AddStudentWorkProps) => {
  const [newRecitations, setNewRecitations] = useState([{ page: "", grade: "" }]);
  const [reviews, setReviews] = useState([{ part: "", grade: "" }]);
  const [hadiths, setHadiths] = useState([{ name: "", grade: "" }]);
  const [behavior, setBehavior] = useState("");
  const [notes, setNotes] = useState("");
  const [generalPoints, setGeneralPoints] = useState("");
  const [loading, setLoading] = useState(false);
  // للطلاب التمهيديين - تخزين أرقام الأسطر المحددة
  const [beginnerRecitations, setBeginnerRecitations] = useState([{ page: "", lineNumbers: [] as number[], grade: "" }]);
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
    { value: "ممتاز", label: "ممتاز", color: "text-green-600" },
    { value: "جيد جداً", label: "جيد جداً", color: "text-blue-600" },
    { value: "جيد", label: "جيد", color: "text-yellow-600" },
    { value: "مقبول", label: "مقبول", color: "text-gray-600" },
  ];

  const hadithOptions = [
    "حديث الأعمال بالنيات",
    "حديث جبريل عليه السلام", 
    "حديث بر الوالدين",
    "حديث الطهارة",
    "حديث الصلاة",
    "حديث الزكاة",
    "حديث الصيام",
    "حديث الحج",
    "حديث الذكر والدعاء",
    "حديث الأخلاق والآداب",
    "حديث الجهاد",
    "حديث التوبة",
  ];

  // Functions to manage dynamic arrays
  const addNewRecitation = () => {
    setNewRecitations([...newRecitations, { page: "", grade: "" }]);
  };

  const removeNewRecitation = (index: number) => {
    if (newRecitations.length > 1) {
      setNewRecitations(newRecitations.filter((_, i) => i !== index));
    }
  };

  const updateNewRecitation = (index: number, field: 'page' | 'grade', value: string) => {
    const updated = [...newRecitations];
    updated[index][field] = value;
    setNewRecitations(updated);
  };

  const addReview = () => {
    setReviews([...reviews, { part: "", grade: "" }]);
  };

  const removeReview = (index: number) => {
    if (reviews.length > 1) {
      setReviews(reviews.filter((_, i) => i !== index));
    }
  };

  const updateReview = (index: number, field: 'part' | 'grade', value: string) => {
    const updated = [...reviews];
    updated[index][field] = value;
    setReviews(updated);
  };

  const addHadith = () => {
    setHadiths([...hadiths, { name: "", grade: "" }]);
  };

  const removeHadith = (index: number) => {
    if (hadiths.length > 1) {
      setHadiths(hadiths.filter((_, i) => i !== index));
    }
  };

  const updateHadith = (index: number, field: 'name' | 'grade', value: string) => {
    const updated = [...hadiths];
    updated[index][field] = value;
    setHadiths(updated);
  };

  // Functions for beginner students
  const addBeginnerRecitation = () => {
    setBeginnerRecitations([...beginnerRecitations, { page: "", lineNumbers: [], grade: "" }]);
  };

  const removeBeginnerRecitation = (index: number) => {
    if (beginnerRecitations.length > 1) {
      setBeginnerRecitations(beginnerRecitations.filter((_, i) => i !== index));
    }
  };

  const updateBeginnerRecitation = (index: number, field: 'page' | 'grade', value: string) => {
    const updated = [...beginnerRecitations];
    if (field === 'page' || field === 'grade') {
      updated[index][field] = value;
    }
    setBeginnerRecitations(updated);
  };

  const toggleLineNumber = (index: number, lineNum: number) => {
    const updated = [...beginnerRecitations];
    const currentLines = updated[index].lineNumbers;
    if (currentLines.includes(lineNum)) {
      updated[index].lineNumbers = currentLines.filter(l => l !== lineNum);
    } else {
      updated[index].lineNumbers = [...currentLines, lineNum].sort((a, b) => a - b);
    }
    setBeginnerRecitations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد الطالب",
        variant: "destructive",
      });
      return;
    }

    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }
    
    const teacher = JSON.parse(teacherData);

    setLoading(true);

    try {
      // تحقق إذا كان الطالب تمهيدي
      if (student.level === 'تمهيدي') {
        // التحقق من أن جميع التسميعات لها تقدير
        const invalidRecitations = beginnerRecitations.filter(r => r.page && !r.grade);
        if (invalidRecitations.length > 0) {
          toast({
            title: "خطأ",
            description: "يجب إضافة التقدير لجميع الصفحات المدخلة",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // حفظ تسميع الطلاب التمهيديين
        // إذا لم يتم اختيار سطور، يتم حفظ الصفحة كاملة (10 أسطر)
        const beginnerData = beginnerRecitations.filter(r => r.page && r.grade).map(r => ({
          ...r,
          lineNumbers: r.lineNumbers.length > 0 ? r.lineNumbers : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }));
        
        if (beginnerData.length > 0) {
          const { error: beginnerError } = await supabase
            .from('student_beginner_recitations')
            .insert(
              beginnerData.map(r => ({
                student_id: student.id,
                page_number: parseInt(r.page),
                line_count: r.lineNumbers.length,
                line_numbers: r.lineNumbers.join(','),
                grade: r.grade,
              }))
            );

          if (beginnerError) throw beginnerError;

          // حفظ النقاط العامة والسلوك والملاحظات
          const today = new Date().toISOString().split('T')[0];
          const { data: existingWork, error: fetchError } = await supabase
            .from('student_daily_work')
            .select('*')
            .eq('student_id', student.id)
            .eq('date', today)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (existingWork) {
            const { error: workError } = await supabase
              .from('student_daily_work')
              .update({
                behavior_grade: behavior || existingWork.behavior_grade,
                general_points: (existingWork.general_points || 0) + (parseInt(generalPoints) || 0),
                teacher_notes: notes ? (existingWork.teacher_notes ? existingWork.teacher_notes + '\n' + notes : notes) : existingWork.teacher_notes,
              })
              .eq('id', existingWork.id);

            if (workError) throw workError;
          } else {
            const { error: workError } = await supabase
              .from('student_daily_work')
              .insert({
                student_id: student.id,
                behavior_grade: behavior,
                general_points: parseInt(generalPoints) || 0,
                teacher_notes: notes,
                new_recitation_pages: 0,
                review_pages: 0,
                hadith_count: 0,
              });

            if (workError) throw workError;
          }

          // حفظ النقاط للتسميع
          const pointsToSave = [];
          beginnerData.forEach((rec) => {
            const points = getPointsFromGrade(rec.grade);
            const linesText = rec.lineNumbers.length === 10
              ? 'الصفحة كاملة'
              : rec.lineNumbers.length === 1 
              ? `السطر ${rec.lineNumbers[0]}` 
              : `الأسطر ${rec.lineNumbers.join('، ')}`;
            pointsToSave.push({
              student_id: student.id,
              point_type: 'recitation',
              points: points,
              reason: `تسميع ${linesText} من صفحة ${rec.page}`,
              teacher_id: teacher.id,
            });
          });

          if (behavior) {
            const points = getBehaviorPoints(behavior);
            pointsToSave.push({
              student_id: student.id,
              point_type: 'behavior',
              points: points,
              reason: `تقييم السلوك: ${behavior}`,
              teacher_id: teacher.id,
            });
          }

          if (generalPoints) {
            pointsToSave.push({
              student_id: student.id,
              point_type: 'general',
              points: parseInt(generalPoints),
              reason: 'نقاط إضافية',
              teacher_id: teacher.id,
            });
          }

          if (pointsToSave.length > 0) {
            const { error: pointsError } = await supabase
              .from('student_points')
              .insert(pointsToSave);

            if (pointsError) throw pointsError;
          }
        }

        toast({
          title: "تم بنجاح",
          description: `تم حفظ أعمال الطالب ${student.name}`,
        });

        setBeginnerRecitations([{ page: "", lineNumbers: [], grade: "" }]);
        setBehavior("");
        setNotes("");
        setGeneralPoints("");
        onClose();
        setLoading(false);
        return;
      }

      // التحقق من أن جميع التسميعات لها تقدير
      const invalidNewRecitations = newRecitations.filter(r => r.page && !r.grade);
      if (invalidNewRecitations.length > 0) {
        toast({
          title: "خطأ",
          description: "يجب إضافة التقدير لجميع صفحات التسميع الجديد",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // التحقق من أن جميع المراجعات لها تقدير
      const invalidReviews = reviews.filter(r => r.part && !r.grade);
      if (invalidReviews.length > 0) {
        toast({
          title: "خطأ",
          description: "يجب إضافة التقدير لجميع أجزاء المراجعة",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // التحقق من أن جميع الأحاديث لها تقدير
      const invalidHadiths = hadiths.filter(h => h.name && !h.grade);
      if (invalidHadiths.length > 0) {
        toast({
          title: "خطأ",
          description: "يجب إضافة التقدير لجميع الأحاديث",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calculate total pages and prepare page numbers for non-beginner students
      const validNewRecitations = newRecitations.filter(r => r.page && r.grade);
      const validReviews = reviews.filter(r => r.part && r.grade);
      const totalHadiths = hadiths.filter(h => h.name && h.grade).length;
      
      // تجميع أرقام الصفحات كنص مفصول بفواصل
      const newPageNumbers = validNewRecitations.map(r => r.page).join(',');
      const reviewPageNumbers = validReviews.map(r => r.part).join(',');

      // Check if there's existing work for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingWork, error: fetchError } = await supabase
        .from('student_daily_work')
        .select('*')
        .eq('student_id', student.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingWork) {
        // Update existing record by adding page numbers
        const existingNewPages = existingWork.new_recitation_page_numbers ? existingWork.new_recitation_page_numbers.split(',') : [];
        const existingReviewPages = existingWork.review_page_numbers ? existingWork.review_page_numbers.split(',') : [];
        
        const updatedNewPages = newPageNumbers ? [...existingNewPages, ...newPageNumbers.split(',')].join(',') : existingNewPages.join(',');
        const updatedReviewPages = reviewPageNumbers ? [...existingReviewPages, ...reviewPageNumbers.split(',')].join(',') : existingReviewPages.join(',');
        
        const { error: workError } = await supabase
          .from('student_daily_work')
          .update({
            new_recitation_pages: (existingWork.new_recitation_pages || 0) + validNewRecitations.length,
            new_recitation_grade: validNewRecitations.length > 0 ? validNewRecitations[0].grade : existingWork.new_recitation_grade,
            new_recitation_page_numbers: updatedNewPages,
            review_pages: (existingWork.review_pages || 0) + validReviews.length,
            review_grade: validReviews.length > 0 ? validReviews[0].grade : existingWork.review_grade,
            review_page_numbers: updatedReviewPages,
            hadith_count: (existingWork.hadith_count || 0) + totalHadiths,
            hadith_grade: hadiths.find(h => h.grade)?.grade || existingWork.hadith_grade,
            behavior_grade: behavior || existingWork.behavior_grade,
            general_points: (existingWork.general_points || 0) + (parseInt(generalPoints) || 0),
            teacher_notes: notes ? (existingWork.teacher_notes ? existingWork.teacher_notes + '\n' + notes : notes) : existingWork.teacher_notes,
          })
          .eq('id', existingWork.id);

        if (workError) throw workError;
      } else {
        // Insert new record
        const { error: workError } = await supabase
          .from('student_daily_work')
          .insert({
            student_id: student.id,
            new_recitation_pages: validNewRecitations.length,
            new_recitation_grade: validNewRecitations.length > 0 ? validNewRecitations[0].grade : '',
            new_recitation_page_numbers: newPageNumbers,
            review_pages: validReviews.length,
            review_grade: validReviews.length > 0 ? validReviews[0].grade : '',
            review_page_numbers: reviewPageNumbers,
            hadith_count: totalHadiths,
            hadith_grade: hadiths.find(h => h.grade)?.grade || '',
            behavior_grade: behavior,
            general_points: parseInt(generalPoints) || 0,
            teacher_notes: notes,
          });

        if (workError) throw workError;
      }

      // Save points for each category
      const pointsToSave = [];
      
      // Points for new recitations
      newRecitations.forEach((recitation, index) => {
        if (recitation.page && recitation.grade) {
          const points = getPointsFromGrade(recitation.grade);
          pointsToSave.push({
            student_id: student.id,
            point_type: 'recitation',
            points: points,
            reason: `تسميع صفحة ${recitation.page}`,
            teacher_id: teacher.id,
          });
        }
      });

      // Points for reviews
      reviews.forEach((review, index) => {
        if (review.part && review.grade) {
          const points = getPointsFromGrade(review.grade);
          pointsToSave.push({
            student_id: student.id,
            point_type: 'review',
            points: points,
            reason: `مراجعة الجزء ${review.part}`,
            teacher_id: teacher.id,
          });
        }
      });

      // Points for hadiths
      hadiths.forEach((hadith, index) => {
        if (hadith.name && hadith.grade) {
          const points = getPointsFromGrade(hadith.grade);
          pointsToSave.push({
            student_id: student.id,
            point_type: 'hadith',
            points: points,
            reason: hadith.name,
            teacher_id: teacher.id,
          });
        }
      });

      if (behavior) {
        const points = getBehaviorPoints(behavior);
        pointsToSave.push({
          student_id: student.id,
          point_type: 'behavior',
          points: points,
          reason: `تقييم السلوك: ${behavior}`,
          teacher_id: teacher.id,
        });
      }

      if (generalPoints) {
        pointsToSave.push({
          student_id: student.id,
          point_type: 'general',
          points: parseInt(generalPoints),
          reason: 'نقاط إضافية',
          teacher_id: teacher.id,
        });
      }

      if (pointsToSave.length > 0) {
        const { error: pointsError } = await supabase
          .from('student_points')
          .insert(pointsToSave);

        if (pointsError) throw pointsError;
      }

      toast({
        title: "تم بنجاح",
        description: `تم حفظ أعمال الطالب ${student.name}`,
      });
      
      // Reset form
      setNewRecitations([{ page: "", grade: "" }]);
      setReviews([{ part: "", grade: "" }]);
      setHadiths([{ name: "", grade: "" }]);
      setBehavior("");
      setNotes("");
      setGeneralPoints("");
      
      onClose();
    } catch (error) {
      console.error('Error saving student work:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ أعمال الطالب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPointsFromGrade = (grade: string): number => {
    switch (grade) {
      case '100': return 100;
      case '95': return 95;
      case '90': return 90;
      case '85': return 85;
      case '80': return 80;
      case '75': return 75;
      case '70': return 70;
      case '65': return 65;
      case '60': return 60;
      case 'إعادة': return 0;
      default: return 0;
    }
  };

  const getBehaviorPoints = (behavior: string): number => {
    switch (behavior) {
      case 'ممتاز': return 20;
      case 'جيد جداً': return 15;
      case 'جيد': return 10;
      case 'مقبول': return 5;
      default: return 0;
    }
  };

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لم يتم تحديد الطالب</p>
      </div>
    );
  }

  // واجهة خاصة للطلاب التمهيديين
  if (student.level === 'تمهيدي') {
    return (
      <div className="space-y-4">
        {/* Student Info */}
        <div className="islamic-card p-4 bg-primary/5 border border-primary/20">
          <h4 className="text-lg font-bold text-primary mb-2">بيانات الطالب (تمهيدي)</h4>
          <p className="text-foreground font-semibold">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.age} سنة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* تسميع الأسطر */}
          <Card className="islamic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">التسميع الجديد</h3>
              </div>
              <Button
                type="button"
                onClick={addBeginnerRecitation}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تسميع
              </Button>
            </div>
            
            <div className="space-y-4">
              {beginnerRecitations.map((recitation, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label className="text-base font-semibold text-foreground">
                        رقم الصفحة
                      </Label>
                      <Input
                        type="number"
                        placeholder="رقم الصفحة"
                        value={recitation.page}
                        onChange={(e) => updateBeginnerRecitation(index, 'page', e.target.value)}
                        className="mt-1"
                        min="1"
                        max="604"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-semibold text-foreground">
                        التقييم
                      </Label>
                      <Select 
                        value={recitation.grade} 
                        onValueChange={(value) => updateBeginnerRecitation(index, 'grade', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="اختر التقييم" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {beginnerRecitations.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeBeginnerRecitation(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-2 block">
                      اختر أرقام الأسطر (كل صفحة 10 أسطر)
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lineNum) => (
                        <Button
                          key={lineNum}
                          type="button"
                          variant={recitation.lineNumbers.includes(lineNum) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleLineNumber(index, lineNum)}
                          className={recitation.lineNumbers.includes(lineNum) ? "bg-primary text-primary-foreground" : ""}
                        >
                          {lineNum}
                        </Button>
                      ))}
                    </div>
                    {recitation.lineNumbers.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        الأسطر المحددة: {recitation.lineNumbers.join('، ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* النقاط العامة */}
          <Card className="islamic-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">النقاط العامة</h3>
            </div>
            
            <div>
              <Label htmlFor="generalPoints" className="text-base font-semibold text-foreground">
                عدد النقاط الإضافية
              </Label>
              <Input
                id="generalPoints"
                type="number"
                placeholder="عدد النقاط"
                value={generalPoints}
                onChange={(e) => setGeneralPoints(e.target.value)}
                className="mt-1"
                min="0"
                max="50"
              />
            </div>
          </Card>

          {/* تقييم السلوك */}
          <Card className="islamic-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">تقييم السلوك</h3>
            </div>
            
            <Select value={behavior} onValueChange={setBehavior}>
              <SelectTrigger>
                <SelectValue placeholder="اختر تقييم السلوك (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                {behaviorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* الملاحظات */}
          <Card className="islamic-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/20 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-accent">ملاحظات الأستاذ</h3>
            </div>
            
            <Textarea
              placeholder="أضف ملاحظاتك هنا..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? "جاري الحفظ..." : "حفظ الأعمال"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Student Info */}
      <div className="islamic-card p-4 bg-primary/5 border border-primary/20">
        <h4 className="text-lg font-bold text-primary mb-2">بيانات الطالب</h4>
        <p className="text-foreground font-semibold">{student.name}</p>
        <p className="text-sm text-muted-foreground">{student.age} سنة</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* تسميع جديد */}
      <Card className="islamic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary">التسميع الجديد</h3>
          </div>
          <Button
            type="button"
            onClick={addNewRecitation}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة صفحة
          </Button>
        </div>
        
        <div className="space-y-4">
          {newRecitations.map((recitation, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  رقم الصفحة {index + 1}
                </Label>
                <Input
                  type="number"
                  placeholder="رقم الصفحة"
                  value={recitation.page}
                  onChange={(e) => updateNewRecitation(index, 'page', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  التقييم
                </Label>
                <Select 
                  value={recitation.grade} 
                  onValueChange={(value) => updateNewRecitation(index, 'grade', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newRecitations.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeNewRecitation(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {newRecitations.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            لا يوجد تسميع جديد اليوم
          </p>
        )}
      </Card>

      {/* المراجعة */}
      <Card className="islamic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-3 rounded-full">
              <RotateCcw className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-secondary">المراجعة</h3>
          </div>
          <Button
            type="button"
            onClick={addReview}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة جزء
          </Button>
        </div>
        
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  رقم الجزء {index + 1}
                </Label>
                <Input
                  type="number"
                  placeholder="رقم الجزء"
                  value={review.part}
                  onChange={(e) => updateReview(index, 'part', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  التقييم
                </Label>
                <Select 
                  value={review.grade} 
                  onValueChange={(value) => updateReview(index, 'grade', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {reviews.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeReview(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {reviews.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            لا توجد مراجعة اليوم
          </p>
        )}
      </Card>

      {/* الحديث */}
      <Card className="islamic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-full">
              <Scroll className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-accent">الحديث النبوي الشريف</h3>
          </div>
          <Button
            type="button"
            onClick={addHadith}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة حديث
          </Button>
        </div>
        
        <div className="space-y-4">
          {hadiths.map((hadith, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  الحديث {index + 1}
                </Label>
                <Select 
                  value={hadith.name} 
                  onValueChange={(value) => updateHadith(index, 'name', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر الحديث" />
                  </SelectTrigger>
                  <SelectContent>
                    {hadithOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-foreground">
                  التقييم
                </Label>
                <Select 
                  value={hadith.grade} 
                  onValueChange={(value) => updateHadith(index, 'grade', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hadiths.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeHadith(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {hadiths.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            لا يوجد أحاديث اليوم
          </p>
        )}
      </Card>

      <Separator className="my-6" />

      {/* النقاط العامة */}
      <Card className="islamic-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/20 p-3 rounded-full">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-primary">النقاط العامة</h3>
        </div>
        
        <div>
          <Label htmlFor="generalPoints" className="text-base font-semibold text-foreground">
            عدد النقاط الإضافية
          </Label>
          <Input
            id="generalPoints"
            type="number"
            placeholder="عدد النقاط"
            value={generalPoints}
            onChange={(e) => setGeneralPoints(e.target.value)}
            className="mt-1"
            min="0"
            max="50"
          />
          <p className="text-sm text-muted-foreground mt-1">
            نقاط إضافية للمشاركة والأنشطة (الحد الأقصى 50 نقطة)
          </p>
        </div>
      </Card>

      {/* تقييم السلوك */}
      <Card className="islamic-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-secondary/20 p-3 rounded-full">
            <Heart className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-secondary">تقييم السلوك</h3>
        </div>
        
        <Select value={behavior} onValueChange={setBehavior}>
          <SelectTrigger>
            <SelectValue placeholder="اختر تقييم السلوك (اختياري)" />
          </SelectTrigger>
          <SelectContent>
            {behaviorOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <span className={option.color}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* الملاحظات */}
      <Card className="islamic-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent/20 p-3 rounded-full">
            <MessageSquare className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-accent">ملاحظات الأستاذ</h3>
        </div>
        
        <Textarea
          placeholder="أضف ملاحظاتك هنا..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? "جاري الحفظ..." : "حفظ الأعمال"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-8"
        >
          إلغاء
        </Button>
      </div>
      </form>
    </div>
  );
};

export default AddStudentWork;