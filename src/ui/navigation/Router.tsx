import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@/ui/screens/Login/Login.tsx';
import { Projects } from '@/ui/screens/Projects/Projects.tsx';
import { ProjectDetail } from '@/ui/screens/ProjectDetail/ProjectDetail.tsx';
import { SpecificationManual } from '@/ui/screens/SpecificationManual/SpecificationManual.tsx';
import { Submittal } from '@/ui/screens/Submittal/Submittal.tsx';
import { AIResult } from '@/ui/screens/AIResult/AIResult.tsx';
import { ProtectedRoute } from '@/ui/reusables/ProtectedRoute/ProtectedRoute.tsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/spec-manual"
          element={
            <ProtectedRoute>
              <SpecificationManual />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/submittal"
          element={
            <ProtectedRoute>
              <Submittal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/submittal/:submittalId/results"
          element={
            <ProtectedRoute>
              <AIResult />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
