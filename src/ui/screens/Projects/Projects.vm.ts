import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/services/projects/ProjectService.ts';
import { ProjectBO } from '@/types/bos/projects/ProjectBO.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';

export function useProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectBO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('project_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getProjects(sortBy, sortOrder);

      if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
        setProjects(result.data.projects);
      } else if (result.statusCode === ServiceResultStatusENUM.UNAUTHORIZED) {
        sessionStorage.clear();
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [sortBy, sortOrder, navigate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // SEQ: 2.2 - Call handleSort(sortBy, sortOrder)
  const handleSort = useCallback((column: string) => {
      setSortBy(column);
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // SEQ: 3.2 - Call handleProjectClick(projectId)
  const handleProjectClick = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}`);
    },
    [navigate]
  );

  // SEQ: 4.2 - Call handleCreateNewProject()
  const handleCreateNewProject = useCallback(() => {
      setIsCreateProjectModalOpen(true);
  }, []);

  const handleCloseCreateProjectModal = useCallback(() => {
      setIsCreateProjectModalOpen(false);
  }, []);

  const handleProjectCreated = useCallback(
    async (projectId: string) => {
      setIsCreateProjectModalOpen(false);
      await loadProjects();
      navigate(`/projects/${projectId}`);
    },
    [loadProjects, navigate]
  );

  return {
    projects,
    isLoading,
    isInitialLoad,
    error,
    sortBy,
    sortOrder,
    handleSort,
    handleProjectClick,
    handleCreateNewProject,
    handleCloseCreateProjectModal,
    handleProjectCreated,
    isCreateProjectModalOpen,
  };
}
