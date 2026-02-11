import "./App.css";
import AssetForm from "./components/AssetForm.jsx";
import AllocationPie from "./components/AllocationPie.jsx";
import HoldingsTable from "./components/HoldingsTable.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import { usePortfolio } from "./portfolio/portfolioStore.js";

function App() {
  const { clearAll, holdings = [] } = usePortfolio();

  return (
    <div className="appShell">
      <header className="topbar">
        <div>
          <div className="brand">WealthWise</div>
          <div className="subtitle">Investment Tracker Dashboard</div>
        </div>
        <div className="topbarActions">
          <button
            className="ghost"
            onClick={clearAll}
            disabled={holdings.length === 0}
          >
            Clear all
          </button>
        </div>
      </header>

      <main className="layout">
        <SummaryCards />

        <div className="grid2">
          <AssetForm />
          <AllocationPie />
        </div>

        <HoldingsTable />
      </main>

      <footer className="footer muted">
        Values and 24h change are mocked locally (no live market data).
      </footer>
    </div>
  );
}

export default App;
