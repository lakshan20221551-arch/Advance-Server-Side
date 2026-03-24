import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const EmployementHistory = () => {
    const [employments, setEmployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Form state
    const [employmentId, setEmploymentId] = useState(0); // 0 for adding new
    const [formData, setFormData] = useState({
        company: "",
        position: "",
        startDate: "",
        endDate: ""
    });

    const fetchEmployments = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3000/api/employment", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setEmployments(response.data.employments);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch employment history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (employment) => {
        setEmploymentId(employment.aev_employment_id);
        setFormData({
            company: employment.aev_company,
            position: employment.aev_position,
            startDate: employment.aev_start_date ? employment.aev_start_date.split('T')[0] : "",
            endDate: employment.aev_end_date ? employment.aev_end_date.split('T')[0] : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEmploymentId(0);
        setFormData({
            company: "",
            position: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:3000/api/employment/employment-update", {
                employmentId,
                ...formData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                resetForm();
                fetchEmployments();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save employment history.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employment record?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:3000/api/employment/delete-employment/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                fetchEmployments(); // Refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete employment record.");
        }
    };

    if (loading) return <div className="card"><h3>Loading...</h3></div>;

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
                <h2>{employmentId === 0 ? "Add New Employment History" : "Update Employment History"}</h2>

                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Company Name</label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g. Google"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Position</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="e.g. Software Engineer"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>End Date (Leave blank if current)</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="auth-btn">
                            {employmentId === 0 ? "Add Record" : "Update Details"}
                        </button>
                        {employmentId !== 0 && (
                            <button type="button" onClick={resetForm} className="auth-btn" style={{ background: '#6c757d' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                <h2>My Employment History</h2>
                {employments.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Company</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Position</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Duration</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employments.map((employment) => (
                                <tr key={employment.aev_employment_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{employment.aev_company}</td>
                                    <td style={{ padding: '12px' }}>{employment.aev_position}</td>
                                    <td style={{ padding: '12px' }}>
                                        {employment.aev_start_date ? new Date(employment.aev_start_date).toLocaleDateString() : 'N/A'} -
                                        {employment.aev_end_date ? new Date(employment.aev_end_date).toLocaleDateString() : ' Present'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(employment)}
                                            style={{
                                                padding: '5px 10px',
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '5px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employment.aev_employment_id)}
                                            style={{
                                                padding: '5px 10px',
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No employment history found. Add your first record above!</p>
                )}
            </div>
        </div>
    );
};

export default EmployementHistory;
