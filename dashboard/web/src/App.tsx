import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { PowerBIHeader } from "./components/powerbi/PowerBIHeader";
import { PowerBISlicers } from "./components/powerbi/PowerBISlicers";
import { LoadingScreen } from "./components/powerbi/LoadingScreen";
import { OverviewPage } from "./components/powerbi/pages/OverviewPage";
import { AnalysisPage } from "./components/powerbi/pages/AnalysisPage";
import { ComparisonPage } from "./components/powerbi/pages/ComparisonPage";
import { TrendsPage } from "./components/powerbi/pages/TrendsPage";
import { DetailsPage } from "./components/powerbi/pages/DetailsPage";
import { LiteraturePage } from "./components/powerbi/pages/LiteraturePage";
import { RagPage } from "./components/powerbi/pages/RagPage";

function PageContent() {
  const { activePage } = useDashboard();
  return (
    <div key={activePage} className="page-enter h-full">
      {activePage === "overview" && <OverviewPage />}
      {activePage === "analysis" && <AnalysisPage />}
      {activePage === "comparison" && <ComparisonPage />}
      {activePage === "trends" && <TrendsPage />}
      {activePage === "details" && <DetailsPage />}
      {activePage === "rag" && <RagPage />}
      {activePage === "literature" && <LiteraturePage />}
    </div>
  );
}

function DashboardContent() {
  const { loading, error } = useDashboard();

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1f6] p-6">
        <div className="rounded border border-red-200 bg-white px-8 py-6 text-sm text-red-700 shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PowerBIHeader />
      <div className="flex min-h-0 flex-1">
        <PowerBISlicers />
        <main className="pbi-canvas min-w-0 flex-1 overflow-auto">
          <PageContent />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
