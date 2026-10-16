

import React, { useState, useMemo } from 'react';
import { Download, Calendar, FileSpreadsheet, FileText, ChevronRight, BarChart2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Reports() {
  const [reportType, setReportType] = useState('quiz-performance');
  const [dateRange, setDateRange] = useState('30-days');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Mock report audit logs based on type
  const reportData = useMemo(() => {
    if (reportType === 'quiz-performance') {
      return [
        { topic: "React 19 Hooks Advanced", attempts: 184, avgScore: "84.2%", passRate: "92%", status: "Stable" },
        { topic: "Logical Aptitude & Puzzles", attempts: 642, avgScore: "76.8%", passRate: "85%", status: "Optimal" },
        { topic: "Python Encapsulation Basics", attempts: 322, avgScore: "89.5%", passRate: "97%", status: "High Pass" },
        { topic: "SQL Subqueries & Join Optimization", attempts: 412, avgScore: "68.3%", passRate: "72%", status: "Needs Review" },
        { topic: "FastAPI CRUD Operations", attempts: 89, avgScore: "62.1%", passRate: "68%", status: "Needs Review" }
      ];
    } else if (reportType === 'user-registrations') {
      return [
        { period: "Aug 15 - Aug 21", signups: 180, activeUsers: 165, engagement: "91%", status: "Growing" },
        { period: "Aug 08 - Aug 14", signups: 145, activeUsers: 130, engagement: "89%", status: "Optimal" },
        { period: "Aug 01 - Aug 07", signups: 120, activeUsers: 110, engagement: "91%", status: "Stable" },
        { period: "Jul 25 - Jul 31", signups: 95, activeUsers: 85, engagement: "89%", status: "Stable" }
      ];
    } else {
      // Content audit
      return [
        { resource: "react19_perf_guide.pdf", type: "PDF Document", size: "1.2 MB", quizzesCount: 2, status: "Active" },
        { resource: "python_oop_basics.docx", type: "Word Doc", size: "840 KB", quizzesCount: 1, status: "Active" },
        { resource: "fastapi_di_architecture.pdf", type: "PDF Document", size: "2.1 MB", quizzesCount: 2, status: "Active" },
        { resource: "postgres_constraints.pdf", type: "PDF Document", size: "620 KB", quizzesCount: 0, status: "Parsing" },
        { resource: "docker_networking_deepdive.epub", type: "EPUB eBook", size: "3.5 MB", quizzesCount: 0, status: "Failed" }
      ];
    }
  }, [reportType]);

  const downloadCSV = () => {
    if (!reportData || !reportData.length) return;
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...reportData.map(row => 
        headers.map(h => {
          const cell = row[h] === null || row[h] === undefined ? '' : row[h];
          return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuestAI_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`QuestAI System Report: ${reportType.toUpperCase()}`, 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Date Range Window: ${dateRange}`, 14, 36);
    
    let y = 50;
    if (!reportData || !reportData.length) {
      doc.text("No data available.", 14, y);
    } else {
      const headers = Object.keys(reportData[0]);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      let x = 14;
      const colWidth = 180 / headers.length;
      headers.forEach(h => {
        doc.text(String(h).toUpperCase(), x, y);
        x += colWidth;
      });
      
      y += 4;
      doc.line(14, y, 196, y);
      
      doc.setFont("helvetica", "normal");
      reportData.forEach(row => {
        y += 8;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        
        x = 14;
        headers.forEach(h => {
          const val = row[h] === null || row[h] === undefined ? '' : row[h];
          doc.text(String(val), x, y);
          x += colWidth;
        });
      });
    }
    
    doc.save(`QuestAI_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = (format) => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        if (format === 'csv') {
          downloadCSV();
        } else if (format === 'pdf') {
          downloadPDF();
        }
      } catch (err) {
        console.error("Export compilation failed:", err);
        alert("Export failed: " + err.message);
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  // Mock aggregates
  const stats = [
    { title: "Report Inclusions", value: reportData.length + " records", icon: BarChart2 },
    { title: "Evaluation Window", value: dateRange === '30-days' ? "Last 30 Days" : "Custom Range", icon: Calendar },
    { title: "Mean Aggregate Score", value: "78.4%", icon: BarChart2 }
  ];

  return (
    <div className="reports-page-wrapper">
      {/* Control panel card */}
      <section className="section-card" style={{ marginBottom: '25px' }}>
        <h3 className="section-title" style={{ marginBottom: '15px' }}>Custom Report Compiler</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Select Report Focus</label>
            <select className="admin-select" value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: '100%' }}>
              <option value="quiz-performance">Quiz Performance Statistics</option>
              <option value="user-registrations">User Growth & Account Engagement</option>
              <option value="content-audit">Study Materials & Content Audit</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date Window</label>
            <select className="admin-select" value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: '100%' }}>
              <option value="7-days">Last 7 Days</option>
              <option value="30-days">Last 30 Days</option>
              <option value="custom">Custom Date range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Subject Track</label>
            <select className="admin-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="all">All Subjects</option>
              <option value="react19">React 19</option>
              <option value="python">Python</option>
              <option value="databases">Databases</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            className="admin-btn secondary" 
            disabled={isExporting}
            onClick={() => handleExport('pdf')}
          >
            <FileText size={14} />
            <span>{isExporting ? 'Compiling PDF...' : 'Download PDF'}</span>
          </button>
          <button 
            className="admin-btn" 
            disabled={isExporting}
            onClick={() => handleExport('csv')}
          >
            <FileSpreadsheet size={14} />
            <span>{isExporting ? 'Compiling CSV...' : 'Export Excel CSV'}</span>
          </button>
        </div>
      </section>

      {/* Aggregates */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '25px' }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card" style={{ padding: '16px 20px' }}>
              <div className="stat-header">
                <span className="stat-title" style={{ fontSize: '11px' }}>{s.title}</span>
                <div className="stat-icon-wrapper" style={{ width: '28px', height: '28px' }}>
                  <Icon size={14} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: '20px', marginTop: '4px', marginBottom: 0 }}>{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Rendered Audit Data */}
      <section className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            {reportType === 'quiz-performance' && 'Quiz Performance Registry'}
            {reportType === 'user-registrations' && 'Weekly Signup Tracker'}
            {reportType === 'content-audit' && 'Resource Extraction Verification Log'}
          </h3>
          <span className="badge active">Compiled Live</span>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              {reportType === 'quiz-performance' && (
                <tr>
                  <th>Quiz Title</th>
                  <th>Attempts Count</th>
                  <th>Average Score</th>
                  <th>Success Rate</th>
                  <th>System Status</th>
                </tr>
              )}
              {reportType === 'user-registrations' && (
                <tr>
                  <th>Reporting Period</th>
                  <th>Account Signups</th>
                  <th>Active Users</th>
                  <th>Average Engagement</th>
                  <th>Growth Factor</th>
                </tr>
              )}
              {reportType === 'content-audit' && (
                <tr>
                  <th>Uploaded Document</th>
                  <th>Format Type</th>
                  <th>File Size</th>
                  <th>Linked Quizzes</th>
                  <th>Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              {reportType === 'quiz-performance' && reportData.map((row, idx) => (
                <tr key={idx}>
                  <td><span style={{ fontWeight: 600 }}>{row.topic}</span></td>
                  <td>{row.attempts} attempts</td>
                  <td><strong>{row.avgScore}</strong></td>
                  <td>{row.passRate}</td>
                  <td>
                    <span className={`badge ${row.status === 'Stable' || row.status === 'Optimal' || row.status === 'High Pass' ? 'active' : 'suspended'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {reportType === 'user-registrations' && reportData.map((row, idx) => (
                <tr key={idx}>
                  <td><span style={{ fontWeight: 600 }}>{row.period}</span></td>
                  <td>{row.signups} accounts</td>
                  <td>{row.activeUsers}</td>
                  <td><strong>{row.engagement}</strong></td>
                  <td>
                    <span className="badge active">{row.status}</span>
                  </td>
                </tr>
              ))}
              {reportType === 'content-audit' && reportData.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{row.resource}</span>
                    </div>
                  </td>
                  <td>{row.type}</td>
                  <td>{row.size}</td>
                  <td>{row.quizzesCount} quizzes</td>
                  <td>
                    <span className={`badge ${row.status === 'Active' ? 'active' : row.status === 'Parsing' ? 'medium' : 'suspended'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
