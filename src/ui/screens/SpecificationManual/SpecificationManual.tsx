import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSpecificationManual } from './SpecificationManual.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { AnalyzingSpecPopup } from '@/ui/reusables/AnalyzingSpecPopup/AnalyzingSpecPopup.tsx';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import {
  FiArrowLeft,
  FiX,
  FiAlertTriangle,
  FiFileText,
  FiLayers,
  FiChevronDown,
} from 'react-icons/fi';
import uploadIcon from '@/assets/images/upload-icon.svg';

interface SpecificationManualProps {
  modalMode?: boolean;
  onClose?: () => void;
  projectIdOverride?: string;
  onSuccess?: (projectId: string) => void;
}

export function SpecificationManual({
  modalMode = false,
  onClose,
  projectIdOverride,
  onSuccess,
}: SpecificationManualProps = {}) {
  const { projectId } = useParams<{ projectId: string }>();
  const resolvedProjectId = projectIdOverride ?? projectId ?? '0';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    isNewProject,
    projectName,
    projectType,
    isDivisionBased,
    selectedDivisions,
    completeSpecFile,
    mechanicalDivisionFile,
    electricalDivisionFile,
    existingMechanicalDoc,
    existingElectricalDoc,
    isLoading,
    isAnalyzing,
    error,
    projectNameError,
    projectTypeError,
    fileError,
    handleProjectNameChange,
    handleProjectTypeChange,
    handleDivisionBasedToggle,
    handleDivisionSelection,
    handleCompleteFileUpload,
    handleMechanicalFileUpload,
    handleElectricalFileUpload,
    handleRemoveFile,
    isFieldDisabled,
    isMechanicalUploadDisabled,
    isElectricalUploadDisabled,
    hasMechanicalDoc,
    hasElectricalDoc,
    isDivisionSelectable,
    isFormValid,
    handleSubmit,
    navigateBack,
  } = useSpecificationManual(resolvedProjectId, { onSuccess });

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'complete') {
        handleCompleteFileUpload(file);
      } else if (type === 'mechanical') {
        handleMechanicalFileUpload(file);
      } else if (type === 'electrical') {
        handleElectricalFileUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, type: string) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === 'complete') {
        handleCompleteFileUpload(file);
      } else if (type === 'mechanical') {
        handleMechanicalFileUpload(file);
      } else if (type === 'electrical') {
        handleElectricalFileUpload(file);
      }
    }
  };

  const handleDivisionCheckbox = (division: string) => {
    if (selectedDivisions.includes(division)) {
      handleDivisionSelection(selectedDivisions.filter((d) => d !== division));
    } else {
      handleDivisionSelection([...selectedDivisions, division]);
    }
  };

  const fieldLabelClass =
    'mb-2 flex items-center gap-2 text-[14px] font-medium leading-5 text-[#2A2A2A]';
  const inputClass =
    'h-10 w-full rounded-[10px] border bg-white px-3 text-[14px] leading-5 text-[#2A2A2A] transition-colors focus:border-[#4485F1] focus:outline-none focus:ring-0';
  const mutedPanelClass = `${
    modalMode ? 'rounded-[4px]' : 'rounded-[12px]'
  } border border-[#E5E7EB] bg-[#F8FAFC]`;
  const uploadZoneClass = `block cursor-pointer ${
    modalMode ? 'rounded-[4px]' : 'rounded-[12px]'
  } border-2 border-dashed border-[#D1D5DC] bg-white p-6 text-center transition-colors hover:border-[#4485F1]`;
  const titleText = isNewProject ? 'Create New Project' : 'Add Specification Manuals';
  const introText = isNewProject
    ? 'Set up the project details and upload the governing specification manual before starting submittals.'
    : 'Upload additional specification manuals to this project.';
  const handleClose = onClose ?? navigateBack;

  useEffect(() => {
    if (!modalMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleClose, modalMode]);

  const formContent = (
    <main className={modalMode ? 'flex h-full min-h-0 flex-col' : 'mx-auto max-w-4xl px-6 py-8'}>
      {!modalMode && (
        <button
          onClick={navigateBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#4A5565] transition-colors hover:text-[#101828]"
        >
          <FiArrowLeft size={17.5} />
          Back to Projects
        </button>
      )}

      <div className={modalMode ? 'shrink-0 border-b border-[#EEEEEE] bg-white px-6 py-6' : 'mb-8 border-b border-[#E5E7EB] pb-6'}>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#101828]">
            {titleText}
          </h1>
          <p className="max-w-2xl text-sm leading-[21px] text-[#4A5565]">
            {introText}
          </p>
      </div>

      <div className={modalMode ? 'min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6' : ''}>
        <div className={modalMode ? 'bg-white' : 'rounded-[14px] border border-[#DCE3EA] bg-white p-8 shadow-sm'}>

          {error && (
            <div
              className={`mb-6 ${modalMode ? 'rounded-[4px]' : 'rounded-[10px]'} border border-[#FECACA] bg-[#FEF2F2] p-4 text-[14px] leading-5 text-[#B42318]`}
              role="alert"
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className={modalMode ? 'space-y-8' : 'space-y-8'}
            >
              {isNewProject && (
                <section className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="projectName" className={fieldLabelClass}>
                        <FiFileText size={14} className="text-[#6B7280]" />
                        Project Name <span className="text-[#F44336]">*</span>
                      </label>
                      <input
                        id="projectName"
                        type="text"
                        value={projectName}
                        onChange={(e) => handleProjectNameChange(e.target.value)}
                        disabled={isFieldDisabled()}
                        className={`${inputClass} ${
                          projectNameError ? 'border-[#F44336]' : 'border-[#D2D2D2]'
                        } ${
                          isFieldDisabled()
                            ? 'cursor-not-allowed bg-[#F3F4F6] text-[#98A2B3]'
                            : ''
                        }`}
                        placeholder="Enter project name"
                      />
                      {projectNameError && (
                        <p className="mt-2 text-[13px] leading-4 text-[#B42318]">{projectNameError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="projectType" className={fieldLabelClass}>
                        <FiLayers size={14} className="text-[#6B7280]" />
                        Project Type <span className="text-[#F44336]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="projectType"
                          value={projectType}
                          onChange={(e) => handleProjectTypeChange(e.target.value)}
                          disabled={isFieldDisabled()}
                          className={`${inputClass} appearance-none pr-10 ${
                            projectTypeError ? 'border-[#F44336]' : 'border-[#D2D2D2]'
                          } ${
                            isFieldDisabled()
                              ? 'cursor-not-allowed bg-[#F3F4F6] text-[#98A2B3]'
                              : ''
                          }`}
                        >
                          <option value="">Select project type</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Construction">Construction</option>
                          <option value="Engineering">Engineering</option>
                        </select>
                        <FiChevronDown
                          size={14}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                        />
                      </div>
                      {projectTypeError && (
                        <p className="mt-2 text-[13px] leading-4 text-[#B42318]">{projectTypeError}</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className={modalMode ? 'space-y-6 pt-2' : 'space-y-6 border-t border-[#E5E7EB] pt-8'}>

                <div className={`${mutedPanelClass} flex items-center gap-4 px-4 py-4`}>
                  <FiLayers size={16} className="text-[#6B7280]" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium leading-5 text-[#2A2A2A]">
                      Division-based upload
                    </p>
                    <p className="text-[13px] leading-5 text-[#667085]">
                      Turn this on when the specification package is uploaded by division instead
                      of as a single full manual.
                    </p>
                  </div>
                  <div className="relative inline-block">
                    <input
                      type="checkbox"
                      checked={isDivisionBased}
                      onChange={handleDivisionBasedToggle}
                      disabled={isFieldDisabled()}
                      className="peer sr-only"
                      id="divisionToggle"
                    />
                    <label
                      htmlFor="divisionToggle"
                      className={`block h-[20px] w-[36px] cursor-pointer rounded-full transition-colors ${
                        isDivisionBased ? 'bg-[#4485F1]' : 'bg-[#D0D5DD]'
                      } ${isFieldDisabled() ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div
                        className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
                          isDivisionBased ? 'left-[18px]' : 'left-[2px]'
                        }`}
                      />
                    </label>
                  </div>
                </div>

              {/* Complete Upload Mode */}
              {!isDivisionBased && (
                <div>
                  <label className={fieldLabelClass}>
                    <FiFileText size={14} className="text-[#6B7280]" />
                    Upload Spec Manual <span className="text-[#F44336]">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'complete')}
                    className="hidden"
                    id="completeFile"
                  />
                  <label
                    htmlFor="completeFile"
                    className={uploadZoneClass}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'complete')}
                  >
                    <img src={uploadIcon} alt="Upload" className="mx-auto mb-3 h-[42px] w-[42px]" />
                    <p className="mb-2 text-[14px] font-medium text-[#101828]">
                      Drag and drop your spec manual here, or click to browse
                    </p>
                    <p className="text-[13px] leading-5 text-[#667085]">
                      Accepted formats: PDF • Limit: 1 document
                    </p>
                  </label>
                  {completeSpecFile && (
                    <div className={`mt-3 flex items-center justify-between px-4 py-3 ${mutedPanelClass}`}>
                      <span className="text-[14px] text-[#111827]">{completeSpecFile.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('complete')}
                        className="text-[#F44336] transition-colors hover:text-[#DC2626]"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Division Based Mode */}
              {isDivisionBased && (
                <>
                  {/* Division Selection */}
                  <div>
                    <label className={fieldLabelClass}>
                      <FiLayers size={14} className="text-[#6B7280]" />
                      Select Divisions <span className="text-[#F44336]">*</span>
                    </label>
                    <div
                      className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-[#D2D2D2] bg-white px-3 py-2"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        {selectedDivisions.length === 0 ? (
                          <span className="text-[14px] text-[#667085]">Select divisions</span>
                        ) : (
                          <>
                            {selectedDivisions.includes('15') && (
                              <div className="flex items-center gap-1 rounded-[8px] bg-[#E8F1FF] px-2 py-1">
                                <span className="text-[12px] font-medium text-[#1D4ED8]">Mechanical</span>
                                {isDivisionSelectable('15') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDivisionCheckbox('15');
                                    }}
                                    className="text-[#1D4ED8] hover:text-[#1E40AF]"
                                  >
                                    <FiX size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                            {selectedDivisions.includes('16') && (
                              <div className="flex items-center gap-1 rounded-[8px] bg-[#E8F1FF] px-2 py-1">
                                <span className="text-[12px] font-medium text-[#1D4ED8]">Electrical</span>
                                {isDivisionSelectable('16') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDivisionCheckbox('16');
                                    }}
                                    className="text-[#1D4ED8] hover:text-[#1E40AF]"
                                  >
                                    <FiX size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <FiChevronDown
                        size={14}
                        className={`text-[#6B7280] transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {/* Division checkboxes dropdown */}
                    {isDropdownOpen && (
                      <div className={`mt-2 space-y-3 ${modalMode ? 'rounded-[4px]' : 'rounded-[10px]'} border border-[#E5E7EB] bg-white p-4 shadow-sm`}>
                        {/* In edit mode, show all divisions but disable those with existing documents */}
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedDivisions.includes('15')}
                            onChange={() => handleDivisionCheckbox('15')}
                            disabled={!isDivisionSelectable('15')}
                            className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span
                            className={`text-[14px] ${!isDivisionSelectable('15') ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}
                          >
                            Mechanical {!isDivisionSelectable('15') && '(Already uploaded)'}
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedDivisions.includes('16')}
                            onChange={() => handleDivisionCheckbox('16')}
                            disabled={!isDivisionSelectable('16')}
                            className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B82F6] focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span
                            className={`text-[14px] ${!isDivisionSelectable('16') ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}
                          >
                            Electrical {!isDivisionSelectable('16') && '(Already uploaded)'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Previously Uploaded Documents (Edit Mode) */}
                  {!isNewProject && (hasMechanicalDoc() || hasElectricalDoc()) && (
                    <div>
                      <h3 className="mb-3 text-[14px] font-medium leading-5 text-[#111827]">
                        Previously Uploaded Documents
                      </h3>
                      <div className="space-y-2">
                        {hasMechanicalDoc() && existingMechanicalDoc && (
                          <div className={`px-4 py-3 ${mutedPanelClass}`}>
                            <p className="text-[14px] font-medium text-[#111827]">
                              {existingMechanicalDoc.documentName}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">Mechanical</p>
                          </div>
                        )}
                        {hasElectricalDoc() && existingElectricalDoc && (
                          <div className={`px-4 py-3 ${mutedPanelClass}`}>
                            <p className="text-[14px] font-medium text-[#111827]">
                              {existingElectricalDoc.documentName}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">Electrical</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Division Upload Areas */}
                  <div className="space-y-5">
                    {/* Mechanical Division */}
                    {selectedDivisions.includes('15') && (
                      <div>
                        <label className={fieldLabelClass}>
                          <FiFileText size={14} className="text-[#6B7280]" />
                          Mechanical Division
                        </label>
                        {isMechanicalUploadDisabled() ? (
                          <div className={`${modalMode ? 'rounded-[4px]' : 'rounded-[12px]'} border border-[#FCD34D] bg-[#FFFBEB] p-4`}>
                            <div className="flex items-center gap-2 text-[#B54708]">
                              <FiAlertTriangle size={16} />
                              <p className="text-[14px] leading-5">
                                Upload limit reached: Only 1 document allowed per division
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, 'mechanical')}
                              className="hidden"
                              id="mechanicalFile"
                            />
                            <label
                              htmlFor="mechanicalFile"
                              className={uploadZoneClass}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'mechanical')}
                            >
                              <img
                                src={uploadIcon}
                                alt="Upload"
                                className="mx-auto mb-3 h-[42px] w-[42px]"
                              />
                              <p className="mb-2 text-[14px] font-medium text-[#101828]">
                                Drag and drop your spec manual here, or click to browse
                              </p>
                              <p className="text-[13px] leading-5 text-[#667085]">Accepted formats: PDF</p>
                            </label>
                            {mechanicalDivisionFile && (
                              <div className={`mt-3 flex items-center justify-between px-4 py-3 ${mutedPanelClass}`}>
                                <span className="text-[14px] text-[#111827]">
                                  {mechanicalDivisionFile.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile('mechanical')}
                                  className="text-[#F44336] transition-colors hover:text-[#DC2626]"
                                >
                                  <FiX size={16} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Electrical Division */}
                    {selectedDivisions.includes('16') && (
                      <div>
                        <label className={fieldLabelClass}>
                          <FiFileText size={14} className="text-[#6B7280]" />
                          Electrical Division
                        </label>
                        {isElectricalUploadDisabled() ? (
                          <div className={`${modalMode ? 'rounded-[4px]' : 'rounded-[12px]'} border border-[#FCD34D] bg-[#FFFBEB] p-4`}>
                            <div className="flex items-center gap-2 text-[#B54708]">
                              <FiAlertTriangle size={16} />
                              <p className="text-[14px] leading-5">
                                Upload limit reached: Only 1 document allowed per division
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, 'electrical')}
                              className="hidden"
                              id="electricalFile"
                            />
                            <label
                              htmlFor="electricalFile"
                              className={uploadZoneClass}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'electrical')}
                            >
                              <img
                                src={uploadIcon}
                                alt="Upload"
                                className="mx-auto mb-3 h-[42px] w-[42px]"
                              />
                              <p className="mb-2 text-[14px] font-medium text-[#101828]">
                                Drag and drop your spec manual here, or click to browse
                              </p>
                              <p className="text-[13px] leading-5 text-[#667085]">Accepted formats: PDF</p>
                            </label>
                            {electricalDivisionFile && (
                              <div className={`mt-3 flex items-center justify-between px-4 py-3 ${mutedPanelClass}`}>
                                <span className="text-[14px] text-[#111827]">
                                  {electricalDivisionFile.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile('electrical')}
                                  className="text-[#F44336] transition-colors hover:text-[#DC2626]"
                                >
                                  <FiX size={16} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {fileError && <p className="mt-2 text-[13px] leading-4 text-[#B42318]">{fileError}</p>}
              </section>
            </form>
          )}
        </div>
      </div>

      {modalMode && (
        <div className="shrink-0 border-t border-[#EEEEEE] bg-white px-4 py-4">
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ds-secondary-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-ds-primary-sm"
              disabled={isAnalyzing || !isFormValid}
            >
              {isAnalyzing ? 'Processing...' : isNewProject ? 'Create' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {!modalMode && (
        <div className="border-t border-[#E5E7EB] pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-ds-primary-md w-full"
            disabled={isAnalyzing || !isFormValid}
          >
            {isAnalyzing ? 'Processing...' : 'Continue to Submittal Entry'}
          </button>
        </div>
      )}
    </main>
  );

  return (
    <>
      {modalMode ? (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#101828]/45 p-4"
          onClick={handleClose}
        >
          <div
            className="relative flex h-[calc(100dvh-32px)] w-full min-w-[400px] max-w-[800px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-6 top-6 z-10 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70"
              aria-label="Close create project modal"
            >
              <FiX size={16} />
            </button>
            {formContent}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#F6F6F6]">
          <Header userName={userName} userRole="User" />
          {formContent}
        </div>
      )}

      {/* Analyzing Spec Popup */}
      <AnalyzingSpecPopup
        isOpen={isAnalyzing}
        message="Analyzing project spec for checklist preparation"
      />
    </>
  );
}
