import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Facebook, Send, MessageCircle, Phone } from "lucide-react";
import PublicNavbar from "./PublicNavbar";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern overflow-x-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <PublicNavbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 bg-gradient-to-t from-card/90 to-card/80 backdrop-blur-md border-t border-primary/10">
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
            {/* About */}
            <div className="text-right">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/institute-logo.png"
                  alt="شعار المعهد"
                  className="w-10 h-10 rounded-full border-2 border-primary shadow-md"
                />
                <div>
                  <h4 className="font-bold text-primary">معهد القرآن الكريم</h4>
                  <p className="text-xs text-muted-foreground">نظام إدارة الطلاب</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                نظام متكامل لإدارة ومتابعة تقدم الطلاب في حفظ القرآن الكريم والأحاديث النبوية الشريفة.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-right">
              <h4 className="font-bold text-primary mb-3">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">عن المعهد</Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-primary transition-colors">معرض الصور</Link>
                </li>
                <li>
                  <Link to="/programs" className="hover:text-primary transition-colors">البرامج والنشاطات</Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-primary transition-colors">أخبار المعهد</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="text-right">
              <h4 className="font-bold text-primary mb-3">تواصل معنا</h4>
              <div className="space-y-3">
                <a
                  href="https://facebook.com/your-institute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  صفحة الفيسبوك
                </a>
                <a
                  href="https://t.me/your-channel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Send className="w-4 h-4 text-blue-400" />
                  قناة التلغرام
                </a>
                <a
                  href="https://wa.me/9647XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  واتساب للتواصل
                </a>
                <a
                  href="tel:+9647XXXXXXXXX"
                  dir="ltr"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  +964 7XX XXX XXXX
                </a>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">© 2024 معهد القرآن الكريم - جميع الحقوق محفوظة</p>
            <p className="text-xs text-muted-foreground mt-1">نظام إدارة الطلاب - الإصدار 1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;