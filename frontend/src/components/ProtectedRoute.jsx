import React from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const location = useLocation();

  // ===================================================
  // GET AUTH DATA
  // ===================================================

  const token =
    localStorage.getItem("token");

  const savedUser =
    localStorage.getItem("user");

  let user = null;

  // ===================================================
  // PARSE USER DATA SAFELY
  // ===================================================

  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Invalid saved user data:",
        error
      );

      // Remove corrupted user data
      localStorage.removeItem("user");
    }
  }

  // ===================================================
  // AUTHENTICATION CHECK
  // ===================================================

  const hasToken =
    Boolean(token);

  const hasUser =
    Boolean(user);

  const hasValidEmail =
    Boolean(
      user?.email &&
      typeof user.email === "string" &&
      user.email.trim()
    );

  const isAuthenticated =
    hasToken &&
    hasUser &&
    hasValidEmail;

  // ===================================================
  // NOT AUTHENTICATED
  // ===================================================

  if (!isAuthenticated) {
    // Clear incomplete authentication
    // state to avoid stale login data.

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  // ===================================================
  // AUTHENTICATED
  // ===================================================

  return children;
}


export default ProtectedRoute;