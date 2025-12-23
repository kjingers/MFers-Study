import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookOpen, Utensils } from "lucide-react";
import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/error-boundary";
import { WeekPageSkeleton } from "./components/ui";
import { VerseModal } from "./components/verse-modal";
import { WeekViewer } from "./components/week";
import "./index.css";
import { formatReference } from "./lib/verse-parser";
import type { BibleReference } from "./types/verse";

/**
 * Create a QueryClient instance for TanStack Query.
 * Configured with appropriate stale times for verse caching.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main week page component with verse modal integration.
 */
function WeekPage() {
  const [selectedVerse, setSelectedVerse] = useState<BibleReference | null>(
    null
  );
  const isModalOpen = selectedVerse !== null;

  const handleVerseClick = (reference: BibleReference) => {
    console.log("Opening verse:", formatReference(reference));
    setSelectedVerse(reference);
  };

  const handleCloseModal = () => {
    setSelectedVerse(null);
  };

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      <main id="main-content">
        <WeekViewer onVerseClick={handleVerseClick} />
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 inset-x-0 h-16 border-t border-border bg-surface safe-area-bottom"
        aria-label="Main navigation"
      >
        <div className="flex justify-around items-center h-full" role="tablist">
          <button
            className="flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] text-accent"
            role="tab"
            aria-selected="true"
            aria-label="View weekly study content"
          >
            <BookOpen className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs">Week</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] text-muted-foreground"
            role="tab"
            aria-selected="false"
            aria-label="View dinner assignments"
          >
            <Utensils className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs">Dinner</span>
          </button>
        </div>
      </nav>

      {/* Verse Modal - Integrated with API */}
      <VerseModal
        reference={selectedVerse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

/**
 * Loading page component.
 */
function LoadingPage() {
  return <WeekPageSkeleton />;
}

/**
 * Main App component with providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WeekPage />} />
            <Route path="/week/:weekId" element={<WeekPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
