function ResponseTeams() {
  return (
    <div className="response-teams-card">

      <div className="emergency-card-header">
        <div>
          <h2>Response Teams</h2>
          <p>Current deployment status</p>
        </div>
      </div>

      <div className="teams-list">

        <div className="team-row">

          <div className="team-icon">
            🚑
          </div>

          <div className="team-info">
            <h4>Live Deployment Data</h4>

            <p>
              Emergency team deployment is not available
              from the connected public data source.
            </p>
          </div>

          <span className="team-status standby">
            N/A
          </span>

        </div>

      </div>

    </div>
  );
}

export default ResponseTeams;