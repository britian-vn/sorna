import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-[#18181B] p-6">
          <div className="max-w-lg w-full bg-white border border-[#E6E2DA] rounded-2xl p-6 space-y-4">
            <h1 className="text-xl font-bold text-[#991B1B]">
              ScholarBand — Khôi phục giao diện học tập
            </h1>
            <p className="text-sm text-zinc-600">
              Đã xảy ra lỗi dữ liệu bộ nhớ đệm cục bộ trên trình duyệt của bạn:
            </p>
            <pre className="text-xs bg-zinc-100 p-3 rounded-lg overflow-auto text-zinc-700">
              {this.state.errorMessage}
            </pre>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  // ignore
                }
                window.location.reload();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#991B1B] text-white cursor-pointer"
            >
              Làm mới bộ nhớ &amp; Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
