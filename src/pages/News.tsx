import { useState } from "react";
import {
  Newspaper,
  CalendarDays,
  ArrowLeft,
  ChevronLeft,
  Mail,
  Send,
  Clock,
  BadgeCheck,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type NewsItem = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
  featured?: boolean;
};

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "افتتاح دورة الإجازات القرآنية الجديدة",
    excerpt:
      "أعلن المعهد عن افتتاح دورة جديدة لنيل الإجازات في الروايات القرآنية بإشراف نخبة من المشايخ المجازين.",
    content:
      "انطلقت في المعهد الدورة الجديدة للإجازات القرآنية بمشاركة عدد كبير من حفظة القرآن المتقدمين. تشمل الدورة تدريبات عملية في روايات حفص وورش والشعبة وغيرها من الروايات المتواترة، مع جلسات تصحيح فردية وتعليم بأن يتلو الطالب على الشيخ حتى يجيزه.",
    date: "2026-08-28",
    category: "تعليم",
    image: "/gallery/gallery-10.svg",
    featured: true,
  },
  {
    id: 2,
    title: "نتائج المسابقة القرآنية الشهرية",
    excerpt: "فوز ثلاثة طلاب بالمراكز الأولى في مسابقة الحفظ الشهرية عن شهر أغسطس الماضي.",
    content:
      "أُعلنت نتائج المسابقة الشهرية في حفظ القرآن الكريم والتي شهدت مشاركة واسعة من طلاب الحلقات المختلفة. نالت المراكز الأولى حفظة متمكنون أظهروا إتقاناً عالياً في الحفظ والتجويد، وسيتم تكريمهم في الحفل الشهري.",
    date: "2026-08-20",
    category: "مسابقات",
    image: "/gallery/gallery-4.svg",
  },
  {
    id: 3,
    title: "تكريم الطلاب المتفوقين لشهر أغسطس",
    excerpt: "المعهد يكرّم المتفوقين في الحفظ والسلوك ضمن منظومة النقاط والجوائز الترغيبية.",
    content:
      "نظّم المعهد حفل تكريم للمتفوقين في الحفظ والسلوك والانضباط خلال شهر أغسطس، إذ تم توزيع الهدايا والجوائز على الطلاب الحاصلين على أعلى النقاط وفق منظومة التقييم الجديدة.",
    date: "2026-08-25",
    category: "تكريم",
    image: "/gallery/gallery-5.svg",
  },
  {
    id: 4,
    title: "حفل ختم دفعة جديدة لحفظة القرآن",
    excerpt: "تخرج دفعة جديدة من خريجي المعهد بعد إتمامهم حفظ كتاب الله كاملاً بإتقان.",
    content:
      "شهد المعهد حفلاً بهيجاً بمناسبة ختم عدد من الطلاب حفظ القرآن الكريم كاملاً، بحضور أولياء الأمور والمشايخ، وتم تسليم شهادات التخرج والهدايا التذكارية للخريجين.",
    date: "2026-08-15",
    category: "فعاليات",
    image: "/gallery/gallery-2.svg",
  },
  {
    id: 5,
    title: "فتح باب التسجيل في الحلقات الصباحية",
    excerpt: "التسجيل متاح الآن لحلقات التحفيظ الصباحية للفصل الدراسي الجديد بجميع المستويات.",
    content:
      "أعلنت إدارة المعهد عن فتح باب التسجيل في الحلقات الصباحية للطلاب الجدد والمنتقلين، على أن يكون التسجيل حضورياً في مكتب المعهد بدوام رسمي، مع تقديم خصم للأخوة والإخوة المسجلين معاً.",
    date: "2026-08-10",
    category: "إعلانات",
    image: "/gallery/gallery-3.svg",
  },
  {
    id: 6,
    title: "إطلاق النظام الإلكتروني لمتابعة الطلاب",
    excerpt: "إطلاق نظام إلكتروني متكامل يتيح لأولياء الأمور متابعة تقارير أبنائهم اليومية بشكل لحظي.",
    content:
      "في إطار التطوير المستمر، تم تفعيل النظام الإلكتروني الجديد لإدارة ومتابعة الطلاب، والذي يتيح للأساتذة تسجيل الأعمال اليومية ولأولياء الأمور الاطلاع على تقارير أبنائهم لحظياً عبر رقم الطالب.",
    date: "2026-08-05",
    category: "إعلانات",
    image: "/gallery/gallery-1.svg",
  },
  {
    id: 7,
    title: "ندوة تثقيفية عن فضل حفظ القرآن",
    excerpt: "ندوة علمية حول فضل حفظ كتاب الله وأثره في بناء الشخصية المسلمة.",
    content:
      "أقيم في المعهد ندوة تثقيفية بعنوان «أثر حفظ القرآن في بناء النفس» تحدث فيها نخبة من العلماء عن فضل حمل كتاب الله والعناية بتدبره والعمل به.",
    date: "2026-08-01",
    category: "فعاليات",
    image: "/gallery/gallery-7.svg",
  },
];

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" });
};

