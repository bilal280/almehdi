import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EligibleStudent {
  id: string;
  name: string;
  student_number: number;
  circle_name: string;
  actual_points: number; // النقاط الفعلية (مثلاً: 14، 17، 23)
  milestone_points: number; // آخر رقم مضبوط (مثلاً: 10، 15، 20)
  eligible_rewards: number; // عدد المكافآت المستحقة
  given_rewards: number; // عدد المكافآت المُعطاة
}

const RewardsSection = () => {
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [givingReward, setGivingReward] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEligibleStudents();
  }, []);

  const fetchEligibleStudents = async () => {
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

      // جلب نقاط الحماسة (عدد أيام الدوام)
      const { data: pointsData } = await supabase
        .from('student_points')
        .select('student_id, points')
        .eq('point_type', 'enthusiasm')
        .in('student_id', activeStudents.map(s => s.id));

      // جلب المكافآت المُعطاة مع النقاط التي كانت عندها
      const { data: rewardsData } = await supabase
        .from('student_rewards')
        .select('student_id, reward_level, enthusiasm_points_at_reward')
        .in('student_id', activeStudents.map(s => s.id));

      // حساب النقاط والمكافآت لكل طالب
      const studentsMap = new Map<string, EligibleStudent>();

      activeStudents.forEach(student => {
        const totalPoints = pointsData
          ?.filter(p => p.student_id === student.id)
          .reduce((sum, p) => sum + p.points, 0) || 0;

        // حساب آخر رقم مضبوط على 5 وصل إليه
        const lastMilestone = Math.floor(totalPoints / 5) * 5; // مثلاً: 14 → 10، 17 → 15
        
        if (lastMilestone >= 5) {
          const studentRewards = rewardsData?.filter(r => r.student_id === student.id) || [];
          const givenRewards = studentRewards.length;
          
          // التحقق من أن آخر مكافأة لم تكن عند نفس الـ milestone الحالي
          const lastRewardMilestone = studentRewards.length > 0 
            ? Math.max(...studentRewards.map(r => r.enthusiasm_points_at_reward || 0))
            : 0;
          
          // فقط إذا لم يتم إعطاء المكافأة عند هذا الـ milestone
          if (lastMilestone > lastRewardMilestone) {
            const eligibleRewards = lastMilestone / 5;
            
            studentsMap.set(student.id, {
              id: student.id,
              name: student.name,
              student_number: student.student_number,
              circle_name: student.circles?.name || "غير محدد",
              actual_points: totalPoints, // النقاط الفعلية (14، 17، 23، ...)
              milestone_points: lastMilestone, // آخر رقم مضبوط (10، 15، 20، ...)
              eligible_rewards: eligibleRewards,
              given_rewards: givenRewards
            });
          }
        }
      });

      // ترتيب حسب عدد النجوم المستحقة (الأكثر أولاً)
      const sortedStudents = Array.from(studentsMap.values())
        .sort((a, b) => b.milestone_points - a.milestone_points);

      setEligibleStudents(sortedStudents);
    } catch (error) {
      console.error('Error fetching eligible students:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلاب المستحقين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveReward = async (student: EligibleStudent) => {
    try {
      setGivingReward(student.id);

      const adminData = localStorage.getItem('adminSession');
      if (!adminData) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول كمدير",
          variant: "destructive",
        });
        setGivingReward(null);
        return;
      }

      const admin = JSON.parse(adminData);
      const nextRewardLevel = student.given_rewards + 1;

      // تسجيل المكافأة
      const { error } = await supabase
        .from('student_rewards')
        .insert({
          student_id: student.id,
          reward_level: nextRewardLevel,
          enthusiasm_points_at_reward: student.milestone_points,
          given_by: admin.id,
          notes: `مكافأة رقم ${nextRewardLevel} عند ${student.milestone_points} نجمة`
        });

      if (error) throw error;

      // إزالة الطالب من القائمة فوراً
      setEligibleStudents(prev => prev.filter(s => s.id !== student.id));

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل إعطاء المكافأة للطالب ${student.name}`,
      });
    } catch (error) {
      console.error('Error giving reward:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل المكافأة",
        variant: "destructive",
      });
    } finally {
      setGivingReward(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-3">
          <Gift className="w-6 h-6 text-green-600" />
          الطلاب المستحقون للمكافآت
          {eligibleStudents.length > 0 && (
            <Badge variant="destructive" className="text-lg">
              {eligibleStudents.length} طالب
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground text-right mt-2">
          كل يوم دوام = نجمة ⭐ | كل 5 نجوم = مكافأة 🎁
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" dir="rtl">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50">
                <TableHead className="text-right font-bold">اسم الطالب</TableHead>
                <TableHead className="text-right font-bold">الحلقة</TableHead>
                <TableHead className="text-center font-bold">نقاط الحماسة لديه</TableHead>
                <TableHead className="text-center font-bold">عدد النجوم المستحقة ⭐</TableHead>
                <TableHead className="text-center font-bold">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    جاري تحميل البيانات...
                  </TableCell>
                </TableRow>
              ) : eligibleStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-12 h-12 text-green-500" />
                      <p className="text-muted-foreground">
                        رائع! جميع المكافآت تم إعطاؤها 🎉
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                eligibleStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="text-right font-semibold">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {student.circle_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-lg font-bold">
                        {student.actual_points}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <Badge className="bg-green-600 text-xl font-bold">
                          {student.milestone_points}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => handleGiveReward(student)}
                        disabled={givingReward === student.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {givingReward === student.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 ml-2" />
                            تم الإعطاء
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsSection;
