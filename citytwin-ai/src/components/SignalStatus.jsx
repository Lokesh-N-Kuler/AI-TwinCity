import { useEffect, useState } from "react";
import { getSignalStatus } from "../Services/trafficService";

function SignalStatus() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSignals = async () => {
    try {
      const data = await getSignalStatus();

      console.log("REAL SIGNAL STATUS:", data);

      setSignals(data);
    } catch (error) {
      console.error("Signal Status Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();

    const interval = setInterval(loadSignals, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="signal-card">

      <div className="signal-header">
        <div>
          <h2>Traffic Signals</h2>
          <p>Live intersection conditions</p>
        </div>

        <span className="live-label">LIVE</span>
      </div>

      {loading ? (
        <div className="signal-loading">
          Loading live traffic data...
        </div>
      ) : (
        <div className="signal-list">

          {signals.map((signal, index) => (

            <div className="signal-row" key={index}>

              <div className="signal-info">

                <div
                  className={`signal-light ${
                    signal.status
                      .toLowerCase()
                      .replace(" ", "-")
                  }`}
                ></div>

                <div>
                  <h4 className="signalname">{signal.name}</h4>

                  <p className="speed">
                    {signal.speed !== null
                      ? `${signal.speed} km/h`
                      : "No traffic data"}
                  </p>
                </div>

              </div>

              <span
                className={`signal-status ${
                  signal.status
                    .toLowerCase()
                    .replace(" ", "-")
                }`}
              >
                {signal.status}
              </span>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default SignalStatus;