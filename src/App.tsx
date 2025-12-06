import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MaintenanceCheck from "./components/MaintenanceCheck";
import DynamicStudentReport from "./pages/DynamicStudentReport";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuickDataEntry from "./pages/QuickDataEntry";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherExamRecords from "./pages/TeacherExamRecords";

import Login from "./pages/Login";
import CircleActivities from "./pages/CircleActivities";
import StudentRecords from "./pages/StudentRecords";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentManagement from "./pages/StudentManagement";
import TeacherManagement from "./pages/TeacherManagement";
import CircleManagement from "./pages/CircleManagement";
import ExamManagement from "./pages/ExamManagement";
import AdminPointsManagement from "./pages/AdminPointsManagement";
import AdminPointsRecords from "./pages/AdminPointsRecords";
import AdminStudentRecords from "./pages/AdminStudentRecords";
import AdminExamRecords from "./pages/AdminExamRecords";
import AdminAttendance from "./pages/AdminAttendance";
import MonthlyReview from "./pages/MonthlyReview";
import DiscontinuedStudents from "./pages/DiscontinuedStudents";
import MaintenanceControl from "./pages/MaintenanceControl";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* صفحة الصيانة */}
          <Route path="/maintenance" element={<MaintenancePage />} />
          
          {/* صفحات الطلاب - محمية بفحص الصيانة */}
          <Route path="/student/:studentNumber" element={
            <MaintenanceCheck>
              <DynamicStudentReport />
            </MaintenanceCheck>
          } />
          
          {/* صفحات الأساتذة */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/quick-entry" element={<QuickDataEntry />} />
          <Route path="/teacher/activities" element={<CircleActivities />} />
          <Route path="/teacher/records" element={<StudentRecords />} /> 
          <Route path="/teacher/exams" element={<ExamManagement />} />
          <Route path="/teacher/exam-records" element={<TeacherExamRecords />} />
          <Route path="/teacher/monthly-review" element={<MonthlyReview />} />
          
          {/* صفحات الأدمن */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/teachers" element={<TeacherManagement />} />
          <Route path="/admin/circles" element={<CircleManagement />} />
          <Route path="/admin/points" element={<AdminPointsManagement />} />
          <Route path="/admin/points-records" element={<AdminPointsRecords />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/records" element={<AdminStudentRecords />} />
          <Route path="/admin/exam-records" element={<AdminExamRecords />} />
          <Route path="/admin/maintenance" element={<MaintenanceControl />} />
          <Route path="/admin/discontinued-students" element={<DiscontinuedStudents />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
