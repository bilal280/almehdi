import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
        return;
      }

      // Store teacher info in localStorage for now
      localStorage.setItem('teacher', JSON.stringify(data));
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.name}`,
      });

      navigate("/teacher");
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background islamic-pattern flex items-center justify-center">
      <Card className="islamic-card w-full max-w-md p-8 fade-in-up">
        <div className="text-center mb-8">
          <img 
               src="/institute-logo.png" 
            alt="شعار المعهد" 
            className="w-20 h-20 rounded-full border-2 border-secondary-light shadow-lg mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary mb-2 text-glow">تسجيل الدخول</h1>
          <p className="text-muted-foreground">أدخل بيانات الأستاذ للوصول إلى اللوحة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-right block text-foreground font-semibold">
              اسم الأستاذ
            </Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-12 text-right bg-background border-2 focus:border-primary transition-colors"
                placeholder="أدخل اسم الأستاذ"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-right block text-foreground font-semibold">
              كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 text-right bg-background border-2 focus:border-primary transition-colors"
                placeholder="أدخل كلمة المرور"
                dir="rtl"
                required
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg font-bold"
          >
            <LogIn className="w-5 h-5 ml-2" />
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            مخصص لأساتذة المعهد فقط
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;