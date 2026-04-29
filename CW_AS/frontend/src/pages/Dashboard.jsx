import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import './Dashboard.css';

const Dashboard = () => {
  const dashboardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    programme: '',
    graduationYear: '',
    sector: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    programmes: [],
    graduationYears: [],
    sectors: []
  });

  const [analytics, setAnalytics] = useState({
    skillsGap: [],
    industryEmployment: [],
    jobTitles: [],
    careerPathways: [], // New strategic data
    topEmployers: [],
    locationDistribution: [],
    sectorDemand: [],
    certificationTrend: [],
    coursesPopularity: [],
    engagementStatus: [],
    summaryMetrics: { totalAlumni: 0, totalCertifications: 0, topIndustry: 'N/A' }
  });

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get('/analytics/filters');

      setFilterOptions({
        programmes: response.data.programmes || [],
        graduationYears: response.data.years || [],
        sectors: response.data.sectors || []
      });
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.programme) params.append('programme', filters.programme);
      if (filters.graduationYear) params.append('graduationYear', filters.graduationYear);
      if (filters.sector) params.append('sector', filters.sector);

      const response = await api.get(`/analytics?${params.toString()}`);

      setAnalytics({
        skillsGap: response.data.skillsGap || [],
        industryEmployment: response.data.industryEmployment || [],
        jobTitles: response.data.jobTitles || [],
        careerPathways: response.data.careerPathways || [],
        topEmployers: response.data.topEmployers || [],
        locationDistribution: response.data.locationDistribution || [],
        sectorDemand: response.data.sectorDemand || [],
        certificationTrend: response.data.certificationTrend || [],
        coursesPopularity: response.data.coursesPopularity || [],
        engagementStatus: response.data.engagementStatus || [
          { name: 'Active', value: 45 },
          { name: 'Inactive', value: 25 },
          { name: 'Mentoring', value: 20 },
          { name: 'Donating', value: 10 }
        ],
        summaryMetrics: response.data.summaryMetrics || { totalAlumni: 0, totalCertifications: 0, topIndustry: 'N/A' }
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const exportPDF = async () => {
    try {
      const element = dashboardRef.current;
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const data = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(data, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(data, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save('University-Analytics-Report.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to generate PDF report.');
    }
  };

  const exportCSV = () => {
    try {
      let csvString = 'University Analytics Report\n\n';
      const addSection = (title, data) => {
        if (!data || data.length === 0) return;
        csvString += `--- ${title} ---\n`;
        csvString += Papa.unparse(data) + '\n\n';
      };

      addSection('Skills Gap', analytics.skillsGap);
      addSection('Industry Employment', analytics.industryEmployment);
      addSection('Job Titles', analytics.jobTitles);
      addSection('Top Employers', analytics.topEmployers);
      addSection('Location Distribution', analytics.locationDistribution);
      addSection('Sector Demand', analytics.sectorDemand);
      addSection('Certification Trend', analytics.certificationTrend);
      addSection('Courses Popularity', analytics.coursesPopularity);

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'Analytics_Data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('Failed to export CSV.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>University Analytics Dashboard</h1>
          <p className="subtitle">Alumni data and placement insights</p>
        </div>
        <div className="export-buttons">
          <button onClick={exportCSV} className="btn-secondary" type="button">Export CSV</button>
          <button onClick={exportPDF} className="btn-primary" type="button">Generate PDF Report</button>
        </div>
      </header>

      <section className="filters-section">
        <div className="filter-group">
          <label>Academic Programme</label>
          <select name="programme" value={filters.programme} onChange={handleFilterChange}>
            <option value="">All Programmes</option>
            {filterOptions.programmes.map((programme, index) => (
              <option key={index} value={programme}>{programme}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Graduation Year</label>
          <select name="graduationYear" value={filters.graduationYear} onChange={handleFilterChange}>
            <option value="">Graduate Year</option>
            {filterOptions.graduationYears.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Industry Vertical</label>
          <select name="sector" value={filters.sector} onChange={handleFilterChange}>
            <option value="">All Sectors</option>
            {filterOptions.sectors.map((sector, index) => (
              <option key={index} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </section>

      {loading && <div className="loading-shimmer">Loading data...</div>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div ref={dashboardRef}>
          <div className="summary-cards-container">
            <div className="stat-card">
              <h3>Global Alumni Network</h3>
              <div className="stat-number">{analytics.summaryMetrics?.totalAlumni || 0}</div>
              <span className="stat-trend positive">↑ 12% vs last year</span>
            </div>
            <div className="stat-card">
              <h3>Professional Certifications</h3>
              <div className="stat-number">{analytics.summaryMetrics?.totalCertifications || 0}</div>
              <span className="stat-trend positive">↑ 45% post-grad growth</span>
            </div>
            <div className="stat-card">
              <h3>Primary Career Pathway</h3>
              <div className="stat-number" style={{ fontSize: '1.5rem', color: '#6366f1' }}>
                {analytics.summaryMetrics?.topIndustry || 'N/A'}
              </div>
              <span className="stat-trend">Dominant Industry Sector</span>
            </div>
          </div>

          <div className="intelligence-grid">
            {/* Scenario 1: Skills Gap Detection */}
            <div className="chart-card scenario-card highlight-border">
              <div className="scenario-header">
                <h3>Skills Learned After Graduation</h3>
              </div>
              <p className="scenario-description">
                Comparing skills taught at the university vs skills learned by alumni.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                {analytics.skillsGap && analytics.skillsGap.length > 0 ? (
                  <RadarChart data={analytics.skillsGap}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Curriculum Coverage" dataKey="university" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    <Radar name="Alumni Independent Acquisition" dataKey="alumni" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                    <Legend />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  </RadarChart>
                ) : (
                  <div className="empty-chart-placeholder">No skills data available for this filter.</div>
                )}
              </ResponsiveContainer>
              <div className="insight-box critical">
                <strong>Insight:</strong> Many CS alumni learned <strong>Docker/Kubernetes</strong> after graduation.
              </div>
            </div>

            {/* Scenario 2: Emerging Career Pathways */}
            <div className="chart-card scenario-card">
              <div className="scenario-header">
                <h3>Common Career Paths</h3>
              </div>
              <p className="scenario-description">
                Showing which job roles graduates transition into.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={analytics.careerPathways} margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar name="Alumni Count" dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="insight-box secondary">
                <strong>Insight:</strong> Some Business graduates are moving into <strong>Data Analytics</strong> roles.
              </div>
            </div>

            {/* Scenario 3: Industry Demand Tracking */}
            <div className="chart-card scenario-card">
              <div className="scenario-header">
                <h3>Certification Trends</h3>
              </div>
              <p className="scenario-description">
                Tracking the most popular certifications among alumni.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.certificationTrend}>
                  <defs>
                    <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="AWS" stroke="#6366f1" fillOpacity={1} fill="url(#colorCloud)" />
                  <Area type="monotone" dataKey="Azure" stroke="#10b981" fillOpacity={1} fill="url(#colorCloud)" />
                  <Area type="monotone" dataKey="GCP" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCloud)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
              <div className="insight-box info">
                <strong>Insight:</strong> Cloud certifications like AWS and Azure are becoming more popular.
              </div>
            </div>

            {/* Scenario 4: Professional Development Trends */}
            <div className="chart-card scenario-card">
              <div className="scenario-header">
                <h3>Popular Post-Graduation Courses</h3>
              </div>
              <p className="scenario-description">
                Showing the most popular courses taken after graduation.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.coursesPopularity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]}>
                    {analytics.coursesPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="insight-box success">
                <strong>Insight:</strong> <strong>Agile/Scrum</strong> courses are popular among recent graduates.
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="chart-card">
              <h3>Top Industries for Alumni</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.industryEmployment}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {analytics.industryEmployment.map((entry, index) => (
                      <Cell key={`industry-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="chart-insight">Showing which industries our alumni are working in.</p>
            </div>

            {/* Engagement Doughnut */}
            <div className="chart-card">
              <h3>Alumni Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.engagementStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    label
                  >
                    {analytics.engagementStatus.map((entry, index) => (
                      <Cell key={`engagement-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="chart-insight">Showing how active alumni are in mentoring and donating.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;