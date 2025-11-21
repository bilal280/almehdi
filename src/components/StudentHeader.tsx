import { Star, Moon } from "lucide-react";
import instituteLogoUrl from "@/assets/institute-logo.png";

interface StudentHeaderProps {
  instituteName: string;
  teacherName: string;
  className: string;
}

const StudentHeader = ({ instituteName, teacherName, className }: StudentHeaderProps) => {
  return (
    <header className="golden-header p-6 mb-8 rounded-2xl islamic-pattern">
      <div className="container mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/institute-logo.png" 
              alt="شعار المعهد" 
                className="w-16 h-16 rounded-full object-cover border-4 border-secondary-light shadow-lg hover-glow"
                />

              <div className="absolute -top-1 -right-1 text-secondary-light animate-float">
                <Star className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-secondary-foreground mb-1">
                {instituteName}
              </h1>
              <p className="text-lg text-secondary-foreground/80">
                معهد الإمام المهدي
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-5 h-5 text-secondary-light" />
              <span className="text-lg font-semibold text-secondary-foreground">
                الأستاذ: {teacherName}
              </span>
            </div>
            <div className="text-base text-secondary-foreground/80">
              حلقة: {className}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;