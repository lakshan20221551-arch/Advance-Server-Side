import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Bid = () => {
    const [amount, setAmount] = useState("");
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState({ biddingStatus: "N/A", amount: 0 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchStatus = useCallback(async (date) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3000/api/bids/status/${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setStatus(response.data);
            }
        } catch (err) {
            console.error("Fetch Status Error:", err);
            // Optionally set an error message for the user
            // setError(err.response?.data?.message || "Failed to fetch bid status.");
        }
    }, [navigate, setStatus]); // Add navigate and setStatus to useCallback dependencies

    useEffect(() => {
        fetchStatus(targetDate);
    }, [targetDate, fetchStatus]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post("http://localhost:3000/api/bids/place-bid", {
                amount,
                targetDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                fetchStatus(targetDate); // Refresh status
                setAmount(""); // Clear input
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while placing your bid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '600px', width: '95%' }}>
                <h2>Blind Bidding System</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    Place your bid for a chance to be featured as the "Alumni of the Day."
                </p>

                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message" style={{ color: 'red', background: '#fff1f0' }}>{error}</p>}

                <div className="status-banner" style={{
                    background: status.biddingStatus === "Winning" ? "#e6f7ff" : "#fff7e6",
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    border: `1px solid ${status.biddingStatus === "Winning" ? "#91d5ff" : "#ffd591"}`,
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>
                        Current Status: <span style={{ color: status.biddingStatus === "Winning" ? "#1890ff" : "#fa8c16" }}>
                            {status.biddingStatus}
                        </span>
                    </h3>
                    {status.amount > 0 && <p style={{ margin: '5px 0 0' }}>Your current bid: <strong>${status.amount}</strong></p>}
                </div>

                <form onSubmit={handleBidSubmit}>
                    <div className="input-group">
                        <label>Target Date</label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Bid Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Must be higher than your previous bid"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Placing Bid..." : "Place Bid"}
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
                        * Maximum 3 wins per month (4 if an event was attended). Deadline: Midnight.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Bid;
