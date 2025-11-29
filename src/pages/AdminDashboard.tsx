import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalCircles, setTotalCircles] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<string>("0%");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // جلب عدد الطلاب
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (studentsError) throw studentsError;
      setTotalStudents(studentsCount || 0);

      // جلب عدد الأساتذة
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      if (teachersError) throw teachersError;
      setTotalTeachers(teachersCount || 0);

      // جلب عدد الحلقات
      const { count: circlesCount, error: circlesError } = await supabase
        .from('circles')
        .select('*', { count: 'exact', head: true });

      if (circlesError) throw circlesError;
      setTotalCircles(circlesCount || 0);

      // حساب معدل الحضور اليومي
      const today = new Date().toISOString().split('T')[0];
      
      // جلب عدد الطلاب الحاضرين اليوم
      const { count: presentCount, error: presentError } = await supabase
        .from('student_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');

      if (presentError) throw presentError;

      // حساب النسبة
      if (studentsCount && studentsCount > 0) {
        const rate = ((presentCount || 0) / studentsCount) * 100;
        setAttendanceRate(`${Math.round(rate)}%`);
      } else {
        setAttendanceRate("0%");
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "إجمالي الطلاب",
      value: loading ? "..." : totalStudents.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "عدد الأساتذة",
      value: loading ? "..." : totalTeachers.toString(),
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "عدد الحلقات",
      value: loading ? "..." : totalCircles.toString(),
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "معدل الحضور اليومي",
      value: loading ? "..." : attendanceRate,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-right">
              مرحباً بك في لوحة تحكم المدير
            </h2>
            <p className="text-gray-600 text-right mt-2">
              إدارة شاملة لمعهد القرآن الكريم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-right">الأنشطة الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-right">
                  <div className="border-r-4 border-emerald-500 pr-4">
                    <p className="font-medium">تم إضافة طالب جديد</p>
                    <p className="text-sm text-gray-600">أحمد محمد - حلقة المبتدئين</p>
                    <p className="text-xs text-gray-500">منذ ساعتين</p>
                  </div>
                  <div className="border-r-4 border-blue-500 pr-4">
                    <p className="font-medium">تم تحديث بيانات أستاذ</p>
                    <p className="text-sm text-gray-600">الأستاذ محمد العلي</p>
                    <p className="text-xs text-gray-500">منذ 3 ساعات</p>
                  </div>
                  <div className="border-r-4 border-purple-500 pr-4">
                    <p className="font-medium">تم إنشاء حلقة جديدة</p>
                    <p className="text-sm text-gray-600">حلقة المتقدمين - المجموعة الثانية</p>
                    <p className="text-xs text-gray-500">أمس</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-right">الإحصائيات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">معدل الحضور</p>
                      <p className="text-sm text-gray-600">85%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">إكمال المهام</p>
                      <p className="text-sm text-gray-600">92%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">رضا الطلاب</p>
                      <p className="text-sm text-gray-600">78%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminDashboard;
