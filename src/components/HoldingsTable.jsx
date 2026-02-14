import { useEffect, useState, useMemo, Fragment } from "react";
import { usePortfolio } from "../portfolio/portfolioStore.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { formatCurrency, formatPercent } from "./Formatters.js";
import API from "../api/api.js";

// Map userId (full or last 6 chars) to display name when API doesn't send user.name
const USER_ID_TO_NAME = {
  "698cc53883e71ad9916eac23": "Vishnu",
  "6eac23": "Vishnu",
  "acb010": "Admin",
};

function getUserDisplayName(h) {
  const fromApi = h.user?.name ?? h.userName ?? h.user?.email ?? h.userEmail;
  if (fromApi) return fromApi;
  const id = h.userId ? String(h.userId) : "";
  return USER_ID_TO_NAME[id] ?? USER_ID_TO_NAME[id.slice(-6)] ?? (id ? id.slice(-6) : "—");
}

function badgeClass(type) {
  if (type === "STOCK") return "badge blue";
  if (type === "CRYPTO") return "badge purple";
  return "badge green";
}

export default function HoldingsTable() {
  const { holdings = [], removeHolding } = usePortfolio();
  const { isAdmin } = useAuth();
  const [marketPrices, setMarketPrices] = useState({});

  useEffect(() => {
    API.get("/api/market/market-data")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const map = {};
        data.forEach((item) => {
          if (item.symbol && item.currentPrice != null) map[item.symbol] = item.currentPrice;
        });
        setMarketPrices(map);
      })
      .catch(() => setMarketPrices({}));
  }, []);

  const holdingsWithPrice = useMemo(() => {
    return holdings.map((h) => ({
      ...h,
      displayCurrentPrice: h.currentPrice ?? marketPrices[h.symbol] ?? h.purchasePrice,
      userLabel: getUserDisplayName(h),
    }));
  }, [holdings, marketPrices]);

  const groupedByUser = useMemo(() => {
    if (!isAdmin) return null;
    const groups = new Map();
    holdingsWithPrice.forEach((h) => {
      const key = h.userId ?? h.userLabel ?? "—";
      if (!groups.has(key)) groups.set(key, { userLabel: h.userLabel, holdings: [] });
      groups.get(key).holdings.push(h);
    });
    return Array.from(groups.values());
  }, [isAdmin, holdingsWithPrice]);

  return (
    <div className="card">
      <div className="cardHeader row">
        <div>
          <h2>Holdings</h2>
          <p className="muted">
            {isAdmin
              ? "All users' holdings — view and manage by user."
              : "Your current positions with P&L vs. cost basis."}
          </p>
        </div>
        <div className="muted small">{holdings.length} assets</div>
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              {isAdmin && <th>User</th>}
              <th>Symbol</th>
              <th>Type</th>
              <th className="num">Qty</th>
              <th className="num">Purchase</th>
              <th className="num">Current Price</th>
              <th className="num">Value</th>
              <th className="num">P&L</th>
              <th className="num">P&L %</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 10 : 9} className="empty">
                  {isAdmin ? "No holdings from any user yet." : "No holdings yet. Add your first asset to get started."}
                </td>
              </tr>
            ) : isAdmin && groupedByUser?.length ? (
              groupedByUser.map((group) => (
                <Fragment key={`group-${group.userLabel}`}>
                  <tr className="holdingsGroupHeader">
                    <td colSpan={10}>
                      <span className="holdingsGroupName">{group.userLabel}</span>
                      <span className="muted small"> · {group.holdings.length} asset{group.holdings.length !== 1 ? "s" : ""}</span>
                    </td>
                  </tr>
                  {group.holdings.map((h) => {
                    const costBasis = h.quantity * h.purchasePrice;
                    const currentPricePerShare = h.displayCurrentPrice;
                    const value = h.quantity * currentPricePerShare;
                    const pnlAmount = value - costBasis;
                    const pnlPct = costBasis > 0 ? pnlAmount / costBasis : 0;
                    const pnlClass = pnlAmount >= 0 ? "pos" : "neg";
                    return (
                      <tr key={h._id}>
                        <td className="userCellGrouped" />
                        <td className="assetName">{h.symbol}</td>
                        <td>
                          <span className={badgeClass(h.assetType)}>{h.assetType}</span>
                        </td>
                        <td className="num">{Number(h.quantity).toLocaleString()}</td>
                        <td className="num">{formatCurrency(h.purchasePrice)}</td>
                        <td className="num">{formatCurrency(currentPricePerShare)}</td>
                        <td className="num">{formatCurrency(value)}</td>
                        <td className={`num ${pnlClass}`}>{formatCurrency(pnlAmount)}</td>
                        <td className={`num ${pnlClass}`}>{formatPercent(pnlPct)}</td>
                        <td className="actions">
                          <button className="ghost" onClick={() => removeHolding(h._id)} aria-label={`Remove ${h.symbol}`}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))
            ) : (
              holdingsWithPrice.map((h) => {
                const costBasis = h.quantity * h.purchasePrice;
                const currentPricePerShare = h.displayCurrentPrice;
                const value = h.quantity * currentPricePerShare;
                const pnlAmount = value - costBasis;
                const pnlPct = costBasis > 0 ? pnlAmount / costBasis : 0;
                const pnlClass = pnlAmount >= 0 ? "pos" : "neg";
                return (
                  <tr key={h._id}>
                    {isAdmin && <td className="muted small">{h.userLabel}</td>}
                    <td className="assetName">{h.symbol}</td>
                    <td>
                      <span className={badgeClass(h.assetType)}>{h.assetType}</span>
                    </td>
                    <td className="num">{Number(h.quantity).toLocaleString()}</td>
                    <td className="num">{formatCurrency(h.purchasePrice)}</td>
                    <td className="num">{formatCurrency(currentPricePerShare)}</td>
                    <td className="num">{formatCurrency(value)}</td>
                    <td className={`num ${pnlClass}`}>{formatCurrency(pnlAmount)}</td>
                    <td className={`num ${pnlClass}`}>{formatPercent(pnlPct)}</td>
                    <td className="actions">
                      <button className="ghost" onClick={() => removeHolding(h._id)} aria-label={`Remove ${h.symbol}`}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
