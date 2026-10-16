import React from 'react';
import { LineChart, BarChart, DonutChart } from '../components/ChartComponents';
import { Award, Clock, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const userGrowthData = [120, 240, 480, 720, 960, 1150, 1248];
  const userGrowthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const quizAttemptsData = [320, 410, 580, 790, 880, 920, 1100];
  const quizAttemptsLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const difficultyData = [120, 156, 80];
  const difficultyLabels = ["Easy", "Medium", "Hard"];
  const difficultyColors = ["var(--admin-primary)", "var(--admin-secondary)", "var(--admin-danger)"];

  const popularQuizzes = [
    { id: 1, name: "React 19 Hooks Advanced", attempts: 184, avgScore: "84.2%", successRate: "92%" },
    { id: 2, name: "Logical Aptitude & Puzzles", attempts: 642, avgScore: "76.8%", successRate: "85%" },
    { id: 3, name: "Python Encapsulation Basics", attempts: 322, avgScore: "89.5%", successRate: "97%" },
    { id: 4, name: "SQL Subqueries & Join Optimization", attempts: 412, avgScore: "68.3%", successRate: "72%" }
  ];

  const activeUsers = [
    { id: 1, name: "Vatsal Kansara", email: "vatsal.k@gmail.com", attempts: 14, avgScore: "88%", rank: "#1" },
    { id: 2, name: "Emma Watson", email: "emma@hermione.org", attempts: 18, avgScore: "85%", rank: "#2" },
    { id: 3, name: "Hardik Jadav", email: "hardik.j@gmail.com", attempts: 9, avgScore: "82%", rank: "#3" },
    { id: 4, name: "Jessica Alba", email: "jessica@alba.com", attempts: 22, avgScore: "76%", rank: "#4" }
  ];

  return (
    <div className="analytics-page-wrapper">
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Avg Assessment Time</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-info)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">12m 45s</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg duration per exam attempt</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Success Threshold</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-primary)' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="stat-value">84.6%</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Students scoring above 50%</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Popular Topic</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-secondary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">Logical Aptitude</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Highest completion rate</span>
        </div>
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">User Growth Analytics</h3>
              <span className="chart-subtitle">Account signup velocity trend</span>
            </div>
          </div>
          <div className="chart-container">
            <LineChart data={userGrowthData} labels={userGrowthLabels} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Daily Exam Attempt Volume</h3>
              <span className="chart-subtitle">Completed assessment trials by day</span>
            </div>
          </div>
          <div className="chart-container">
            <BarChart data={quizAttemptsData} labels={quizAttemptsLabels} />
          </div>
        </div>
      </section>

      <section className="section-card" style={{ marginBottom: '30px' }}>
        <h3 className="section-title" style={{ marginBottom: '20px' }}>Question Bank Difficulty Ratio</h3>
        <DonutChart data={difficultyData} labels={difficultyLabels} colors={difficultyColors} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h3 className="section-title">Most Popular Quizzes</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Topic</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {popularQuizzes.map(q => (
                  <tr key={q.id}>
                    <td><span style={{ fontWeight: 600 }}>{q.name}</span></td>
                    <td>{q.attempts}</td>
                    <td>{q.avgScore}</td>
                    <td><span className="badge active">{q.successRate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h3 className="section-title">Top Performing Students</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(u => (
                  <tr key={u.id}>
                    <td><span style={{ fontWeight: 800, color: 'var(--admin-secondary)' }}>{u.rank}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: '20px' }}>{u.attempts}</td>
                    <td><span className="badge active">{u.avgScore}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
