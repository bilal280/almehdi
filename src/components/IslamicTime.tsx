import { Calendar } from "lucide-react";

const IslamicTime = () => {
  const currentTime = new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // التاريخ الهجري التقريبي - في التطبيق الحقيقي يمكن استخدام مكتبة للتاريخ الهجري
  const getHijriDate = () => {
    const hijriYear = currentTime.getFullYear() - 622;
    return `${hijriYear} هـ`;
  };

  return (
    <div className="islamic-card p-4 mb-6 scale-in bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {formatDate(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {getHijriDate()}
          </div>
        </div>
        <div className="bg-accent/10 p-2 rounded-lg">
          <Calendar className="w-6 h-6 text-accent" />
        </div>
      </div>
    </div>
  );
};

export default IslamicTime;