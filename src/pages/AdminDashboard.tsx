import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Award, 
  ClipboardList,
  Settings,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminPage {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  bgGradient: string;
}

const AdminDashboard = () => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalCircles, setTotalCircles] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<string>("0%");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const adminPages: AdminPage[] = [
    {
      title: "إدارة الطلاب",
      description: "عرض وإدارة جميع الطلاب في المعهد",
      icon: Users,
      path: "/admin/students",
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10"
    },
    {
      title: "إدارة الأساتذة",
      description: "إدارة حسابات الأساتذة والصلاحيات",
      icon: UserCheck,
      path: "/admin/teachers",
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/10"
    },
    {
      title: "إدارة الحلقات",
      description: "إنشاء وتعديل الحلقات الدراسية",
      icon: BookOpen,
      path: "/admin/circles",
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10"
    },
    {
      title: "سجلات الطلاب",
      description: "عرض السجلات والمحصلات الأسبوعية والشهرية",
      icon: FileText,
      path: "/admin/student-records",
      color: "text-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      title: "سجلات الاختبارات",
      description: "عرض وإدارة جميع اختبارات الطلاب",
      icon: ClipboardList,
      path: "/admin/exam-records",
      color: "text-red-600",
      bgGradient: "from-red-500/10 to-red-600/10"
    },
    {
      title: "سجلات النقاط",
      description: "عرض نقاط الحماس والترتيب",
      icon: Award,
      path: "/admin/points-records",
      color: "text-indigo-600",
      bgGradient: "from-indigo-500/10 to-indigo-600/10"
    },
    {
      title: "التقارير والإحصائيات",
      description: "تقارير شاملة عن أداء المعهد",
      icon: BarChart3,
      path: "/admin/reports",
      color: "text-cyan-600",
      bgGradient: "from-cyan-500/10 to-cyan-600/10"
    },
    {
      title: "الإعدادات",
      description: "إعدادات النظام والصلاحيات",
      icon: Settings,
      path: "/admin/settings",
      color: "text-gray-600",
      bgGradient: "from-gray-500/10 to-gray-600/10"
    }
  ];

  const handlePageClick = (path: string) => {
    navigate(path);
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <AdminNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 fade-in-up">
            <div className="islamic-card p-8 mb-8">
              <h2 className="text-4xl font-bold text-primary text-right mb-2">
                مرحباً بك في لوحة تحكم المدير
              </h2>
              <p className="text-xl text-muted-foreground text-right">
                إدارة شاملة لمعهد القرآن الكريم
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.title} 
                  className={`islamic-card hover:shadow-xl transition-all duration-300 ${
                    index % 2 === 0 ? 'fade-in-up' : 'fade-in-right'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground mt-2">
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

          {/* Navigation Grid */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-primary text-right mb-6">الانتقال السريع</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminPages.map((page, index) => (
                <Card 
                  key={page.path}
                  onClick={() => handlePageClick(page.path)}
                  className={`islamic-card cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group ${
                    index % 2 === 0 ? 'fade-in-up' : 'fade-in-right'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className={`bg-gradient-to-br ${page.bgGradient} rounded-lg p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <page.icon className={`w-8 h-8 ${page.color} mx-auto`} />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed min-h-[40px]">
                        {page.description}
                      </p>
                      
                      <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-sm font-medium ml-2">انتقال</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-up">
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-right">الأنشطة الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-right">
                  <div className="border-r-4 border-emerald-500 pr-4 hover:bg-muted/50 p-2 rounded transition-colors">
                    <p className="font-medium">تم إضافة طالب جديد</p>
                    <p className="text-sm text-muted-foreground">أحمد محمد - حلقة المبتدئين</p>
                    <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                  </div>
                  <div className="border-r-4 border-blue-500 pr-4 hover:bg-muted/50 p-2 rounded transition-colors">
                    <p className="font-medium">تم تحديث بيانات أستاذ</p>
                    <p className="text-sm text-muted-foreground">الأستاذ محمد العلي</p>
                    <p className="text-xs text-muted-foreground">منذ 3 ساعات</p>
                  </div>
                  <div className="border-r-4 border-purple-500 pr-4 hover:bg-muted/50 p-2 rounded transition-colors">
                    <p className="font-medium">تم إنشاء حلقة جديدة</p>
                    <p className="text-sm text-muted-foreground">حلقة المتقدمين - المجموعة الثانية</p>
                    <p className="text-xs text-muted-foreground">أمس</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-right">الإحصائيات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">معدل الحضور</p>
                      <p className="text-sm text-muted-foreground">85%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '92%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">إكمال المهام</p>
                      <p className="text-sm text-muted-foreground">92%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
                    </div>
                    <div>
                      <p className="font-medium">رضا الطلاب</p>
                      <p className="text-sm text-muted-foreground">78%</p>
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
