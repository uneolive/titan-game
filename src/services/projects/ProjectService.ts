import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { ProjectsListDataDTO } from './types/ProjectsListResponseDTO.ts';

const seededProjects: ProjectsListDataDTO['projects'] = [
  {
    projectId: '101',
    projectName: 'Downtown Office Tower',
    projectType: 'Construction',
    submittalsCount: 2,
  },
  {
    projectId: '102',
    projectName: 'Riverside Medical Center',
    projectType: 'Engineering',
    submittalsCount: 1,
  },
  {
    projectId: '103',
    projectName: 'Harbor Point Residences',
    projectType: 'Architecture',
    submittalsCount: 2,
  },
  {
    projectId: '104',
    projectName: 'North Valley Data Center',
    projectType: 'Construction',
    submittalsCount: 3,
  },
];

export async function getProjects(
  sortBy: string = 'project_name',
  sortOrder: string = 'asc'
): Promise<ServiceResult<ProjectsListDataDTO>> {
  const direction = sortOrder === 'desc' ? -1 : 1;

  const projects = [...seededProjects].sort((left, right) => {
    const leftValue =
      sortBy === 'project_type'
        ? left.projectType
        : sortBy === 'submittals_count'
          ? left.submittalsCount
          : left.projectName;
    const rightValue =
      sortBy === 'project_type'
        ? right.projectType
        : sortBy === 'submittals_count'
          ? right.submittalsCount
          : right.projectName;

    if (leftValue < rightValue) return -1 * direction;
    if (leftValue > rightValue) return 1 * direction;
    return 0;
  });

  return {
    data: { projects },
    message: 'Success',
    statusCode: ServiceResultStatusENUM.SUCCESS,
  };
}
