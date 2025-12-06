import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Award, 
  ClipboardList, 
  Edit3,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import TeacherNavbar from "@/components/TeacherNavbar";
import ProtectedTeacherRoute from "@/components/ProtectedTeacherRoute";
import IslamicTime from "@/components/IslamicTime";

interface TeacherPage {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  bgGradient: string;
}

const TeacherDashboard = () => {
  const [teacherName, setTeacherName] = useState<string>("الأستاذ");
  const navigate = useNavigate();

  useEffect(() => {
    loadTeacherName();
  }, []);

  const loadTeacherName = () => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const teacher = JSON.parse(teacherData);
      setTeacherName(teacher.name || "الأستاذ");
    }
  };

  const teacherPages: TeacherPage[] = [
    {
      title: "الإدخال السريع",
      description: "أدخل بيانات جميع الطلاب في جدول واحد",
      icon: Edit3,
      path: "/teacher/quick-entry",
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10"
    },
    {
      title: "إدارة الطلاب",
      description: "عرض وإدارة طلاب الحلقة",
      icon: Users,
      path: "/teacher/students",
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/10"
    },
    {
      title: "أعمال الحلقة",
      description: "عرض أنشطة وأعمال الحلقة اليومية",
      icon: BookOpen,
      path: "/teacher/activities",
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10"
    },
    {
      title: "السجلات",
      description: "عرض سجلات الطلاب والأعمال",
      icon: FileText,
      path: "/teacher/records",
      color: "text-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      title: "سجلات الاختبارات",
      description: "عرض جميع اختبارات طلابك",
      icon: ClipboardList,
      path: "/teacher/exam-records",
      color: "text-red-600",
      bgGradient: "from-red-500/10 to-red-600/10"
    },
    {
      title: "المذاكرة الشهرية",
      description: "إدارة المذاكرة الشهرية للطلاب",
      icon: Award,
      path: "/teacher/monthly-review",
      color: "text-indigo-600",
      bgGradient: "from-indigo-500/10 to-indigo-600/10"
    }
  ];

  const handlePageClick = (path: string) => {
    navigate(path);
  };

  return (
    <ProtectedTeacherRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern">
        <TeacherNavbar />

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12 fade-in-up">
            <div className="islamic-card p-8 mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-primary mb-4">
                مرحباً الأستاذ {teacherName}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                اختر الصفحة التي تريد الوصول إليها
              </p>
              <IslamicTime />
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teacherPages.map((page, index) => (
              <Card 
                key={page.path}
                onClick={() => handlePageClick(page.path)}
                className={`islamic-card p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group ${
                  index % 2 === 0 ? 'fade-in-up' : 'fade-in-right'
                }`}
              >
                <div className={`bg-gradient-to-br ${page.bgGradient} rounded-lg p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <page.icon className={`w-8 h-8 ${page.color} mx-auto`} />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {page.description}
                  </p>
                  
                  <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-sm font-medium ml-2">انتقال</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center fade-in-up">
            <div className="islamic-card p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  {new Date().toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-muted-foreground">
                نسأل الله أن يبارك في جهودكم ويجعل عملكم في ميزان حسناتكم
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedTeacherRoute>
  );
};

export default TeacherDashboard;