import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [firmwareVersion, setFirmwareVersion] = useState("v1.0.0");
  const [availableVersion, setAvailableVersion] = useState("v1.1.0");

  const [eventLogs, setEventLogs] = useState([
    {
      time: "10:41:52",
      event: "Vehicle connected",
      status: "Success",
    },
    {
      time: "10:42:01",
      event: "New firmware detected",
      status: "Info",
    },
  ]);

  const addEvent = (event, status) => {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    setEventLogs((previousLogs) => [
      {
        time,
        event,
        status,
      },
      ...previousLogs,
    ]);
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⚡</div>

          <div>
            <h2>OTA SIMULATOR</h2>
            <p>Telematics & Connectivity</p>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-button ${
              activePage === "Dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-button ${
              activePage === "OTA Update" ? "active" : ""
            }`}
            onClick={() => setActivePage("OTA Update")}
          >
            <span>↻</span>
            OTA Update
          </button>

          <button
            className={`nav-button ${
              activePage === "Event Logs" ? "active" : ""
            }`}
            onClick={() => setActivePage("Event Logs")}
          >
            <span>☷</span>
            Event Logs
          </button>

          <button
            className={`nav-button ${
              activePage === "Vehicle" ? "active" : ""
            }`}
            onClick={() => setActivePage("Vehicle")}
          >
            <span>▣</span>
            Vehicle
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="server-status">
            <span className="status-dot"></span>
            <span>Server Connected</span>
          </div>

          <p>OTA Simulator v1.0</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="top-label">OTA TELEMATICS SYSTEM</p>
            <h1>{activePage}</h1>
          </div>

          <div className="vehicle-status">
            <span className="status-dot"></span>

            <div>
              <small>ACTIVE VEHICLE</small>
              <strong>CAR-001</strong>
            </div>
          </div>
        </header>

       {activePage === "Dashboard" && (
  <Dashboard
    firmwareVersion={firmwareVersion}
    availableVersion={availableVersion}
  />
)}
        {activePage === "OTA Update" && (
  <OTAUpdate
    addEvent={addEvent}
    firmwareVersion={firmwareVersion}
    availableVersion={availableVersion}
    setFirmwareVersion={setFirmwareVersion}
    setAvailableVersion={setAvailableVersion}
  />
)}
       {activePage === "Event Logs" && (
  <EventLogs eventLogs={eventLogs} />
)}
        {activePage === "Vehicle" && <Vehicle />}
      </main>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  firmwareVersion,
  availableVersion,
}) {
  return (
    <div className="page">
      <section className="welcome-section">
        <div>
          <p className="section-label">VEHICLE OVERVIEW</p>

          <h2>OTA Control Center</h2>

          <p className="description">
            Monitor firmware updates, verification and vehicle connectivity.
          </p>
        </div>

        <div className="connected-badge">
          <span></span>
          Connected
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="stats-grid">
        <StatCard
  title="CURRENT FIRMWARE"
  value={firmwareVersion}
  subtitle="Installed"
/>

        <StatCard
  title="AVAILABLE UPDATE"
  value={availableVersion || "Up to date"}
  subtitle={availableVersion ? "New firmware" : "No update available"}
  highlight={Boolean(availableVersion)}
/>

        <StatCard
          title="VEHICLE STATUS"
          value="Ready"
          subtitle="Waiting for update"
        />

        <StatCard
          title="LAST UPDATE"
          value="Today"
          subtitle="10:42 AM"
        />
      </section>

      {/* CONTENT */}
      <section className="dashboard-grid">
        {/* UPDATE CARD */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-label">FIRMWARE</p>
              <h3>Latest OTA Update</h3>
            </div>

            <span className="available-badge">AVAILABLE</span>
          </div>

          <div className="firmware-version">
            <span>v1.1.0</span>
            <small>Firmware release</small>
          </div>

          <div className="checksum-box">
            <p>SHA-256 CHECKSUM</p>

            <code>
              8f3a91c2e7b14d6a92fc01a9c92a
            </code>
          </div>

          <button className="primary-button">
            Push Update
            <span>→</span>
          </button>
        </div>

        {/* RECENT EVENTS */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-label">ACTIVITY</p>
              <h3>Recent Events</h3>
            </div>

            <button className="link-button">View all →</button>
          </div>

          <div className="events">
            <Event
              title="Vehicle connected"
              time="10:41:52"
              type="success"
            />

            <Event
              title="Firmware v1.1.0 available"
              time="10:42:01"
              type="info"
            />

            <Event
              title="Update request received"
              time="10:42:18"
              type="warning"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ title, value, subtitle, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <p>{title}</p>

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
  availableVersion,
  setFirmwareVersion,
  setAvailableVersion,
}) {
  const [status, setStatus] = useState("ready");
const [progress, setProgress] = useState(0);
const [verificationFailed, setVerificationFailed] = useState(false);

  const startUpdate = () => {
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
                setFirmwareVersion(availableVersion);
setAvailableVersion("");

                addEvent(
                  "Firmware installation completed",
                  "Success"
                );

                addEvent(
                  "Vehicle firmware updated to v1.1.0",
                  "Success"
                );
              }
            }, 500);
          }, 1200);
        }, 1800);
      }
    }, 300);
  };
  const simulateChecksumFailure = () => {
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

          addEvent(
            "SHA-256 checksum mismatch",
            "Failed"
          );

          addEvent(
            "Firmware installation blocked",
            "Failed"
          );
        }, 1500);
      }
    }, 300);
  };

  const resetUpdate = () => {
    setStatus("ready");
    setProgress(0);
  };

  return (
    <div className="page">
      <div className="card large-card">

        <div className="card-header">
          <div>
            <p className="section-label">
              FIRMWARE DEPLOYMENT
            </p>

            <h3>Push & Verify</h3>
          </div>

          <span className="available-badge">
            {status === "completed"
              ? "COMPLETED"
              : "READY"}
          </span>
        </div>

        <div className="update-flow">

          <div
            className={`flow-step ${
              status !== "ready" ? "active" : ""
            }`}
          >
            <div className="flow-number">01</div>

            <strong>Push</strong>

            <span>
              Server sends firmware
            </span>
          </div>

          <div className="flow-line"></div>

          <div
            className={`flow-step ${
              [
                "verifying",
                "verified",
                "installing",
                "completed",
              ].includes(status)
                ? "active"
                : ""
            }`}
          >
            <div className="flow-number">02</div>

            <strong>Verify</strong>

            <span>
              Validate checksum
            </span>
          </div>

          <div className="flow-line"></div>

          <div
            className={`flow-step ${
              ["installing", "completed"].includes(status)
                ? "active"
                : ""
            }`}
          >
            <div className="flow-number">03</div>

            <strong>Install</strong>

            <span>
              Update vehicle
            </span>
          </div>

        </div>

        <div className="firmware-box">

          <div className="firmware-detail">
            <span>NEW FIRMWARE</span>

            <strong>v1.1.0</strong>
          </div>

          <div className="firmware-detail">
            <span>SHA-256 CHECKSUM</span>

            <code>
              8f3a91c2e7b14d6a92fc01a9c92a
            </code>
          </div>

        </div>

        <div className="ota-status">

  {status === "failed" && (
    <>
      <div className="status-icon failure-icon">
        ✕
      </div>

      <h4>
        Checksum verification failed
      </h4>

      <p>
        The received firmware does not match
        the expected SHA-256 checksum.
      </p>

      <div className="failure-message">
        <strong>Installation blocked</strong>

        <span>
          Vehicle remains on firmware v1.1.0
        </span>
      </div>

      <button
        className="secondary-button"
        onClick={resetUpdate}
      >
        Try Again
      </button>
    </>
  )}

  {status === "ready" && (
    <>
      <div className="status-icon">
        ↑
      </div>

      <h4>
        Ready to update
      </h4>

      <p>
        Firmware v1.1.0 is available
        for CAR-001.
      </p>
    </>
  )}

  {status === "downloading" && (
    <>
      <div className="status-icon spinning">
        ↻
      </div>

      <h4>
        Downloading firmware...
      </h4>

      <p>
        Receiving firmware package
        from OTA server.
      </p>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

      <span className="progress-text">
        {progress}%
      </span>
    </>
  )}

  {status === "verifying" && (
    <>
      <div className="status-icon spinning">
        ✓
      </div>

      <h4>
        Verifying checksum...
      </h4>

      <p>
        Comparing vehicle checksum
        with server checksum.
      </p>
    </>
  )}

  {status === "verified" && (
    <>
      <div className="status-icon success-icon">
        ✓
      </div>

      <h4>
        Checksum verified
      </h4>

      <p>
        SHA-256 checksum matches.
        Firmware is valid.
      </p>
    </>
  )}

  {status === "installing" && (
    <>
      <div className="status-icon spinning">
        ⚙
      </div>

      <h4>
        Installing firmware...
      </h4>

      <p>
        Updating vehicle firmware.
        Do not disconnect.
      </p>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

      <span className="progress-text">
        {progress}%
      </span>
    </>
  )}

  {status === "completed" && (
    <>
      <div className="status-icon success-icon">
        ✓
      </div>

      <h4>
        Update completed successfully
      </h4>

      <p>
        CAR-001 is now running
        firmware v1.1.0.
      </p>

      <button
        className="secondary-button"
        onClick={resetUpdate}
      >
        Run Again
      </button>
    </>
  )}

</div>

{status === "ready" && (
  <div className="ota-actions">

    <button
      className="primary-button"
      onClick={startUpdate}
    >
      Start OTA Update →
    </button>

    <button
      className="danger-button"
      onClick={simulateChecksumFailure}
    >
      Simulate Checksum Failure
    </button>

  </div>
)}

      </div>
    </div>
  );
}
/* =========================
   EVENT LOGS
========================= */

function EventLogs({ eventLogs }) {
  return (
    <div className="page">

      <div className="card large-card">

        <div className="card-header">

          <div>
            <p className="section-label">
              SYSTEM ACTIVITY
            </p>

            <h3>
              Event Logs
            </h3>
          </div>

          <span className="available-badge">
            {eventLogs.length} EVENTS
          </span>

        </div>

        <div className="log-table">

          <div className="log-header">
            <span>TIME</span>
            <span>EVENT</span>
            <span>STATUS</span>
          </div>

          {eventLogs.map((log, index) => (
            <LogRow
              key={index}
              time={log.time}
              event={log.event}
              status={log.status}
            />
          ))}

        </div>

      </div>

    </div>
  );
}

/* =========================
   LOG ROW
========================= */

function LogRow({ time, event, status }) {
  return (
    <div className="log-row">
      <span>{time}</span>

      <strong>{event}</strong>

      <span className={`log-status ${status.toLowerCase()}`}>
        {status}
      </span>
    </div>
  );
}

/* =========================
   VEHICLE
========================= */

function Vehicle() {
  return (
    <div className="page">
      <div className="card large-card">
        <p className="section-label">VEHICLE INFORMATION</p>

        <h3 className="vehicle-title">CAR-001</h3>

        <div className="vehicle-grid">
          <div className="vehicle-info">
            <span>CONNECTION</span>
            <strong className="green-text">Connected</strong>
          </div>

          <div className="vehicle-info">
            <span>CURRENT FIRMWARE</span>
            <strong>v1.0.0</strong>
          </div>

          <div className="vehicle-info">
            <span>OTA STATUS</span>
            <strong>Ready for update</strong>
          </div>

          <div className="vehicle-info">
            <span>VEHICLE ID</span>
            <strong>CAR-001</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;