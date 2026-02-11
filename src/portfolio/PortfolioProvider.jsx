import { useEffect, useMemo, useReducer } from "react";
import API from "../api/api";
import { PortfolioContext, reducer } from "./portfolioStore";

export function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { holdings: [] });

  console.log("😂😂",API)

  // 1️⃣ FETCH DATA FROM BACKEND
  useEffect(() => {
    fetchHoldings();
  }, []);

  async function fetchHoldings() {
    const res = await API.get("/api/portfolio");
    dispatch({ type: "SET_HOLDINGS", payload: res.data.data });
  }

  const actions = useMemo(() => {
    return {
      // 2️⃣ ADD HOLDING
      async addHolding(input) {
        const res = await API.post("/api/portfolio", {
          assetType: input.type,
          symbol: input.name,
          quantity: Number(input.quantity),
          purchasePrice: Number(input.purchasePrice),
        });

        dispatch({ type: "ADD_HOLDING", payload: res.data });
      },

      // 3️⃣ REMOVE HOLDING
      async removeHolding(id) {
        await API.delete(`/api/portfolio/${id}`);
        dispatch({ type: "REMOVE_HOLDING", payload: { id } });
      },
    };
  }, []);

  // 4️⃣ COMPUTED VALUES (same logic, real data)
  const computed = useMemo(() => {
    // const holdings = state.holdings;
    const holdings = Array.isArray(state.holdings) ? state.holdings : [];

    const totalCostBasis = holdings.reduce(
      (sum, h) => sum + h.quantity * h.purchasePrice,
      0,
    );

    const totalBalance = holdings.reduce((sum, h) => sum + h.currentValue, 0);

    const change24hAmount = totalBalance - totalCostBasis;
    const change24hPct =
      totalCostBasis > 0 ? change24hAmount / totalCostBasis : 0;

    const allocationByType = holdings.reduce((acc, h) => {
      acc[h.assetType] = (acc[h.assetType] || 0) + h.currentValue;
      return acc;
    }, {});

    const allocationData = Object.entries(allocationByType).map(
      ([name, value]) => ({ name, value }),
    );

    return { totalBalance, change24hAmount, change24hPct, allocationData };
  }, [state.holdings]);

  const value = {
    holdings: state.holdings,
    ...computed,
    ...actions,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
