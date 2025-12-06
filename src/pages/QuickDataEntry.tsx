import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw, User, UserCheck, UserX, Plus } from "lucide-react";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Student {
  id: string;
  name: string;
  level: string;
}

interface BeginnerRecitation {
  pageNumber: string;
  selectedLines: number[];
  grade: string;
}

interface RegularRecitation {
  pageNumbers: string; // أرقام الصفحات مفصولة بفواصل (مثل: 201,202,203)
  grade: string;
}

interface StudentData {
  // للطلاب العاديين - دعم صفحات متعددة
  regularRecitations: RegularRecitation[];
  reviewPages: string;
  reviewGrade: string;
  behaviorGrade: string;
  notes: string;
  // للطلاب التمهيديين - دعم صفحات متعددة
  beginnerRecitations: BeginnerRecitation[];
  // الحضور
  attendance: 'present' | 'absent' | null;
}

const QuickDataEntry = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentData, setStudentData] = useState<Record<string, StudentData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTodayData, setLoadingTodayData] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // حفظ تلقائي في LocalStorage
  useEffect(() => {
    if (Object.keys(studentData).length > 0) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`quickEntry_${today}`, JSON.stringify(studentData));
    }
  }, [studentData]);

  // استرجاع البيانات من LocalStorage عند التحميل
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`quickEntry_${today}`);
    if (savedData && Object.keys(studentData).length > 0) {
      try {
        const parsed = JSON.parse(savedData);
        // دمج البيانات المحفوظة مع البيانات الحالية
        setStudentData(prev => {
          const merged = { ...prev };
          Object.keys(parsed).forEach(key => {
            if (merged[key]) {
              merged[key] = { ...merged[key], ...parsed[key] };
            }
          });
          return merged;
        });
        toast({
          title: "تم استرجاع البيانات",
          description: "تم استرجاع البيانات المحفوظة مسبقاً",
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) return;
      
      const teacher = JSON.parse(teacherData);

      const { data: circles } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id);

      const circleIds = circles?.map(c => c.id) || [];

      const { data, error } = await supabase
        .from('students')
        .select('id, name, level')
        .in('circle_id', circleIds)
        .order('name');

      if (error) throw error;

      // استثناء المنقطعين
      const { data: discontinuedStudents } = await supabase
        .from('discontinued_students')
        .select('id');
      
      const discontinuedIds = new Set(discontinuedStudents?.map(s => s.id) || []);
      const activeStudents = data?.filter(s => !discontinuedIds.has(s.id)) || [];

      setStudents(activeStudents);

      // تهيئة البيانات وجلب الحضور اليوم
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('student_id, status')
        .eq('date', today)
        .in('student_id', activeStudents.map(s => s.id));

      const attendanceMap = new Map(attendanceData?.map(a => [a.student_id, a.status]) || []);

      const initialData: Record<string, StudentData> = {};
      activeStudents.forEach(student => {
        initialData[student.id] = {
          regularRecitations: [{ pageNumbers: '', grade: '' }],
          reviewPages: '',
          reviewGrade: '',
          behaviorGrade: '',
          notes: '',
          beginnerRecitations: [{ pageNumber: '', selectedLines: [], grade: '' }],
          attendance: attendanceMap.get(student.id) as 'present' | 'absent' | null || null
        };
      });
      setStudentData(initialData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTodayData = async () => {
    setLoadingTodayData(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // جلب بيانات اليوم للطلاب العاديين
      const { data: dailyWorkData } = await supabase
        .from('student_daily_work')
        .select('*')
        .eq('date', today)
        .in('student_id', students.map(s => s.id));

      // جلب بيانات التمهيديين
      const { data: beginnerData } = await supabase
        .from('student_beginner_recitations')
        .select('*')
        .eq('date', today)
        .in('student_id', students.map(s => s.id));

      const updatedData = { ...studentData };

      students.forEach(student => {
        const work = dailyWorkData?.find(w => w.student_id === student.id);
        
        if (student.level === 'تمهيدي') {
          const studentBeginnerWork = beginnerData?.filter(b => b.student_id === student.id) || [];
          
          if (studentBeginnerWork.length > 0) {
            updatedData[student.id].beginnerRecitations = studentBeginnerWork.map(b => ({
              pageNumber: b.page_number.toString(),
              selectedLines: b.line_numbers ? b.line_numbers.split(',').map((n: string) => parseInt(n.trim())) : [],
              grade: b.grade || ''
            }));
          }
          
          if (work) {
            updatedData[student.id].behaviorGrade = work.behavior_grade || '';
            updatedData[student.id].notes = work.teacher_notes || '';
          }
        } else {
          if (work) {
            // تحويل أرقام الصفحات إلى تسميعات
            if (work.new_recitation_page_numbers) {
              updatedData[student.id].regularRecitations = [{
                pageNumbers: work.new_recitation_page_numbers,
                grade: work.new_recitation_grade || ''
              }];
            }
            
            updatedData[student.id].reviewPages = work.review_pages?.toString() || '';
            updatedData[student.id].reviewGrade = work.review_grade || '';
            updatedData[student.id].behaviorGrade = work.behavior_grade || '';
            updatedData[student.id].notes = work.teacher_notes || '';
          }
        }
      });

      setStudentData(updatedData);

      toast({
        title: "تم التحميل",
        description: "تم تحميل بيانات اليوم بنجاح",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات اليوم",
        variant: "destructive",
      });
    } finally {
      setLoadingTodayData(false);
    }
  };

  const updateStudentData = (studentId: string, field: keyof StudentData, value: string | number[]) => {
    setStudentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  // للطلاب العاديين
  const addRegularRecitation = (studentId: string) => {
    setStudentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        regularRecitations: [
          ...prev[studentId].regularRecitations,
          { pageNumbers: '', grade: '' }
        ]
      }
    }));
  };

  const removeRegularRecitation = (studentId: string, index: number) => {
    setStudentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        regularRecitations: prev[studentId].regularRecitations.filter((_, i) => i !== index)
      }
    }));
  };

  const updateRegularRecitation = (studentId: string, index: number, field: keyof RegularRecitation, value: any) => {
    setStudentData(prev => {
      const updated = [...prev[studentId].regularRecitations];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          regularRecitations: updated
        }
      };
    });
  };

  // للطلاب التمهيديين
  const addBeginnerRecitation = (studentId: string) => {
    setStudentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        beginnerRecitations: [
          ...prev[studentId].beginnerRecitations,
          { pageNumber: '', selectedLines: [], grade: '' }
        ]
      }
    }));
  };

  const removeBeginnerRecitation = (studentId: string, index: number) => {
    setStudentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        beginnerRecitations: prev[studentId].beginnerRecitations.filter((_, i) => i !== index)
      }
    }));
  };

  const updateBeginnerRecitation = (studentId: string, index: number, field: keyof BeginnerRecitation, value: any) => {
    setStudentData(prev => {
      const updated = [...prev[studentId].beginnerRecitations];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          beginnerRecitations: updated
        }
      };
    });
  };

  const toggleLineNumber = (studentId: string, recitationIndex: number, lineNum: number) => {
    setStudentData(prev => {
      const updated = [...prev[studentId].beginnerRecitations];
      const currentLines = updated[recitationIndex].selectedLines;
      updated[recitationIndex].selectedLines = currentLines.includes(lineNum)
        ? currentLines.filter(l => l !== lineNum)
        : [...currentLines, lineNum].sort((a, b) => a - b);
      
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          beginnerRecitations: updated
        }
      };
    });
  };

  const handleAttendance = async (studentId: string, status: 'present' | 'absent') => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) throw new Error('يجب تسجيل الدخول');
      
      const teacher = JSON.parse(teacherData);
      const today = new Date().toISOString().split('T')[0];

      await supabase
        .from('student_attendance')
        .upsert({
          student_id: studentId,
          status: status,
          teacher_id: teacher.id,
          date: today,
        });

      // تحديث الحالة المحلية
      setStudentData(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          attendance: status
        }
      }));

      // إدارة نقاط الحماسة
      if (status === 'present') {
        const { data: existingPoints } = await supabase
          .from('student_points')
          .select('*')
          .eq('student_id', studentId)
          .eq('date', today)
          .eq('point_type', 'enthusiasm')
          .maybeSingle();

        if (!existingPoints) {
          await supabase
            .from('student_points')
            .insert({
              student_id: studentId,
              date: today,
              point_type: 'enthusiasm',
              points: 1,
              reason: 'حضور'
            });
        }
      } else if (status === 'absent') {
        await supabase
          .from('student_points')
          .delete()
          .eq('student_id', studentId)
          .eq('point_type', 'enthusiasm');
      }

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الحضور",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      const teacher = JSON.parse(teacherData);
      const today = new Date().toISOString().split('T')[0];

      // التحقق من التقديرات الإجبارية
      const missingGrades: string[] = [];
      for (const student of students) {
        const data = studentData[student.id];
        if (!data) continue;

        if (student.level === 'تمهيدي') {
          const hasRecitationWithoutGrade = data.beginnerRecitations.some(
            rec => rec.pageNumber && !rec.grade
          );
          if (hasRecitationWithoutGrade) {
            missingGrades.push(student.name);
          }
        } else {
          const hasRecitationWithoutGrade = data.regularRecitations.some(
            rec => rec.pageNumbers && !rec.grade
          );
          if (hasRecitationWithoutGrade) {
            missingGrades.push(student.name);
          }
        }
      }

      if (missingGrades.length > 0) {
        toast({
          title: "تقديرات مفقودة",
          description: `يجب إضافة تقدير التسميع للطلاب: ${missingGrades.join(', ')}`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      let savedCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          const data = studentData[student.id];
          
          if (!data) continue;
        
        if (student.level === 'تمهيدي') {
          // معالجة الطلاب التمهيديين - دعم صفحات متعددة
          const validRecitations = data.beginnerRecitations.filter(
            rec => rec.pageNumber && rec.grade
          );
          
          if (validRecitations.length > 0 || data.behaviorGrade || data.notes) {
            // حذف التسميعات القديمة لنفس اليوم
            await supabase
              .from('student_beginner_recitations')
              .delete()
              .eq('student_id', student.id)
              .eq('date', today);

            // حفظ كل صفحة
            for (const rec of validRecitations) {
              const lineNumbers = rec.selectedLines.length > 0 ? rec.selectedLines.join(',') : '1,2,3,4,5,6,7,8,9,10';
              const lineCount = rec.selectedLines.length > 0 ? rec.selectedLines.length : 10;
              
              const { error: insertError } = await supabase
                .from('student_beginner_recitations')
                .insert({
                  student_id: student.id,
                  date: today,
                  page_number: parseInt(rec.pageNumber),
                  line_numbers: lineNumbers,
                  line_count: lineCount,
                  grade: rec.grade
                });

              if (insertError) {
                console.error('Error inserting beginner recitation:', insertError);
                throw insertError;
              }
            }

            // حفظ السلوك والملاحظات
            const { data: existingWork } = await supabase
              .from('student_daily_work')
              .select('*')
              .eq('student_id', student.id)
              .eq('date', today)
              .maybeSingle();

            if (existingWork) {
              const { error: updateError } = await supabase
                .from('student_daily_work')
                .update({
                  behavior_grade: data.behaviorGrade || existingWork.behavior_grade,
                  teacher_notes: data.notes ? 
                    (existingWork.teacher_notes ? existingWork.teacher_notes + '\n' + data.notes : data.notes) : 
                    existingWork.teacher_notes,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingWork.id);

              if (updateError) {
                console.error('Error updating daily work:', updateError);
                throw updateError;
              }
            } else if (data.behaviorGrade || data.notes) {
              const { error: insertError } = await supabase
                .from('student_daily_work')
                .insert({
                  student_id: student.id,
                  date: today,
                  behavior_grade: data.behaviorGrade || null,
                  teacher_notes: data.notes || null,
                  new_recitation_pages: 0,
                  review_pages: 0,
                });

              if (insertError) {
                console.error('Error inserting daily work:', insertError);
                throw insertError;
              }
            }

            // تسجيل الحضور تلقائياً للطالب التمهيدي
            if (data.attendance !== 'absent') {
              await supabase
                .from('student_attendance')
                .upsert({
                  student_id: student.id,
                  status: 'present',
                  teacher_id: teacher.id,
                  date: today,
                });

              // إضافة نقطة حماسة إذا لم تكن موجودة
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
            }

            savedCount++;
          }
        } else {
          // معالجة الطلاب العاديين - دعم صفحات متعددة
          const validRecitations = data.regularRecitations?.filter(
            rec => rec.pageNumbers && rec.grade
          ) || [];
          
          const hasOtherData = (student.level === 'حافظ' && data.reviewPages ? data.reviewPages.trim() : false) || data.reviewGrade || data.behaviorGrade || data.notes;

          if (validRecitations.length === 0 && !hasOtherData) continue;

          const { data: existingWork } = await supabase
            .from('student_daily_work')
            .select('*')
            .eq('student_id', student.id)
            .eq('date', today)
            .maybeSingle();

          // حساب عدد الصفحات من أرقام الصفحات
          let totalPages = 0;
          let allPageNumbers: string[] = [];
          
          validRecitations.forEach(rec => {
            const pages = rec.pageNumbers.split(',').map(p => p.trim()).filter(p => p);
            totalPages += pages.length;
            allPageNumbers = [...allPageNumbers, ...pages];
          });

          const lastGrade = validRecitations.length > 0 ? validRecitations[validRecitations.length - 1].grade : null;
          const pageNumbersString = allPageNumbers.join(',');

          if (existingWork) {
            // إضافة البيانات الجديدة إلى البيانات الموجودة
            const existingPages = existingWork.new_recitation_page_numbers ? 
              existingWork.new_recitation_page_numbers.split(',').filter((p: string) => p.trim()) : [];
            const combinedPages = [...existingPages, ...allPageNumbers].join(',');

            const existingReviewPages = existingWork.review_pages || 0;
            const newReviewPages = student.level === 'حافظ' && data.reviewPages ? 
              data.reviewPages.split(',').filter(p => p.trim()).length : 0;

            const { error: updateError } = await supabase
              .from('student_daily_work')
              .update({
                new_recitation_pages: (existingWork.new_recitation_pages || 0) + totalPages,
                new_recitation_page_numbers: combinedPages,
                new_recitation_grade: lastGrade || existingWork.new_recitation_grade,
                review_pages: existingReviewPages + newReviewPages,
                review_grade: data.reviewGrade || existingWork.review_grade,
                behavior_grade: data.behaviorGrade || existingWork.behavior_grade,
                teacher_notes: data.notes ? 
                  (existingWork.teacher_notes ? existingWork.teacher_notes + '\n' + data.notes : data.notes) : 
                  existingWork.teacher_notes,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingWork.id);

            if (updateError) {
              console.error('Error updating daily work:', updateError);
              throw updateError;
            }
          } else {
            const { error: insertError } = await supabase
              .from('student_daily_work')
              .insert({
                student_id: student.id,
                date: today,
                new_recitation_pages: totalPages,
                new_recitation_page_numbers: pageNumbersString,
                new_recitation_grade: lastGrade,
                review_pages: student.level === 'حافظ' && data.reviewPages ? 
                  data.reviewPages.split(',').filter(p => p.trim()).length : 0,
                review_grade: data.reviewGrade || null,
                behavior_grade: data.behaviorGrade || null,
                teacher_notes: data.notes || null,
              });

            if (insertError) {
              console.error('Error inserting daily work:', insertError);
              throw insertError;
            }
          }

          // تسجيل الحضور تلقائياً للطالب العادي
          if (data.attendance !== 'absent') {
            await supabase
              .from('student_attendance')
              .upsert({
                student_id: student.id,
                status: 'present',
                teacher_id: teacher.id,
                date: today,
              });

            // إضافة نقطة حماسة إذا لم تكن موجودة
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
          }

          savedCount++;
        }
        } catch (studentError: any) {
          console.error(`Error saving data for student ${student.name}:`, studentError);
          console.error('Error details:', studentError.message, studentError.details, studentError.hint);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "تم الحفظ بنجاح",
          description: errorCount > 0 ? 
            `تم حفظ ${savedCount} طالب، فشل ${errorCount}` : 
            `تم حفظ بيانات ${savedCount} طالب`,
        });

        // مسح البيانات المحفوظة من LocalStorage فقط عند النجاح
        localStorage.removeItem(`quickEntry_${today}`);

        // إعادة تعيين النموذج وتحديث حالة الحضور فقط عند النجاح
        const resetData: Record<string, StudentData> = {};
        students.forEach(student => {
          const currentData = studentData[student.id];
          // إذا لم يكن غائباً وتم حفظ بياناته، نعتبره حاضراً
          const wasDataSaved = student.level === 'تمهيدي' 
            ? currentData?.beginnerRecitations.some(rec => rec.pageNumber && rec.grade) || currentData?.behaviorGrade || currentData?.notes
            : currentData?.regularRecitations.some(rec => rec.pageNumbers && rec.grade) || currentData?.reviewPages || currentData?.behaviorGrade || currentData?.notes;
          
          const newAttendance = currentData?.attendance === 'absent' 
            ? 'absent' 
            : (wasDataSaved ? 'present' : currentData?.attendance || null);

          resetData[student.id] = {
            regularRecitations: [{ pageNumbers: '', grade: '' }],
            reviewPages: '',
            reviewGrade: '',
            behaviorGrade: '',
            notes: '',
            beginnerRecitations: [{ pageNumber: '', selectedLines: [], grade: '' }],
            attendance: newAttendance
          };
        });
        setStudentData(resetData);
      } else if (errorCount > 0) {
        toast({
          title: "خطأ",
          description: `فشل في حفظ بيانات ${errorCount} طالب`,
          variant: "destructive",
        });
        // لا نحذف البيانات عند الفشل
      } else {
        toast({
          title: "تنبيه",
          description: "لا توجد بيانات للحفظ",
        });
      }

    } catch (error: any) {
      console.error('Error in handleSave:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const grades = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'إعادة'];
  const behaviorGrades = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول'];

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <TeacherNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <Card className="islamic-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">إدخال البيانات السريع</h1>
                <p className="text-muted-foreground">أدخل بيانات جميع الطلاب في جدول واحد</p>
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Button onClick={loadTodayData} variant="secondary" disabled={loadingTodayData || loading}>
                  <RefreshCw className={`w-4 h-4 ml-2 ${loadingTodayData ? 'animate-spin' : ''}`} />
                  {loadingTodayData ? 'جاري التحميل...' : 'تحميل بيانات اليوم'}
                </Button>
                <Button onClick={fetchStudents} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                  إعادة تعيين
                </Button>
                <Button onClick={handleSave} disabled={saving} size="lg">
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ الكل'}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : isMobile ? (
              // عرض الموبايل - كروت
              <div className="space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="p-4 border-2 hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-primary">{student.name}</h3>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={studentData[student.id]?.attendance === 'present' ? "default" : "outline"}
                          onClick={() => handleAttendance(student.id, 'present')}
                          className={studentData[student.id]?.attendance === 'present' ? 
                            "bg-green-600 hover:bg-green-700" : 
                            "border-green-600 text-green-600 hover:bg-green-50"
                          }
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={studentData[student.id]?.attendance === 'absent' ? "destructive" : "outline"}
                          onClick={() => handleAttendance(student.id, 'absent')}
                          className={studentData[student.id]?.attendance === 'absent' ? 
                            "" : 
                            "border-red-600 text-red-600 hover:bg-red-50"
                          }
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {student.level === 'تمهيدي' ? (
                        // حقول الطلاب التمهيديين - صفحات متعددة
                        <>
                          {studentData[student.id]?.beginnerRecitations.map((rec, index) => (
                            <Card key={index} className="p-3 bg-muted/30">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-bold">صفحة {index + 1}</Label>
                                {studentData[student.id].beginnerRecitations.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBeginnerRecitation(student.id, index)}
                                    className="h-7 text-destructive"
                                  >
                                    حذف
                                  </Button>
                                )}
                              </div>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs mb-1">رقم الصفحة</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="رقم"
                                      value={rec.pageNumber}
                                      onChange={(e) => updateBeginnerRecitation(student.id, index, 'pageNumber', e.target.value)}
                                      className="text-center h-9"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs mb-1">التقييم</Label>
                                    <Select
                                      value={rec.grade}
                                      onValueChange={(value) => updateBeginnerRecitation(student.id, index, 'grade', value)}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="اختر" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {grades.map(grade => (
                                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-xs mb-2">الأسطر</Label>
                                  <div className="grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lineNum => (
                                      <Button
                                        key={lineNum}
                                        type="button"
                                        variant={rec.selectedLines.includes(lineNum) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleLineNumber(student.id, index, lineNum)}
                                        className="h-8 text-xs"
                                      >
                                        {lineNum}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBeginnerRecitation(student.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة صفحة أخرى
                          </Button>
                          
                          <div>
                            <Label className="text-sm font-semibold mb-1">تقييم الأدب</Label>
                            <Select
                              value={studentData[student.id]?.behaviorGrade || ''}
                              onValueChange={(value) => updateStudentData(student.id, 'behaviorGrade', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التقييم" />
                              </SelectTrigger>
                              <SelectContent>
                                {behaviorGrades.map(grade => (
                                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold mb-1">ملاحظات</Label>
                            <Textarea
                              placeholder="أضف ملاحظات..."
                              value={studentData[student.id]?.notes || ''}
                              onChange={(e) => updateStudentData(student.id, 'notes', e.target.value)}
                              rows={2}
                            />
                          </div>
                        </>
                      ) : (
                        // حقول الطلاب العاديين - صفحات متعددة
                        <>
                          {studentData[student.id]?.regularRecitations.map((rec, index) => (
                            <Card key={index} className="p-3 bg-muted/30">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-bold">تسميع {index + 1}</Label>
                                {studentData[student.id].regularRecitations.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRegularRecitation(student.id, index)}
                                    className="h-7 text-destructive"
                                  >
                                    حذف
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs mb-1">أرقام الصفحات</Label>
                                  <Input
                                    type="text"
                                    placeholder="201,202,203"
                                    value={rec.pageNumbers}
                                    onChange={(e) => updateRegularRecitation(student.id, index, 'pageNumbers', e.target.value)}
                                    className="h-9"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">افصل بفاصلة</p>
                                </div>
                                
                                <div>
                                  <Label className="text-xs mb-1">التقييم</Label>
                                  <Select
                                    value={rec.grade}
                                    onValueChange={(value) => updateRegularRecitation(student.id, index, 'grade', value)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="اختر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {grades.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addRegularRecitation(student.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة تسميع آخر
                          </Button>
                          
                          {student.level === 'حافظ' && (
                            <>
                              <div>
                                <Label className="text-sm font-semibold mb-1">أجزاء المراجعة</Label>
                                <Input
                                  type="text"
                                  placeholder="1,2,3"
                                  value={studentData[student.id]?.reviewPages || ''}
                                  onChange={(e) => updateStudentData(student.id, 'reviewPages', e.target.value)}
                                  className="text-center"
                                />
                                <p className="text-xs text-muted-foreground mt-1">أرقام الأجزاء مفصولة بفاصلة</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-semibold mb-1">تقدير المراجعة</Label>
                                <Select
                                  value={studentData[student.id]?.reviewGrade || ''}
                                  onValueChange={(value) => updateStudentData(student.id, 'reviewGrade', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر التقدير" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {grades.map(grade => (
                                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                          
                          <div>
                            <Label className="text-sm font-semibold mb-1">تقييم الأدب</Label>
                            <Select
                              value={studentData[student.id]?.behaviorGrade || ''}
                              onValueChange={(value) => updateStudentData(student.id, 'behaviorGrade', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التقييم" />
                              </SelectTrigger>
                              <SelectContent>
                                {behaviorGrades.map(grade => (
                                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold mb-1">ملاحظات</Label>
                            <Textarea
                              placeholder="أضف ملاحظات..."
                              value={studentData[student.id]?.notes || ''}
                              onChange={(e) => updateStudentData(student.id, 'notes', e.target.value)}
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // عرض الكمبيوتر - جدول
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="text-right font-bold min-w-[150px]">اسم الطالب</TableHead>
                      <TableHead className="text-center font-bold min-w-[120px]">الحضور</TableHead>
                      <TableHead className="text-center font-bold min-w-[100px]">التسميع</TableHead>
                      <TableHead className="text-center font-bold min-w-[120px]">التقييم</TableHead>
                      <TableHead className="text-center font-bold min-w-[100px]">المراجعة</TableHead>
                      <TableHead className="text-center font-bold min-w-[100px]">تقدير المراجعة</TableHead>
                      <TableHead className="text-center font-bold min-w-[120px]">الأدب</TableHead>
                      <TableHead className="text-center font-bold min-w-[200px]">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-semibold">
                          {student.name}
                          {student.level === 'تمهيدي' && (
                            <span className="text-xs text-primary mr-2">(تمهيدي)</span>
                          )}
                        </TableCell>
                        
                        {/* خلية الحضور */}
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant={studentData[student.id]?.attendance === 'present' ? "default" : "outline"}
                              onClick={() => handleAttendance(student.id, 'present')}
                              className={`h-8 px-2 ${studentData[student.id]?.attendance === 'present' ? 
                                "bg-green-600 hover:bg-green-700 text-white" : 
                                "border-green-600 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              حضور
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={studentData[student.id]?.attendance === 'absent' ? "destructive" : "outline"}
                              onClick={() => handleAttendance(student.id, 'absent')}
                              className={`h-8 px-2 ${studentData[student.id]?.attendance === 'absent' ? 
                                "" : 
                                "border-red-600 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              غياب
                            </Button>
                          </div>
                        </TableCell>
                        
                        {student.level === 'تمهيدي' ? (
                          // صف للطالب التمهيدي
                          <>
                            <TableCell>
                              <div className="space-y-2">
                                {studentData[student.id]?.beginnerRecitations.map((rec, index) => (
                                  <div key={index} className="flex gap-2 items-center p-2 border rounded">
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="صفحة"
                                      value={rec.pageNumber}
                                      onChange={(e) => updateBeginnerRecitation(student.id, index, 'pageNumber', e.target.value)}
                                      className="text-center w-20"
                                    />
                                    <div className="flex flex-wrap gap-1">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lineNum => (
                                        <Button
                                          key={lineNum}
                                          type="button"
                                          variant={rec.selectedLines.includes(lineNum) ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => toggleLineNumber(student.id, index, lineNum)}
                                          className="h-6 w-6 p-0 text-xs"
                                        >
                                          {lineNum}
                                        </Button>
                                      ))}
                                    </div>
                                    {studentData[student.id].beginnerRecitations.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeBeginnerRecitation(student.id, index)}
                                        className="h-6 text-destructive"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addBeginnerRecitation(student.id)}
                                  className="w-full h-7"
                                >
                                  + صفحة
                                </Button>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {studentData[student.id]?.beginnerRecitations.map((rec, index) => (
                                <div key={index} className="mb-2">
                                  <Select
                                    value={rec.grade}
                                    onValueChange={(value) => updateBeginnerRecitation(student.id, index, 'grade', value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="اختر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {grades.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </TableCell>
                            
                            <TableCell className="text-center text-muted-foreground">-</TableCell>
                            
                            <TableCell className="text-center text-muted-foreground">-</TableCell>
                            
                            <TableCell>
                              <Select
                                value={studentData[student.id]?.behaviorGrade || ''}
                                onValueChange={(value) => updateStudentData(student.id, 'behaviorGrade', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر" />
                                </SelectTrigger>
                                <SelectContent>
                                  {behaviorGrades.map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            
                            <TableCell>
                              <Input
                                placeholder="ملاحظات..."
                                value={studentData[student.id]?.notes || ''}
                                onChange={(e) => updateStudentData(student.id, 'notes', e.target.value)}
                              />
                            </TableCell>
                          </>
                        ) : (
                          // صف للطالب العادي - صفحات متعددة
                          <>
                            <TableCell>
                              <div className="space-y-2">
                                {studentData[student.id]?.regularRecitations.map((rec, index) => (
                                  <div key={index} className="flex gap-2 items-center">
                                    <Input
                                      type="text"
                                      placeholder="201,202"
                                      value={rec.pageNumbers}
                                      onChange={(e) => updateRegularRecitation(student.id, index, 'pageNumbers', e.target.value)}
                                      className="flex-1"
                                    />
                                    {studentData[student.id].regularRecitations.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRegularRecitation(student.id, index)}
                                        className="h-8 text-destructive"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addRegularRecitation(student.id)}
                                  className="w-full h-7"
                                >
                                  + تسميع
                                </Button>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {studentData[student.id]?.regularRecitations.map((rec, index) => (
                                <div key={index} className="mb-2">
                                  <Select
                                    value={rec.grade}
                                    onValueChange={(value) => updateRegularRecitation(student.id, index, 'grade', value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="اختر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {grades.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </TableCell>
                            
                            <TableCell>
                              {student.level === 'حافظ' ? (
                                <Input
                                  type="text"
                                  placeholder="1,2,3"
                                  value={studentData[student.id]?.reviewPages || ''}
                                  onChange={(e) => updateStudentData(student.id, 'reviewPages', e.target.value)}
                                  className="text-center"
                                />
                              ) : (
                                <span className="text-center text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {student.level === 'حافظ' ? (
                                <Select
                                  value={studentData[student.id]?.reviewGrade || ''}
                                  onValueChange={(value) => updateStudentData(student.id, 'reviewGrade', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {grades.map(grade => (
                                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-center text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <Select
                                value={studentData[student.id]?.behaviorGrade || ''}
                                onValueChange={(value) => updateStudentData(student.id, 'behaviorGrade', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر" />
                                </SelectTrigger>
                                <SelectContent>
                                  {behaviorGrades.map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            
                            <TableCell>
                              <Input
                                placeholder="ملاحظات..."
                                value={studentData[student.id]?.notes || ''}
                                onChange={(e) => updateStudentData(student.id, 'notes', e.target.value)}
                              />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && students.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا يوجد طلاب</p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default QuickDataEntry;
