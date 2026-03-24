import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Licenses = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Form state
    const [licenseId, setLicenseId] = useState(0); // 0 for adding new
    const [formData, setFormData] = useState({
        name: "",
        authority: "",
        url: "",
        completionDate: ""
    });

    const fetchLicenses = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3000/api/license", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setLicenses(response.data.licenses);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch license details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (license) => {
        setLicenseId(license.alv_license_id);
        setFormData({
            name: license.alv_name,
            authority: license.alv_authority,
            url: license.alv_url || "",
            completionDate: license.alv_completion_date ? license.alv_completion_date.split('T')[0] : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setLicenseId(0);
        setFormData({
            name: "",
            authority: "",
            url: "",
            completionDate: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:3000/api/license/license-update", {
                licenseId,
                ...formData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                resetForm();
                fetchLicenses();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save license details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this license record?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:3000/api/license/delete-license/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                fetchLicenses(); // Refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete license record.");
        }
    };

    if (loading) return <div className="card"><h3>Loading...</h3></div>;

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
                <h2>{licenseId === 0 ? "Add New License" : "Update License"}</h2>

                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>License Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Issuing Authority</label>
                        <input
                            type="text"
                            name="authority"
                            value={formData.authority}
                            onChange={handleChange}
                            placeholder="e.g. Amazon Web Services"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>License URL (Optional)</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="e.g. https://www.credly.com/..."
                        />
                    </div>
                    <div className="input-group">
                        <label>Completion Date</label>
                        <input
                            type="date"
                            name="completionDate"
                            value={formData.completionDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="auth-btn">
                            {licenseId === 0 ? "Add License" : "Update Details"}
                        </button>
                        {licenseId !== 0 && (
                            <button type="button" onClick={resetForm} className="auth-btn" style={{ background: '#6c757d' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                <h2>My Licenses</h2>
                {licenses.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>License Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Authority</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licenses.map((license) => (
                                <tr key={license.alv_license_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        {license.alv_url ? (
                                            <a href={license.alv_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                                                {license.alv_name}
                                            </a>
                                        ) : (
                                            license.alv_name
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>{license.alv_authority}</td>
                                    <td style={{ padding: '12px' }}>
                                        {license.alv_completion_date ? new Date(license.alv_completion_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(license)}
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
                                            onClick={() => handleDelete(license.alv_license_id)}
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
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No license details found. Add your first license above!</p>
                )}
            </div>
        </div>
    );
};

export default Licenses;
