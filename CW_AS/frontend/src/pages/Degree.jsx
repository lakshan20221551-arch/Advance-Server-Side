import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Degree = () => {
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Form state
    const [degreeId, setDegreeId] = useState(0); // 0 for adding new
    const [formData, setFormData] = useState({
        degreeName: "",
        university: "",
        startDate: "",
        endDate: ""
    });

    const fetchDegrees = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // Matching the backend route at /api/degree
            const response = await axios.get("http://localhost:3000/api/degree", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setDegrees(response.data.degrees);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch degree details.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDegrees();
    }, [fetchDegrees]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (degree) => {
        setDegreeId(degree.adv_degree_id);
        setFormData({
            degreeName: degree.adv_degree_name,
            university: degree.adv_university,
            startDate: degree.adv_start_date ? degree.adv_start_date.split('T')[0] : "",
            endDate: degree.adv_end_date ? degree.adv_end_date.split('T')[0] : ""
        });
        // Scroll to form (top of card)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setDegreeId(0);
        setFormData({
            degreeName: "",
            university: "",
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
            const response = await axios.post("http://localhost:3000/api/degree/degree-update", {
                degreeId,
                ...formData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                resetForm();
                fetchDegrees();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save degree details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this degree record?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:3000/api/degree/delete-degree/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                fetchDegrees(); // Refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete degree record.");
        }
    };

    if (loading) return <div className="card"><h3>Loading...</h3></div>;

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
                <h2>{degreeId === 0 ? "Add New Degree" : "Update Degree"}</h2>

                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Degree Name</label>
                        <input
                            type="text"
                            name="degreeName"
                            value={formData.degreeName}
                            onChange={handleChange}
                            placeholder="e.g. BSc in Computer Science"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>University</label>
                        <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            placeholder="e.g. University of Moratuwa"
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
                        />
                    </div>
                    <div className="input-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="auth-btn">
                            {degreeId === 0 ? "Add Degree" : "Update Details"}
                        </button>
                        {degreeId !== 0 && (
                            <button type="button" onClick={resetForm} className="auth-btn" style={{ background: '#6c757d' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                <h2>My Degrees</h2>
                {degrees.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Degree Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>University</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Duration</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {degrees.map((degree) => (
                                <tr key={degree.adv_degree_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{degree.adv_degree_name}</td>
                                    <td style={{ padding: '12px' }}>{degree.adv_university}</td>
                                    <td style={{ padding: '12px' }}>
                                        {degree.adv_start_date ? new Date(degree.adv_start_date).getFullYear() : 'N/A'} -
                                        {degree.adv_end_date ? new Date(degree.adv_end_date).getFullYear() : 'Present'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(degree)}
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
                                            onClick={() => handleDelete(degree.adv_degree_id)}
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
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No degree details found. Add your first degree above!</p>
                )}
            </div>
        </div>
    );
};

export default Degree;
