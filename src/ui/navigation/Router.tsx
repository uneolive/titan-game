import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@/ui/screens/Login/Login.tsx';
import { ProtectedRoute } from '@/ui/reusables/ProtectedRoute/ProtectedRoute.tsx';

function lazyWithError<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T,
  label: string
) {
  return lazy(() =>
    loader()
      .then((module) => ({ default: module[exportName] as React.ComponentType }))
      .catch((error) => ({
        default: function RouteImportError() {
          return (
            <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-6">
              <div className="w-full max-w-[720px] rounded-[10px] border border-[#FECACA] bg-white p-6 shadow-sm">
                <h1 className="text-[20px] font-semibold leading-7 text-[#101828]">
                  Route import failed
                </h1>
                <p className="mt-2 text-[14px] leading-5 text-[#4A5565]">{label}</p>
                <pre className="mt-4 overflow-auto rounded-[4px] bg-[#F9FAFB] p-4 text-[12px] leading-5 text-[#B42318]">
                  {error instanceof Error ? error.message : 'Unknown import error'}
                </pre>
              </div>
            </div>
          );
        },
      }))
  );
}

const Projects = lazyWithError(
  () => import('@/ui/screens/Projects/Projects.tsx'),
  'Projects',
  'Projects screen'
);
const ProjectDetail = lazyWithError(
  () => import('@/ui/screens/ProjectDetail/ProjectDetail.tsx'),
  'ProjectDetail',
  'Project detail screen'
);
const SpecificationManual = lazyWithError(
  () => import('@/ui/screens/SpecificationManual/SpecificationManual.tsx'),
  'SpecificationManual',
  'Specification manual screen'
);
const Submittal = lazyWithError(
  () => import('@/ui/screens/Submittal/Submittal.tsx'),
  'Submittal',
  'Submittal screen'
);
const AIResult = lazyWithError(
  () => import('@/ui/screens/AIResult/AIResult.tsx'),
  'AIResult',
  'AI result screen'
);

export function AppRouter() {
  const loadingFallback = (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-6">
      <div className="rounded-[10px] border border-[#E5E7EB] bg-white px-6 py-4 text-[14px] text-[#4A5565] shadow-sm">
        Loading...
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/projects"
          element={
            <Suspense fallback={loadingFallback}>
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <Suspense fallback={loadingFallback}>
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/projects/:projectId/spec-manual"
          element={
            <Suspense fallback={loadingFallback}>
              <ProtectedRoute>
                <SpecificationManual />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/projects/:projectId/submittal"
          element={
            <Suspense fallback={loadingFallback}>
              <ProtectedRoute>
                <Submittal />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/projects/:projectId/submittal/:submittalId/results"
          element={
            <Suspense fallback={loadingFallback}>
              <ProtectedRoute>
                <AIResult />
              </ProtectedRoute>
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
