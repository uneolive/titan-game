import { useParams } from 'react-router-dom';
import { useProjectDetail } from './ProjectDetail.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { PDFViewer } from '@/ui/reusables/PDFViewer/PDFViewer.tsx';
import { ProgressLoader } from '@/ui/reusables/ProgressLoader/ProgressLoader.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { useUserName, useUserRole } from '@/helpers/utilities/useUser.ts';
import { FiArrowLeft, FiPlus, FiFileText } from 'react-icons/fi';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    project,
    specificationDocuments,
    submittals,
    specificationDocumentsCount,
    submittalsCount,
    isLoading,
    error,
    activeTab,
    selectedDocumentUrl,
    showPDFViewer,
    showProgressPopup,
    inProgressSubmittals,
    handleTabChange,
    handleSpecDocumentClick,
    handleClosePDFViewer,
    handleCloseProgressPopup,
    handleNewSpecManual,
    isNewSpecManualEnabled,
    handleNewSubmittal,
    handleSubmittalClick,
    isSubmittalDisabled,
    navigateBack,
  } = useProjectDetail(projectId!);

  const userName = useUserName();
  const userRole = useUserRole();

  // Status badge helper
  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return 'bg-[#F0FDF4] text-[#008236] border-[#B9F8CF]';
      case 'NON_COMPLIANT':
        return 'bg-[#FEFCE8] text-[#A65F00] border-[#FFF085]';
      case 'PARTIALLY_COMPLIANT':
        return 'bg-[#FEFCE8] text-[#A65F00] border-[#FFF085]';
      case 'IN_PROGRESS':
        return 'bg-[#EFF6FF] text-[#1447E6] border-[#BEDBFF]';
      case 'FAILED':
        return 'bg-[#FEF2F2] text-[#C10007] border-[#FFC9C9]';
      case 'PENDING':
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
    }
  };

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return (
          <svg width="10.5" height="10.5" viewBox="0 0 11 11" fill="none">
            <circle cx="5.25" cy="5.25" r="5.25" fill="#008236" />
            <path
              d="M7.875 3.9375L4.8125 6.5625L3.9375 5.6875"
              stroke="white"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'NON_COMPLIANT':
        return (
          <svg width="10.5" height="10.5" viewBox="0 0 11 11" fill="none">
            <circle cx="5.25" cy="5.25" r="5.25" fill="#A65F00" />
            <path
              d="M5.25 3.0625V5.6875M5.25 7.4375H5.25438"
              stroke="white"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <svg width="10.5" height="10.5" viewBox="0 0 11 11" fill="none">
            <circle cx="5.25" cy="5.25" r="5.25" fill="#A65F00" />
            <path
              d="M5.25 3.0625V5.6875M5.25 7.4375H5.25438"
              stroke="white"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'IN_PROGRESS':
        return (
          <svg width="10.5" height="10.5" viewBox="0 0 11 11" fill="none">
            <circle cx="5.25" cy="5.25" r="5.25" fill="#1447E6" />
            <path
              d="M5.25 2.625V5.25L6.5625 6.5625"
              stroke="white"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'FAILED':
        return (
          <svg width="10.5" height="10.5" viewBox="0 0 11 11" fill="none">
            <circle cx="5.25" cy="5.25" r="5.25" fill="#C10007" />
            <path
              d="M6.5625 3.9375L3.9375 6.5625M3.9375 3.9375L6.5625 6.5625"
              stroke="white"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Progress bar color helper
  const getProgressBarColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return 'bg-[#00BC7D]';
      case 'NON_COMPLIANT':
        return 'bg-[#F0B100]';
      case 'PARTIALLY_COMPLIANT':
        return 'bg-[#F0B100]';
      case 'IN_PROGRESS':
        return 'bg-[#FF6900]';
      case 'FAILED':
        return 'bg-[#FB2C36]';
      default:
        return 'bg-[#1976D2]';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format division tag
  const formatDivisionTag = (tag: string) => {
    if (tag === 'completemanual') return 'Complete Manual';
    return tag;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header userName={userName} userRole={userRole} />
        <main className="mx-auto max-w-[1120px] px-10 py-8">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header userName={userName} userRole={userRole} />
        <main className="mx-auto max-w-[1120px] px-10 py-8">
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
            <div
              className="mb-4 rounded-[8px] bg-[#FFEBEE] p-4 text-[14px] leading-[20px] text-[#C62828]"
              role="alert"
            >
              {error}
            </div>
            <button
              onClick={navigateBack}
              className="flex items-center gap-2 text-[14px] font-normal leading-[20px] text-[#6B7280] transition-colors hover:text-[#0F172A]"
            >
              <FiArrowLeft size={14} />
              Back to Projects
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={userName} userRole={userRole} />

      <main className="mx-auto max-w-[1120px] px-10 py-6">
        {/* Back Button */}
        <button
          onClick={navigateBack}
          className="mb-6 flex items-center gap-2 text-[14px] font-normal leading-5 text-[#0F172A] transition-colors hover:text-[#1E293B]"
        >
          <FiArrowLeft size={14} />
          Back to Projects
        </button>

        {/* Project Name */}
        <h1 className="mb-8 text-[24px] font-semibold leading-[28.8px] tracking-[-0.48px] text-[#0F172A]">
          {project?.projectName}
        </h1>

        {/* Tab Navigation - Pill Style */}
        <div className="mb-6 inline-flex h-[31.5px] rounded-[12px] bg-[#F3F4F6] p-[3.5px]">
          <button
            onClick={() => handleTabChange('spec-manual')}
            className={`rounded-[12px] px-4 text-[12.3px] font-medium leading-[17.5px] transition-all ${
              activeTab === 'spec-manual'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#0F172A] hover:text-[#1E293B]'
            }`}
          >
            Specification Manual
          </button>
          <button
            onClick={() => handleTabChange('submittals')}
            className={`rounded-[12px] px-4 text-[12.3px] font-medium leading-[17.5px] transition-all ${
              activeTab === 'submittals'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#0F172A] hover:text-[#1E293B]'
            }`}
          >
            Submittals
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'spec-manual' ? (
          <div>
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold leading-[28px] text-[#111827]">
                  Specification Manuals
                </h2>
                <span className="flex h-[26px] min-w-[29px] items-center justify-center rounded-full bg-[#DBEAFE] px-3 text-[12px] font-medium leading-[18px] text-[#1E40AF]">
                  {specificationDocumentsCount}
                </span>
              </div>
              {isNewSpecManualEnabled() && (
                <button
                  onClick={handleNewSpecManual}
                  className="flex h-10 items-center gap-2 rounded-[10px] bg-[#1976D2] px-4 text-[14px] font-medium leading-5 text-white transition-colors hover:bg-[#1565C0]"
                >
                  <FiPlus size={14} />
                  New Spec Manual
                </button>
              )}
            </div>

            {/* Table or Empty State */}
            {specificationDocuments.length === 0 ? (
              <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
                <p className="py-8 text-center text-[12.3px] leading-[17.5px] text-[#6B7280]">
                  No specification manuals uploaded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Document Name
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Uploaded
                      </th>
                      <th className="px-7 py-[8.75px] text-right text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        {/* Empty header for badge column */}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {specificationDocuments.map((doc, index) => (
                      <tr
                        key={doc.documentId}
                        onClick={() => handleSpecDocumentClick(doc.s3Url)}
                        className={`cursor-pointer transition-colors hover:bg-[#F9FAFB] ${
                          index !== specificationDocuments.length - 1
                            ? 'border-b border-[#E5E7EB]'
                            : ''
                        }`}
                      >
                        <td className="px-7 py-[8.19px]">
                          <div className="flex items-center gap-[10.5px]">
                            <FiFileText size={17.5} className="flex-shrink-0 text-[#3B82F6]" />
                            <span className="text-[12.3px] font-medium leading-[17.5px] text-[#3B82F6] hover:underline">
                              {doc.documentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-7 py-[7.4px]">
                          <span className="text-[12.3px] font-normal leading-[17.5px] text-[#6B7280]">
                            {new Date(doc.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-7 py-[7.4px] text-right">
                          <span className="inline-flex items-center rounded-[8px] bg-[#2563EB] px-3 py-[2.5px] text-[10.5px] font-medium leading-[14px] text-white">
                            {formatDivisionTag(doc.documentTag)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold leading-[28px] text-[#111827]">
                  Submittals
                </h2>
                <span className="flex h-[26px] min-w-[29px] items-center justify-center rounded-full bg-[#DBEAFE] px-3 text-[12px] font-medium leading-[18px] text-[#1E40AF]">
                  {submittalsCount}
                </span>
              </div>
              <button
                onClick={handleNewSubmittal}
                className="flex h-10 items-center gap-2 rounded-[10px] bg-[#1976D2] px-4 text-[14px] font-medium leading-5 text-white transition-colors hover:bg-[#1565C0]"
              >
                <FiPlus size={14} />
                New Submittal
              </button>
            </div>

            {/* Table or Empty State */}
            {submittals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <FiFileText size={32} className="text-[#BDBDBD]" />
                </div>
                <p className="text-[14px] leading-5 text-[#757575]">No submittals yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Submittal Title
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Spec Section
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Status
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Progress
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-[12.3px] font-medium leading-[17.5px] text-[#0F172A]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittals.map((submittal, index) => (
                      <tr
                        key={submittal.submittalId}
                        onClick={() => handleSubmittalClick(submittal)}
                        className={`transition-colors ${
                          index !== submittals.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                        } ${
                          isSubmittalDisabled(submittal.overallStatus)
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <td className="px-7 py-4">
                          <span
                            className={`text-[12.3px] font-medium leading-[17.5px] ${
                              isSubmittalDisabled(submittal.overallStatus)
                                ? 'text-[#6A7282]'
                                : 'text-[#3B82F6]'
                            }`}
                          >
                            {submittal.submittalTitle}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <span className="inline-flex items-center rounded-[8px] border border-transparent bg-[#3B82F6] px-2.5 py-[2.5px] text-[10.5px] font-medium leading-[14px] text-white">
                            {submittal.specSection}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-[2.5px] text-[10.5px] font-normal leading-[14px] ${getStatusBadgeClass(submittal.overallStatus)}`}
                          >
                            {getStatusIcon(submittal.overallStatus)}
                            {formatStatus(submittal.overallStatus)}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-[8.75px] w-[120px] overflow-hidden rounded-full bg-[#E5E7EB]">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(submittal.overallStatus)}`}
                                style={{ width: `${submittal.progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10.5px] font-medium leading-[14px] text-[#364153]">
                              {submittal.progressPct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-7 py-4 text-[12.3px] font-normal leading-[17.5px] text-[#4A5565]">
                          {new Date(submittal.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PDF Viewer Modal */}
      {showPDFViewer && selectedDocumentUrl && (
        <PDFViewer
          s3Url={selectedDocumentUrl}
          documentName="Specification Document"
          isOpen={showPDFViewer}
          onClose={handleClosePDFViewer}
        />
      )}

      {/* Progress Loader for in-progress submittals */}
      {showProgressPopup && inProgressSubmittals.has(showProgressPopup) && (
        <ProgressLoader
          submittalId={showProgressPopup}
          isOpen={true}
          progressData={inProgressSubmittals.get(showProgressPopup)!.progressData}
          onClose={handleCloseProgressPopup}
        />
      )}
    </div>
  );
}
