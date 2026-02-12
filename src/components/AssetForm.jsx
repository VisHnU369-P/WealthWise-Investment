import { useMemo, useState } from 'react'
import { usePortfolio } from '../portfolio/portfolioStore.js'

const ASSET_TYPES = ['STOCK', 'CRYPTO', 'MUTUAL_FUND']

export default function AssetForm() {
  const { addHolding } = usePortfolio()

  const [type, setType] = useState('STOCK')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    const qty = Number(quantity)
    const price = Number(purchasePrice)
    return String(name).trim().length > 0 && Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0
  }, [name, quantity, purchasePrice])

  function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!canSubmit) {
      setError('Please enter a valid asset name, quantity, and purchase price.')
      return
    }

    addHolding({
      type,
      name: name.trim(),
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
    })

    setName('')
    setQuantity('')
    setPurchasePrice('')
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <div className="cardHeader">
        <h2>Add Investment</h2>
        <p className="muted">Track stocks, crypto, or mutual funds.</p>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Asset Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Asset Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., TSLA, ETH, VTSAX" />
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
          <span>Purchase Price</span>
          <input
            inputMode="decimal"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g., 125.50"
          />
        </label>
      </div>

      {error ? <div className="callout error">{error}</div> : null}

      <div className="formActions">
        <button type="submit" className="primary" disabled={!canSubmit}>
          Add Asset
        </button>
      </div>
    </form>
  )
}

