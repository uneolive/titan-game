import { SubmittalProgressBO } from '@/types/bos/progressLoader/SubmittalProgressBO.ts';
import { FiCheck } from 'react-icons/fi';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import spinnerIcon from '@/assets/images/spinner-icon.svg';

interface ProgressLoaderProps {
  submittalId: string;
  isOpen: boolean;
  progressData: SubmittalProgressBO;
  onClose: () => void;
}

export function ProgressLoader({ isOpen, progressData, onClose }: ProgressLoaderProps) {
  if (!isOpen) return null;

  // Get step status icon
  const getStepIcon = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <div className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#00BC7D]">
          <FiCheck size={14} className="text-white" />
        </div>
      );
    } else if (status === 'IN_PROGRESS') {
      return (
        <div className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#3B82F6]">
          <Spinner size="sm" color="#FFFFFF" />
        </div>
      );
    } else {
      return <div className="h-[21px] w-[21px] rounded-full bg-[#D1D5DC]" />;
    }
  };

  // Get step text style
  const getStepTextStyle = (status: string) => {
    if (status === 'COMPLETED') {
      return 'font-medium text-[#101828]';
    } else if (status === 'IN_PROGRESS') {
      return 'font-semibold text-[#101828]';
    } else {
      return 'font-normal text-[#6A7282]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-loader-title"
    >
      <div className="relative w-full max-w-[588px] overflow-clip rounded-[14px] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {/* Spinner Icon at Top */}
        <div className="absolute left-1/2 top-[42px] h-[70px] w-[70px] -translate-x-1/2">
          <div className="absolute inset-0 rounded-full bg-[#DBEAFE]" />
          <div className="absolute left-[7px] top-[7px] h-[56px] w-[56px] rounded-full bg-white" />
          <img
            src={spinnerIcon}
            alt="Loading"
            className="absolute inset-0 h-full w-full animate-spin"
          />
        </div>

        {/* Title */}
        <h2
          id="progress-loader-title"
          className="absolute left-1/2 top-[146.2px] -translate-x-1/2 -translate-y-1/2 text-center text-[21px] font-semibold leading-[28px] text-[#101828]"
        >
          Analyzing Submittal
        </h2>

        {/* Subtitle */}
        <p className="absolute left-1/2 top-[181.99px] -translate-x-1/2 -translate-y-1/2 text-center text-[14px] leading-[21px] text-[#4A5565]">
          AI is reviewing the document against specifications...
        </p>

        {/* Progress Bar */}
        <div className="absolute left-[42px] right-[42px] top-[220.49px] h-[10.5px] overflow-clip rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#3B82F6] transition-all duration-300"
            style={{ width: `${progressData.progressPct}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <p className="absolute left-1/2 top-[246.39px] -translate-x-1/2 -translate-y-1/2 text-center text-[12.3px] leading-[17.5px] text-[#4A5565]">
          Processing: {progressData.progressPct}%
        </p>

        {/* Steps List */}
        <div className="absolute left-[42px] right-[42px] top-[283.49px] h-[168px] overflow-y-auto rounded-[12px] bg-[#F9FAFB] p-[21px]">
          {progressData.steps.map((step) => (
            <div
              key={step.stepIndex}
              className="mb-[14px] flex items-center gap-[10.5px] last:mb-0"
            >
              {getStepIcon(step.status)}
              <p className={`text-[14px] leading-[21px] ${getStepTextStyle(step.status)}`}>
                {step.stepDescription}
              </p>
            </div>
          ))}
        </div>

        {/* Continue in Background Button */}
        <button
          onClick={onClose}
          className="absolute left-1/2 top-[517.99px] h-[42px] w-[199.56px] -translate-x-1/2 rounded-[12px] border border-[#D1D5DC] bg-[#F8FAFC] text-[12.3px] font-medium leading-[17.5px] text-[#364153] transition-colors hover:bg-[#E5E7EB]"
          aria-label="Continue analysis in background"
        >
          Continue in Background
        </button>

        {/* Add padding at bottom */}
        <div className="h-[580px]" />
      </div>
    </div>
  );
}
