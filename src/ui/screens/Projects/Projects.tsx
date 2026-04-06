import { useProjects } from './Projects.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { useUserName, useUserRole } from '@/helpers/utilities/useUser.ts';
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
  } = projectsState;

  const userName = useUserName();
  const userRole = useUserRole();

  const getTypeBadgeClass = (_type: string) => {
    return 'bg-[#F6F6F6] text-[#2A2A2A] border-transparent';
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header userName={userName} userRole={userRole} />

      <main className="mx-auto max-w-[1120px] px-10 py-7">
        <div className="mb-7 flex items-start justify-between">
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
                <col style={{ width: '50%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
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
                    className="cursor-pointer px-5 py-3 text-right"
                    onClick={() => handleSort('submittals_count')}
                  >
                    <div className="flex items-center justify-end gap-2">
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
                </tr>
              </thead>
              <tbody>
                {!isInitialLoad && isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
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
                      className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
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
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center overflow-hidden rounded-[4px] border border-transparent bg-[#F6F6F6] px-[6px] text-[12px] font-normal leading-none text-[#2A2A2A]">
                          {project.submittalsCount || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
