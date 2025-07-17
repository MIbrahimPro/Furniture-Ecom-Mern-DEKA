import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems } = useCart();
    const token = localStorage.getItem('token');
    const accountLink = token ? '/profile' : '/login';

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);

    // Calculate total items in cart
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Animate cart icon when cart changes
    React.useEffect(() => {
        if (cartCount > 0) {
            setCartBounce(true);
            const timeout = setTimeout(() => setCartBounce(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [cartCount]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleAdminDropdown = () => {
        setIsAdminDropdownOpen(!isAdminDropdownOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Bubbles */}
            <div className="navbar__bubble navbar__bubble--links desktop-only">
                <Link to="/" className="navbar__link" onClick={closeMobileMenu}>Visit Home</Link>
                <Link to="/menu" className="navbar__link" onClick={closeMobileMenu}>Menu</Link>
                {(user && user.role === 'admin') && (
                    <div className="navbar__admin-dropdown">
                        <button className="navbar__admin-dropdown-btn" onClick={toggleAdminDropdown}>
                            Admin Panel
                            <span className="material-symbols-outlined thin">expand_more</span>
                        </button>
                        <div className={`navbar__admin-dropdown-content ${isAdminDropdownOpen ? 'show' : ''}`}>
                            <Link to="/admin/users" className="navbar__link link__admin" onClick={closeMobileMenu}>Manage Users</Link>
                            <Link to="/admin/categories" className="navbar__link link__admin" onClick={closeMobileMenu}>Manage Categories</Link>
                            <Link to="/admin/themes" className="navbar__link link__admin" onClick={closeMobileMenu}>Manage Themes</Link>
                            <Link to="/admin/products" className="navbar__link link__admin" onClick={closeMobileMenu}>Manage Products</Link>
                            <Link to="/admin/orders" className="navbar__link link__admin" onClick={closeMobileMenu}>Manage Orders</Link>
                            <Link to="/admin/settings" className="navbar__link link__admin" onClick={closeMobileMenu}>Settings</Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="navbar__bubble column navbar__bubble--icons desktop-only text-white">
                <Link to="/menu" className="navbar__icon" onClick={closeMobileMenu}>
                    <span className="material-symbols-outlined thin">search</span>
                </Link>
                <Link to="/cart" className={`navbar__icon cart-icon${cartBounce ? ' cart-bounce' : ''}`} onClick={closeMobileMenu} style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined thin">shopping_cart</span>
                    {cartCount > 0 && (
                        <span className="cart-count-badge">{cartCount}</span>
                    )}
                </Link>
                <Link to={accountLink} className="navbar__icon" onClick={closeMobileMenu}>
                    <span className="material-symbols-outlined thin">account_circle</span>
                </Link>
            </div>

            {/* Mobile Burger Icon (always visible on mobile, hidden on desktop) */}
            <div className="mobile-menu-toggle mobile-only" onClick={toggleMobileMenu}>
                <span className="material-symbols-outlined thin">
                    {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
            </div>

            {/* Mobile Menu Overlay/Bubble */}
            <div className={`mobile-menu-overlay mobile-only ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {/* Links */}
                    <div className="mobile-menu-section">
                        <Link to="/" className="mobile-navbar__link" onClick={closeMobileMenu}>Visit Home</Link>
                        <Link to="/menu" className="mobile-navbar__link" onClick={closeMobileMenu}>Menu</Link>
                        {(user && user.role === 'admin') && (
                            <div className="mobile-navbar__admin-section">
                                <button className="mobile-navbar__admin-btn" onClick={toggleAdminDropdown}>
                                    Admin Panel
                                    <span className="material-symbols-outlined thin">expand_more</span>
                                </button>
                                <div className={`mobile-navbar__admin-links ${isAdminDropdownOpen ? 'show' : ''}`}>
                                    <Link to="/admin/users" className="mobile-navbar__link" onClick={closeMobileMenu}>Manage Users</Link>
                                    <Link to="/admin/categories" className="mobile-navbar__link" onClick={closeMobileMenu}>Manage Categories</Link>
                                    <Link to="/admin/themes" className="mobile-navbar__link" onClick={closeMobileMenu}>Manage Themes</Link>
                                    <Link to="/admin/products" className="mobile-navbar__link" onClick={closeMobileMenu}>Manage Products</Link>
                                    <Link to="/admin/orders" className="mobile-navbar__link" onClick={closeMobileMenu}>Manage Orders</Link>
                                    <Link to="/admin/settings" className="mobile-navbar__link" onClick={closeMobileMenu}>Settings</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="mobile-menu-section mobile-menu-icons">
                        <Link to="/menu" className="mobile-navbar__icon" onClick={closeMobileMenu}>
                            <span className="material-symbols-outlined thin">search</span>
                        </Link>
                        <Link to="/cart" className={`mobile-navbar__icon cart-icon${cartBounce ? ' cart-bounce' : ''}`} onClick={closeMobileMenu} style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined thin">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="cart-count-badge">{cartCount}</span>
                            )}
                        </Link>
                        <Link to={accountLink} className="mobile-navbar__icon" onClick={closeMobileMenu}>
                            <span className="material-symbols-outlined thin">account_circle</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;