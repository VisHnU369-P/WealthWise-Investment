import { usePortfolio } from '../portfolio/portfolioStore.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { formatCurrency, formatPercent } from './Formatters.js'

function deltaClass(value) {
  if (value > 0) return 'pos'
  if (value < 0) return 'neg'
  return 'muted'
}

export default function SummaryCards() {
  const { totalBalance, change24hAmount, change24hPct } = usePortfolio()
  const { isAdmin } = useAuth()

  return (
    <div className="summaryGrid">
      <div className="card stat">
        <div className="statLabel">{isAdmin ? "Total Balance (all users)" : "Total Balance"}</div>
        <div className="statValue">{formatCurrency(totalBalance)}</div>
        <div className="statHint muted">{isAdmin ? "Combined portfolio value" : "Estimated current value"}</div>
      </div>

      <div className="card stat">
        <div className="statLabel">Profit / Loss</div>
        <div className={`statValue ${deltaClass(change24hAmount)}`}>{formatCurrency(change24hAmount)}</div>
        <div className={`statHint ${deltaClass(change24hPct)}`}>{formatPercent(change24hPct)} vs. cost basis</div>
      </div>
    </div>
  )
}

