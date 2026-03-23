import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Form state
    const [certificationId, setCertificationId] = useState(0); // 0 for adding new
    const [formData, setFormData] = useState({
        certificationName: "",
        issuingOrganization: "",
        issueDate: ""
    });

    const fetchCertificates = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // Updated to port 3000 as per user's system preference
            const response = await axios.get("http://localhost:3000/api/certificate", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setCertificates(response.data.certificates);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch certificate details.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (cert) => {
        setCertificationId(cert.acv_certification_id);
        setFormData({
            certificationName: cert.acv_certification_name,
            issuingOrganization: cert.acv_issuing_organization,
            issueDate: cert.acv_issue_date ? cert.acv_issue_date.split('T')[0] : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setCertificationId(0);
        setFormData({
            certificationName: "",
            issuingOrganization: "",
            issueDate: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:3000/api/certificate/certificate-update", {
                certificationId,
                ...formData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                resetForm();
                fetchCertificates();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save certificate details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this certificate record?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:3000/api/certificate/delete-certificate/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                fetchCertificates(); // Refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete certificate record.");
        }
    };

    if (loading) return <div className="card"><h3>Loading...</h3></div>;

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
                <h2>{certificationId === 0 ? "Add New Certificate" : "Update Certificate"}</h2>
                
                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Certification Name</label>
                        <input
                            type="text"
                            name="certificationName"
                            value={formData.certificationName}
                            onChange={handleChange}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Issuing Organization</label>
                        <input
                            type="text"
                            name="issuingOrganization"
                            value={formData.issuingOrganization}
                            onChange={handleChange}
                            placeholder="e.g. Amazon Web Services"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Issue Date</label>
                        <input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="auth-btn">
                            {certificationId === 0 ? "Add Certificate" : "Update Details"}
                        </button>
                        {certificationId !== 0 && (
                            <button type="button" onClick={resetForm} className="auth-btn" style={{ background: '#6c757d' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                <h2>My Certificates</h2>
                {certificates.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Certification Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Issuing Organization</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Issue Date</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map((cert) => (
                                <tr key={cert.acv_certification_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{cert.acv_certification_name}</td>
                                    <td style={{ padding: '12px' }}>{cert.acv_issuing_organization}</td>
                                    <td style={{ padding: '12px' }}>
                                        {cert.acv_issue_date ? new Date(cert.acv_issue_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleEdit(cert)}
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
                                            onClick={() => handleDelete(cert.acv_certification_id)}
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
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No certificate details found. Add your first certificate above!</p>
                )}
            </div>
        </div>
    );
};

export default Certificates;
