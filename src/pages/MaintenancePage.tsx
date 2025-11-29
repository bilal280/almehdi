import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const MaintenancePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من حالة الصيانة كل 3 ثواني
    const checkMaintenance = () => {
      const maintenanceMode = localStorage.getItem('maintenanceMode');
      
      if (maintenanceMode !== 'true') {
        // إذا تم إلغاء الصيانة، العودة للصفحة الأصلية
        const returnUrl = localStorage.getItem('maintenanceReturnUrl');
        if (returnUrl) {
          localStorage.removeItem('maintenanceReturnUrl');
          navigate(returnUrl, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    };

    const interval = setInterval(checkMaintenance, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl">
        <div className="mb-6">
          <AlertTriangle className="w-24 h-24 text-orange-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            الموقع قيد الصيانة
          </h1>
          <div className="space-y-4 text-gray-600">
            <p className="text-xl">
              نعتذر عن الإزعاج، نحن نعمل حالياً على تحسين الموقع
            </p>
            <p className="text-lg">
              سيعود الموقع للعمل قريباً إن شاء الله
            </p>
            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                للاستفسارات الطارئة، يرجى التواصل مع إدارة المعهد
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                سيتم تحديث الصفحة تلقائياً عند انتهاء الصيانة
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>شكراً لتفهمكم وصبركم</p>
          <p className="mt-2">معهد النور للقرآن الكريم</p>
        </div>
      </Card>
    </div>
  );
};

export default MaintenancePage;
