import { usePortfolio } from "../portfolio/portfolioStore.js";
import { formatCurrency, formatPercent } from "./Formatters.js";

function badgeClass(type) {
  if (type === "STOCK") return "badge blue";
  if (type === "CRYPTO") return "badge purple";
  return "badge green";
}

export default function HoldingsTable() {
  const { holdings = [], removeHolding } = usePortfolio();

  console.log("HoldingsTable render: holdings =", holdings);

  return (
    <div className="card">
      <div className="cardHeader row">
        <div>
          <h2>Holdings</h2>
          <p className="muted">
            Your current positions (mock 24h change per holding).
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
              <th className="num">Value</th>
              <th className="num">24h</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  No holdings yet. Add your first asset to get started.
                </td>
              </tr>
            ) : (
              holdings.map((h) => {
                const costBasis = h.quantity * h.purchasePrice;
                const value = h.currentPrice ? h.quantity * h.currentPrice : costBasis * (1 + (h.dailyChangePct || 0));
                const pct = h.dailyChangePct || 0;
                const pctClass = pct >= 0 ? "pos" : "neg";

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
                    <td className="num">{formatCurrency(value)}</td>
                    <td className={`num ${pctClass}`}>{formatPercent(pct)}</td>
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
