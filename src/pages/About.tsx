import { useNavigate } from "react-router-dom";
import {
  Info,
  Target,
  Eye,
  ShieldCheck,
  ScrollText,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  BadgeCheck,
  ArrowLeft,
  Quote,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const About = () => {
  const navigate = useNavigate();
  const { isVisible, register } = useScrollReveal();

  const pillars = [
    {
      icon: Eye,
      title: "الرؤية",
      text: "أن نكون مؤسسة قرآنية رائدة في تعليم كتاب الله تعالى وتخريج أجيال حافظة لكتاب الله عاملة به، متمسكة بالقيم الإسلامية السمحة.",
      color: "from-primary/20 via-primary/10 to-transparent",
      iconColor: "text-primary",
    },
    {
      icon: Target,
      title: "الرسالة",
      text: "تقديم تعليم قرآني متميز وفق منهجيات حديثة تجمع بين الأصالة والمعاصرة، في بيئة تربوية محفزة للطلاب وأولياء الأمور.",
      color: "from-secondary/20 via-secondary/10 to-transparent",
      iconColor: "text-secondary",
    },
    {
      icon: ShieldCheck,
      title: "قيمنا",
      text: "الإخلاص، الأمانة العلمية، التطوير المستمر، روح الجماعة، وتكريم أصحاب الهمم العالية من طلاب ومعلمين.",
      color: "from-accent/20 via-accent/10 to-transparent",
      iconColor: "text-accent",
    },
  ];

  const objectives = [
    { icon: BookOpen, text: "تحفيظ القرآن الكريم كاملاً بقراءاته المتواترة مع إتقان أحكام التجويد" },
    { icon: ScrollText, text: "تحفيظ وشرح الأحاديث النبوية الشريفة وترسيخ السيرة العطرة في نفوس الطلاب" },
    { icon: Users, text: "إعداد معلمين وأساتذة مؤهلين للعناية بكتاب الله ونشر العلم الشرعي" },
    { icon: GraduationCap, text: "تخريج حفظة متمكنين قادرين على تعليم وإقراء كتاب الله في محيطهم" },
    { icon: BadgeCheck, text: "المتابعة الدقيقة لتقدم الطلاب من خلال أنظمة إلكترونية حديثة" },
    { icon: Sparkles, text: "تكريم المتفوقين وتحفيز الجميع من خلال منظومة نقاط وجوائز ترغيبية" },
  ];

  return (
    <PublicLayout>
      <PageHero
        badge="تعرف علينا"
        icon={Info}
        title="عن المعهد"
        subtitle="مؤسسة تعليمية قرآنية تسعى لنشر العلم الشرعي وتربية أجيال حافظة لكتاب الله ممتثلة لأوامره"
      />

      {/* Intro */}
      <section ref={register("intro")} id="intro" className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 ${isVisible("intro") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto items-center">
          <div className="lg:col-span-3">
            <SectionHeading title="نبذة عن المعهد" />
            <div className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/10 space-y-4">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-justify">
                معهد القرآن الكريم مؤسسة تعليمية إسلامية متخصصة في تحفيظ القرآن الكريم والأحاديث النبوية الشريفة،
                تأسس بهدف نشر العلم الشرعي وتعليم كتاب الله عز وجل للأجيال الناشئة في أجواء تربوية آمنة.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-justify">
                يضم المعهد نخبة من الأساتذة المتخصصين في علوم القرآن والتجويد، ويعتمد على منهجية تربوية
                متدرجة تراعي الفروق الفردية بين الطلاب وتركز على الحفظ الصحيح والفهم والتدبر.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-justify">
                ومن خلال الأنظمة الإلكترونية الحديثة نضمن متابعة دقيقة ومستمرة لمسيرة كل طالب، وتواصلاً
                مباشراً وشفافاً مع أولياء الأمور.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full -translate-y-16 translate-x-16"></div>
                <img
                  src="/institute-logo.png"
                  alt="شعار المعهد"
                  className="w-24 h-24 rounded-full border-4 border-secondary/60 mx-auto mb-6 shadow-xl animate-float"
                />
                <Quote className="w-8 h-8 text-secondary/70 mx-auto mb-4" />
                <p className="text-primary-foreground text-lg leading-relaxed font-semibold">
                  "خيركم من تعلم القرآن وعلمه"
                </p>
                <p className="text-primary-foreground/70 text-sm mt-3">رواه البخاري</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section ref={register("pillars")} id="pillars" className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 delay-100 ${isVisible("pillars") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <SectionHeading title="رؤيتنا ورسالتنا وقيمنا" subtitle="ثلاث ركائز تقوم عليها مسيرتنا التعليمية والتربوية" />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 h-full overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${pillar.color} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="relative z-10 flex flex-col items-start text-right">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <pillar.icon className={`w-7 h-7 ${pillar.iconColor}`} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{pillar.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{pillar.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Objectives */}
      <section ref={register("objectives")} id="objectives" className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 delay-200 ${isVisible("objectives") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="relative bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern pointer-events-none" />
          <SectionHeading title="أهداف المعهد" subtitle="نعمل بجد لتحقيق مجموعة من الأهداف النبيلة التي تصب في خدمة كتاب الله" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            {objectives.map((obj, idx) => (
              <div
                key={obj.text}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:bg-card/95 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <obj.icon className="w-5 h-5" />
                </div>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{obj.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={register("cta")} id="cta" className={`container mx-auto px-4 pb-16 sm:pb-24 transition-all duration-1000 delay-300 ${isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="relative max-w-4xl mx-auto text-center bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">اكتشف برامجنا التعليمية</h3>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
              نقدم مجموعة متنوعة من البرامج في الحفظ والتجويد والعلوم الشرعية لتناسب جميع الأعمار والمستويات
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/programs")}
              className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground hover:from-secondary-dark hover:to-secondary shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(233,198,94,0.5)] transition-all duration-300"
            >
              استعرض البرامج والنشاطات
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;