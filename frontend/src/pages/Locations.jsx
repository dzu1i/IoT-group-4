import React from "react";
import { HumidityIcon } from "../components/icons/HumidityIcon.jsx";
import { TemperatureIcon } from "../components/icons/TemperatureIcon.jsx";
import { formatMetricValue } from "../utils/format.js";
import { getStatus } from "../utils/status.js";

function formatDeviceName(deviceId) {
  return deviceId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUpdatedAgo(dateValue) {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

function getDeviceList(readings) {
  const deviceMap = new Map();

  readings.forEach((reading) => {
    const current = deviceMap.get(reading.device);
    if (!current || new Date(reading.sys_cts) > new Date(current.sys_cts)) {
      deviceMap.set(reading.device, reading);
    }
  });

  return [...deviceMap.values()].sort((a, b) => new Date(b.sys_cts) - new Date(a.sys_cts));
}

export function Locations({ readings, onNavigate }) {
  const devices = getDeviceList(readings);

  return (
    <section className="locations-page" aria-labelledby="locationsTitle">
      <div className="locations-heading">
        <div>
          <h1 id="locationsTitle">My Locations</h1>
          <p>Overview of all your monitored locations.</p>
        </div>
      </div>

      <div className="location-grid">
        {devices.map((device) => {
          const status = getStatus(device);

          return (
            <button className="location-card" type="button" key={device.device} onClick={() => onNavigate("detail", { deviceId: device.device })}>
              <div className="location-card-header">
                <span className="device-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m4 10 8-6 8 6v9.5A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5V10Z" />
                    <path d="M8 15.5c0-2.2 1.8-4 4-4v7" />
                    <path d="M16 15.5c0-2.2-1.8-4-4-4" />
                    <path d="M9 13.5 6.7 12M15 13.5l2.3-1.5" />
                  </svg>
                </span>
                <div>
                  <h2>{device.location || formatDeviceName(device.device)}</h2>
                  <p>{device.device}</p>
                </div>
                <span className="card-arrow" aria-hidden="true">›</span>
              </div>

              <div className="device-metric-grid">
                <div className="device-metric">
                  <span className="device-metric-icon temperature-icon">
                    <TemperatureIcon />
                  </span>
                  <div>
                    <span>Temperature</span>
                    <strong>{formatMetricValue(device.temperature_c, "C")}</strong>
                  </div>
                </div>
                <div className="device-metric">
                  <span className="device-metric-icon humidity-icon">
                    <HumidityIcon />
                  </span>
                  <div>
                    <span>Humidity</span>
                    <strong>{formatMetricValue(device.humidity_pct, "%")}</strong>
                  </div>
                </div>
              </div>

              <div className="location-card-footer">
                <span className={`device-status ${status.className}`}>
                  <i aria-hidden="true" />
                  {status.label}
                </span>
                <span>Last updated: {formatUpdatedAgo(device.sys_cts)}</span>
              </div>
            </button>
          );
        })}
      </div>

      <footer className="locations-footer">© 2026 HumiGrow. All rights reserved.</footer>
    </section>
  );
}
