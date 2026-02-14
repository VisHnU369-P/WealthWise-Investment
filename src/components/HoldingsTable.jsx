import { useEffect, useState, useMemo } from "react";
import { usePortfolio } from "../portfolio/portfolioStore.js";
import { formatCurrency, formatPercent } from "./Formatters.js";
import API from "../api/api.js";

function badgeClass(type) {
  if (type === "STOCK") return "badge blue";
  if (type === "CRYPTO") return "badge purple";
  return "badge green";
}

export default function HoldingsTable() {
  const { holdings = [], removeHolding } = usePortfolio();
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
    }));
  }, [holdings, marketPrices]);

  return (
    <div className="card">
      <div className="cardHeader row">
        <div>
          <h2>Holdings</h2>
          <p className="muted">
            Your current positions with P&L vs. cost basis.
          </p>
        </div>
        <div className="muted small">{holdings.length} assets</div>
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
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
                <td colSpan={9} className="empty">
                  No holdings yet. Add your first asset to get started.
                </td>
              </tr>
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
                    <td className="assetName">{h.symbol}</td>
                    <td>
                      <span className={badgeClass(h.assetType)}>{h.assetType}</span>
                    </td>
                    <td className="num">
                      {Number(h.quantity).toLocaleString()}
                    </td>
                    <td className="num">{formatCurrency(h.purchasePrice)}</td>
                    <td className="num">{formatCurrency(currentPricePerShare)}</td>
                    <td className="num">{formatCurrency(value)}</td>
                    <td className={`num ${pnlClass}`}>{formatCurrency(pnlAmount)}</td>
                    <td className={`num ${pnlClass}`}>{formatPercent(pnlPct)}</td>
                    <td className="actions">
                      <button
                        className="ghost"
                        onClick={() => removeHolding(h._id)}
                        aria-label={`Remove ${h.symbol}`}
                      >
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
