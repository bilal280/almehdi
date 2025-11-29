import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck = ({ children }: MaintenanceCheckProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMaintenance = () => {
      const maintenanceMode = localStorage.getItem('maintenanceMode');
      
      if (maintenanceMode === 'true') {
        // حفظ الصفحة الحالية للعودة إليها لاحقاً
        localStorage.setItem('maintenanceReturnUrl', location.pathname);
        // إعادة توجيه إلى صفحة الصيانة
        navigate('/maintenance', { replace: true });
      } else {
        setIsChecking(false);
      }
    };

    checkMaintenance();

    // التحقق كل 5 ثواني في حالة تم تفعيل الصيانة أثناء تصفح الطالب
    const interval = setInterval(checkMaintenance, 5000);

    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MaintenanceCheck;
