import { Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const IslamicTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              الوقت الحالي
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              {formatDate(currentTime)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getHijriDate()}
            </div>
          </div>
          <div className="bg-accent/10 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicTime;