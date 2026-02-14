import "./App.css";
import AssetForm from "./components/AssetForm.jsx";
import AllocationPie from "./components/AllocationPie.jsx";
import HoldingsTable from "./components/HoldingsTable.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import SymbolLineChart from "./components/SymbolLineChart.jsx";
import { usePortfolio } from "./portfolio/portfolioStore.js";
import { useAuth } from "./auth/AuthContext.jsx";
import Login from "./components/Login.jsx";
import { PortfolioProvider } from "./portfolio/PortfolioProvider.jsx";

function Dashboard() {
  const { clearAll, holdings = [] } = usePortfolio();
  const { logout } = useAuth();

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
            onClick={logout}
            style={{ marginLeft: "0.5rem" }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="layout">
        <SummaryCards />

        <div className="grid2">
          <AssetForm />
          <AllocationPie />
        </div>

        <SymbolLineChart />

        <HoldingsTable />
      </main>

      <footer className="footer muted">
        Values and 24h change are mocked locally (no live market data).
      </footer>
    </div>
  );
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <PortfolioProvider>
      <Dashboard />
    </PortfolioProvider>
  );
}

export default App;