const News = () => {
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { isVisible, register } = useScrollReveal();

  const featured = newsItems.find((item) => item.featured)!;
  const rest = newsItems.filter((item) => !item.featured);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <PublicLayout>
      <PageHero
        badge="آخر الأخبار"
        icon={Newspaper}
        title="أخبار"
        highlight="المعهد"
        subtitle="تابع أحدث أخبار المعهد وفعالياته وإعلاناته أولاً بأول"
      />

      {/* Featured + News Grid */}
      <section
        ref={register("news")}
        id="news"
        className={`container mx-auto px-4 pb-14 sm:pb-20 transition-all duration-1000 ${isVisible("news") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeading title="الخبر المميز" />

        {/* Featured */}
        <button
          onClick={() => setSelected(featured)}
          className="group relative block w-full max-w-4xl mx-auto overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 text-right focus:outline-none focus:ring-2 focus:ring-primary/50 mb-12"
        >
          <div className="aspect-[16/8]">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg">
                {featured.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/80 text-sm">
                <CalendarDays className="w-4 h-4" />
                {formatDate(featured.date)}
              </span>
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {featured.title}
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed line-clamp-2 hidden sm:block">
              {featured.excerpt}
            </p>
            <span className="inline-flex items-center gap-1.5 text-secondary font-bold mt-3 text-sm sm:text-base hover:gap-3 transition-all">
              اقرأ التفاصيل
              <ChevronLeft className="w-5 h-5" />
            </span>
          </div>
        </button>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {rest.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-primary/10 hover:border-primary/30 overflow-hidden text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="relative overflow-hidden aspect-[16/10]">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg">
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(item.date)}
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                  {item.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  اقرأ المزيد
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section
        ref={register("subscribe")}
        id="subscribe"
        className={`container mx-auto px-4 pb-16 sm:pb-24 transition-all duration-1000 delay-200 ${isVisible("subscribe") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="relative max-w-4xl mx-auto text-center bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="relative z-10">
            <Mail className="w-12 h-12 text-secondary mx-auto mb-5" />
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
              النشرة الإخبارية
            </h3>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
              اشترك ليصلك جديد أخبار المعهد وفعالياته وإعلانات التسجيل مباشرة على بريدك الإلكتروني
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 border border-white/30 text-primary-foreground font-semibold">
                <BadgeCheck className="w-5 h-5 text-secondary" />
                تم الاشتراك بنجاح - جزاك الله خيراً
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <Label htmlFor="newsletter-email" className="sr-only">
                  البريد الإلكتروني
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني..."
                    className="h-12 bg-white/10 border-white/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-secondary text-right flex-1"
                    dir="rtl"
                  />
                  <Button
                    type="submit"
                    className="h-12 bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground hover:from-secondary-dark hover:to-secondary shadow-xl transition-all"
                  >
                    <Send className="w-4 h-4 ml-1" />
                    اشترك الآن
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Article Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-2 border-primary/20 overflow-hidden p-0 max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <div className="relative">
                <img src={selected.image} alt={selected.title} className="w-full aspect-video object-cover" />
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg">
                  {selected.category}
                </span>
              </div>
              <div className="p-6 sm:p-8 text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Clock className="w-4 h-4" />
                  {formatDate(selected.date)}
                </div>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary leading-snug">
                    {selected.title}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-base text-foreground/80 leading-relaxed text-justify">
                  {selected.content}
                </DialogDescription>
                <Button
                  onClick={() => setSelected(null)}
                  className="mt-6 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للأخبار
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
};

export default News;