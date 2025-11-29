import { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, Edit, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  circle_id: string;
  date: string;
  activity_type: string;
  description?: string;
  target_pages?: number;
  completed_pages?: number;
  notes?: string;
}

const CircleActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: "",
    description: "",
    target_pages: 0,
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);
  
  const fetchActivities = async () => {
    try {
      const teacherData = localStorage.getItem('teacher');
      if (!teacherData) return;
      
      const teacher = JSON.parse(teacherData);

      // جلب الحلقات التابعة للمعلم
      const { data: circles, error: circlesError } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id);

      if (circlesError) throw circlesError;

      const circleIds = circles?.map(c => c.id) || [];

      // جلب أنشطة الحلقات التابعة للمعلم فقط
      const { data, error } = await supabase
        .from('circle_daily_activities')
        .select('*')
        .in('circle_id', circleIds)
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الأنشطة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddActivity = async () => {
    if (!newActivity.activity_type.trim() || !newActivity.description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return; // منع الضغط المتعدد

    try {
      setIsSubmitting(true);
      
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

      // جلب أول حلقة للمعلم
      const { data: circles, error: circlesError } = await supabase
        .from('circles')
        .select('id')
        .eq('teacher_id', teacher.id)
        .limit(1)
        .single();

      if (circlesError) throw circlesError;

      if (!circles) {
        toast({
          title: "خطأ",
          description: "لا توجد حلقات مسجلة لهذا المعلم",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('circle_daily_activities')
        .insert({
          circle_id: circles.id,
          activity_type: newActivity.activity_type,
          description: newActivity.description,
          target_pages: newActivity.target_pages || 0,
          notes: newActivity.notes,
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة النشاط بنجاح",
      });

      setNewActivity({
        activity_type: "",
        description: "",
        target_pages: 0,
        notes: "",
      });
      setIsAddOpen(false);
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة النشاط",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('circle_daily_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف النشاط بنجاح",
      });

      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف النشاط",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <TeacherNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="islamic-card p-6 flex-1 mr-4 fade-in-up">
            <div className="flex items-center gap-4">
              <BookOpen className="w-12 h-12 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">أعمال الحلقة</h1>
                <p className="text-muted-foreground">إدارة الأنشطة والفعاليات اليومية للحلقة</p>
              </div>
            </div>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-lg">
                <Plus className="w-5 h-5 ml-2" />
                إضافة نشاط
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary text-center">
                  إضافة نشاط جديد
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="activity_type" className="text-right block text-foreground font-semibold">
                    نوع النشاط
                  </Label>
                  <Input
                    id="activity_type"
                    value={newActivity.activity_type}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
                    className="text-right bg-background border-2 focus:border-primary transition-colors"
                    placeholder="مثال: مسابقة، درس، نشاط جماعي"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-right block text-foreground font-semibold">
                    وصف النشاط
                  </Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="text-right bg-background border-2 focus:border-primary transition-colors min-h-[100px]"
                    placeholder="أدخل تفاصيل النشاط"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_pages" className="text-right block text-foreground font-semibold">
                    عدد الصفحات المستهدفة (اختياري)
                  </Label>
                  <Input
                    id="target_pages"
                    type="number"
                    value={newActivity.target_pages}
                    onChange={(e) => setNewActivity({ ...newActivity, target_pages: parseInt(e.target.value) || 0 })}
                    className="text-right bg-background border-2 focus:border-primary transition-colors"
                    placeholder="0"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-right block text-foreground font-semibold">
                    ملاحظات (اختياري)
                  </Label>
                  <Textarea
                    id="notes"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                    className="text-right bg-background border-2 focus:border-primary transition-colors"
                    placeholder="أي ملاحظات إضافية"
                    dir="rtl"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddActivity}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground"
                  >
                    {isSubmitting ? "جاري الإضافة..." : "إضافة"}
                  </Button>
                  <Button
                    onClick={() => setIsAddOpen(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري تحميل الأنشطة...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {activities.map((activity, index) => (
              <Card
                key={activity.id}
                className={`islamic-card p-6 transition-all duration-300 ${
                  index % 2 === 0 ? 'fade-in-up' : 'fade-in-right'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-foreground">{activity.activity_type}</h3>
                      {activity.target_pages && activity.target_pages > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          <BookOpen className="w-4 h-4" />
                          {activity.target_pages} صفحة
                        </div>
                      )}
                    </div>
                    
                    {activity.description && (
                      <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                        {activity.description}
                      </p>
                    )}
                    
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground mb-4 italic">
                        ملاحظة: {activity.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(activity.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {activity.completed_pages !== null && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>مكتمل: {activity.completed_pages} صفحة</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => deleteActivity(activity.id)}
                      variant="destructive"
                      size="sm"
                      className="transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activities.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">لا توجد أنشطة</h3>
            <p className="text-muted-foreground">قم بإضافة النشاط الأول للحلقة</p>
          </div>
        )}
      </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default CircleActivities;