function EmergencyHeader() {
  return (
    <div className="emergency-header">
      <div>
        <h1>Emergency Management</h1>
        <p>Monitor active incidents and coordinate emergency response</p>
      </div>

      <div className="emergency-live-status">
        <span className="emergency-live-dot"></span>
        LIVE MONITORING
      </div>
    </div>
  );
}

export default EmergencyHeader;