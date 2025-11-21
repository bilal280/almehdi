import { Zap, Trophy, TrendingUp, Award } from "lucide-react";

interface PointsSectionProps {
  enthusiasmPoints: number;
  generalPoints: number;
}

const PointsSection = ({ 
  enthusiasmPoints, 
  generalPoints
}: PointsSectionProps) => {

  return (
    <div className="islamic-card p-6 mb-6 fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-secondary" />
        <h3 className="text-2xl font-bold text-secondary">نقاط الطالب</h3>
        <TrendingUp className="w-5 h-5 text-secondary animate-float" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* نقاط الحماسة */}
        <div className="relative">
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

        {/* النقاط العامة */}
        <div className="relative">
          <div className="bg-gradient-to-br from-primary/10 to-primary-light/5 rounded-2xl p-6 border border-primary/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Award className="w-6 h-6 text-primary animate-float" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-primary">النقاط العامة</h4>
                <p className="text-sm text-muted-foreground">للتسميع والأنشطة</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2 animate-pulse">
                {generalPoints}
              </div>
              <div className="text-sm text-muted-foreground">
                نقطة تراكمية
              </div>
            </div>
            
            {/* شارة التميز */}
            {generalPoints >= 100 && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-green-400 to-green-500 text-green-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                  ممتاز! 🏆
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* إجمالي النقاط */}
      <div className="mt-6 text-center">
        <div className="bg-gradient-to-r from-accent/10 to-accent-light/10 rounded-xl p-6 border border-accent/20">
          <div className="text-3xl font-bold text-accent mb-2">
            إجمالي النقاط: {enthusiasmPoints + generalPoints}
          </div>
        </div>
      </div>
      
      {/* رسائل تحفيزية */}
      <div className="mt-4 text-center">
        {(enthusiasmPoints + generalPoints) >= 150 ? (
          <div className="text-green-600 font-semibold">
            🎉 أحسنت! أداء رائع ومتميز!
          </div>
        ) : (enthusiasmPoints + generalPoints) >= 100 ? (
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