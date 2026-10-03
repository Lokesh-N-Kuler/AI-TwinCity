import AnalyticsHeader from "../components/AnalyticsHeader";
import AnalyticsStats from "../components/AnalyticsStats";
import CityPerformanceChart from "../components/CityPerformanceChart";
import DepartmentAnalytics from "../components/DepartmentAnalytics";
import AICityInsights from "../components/AICityInsights";

import "../styles/analytics.css";

function Analytics() {
  return (
    <section id="analytics" className="analytics-page">
      <AnalyticsHeader />

      <AnalyticsStats />

      <div className="analytics-chart-grid">
        <CityPerformanceChart />
        <DepartmentAnalytics />
      </div>

      <AICityInsights />
    </section>
  );
}

export default Analytics;