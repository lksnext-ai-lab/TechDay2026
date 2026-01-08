import React, { useState, useEffect } from 'react';
import { satService } from '../services/satService';
import { useConfig } from '../../../context/ConfigContext';
import { Lightbulb, ExternalLink, X } from 'lucide-react';

const SimilarIncidents = ({ incidentId, machineType }) => {
    const { globalAppId, satConfig } = useConfig();
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);

    useEffect(() => {
        if (incidentId && satConfig.siloId) {
            loadSimilar();
        }
    }, [incidentId, satConfig.siloId]);

    const loadSimilar = async () => {
        setLoading(true);
        try {
            const data = await satService.getSimilarIncidents(incidentId, globalAppId, satConfig.siloId);
            setSimilar(data);
        } catch (error) {
            console.error("Error fetching similar incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!satConfig.siloId) return null;

    return (
        <>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb size={20} color="var(--primary)" />
                    Incidencias Similares
                </h3>

                {loading ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Buscando soluciones similares...</div>
                ) : similar.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No se encontraron incidencias similares.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {similar.map((inc, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-offset)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                                onClick={() => setSelectedIncident(inc)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'green', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                        {(inc.similarity * 100).toFixed(0)}% coincidencia
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {inc.id}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    {inc.title}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {inc.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedIncident && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedIncident(null)}>
                    <div
                        style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative', border: '1px solid #ccc' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedIncident(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginTop: 0, color: 'var(--text-main)', paddingRight: '2rem' }}>{selectedIncident.title}</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>ID: {selectedIncident.id}</span>
                            <span>Modelo: {selectedIncident.metadata?.modelo}</span>
                        </div>

                        <div style={{ color: 'var(--text-main)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>Descripción</h3>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {selectedIncident.description}
                                </p>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Registro de Resolución</h3>
                                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedIncident.logs && selectedIncident.logs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedIncident.logs.map((log, i) => (
                                                <div key={i} style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>
                                                        <strong>{log.author}</strong>
                                                        <span>{new Date(log.date).toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem' }}>{log.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic' }}>No hay registro de actividad disponible.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SimilarIncidents;
