import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, Calendar, LogIn, Facebook, Send, MessageCircle, Phone, Sparkles, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PublicHome = () => {
  const navigate = useNavigate();
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const { isVisible, register } = useScrollReveal();

  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentNumber.trim()) {
      navigate(`/student/${studentNumber.trim()}`);
      setShowStudentDialog(false);
      setStudentNumber("");
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-28 sm:pt-32 pb-12 sm:pb-20 text-center min-h-[85vh] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto fade-in-up relative z-10">
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <img
              src="/institute-logo.png"
              alt="شعار المعهد"
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary shadow-2xl hover:scale-110 transition-transform duration-500 animate-float"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            مؤسسة تعليمية قرآنية رائدة
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent animate-gradient">
              مرحباً بكم في معهد القرآن الكريم
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed px-4 max-w-3xl mx-auto">
            نظام متكامل لإدارة ومتابعة تقدم الطلاب في حفظ القرآن الكريم والأحاديث النبوية الشريفة
          </p>

          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <LogIn className="w-5 h-5 ml-2 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">دخول الأساتذة</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowStudentDialog(true)}
              className="group w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              عرض تقرير طالب
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={register("about")}
        id="about"
        className={`relative container mx-auto px-4 py-12 sm:py-16 transition-all duration-1000 ${
          isVisible("about") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center relative inline-block w-full">
            <span className="relative">
              عن المعهد
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </span>
          </h3>
          <div className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/10 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-justify">
              معهد القرآن الكريم هو مؤسسة تعليمية إسلامية متخصصة في تحفيظ القرآن الكريم والأحاديث النبوية الشريفة،
              تأسس المعهد بهدف نشر العلم الشرعي وتعليم كتاب الله عز وجل للأجيال الناشئة. نسعى لتقديم تعليم متميز
              يجمع بين الأصالة والمعاصرة، حيث نحرص على تطبيق أفضل الأساليب التربوية في التحفيظ والتعليم.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-justify">
              يضم المعهد نخبة من الأساتذة والمعلمين المتخصصين في علوم القرآن والتجويد، ويوفر بيئة تعليمية محفزة
              تساعد الطلاب على الحفظ والفهم والتدبر. كما نهتم بالجانب التربوي والسلوكي للطلاب من خلال برامج
              متنوعة تعزز القيم الإسلامية والأخلاق الحميدة.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-justify">
              نستخدم أحدث التقنيات والأنظمة الإلكترونية لمتابعة تقدم الطلاب وتسهيل التواصل مع أولياء الأمور،
              مما يضمن متابعة دقيقة ومستمرة لمسيرة كل طالب في حفظ كتاب الله تعالى.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => navigate("/about")}
                className="group bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                تعرف على المعهد أكثر
                <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Contact Section */}
      <section
        ref={register("contact")}
        id="contact"
        className={`relative container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-card/20 to-transparent transition-all duration-1000 delay-200 ${
          isVisible("contact") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-10 text-center relative inline-block w-full">
            <span className="relative">
              تواصل معنا
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <a
              href="https://facebook.com/your-institute"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-blue-500/20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Facebook className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 group-hover:animate-pulse" />
              </div>
              <div className="text-right flex-1">
                <h4 className="font-bold text-base sm:text-lg mb-1 group-hover:text-blue-500 transition-colors">صفحة الفيسبوك</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">تابعنا على فيسبوك</p>
              </div>
            </a>

            <a
              href="https://wa.me/channel/your-channel"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-green-500/20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 group-hover:animate-pulse" />
              </div>
              <div className="text-right flex-1">
                <h4 className="font-bold text-base sm:text-lg mb-1 group-hover:text-green-500 transition-colors">قناة الواتساب</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">انضم لقناتنا</p>
              </div>
            </a>

            <a
              href="https://t.me/your-channel"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-blue-400/20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400/20 to-blue-400/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Send className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 group-hover:animate-pulse" />
              </div>
              <div className="text-right flex-1">
                <h4 className="font-bold text-base sm:text-lg mb-1 group-hover:text-blue-400 transition-colors">قناة التلغرام</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">تابع آخر الأخبار</p>
              </div>
            </a>

            <a
              href="https://wa.me/9647XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-green-600/20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 group-hover:animate-pulse" />
              </div>
              <div className="text-right flex-1">
                <h4 className="font-bold text-base sm:text-lg mb-1 group-hover:text-green-600 transition-colors">واتساب للتواصل</h4>
                <p className="text-xs sm:text-sm text-muted-foreground" dir="ltr">+964 7XX XXX XXXX</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        ref={register("stats")}
        id="stats"
        className={`relative container mx-auto px-4 py-12 sm:py-16 transition-all duration-1000 delay-300 ${
          isVisible("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-8 sm:mb-12 relative inline-block w-full">
          <span className="relative">
            إحصائيات المعهد
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </span>
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-primary/10">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              +100
            </div>
            <p className="text-xs sm:text-base md:text-lg text-muted-foreground">طالب وطالبة</p>
          </div>
          <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-primary/10">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              +8
            </div>
            <p className="text-xs sm:text-base md:text-lg text-muted-foreground">أستاذ وأستاذة</p>
          </div>
          <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-primary/10">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              +6
            </div>
            <p className="text-xs sm:text-base md:text-lg text-muted-foreground">حلقة دراسية</p>
          </div>
        </div>
      </section>

      {/* System Features Section */}
      <section
        ref={register("features")}
        id="features"
        className={`relative container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-card/20 to-transparent transition-all duration-1000 delay-500 ${
          isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-8 sm:mb-12 relative inline-block w-full">
          <span className="relative">
            عن النظام ومميزاته
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </span>
        </h3>
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-center mb-6 sm:mb-8 px-4">
            نظام إلكتروني متطور لإدارة ومتابعة الطلاب، يوفر أدوات متقدمة للأساتذة والإدارة لتسجيل
            ومتابعة حفظ الطلاب، وللطلاب وأولياء الأمور لمتابعة التقدم والإنجازات بشكل لحظي.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Card 1 - متابعة الحفظ */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary transition-colors">متابعة الحفظ</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  تسجيل ومتابعة حفظ القرآن الكريم والأحاديث النبوية بشكل يومي
                </p>
                <div className="mt-4 w-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Card 2 - إدارة الطلاب */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/20 via-secondary/15 to-secondary/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-secondary group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-secondary transition-colors">إدارة الطلاب</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  نظام شامل لإدارة بيانات الطلاب والحلقات الدراسية
                </p>
                <div className="mt-4 w-12 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Card 3 - نظام النقاط */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-accent/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent/20 via-accent/15 to-accent/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-accent group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-accent transition-colors">نظام النقاط</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  تحفيز الطلاب من خلال نظام نقاط متقدم وترتيب تنافسي
                </p>
                <div className="mt-4 w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Card 4 - الحضور والغياب */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-primary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary-light/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-light/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-light/20 via-primary-light/15 to-primary-light/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary-light group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary-light transition-colors">الحضور والغياب</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  تسجيل تلقائي للحضور والغياب مع إمكانية التعديل
                </p>
                <div className="mt-4 w-12 h-1 bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Number Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              عرض تقرير الطالب
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              أدخل رقم الطالب للوصول إلى تقريره الشامل
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStudentSearch} className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label htmlFor="studentNumber" className="text-right block text-foreground font-semibold text-lg">
                رقم الطالب
              </Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="studentNumber"
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="pr-12 text-right bg-background/50 border-2 border-primary/20 focus:border-primary transition-all h-12 text-lg"
                  placeholder="مثال: 109"
                  dir="rtl"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowStudentDialog(false);
                  setStudentNumber("");
                }}
                className="flex-1 h-11 border-2 hover:bg-muted"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-4 h-4 ml-2" />
                عرض التقرير
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
};

export default PublicHome;