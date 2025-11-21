import { Scroll, Star } from "lucide-react";

interface Hadith {
  id: number;
  title: string;
  grade: number;
  gradeText: string;
}

interface HadithSectionProps {
  hadiths: Hadith[];
}

const HadithSection = ({ hadiths }: HadithSectionProps) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-gradient-to-r from-green-500 to-green-600";
    if (grade >= 80) return "bg-gradient-to-r from-blue-500 to-blue-600";
    if (grade >= 70) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  return (
    <div className="islamic-card p-6 mb-6 fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <Scroll className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-bold text-accent">الأحاديث النبوية الشريفة</h3>
      </div>
      
      <div className="space-y-3">
        {hadiths.map((hadith) => (
          <div 
            key={hadith.id}
            className="relative p-4 bg-gradient-to-r from-accent/5 to-accent-light/5 rounded-xl border border-accent/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover-glow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {hadith.title}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">
                  {hadith.grade}%
                </span>
                <span className={`grade-badge ${getGradeColor(hadith.grade)}`}>
                  {hadith.gradeText}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {hadiths.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Scroll className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد أحاديث مسجلة اليوم</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HadithSection;