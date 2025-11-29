import { Award } from "lucide-react";

interface MonthlyReviewSectionProps {
  score: number;
  notes?: string;
  month: string;
}

const MonthlyReviewSection = ({ score, notes, month }: MonthlyReviewSectionProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'ممتاز';
    if (score >= 75) return 'جيد جداً';
    if (score >= 60) return 'جيد';
    return 'مقبول';
  };

  return (
    <div className="islamic-card p-6 fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary">المذاكرة الشهرية</h3>
          <p className="text-sm text-muted-foreground">{month}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
        <div className="text-center">
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">الدرجة</span>
          </div>
          <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}
          </div>
          <div className="text-2xl text-muted-foreground mb-3">
            من 100
          </div>
          <div className={`inline-block px-6 py-2 rounded-full font-bold text-white ${
            score >= 90 ? 'bg-green-500' :
            score >= 75 ? 'bg-blue-500' :
            score >= 60 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {getScoreGrade(score)}
          </div>
        </div>

        {notes && (
          <div className="mt-6 pt-6 border-t border-yellow-300">
            <h4 className="font-semibold text-primary mb-2">ملاحظات الأستاذ:</h4>
            <p className="text-muted-foreground">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReviewSection;
