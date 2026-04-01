import React, { useState, useEffect } from 'react';
import './Developer.css';

const Developer = () => {
    const [keys, setKeys] = useState([]);
    const [stats, setStats] = useState({ apiUsage: [], logins: [] });
    const [newClientName, setNewClientName] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    const fetchKeys = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/api-keys/my-keys', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setKeys(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/api-keys/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchKeys();
        fetchStats();
        setLoading(false);
    }, []);

    const handleGenerateKey = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/api-keys/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ clientName: newClientName })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`API Key Generated: ${data.apiKey}\nPlease save it, it won't be visible entirely again.`);
                setNewClientName('');
                fetchKeys();
            } else {
                alert('Error generating key.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRevokeKey = async (keyId) => {
        if (!window.confirm("Are you sure you want to revoke this key?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/api-keys/revoke/${keyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchKeys();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="developer-container">
            <h1 className="dev-title">Developer Settings & Access</h1>
            <p className="dev-subtitle">Manage your API Keys and view platform usage statistics.</p>

            <div className="swagger-link-section">
                <a href="http://localhost:3000/api-docs" target="_blank" rel="noopener noreferrer" className="btn-primary">
                    View Swagger Documentation
                </a>
            </div>

            <div className="dev-section">
                <h2>Generate New API Key</h2>
                <form className="dev-form" onSubmit={handleGenerateKey}>
                    <input
                        type="text"
                        placeholder="Client / Application Name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-success">Generate Key</button>
                </form>
            </div>

            <div className="dev-section">
                <h2>Your API Keys</h2>
                <p>Use these keys as Bearer tokens to access the Public Developer API.</p>
                {keys.length === 0 ? (
                    <p>No API keys generated yet.</p>
                ) : (
                    <table className="dev-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>API Key (redacted)</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key) => (
                                <tr key={key.KeyID}>
                                    <td>{key.ClientName}</td>
                                    <td>{key.ApiKey.substring(0, 8)}**************************{key.ApiKey.slice(-4)}</td>
                                    <td>{new Date(key.CreatedAt).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${key.IsRevoked ? 'badge-revoked' : 'badge-active'}`}>
                                            {key.IsRevoked ? 'Revoked' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        {!key.IsRevoked && (
                                            <button className="btn-danger" onClick={() => handleRevokeKey(key.KeyID)}>
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="dev-section">
                <h2>API Key Usage Statistics</h2>
                <p>Number of times and time stamps of usage of keys / tokens and endpoints accessed.</p>
                {stats.apiUsage.length === 0 ? (
                    <p>No API usage recorded yet.</p>
                ) : (
                    <table className="dev-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Endpoint Accessed</th>
                                <th>IP Address</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.apiUsage.map((usage, idx) => (
                                <tr key={idx}>
                                    <td>{usage.ClientName}</td>
                                    <td>{usage.EndpointAccessed}</td>
                                    <td>{usage.IPAddress}</td>
                                    <td>{new Date(usage.AccessedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="dev-section">
                <h2>User Login Statistics</h2>
                <p>Number of times and time stamps of clients logging in.</p>
                {stats.logins.length === 0 ? (
                    <p>No login records yet.</p>
                ) : (
                    <table className="dev-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>IP Address</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.logins.map((login, idx) => (
                                <tr key={idx}>
                                    <td>{login.Email}</td>
                                    <td>{login.IPAddress}</td>
                                    <td>
                                        <span className={`badge ${login.Status === 'Success' ? 'badge-active' : 'badge-revoked'}`}>
                                            {login.Status}
                                        </span>
                                    </td>
                                    <td>{new Date(login.LoginTime).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
        </div>
    );
};

export default Developer;
