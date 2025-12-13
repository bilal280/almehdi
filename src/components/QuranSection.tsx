import { BookOpen, CheckCircle } from "lucide-react";

interface QuranRecitation {
  id: number;
  pageNumber: number;
  grade: number;
  gradeText: string;
}

interface QuranSectionProps {
  title: string;
  recitations: QuranRecitation[];
  icon?: React.ReactNode;
  displayType?: 'page' | 'juz'; // نوع العرض: صفحة أو جزء
}

const QuranSection = ({ title, recitations, icon, displayType = 'page' }: QuranSectionProps) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-gradient-to-r from-green-500 to-green-600";
    if (grade >= 80) return "bg-gradient-to-r from-blue-500 to-blue-600";
    if (grade >= 70) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const getDisplayLabel = (pageNumber: number) => {
    if (displayType === 'juz') {
      return `جزء ${pageNumber}`;
    }
    return `صفحة ${pageNumber}`;
  };

  return (
    <div className="islamic-card p-6 mb-6 fade-in-right">
      <div className="flex items-center gap-3 mb-4">
        {icon || <BookOpen className="w-6 h-6 text-primary" />}
        <h3 className="text-xl font-bold text-primary">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {recitations.map((recitation) => (
          <div 
            key={recitation.id}
            className="flex items-center justify-between p-4 bg-muted rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                {getDisplayLabel(recitation.pageNumber)}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-foreground">
                {recitation.grade}%
              </span>
              <span className={`grade-badge ${getGradeColor(recitation.grade)}`}>
                {recitation.gradeText}
              </span>
            </div>
          </div>
        ))}
        
        {recitations.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد أعمال مسجلة اليوم</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranSection;