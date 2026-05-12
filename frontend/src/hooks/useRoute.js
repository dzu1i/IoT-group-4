import { useEffect, useState } from "react";

const routes = {
  login: "/login",
  dashboard: "/dashboard",
  detail: "/detail",
  readings: "/detail/readings",
};

function getCurrentRoute() {
  if (window.location.pathname === routes.login) {
    return "login";
  }

  if (window.location.pathname === routes.dashboard) {
    return "dashboard";
  }

  if (window.location.pathname === routes.detail) {
    return "detail";
  }

  if (window.location.pathname === routes.readings || new URLSearchParams(window.location.search).get("view") === "all") {
    return "readings";
  }

  return "dashboard";
}

function getCurrentDeviceId() {
  return new URLSearchParams(window.location.search).get("device");
}

export function useRoute() {
  const [route, setRoute] = useState(getCurrentRoute);
  const [deviceId, setDeviceId] = useState(getCurrentDeviceId);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getCurrentRoute());
      setDeviceId(getCurrentDeviceId());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextRoute, options = {}) {
    const path = routes[nextRoute] || routes.dashboard;
    const params = new URLSearchParams();

    if (options.deviceId) {
      params.set("device", options.deviceId);
    }

    const nextUrl = params.toString() ? `${path}?${params.toString()}` : path;
    window.history.pushState({}, "", nextUrl);
    setRoute(nextRoute);
    setDeviceId(options.deviceId ?? null);
  }

  return { route, deviceId, navigate };
}
