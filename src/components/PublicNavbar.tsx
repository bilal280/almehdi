import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Search, Images, Home, Info, Phone, CalendarDays, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navLinks = [
  { label: "الرئيسية", path: "/", icon: Home, sectionId: null },
  { label: "عن المعهد", path: "/about", icon: Info, sectionId: null },
  { label: "المعرض", path: "/gallery", icon: Images, sectionId: null },
  { label: "البرامج والنشاطات", path: "/programs", icon: CalendarDays, sectionId: null },
  { label: "أخبار المعهد", path: "/news", icon: Newspaper, sectionId: null },
  { label: "تواصل معنا", path: "/", icon: Phone, sectionId: "contact" },
];

interface PublicNavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const PublicNavbar = ({ theme, onToggleTheme }: PublicNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    if (link.sectionId) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(link.sectionId!)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(link.sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link.path);
    }
  };

  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentNumber.trim()) {
      navigate(`/student/${studentNumber.trim()}`);
      setShowStudentDialog(false);
      setStudentNumber("");
    }
  };

  const isActive = (link: typeof navLinks[0]) => {
    if (link.sectionId) return false;
    return location.pathname === link.path;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-card/95 backdrop-blur-md shadow-lg border-b border-primary/10"
            : "bg-card/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/institute-logo.png"
                alt="شعار المعهد"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-primary shadow-md"
              />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary leading-tight">معهد القرآن الكريم</p>
                <p className="text-xs text-muted-foreground">نظام إدارة الطلاب</p>
              </div>
              <p className="text-sm font-bold text-primary sm:hidden">معهد القرآن الكريم</p>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="rounded-full hover:bg-primary/10 transition-all"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowStudentDialog(true)}
                className="hidden sm:flex items-center gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <Search className="w-4 h-4" />
                تقرير طالب
              </Button>

              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:flex bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:opacity-90"
              >
                دخول الأساتذة
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-card/98 backdrop-blur-md border-t border-primary/10 shadow-xl">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-right transition-all ${
                    isActive(link)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
              <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setMobileOpen(false); setShowStudentDialog(true); }}
                  className="flex-1"
                >
                  <Search className="w-4 h-4 ml-1" />
                  تقرير طالب
                </Button>
                <Button
                  size="sm"
                  onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
                >
                  دخول الأساتذة
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Student Search Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              عرض تقرير الطالب
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              أدخل رقم الطالب للوصول إلى تقريره الشامل
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStudentSearch} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="navStudentNumber" className="text-right block font-semibold">رقم الطالب</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="navStudentNumber"
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="pr-10 text-right border-2 border-primary/20 focus:border-primary h-11"
                  placeholder="مثال: 109"
                  dir="rtl"
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowStudentDialog(false)} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                <Search className="w-4 h-4 ml-1" />
                عرض التقرير
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublicNavbar;
