import { Trophy, BookOpen, ClipboardList, CalendarCheck, BookMarked, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RANK_STYLES = [
  {
    ring: "border-[#D9A441]",
    barColor: "bg-gradient-to-r from-[#F5C944] to-[#D9A441]",
    shadow: "shadow-[0_10px_30px_-12px_rgba(217,164,65,0.45)]",
    label: "الأولى",
  },
  {
    ring: "border-[#B6BEC8]",
    barColor: "bg-gradient-to-r from-[#E3E8EE] to-[#B6BEC8]",
    shadow: "shadow-[0_10px_30px_-12px_rgba(182,190,200,0.45)]",
    label: "الثانية",
  },
  {
    ring: "border-[#CD7F32]",
    barColor: "bg-gradient-to-r from-[#E0A763] to-[#CD7F32]",
    shadow: "shadow-[0_10px_30px_-12px_rgba(205,127,50,0.45)]",
    label: "الثالثة",
  },
];

const groups = [
  {
    icon: BookOpen,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "الأفضل في المواد الشرعية",
    unit: "%",
    items: [
      { name: "حلقة المتمكنين", teacher: "أ. عبد الله سليم", score: 97 },
      { name: "حلقة المتقدمين", teacher: "أ. محمد العلي", score: 94 },
      { name: "حلقة النساء", teacher: "أ. فاطمة حسن", score: 91 },
    ],
  },
  {
    icon: ClipboardList,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "الأفضل في الاختبارات",
    unit: "نقطة",
    items: [
      { name: "حلقة المتقدمين", teacher: "أ. محمد العلي", score: 92 },
      { name: "حلقة المتمكنين", teacher: "أ. عبد الله سليم", score: 90 },
      { name: "حلقة المبتدئين", teacher: "أ. أحمد محمود", score: 87 },
    ],
  },
  {
    icon: CalendarCheck,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    title: "الأفضل في الالتزام بالدوام",
    unit: "%",
    items: [
      { name: "حلقة المتمكنين", teacher: "أ. عبد الله سليم", score: 99 },
      { name: "حلقة النساء", teacher: "أ. فاطمة حسن", score: 98 },
      { name: "الحلقة المسائية", teacher: "أ. خالد إبراهيم", score: 96 },
    ],
  },
  {
    icon: BookMarked,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "الأفضل في حفظ القرآن",
    unit: "%",
    items: [
      { name: "حلقة المتمكنين", teacher: "أ. عبد الله سليم", score: 95 },
      { name: "حلقة المبتدئين", teacher: "أ. أحمد محمود", score: 90 },
      { name: "حلقة المتقدمين", teacher: "أ. محمد العلي", score: 88 },
    ],
  },
];

const AdminTopCircles = () => {
  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 fade-in-up">
        <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Trophy className="w-6 h-6 text-secondary" />
          الحلقات المتميزة
        </h3>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          بيانات تجريبية حالياً وستُربط بقاعدة البيانات لاحقاً
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {groups.map((group, groupIndex) => (
          <Card
            key={group.title}
            className={`islamic-card fade-in-up ${groupIndex % 2 === 0 ? "" : "fade-in-right"}`}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${group.iconBg}`}>
                  <group.icon className={`w-5 h-5 ${group.iconColor}`} />
                </div>
                <CardTitle className="text-right text-base leading-snug">{group.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.items.map((item, index) => {
                  const rank = RANK_STYLES[index];
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 ${rank.ring} ${rank.shadow} bg-gradient-to-br from-card/80 to-card/60 transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div
                        className={`w-9 h-9 flex items-center justify-center rounded-full ${rank.barColor} text-white font-bold shadow-md shrink-0`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.teacher}</p>
                        <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${rank.barColor} transition-all duration-700`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-lg font-bold text-foreground">
                          {item.score}
                          <span className="text-xs text-muted-foreground"> {group.unit}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{rank.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTopCircles;