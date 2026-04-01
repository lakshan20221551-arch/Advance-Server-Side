import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const Home = () => {
    const [profile, setProfile] = useState(null);
    const [winner, setWinner] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHomeData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const profileRes = await axios.get("http://localhost:3000/api/profile/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.data.success) {
                setProfile(profileRes.data.profile);
            }

            const winnerRes = await axios.get("http://localhost:3000/api/bids/winner-today");
            if (winnerRes.data.success) {
                setWinner(winnerRes.data.winner);
            }

        } catch (err) {
            console.error("Home Page Fetch Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchHomeData();
    }, [fetchHomeData]);

    if (loading) return <div className="loading-container"><h3>Loading Alumni Portal...</h3></div>;

    const portalItems = [
        { name: "My Profile", path: "/profile", icon: "👤", color: "#4cc9f0" },
        { name: "Daily Bidding", path: "/bidding", icon: "🥇", color: "#4895ef" },
        { name: "Degrees", path: "/degree", icon: "🎓", color: "#4361ee" },
        { name: "Certificates", path: "/certificate", icon: "📜", color: "#3f37c9" },
        { name: "Employment", path: "/employment", icon: "💼", color: "#3a0ca3" }
    ];

    return (
        <div className="home-wrapper">
            {/* Custom Styles for Home to avoid .card conflicts */}
            <style>{`
                .home-wrapper {
                    min-height: 90vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .hero-banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    padding: 100px 20px;
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: 700;
                    font-style: italic;
                    font-family: 'Arial', sans-serif;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: -60px;
                }
                .hero-banner::after {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                .hero-banner h1 {
                    font-size: 3.2rem;
                    margin-bottom: 12px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    text-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .hero-banner p {
                    font-size: 1.3rem;
                    opacity: 0.85;
                    max-width: 700px;
                    margin: 0 auto;
                }
                .content-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 40px 60px;
                    position: relative;
                    z-index: 10;
                }
                .top-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 30px;
                    margin-bottom: 50px;
                    align-items: stretch;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    flex-direction: column;
                }
                .winner-section {
                    display: flex;
                    gap: 30px;
                    align-items: center;
                }
                .winner-image-container {
                    position: relative;
                    flex-shrink: 0;
                }
                .winner-img {
                    width: 160px;
                    height: 160px;
                    border-radius: 24px;
                    object-fit: cover;
                    border: 4px solid #fff;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .badge {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    background: #fbbf24;
                    color: #92400e;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    text-transform: uppercase;
                }
                .winner-info h3 {
                    font-size: 1.8rem;
                    margin: 0 0 8px;
                    color: #0f172a;
                }
                .winner-bio {
                    color: #475569;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .winner-stats {
                    display: inline-flex;
                    align-items: center;
                    background: #f1f5f9;
                    padding: 6px 16px;
                    border-radius: 12px;
                    color: #334155;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .quick-links-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .quick-link-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 14px;
                    margin-bottom: 10px;
                    background: #fff;
                    border: 1px solid #f1f5f9;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .quick-link-item:hover {
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    transform: translateX(5px);
                    border-color: #3b82f6;
                }
                .icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    margin-right: 15px;
                    color: white;
                }
                .portal-title {
                    margin-top: 20px;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 25px;
                }
                .portal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
                    gap: 20px;
                }
                .portal-card {
                    background: white;
                    padding: 30px 20px;
                    border-radius: 20px;
                    text-align: center;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .portal-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: transparent;
                }
                .portal-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                    display: block;
                }
                .portal-name {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 1.1rem;
                }
                @media (max-width: 900px) {
                    .top-grid { grid-template-columns: 1fr; }
                    .hero-banner h1 { font-size: 1rem; }
                    .winner-section { flex-direction: column; text-align: center; }
                }
            `}</style>

            {/* Hero Section */}
            <header className="hero-banner">
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1>Hi {profile?.fullName || "Alumnus"}</h1>
                    <p>Building meaningful connections within our global influencer network.</p>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="content-container">
                <div className="top-grid">
                    {/* Alumni of the Day Card */}
                    <div className="glass-card">
                        <h2 style={{ textAlign: 'left', fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: '#1e293b' }}>
                            Alumni of the Day
                        </h2>
                        {winner ? (
                            <div className="winner-section">
                                <div className="winner-image-container">
                                    <img 
                                        src={winner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"} 
                                        className="winner-img" 
                                        alt={winner.name} 
                                    />
                                    <span className="badge">Featured Winner</span>
                                </div>
                                <div className="winner-info">
                                    <h3>{winner.name}</h3>
                                    <p className="winner-bio">{winner.bio || "Inspiring fellow alumni through leadership and innovation."}</p>
                                    <div className="winner-stats">
                                        <span style={{ marginRight: '8px' }}>💰</span> Monthly Winning Bid: ${winner.amount}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No features today. Will you be the next?</p>
                                <Link to="/bidding" className="auth-btn" style={{ width: 'auto', padding: '10px 24px', marginTop: '15px', display: 'inline-block' }}>
                                    Place Your Bid
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats/Links Card */}
                    <div className="glass-card">
                        <div className="quick-links-title">Jump Back In</div>
                        <div className="quick-links-list">
                            {portalItems.slice(0, 3).map((item, index) => (
                                <Link key={index} to={item.path} className="quick-link-item">
                                    <div className="icon-box" style={{ background: item.color }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Portal Section */}
                <h2 className="portal-title">Platform Resources</h2>
                <div className="portal-grid">
                    {portalItems.map((item, index) => (
                        <Link key={index} to={item.path} className="portal-card">
                            <span className="portal-icon">{item.icon}</span>
                            <span className="portal-name">{item.name}</span>
                        </Link>
                    ))}
                    {/* <Link to="/settings" className="portal-card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
                        <span className="portal-icon">⚙️</span>
                        <span className="portal-name">Settings</span>
                    </Link> */}
                </div>
            </main>
        </div>
    );
};

export default Home;
