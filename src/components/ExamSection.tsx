import { Award, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Exam {
  id: string;
  juz_number?: number;
  tamhidi_stage?: string;
  tilawah_section?: string;
  hifd_section?: string;
  attempt_number: number;
  exam_score?: number;
  grade?: string;
  tafsir_score?: number;
  tajweed_score?: number;
  exam_date: string;
  notes?: string;
}

interface ExamSectionProps {
  exams: Exam[];
}

const ExamSection = ({ exams }: ExamSectionProps) => {
  if (!exams || exams.length === 0) {
    return null;
  }

  const getAttemptText = (attemptNumber: number) => {
    switch (attemptNumber) {
      case 1: return "المحاولة الأولى";
      case 2: return "المحاولة الثانية";
      case 3: return "المحاولة الثالثة";
      case 4: return "المحاولة الرابعة";
      case 100: return "المرحلة";
      case 200: return "التثبيت";
      default: return `المحاولة ${attemptNumber}`;
    }
  };

  const getExamSection = (exam: Exam): string => {
    if (exam.tamhidi_stage) return exam.tamhidi_stage;
    if (exam.tilawah_section) return exam.tilawah_section;
    if (exam.hifd_section) return exam.hifd_section;
    if (exam.juz_number) return `الجزء ${exam.juz_number}`;
    return 'غير محدد';
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case "ممتاز": return "text-green-600 dark:text-green-400";
      case "جيد جداً": return "text-blue-600 dark:text-blue-400";
      case "جيد": return "text-yellow-600 dark:text-yellow-400";
      case "مقبول": return "text-orange-600 dark:text-orange-400";
      case "ضعيف": return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="islamic-card p-6 fade-in-up">
      <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
        <Award className="w-6 h-6" />
        نتائج الاختبارات
      </h3>
      
      <div className="space-y-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-lg text-primary">{getExamSection(exam)}</h4>
              </div>
              <span className="text-sm text-muted-foreground">{getAttemptText(exam.attempt_number)}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {exam.grade && (
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">التقدير</p>
                  <p className={`text-lg font-bold ${getGradeColor(exam.grade)}`}>{exam.grade}</p>
                </div>
              )}
              
              {exam.tafsir_score !== null && exam.tafsir_score !== undefined && (
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">التفسير</p>
                  <p className="text-lg font-bold text-primary">{exam.tafsir_score}/10</p>
                </div>
              )}
              
              {exam.tajweed_score !== null && exam.tajweed_score !== undefined && (
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">التجويد النظري</p>
                  <p className="text-lg font-bold text-primary">{exam.tajweed_score}/10</p>
                </div>
              )}
            </div>

            {exam.notes && (
              <div className="mt-3 p-2 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground italic">{exam.notes}</p>
              </div>
            )}

            <div className="mt-2 text-left">
              <span className="text-xs text-muted-foreground">
                تاريخ الاختبار: {new Date(exam.exam_date).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamSection;
