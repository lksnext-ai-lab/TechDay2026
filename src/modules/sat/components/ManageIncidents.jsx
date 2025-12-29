import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { getIncidents } from '../data/mockData';

const ManageIncidents = ({ onBack, onSelectIncident }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = () => {
        setLoading(true);
        getIncidents().then(data => {
            setIncidents(data);
            setLoading(false);
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'orange';
            case 'in_progress': return 'blue';
            case 'resolved': return 'green';
            case 'closed': return 'gray';
            default: return 'var(--text-main)';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Abierta';
            case 'in_progress': return 'En Proceso';
            case 'resolved': return 'Resuelta';
            case 'closed': return 'Cerrada';
            default: return status;
        }
    };

    const filteredIncidents = incidents.filter(inc => {
        const matchesStatus = filterStatus === 'all' || inc.status === filterStatus;
        const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inc.machineId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>Cargando incidencias...</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <h2 style={{ margin: 0, color: 'var(--text-main)', flex: 1 }}>Gestión de Incidencias</h2>
            </div>

            <div style={{
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                background: 'var(--bg-card)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, título o electrodoméstico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, color: 'var(--text-main)' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)'
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="open">Abiertas</option>
                        <option value="in_progress">En Proceso</option>
                        <option value="resolved">Resueltas</option>
                        <option value="closed">Cerradas</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredIncidents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                        No se encontraron incidencias.
                    </div>
                ) : (
                    filteredIncidents.map(inc => (
                        <div
                            key={inc.id}
                            onClick={() => onSelectIncident(inc.id)}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-sm)',
                                cursor: 'pointer',
                                borderLeft: `4px solid ${getStatusColor(inc.status)}`,
                                transition: 'transform 0.2s',
                                display: 'grid',
                                gridTemplateColumns: 'minmax(100px, 1fr) 2fr 1fr',
                                gap: '1rem',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div>
                                <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--text-main)' }}>{inc.id}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(inc.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{inc.title}</h4>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-offset)', borderRadius: '4px' }}>{inc.machineId}</span>
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    background: getStatusColor(inc.status),
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }}>
                                    {getStatusLabel(inc.status)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageIncidents;
