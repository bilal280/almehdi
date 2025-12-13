import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MaintenanceControl = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // جلب حالة الصيانة من localStorage
    const maintenanceStatus = localStorage.getItem('maintenanceMode');
    setIsMaintenanceMode(maintenanceStatus === 'true');
  }, []);

  const handleToggleMaintenance = () => {
    const newStatus = !isMaintenanceMode;
    localStorage.setItem('maintenanceMode', newStatus.toString());
    setIsMaintenanceMode(newStatus);

    toast({
      title: newStatus ? "تم تفعيل وضع الصيانة" : "تم إيقاف وضع الصيانة",
      description: newStatus 
        ? "جميع صفحات الطلاب متوقفة الآن" 
        : "جميع صفحات الطلاب تعمل بشكل طبيعي",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-right mb-2">
            إدارة وضع الصيانة
          </h2>
          <p className="text-gray-600 text-right">
            التحكم في إيقاف وتشغيل صفحات الطلاب
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMaintenanceMode ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    <span className="text-orange-600">وضع الصيانة مفعّل</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-600">الموقع يعمل بشكل طبيعي</span>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  id="maintenance-mode"
                  checked={isMaintenanceMode}
                  onCheckedChange={handleToggleMaintenance}
                />
                <Label htmlFor="maintenance-mode" className="text-lg font-medium cursor-pointer">
                  {isMaintenanceMode ? "إيقاف وضع الصيانة" : "تفعيل وضع الصيانة"}
                </Label>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-right">
                <strong>ملاحظة:</strong> عند تفعيل وضع الصيانة، سيتم إيقاف جميع صفحات الطلاب فقط. 
                صفحات الأدمن والأساتذة ستبقى تعمل بشكل طبيعي.
              </AlertDescription>
            </Alert>

            {isMaintenanceMode && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-right text-orange-800">
                  <strong>تحذير:</strong> وضع الصيانة مفعّل حالياً. جميع الطلاب لن يتمكنوا من الوصول إلى صفحاتهم.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-right">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">ماذا يحدث عند تفعيل وضع الصيانة؟</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>يتم إيقاف جميع صفحات الطلاب (صفحات التقارير)</li>
                  <li>يظهر للطلاب صفحة صيانة توضح أن الموقع قيد التحديث</li>
                  <li>صفحات الأدمن والأساتذة تبقى تعمل بشكل طبيعي</li>
                  <li>يمكن إيقاف وضع الصيانة في أي وقت</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">متى يجب استخدام وضع الصيانة؟</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                  <li>عند إجراء تحديثات على النظام</li>
                  <li>عند إصلاح مشاكل تقنية</li>
                  <li>عند إضافة ميزات جديدة</li>
                  <li>عند الحاجة لإيقاف مؤقت للصفحات</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceControl;
