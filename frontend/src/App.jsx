import React, { useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Topbar } from "./components/Topbar.jsx";
import { useMeasurements } from "./hooks/useMeasurements.js";
import { useRoute } from "./hooks/useRoute.js";
import { useTheme } from "./hooks/useTheme.js";
import { AllReadings } from "./pages/AllReadings.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { Locations } from "./pages/Locations.jsx";
import { sortReadingsNewestFirst } from "./utils/readings.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function AppInner() {
  const { readings, isLoading } = useMeasurements();
  const { route, deviceId, navigate } = useRoute();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("humigrow:user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!user;

  const sortedReadings = useMemo(() => sortReadingsNewestFirst(readings), [readings]);
  const selectedReadings = useMemo(
    () => (deviceId ? sortedReadings.filter((reading) => reading.device === deviceId) : sortedReadings),
    [deviceId, sortedReadings],
  );
  const latestReading = selectedReadings[0] || sortedReadings[0];

  function handleLogin(userInfo) {
    setUser(userInfo);
    localStorage.setItem("humigrow:user", JSON.stringify(userInfo));
    navigate("dashboard");
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("humigrow:user");
    navigate("login");
  }

  function handleBrandClick() {
    navigate(isLoggedIn ? "dashboard" : "login");
  }

  const showLogin = route === "login" || !isLoggedIn;

  return (
    <>
      <Topbar user={user} onBrandClick={handleBrandClick} onLogout={handleLogout} onToggleTheme={toggleTheme} />
      <main className={showLogin ? "login-shell" : "page-shell"}>
        {showLogin ? (
          <Login isDark={isDark} onLogin={handleLogin} />
        ) : isLoading || !latestReading ? (
          <section className="panel">
            <h2>{isLoading ? "Loading readings" : "No readings yet"}</h2>
          </section>
        ) : route === "readings" ? (
          <AllReadings readings={selectedReadings} onNavigate={navigate} selectedDeviceId={deviceId} />
        ) : route === "detail" ? (
          <Dashboard latestReading={latestReading} readings={selectedReadings} selectedDeviceId={deviceId} onNavigate={navigate} />
        ) : (
          <Locations readings={sortedReadings} onNavigate={navigate} />
        )}
      </main>
    </>
  );
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppInner />
    </GoogleOAuthProvider>
  );
}
