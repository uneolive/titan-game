import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';

interface AnalyzingSpecPopupProps {
  isOpen: boolean;
  message: string;
}

export function AnalyzingSpecPopup({ isOpen, message }: AnalyzingSpecPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Spinner size="lg" color="#2563eb" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Analyzing Spec</h2>
          <p className="text-center text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
