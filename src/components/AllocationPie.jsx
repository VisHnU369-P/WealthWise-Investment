import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { usePortfolio } from '../portfolio/portfolioStore.js'
import { formatCurrency } from './Formatters.js'

const COLORS = ['#4f8cff', '#a855f7', '#22c55e', '#f59e0b', '#ef4444']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="tooltip">
      <div className="tooltipTitle">{row.name}</div>
      <div className="tooltipValue">{formatCurrency(row.value)}</div>
    </div>
  )
}

export default function AllocationPie() {
  const { allocationData } = usePortfolio()

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Asset Allocation</h2>
        <p className="muted">Portfolio value split by asset type.</p>
      </div>

      <div className="chart">
        {allocationData.length === 0 ? (
          <div className="emptyChart">Add holdings to see allocation.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {allocationData.length ? (
        <div className="legend">
          {allocationData.map((d, idx) => (
            <div className="legendRow" key={d.name}>
              <span className="dot" style={{ background: COLORS[idx % COLORS.length] }} />
              <span className="legendName">{d.name}</span>
              <span className="legendVal">{formatCurrency(d.value)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

