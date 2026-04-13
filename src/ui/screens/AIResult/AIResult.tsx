import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAIResult } from './AIResult.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { PDFViewer } from '@/ui/reusables/PDFViewer/PDFViewer.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { FiArrowLeft, FiPlus, FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import { formatConfidenceScore } from '@/helpers/utilities/formatters.ts';

interface AIResultProps {
  modalMode?: boolean;
  sharedModalShell?: boolean;
  onClose?: () => void;
  onStartNewSubmittal?: () => void;
  projectIdOverride?: string;
  submittalIdOverride?: string;
}

export function AIResult({
  modalMode = false,
  sharedModalShell = false,
  onClose,
  onStartNewSubmittal,
  projectIdOverride,
  submittalIdOverride,
}: AIResultProps = {}) {
  const { projectId, submittalId } = useParams<{ projectId: string; submittalId: string }>();
  const resolvedProjectId = projectIdOverride ?? projectId ?? '';
  const resolvedSubmittalId = submittalIdOverride ?? submittalId ?? '';
  const {
    resultData,
    isLoading,
    error,
    selectedDocumentUrl,
    selectedDocumentTitle,
    isPDFViewerOpen,
    handleViewSpecDocument,
    handleViewSubmittalDocument,
    handleClosePDFViewer,
    navigateToProjects,
    navigateToNewSubmittal,
  } = useAIResult(resolvedProjectId, resolvedSubmittalId);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const handleBack = onClose ?? navigateToProjects;
  const handleNew = onStartNewSubmittal ?? navigateToNewSubmittal;

  useEffect(() => {
    if (!modalMode || sharedModalShell) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleBack, modalMode, sharedModalShell]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        {!modalMode && <Header userName={userName} userRole="User" />}
        <main className="mx-auto flex min-h-[calc(100vh-200px)] w-[1200px] items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="#2563eb" />
            <p className="text-[14px] text-[#4A5565]">Loading analysis results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        {!modalMode && <Header userName={userName} userRole="User" />}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="card">
            <div className="mb-4 rounded bg-red-50 p-4 text-error" role="alert">
              {error || 'Failed to load results'}
            </div>
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <FiArrowLeft />
              Back to Submittals
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formattedStatus = resultData.overallStatus
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const getStatusTone = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return {
          panel: 'border-[#B9F8CF] bg-[#F0FDF4]',
          icon: 'text-[#008236]',
          title: 'text-[#0D542B]',
          body: 'text-[#166534]',
          dot: 'bg-[#20C443]',
          message: 'All requirements have been met',
        };
      case 'NON_COMPLIANT':
      case 'FAILED':
        return {
          panel: 'border-[#F3B8B8] bg-[#FBE9E9]',
          icon: 'text-[#DF1616]',
          title: 'text-[#9C0F0F]',
          body: 'text-[#C0141E]',
          dot: 'bg-[#DF1616]',
          message: status.toUpperCase() === 'FAILED' ? 'The analysis could not be completed' : 'Some requirements are not met',
        };
      case 'PARTIALLY_COMPLIANT':
        return {
          panel: 'border-[#FFE2B8] bg-[#FFF7ED]',
          icon: 'text-[#C05600]',
          title: 'text-[#7C2D12]',
          body: 'text-[#9A3412]',
          dot: 'bg-[#F59E0B]',
          message: 'Some requirements are only partially met',
        };
      case 'IN_PROGRESS':
      case 'PENDING':
      default:
        return {
          panel: 'border-[#BEDBFF] bg-[#EFF6FF]',
          icon: 'text-[#4485F1]',
          title: 'text-[#1D4ED8]',
          body: 'text-[#1E40AF]',
          dot: 'bg-[#4485F1]',
          message: status.toUpperCase() === 'PENDING' ? 'Analysis is queued to begin' : 'Analysis is currently in progress',
        };
    }
  };
  const statusTone = getStatusTone(resultData.overallStatus);

  const getStatusBadgeConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return { dotClass: 'bg-[#20C443]' };
      case 'NON_COMPLIANT':
      case 'FAILED':
        return { dotClass: 'bg-[#DF1616]' };
      case 'PARTIALLY_COMPLIANT':
        return { dotClass: 'bg-[#F59E0B]' };
      case 'IN_PROGRESS':
      case 'PENDING':
        return { dotClass: 'bg-[#4485F1]' };
      default:
        return { dotClass: 'bg-[#909090]' };
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
        return <FiCheck className={`size-[40px] ${statusTone.icon}`} />;
      case 'NON_COMPLIANT':
      case 'FAILED':
        return <FiX className={`size-[40px] ${statusTone.icon}`} />;
      case 'PARTIALLY_COMPLIANT':
        return <FiAlertCircle className={`size-[40px] ${statusTone.icon}`} />;
      case 'IN_PROGRESS':
      case 'PENDING':
      default:
        return <FiClock className={`size-[40px] ${statusTone.icon}`} />;
    }
  };

  const content = (
    <div className={modalMode ? 'flex min-h-0 flex-1 flex-col bg-white' : 'min-h-screen bg-[#F6F6F6]'}>
      {!modalMode && <Header userName={userName} userRole="User" />}

      <main
        className={
          modalMode
            ? 'min-h-0 flex-1 overflow-y-auto px-6 py-6'
            : 'mx-auto max-w-7xl px-6 py-8'
        }
      >
        <div className="space-y-6">
          {/* Page Title */}
          {!modalMode && (
            <div className="space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#667085]">
                AI review
              </p>
              <h1 className="text-[24px] font-semibold tracking-[-0.48px] text-[#101828]">
                AI Analysis Results
              </h1>
            </div>
          )}

          {!modalMode && (
            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBack}
              className="btn-ds-secondary-md"
            >
              <FiArrowLeft className="size-[14px] text-[#364153]" />
              <span>Back to Submittals</span>
            </button>
            <button
              onClick={handleNew}
              className="btn-ds-primary-sm"
            >
              <FiPlus className="size-[14px]" />
              <span>Start New Submittal</span>
              </button>
            </div>
          )}

          <div className={`rounded-[4px] border px-[25px] py-[21px] ${statusTone.panel}`}>
            <div className="flex items-start gap-4">
              <div className="mt-[2px] size-[40px] flex-shrink-0">
                {renderStatusIcon(resultData.overallStatus)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                  <span
                    className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${statusTone.body}`}
                  >
                    Overall status
                  </span>
                </div>
                <h3 className={`text-[18px] font-semibold leading-6 ${statusTone.title}`}>
                  Submittal is {formattedStatus}
                </h3>
                <p className={`text-[14px] leading-[21px] ${statusTone.body}`}>
                  {statusTone.message}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[4px] border border-[#DCE3EA] bg-white p-[25px] shadow-sm">
            <div className="max-w-[586px] space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Submittal Title
                  </p>
                  <p className="whitespace-normal break-words text-[16px] font-medium leading-6 text-[#101828]">
                    {resultData.submittalTitle}
                  </p>
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    Specification Section
                  </p>
                  <p className="whitespace-normal break-words text-[16px] font-medium leading-6 text-[#101828]">
                    {resultData.specSection}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                  Summary
                </p>
                <p className="whitespace-normal break-words text-[14px] leading-[22px] text-[#364153]">
                  {resultData.complianceSummary}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                  Recommendation
                </p>
                <p className="whitespace-normal break-words text-[14px] leading-[22px] text-[#364153]">
                  {resultData.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Specification Comparison */}
          <div className="overflow-hidden rounded-[4px] border border-[#DCE3EA] bg-white shadow-sm">
            {/* Header with badges */}
            <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-[18px] font-semibold leading-6 text-[#111827]">
                Detailed Specification Comparison
              </h3>
              <div className="flex flex-wrap gap-3">
                {/* Compliant Badge */}
                <div className="flex min-h-12 items-center gap-2 rounded-[4px] border border-[#B9F8CF] bg-[#F0FDF4] px-4">
                  <FiCheck className="size-[14px] text-[#20C443]" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] font-semibold leading-[17px] text-[#0D542B]">
                      {resultData.compliantCount}
                    </span>
                    <span className="text-[11px] leading-[14px] text-[#20C443]">Compliant</span>
                  </div>
                </div>
                {/* Non-Compliant Badge */}
                <div className="flex min-h-12 items-center gap-2 rounded-[4px] border border-[#F3B8B8] bg-[#FBE9E9] px-4">
                  <FiX className="size-[14px] text-[#DF1616]" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] font-semibold leading-[17px] text-[#9C0F0F]">
                      {resultData.noncompliantCount}
                    </span>
                    <span className="text-[11px] leading-[14px] text-[#DF1616]">Non-compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
              <table className="min-w-[980px] w-full">
                <thead className="sticky top-0 bg-[#F9FAFB]">
                  <tr className="border-b border-[#D1D5DC]">
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Item
                    </th>
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Reference Value
                    </th>
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Submittal Value
                    </th>
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Status
                    </th>
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Confidence Score
                    </th>
                    <th className="h-12 px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
                      Review Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.findings.map((finding, index) => {
                    const statusBadge = getStatusBadgeConfig(finding.status);
                    const formattedFindingStatus = finding.status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <tr
                        key={index}
                        className="min-h-12 border-b border-[#E5E7EB] align-top bg-white"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <span className="text-[13px] font-semibold leading-[18px] text-[#101828]">
                              {finding.specRequirement}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <div className="rounded-[10px] border border-[#D0D5DD] bg-[#F8FAFC] px-3 py-2">
                              <span className="block break-words text-[13px] leading-[18px] text-[#344054]">
                                {finding.referenceValue || '-'}
                              </span>
                            </div>
                            {finding.specReference && finding.specReference.s3Url && (
                              <button
                                onClick={() => handleViewSpecDocument(finding.specReference.s3Url)}
                                className="cursor-pointer text-[12px] font-medium leading-4 text-[#1976D2] underline underline-offset-2"
                              >
                                Section {resultData.specSection}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <div
                              className="rounded-[10px] border border-[#D0D5DD] bg-white px-3 py-2"
                            >
                              <span
                                className="block break-words text-[13px] leading-[18px] text-[#344054]"
                              >
                                {finding.submittalValue}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleViewSubmittalDocument(finding.submittalReference.s3Url)
                              }
                              className="cursor-pointer text-[12px] font-medium leading-4 text-[#1976D2] underline underline-offset-2"
                            >
                              Submittal document
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex h-[18px] items-center gap-1 overflow-hidden rounded-[9px] bg-[#F6F6F6] pl-[4px] pr-[8px]">
                            <span
                              className={`h-[10px] w-[10px] shrink-0 rounded-full ${statusBadge.dotClass}`}
                              aria-hidden="true"
                            />
                            <span className="whitespace-nowrap text-[12px] font-normal leading-none text-[#2A2A2A]">
                              {formattedFindingStatus}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div
                            className={`inline-flex min-h-8 items-center justify-center rounded-[10px] px-3 ${
                              finding.confidenceScore >= 0.9 ? 'bg-[#DCFCE7]' : 'bg-[#FEF9C2]'
                            }`}
                          >
                            <span
                              className={`text-[12px] font-semibold leading-[17px] ${
                                finding.confidenceScore >= 0.9 ? 'text-[#016630]' : 'text-[#894B00]'
                              }`}
                            >
                              {formatConfidenceScore(finding.confidenceScore)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`text-[13px] leading-[18px] ${
                              finding.reviewNotes === 'No notes'
                                ? 'italic text-[#99A1AF]'
                                : 'text-[#364153]'
                            }`}
                          >
                            {finding.reviewNotes}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* PDF Viewer Modal */}
      {isPDFViewerOpen && selectedDocumentUrl && (
        <PDFViewer
          s3Url={selectedDocumentUrl}
          documentName={selectedDocumentTitle}
          isOpen={isPDFViewerOpen}
          onClose={handleClosePDFViewer}
        />
      )}
    </div>
  );

  if (modalMode && sharedModalShell) {
    return (
      <>
        <div className="shrink-0 border-b border-[#EEEEEE] bg-white px-6 py-6">
          <button
            type="button"
            onClick={handleBack}
            className="absolute right-6 top-6 z-10 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70"
            aria-label="Close results modal"
          >
            <FiX size={16} />
          </button>
          <h2 className="pr-10 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]">
            AI Analysis Results
          </h2>
        </div>
        {content}
      </>
    );
  }

  if (modalMode) {
    return (
      <div
        data-figma-target="ai-results-modal"
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#101828]/45 p-4"
        onClick={handleBack}
      >
        <div
          className="relative flex h-[calc(100dvh-32px)] w-full min-w-[400px] max-w-[1100px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)] transition-[max-width,width,transform,opacity] duration-300 ease-out"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-[#EEEEEE] bg-white px-6 py-6">
            <button
              type="button"
              onClick={handleBack}
              className="absolute right-6 top-6 z-10 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70"
              aria-label="Close results modal"
            >
              <FiX size={16} />
            </button>
            <h2 className="pr-10 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]">
              AI Analysis Results
            </h2>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
