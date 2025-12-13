import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedTeacherRouteProps {
  children: React.ReactNode;
}

const ProtectedTeacherRoute = ({ children }: ProtectedTeacherRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) {
      navigate('/login');
    }
  }, [navigate]);

  const teacherData = localStorage.getItem('teacher');
  if (!teacherData) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedTeacherRoute;
