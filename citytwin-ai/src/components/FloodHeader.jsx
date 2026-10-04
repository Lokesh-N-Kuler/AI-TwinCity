function FloodHeader({ updatedAt }) {
  return (
    <div className="flood-header">

      <div>
        <h1>🌊 Flood Monitoring & Prediction</h1>

        <p>
          Live rainfall monitoring and geographic flood-risk analysis
        </p>
      </div>

      <div className="flood-live-status">

        <span className="flood-live-dot"></span>

        <span>
          Live Monitoring
        </span>

        {updatedAt && (
          <small>
            Updated {new Date(updatedAt).toLocaleTimeString("en-IN")}
          </small>
        )}

      </div>

    </div>
  );
}

export default FloodHeader;
