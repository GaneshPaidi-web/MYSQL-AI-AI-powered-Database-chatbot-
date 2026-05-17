import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import {
    MessageSquare, Settings, User as UserIcon, LogOut,
    Info, Database, Menu, Plus, ChevronDown, ChevronRight, Clock, Trash2
} from "lucide-react";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { chatId: activeChatId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login");
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchSessions(parsedUser.id);
        }
    }, [navigate]);

    const fetchSessions = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chats/sessions/${userId}`);
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this chat?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/chats/session/${sessionId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setSessions(prev => prev.filter(s => s._id !== sessionId));
                if (activeChatId === sessionId) {
                    navigate("/dashboard");
                }
            }
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const groupSessionsByDate = (sessions) => {
        const groups = {
            Today: [],
            Yesterday: [],
            "Previous 7 Days": [],
            "Previous 30 Days": [],
            Older: []
        };

        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        sessions.forEach(session => {
            const date = new Date(session.updatedAt);
            if (date >= today) groups.Today.push(session);
            else if (date >= yesterday) groups.Yesterday.push(session);
            else if (date >= last7Days) groups["Previous 7 Days"].push(session);
            else if (date >= last30Days) groups["Previous 30 Days"].push(session);
            else groups.Older.push(session);
        });

        return groups;
    };

    const groupedSessions = groupSessionsByDate(sessions);

    const navItems = [
        { path: "/dashboard", label: "New Chat", icon: Plus, isNewChat: true },
        { path: "/dashboard/about", label: "About", icon: Info },
        { path: "/dashboard/settings", label: "Settings", icon: Settings },
        { path: "/dashboard/profile", label: "Profile", icon: UserIcon },
    ];

    if (!user) return null;

    return (
        <div className={`dashboard-container ${isSidebarCollapsed ? "collapsed" : ""}`}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    {!isSidebarCollapsed && (
                        <>
                            <Database className="logo-icon" />
                            <h2>MYSQL AI</h2>
                        </>
                    )}
                    <button
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${item.isNewChat ? "new-chat-btn" : ""} ${location.pathname === item.path ? "active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={20} />
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}

                    {/* Chat History Section */}
                    {!isSidebarCollapsed && (
                        <div className="history-section">
                            <button
                                className="history-toggle"
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            >
                                {isHistoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <Clock size={16} />
                                <span>Previous History</span>
                            </button>

                            {isHistoryOpen && (
                                <div className="history-list">
                                    {Object.entries(groupedSessions).map(([group, items]) => (
                                        items.length > 0 && (
                                            <div key={group} className="history-group">
                                                <div className="group-label">{group}</div>
                                                {items.map(session => (
                                                    <div
                                                        key={session._id}
                                                        className={`history-item ${activeChatId === session._id ? "active" : ""}`}
                                                        onClick={() => navigate(`/dashboard/chat/${session._id}`)}
                                                    >
                                                        <MessageSquare size={14} />
                                                        <span className="session-title">{session.title}</span>
                                                        <button
                                                            className="delete-item"
                                                            onClick={(e) => deleteSession(e, session._id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ))}
                                    {sessions.length === 0 && (
                                        <div className="empty-history">No recent history</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Top Header */}
                <header className="top-header">
                    <div className="header-greeting">
                        <h1>Hello, {user.name} 👋</h1>
                        <p>What would you like to query today?</p>
                    </div>
                    <div className="header-actions">
                        <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Views */}
                <div className="content-view">
                    <Outlet context={{ fetchSessions }} />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;


