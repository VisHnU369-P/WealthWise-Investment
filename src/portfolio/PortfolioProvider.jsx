import { useEffect, useMemo, useReducer, useState } from "react";
import API from "../api/api";
import { PortfolioContext, reducer } from "./portfolioStore";
import Swal from "sweetalert2";

export function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { holdings: [] });
  const [marketPrices, setMarketPrices] = useState({});

  // 1️⃣ FETCH DATA FROM BACKEND
  useEffect(() => {
    fetchHoldings();
  }, []);

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

  async function fetchHoldings() {
    try {
      const res = await API.get("/api/portfolio");
      const holdings = res.data?.data || res.data || [];
      dispatch({ type: "SET_HOLDINGS", payload: holdings });
    } catch (error) {
      console.error("Failed to fetch holdings:", error);
      // Set empty array on error to prevent crashes
      dispatch({ type: "SET_HOLDINGS", payload: [] });
    }
  }

  const actions = useMemo(() => {
    return {
      // 2️⃣ ADD HOLDING
      async addHolding(input) {
        try {
          const res = await API.post("/api/portfolio", {
            assetType: input.type,
            symbol: input.name,
            quantity: Number(input.quantity),
            purchasePrice: Number(input.purchasePrice),
          });

          const newHolding = res.data?.data || res.data;
          if (newHolding) {
            dispatch({ type: "ADD_HOLDING", payload: newHolding });
            
            // Show success message
            Swal.fire({
              icon: "success",
              title: "Asset Added!",
              text: `${input.name} has been successfully added to your portfolio.`,
              timer: 2000,
              showConfirmButton: false,
            });
          }
        } catch (error) {
          console.error("Failed to add holding:", error);
          
          // Show error message with SweetAlert
          const errorMessage = 
            error?.response?.data?.message || 
            error?.message || 
            "Failed to add asset. Please try again.";
          
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
            confirmButtonText: "OK",
          });
          
          // Re-throw to allow component to handle if needed
          throw error;
        }
      },

      // 3️⃣ REMOVE HOLDING
      async removeHolding(_id) {
        // Find the holding to show its name in confirmation
        const holding = state.holdings.find((h) => h._id === _id);
        const assetName = holding?.symbol || holding?.name || "this asset";

        // Show confirmation dialog
        const result = await Swal.fire({
          title: "Remove Asset?",
          text: `Are you sure you want to remove ${assetName} from your portfolio?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Remove",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) {
          return; // User cancelled
        }

        try {
          await API.delete(`/api/portfolio/${_id}`);
          dispatch({ type: "REMOVE_HOLDING", payload: { _id } });
          
          Swal.fire({
            icon: "success",
            title: "Asset Removed!",
            text: `${assetName} has been removed from your portfolio.`,
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Failed to remove holding:", error);
          
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.response?.data?.message || "Failed to remove asset. Please try again.",
            confirmButtonText: "OK",
          });
          
          throw error;
        }
      },
    };
  }, []);

  // 4️⃣ COMPUTED VALUES: total value = sum(qty × current price), P&L = total value − cost basis
  const computed = useMemo(() => {
    const holdings = Array.isArray(state.holdings) ? state.holdings : [];

    const totalCostBasis = holdings.reduce(
      (sum, h) => sum + h.quantity * h.purchasePrice,
      0,
    );

    const totalBalance = holdings.reduce((sum, h) => {
      const currentPrice = h.currentPrice ?? marketPrices[h.symbol] ?? h.purchasePrice;
      return sum + h.quantity * currentPrice;
    }, 0);

    const change24hAmount = totalBalance - totalCostBasis;
    const change24hPct =
      totalCostBasis > 0 ? change24hAmount / totalCostBasis : 0;

    const allocationByType = holdings.reduce((acc, h) => {
      const currentPrice = h.currentPrice ?? marketPrices[h.symbol] ?? h.purchasePrice;
      const currentValue = h.quantity * currentPrice;
      acc[h.assetType] = (acc[h.assetType] || 0) + currentValue;
      return acc;
    }, {});

    const allocationData = Object.entries(allocationByType).map(
      ([name, value]) => ({ name, value }),
    );

    return { totalBalance, change24hAmount, change24hPct, allocationData };
  }, [state.holdings, marketPrices]);

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
