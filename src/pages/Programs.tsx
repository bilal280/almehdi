import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  Mic2,
  ScrollText,
  Landmark,
  HeartHandshake,
  GraduationCap,
  Trophy,
  Award,
  Mountain,
  Moon,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const programs = [
  {
    icon: BookOpen,
    title: "برنامج حفظ القرآن الكريم",
    desc: "منهج متدرج لحفظ القرآن الكريم كاملاً مع نظام مراجعة مستمر يثبّت الحفظ في الصدور.",
    chips: ["لجميع الأعمار", "مستويات متدرجة", "متابعة يومية"],
    color: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
  },
  {
    icon: Mic2,
    title: "برنامج التجويد وأحكام التلاوة",
    desc: "إتقان قراءة القرآن الكريم بمخارج الحروف الصحيحة وأحكام التجويد نظرياً وعملياً.",
    chips: ["نظري وعملي", "تصحيح التلاوة", "ورش تطبيقية"],
    color: "from-secondary/20 via-secondary/10 to-transparent",
    iconColor: "text-secondary",
  },
  {
    icon: ScrollText,
    title: "برنامج الحديث النبوي الشريف",
    desc: "حفظ وشرح الأحاديث النبوية الصحيحة وترسيخ السيرة العطرة في نفوس الطلاب.",
    chips: ["أحاديث مختارة", "شرح مبسط", "أخلاق نبوية"],
    color: "from-accent/20 via-accent/10 to-transparent",
    iconColor: "text-accent",
  },
  {
    icon: Landmark,
    title: "برنامج الفقه والسيرة",
    desc: "تعريف الطلاب بالمبادئ الفقهية وأساسيات العبادات وقصص السيرة النبوية بأسلوب مبسط.",
    chips: ["عبادات يومية", "سيرة نبوية", "سنن وفضائل"],
    color: "from-primary-light/20 via-primary-light/10 to-transparent",
    iconColor: "text-primary-light",
  },
  {
    icon: HeartHandshake,
    title: "برنامج الأخلاق والسلوك",
    desc: "تنمية القيم والآداب الإسلامية وغرس الأخلاق الحميدة في شخصية الطالب من خلال القدوة والتربية.",
    chips: ["قيم إسلامية", "آداب يومية", "تربية سلوكية"],
    color: "from-secondary-light/20 via-secondary-light/10 to-transparent",
    iconColor: "text-secondary-dark",
  },
  {
    icon: GraduationCap,
    title: "دورة الإجازات القرآنية",
    desc: "إعداد الحفظة المتمكنين وتهيئتهم لنيل الإجازات في القراءات القرآنية المتواترة.",
    chips: ["للمتقدمين", "قراءات متواترة", "مشايخ مجازون"],
    color: "from-primary-dark/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
  },
];

const activities = [
  {
    icon: Trophy,
    title: "المسابقات القرآنية",
    desc: "مسابقات دورية في الحفظ والتجويد وأسئلة عامة في العلوم الشرعية بروافز قيمة.",
    color: "bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary",
  },
  {
    icon: Award,
    title: "التكريم والجوائز",
    desc: "تتويج المتفوقين شهرياً وربع سنوياً احتفاءً بإنجازاتهم وتحفيزاً لبقية الطلاب.",
    color: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
  },
  {
    icon: Mountain,
    title: "الرحلات التربوية",
    desc: "رحلات ترفيهية وتربوية تعزز روح الجماعة والترابط بين الطلاب والأساتذة.",
    color: "bg-gradient-to-br from-accent/20 to-accent/10 text-accent",
  },
  {
    icon: Moon,
    title: "الحلقات المسائية",
    desc: "حلقات إضافية مسائية لحفظ المراجعة ولتعليم المبتدئين وفق جدول أسبوعي منتظم.",
    color: "bg-gradient-to-br from-primary-light/20 to-primary-light/10 text-primary-light",
  },
];

const weeklySchedule = [
  { day: "السبت", activity: "مراجعة ما تم حفظه" },
  { day: "الأحد", activity: "جديد الحفظ وشرح الآيات" },
  { day: "الاثنين", activity: "تصحيح التلاوة وأحكام التجويد" },
  { day: "الثلاثاء", activity: "حفظ الحديث النبوي وشرحه" },
  { day: "الأربعاء", activity: "درس الفقه والسيرة النبوية" },
  { day: "الخميس", activity: "مسابقة واختبار أسبوعي" },
];

const Programs = () => {
  const navigate = useNavigate();
  const { isVisible, register } = useScrollReveal();

  return (
    <PublicLayout>
      <PageHero
        badge="برامجنا التعليمية"
        icon={CalendarDays}
        title="البرامج"
        highlight="والنشاطات"
        subtitle="مجموعة متكاملة من البرامج والأنشطة القرآنية والتربوية المصممة لتناسب جميع الأعمار والمستويات"
      />

      {/* Programs */}
      <section
        ref={register("programs")}
        id="programs"
        className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 ${isVisible("programs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeading
          title="برامج المعهد"
          subtitle="لكل برنامج منهجية واضحة وأهداف قابلة للمتابعة والتقويم"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {programs.map((program) => (
            <div key={program.title} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 h-full overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${program.color} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <program.icon className={`w-7 h-7 ${program.iconColor}`} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-3">{program.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-5 flex-1">
                    {program.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {program.chips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 border border-primary/15 text-xs font-semibold text-primary"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section
        ref={register("activities")}
        id="activities"
        className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 delay-100 ${isVisible("activities") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeading
          title="نشاطات المعهد"
          subtitle="أنشطة موازية ترسخ القيم وتثري شخصية الطالب وتنمي مهاراته"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="group bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${activity.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                <activity.icon className="w-7 h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-3">{activity.title}</h4>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{activity.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section
        ref={register("schedule")}
        id="schedule"
        className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 delay-200 ${isVisible("schedule") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern pointer-events-none" />
          <SectionHeading title="الجدول الأسبوعي" subtitle="تقام الحلقات يومياً بعد صلاة المغرب في مسجد المعهد" />
          <div className="relative grid sm:grid-cols-2 gap-3">
            {weeklySchedule.map((row, idx) => (
              <div
                key={row.day}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </span>
                  <div className="text-right">
                    <p className="font-bold">{row.day}</p>
                    <p className="text-sm text-muted-foreground">{row.activity}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-dark bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  بعد المغرب
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={register("cta")}
        id="cta"
        className={`container mx-auto px-4 pb-16 sm:pb-24 transition-all duration-1000 delay-300 ${isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="relative max-w-4xl mx-auto text-center bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">التحق بمعهد القرآن الكريم</h3>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
              سجل طفلك اليوم ليبدأ رحلة حفظ كتاب الله برفقة نخبة من الأساتذة المتخصصين
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/about")}
                className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground hover:from-secondary-dark hover:to-secondary shadow-2xl transition-all duration-300"
              >
                تعرف على المعهد
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="border-2 border-white/40 text-primary-foreground hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                تواصل معنا للتسجيل
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Programs;