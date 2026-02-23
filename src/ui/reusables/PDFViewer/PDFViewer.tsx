import { FiX } from 'react-icons/fi';

interface PDFViewerProps {
  isOpen: boolean;
  s3Url: string;
  documentName: string;
  onClose: () => void;
}

export function PDFViewer({ isOpen, s3Url, documentName, onClose }: PDFViewerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel */}
      <div
        className="fixed right-0 top-0 z-50 h-screen w-[700px] overflow-hidden bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-in-out"
        style={{ borderLeft: '1.6px solid #E5E7EB' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-viewer-title"
      >
        {/* Header */}
        <div
          className="flex h-[71.6px] items-center justify-between bg-[#F4F6F9] px-[21px]"
          style={{ borderBottom: '1.6px solid #E5E7EB' }}
        >
          <div>
            <h2
              id="pdf-viewer-title"
              className="text-[15.8px] font-semibold leading-[24.5px] text-[#101828]"
            >
              Specification Document
            </h2>
            <p className="text-[12.3px] font-normal leading-[17.5px] text-[#4A5565]">
              {documentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-[17.5px] w-[17.5px] items-center justify-center text-[#6B7280] transition-colors hover:text-[#0F172A]"
            aria-label="Close PDF viewer"
          >
            <FiX size={17.5} />
          </button>
        </div>

        {/* PDF Content Area */}
        <div className="h-[calc(100%-71.6px)] overflow-auto bg-[#F3F4F6] p-[21px]">
          <div className="rounded-[10px] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
            <iframe
              src={s3Url}
              className="h-[calc(100vh-150px)] w-full rounded-[10px]"
              title={documentName}
            />
          </div>
        </div>
      </div>
    </>
  );
}
