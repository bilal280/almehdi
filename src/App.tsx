import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentReport from "./pages/StudentReport";
import DynamicStudentReport from "./pages/DynamicStudentReport";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
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
import AdminStudentRecords from "./pages/AdminStudentRecords";
import AdminExamRecords from "./pages/AdminExamRecords";
import AdminAttendance from "./pages/AdminAttendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={< Login />} />
          {/* <Route path="/student/:studentNumber" element={<StudentReport />} /> */}
          <Route path="/student/:studentNumber" element={<DynamicStudentReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/activities" element={<CircleActivities />} />
          <Route path="/teacher/records" element={<StudentRecords />} /> 
          <Route path="/teacher/exams" element={<ExamManagement />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/teachers" element={<TeacherManagement />} />
          <Route path="/admin/circles" element={<CircleManagement />} />
          <Route path="/admin/points" element={<AdminPointsManagement />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/records" element={<AdminStudentRecords />} />
          <Route path="/admin/exam-records" element={<AdminExamRecords />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
