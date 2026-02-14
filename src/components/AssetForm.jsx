import { useMemo, useState, useEffect } from 'react'
import { usePortfolio } from '../portfolio/portfolioStore.js'
import { formatCurrency } from './Formatters.js'
import API from '../api/api.js'

export default function AssetForm() {
  const { addHolding } = usePortfolio()

  const type = 'STOCK'
  const [marketData, setMarketData] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [error, setError] = useState('')
  const [loadingMarket, setLoadingMarket] = useState(true)

  // Fetch market data from API
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await API.get('/api/market/market-data')
        const data = Array.isArray(res.data) ? res.data : res.data?.data || []
        setMarketData(data)
        if (data.length > 0 && !selectedSymbol) {
          setSelectedSymbol('')
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err)
        setMarketData([])
      } finally {
        setLoadingMarket(false)
      }
    }
    fetchMarketData()
  }, [])

  // When user selects a symbol, set purchase price to currentPrice from market data
  const selectedAsset = useMemo(
    () => marketData.find((m) => m.symbol === selectedSymbol),
    [marketData, selectedSymbol],
  )

  useEffect(() => {
    if (selectedAsset?.currentPrice != null) {
      setPurchasePrice(String(selectedAsset.currentPrice))
    } else if (!selectedSymbol) {
      setPurchasePrice('')
    }
  }, [selectedSymbol, selectedAsset?.currentPrice])

  const qtyNum = useMemo(() => Number(quantity), [quantity])
  const priceNum = useMemo(() => Number(purchasePrice), [purchasePrice])
  const totalValue = useMemo(() => {
    if (!Number.isFinite(qtyNum) || qtyNum <= 0 || !Number.isFinite(priceNum) || priceNum <= 0) {
      return null
    }
    return qtyNum * priceNum
  }, [qtyNum, priceNum])

  const canSubmit = useMemo(() => {
    return (
      selectedSymbol.trim().length > 0 &&
      Number.isFinite(qtyNum) &&
      qtyNum > 0 &&
      Number.isFinite(priceNum) &&
      priceNum > 0
    )
  }, [selectedSymbol, qtyNum, priceNum])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!canSubmit) {
      setError('Please select an asset, enter a valid quantity, and ensure price is set.')
      return
    }

    try {
      await addHolding({
        type,
        name: selectedSymbol.trim(),
        quantity: qtyNum,
        purchasePrice: priceNum,
      })

      setSelectedSymbol('')
      setQuantity('')
      setPurchasePrice('')
    } catch {
      // Error handled by SweetAlert in PortfolioProvider
    }
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <div className="cardHeader">
        <h2>Add Investment</h2>
        <p className="muted">Track stocks.</p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Asset Type</span>
          <div className="fieldReadOnly">STOCK</div>
        </label>

        <label className="field">
          <span>Asset Name</span>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            disabled={loadingMarket}
          >
            <option value="">Select a symbol...</option>
            {marketData.map((item) => (
              <option key={item._id} value={item.symbol}>
                {item.symbol} {item.currentPrice != null ? `— ${formatCurrency(item.currentPrice)}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Quantity</span>
          <input
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 10 or 0.25"
          />
        </label>

        <label className="field">
          <span>Purchase Price (current)</span>
          <input
            inputMode="decimal"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="Auto-filled when you select a symbol"
          />
        </label>
      </div>

      {totalValue != null && (
        <div className="callout" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <strong>Total value:</strong> {formatCurrency(totalValue)}
        </div>
      )}

      {error ? <div className="callout error">{error}</div> : null}

      <div className="formActions">
        <button type="submit" className="primary" disabled={!canSubmit}>
          Add Asset
        </button>
      </div>
    </form>
  )
}
