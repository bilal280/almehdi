import { MessageSquare, FileText } from "lucide-react";

interface NotesSectionProps {
  notes: string[];
}

const NotesSection = ({ notes }: NotesSectionProps) => {
  return (
    <div className="islamic-card p-6 fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-primary-light" />
        <h3 className="text-xl font-bold text-primary-light">ملاحظات الأستاذ</h3>
      </div>
      
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl p-4 border border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg mt-1">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <p className="text-lg text-foreground leading-relaxed flex-1">
                  {note}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد ملاحظات إضافية اليوم</p>
          <p className="text-sm mt-1">أحسنت، استمر في التقدم!</p>
        </div>
      )}
    </div>
  );
};

export default NotesSection;