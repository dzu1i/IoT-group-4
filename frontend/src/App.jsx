import React, { useEffect, useMemo, useState } from "react";
import { Topbar } from "./components/Topbar.jsx";
import { useMeasurements } from "./hooks/useMeasurements.js";
import { useRoute } from "./hooks/useRoute.js";
import { useTheme } from "./hooks/useTheme.js";
import { AllReadings } from "./pages/AllReadings.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { Locations } from "./pages/Locations.jsx";
import { sortReadingsNewestFirst } from "./utils/readings.js";

export function App() {
  const { readings, isLoading } = useMeasurements();
  const { route, deviceId, navigate } = useRoute();
  const { isDark, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("humigrow:isLoggedIn") === "true");

  const sortedReadings = useMemo(() => sortReadingsNewestFirst(readings), [readings]);
  const selectedReadings = useMemo(
    () => (deviceId ? sortedReadings.filter((reading) => reading.device === deviceId) : sortedReadings),
    [deviceId, sortedReadings],
  );
  const latestReading = selectedReadings[0] || sortedReadings[0];

  function handleLogin() {
    setIsLoggedIn(true);
    navigate("dashboard");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    localStorage.removeItem("humigrow:isLoggedIn");
    navigate("login");
  }

  function handleBrandClick() {
    navigate(isLoggedIn ? "dashboard" : "login");
  }

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("humigrow:isLoggedIn", "true");
    }
  }, [isLoggedIn]);

  const showLogin = route === "login" || !isLoggedIn;

  return (
    <>
      <Topbar isLoggedIn={isLoggedIn} onBrandClick={handleBrandClick} onLogout={handleLogout} onToggleTheme={toggleTheme} />
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
