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
import { useState } from 'react';

export function SpecificationManual() {
  const { projectId } = useParams<{ projectId: string }>();
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
  } = useSpecificationManual(projectId!);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header userName={userName} userRole="Contractor" />

      <main className="mx-auto max-w-[588px] px-6 py-8">
        <button
          onClick={navigateBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#4A5565] transition-colors hover:text-gray-900"
        >
          <FiArrowLeft size={17.5} />
          Back to Projects
        </button>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#101828]">
            Project Setup
          </h1>
          <p className="text-sm text-[#4A5565]">
            Let's start by setting up your project and uploading the specification manual
          </p>
        </div>

        <div className="rounded-[14px] bg-white p-7 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
          {/* Form content will go here */}

          {error && (
            <div
              className="mb-6 rounded-[8px] bg-[#FEF2F2] p-4 text-[12.3px] text-[#F44336]"
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
            >
              {/* Project Name */}
              <div className="mb-6">
                <label
                  htmlFor="projectName"
                  className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]"
                >
                  <FiFileText size={14} className="text-[#6B7280]" />
                  Project Name <span className="text-[#F44336]">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => handleProjectNameChange(e.target.value)}
                  disabled={isFieldDisabled()}
                  className={`w-full rounded-[12px] border px-3 text-[12.3px] text-[#111827] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 ${
                    projectNameError ? 'border-[#F44336]' : 'border-[#E5E7EB]'
                  } ${
                    isFieldDisabled()
                      ? 'cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                      : 'bg-white'
                  } h-[42px]`}
                  placeholder="Enter project name"
                />
                {projectNameError && (
                  <p className="mt-1 text-[12.3px] text-[#F44336]">{projectNameError}</p>
                )}
              </div>

              {/* Project Type */}
              <div className="mb-6">
                <label
                  htmlFor="projectType"
                  className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]"
                >
                  <FiLayers size={14} className="text-[#6B7280]" />
                  Project Type <span className="text-[#F44336]">*</span>
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => handleProjectTypeChange(e.target.value)}
                  disabled={isFieldDisabled()}
                  className={`w-full rounded-[12px] border px-3 text-[12.3px] text-[#111827] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 ${
                    projectTypeError ? 'border-[#F44336]' : 'border-[#E5E7EB]'
                  } ${
                    isFieldDisabled()
                      ? 'cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                      : 'bg-white'
                  } h-[31.5px]`}
                >
                  <option value="">Select project type</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Construction">Construction</option>
                  <option value="Engineering">Engineering</option>
                </select>
                {projectTypeError && (
                  <p className="mt-1 text-[12.3px] text-[#F44336]">{projectTypeError}</p>
                )}
              </div>

              {/* Division Based Toggle */}
              <div className="mb-6">
                <div className="flex items-center rounded-[12px] bg-[#F9FAFB] p-4">
                  <FiLayers size={14} className="mr-3 text-[#6B7280]" />
                  <span className="flex-1 text-[12.3px] font-medium text-[#111827]">
                    Is spec manual upload division-based?
                  </span>
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
                      className={`block h-[16.1px] w-[28px] cursor-pointer rounded-full transition-colors ${
                        isDivisionBased ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'
                      } ${isFieldDisabled() ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div
                        className={`absolute top-[1.05px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${
                          isDivisionBased ? 'left-[11.8px]' : 'left-[-0.2px]'
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Complete Upload Mode */}
              {!isDivisionBased && (
                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]">
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
                    className="block cursor-pointer rounded-[12px] border-2 border-dashed border-[#D1D5DC] bg-white p-6 text-center transition-colors hover:border-[#3B82F6]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'complete')}
                  >
                    <img src={uploadIcon} alt="Upload" className="mx-auto mb-3 h-[42px] w-[42px]" />
                    <p className="mb-2 text-[14px] text-[#101828]">
                      Drag and drop your spec manual here, or click to browse
                    </p>
                    <p className="text-[12.3px] text-[#6A7282]">
                      Accepted formats: PDF • Limit: 1 document
                    </p>
                  </label>
                  {completeSpecFile && (
                    <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#F9FAFB] p-3">
                      <span className="text-[12.3px] text-[#111827]">{completeSpecFile.name}</span>
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
                  <div className="mb-6">
                    <label className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]">
                      <FiLayers size={14} className="text-[#6B7280]" />
                      Select Divisions <span className="text-[#F44336]">*</span>
                    </label>
                    <div
                      className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-[10.3px] py-2"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        {selectedDivisions.length === 0 ? (
                          <span className="text-[12.3px] text-[#6B7280]">Select divisions</span>
                        ) : (
                          <>
                            {selectedDivisions.includes('15') && (
                              <div className="flex items-center gap-1 rounded-[8px] bg-[#3B82F6] px-2 py-1">
                                <span className="text-[10.5px] font-medium text-white">
                                  15 – Mechanical
                                </span>
                                {isDivisionSelectable('15') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDivisionCheckbox('15');
                                    }}
                                    className="text-white hover:text-gray-200"
                                  >
                                    <FiX size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                            {selectedDivisions.includes('16') && (
                              <div className="flex items-center gap-1 rounded-[8px] bg-[#3B82F6] px-2 py-1">
                                <span className="text-[10.5px] font-medium text-white">
                                  16 – Electrical
                                </span>
                                {isDivisionSelectable('16') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDivisionCheckbox('16');
                                    }}
                                    className="text-white hover:text-gray-200"
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
                      <div className="mt-2 space-y-2 rounded-[8px] border border-[#E5E7EB] bg-white p-3">
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
                            className={`text-[12.3px] ${!isDivisionSelectable('15') ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}
                          >
                            15 - Mechanical {!isDivisionSelectable('15') && '(Already uploaded)'}
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
                            className={`text-[12.3px] ${!isDivisionSelectable('16') ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}
                          >
                            16 - Electrical {!isDivisionSelectable('16') && '(Already uploaded)'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Previously Uploaded Documents (Edit Mode) */}
                  {!isNewProject && (hasMechanicalDoc() || hasElectricalDoc()) && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-[12.3px] font-medium text-[#111827]">
                        Previously Uploaded Documents
                      </h3>
                      <div className="space-y-2">
                        {hasMechanicalDoc() && existingMechanicalDoc && (
                          <div className="rounded-[8px] bg-[#F9FAFB] p-3">
                            <p className="text-[12.3px] font-medium text-[#111827]">
                              {existingMechanicalDoc.documentName}
                            </p>
                            <p className="text-[10.5px] text-[#6B7280]">15 - Mechanical</p>
                          </div>
                        )}
                        {hasElectricalDoc() && existingElectricalDoc && (
                          <div className="rounded-[8px] bg-[#F9FAFB] p-3">
                            <p className="text-[12.3px] font-medium text-[#111827]">
                              {existingElectricalDoc.documentName}
                            </p>
                            <p className="text-[10.5px] text-[#6B7280]">16 - Electrical</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Division Upload Areas */}
                  <div className="space-y-4">
                    {/* Mechanical Division */}
                    {selectedDivisions.includes('15') && (
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]">
                          <FiFileText size={14} className="text-[#6B7280]" />
                          15 - Mechanical Division
                        </label>
                        {isMechanicalUploadDisabled() ? (
                          <div className="rounded-[12px] border-2 border-[#E5E7EB] bg-[#F9FAFB] p-6">
                            <div className="flex items-center gap-2 text-[#FF9800]">
                              <FiAlertTriangle size={16} />
                              <p className="text-[12.3px]">
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
                              className="block cursor-pointer rounded-[12px] border-2 border-dashed border-[#D1D5DC] bg-white p-6 text-center transition-colors hover:border-[#3B82F6]"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'mechanical')}
                            >
                              <img
                                src={uploadIcon}
                                alt="Upload"
                                className="mx-auto mb-3 h-[42px] w-[42px]"
                              />
                              <p className="mb-2 text-[14px] text-[#101828]">
                                Drag and drop your spec manual here, or click to browse
                              </p>
                              <p className="text-[12.3px] text-[#6A7282]">Accepted formats: PDF</p>
                            </label>
                            {mechanicalDivisionFile && (
                              <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#F9FAFB] p-3">
                                <span className="text-[12.3px] text-[#111827]">
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
                        <label className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]">
                          <FiFileText size={14} className="text-[#6B7280]" />
                          16 - Electrical Division
                        </label>
                        {isElectricalUploadDisabled() ? (
                          <div className="rounded-[12px] border-2 border-[#E5E7EB] bg-[#F9FAFB] p-6">
                            <div className="flex items-center gap-2 text-[#FF9800]">
                              <FiAlertTriangle size={16} />
                              <p className="text-[12.3px]">
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
                              className="block cursor-pointer rounded-[12px] border-2 border-dashed border-[#D1D5DC] bg-white p-6 text-center transition-colors hover:border-[#3B82F6]"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'electrical')}
                            >
                              <img
                                src={uploadIcon}
                                alt="Upload"
                                className="mx-auto mb-3 h-[42px] w-[42px]"
                              />
                              <p className="mb-2 text-[14px] text-[#101828]">
                                Drag and drop your spec manual here, or click to browse
                              </p>
                              <p className="text-[12.3px] text-[#6A7282]">Accepted formats: PDF</p>
                            </label>
                            {electricalDivisionFile && (
                              <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#F9FAFB] p-3">
                                <span className="text-[12.3px] text-[#111827]">
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

              {fileError && <p className="mt-2 text-[12.3px] text-[#F44336]">{fileError}</p>}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] px-4 text-[12.3px] font-medium text-white transition-colors hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isAnalyzing || !isFormValid}
                >
                  {isAnalyzing ? 'Processing...' : 'Continue to Submittal Entry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Analyzing Spec Popup */}
      <AnalyzingSpecPopup
        isOpen={isAnalyzing}
        message="Analyzing project spec for checklist preparation"
      />
    </div>
  );
}
