import { Zap, Trophy, TrendingUp } from "lucide-react";

interface PointsSectionProps {
  enthusiasmPoints: number;
  generalPoints: number;
}

const PointsSection = ({ 
  enthusiasmPoints
}: PointsSectionProps) => {

  return (
    <div className="islamic-card p-6 mb-6 fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-secondary" />
        <h3 className="text-2xl font-bold text-secondary">نقاط الطالب</h3>
        <TrendingUp className="w-5 h-5 text-secondary animate-float" />
      </div>
      
      {/* نقاط الحماسة فقط */}
      <div className="relative max-w-md mx-auto">
        <div className="bg-gradient-to-br from-secondary/10 to-secondary-light/5 rounded-2xl p-6 border border-secondary/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary/20 p-3 rounded-full">
              <Zap className="w-6 h-6 text-secondary animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-secondary">نقاط الحماسة</h4>
              <p className="text-sm text-muted-foreground">للدوام والانضباط</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl font-bold text-secondary mb-2 animate-pulse">
              {enthusiasmPoints}
            </div>
            <div className="text-sm text-muted-foreground">
              نقطة تراكمية
            </div>
          </div>
          
          {/* شارة التميز */}
          {enthusiasmPoints >= 50 && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                متميز! 🌟
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* رسائل تحفيزية */}
      <div className="mt-4 text-center">
        {enthusiasmPoints >= 100 ? (
          <div className="text-green-600 font-semibold">
            🎉 أحسنت! أداء رائع ومتميز!
          </div>
        ) : enthusiasmPoints >= 50 ? (
          <div className="text-blue-600 font-semibold">
            👍 جيد جداً! استمر في التقدم!
          </div>
        ) : (
          <div className="text-yellow-600 font-semibold">
            💪 يمكنك تحسين أدائك أكثر!
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsSection;