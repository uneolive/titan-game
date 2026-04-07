import { useProjects } from './Projects.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { useUserName, useUserRole } from '@/helpers/utilities/useUser.ts';
import { SpecificationManual } from '@/ui/screens/SpecificationManual/SpecificationManual.tsx';
import { FiTrash2, FiX } from 'react-icons/fi';
import sortIconSvg from '@/assets/images/sort-icon.svg';

export function Projects() {
  const projectsState = useProjects();
  const {
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
    pendingDeleteProjectId,
    isDeletingProjectId,
    handleRequestDeleteProject,
    handleCancelDeleteProject,
    handleDeleteProject,
  } = projectsState;

  const userName = useUserName();
  const userRole = useUserRole();
  const pendingDeleteProject = projects.find((project) => project.projectId === pendingDeleteProjectId);

  const getTypeBadgeClass = (_type: string) => {
    return 'bg-[#F6F6F6] text-[#2A2A2A] border-transparent';
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header userName={userName} userRole={userRole} />

      <main className="mx-auto max-w-[1120px] px-10 py-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold leading-[28.8px] tracking-[-0.48px] text-gray-900">
              Projects
            </h1>
            <p className="mt-2 text-sm leading-[21px] text-gray-500">
              Manage your project submittals and specifications
            </p>
          </div>
          <button onClick={handleCreateNewProject} className="btn-ds-primary-sm">
            New Project
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-error" role="alert">
            {error}
          </div>
        )}

        {isInitialLoad && isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : projects.length === 0 && !isLoading ? (
          <div className="rounded-[10px] border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No projects found. Create your first project!</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto overflow-x-hidden rounded-[4px] border border-gray-200 bg-white">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '46%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '64px' }} />
              </colgroup>
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th
                    className="cursor-pointer px-5 py-3 text-left"
                    onClick={() => handleSort('project_name')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold leading-5 text-gray-700">
                        Project Name
                      </span>
                      <img
                        src={sortIconSvg}
                        alt=""
                        className={`h-[12.25px] w-[12.25px] transition-all ${
                          sortBy === 'project_name' && sortOrder === 'desc' ? 'rotate-180' : ''
                        } ${sortBy === 'project_name' ? 'opacity-100' : 'opacity-30'}`}
                      />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-3.5 py-3 text-left"
                    onClick={() => handleSort('project_type')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold leading-5 text-gray-700">Type</span>
                      <img
                        src={sortIconSvg}
                        alt=""
                        className={`h-[12.25px] w-[12.25px] transition-all ${
                          sortBy === 'project_type' && sortOrder === 'desc' ? 'rotate-180' : ''
                        } ${sortBy === 'project_type' ? 'opacity-100' : 'opacity-30'}`}
                      />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-5 py-3 text-left"
                    onClick={() => handleSort('submittals_count')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold leading-5 text-gray-700">
                        Submittals
                      </span>
                      <img
                        src={sortIconSvg}
                        alt=""
                        className={`h-[12.25px] w-[12.25px] transition-all ${
                          sortBy === 'submittals_count' && sortOrder === 'desc' ? 'rotate-180' : ''
                        } ${sortBy === 'submittals_count' ? 'opacity-100' : 'opacity-30'}`}
                      />
                    </div>
                  </th>
                  <th className="px-5 py-3 text-right text-sm font-semibold leading-5 text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {!isInitialLoad && isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Spinner size="lg" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.projectId}
                      onClick={() => handleProjectClick(project.projectId)}
                      className="group cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium leading-5 text-[#2A2A2A]">
                          {project.projectName}
                        </span>
                      </td>
                      <td className="px-3.5 py-4">
                        <span
                          className={`inline-flex h-6 max-w-[200px] items-center overflow-hidden rounded-[4px] border px-[6px] text-[12px] font-normal leading-none ${getTypeBadgeClass(project.projectType)}`}
                        >
                          {project.projectType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-left">
                        <span className="text-sm font-medium leading-5 text-[#2A2A2A]">
                          {project.submittalsCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRequestDeleteProject(project.projectId);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6A7282] opacity-0 transition-all hover:bg-[#F9FAFB] hover:text-[#B42318] focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Delete ${project.projectName}`}
                          disabled={isDeletingProjectId === project.projectId}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isCreateProjectModalOpen && (
        <SpecificationManual
          modalMode
          projectIdOverride="0"
          onClose={handleCloseCreateProjectModal}
          onSuccess={handleProjectCreated}
        />
      )}

      {pendingDeleteProjectId && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#101828]/45 px-4 py-10"
          onClick={() => {
            if (!isDeletingProjectId) {
              handleCancelDeleteProject();
            }
          }}
        >
          <div
            className="relative flex w-full min-w-[400px] max-w-[800px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
          >
            <div className="border-b border-[#EEEEEE] bg-white px-6 py-6">
              <button
                type="button"
                onClick={handleCancelDeleteProject}
                className="absolute right-6 top-6 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close delete project confirmation"
                disabled={Boolean(isDeletingProjectId)}
              >
                <FiX size={16} />
              </button>
              <h2
                id="delete-project-title"
                className="pr-10 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]"
              >
                Remove Project
              </h2>
              <p className="mt-4 max-w-[560px] text-[14px] leading-[21px] text-[#4A5565]">
                {pendingDeleteProject
                  ? `Are you sure you want to remove "${pendingDeleteProject.projectName}" and all its specification manuals and submittals?`
                  : 'Are you sure you want to remove this project?'}
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-end gap-4 bg-white px-4 py-4">
              <button
                type="button"
                onClick={handleCancelDeleteProject}
                className="btn-ds-secondary-sm disabled:opacity-40"
                disabled={Boolean(isDeletingProjectId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteProject(pendingDeleteProjectId)}
                className="btn-ds-destructive-sm disabled:opacity-40"
                disabled={Boolean(isDeletingProjectId)}
              >
                {isDeletingProjectId ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
