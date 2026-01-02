import React from 'react';

const FeaturePlaceholder = ({ title }) => (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 className="page-title">{title}</h2>
        <div style={{
            padding: '4rem',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <p style={{ color: 'var(--text-muted)' }}>Módulo en construcción...</p>
        </div>
    </div>
);

export default FeaturePlaceholder;
