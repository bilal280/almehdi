import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  ClipboardList,
  LineChart,
  Scale,
  Users,
  Eye,
  Sparkles,
} from "lucide-react";

const COLORS = {
  green: "#1E7A5A",
  darkGreen: "#145540",
  gold: "#D9A441",
  blue: "#2F6FB2",
  red: "#D9534F",
  amber: "#E8863D",
  teal: "#3BA58C",
  purple: "#7B6BC0",
  orange: "#E8763D",
};

// بيانات تجريبية ثابتة - ستُربط بقاعدة البيانات لاحقاً
const attendanceData = [
  { name: "حاضر", value: 132, color: COLORS.green },
  { name: "متأخر", value: 8, color: COLORS.amber },
  { name: "غائب", value: 15, color: COLORS.red },
];

const ratingsData = [
  { name: "أحسنت", value: 42, color: COLORS.green },
  { name: "جيد جداً", value: 28, color: COLORS.teal },
  { name: "جيد", value: 18, color: COLORS.gold },
  { name: "مقبول", value: 9, color: COLORS.amber },
  { name: "يحتاج تحسين", value: 3, color: COLORS.red },
];

const circlesData = [
  { name: "حلقة المبتدئين", value: 25, color: COLORS.green },
  { name: "حلقة المتقدمين", value: 30, color: COLORS.blue },
  { name: "حلقة المتمكنين", value: 15, color: COLORS.gold },
  { name: "حلقة النساء", value: 20, color: COLORS.purple },
  { name: "الحلقة المسائية", value: 12, color: COLORS.teal },
];

const examsData = [
  { name: "حلقة المبتدئين", exams: 8 },
  { name: "حلقة المتقدمين", exams: 6 },
  { name: "حلقة النساء", exams: 5 },
  { name: "الحلقة المسائية", exams: 7 },
  { name: "حلقة المتمكنين", exams: 4 },
];

const pageVisitsData = [
  { name: "الرئيسية", visits: 320 },
  { name: "تقرير الطالب", visits: 214 },
  { name: "المعرض", visits: 148 },
  { name: "الأخبار", visits: 96 },
  { name: "البرامج", visits: 78 },
  { name: "تسجيل الدخول", visits: 57 },
];

const weeklyAttendanceData = [
  { day: "السبت", rate: 88 },
  { day: "الأحد", rate: 92 },
  { day: "الاثنين", rate: 85 },
  { day: "الثلاثاء", rate: 90 },
  { day: "الأربعاء", rate: 94 },
  { day: "الخميس", rate: 87 },
];

const donutTooltipStyle = {
  direction: "rtl" as const,
  fontFamily: "inherit",
};

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  centerLabel: string;
}

const DonutChartWithCenter = ({ data, total, centerLabel }: DonutChartProps) => (
  <div className="relative">
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={88}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={donutTooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-2xl font-bold text-foreground">{total}</span>
      <span className="text-xs text-muted-foreground">{centerLabel}</span>
    </div>
  </div>
);

interface AdminChartsProps {
  showNote?: boolean;
}

const AdminCharts = ({ showNote = true }: AdminChartsProps) => {
  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 fade-in-up">
        <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
          <LineChart className="w-6 h-6" />
          لوحة الرسوم البيانية
        </h3>
        {showNote && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            بيانات تجريبية حالياً وستُربط بقاعدة البيانات لاحقاً
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* الحضور والغياب */}
        <Card className="islamic-card fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-50">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-right text-lg">الحضور والغياب اليوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChartWithCenter data={attendanceData} total={155} centerLabel="إجمالي الطلاب" />
          </CardContent>
        </Card>

        {/* التقديرات اليومية */}
        <Card className="islamic-card fade-in-right">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-teal-50">
                <Scale className="w-5 h-5 text-teal-600" />
              </div>
              <CardTitle className="text-right text-lg">نسب التقديرات اليومية</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChartWithCenter data={ratingsData} total={100} centerLabel="إجمالي التقديرات" />
          </CardContent>
        </Card>

        {/* توزيع الطلاب على الحلقات */}
        <Card className="islamic-card fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-right text-lg">توزيع الطلاب على الحلقات</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChartWithCenter data={circlesData} total={102} centerLabel="طالب وطالبة" />
          </CardContent>
        </Card>

        {/* الاختبارات اليوم */}
        <Card className="islamic-card fade-in-right">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-50">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-right text-lg">الاختبارات اليوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={examsData} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="barPurple" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS.purple} />
                    <stop offset="100%" stopColor={COLORS.blue} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  reversed
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={donutTooltipStyle}
                  formatter={(value) => [`${value} اختبار`, "عدد الاختبارات"]}
                />
                <Bar dataKey="exams" fill="url(#barPurple)" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* زيارات الصفحات اليوم */}
        <Card className="islamic-card fade-in-up xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-50">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-right text-lg">زيارات الصفحات اليوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pageVisitsData} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS.green} />
                    <stop offset="100%" stopColor={COLORS.teal} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  reversed
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={donutTooltipStyle}
                  formatter={(value) => [`${value} زيارة`, "عدد الزيارات"]}
                />
                <Bar dataKey="visits" fill="url(#barGreen)" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* معدل الحضور الأسبوعي */}
        <Card className="islamic-card fade-in-up xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-orange-50">
                <LineChart className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-right text-lg">معدل الحضور خلال الأسبوع</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={donutTooltipStyle}
                  formatter={(value) => [`${value}%`, "نسبة الحضور"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={COLORS.green}
                  strokeWidth={3}
                  fill="url(#areaGreen)"
                  dot={{ r: 4, fill: COLORS.green }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCharts;