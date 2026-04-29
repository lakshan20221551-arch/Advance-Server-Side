import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import './Dashboard.css'; // Reuse dashboard styles for filters and layout

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    programme: '',
    graduationYear: '',
    sector: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    programmes: [],
    years: [], // Simplified to match backend key exactly
    sectors: []
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      console.log('Fetching filter options...');
      const response = await api.get('/analytics/filters');
      console.log('Filters response:', response.data);

      if (response.data) {
        setFilterOptions({
          programmes: response.data.programmes || [],
          years: response.data.years || [],
          sectors: response.data.sectors || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Optional: set a local error state for filters specifically
    }
  }, []);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.programme) params.append('programme', filters.programme);
      if (filters.graduationYear) params.append('graduationYear', filters.graduationYear);
      if (filters.sector) params.append('sector', filters.sector);

      const response = await api.get(`/alumni?${params.toString()}`);
      setAlumni(response.data.alumni || []);
    } catch (err) {
      console.error('Error fetching alumni list:', err);
      setError('Failed to load alumni directory.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Alumni Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Connect with our global network of graduates</p>
      </header>

      <section className="filters-section">
        <div className="filter-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.8rem', color:'var(--text-muted)'}}>Programme</label>
            <select name="programme" value={filters.programme} onChange={handleFilterChange} style={{width:'100%'}}>
            <option value="">All Programmes</option>
            {filterOptions.programmes.map((p, i) => (
                <option key={i} value={p}>{p}</option>
            ))}
            </select>
        </div>

        <div className="filter-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.8rem', color:'var(--text-muted)'}}>Graduation Year</label>
            <select name="graduationYear" value={filters.graduationYear} onChange={handleFilterChange} style={{width:'100%'}}>
            <option value="">All Years</option>
            {filterOptions.years.map((y, i) => (
                <option key={i} value={y}>{y}</option>
            ))}
            </select>
        </div>

        <div className="filter-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.8rem', color:'var(--text-muted)'}}>Industry Sector</label>
            <select name="sector" value={filters.sector} onChange={handleFilterChange} style={{width:'100%'}}>
            <option value="">All Industries</option>
            {filterOptions.sectors.map((s, i) => (
                <option key={i} value={s}>{s}</option>
            ))}
            </select>
        </div>
      </section>

      {loading && <p>Searching Alumni...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="charts-grid" style={{gridTemplateColumns: '1fr'}}>
          <div className="chart-card">
            <h3>Directory Results ({alumni.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Programme</th>
                    <th style={{ padding: '12px' }}>Class of</th>
                    <th style={{ padding: '12px' }}>Current Industry</th>
                    <th style={{ padding: '12px' }}>Bio</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map((person, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{person.FullName || 'Anonymous'}</td>
                      <td style={{ padding: '12px' }}>{person.Programme || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{person.GraduationYear || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{person.Industry || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {person.Bio || 'No bio available.'}
                      </td>
                    </tr>
                  ))}
                  {alumni.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No alumni found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniList;
