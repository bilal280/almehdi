import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, BookOpen, FileText, LogOut, User, Award, Menu, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const TeacherNavbar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const navItems = [
    { to: "/teacher", icon: Home, label: "الرئيسية", exact: true },
    { to: "/teacher/quick-entry", icon: FileText, label: "إدخال سريع", exact: false },
    { to: "/teacher/students", icon: Users, label: "إدارة الطلاب" },
    { to: "/teacher/activities", icon: BookOpen, label: "أعمال الحلقة" },
    { to: "/teacher/records", icon: FileText, label: "السجلات" },
    { to: "/teacher/exam-records", icon: ClipboardList, label: "سجلات الاختبارات" },
    { to: "/teacher/monthly-review", icon: Award, label: "المذاكرة الشهرية" },
  ];

  return (
    <nav className="golden-header py-4 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-2 border-secondary-light shadow-md">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-foreground text-glow">لوحة الأستاذ</h1>
             
            </div>
          </div>

          {/* Navigation Links */}
          {!isMobile ? (
            <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-secondary-light text-secondary-foreground shadow-md"
                      : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-light/20"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 bg-secondary-light/20 border-secondary-light text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-secondary-light/20 border-secondary-light text-secondary-foreground">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                            isActive
                              ? "bg-secondary-light text-secondary-foreground shadow-md"
                              : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-light/20"
                          }`
                        }
                      >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}

                    {/* Logout Button */}
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="flex items-center gap-3 px-4 py-3 bg-secondary-light/20 border-secondary-light text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      خروج
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TeacherNavbar;