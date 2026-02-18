import { useParams } from 'react-router-dom';
import { useAIResult } from './AIResult.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { PDFViewer } from '@/ui/reusables/PDFViewer/PDFViewer.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import { FiArrowLeft, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { formatConfidenceScore } from '@/helpers/utilities/formatters.ts';

export function AIResult() {
  const { projectId, submittalId } = useParams<{ projectId: string; submittalId: string }>();
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
  } = useAIResult(projectId!, submittalId!);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header userName={userName} userRole="Contractor" />
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
      <div className="min-h-screen bg-gray-50">
        <Header userName={userName} userRole="Contractor" />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="card">
            <div className="mb-4 rounded bg-red-50 p-4 text-error" role="alert">
              {error || 'Failed to load results'}
            </div>
            <button onClick={navigateToProjects} className="btn-secondary flex items-center gap-2">
              <FiArrowLeft />
              Back to Projects
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isCompliant = resultData.overallStatus === 'COMPLIANT';

  return (
    <div className="min-h-screen bg-white">
      <Header userName={userName} userRole="Contractor" />

      {/* Progress Stepper */}
      <div className="border-b border-[#E5E7EB] bg-white px-6 py-[21px]">
        <div className="mx-auto flex max-w-[1000px] items-center justify-center">
          {/* Step 1 - Completed */}
          <div className="flex items-center">
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#00C950]">
              <svg width="17.5" height="17.5" viewBox="0 0 18 18" fill="none">
                <path
                  d="M15 4.5L6.75 12.75L3 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mx-2 text-[12.3px] text-[#101828]">Project Setup</div>

          {/* Connector 1 */}
          <div className="mx-4 h-[4.2px] w-[223px] rounded-[3.5px] bg-[#10B981]" />

          {/* Step 2 - Completed */}
          <div className="flex items-center">
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#00C950]">
              <svg width="17.5" height="17.5" viewBox="0 0 18 18" fill="none">
                <path
                  d="M15 4.5L6.75 12.75L3 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mx-2 text-[12.3px] text-[#101828]">Submittal Entry</div>

          {/* Connector 2 */}
          <div className="mx-4 h-[4.2px] w-[214px] rounded-[3.5px] bg-[#10B981]" />

          {/* Step 3 - Active (AI Analysis) */}
          <div className="flex items-center">
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3B82F6] bg-[#3B82F6] text-[14px] text-white">
              3
            </div>
          </div>
          <div className="mx-2 text-[12.3px] text-[#101828]">AI Analysis</div>
        </div>
      </div>

      <main className="mx-auto w-[1200px] py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="mb-2 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]">
              AI Analysis Results
            </h1>
            <p className="text-[14px] text-[#4A5565]">
              Review the compliance status and detailed findings below
            </p>
          </div>

          {/* Submittal Info Card */}
          <div className="overflow-clip rounded-[14px] bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] p-[21px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-2 gap-x-[21px]">
              <div className="min-w-0">
                <p className="mb-2 text-[12.3px] font-semibold tracking-[0.306px] text-[#1447E6]">
                  Submittal Title
                </p>
                <p className="whitespace-normal break-words text-[15.8px] font-medium leading-[24.5px] text-[#101828]">
                  {resultData.submittalTitle}
                </p>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-[12.3px] font-semibold tracking-[0.306px] text-[#1447E6]">
                  Specification Section
                </p>
                <p className="whitespace-normal break-words text-[15.8px] font-medium leading-[24.5px] text-[#101828]">
                  {resultData.specSection}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Status Banner */}
          <div className="h-[90.7px] rounded-[14px] border border-[#FFC9C9] bg-[#FEF2F2] px-[21.6px] py-[23.85px]">
            <div className="flex items-center gap-[14px]">
              <div className="size-[42px]">
                {isCompliant ? (
                  <FiCheck className="size-[42px] text-[#00BC7D]" />
                ) : (
                  <FiX className="size-[42px] text-[#FB2C36]" />
                )}
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold leading-[24.5px] text-[#101828]">
                  Submittal is {isCompliant ? 'Compliant' : 'Non-Compliant'}
                </h3>
                <p className="text-[14px] leading-[21px] text-[#4A5565]">
                  {isCompliant ? 'All requirements have been met' : 'Some requirements are not met'}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="overflow-clip rounded-[14px] bg-white px-[21px] py-[21px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <h3 className="mb-[21px] text-[17.5px] font-semibold leading-[24.5px] text-[#101828]">
              Summary
            </h3>

            {/* Summary Text */}
            <div className="mb-[21px]">
              <p className="whitespace-normal break-words text-[14px] leading-[22.75px] text-[#364153]">
                {resultData.complianceSummary}
              </p>
            </div>

            {/* Overall Status and Recommendation */}
            <div className="mb-[21px] space-y-[3.5px]">
              <div className="flex items-center gap-[7px]">
                <span className="text-[12.3px] leading-[17.5px] text-[#4A5565]">
                  Overall status:
                </span>
                <div className="flex items-center gap-[12.25px]">
                  <div className="size-[7px] flex-shrink-0 rounded-full bg-[#FBBF24]" />
                  <span className="text-[12.3px] font-medium leading-[17.5px] text-[#101828]">
                    Review required
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-[7px]">
                <span className="flex-shrink-0 text-[12.3px] leading-[17.5px] text-[#4A5565]">
                  Recommendation:
                </span>
                <span className="whitespace-normal break-words text-[12.3px] font-medium leading-[17.5px] text-[#101828]">
                  {resultData.recommendation}
                </span>
              </div>
            </div>

            {/* Compliance Counts */}
            <div className="flex gap-[14px]">
              {/* Non-Compliant Box */}
              <div className="h-[47.1px] flex-1 rounded-[10px] border border-[#FFC9C9] bg-[#FEF2F2] px-[10.3px] py-[15.05px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[14px]">
                    <div className="size-[7px] flex-shrink-0 rounded-full bg-[#FB2C36]" />
                    <span className="whitespace-nowrap text-[12.3px] font-medium leading-[17.5px] text-[#101828]">
                      Non-compliant
                    </span>
                  </div>
                  <span className="text-[15.8px] font-bold leading-[24.5px] text-[#101828]">
                    {resultData.noncompliantCount}
                  </span>
                </div>
              </div>

              {/* Compliant Box */}
              <div className="h-[47.1px] flex-1 rounded-[10px] border border-[#B9F8CF] bg-[#F0FDF4] px-[10.3px] py-[15.05px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[14px]">
                    <div className="size-[7px] flex-shrink-0 rounded-full bg-[#10B981]" />
                    <span className="whitespace-nowrap text-[12.3px] font-medium leading-[17.5px] text-[#101828]">
                      Compliant
                    </span>
                  </div>
                  <span className="text-[15.8px] font-bold leading-[24.5px] text-[#101828]">
                    {resultData.compliantCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specification Comparison */}
          <div className="overflow-clip rounded-[14px] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            {/* Header with badges */}
            <div className="flex items-center justify-between px-[21px] py-[21px]">
              <h3 className="text-[17.5px] font-semibold leading-[24.5px] text-[#111827]">
                Detailed Specification Comparison
              </h3>
              <div className="flex gap-[14px]">
                {/* Compliant Badge */}
                <div className="flex h-[45.5px] w-[130.2px] items-center gap-[7px] rounded-[10px] bg-[#F0FDF4] px-[14px]">
                  <FiCheck className="size-[14px] text-[#008236]" />
                  <div>
                    <div className="text-[12.3px] font-semibold leading-[17.5px] text-[#0D542B]">
                      {resultData.compliantCount}
                    </div>
                    <div className="text-[10.5px] leading-[14px] text-[#008236]">Compliant</div>
                  </div>
                </div>
                {/* Non-Compliant Badge */}
                <div className="flex h-[45.5px] w-[130.43px] items-center gap-[7px] rounded-[10px] bg-[#FEF2F2] px-[14px]">
                  <FiX className="size-[14px] text-[#C10007]" />
                  <div>
                    <div className="text-[12.3px] font-semibold leading-[17.5px] text-[#82181A]">
                      {resultData.noncompliantCount}
                    </div>
                    <div className="text-[10.5px] leading-[14px] text-[#C10007]">Non-Compliant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-[12px] border border-[#E5E7EB] px-[21px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#F9FAFB]">
                  <tr className="border-b-[0.8px] border-[#D1D5DC]">
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Spec Requirement
                    </th>
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Reference Value
                    </th>
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Submittal Value
                    </th>
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Status
                    </th>
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Confidence Score
                    </th>
                    <th className="px-[7px] py-[8.6px] text-left text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                      Review Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.findings.map((finding, index) => {
                    const isNonCompliant = finding.status === 'NON_COMPLIANT';
                    const rowBgColor = isNonCompliant ? 'bg-[#FEF2F2]' : 'bg-white';

                    return (
                      <tr key={index} className={`border-b-[0.8px] border-[#E5E7EB] ${rowBgColor}`}>
                        <td className="px-[7px] py-[7.4px]">
                          <div className="flex items-center gap-[7px]">
                            <span className="text-[12.3px] font-semibold leading-[17.5px] text-[#101828]">
                              {finding.specRequirement}
                            </span>
                          </div>
                        </td>
                        <td className="px-[7px] py-[7.4px]">
                          <div className="space-y-[8.75px]">
                            <div className="min-h-[26.1px] rounded-[10px] border border-[#BEDBFF] bg-[#EFF6FF] px-[10.3px] py-[5.5px]">
                              <span className="break-words text-[12.3px] font-medium leading-[15.2px] text-[#1C398E]">
                                {finding.referenceValue}
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewSpecDocument(finding.specReference.s3Url)}
                              className="cursor-pointer text-[10.5px] leading-[14px] text-[#3B82F6] underline"
                            >
                              Section 16500, Part 2.3
                            </button>
                          </div>
                        </td>
                        <td className="px-[7px] py-[7.4px]">
                          <div className="space-y-[8.75px]">
                            <div
                              className={`min-h-[26.1px] rounded-[10px] border px-[10.3px] py-[5.5px] ${
                                isNonCompliant
                                  ? 'border-[#FFC9C9] bg-[#FEF2F2]'
                                  : 'border-[#B9F8CF] bg-[#F0FDF4]'
                              }`}
                            >
                              <span
                                className={`break-words text-[12.3px] font-medium leading-[15.2px] ${
                                  isNonCompliant ? 'text-[#82181A]' : 'text-[#0D542B]'
                                }`}
                              >
                                {finding.submittalValue}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleViewSubmittalDocument(finding.submittalReference.s3Url)
                              }
                              className="cursor-pointer text-[10.5px] leading-[14px] text-[#3B82F6] underline"
                            >
                              Submittal document
                            </button>
                          </div>
                        </td>
                        <td className="px-[7px] py-[7.4px]">
                          <div className="flex items-center gap-[7px]">
                            {isNonCompliant ? (
                              <>
                                <FiX className="size-[17.5px] flex-shrink-0 text-[#C10007]" />
                                <span className="whitespace-nowrap text-[12.3px] font-medium leading-[17.5px] text-[#C10007]">
                                  Non-Compliant
                                </span>
                              </>
                            ) : (
                              <>
                                <FiCheck className="size-[17.5px] flex-shrink-0 text-[#008236]" />
                                <span className="whitespace-nowrap text-[12.3px] font-medium leading-[17.5px] text-[#008236]">
                                  Compliant
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-[7px] py-[7.4px]">
                          <div
                            className={`inline-flex h-[24.5px] items-center justify-center rounded-[10px] px-[10.3px] ${
                              finding.confidenceScore >= 0.9 ? 'bg-[#DCFCE7]' : 'bg-[#FEF9C2]'
                            }`}
                          >
                            <span
                              className={`text-[12.3px] font-semibold leading-[17.5px] ${
                                finding.confidenceScore >= 0.9 ? 'text-[#016630]' : 'text-[#894B00]'
                              }`}
                            >
                              {formatConfidenceScore(finding.confidenceScore)}
                            </span>
                          </div>
                        </td>
                        <td className="px-[7px] py-[7.4px]">
                          <span
                            className={`text-[12.3px] leading-[17.5px] ${
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t-[0.8px] border-[#E5E7EB] pt-[21px]">
            <button
              onClick={navigateToProjects}
              className="flex h-[38.5px] w-[139.86px] items-center justify-center gap-[7px] rounded-[12px] border border-[#D1D5DC] bg-[#F8FAFC]"
            >
              <FiArrowLeft className="size-[14px] text-[#364153]" />
              <span className="text-[12.3px] font-medium leading-[17.5px] text-[#364153]">
                Back to Projects
              </span>
            </button>
            <button
              onClick={navigateToNewSubmittal}
              className="flex h-[38.5px] w-[161.56px] items-center justify-center gap-[7px] rounded-[12px] border border-[#3B82F6] bg-[#F8FAFC]"
            >
              <FiPlus className="size-[14px] text-[#3B82F6]" />
              <span className="text-[12.3px] font-medium leading-[17.5px] text-[#3B82F6]">
                Start New Submittal
              </span>
            </button>
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
}
