import { Heart, ThumbsUp, Award } from "lucide-react";

interface BehaviorSectionProps {
  behavior: "ممتاز" | "جيد جداً" | "جيد" | "مقبول";
}

const BehaviorSection = ({ behavior }: BehaviorSectionProps) => {
  const getBehaviorConfig = (behavior: string) => {
    switch (behavior) {
      case "ممتاز":
        return {
          icon: <Award className="w-8 h-8" />,
          color: "text-green-600",
          bgColor: "bg-gradient-to-r from-green-100 to-green-50",
          borderColor: "border-green-300",
          emoji: "🌟"
        };
      case "جيد جداً":
        return {
          icon: <ThumbsUp className="w-8 h-8" />,
          color: "text-blue-600",
          bgColor: "bg-gradient-to-r from-blue-100 to-blue-50",
          borderColor: "border-blue-300",
          emoji: "👏"
        };
      case "جيد":
        return {
          icon: <Heart className="w-8 h-8" />,
          color: "text-yellow-600",
          bgColor: "bg-gradient-to-r from-yellow-100 to-yellow-50",
          borderColor: "border-yellow-300",
          emoji: "😊"
        };
      default:
        return {
          icon: <Heart className="w-8 h-8" />,
          color: "text-gray-600",
          bgColor: "bg-gradient-to-r from-gray-100 to-gray-50",
          borderColor: "border-gray-300",
          emoji: "📝"
        };
    }
  };

  const config = getBehaviorConfig(behavior);

  return (
    <div className="islamic-card p-6 mb-6 scale-in">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-6 h-6 text-secondary" />
        <h3 className="text-xl font-bold text-secondary">تقييم السلوك</h3>
      </div>
      
      <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105`}>
        <div className={`${config.color} mb-4 flex justify-center`}>
          {config.icon}
        </div>
        
        <div className="text-4xl mb-3">
          {config.emoji}
        </div>
        
        <h4 className={`text-2xl font-bold ${config.color} mb-2`}>
          {behavior}
        </h4>
        
        <p className="text-muted-foreground">
          تقييم سلوك الطالب لهذا اليوم
        </p>
      </div>
    </div>
  );
};

export default BehaviorSection;