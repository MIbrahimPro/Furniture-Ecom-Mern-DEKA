import React, { useEffect, useState } from 'react';
import './footer.css';

const Footer = () => {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        fetch('/api/info/footer')
            .then(res => res.json())
            .then(data => setInfo(data))
            .catch(err => console.error('Failed to load footer info:', err));
    }, []);

    if (!info) return null; // or a small loader/spinner

    const { contactEmail, contactPhone, address } = info;

    return (
        <footer className="footer">

            <div className="footer__top">
                <h1 className="footer__title">DEKA</h1>
                <p className="footer__subtitle">Minimalist Furniture for Every Space</p>
            </div>
            <div className="footer__bottom">
                <div className="footer__section footer__brand">
                    <h2 className="footer__heading">- About Us -</h2>
                    <p className="footer__about">
                        DEKA is your go-to for minimalist, high-quality furniture to make your space truly yours.
                    </p>
                </div>

                <div className="footer__section footer__links">
                    <h3 className="footer__subheading">Quick Links</h3>
                    <ul className="footer__list">
                        <li><a href="/login">Sign In</a></li>
                        <li><a href="/signup">Sign Up</a></li>
                        <li><a href="/menu">Browse Products</a></li>
                        <li><a href="/themes">Explore Themes</a></li>
                    </ul>
                </div>

                <div className="footer__section footer__contact">
                    <h3 className="footer__subheading">Contact Us</h3>
                    <p>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
                    <p>Phone: <a href={`tel:${contactPhone}`}>{contactPhone}</a></p>
                </div>

                <div className="footer__section footer__address">
                    <h3 className="footer__subheading">{address.title}</h3>
                    <address>
                        {address.street}<br />
                        {address.city}, {address.state} {address.zip}<br />
                        {address.country}
                    </address>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
