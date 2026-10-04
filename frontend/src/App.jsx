import { useState, useEffect } from "react";
import "./App.css";

const CHECKSUM = "8f3a91c2e7b14d6a92fc01a9c92a";

/* =========================
   ICONS
========================= */

const ICONS = {
  dashboard: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z",
  update: "M12 20V8m0 0l-4 4m4-4l4 4M5 4h14",
  download: "M12 3v12m0 0l-4-4m4 4l4-4M5 20h14",
  logs: "M5 6h14M5 12h14M5 18h9",
  car: "M5 16l1.5-5.5A2 2 0 018.4 9h7.2a2 2 0 011.9 1.5L19 16M5 16h14M5 16v2.5M19 16v2.5M8 13h.01M16 13h.01",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  signal: "M5 18v-3M10 18v-6M15 18V9M20 18V5",
  thermo: "M10 14.5V5a2 2 0 114 0v9.5a4 4 0 11-4 0z",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14m0 0l-5-5m5 5l-5 5",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z",
  chip: "M9 9h6v6H9V9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2",
  range: "M4 18a8 8 0 1116 0M12 18l4-5",
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/* =========================
   PROGRESS RING
========================= */

function Ring({ value, size = 220, stroke = 12, tone = "accent", spin = false, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const offset = circumference * (1 - shown / 100);

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg
        className={`ring-svg ${spin ? "ring-spin" : ""}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className={`stop-a ${tone}`} />
            <stop offset="100%" className={`stop-b ${tone}`} />
          </linearGradient>
        </defs>
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className={`ring-fill ${tone}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={`url(#grad-${tone})`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

/* =========================
   APP
========================= */

const NAV_ITEMS = [
  { page: "Dashboard", icon: "dashboard" },
  { page: "OTA Update", icon: "update" },
  { page: "Event Logs", icon: "logs" },
  { page: "Vehicle", icon: "car" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [firmwareVersion, setFirmwareVersion] = useState("v1.0.0");
  const [availableVersion, setAvailableVersion] = useState("v1.1.0");

  const [eventLogs, setEventLogs] = useState([
    { time: "10:41:52", event: "Vehicle connected", status: "Success" },
    { time: "10:42:01", event: "New firmware detected", status: "Info" },
  ]);
  const [otaHistory, setOtaHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("otaHistory");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Could not load OTA history:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("otaHistory", JSON.stringify(otaHistory));
    } catch (error) {
      console.error("Could not save OTA history:", error);
    }
  }, [otaHistory]);

  const addEvent = (event, status) => {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    setEventLogs((previousLogs) => [{ time, event, status }, ...previousLogs]);
  };

  return (
    <div className="app">
      {/* SIDEBAR / BOTTOM BAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Icon name="bolt" size={20} />
          </div>

          <div>
            <h2>OTA Simulator</h2>
            <p>Telematics & Connectivity</p>
          </div>
        </div>

        <nav className="navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              className={`nav-button ${activePage === item.page ? "active" : ""}`}
              onClick={() => setActivePage(item.page)}
            >
              <Icon name={item.icon} />
              <span>{item.page}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="server-status">
            <span className="status-dot"></span>
            <span>Server connected</span>
          </div>

          <p>OTA Simulator v1.0</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="top-label">OTA telematics system</p>
            <h1>{activePage}</h1>
          </div>

          <div className="vehicle-status">
            <span className="status-dot"></span>

            <div>
              <small>Active vehicle</small>
              <strong>CAR-001</strong>
            </div>
          </div>
        </header>

        {activePage === "Dashboard" && (
          <Dashboard
            firmwareVersion={firmwareVersion}
            availableVersion={availableVersion}
            eventLogs={eventLogs}
            otaHistory={otaHistory}
            goTo={setActivePage}
          />
        )}

        {activePage === "OTA Update" && (
          <OTAUpdate
            addEvent={addEvent}
            firmwareVersion={firmwareVersion}
            availableVersion={availableVersion}
            setFirmwareVersion={setFirmwareVersion}
            setAvailableVersion={setAvailableVersion}
            setOtaHistory={setOtaHistory}
            otaHistory={otaHistory}
          />
        )}

        {activePage === "Event Logs" && <EventLogs eventLogs={eventLogs} />}

        {activePage === "Vehicle" && (
          <Vehicle
            firmwareVersion={firmwareVersion}
            availableVersion={availableVersion}
          />
        )}
      </main>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({ firmwareVersion, availableVersion, eventLogs, otaHistory, goTo }) {
  const lastUpdate = otaHistory.find((record) => record.result === "Success");
  const latestAttempt = otaHistory[0];

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-car-art" aria-hidden="true">
          <img src="/vehicle-hero.svg" alt="" />
          <div className="hero-car-shade"></div>
        </div>
        <div className="hero-copy">
          <div className="connected-badge">
            <span></span>
            Connected
          </div>

          <h2>CAR-001</h2>
          <p className="description">
            Monitor firmware updates, verification and vehicle connectivity.
          </p>

          <div className="hero-meta">
            <div>
              <small>Firmware</small>
              <strong>{firmwareVersion}</strong>
            </div>
            <div>
              <small>Update</small>
              <strong>{availableVersion || "Up to date"}</strong>
            </div>
          </div>

          {availableVersion ? (
            <button className="primary-button" onClick={() => goTo("OTA Update")}>
              Update to {availableVersion}
              <Icon name="arrow" size={16} />
            </button>
          ) : (
            <p className="hero-note">Your vehicle is running the latest firmware.</p>
          )}
        </div>

        <div className="hero-ring">
          <Ring value={82} size={230} stroke={14}>
            <div className="ring-value">
              82<span>%</span>
            </div>
            <div className="ring-caption">Battery</div>
          </Ring>
        </div>

        <div className="hero-telemetry">
          <Telemetry icon="range" label="Range" value="214 km" />
          <Telemetry icon="signal" label="Signal" value="4G strong" />
          <Telemetry icon="thermo" label="Battery temp" value="31 °C" />
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="stats-grid">
        <StatCard icon="chip" title="Current firmware" value={firmwareVersion} subtitle="Installed" />

        <StatCard
          icon="download"
          title="Available update"
          value={availableVersion || "Up to date"}
          subtitle={availableVersion ? "New firmware" : "No update available"}
          highlight={Boolean(availableVersion)}
        />

        <StatCard icon="car" title="Vehicle status" value="Ready" subtitle="Waiting for update" />

        <StatCard
          icon="clock"
          title="Last update"
          value={lastUpdate ? lastUpdate.version : "None yet"}
          subtitle={lastUpdate ? lastUpdate.time : "No successful updates yet"}
        />
      </section>

      {/* CONTENT */}
      <section className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-label">Firmware</p>
              <h3>Latest OTA update</h3>
            </div>

            <span className={`available-badge ${availableVersion ? "" : "muted"}`}>
              {availableVersion ? "Available" : "Installed"}
            </span>
          </div>

          <div className="firmware-version">
            <span>{availableVersion || firmwareVersion}</span>
            <small>Firmware release</small>
          </div>

         <div className="checksum-box">
  <p>
    <Icon name="shield" size={14} />
    SHA-256 checksum
  </p>
  <code>{CHECKSUM}</code>
</div>

{latestAttempt && (
  <div className="checksum-box">
    <p>Latest OTA attempt</p>

    <strong style={{ display: "block" }}>
      {latestAttempt.version} — {latestAttempt.result}
    </strong>

    {latestAttempt.reason && (
      <small style={{ display: "block", marginTop: "6px" }}>
        {latestAttempt.reason}
      </small>
    )}

    <small style={{ display: "block", marginTop: "6px" }}>
      {latestAttempt.time}
    </small>
  </div>
)}

          {availableVersion && (
            <button className="primary-button" onClick={() => goTo("OTA Update")}>
              Push update
              <Icon name="arrow" size={16} />
            </button>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-label">Activity</p>
              <h3>Recent events</h3>
            </div>

            <button className="link-button" onClick={() => goTo("Event Logs")}>
              View all
            </button>
          </div>

          <div className="events">
            {eventLogs.slice(0, 5).map((log, index) => (
              <Event
                key={`${log.time}-${index}`}
                title={log.event}
                time={log.time}
                type={log.status.toLowerCase()}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Telemetry({ icon, label, value }) {
  return (
    <div className="telemetry">
      <div className="telemetry-icon">
        <Icon name={icon} size={18} />
      </div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ icon, title, value, subtitle, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <div className="stat-top">
        <p>{title}</p>
        <Icon name={icon} size={16} />
      </div>

      <h3>{value}</h3>

      <span>{subtitle}</span>
    </div>
  );
}

/* =========================
   EVENT
========================= */

function Event({ title, time, type }) {
  return (
    <div className="event-item">
      <span className={`event-dot ${type}`}></span>

      <div>
        <strong>{title}</strong>
        <span>{time}</span>
      </div>
    </div>
  );
}

/* =========================
   OTA UPDATE
========================= */

function OTAUpdate({
  addEvent,
  firmwareVersion,
  availableVersion,
  setFirmwareVersion,
  setAvailableVersion,
  setOtaHistory,
  otaHistory,
}) {
  const [status, setStatus] = useState("ready");
  const [progress, setProgress] = useState(0);
  const [pushedVersion, setPushedVersion] = useState(availableVersion);

  const version = availableVersion || pushedVersion;

  const startUpdate = () => {
    setPushedVersion(availableVersion);
    setStatus("downloading");
    setProgress(0);

    addEvent("OTA update requested", "Success");
    addEvent("Firmware download started", "Info");

    let currentProgress = 0;

    const downloadTimer = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(downloadTimer);

        addEvent("Firmware downloaded", "Success");
        addEvent("Checksum verification started", "Info");

        setStatus("verifying");

        setTimeout(() => {
          setStatus("verified");

          addEvent("SHA-256 checksum verified", "Success");

          setTimeout(() => {
            setStatus("installing");
            setProgress(0);

            addEvent("Firmware installation started", "Info");

            let installProgress = 0;

            const installTimer = setInterval(() => {
              installProgress += 20;
              setProgress(installProgress);

              if (installProgress >= 100) {
                clearInterval(installTimer);

                setStatus("completed");
                setOtaHistory((previous) => [
                  {
                    id: Date.now(),
                    version: availableVersion || pushedVersion || firmwareVersion,
                    result: "Success",
                    time: new Date().toLocaleString(),
                  },
                  ...previous,
                ]);
                setFirmwareVersion(availableVersion);
                setAvailableVersion("");

                addEvent("Firmware installation completed", "Success");
                addEvent(`Vehicle firmware updated to ${availableVersion}`, "Success");
              }
            }, 500);
          }, 1200);
        }, 1800);
      }
    }, 300);
  };

  const simulateChecksumFailure = () => {
    setPushedVersion(availableVersion);
    setStatus("downloading");
    setProgress(0);

    addEvent("OTA update requested", "Success");
    addEvent("Firmware download started", "Info");

    let currentProgress = 0;

    const downloadTimer = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(downloadTimer);

        addEvent("Firmware downloaded", "Success");
        addEvent("Checksum verification started", "Info");

        setStatus("verifying");

        setTimeout(() => {
          setStatus("failed");
      setOtaHistory((previous) => [
  {
    id: Date.now(),
    version: availableVersion || pushedVersion || firmwareVersion,
    result: "Failed",
    reason: "SHA-256 checksum mismatch",
    time: new Date().toLocaleString(),
  },
  ...previous,
]);

          addEvent("SHA-256 checksum mismatch", "Failed");
          addEvent("Firmware installation blocked", "Failed");
        }, 1500);
      }
    }, 300);
  };

  const resetUpdate = () => {
    setStatus("ready");
    setProgress(0);
  };

  /* ring + step state derived from status */
  const upToDate = status === "ready" && !availableVersion;

  const ringValue =
    status === "downloading" || status === "installing"
      ? progress
      : status === "verifying"
      ? 30
      : status === "ready" && !upToDate
      ? 0
      : 100;

  const ringTone = status === "failed" ? "danger" : "accent";

  const downloadState =
    status === "downloading"
      ? "active"
      : status === "ready"
      ? "pending"
      : "done";

  const verifyState =
    status === "verifying"
      ? "active"
      : status === "failed"
      ? "failed"
      : ["verified", "installing", "completed"].includes(status)
      ? "done"
      : "pending";

  const installState =
    status === "installing"
      ? "active"
      : status === "completed"
      ? "done"
      : status === "failed"
      ? "blocked"
      : "pending";

  const steps = [
    { key: "download", icon: "download", title: "Download", text: "Server sends firmware package", state: downloadState },
    { key: "verify", icon: "shield", title: "Verify", text: "Validate SHA-256 checksum", state: verifyState },
    { key: "install", icon: "chip", title: "Install", text: "Write firmware to vehicle", state: installState },
  ];

  const headline = {
    ready: upToDate ? "Vehicle is up to date" : "Ready to update",
    downloading: "Downloading firmware",
    verifying: "Verifying checksum",
    verified: "Checksum verified",
    installing: "Installing firmware",
    completed: "Update completed",
    failed: "Verification failed",
  }[status];

  const detail = {
    ready: upToDate
      ? `CAR-001 is running ${firmwareVersion}.`
      : `Firmware ${version} is available for CAR-001.`,
    downloading: "Receiving firmware package from the OTA server.",
    verifying: "Comparing vehicle checksum with server checksum.",
    verified: "SHA-256 checksum matches. Firmware is valid.",
    installing: "Updating vehicle firmware. Do not disconnect.",
    completed: `CAR-001 is now running firmware ${firmwareVersion}.`,
    failed: "The received firmware does not match the expected SHA-256 checksum.",
  }[status];

  const badge =
    status === "completed" ? "Completed" : status === "failed" ? "Failed" : status === "ready" ? "Ready" : "In progress";

  return (
    <div className="page">
      <div className="card ota-card">
        <div className="card-header">
          <div>
            <p className="section-label">Firmware deployment</p>
            <h3>Push & verify</h3>
          </div>

          <span
            className={`available-badge ${
              status === "failed" ? "danger" : status === "completed" ? "success" : ""
            }`}
          >
            {badge}
          </span>
        </div>

        <div className="ota-layout">
          {/* LEFT - RING */}
          <div className="ota-visual">
            <Ring value={ringValue} size={250} stroke={14} tone={ringTone} spin={status === "verifying"}>
              {status === "downloading" || status === "installing" ? (
                <div className="ring-value">
                  {progress}
                  <span>%</span>
                </div>
              ) : status === "failed" ? (
                <div className="ring-icon danger">
                  <Icon name="x" size={44} />
                </div>
              ) : status === "verifying" ? (
                <div className="ring-icon">
                  <Icon name="shield" size={40} />
                </div>
              ) : status === "ready" && !upToDate ? (
                <div className="ring-icon">
                  <Icon name="update" size={42} />
                </div>
              ) : (
                <div className="ring-icon">
                  <Icon name="check" size={44} />
                </div>
              )}
            </Ring>

            <h4 className={status === "failed" ? "danger-text" : ""}>{headline}</h4>
            <p>{detail}</p>

            {status === "failed" && (
              <div className="failure-message">
                <strong>Installation blocked</strong>
                <span>Vehicle stays on firmware {firmwareVersion}</span>
              </div>
            )}
          </div>

          {/* RIGHT - DETAILS */}
          <div className="ota-details">
            <div className="firmware-box">
              <div className="firmware-detail">
                <span>Installed</span>
                <strong>{firmwareVersion}</strong>
              </div>

              <div className="firmware-arrow">
                <Icon name="arrow" size={18} />
              </div>

              <div className="firmware-detail">
                <span>New firmware</span>
                <strong className="accent-text">{version || "-"}</strong>
              </div>
            </div>

            <div className="checksum-box">
              <p>
                <Icon name="shield" size={14} />
                SHA-256 checksum
              </p>
              <code>{CHECKSUM}</code>
            </div>

            <ol className="steps">
              {steps.map((step) => (
                <li key={step.key} className={`step ${step.state}`}>
                  <div className="step-icon">
                    {step.state === "done" ? (
                      <Icon name="check" size={16} />
                    ) : step.state === "failed" ? (
                      <Icon name="x" size={16} />
                    ) : (
                      <Icon name={step.icon} size={16} />
                    )}
                  </div>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="ota-actions">
              {status === "ready" && availableVersion && (
                <>
                  <button className="primary-button" onClick={startUpdate}>
                    Start OTA update
                    <Icon name="arrow" size={16} />
                  </button>

                  <button className="danger-button" onClick={simulateChecksumFailure}>
                    Simulate checksum failure
                  </button>
                </>
              )}

              {status === "failed" && (
                <button className="secondary-button" onClick={resetUpdate}>
                  Try again
                </button>
              )}

              {status === "completed" && (
                <button className="secondary-button" onClick={resetUpdate}>
                  Back to start
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTA UPDATE HISTORY */}
      <div className="card">
        <div className="card-header">
          <div>
            <p className="section-label">Update records</p>
            <h3>OTA update history</h3>
          </div>
          <span className="available-badge muted">{otaHistory.length} records</span>
        </div>

        {otaHistory.length === 0 ? (
          <p className="description">No OTA updates have been performed yet.</p>
        ) : (
          <div className="log-table">
            <div className="log-header">
              <span>Time</span>
              <span>Firmware</span>
              <span>Result</span>
            </div>
            {otaHistory.map((record) => (
              <div className="log-row" key={record.id}>
                <span>{record.time}</span>
                <strong>{record.version}</strong>
                <span className={`chip ${record.result.toLowerCase()}`}>{record.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   EVENT LOGS
========================= */

const FILTERS = ["All", "Success", "Info", "Failed"];

function EventLogs({ eventLogs }) {
  const [filter, setFilter] = useState("All");

  const visibleLogs =
    filter === "All" ? eventLogs : eventLogs.filter((log) => log.status === filter);

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <div>
            <p className="section-label">System activity</p>
            <h3>Event logs</h3>
          </div>

          <span className="available-badge muted">{eventLogs.length} events</span>
        </div>

        <div className="filters">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`filter ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="log-table">
          <div className="log-header">
            <span>Time</span>
            <span>Event</span>
            <span>Status</span>
          </div>

          {visibleLogs.length === 0 && (
            <div className="log-empty">No {filter.toLowerCase()} events yet.</div>
          )}

          {visibleLogs.map((log, index) => (
            <LogRow key={index} time={log.time} event={log.event} status={log.status} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LogRow({ time, event, status }) {
  return (
    <div className="log-row">
      <span className="log-time">{time}</span>

      <strong>{event}</strong>

      <span className={`chip ${status.toLowerCase()}`}>{status}</span>
    </div>
  );
}

/* =========================
   VEHICLE
========================= */

function Vehicle({ firmwareVersion, availableVersion }) {
  return (
    <div className="page">
      <div className="card">
        <p className="section-label">Vehicle information</p>

        <h3 className="vehicle-title">CAR-001</h3>

        <div className="vehicle-grid">
          <div className="vehicle-info">
            <div className="vehicle-icon">
              <Icon name="signal" />
            </div>
            <div>
              <span>Connection</span>
              <strong className="green-text">Connected</strong>
            </div>
          </div>

          <div className="vehicle-info">
            <div className="vehicle-icon">
              <Icon name="chip" />
            </div>
            <div>
              <span>Current firmware</span>
              <strong>{firmwareVersion}</strong>
            </div>
          </div>

          <div className="vehicle-info">
            <div className="vehicle-icon">
              <Icon name="update" />
            </div>
            <div>
              <span>OTA status</span>
              <strong>{availableVersion ? "Ready for update" : "Up to date"}</strong>
            </div>
          </div>

          <div className="vehicle-info">
            <div className="vehicle-icon">
              <Icon name="car" />
            </div>
            <div>
              <span>Vehicle ID</span>
              <strong>CAR-001</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
