import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface PDFViewerProps {
  isOpen: boolean;
  s3Url: string;
  documentName: string;
  onClose: () => void;
}

export function PDFViewer({ isOpen, s3Url, documentName, onClose }: PDFViewerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#101828]/45 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-viewer-title"
      >
        <div
          className="relative flex h-[calc(100dvh-32px)] w-full max-w-[800px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_0px_6px_0px_rgba(0,0,0,0.04),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-[#EEEEEE] bg-white px-6 py-6">
            <div>
              <h2
                id="pdf-viewer-title"
                className="text-[24px] font-semibold tracking-[-0.48px] text-[#101828]"
              >
                Specification Manual
              </h2>
              <p className="mt-1 text-[14px] leading-5 text-[#4A5565]">{documentName}</p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-6 top-6 inline-flex h-4 w-4 items-center justify-center text-[#2A2A2A] transition-opacity hover:opacity-70"
              aria-label="Close PDF viewer"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <iframe
              src={s3Url}
              className="h-full min-h-[400px] w-full"
              title={documentName}
            />
          </div>
        </div>
      </div>
    </>
  );
}
