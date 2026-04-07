import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from './ProjectDetail.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { PDFViewer } from '@/ui/reusables/PDFViewer/PDFViewer.tsx';
import { ProgressLoader } from '@/ui/reusables/ProgressLoader/ProgressLoader.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { SpecificationManual } from '@/ui/screens/SpecificationManual/SpecificationManual.tsx';
import { Submittal } from '@/ui/screens/Submittal/Submittal.tsx';
import { AIResult } from '@/ui/screens/AIResult/AIResult.tsx';
import { useUserName, useUserRole } from '@/helpers/utilities/useUser.ts';
import { formatDateToLocal } from '@/helpers/utilities/formatters.ts';
import { FiArrowLeft, FiFileText, FiTrash2, FiX } from 'react-icons/fi';

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
    isDeletingSubmittalId,
    activeTab,
    selectedDocumentUrl,
    selectedDocumentTitle,
    showPDFViewer,
    showProgressPopup,
    isNewSpecManualModalOpen,
    isNewSubmittalModalOpen,
    selectedResultSubmittalId,
    pendingDeleteSpecDocumentId,
    isDeletingSpecDocumentId,
    pendingDeleteSubmittalId,
    inProgressSubmittals,
    handleTabChange,
    handleSpecDocumentClick,
    handleClosePDFViewer,
    handleCloseProgressPopup,
    handleCloseNewSpecManualModal,
    handleCloseNewSubmittalModal,
    handleOpenResultModal,
    handleCloseResultModal,
    handleNewSpecManual,
    isNewSpecManualEnabled,
    handleNewSubmittal,
    handleSubmittalClick,
    handleRequestDeleteSubmittal,
    handleRequestDeleteSpecDocument,
    handleCancelDeleteSubmittal,
    handleCancelDeleteSpecDocument,
    handleDeleteSubmittal,
    handleDeleteSpecDocument,
    isSubmittalDisabled,
    navigateBack,
    refreshProjectDetails,
  } = useProjectDetail(projectId!);

  const userName = useUserName();
  const userRole = useUserRole();

  const pendingDeleteSubmittal = submittals.find(
    (submittal) => submittal.submittalId === pendingDeleteSubmittalId
  );
  const pendingDeleteSpecDocument = specificationDocuments.find(
    (document) => document.documentId === pendingDeleteSpecDocumentId
  );

  useEffect(() => {
    if (!pendingDeleteSubmittalId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeletingSubmittalId) {
        handleCancelDeleteSubmittal();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleCancelDeleteSubmittal, isDeletingSubmittalId, pendingDeleteSubmittalId]);

  const getStatusBadgeConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#20C443]',
          textClass: 'text-[#2A2A2A]',
        };
      case 'NON_COMPLIANT':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#DF1616]',
          textClass: 'text-[#2A2A2A]',
        };
      case 'PARTIALLY_COMPLIANT':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#F59E0B]',
          textClass: 'text-[#2A2A2A]',
        };
      case 'IN_PROGRESS':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#4485F1]',
          textClass: 'text-[#2A2A2A]',
        };
      case 'FAILED':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#DF1616]',
          textClass: 'text-[#2A2A2A]',
        };
      case 'PENDING':
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#4485F1]',
          textClass: 'text-[#2A2A2A]',
        };
      default:
        return {
          containerClass: 'bg-[#F6F6F6] pl-[4px] pr-[8px] text-[#2A2A2A]',
          dotClass: 'bg-[#909090]',
          textClass: 'text-[#2A2A2A]',
        };
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format division tag
  const formatDivisionTag = (tag: string) => {
    if (tag === 'completemanual') return 'Full Spec';
    if (tag === 'division15') return 'Mechanical';
    if (tag === 'division16') return 'Electrical';
    return tag;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
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
      <div className="min-h-screen bg-[#F6F6F6]">
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
    <div className="min-h-screen bg-[#F6F6F6]">
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

        {/* Tab Navigation */}
        <div className="mb-6 inline-flex h-[30px] items-center gap-[2px] overflow-hidden rounded-[6px] bg-[#E4E4E4] p-[2px]">
          <button
            onClick={() => handleTabChange('submittals')}
            className={`flex h-full items-center justify-center rounded-[4px] px-[10px] text-[14px] font-normal leading-none transition-all ${
              activeTab === 'submittals'
                ? 'bg-white text-[#2A2A2A] shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]'
                : 'text-[#909090] hover:text-[#2A2A2A]'
            }`}
          >
            Submittals
          </button>
          <button
            onClick={() => handleTabChange('spec-manual')}
            className={`flex h-full items-center justify-center rounded-[4px] px-[10px] text-[14px] font-normal leading-none transition-all ${
              activeTab === 'spec-manual'
                ? 'bg-white text-[#2A2A2A] shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]'
                : 'text-[#909090] hover:text-[#2A2A2A]'
            }`}
          >
            Specification Manuals
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'spec-manual' ? (
          <div>
            {/* Section Header */}
            <div className="mb-6 flex h-10 items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold leading-[28px] text-[#111827]">
                  Specification Manuals
                </h2>
                <span className="flex h-[26px] min-w-[29px] items-center justify-center rounded-full bg-[#DBEAFE] px-3 text-[12px] font-medium leading-[18px] text-[#1E40AF]">
                  {specificationDocumentsCount}
                </span>
              </div>
              {isNewSpecManualEnabled() ? (
                <button onClick={handleNewSpecManual} className="btn-ds-primary-sm">
                  Add Specification Manual
                </button>
              ) : (
                <div className="h-[30px] min-w-[180px]" aria-hidden="true" />
              )}
            </div>

            {/* Table or Empty State */}
            {specificationDocuments.length === 0 ? (
              <div className="overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-white">
                <p className="py-8 text-center text-sm leading-5 text-[#6B7280]">
                  No specification manuals uploaded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-white">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Document Name
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Type
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Uploaded
                      </th>
                      <th className="px-7 py-[8.75px] text-right text-sm font-semibold leading-5 text-gray-700"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {specificationDocuments.map((doc, index) => (
                      <tr
                        key={doc.documentId}
                        onClick={() => handleSpecDocumentClick(doc.s3Url, doc.documentName)}
                        className={`group cursor-pointer transition-colors hover:bg-[#F9FAFB] ${
                          index !== specificationDocuments.length - 1
                            ? 'border-b border-[#E5E7EB]'
                            : ''
                        }`}
                      >
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-[10.5px]">
                            <FiFileText size={17.5} className="flex-shrink-0 text-[#3B82F6]" />
                            <span className="text-sm font-medium leading-5 text-[#2A2A2A]">
                              {doc.documentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-7 py-4 text-left">
                          <span className="inline-flex h-6 max-w-[200px] items-center overflow-hidden rounded-[4px] border border-transparent bg-[#F6F6F6] px-[6px] text-[12px] font-normal leading-none text-[#2A2A2A]">
                            {formatDivisionTag(doc.documentTag)}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <span className="text-sm font-medium leading-5 text-[#2A2A2A]">
                            {formatDateToLocal(doc.date)}
                          </span>
                        </td>
                        <td className="px-7 py-4 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRequestDeleteSpecDocument(doc.documentId);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6A7282] opacity-0 transition-all hover:bg-[#F9FAFB] hover:text-[#B42318] focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${doc.documentName}`}
                            disabled={isDeletingSpecDocumentId === doc.documentId}
                          >
                            <FiTrash2 size={14} />
                          </button>
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
            <div className="mb-6 flex h-10 items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-semibold leading-[28px] text-[#111827]">
                  Submittal Analysis
                </h2>
                <span className="flex h-[26px] min-w-[29px] items-center justify-center rounded-full bg-[#DBEAFE] px-3 text-[12px] font-medium leading-[18px] text-[#1E40AF]">
                  {submittalsCount}
                </span>
              </div>
              <button
                onClick={handleNewSubmittal}
                className="btn-ds-primary-sm"
              >
                  New Submittal Analysis
              </button>
            </div>

            {/* Table or Empty State */}
            {submittals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[4px] border border-[#E5E7EB] bg-white py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <FiFileText size={32} className="text-[#BDBDBD]" />
                </div>
                <p className="text-sm leading-5 text-[#757575]">No submittals yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-white">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Subject
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Spec Section
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Status
                      </th>
                      <th className="px-7 py-[8.75px] text-left text-sm font-semibold leading-5 text-gray-700">
                        Date
                      </th>
                      <th className="px-7 py-[8.75px] text-right text-sm font-semibold leading-5 text-gray-700">
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittals.map((submittal, index) => (
                      <tr
                        key={submittal.submittalId}
                        onClick={() => handleSubmittalClick(submittal)}
                        className={`group transition-colors ${
                          index !== submittals.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                        } ${
                          isSubmittalDisabled(submittal.overallStatus)
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <td className="px-7 py-4">
                          <span
                            className={`text-sm font-medium leading-5 ${
                              isSubmittalDisabled(submittal.overallStatus)
                                ? 'text-[#6A7282]'
                                : 'text-[#2A2A2A]'
                            }`}
                          >
                            {submittal.submittalTitle}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          <span className="inline-flex h-6 max-w-[200px] items-center overflow-hidden rounded-[4px] border border-transparent bg-[#F6F6F6] px-[6px] text-[12px] font-normal leading-none text-[#2A2A2A]">
                            {submittal.specSection}
                          </span>
                        </td>
                        <td className="px-7 py-4">
                          {(() => {
                            const badge = getStatusBadgeConfig(submittal.overallStatus);

                            return (
                              <span
                                className={`inline-flex h-[18px] items-center gap-1 overflow-hidden rounded-[9px] ${badge.containerClass}`}
                              >
                                {badge.dotClass && (
                                  <span
                                    className={`h-[10px] w-[10px] shrink-0 rounded-full ${badge.dotClass}`}
                                    aria-hidden="true"
                                  />
                                )}
                                <span
                                  className={`whitespace-nowrap text-[12px] font-normal leading-none ${badge.textClass}`}
                                >
                                  {formatStatus(submittal.overallStatus)}
                                </span>
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-7 py-4 text-sm font-medium leading-5 text-[#2A2A2A]">
                          {formatDateToLocal(submittal.date)}
                        </td>
                        <td className="px-7 py-4 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRequestDeleteSubmittal(submittal.submittalId);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6A7282] opacity-0 transition-all hover:bg-[#F9FAFB] hover:text-[#B42318] focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${submittal.submittalTitle}`}
                            disabled={isDeletingSubmittalId === submittal.submittalId}
                          >
                            <FiTrash2 size={14} />
                          </button>
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
          documentName={selectedDocumentTitle ?? 'Specification Manual'}
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

      {isNewSubmittalModalOpen && (
        <Submittal
          projectIdOverride={projectId!}
          modalMode
          onClose={handleCloseNewSubmittalModal}
          onComplete={async (submittalId) => {
            await refreshProjectDetails();
            handleCloseNewSubmittalModal();
            handleOpenResultModal(submittalId);
          }}
        />
      )}

      {isNewSpecManualModalOpen && (
        <SpecificationManual
          projectIdOverride={projectId!}
          modalMode
          onClose={handleCloseNewSpecManualModal}
          onSuccess={async () => {
            handleCloseNewSpecManualModal();
            await refreshProjectDetails();
          }}
        />
      )}

      {selectedResultSubmittalId && (
        <AIResult
          projectIdOverride={projectId!}
          submittalIdOverride={selectedResultSubmittalId}
          modalMode
          onClose={handleCloseResultModal}
          onStartNewSubmittal={() => {
            handleCloseResultModal();
            handleNewSubmittal();
          }}
        />
      )}

      {pendingDeleteSubmittalId && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#101828]/45 px-4 py-10"
          onClick={() => {
            if (!isDeletingSubmittalId) {
              handleCancelDeleteSubmittal();
            }
          }}
        >
          <div
            className="relative flex w-full min-w-[400px] max-w-[800px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-submittal-title"
          >
            <div className="border-b border-[#EEEEEE] bg-white px-6 py-6">
              <button
                type="button"
                onClick={handleCancelDeleteSubmittal}
                className="absolute right-6 top-6 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close delete confirmation"
                disabled={Boolean(isDeletingSubmittalId)}
              >
                <FiX size={16} />
              </button>
              <h2
                id="delete-submittal-title"
                className="pr-10 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]"
              >
                Remove Submittal
              </h2>
              <p className="mt-4 max-w-[560px] text-[14px] leading-[21px] text-[#4A5565]">
                {pendingDeleteSubmittal
                  ? `Are you sure you want to remove "${pendingDeleteSubmittal.submittalTitle}" from this project?`
                  : 'Are you sure you want to remove this submittal from this project?'}
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-end gap-4 bg-white px-4 py-4">
              <button
                type="button"
                onClick={handleCancelDeleteSubmittal}
                className="btn-ds-secondary-sm disabled:opacity-40"
                disabled={Boolean(isDeletingSubmittalId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSubmittal(pendingDeleteSubmittalId)}
                className="btn-ds-destructive-sm disabled:opacity-40"
                disabled={Boolean(isDeletingSubmittalId)}
              >
                {isDeletingSubmittalId ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteSpecDocumentId && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#101828]/45 px-4 py-10"
          onClick={() => {
            if (!isDeletingSpecDocumentId) {
              handleCancelDeleteSpecDocument();
            }
          }}
        >
          <div
            className="relative flex w-full min-w-[400px] max-w-[800px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-spec-document-title"
          >
            <div className="border-b border-[#EEEEEE] bg-white px-6 py-6">
              <button
                type="button"
                onClick={handleCancelDeleteSpecDocument}
                className="absolute right-6 top-6 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close delete specification manual confirmation"
                disabled={Boolean(isDeletingSpecDocumentId)}
              >
                <FiX size={16} />
              </button>
              <h2
                id="delete-spec-document-title"
                className="pr-10 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]"
              >
                Remove Specification Manual
              </h2>
              <p className="mt-4 max-w-[560px] text-[14px] leading-[21px] text-[#4A5565]">
                {pendingDeleteSpecDocument
                  ? `Are you sure you want to remove "${pendingDeleteSpecDocument.documentName}" from this project?`
                  : 'Are you sure you want to remove this specification manual from this project?'}
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-end gap-4 bg-white px-4 py-4">
              <button
                type="button"
                onClick={handleCancelDeleteSpecDocument}
                className="btn-ds-secondary-sm disabled:opacity-40"
                disabled={Boolean(isDeletingSpecDocumentId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSpecDocument(pendingDeleteSpecDocumentId)}
                className="btn-ds-destructive-sm disabled:opacity-40"
                disabled={Boolean(isDeletingSpecDocumentId)}
              >
                {isDeletingSpecDocumentId ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
