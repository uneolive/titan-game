import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useSubmittal } from './Submittal.vm.ts';
import { Header } from '@/ui/reusables/Header/Header.tsx';
import { ProgressLoader } from '@/ui/reusables/ProgressLoader/ProgressLoader.tsx';
import { FiX, FiFileText, FiLayers, FiAlignLeft, FiArrowLeft } from 'react-icons/fi';
import uploadIcon from '@/assets/images/upload-icon.svg';

export function Submittal() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    formData,
    uploadedFiles,
    specSections,
    isLoadingSections,
    isAnalyzing,
    submittalId,
    progressPct,
    steps,
    errors,
    isFormValid,
    handleInputChange,
    handleFileUpload,
    handleRemoveFile,
    handleSubmit,
    handleContinueInBackground,
    navigateBack,
  } = useSubmittal(projectId!);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Group sections by division
  const groupedSections = specSections.reduce(
    (acc, section) => {
      const divisionKey = section.divisionNumber;
      if (!acc[divisionKey]) {
        acc[divisionKey] = [];
      }
      acc[divisionKey].push(section);
      return acc;
    },
    {} as Record<number, typeof specSections>
  );

  // Filter grouped sections based on search term
  const getFilteredGroupedSections = () => {
    const filtered: Record<number, typeof specSections> = {};
    Object.entries(groupedSections).forEach(([divisionNum, sections]) => {
      const filteredSections = sections.filter(
        (section) =>
          section.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredSections.length > 0) {
        filtered[Number(divisionNum)] = filteredSections;
      }
    });
    return filtered;
  };

  const filteredGroupedSections = getFilteredGroupedSections();
  const hasResults = Object.keys(filteredGroupedSections).length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header userName={userName} userRole="User" />

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

          {/* Step 2 - Active */}
          <div className="flex items-center">
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#00C950] text-[14px] text-white">
              2
            </div>
          </div>
          <div className="mx-2 text-[12.3px] text-[#101828]">Submittal Entry</div>

          {/* Connector 2 */}
          <div className="mx-4 h-[4.2px] w-[214px] rounded-[3.5px] bg-[#E5E7EB]" />

          {/* Step 3 - Pending */}
          <div className="flex items-center">
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#E5E7EB] text-[14px] text-[#6A7282]">
              3
            </div>
          </div>
          <div className="mx-2 text-[12.3px] text-[#99A1AF]">AI Analysis</div>
        </div>
      </div>

      <main className="mx-auto max-w-[784px] px-6 py-8">
        <button
          onClick={navigateBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#4A5565] transition-colors hover:text-gray-900"
        >
          <FiArrowLeft size={17.5} />
          Back to Projects
        </button>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-[24px] font-semibold tracking-[-0.48px] text-[#101828]">
            Submittal Entry
          </h1>
          <p className="text-[14px] text-[#4A5565]">
            Enter the submittal details and upload the document for AI analysis
          </p>
        </div>

        <div className="rounded-[14px] bg-white p-7 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
          {errors.general && (
            <div
              className="mb-6 rounded-[8px] bg-[#FEF2F2] p-4 text-[12.3px] text-[#F44336]"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]"
              >
                <FiFileText size={14} className="text-[#6B7280]" />
                Title <span className="text-[#F44336]">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`h-[42px] w-full rounded-[12px] border px-3 text-[12.3px] text-[#111827] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 ${
                  errors.title ? 'border-[#F44336]' : 'border-[#E5E7EB]'
                } bg-white`}
                placeholder="Enter a title for the submittal"
              />
              {errors.title && <p className="mt-1 text-[12.3px] text-[#F44336]">{errors.title}</p>}
            </div>

            {/* Specification Section */}
            <div className="relative mb-6" ref={dropdownRef}>
              <label
                htmlFor="specSection"
                className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]"
              >
                <FiLayers size={14} className="text-[#6B7280]" />
                Specification Section <span className="text-[#F44336]">*</span>
              </label>
              <input
                id="specSection"
                type="text"
                value={searchTerm || formData.specSection}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={`h-[42px] w-full rounded-[12px] border px-3 text-[12.3px] text-[#111827] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 ${
                  errors.specSection ? 'border-[#F44336]' : 'border-[#E5E7EB]'
                } bg-white`}
                placeholder="Type to search specification sections..."
              />
              {showDropdown && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {isLoadingSections ? (
                    <div className="px-4 py-3 text-sm text-gray-600">Loading sections...</div>
                  ) : hasResults ? (
                    Object.entries(filteredGroupedSections).map(([divisionNum, sections]) => (
                      <div key={divisionNum}>
                        <div className="sticky top-0 border-b border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
                          {divisionNum} - {divisionNum === '15' ? 'Mechanical' : 'Electrical'}
                        </div>
                        {sections.map((section) => (
                          <button
                            key={section.number}
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                            onClick={() => {
                              handleInputChange(
                                'specSection',
                                `${section.number} - ${section.title}`
                              );
                              setSearchTerm('');
                              setShowDropdown(false);
                            }}
                          >
                            <span>
                              {section.number} - {section.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-600">No sections found</div>
                  )}
                </div>
              )}
              {errors.specSection && (
                <p className="mt-1 text-[12.3px] text-[#F44336]">{errors.specSection}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]"
              >
                <FiAlignLeft size={14} className="text-[#6B7280]" />
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12.3px] text-[#111827] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20"
                placeholder="Enter a description for the submittal"
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-[12.3px] font-medium text-[#111827]">
                <FiFileText size={14} className="text-[#6B7280]" />
                Upload Submittal Document <span className="text-[#F44336]">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="submittalFiles"
              />
              <label
                htmlFor="submittalFiles"
                className="block cursor-pointer rounded-[12px] border-2 border-dashed border-[#D1D5DC] bg-white p-6 text-center transition-colors hover:border-[#3B82F6]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="mx-auto mb-3 flex h-[42px] w-[42px] items-center justify-center">
                  <img src={uploadIcon} alt="Upload" className="h-full w-full" />
                </div>
                <p className="mb-2 text-[14px] text-[#101828]">
                  Drag and drop your submittal document here, or click to browse
                </p>
                <p className="text-[12.3px] text-[#6A7282]">Accepted formats: PDF</p>
              </label>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-[8px] bg-[#F9FAFB] p-3"
                    >
                      <span className="text-[12.3px] text-[#111827]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-[#F44336] transition-colors hover:text-[#DC2626]"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.files && <p className="mt-2 text-[12.3px] text-[#F44336]">{errors.files}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] text-[12.3px] font-medium text-white transition-colors hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isAnalyzing || !isFormValid}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5.25 10.5L8.75 7L5.25 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* Progress Loader */}
      {isAnalyzing && submittalId && (
        <ProgressLoader
          submittalId={submittalId}
          isOpen={isAnalyzing}
          progressData={{
            submittalId,
            stepIndex: 0,
            stepName: '',
            stepDescription: '',
            status: 'IN_PROGRESS',
            progressPct,
            steps,
          }}
          onClose={handleContinueInBackground}
        />
      )}
    </div>
  );
}
