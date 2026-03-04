import { useProjects } from './Projects.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { useUserName, useUserRole } from '@/helpers/utilities/useUser.ts';
import { FiPlus } from 'react-icons/fi';
import sortIconSvg from '@/assets/images/sort-icon.svg';

export function Projects() {
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
  } = useProjects();

  const userName = useUserName();
  const userRole = useUserRole();

  // Type badge colors
  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'architecture':
        return 'bg-blue-100 text-blue-900 border-transparent';
      case 'construction':
        return 'bg-green-100 text-green-900 border-transparent';
      case 'engineering':
        return 'bg-yellow-100 text-yellow-900 border-transparent';
      default:
        return 'bg-gray-100 text-gray-900 border-transparent';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} userRole={userRole} />

      <main className="mx-auto max-w-[1120px] px-10 py-7">
        {/* Page Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold leading-[28.8px] tracking-[-0.48px] text-gray-900">
              Projects
            </h1>
            <p className="mt-2 text-sm leading-[21px] text-gray-500">
              Manage your project submittals and specifications
            </p>
          </div>
          <button
            onClick={handleCreateNewProject}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium leading-5 text-white transition-colors hover:bg-blue-700"
          >
            <FiPlus size={14} />
            Create New Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-error" role="alert">
            {error}
          </div>
        )}

        {/* Initial Loading State - Just Spinner */}
        {isInitialLoad && isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : projects.length === 0 && !isLoading ? (
          <div className="rounded-[10px] border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No projects found. Create your first project!</p>
          </div>
        ) : (
          /* Projects Table */
          <div className="max-h-[600px] overflow-y-auto overflow-x-hidden rounded-[10px] border border-gray-200 bg-white">
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
                {/* Sort Loading State - Spinner in tbody */}
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
                        <span className="text-sm font-medium leading-5 text-primary">
                          {project.projectName}
                        </span>
                      </td>
                      <td className="px-3.5 py-4">
                        <span
                          className={`inline-flex h-[25.59px] items-center rounded-md border px-2.5 text-xs font-medium leading-4 ${getTypeBadgeClass(project.projectType)}`}
                        >
                          {project.projectType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium leading-5 text-gray-700">
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
