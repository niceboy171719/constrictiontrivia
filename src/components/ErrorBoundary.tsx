import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Uncaught app error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090D] text-[#EDE5D0] flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#EF233C] bg-[#12121B] p-6 text-center flex flex-col gap-4">
            <h1 className="font-display-pixel text-base text-[#EF233C]">SYSTEM ERROR</h1>
            <p className="text-xs text-[#9A9386] break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[42px] px-4 py-2 bg-[#EAE2CE] text-[#111116] text-xs font-bold"
            >
              Reload game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
