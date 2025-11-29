import { Calendar, User } from "lucide-react";

interface StudentCardProps {
  studentName: string;
  photoUrl?: string;
  date: string;
  dayName: string;
}

const StudentCard = ({ studentName, photoUrl, date, dayName }: StudentCardProps) => {
  // استخدام لوغو المعهد إذا لم تكن هناك صورة للطالب
  const displayPhoto = photoUrl || "/institute-logo.png";
  
  return (
    <div className="islamic-card p-6 mb-6 fade-in-up">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img 
            src={displayPhoto} 
            alt={`صورة الطالب ${studentName}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex-1 text-right">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {studentName}
          </h2>
          <div className="flex items-center justify-end gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">
              {dayName} - {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;