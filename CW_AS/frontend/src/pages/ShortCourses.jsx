import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const ShortCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Form state
    const [courseId, setCourseId] = useState(0); // 0 for adding new
    const [formData, setFormData] = useState({
        name: "",
        provider: "",
        url: "",
        completionDate: ""
    });

    const fetchCourses = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get("http://localhost:3000/api/short-course", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setCourses(response.data.courses);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch course details.");
        } finally {
            setLoading(false);
        }
    }, [navigate, setCourses]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (course) => {
        setCourseId(course.asv_course_id);
        setFormData({
            name: course.asv_name,
            provider: course.asv_provider,
            url: course.asv_url || "",
            completionDate: course.asv_completion_date ? course.asv_completion_date.split('T')[0] : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setCourseId(0);
        setFormData({
            name: "",
            provider: "",
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
            const response = await axios.post("http://localhost:3000/api/short-course/course-update", {
                courseId,
                ...formData
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                resetForm();
                fetchCourses();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save course details.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course record?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await axios.delete(`http://localhost:3000/api/short-course/delete-course/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setMessage(response.data.message);
                fetchCourses(); // Refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete course record.");
        }
    };

    if (loading) return <div className="card"><h3>Loading...</h3></div>;

    return (
        <div className="card">
            <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
                <h2>{courseId === 0 ? "Add New Short Course" : "Update Short Course"}</h2>

                {message && <p className="message" style={{ color: 'green', background: '#e6fffa' }}>{message}</p>}
                {error && <p className="message">{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Course Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. React Native Masterclass"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Provider / Authority</label>
                        <input
                            type="text"
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            placeholder="e.g. Udemy / Coursera"
                            required
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Certificate URL (Optional)</label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="e.g. https://www.udemy.com/certificate/..."
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
                            {courseId === 0 ? "Add Course" : "Update Details"}
                        </button>
                        {courseId !== 0 && (
                            <button type="button" onClick={resetForm} className="auth-btn" style={{ background: '#6c757d' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                <h2>My Short Courses</h2>
                {courses.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Course Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Provider</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.asv_course_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        {course.asv_url ? (
                                            <a href={course.asv_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                                                {course.asv_name}
                                            </a>
                                        ) : (
                                            course.asv_name
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>{course.asv_provider}</td>
                                    <td style={{ padding: '12px' }}>
                                        {course.asv_completion_date ? new Date(course.asv_completion_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(course)}
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
                                            onClick={() => handleDelete(course.asv_course_id)}
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
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No short course details found. Add your first course above!</p>
                )}
            </div>
        </div>
    );
};

export default ShortCourses;
