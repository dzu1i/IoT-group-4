import React, { useMemo, useState } from "react";
import { Alerts } from "../components/Alerts.jsx";
import { HistoricalData } from "../components/HistoricalData.jsx";
import { MetricGrid } from "../components/MetricGrid.jsx";
import { ReadingsPanel } from "../components/ReadingsPanel.jsx";
import { getFilteredReadings } from "../utils/readings.js";

export function Dashboard({ latestReading, readings, selectedDeviceId, onNavigate }) {
  const [range, setRange] = useState("24h");
  const filteredReadings = useMemo(() => getFilteredReadings(readings, range), [readings, range]);

  return (
    <section>
      <div className="dashboard-toolbar">
        <button className="back-button" type="button" onClick={() => onNavigate("dashboard")}>
          <span aria-hidden="true">←</span>
          Back to list
        </button>
      </div>
      <Alerts latestReading={latestReading} />
      <MetricGrid latestReading={latestReading} />
      <HistoricalData range={range} readings={filteredReadings} onRangeChange={setRange} />
      <ReadingsPanel
        title="Recent Readings"
        readings={readings.slice(0, 10)}
        footer={(
          <button className="secondary-button" type="button" onClick={() => onNavigate("readings", { deviceId: selectedDeviceId })}>
            View all readings
          </button>
        )}
      />
      <footer className="detail-footer">© 2026 HumiGrow. All rights reserved.</footer>
    </section>
  );
}
