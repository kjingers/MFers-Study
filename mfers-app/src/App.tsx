import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookOpen, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ErrorBoundary } from "./components/error-boundary";
import { FamilyModal } from "./components/family";
import { ScheduleView } from "./components/schedule";
import { WeekPageSkeleton } from "./components/ui";
import { VerseModal } from "./components/verse-modal";
import { WeekViewer } from "./components/week";
import "./index.css";
import { formatReference } from "./lib/verse-parser";
import { useFamilyStore } from "./store";
import type { BibleReference } from "./types/verse";

/** Tab types for bottom navigation */
type TabType = "study" | "schedule";

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
 * Bottom navigation component with tab switching.
 */
interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 h-16 border-t border-border bg-surface safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-full" role="tablist">
        <button
          onClick={() => onTabChange("study")}
          className={`flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] ${
            activeTab === "study" ? "text-accent" : "text-muted-foreground"
          }`}
          role="tab"
          aria-selected={activeTab === "study"}
          aria-label="View weekly study content"
        >
          <BookOpen className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Study</span>
        </button>
        <button
          onClick={() => onTabChange("schedule")}
          className={`flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] ${
            activeTab === "schedule" ? "text-accent" : "text-muted-foreground"
          }`}
          role="tab"
          aria-selected={activeTab === "schedule"}
          aria-label="View schedule and dinner assignments"
        >
          <Utensils className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Schedule</span>
        </button>
      </div>
    </nav>
  );
}

/**
 * Main page component with tab-based navigation.
 */
function MainPage() {
  const [activeTab, setActiveTab] = useState<TabType>("study");
  const [selectedVerse, setSelectedVerse] = useState<BibleReference | null>(
    null
  );
  const navigate = useNavigate();
  const { weekId } = useParams<{ weekId: string }>();
  const isModalOpen = selectedVerse !== null;

  // Family store - trigger setup modal on first visit
  const { family, openSetupModal } = useFamilyStore();

  // Show family modal on first visit (no family set)
  useEffect(() => {
    if (!family) {
      openSetupModal();
    }
  }, [family, openSetupModal]);

  const handleVerseClick = (reference: BibleReference) => {
    console.log("Opening verse:", formatReference(reference));
    setSelectedVerse(reference);
  };

  const handleCloseModal = () => {
    setSelectedVerse(null);
  };

  const handleSelectWeek = (selectedWeekId: string) => {
    setActiveTab("study");
    navigate(`/week/${selectedWeekId}`);
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
        {activeTab === "study" ? (
          <WeekViewer onVerseClick={handleVerseClick} weekId={weekId} />
        ) : (
          <ScheduleView onSelectWeek={handleSelectWeek} />
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Verse Modal - Integrated with API */}
      <VerseModal
        reference={selectedVerse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Family Setup Modal - Shows on first visit */}
      <FamilyModal />
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
            <Route path="/" element={<MainPage />} />
            <Route path="/week/:weekId" element={<MainPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
