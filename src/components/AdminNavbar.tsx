import { Link, useLocation } from "react-router-dom";
import { Users, UserCheck, BookOpen, LogOut, Shield, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const AdminNavbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/admin", label: "الرئيسية", icon: Shield },
    { path: "/admin/students", label: "إدارة الطلاب", icon: Users },
    { path: "/admin/teachers", label: "إدارة الأساتذة", icon: UserCheck },
    { path: "/admin/circles", label: "إدارة الحلقات", icon: BookOpen },
    { path: "/admin/points", label: "إدارة النقاط", icon: Users },
    { path: "/admin/points-records", label: "سجلات النقاط", icon: FileText },
    { path: "/admin/attendance", label: "سجل الغياب", icon: UserCheck },
    { path: "/admin/records", label: "السجلات", icon: FileText },
    { path: "/admin/exam-records", label: "سجلات الاختبارات", icon: FileText },
    { path: "/admin/maintenance", label: "وضع الصيانة", icon: Shield },
    { path: "/admin/discontinued-students", label: "الطلاب المنقطعين", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-bold text-emerald-800">
                لوحة تحكم المدير
              </h1>
            </div>
            
            {!isMobile ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] sm:w-[400px]">
                    <div className="flex flex-col gap-4 mt-8">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
                              isActive(item.path)
                                ? "bg-emerald-100 text-emerald-700"
                                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 space-x-reverse text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              localStorage.removeItem('adminSession');
              window.location.href = "/admin/login";
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل خروج</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;