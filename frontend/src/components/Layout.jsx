import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Wrench, FileText, Gift, Mic } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="app-layout">
            {/* Header - Minimal on home, full on other pages if needed */}
            <header className="app-header" style={{
                padding: '1rem',
                borderBottom: isHome ? 'none' : '1px solid var(--accent)',
                backgroundColor: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span style={{ color: 'var(--primary)' }}>LKS</span> Next
                </Link>

                {!isHome && (
                    <nav style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/chat" className="nav-link"><MessageSquare size={20} /></Link>
                        <Link to="/audio" className="nav-link"><Mic size={20} /></Link>
                        <Link to="/sat" className="nav-link"><Wrench size={20} /></Link>
                        <Link to="/ocr" className="nav-link"><FileText size={20} /></Link>
                        <Link to="/sorteo" className="nav-link"><Gift size={20} /></Link>
                    </nav>
                )}
            </header>

            <main style={{ minHeight: 'calc(100vh - 70px)' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
