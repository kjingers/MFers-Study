import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/error-boundary";
import { BottomNav } from "./components/layout";
import { WeekPageSkeleton } from "./components/ui";
import { VerseModal } from "./components/verse-modal";
import { WeekViewer } from "./components/week";
import { DinnerSchedule } from "./pages";
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
 * Dinner page wrapper with bottom navigation.
 */
function DinnerPage() {
  return <DinnerSchedule />;
}

/**
 * Loading page component.
 */
function LoadingPage() {
  return <WeekPageSkeleton />;
}

/**
 * Layout wrapper that includes bottom navigation.
 * Used for all main routes that need the nav bar.
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

/**
 * Main App component with providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<WeekPage />} />
              <Route path="/week/:weekId" element={<WeekPage />} />
              <Route path="/dinner" element={<DinnerPage />} />
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
