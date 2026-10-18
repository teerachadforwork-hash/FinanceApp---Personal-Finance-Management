import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    const navItems = [
        { to: '/', icon: '📊', label: 'Dashboard' },
        { to: '/transactions', icon: '💸', label: 'Transactions' },
        { to: '/categories', icon: '📁', label: 'Categories' },
        { to: '/budgets', icon: '💰', label: 'Budgets' },
        { to: '/reports', icon: '📈', label: 'Reports' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">💎</div>
                <h1>FinanceApp</h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                    <div className="name">{user?.username}</div>
                    <div className="email">{user?.email}</div>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                    🚪
                </button>
            </div>
        </aside>
    );
}
