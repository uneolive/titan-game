import { Component, ErrorInfo, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App render failed', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-6 py-10">
          <div className="w-full max-w-[720px] rounded-[10px] border border-[#FECACA] bg-white p-6 shadow-sm">
            <h1 className="text-[20px] font-semibold leading-7 text-[#101828]">
              App failed to render
            </h1>
            <p className="mt-2 text-[14px] leading-5 text-[#4A5565]">
              A runtime error occurred while loading the interface.
            </p>
            <pre className="mt-4 overflow-auto rounded-[4px] bg-[#F9FAFB] p-4 text-[12px] leading-5 text-[#B42318]">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
