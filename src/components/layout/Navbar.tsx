import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import './Navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/topics', label: 'Topics' },
        { path: '/review', label: 'Review' },
        { path: '/progress', label: 'Progress' },
        { path: '/telegram', label: 'Telegram' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="navbar" id="main-navbar">
            <div className="navbar__inner container">
                <Link to="/" className="navbar__logo" id="logo-link">
                    <BookOpen size={24} />
                    <span className="navbar__logo-text">
                        <span className="navbar__logo-chinese">學中文</span>
                        <span className="navbar__logo-dot">·</span>
                        <span className="navbar__logo-en">LearnChinese</span>
                    </span>
                </Link>

                <div className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`navbar__link ${isActive(link.path) ? 'navbar__link--active' : ''}`}
                            onClick={() => setIsOpen(false)}
                            id={`nav-${link.label.toLowerCase()}`}
                        >
                            {link.label}
                            {isActive(link.path) && <span className="navbar__link-indicator" />}
                        </Link>
                    ))}
                </div>

                <div className="navbar__actions">
                    <button
                        className="navbar__theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        id="theme-toggle"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {isAuthenticated ? (
                        <div className="navbar__user">
                            <span className="navbar__user-name">{user?.name}</span>
                            <button
                                className="navbar__logout"
                                onClick={logout}
                                aria-label="Logout"
                                id="logout-btn"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="navbar__login-btn" id="login-btn">
                            <User size={16} />
                            <span>Login</span>
                        </Link>
                    )}

                    <button
                        className="navbar__hamburger"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                        id="hamburger-btn"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
