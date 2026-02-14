import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../api/api.js";
import { formatCurrency } from "./Formatters.js";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="tooltip">
      <div className="tooltipTitle">{row.date}</div>
      <div className="tooltipValue">{formatCurrency(row.close)}</div>
    </div>
  );
}

export default function SymbolLineChart() {
  const [marketData, setMarketData] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/market/market-data")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMarketData(data);
      })
      .catch(() => setMarketData([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedAsset = useMemo(
    () => marketData.find((m) => m.symbol === selectedSymbol),
    [marketData, selectedSymbol],
  );

  const chartData = useMemo(() => {
    if (!selectedAsset?.history?.length) return [];
    return [...selectedAsset.history].reverse().map((d) => ({
      date: d.date,
      close: Number(d.close),
    }));
  }, [selectedAsset]);

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Stock Price Chart</h2>
        <p className="muted">Select a symbol to view price history (based on market data).</p>
      </div>

      <div className="chartSearchRow">
        <select
          className="chartSymbolSelect"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a symbol</option>
          {marketData.map((item) => (
            <option key={item._id} value={item.symbol}>
              {item.symbol} {item.currentPrice != null ? `— ${formatCurrency(item.currentPrice)}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="chart lineChartContainer">
        {!selectedSymbol ? (
          <div className="emptyChart">Select a symbol to see the line chart.</div>
        ) : chartData.length === 0 ? (
          <div className="emptyChart">No history data for {selectedSymbol}.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#4f8cff"
                strokeWidth={2}
                dot={{ fill: "#4f8cff", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {selectedSymbol && selectedAsset?.currentPrice != null && (
        <div className="chartLegend muted small">
          {selectedSymbol} — Current: {formatCurrency(selectedAsset.currentPrice)}
        </div>
      )}
    </div>
  );
}
