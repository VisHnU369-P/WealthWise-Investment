import { createContext, useContext, useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

const AuthContext = createContext(null);

const LOGIN_TIME_KEY = "wealthwise_login_time";
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);

    if (stored && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime, 10);
      
      // Check if session has expired
      if (timeElapsed >= SESSION_DURATION) {
        // Session expired, clear everything
        clearAllData();
      } else {
        // Session still valid, set token and start auto-logout timer
        setToken(stored);
        const remainingTime = SESSION_DURATION - timeElapsed;
        startAutoLogoutTimer(remainingTime);
      }
    }
    setLoading(false);

    // Cleanup timer on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  function clearAllData() {
    // Clear all localStorage data
    localStorage.clear();
    setToken(null);
    
    // Clear any timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }

  function startAutoLogoutTimer(remainingTime) {
    // Clear existing timer if any
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Show warning 1 minute before logout
    const warningTime = Math.max(remainingTime - 60000, 0);
    
    if (warningTime > 0) {
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Session Expiring Soon",
          text: "Your session will expire in 1 minute. Please save your work.",
          timer: 60000,
          showConfirmButton: true,
          confirmButtonText: "Stay Logged In",
          showCancelButton: true,
          cancelButtonText: "Logout Now",
        }).then((result) => {
          if (result.isConfirmed) {
            // User wants to stay logged in - refresh login time
            localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
            startAutoLogoutTimer(SESSION_DURATION);
          } else if (result.isDismissed || result.dismiss === Swal.DismissReason.timer) {
            // Auto logout after 1 minute
            setTimeout(() => {
              handleAutoLogout();
            }, 60000);
          } else {
            // User clicked logout now
            handleAutoLogout();
          }
        });
      }, warningTime);
    }

    // Set auto-logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, remainingTime);
  }

  function handleAutoLogout() {
    Swal.fire({
      icon: "info",
      title: "Session Expired",
      text: "Your session has expired after 4 hours. Please login again.",
      confirmButtonText: "OK",
    }).then(() => {
      clearAllData();
    });
  }

  function login(newToken) {
    const loginTime = Date.now().toString();
    localStorage.setItem("token", newToken);
    localStorage.setItem(LOGIN_TIME_KEY, loginTime);
    setToken(newToken);
    
    // Start auto-logout timer for 4 hours
    startAutoLogoutTimer(SESSION_DURATION);
  }

  function logout() {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        clearAllData();
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  const value = {
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

