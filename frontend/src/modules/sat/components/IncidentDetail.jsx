import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, Clock, User, AlertTriangle } from 'lucide-react';
import { satService } from '../services/satService';

const IncidentDetail = ({ incidentId, onBack }) => {
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newLog, setNewLog] = useState('');
    const [sendingLog, setSendingLog] = useState(false);

    useEffect(() => {
        loadIncident();
    }, [incidentId]);

    const loadIncident = () => {
        setLoading(true);
        satService.getIncidents().then(incidents => {
            const found = incidents.find(i => i.id === incidentId);
            setIncident(found);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!newLog.trim()) return;
        setSendingLog(true);
        try {
            const updated = await satService.addLog(incident.id, { author: 'Operador', text: newLog });
            setIncident(updated);
            setNewLog('');
        } catch (error) {
            console.error('Error adding log:', error);
        } finally {
            setSendingLog(false);
        }
    };

    const handleResolve = async () => {
        if (!window.confirm('¿Está seguro de cerrar esta incidencia? Se indexará en la BD de conocimiento.')) return;
        try {
            alert('Indexando solución en Base de Datos Semántica...');
            // Simulate delay for indexing
            setTimeout(async () => {
                const updated = await satService.updateIncident(incident.id, { status: 'resolved', closed_at: new Date().toISOString() });
                setIncident(updated);
                alert('Incidencia cerrada e indexada correctamente.');
            }, 1000);
        } catch (error) {
            console.error('Error resolving:', error);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>Cargando detalles...</div>;
    if (!incident) return <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>Incidencia no encontrada</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ background: 'var(--accent)', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>{incident.title}</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{incident.id} • {new Date(incident.created_at).toLocaleString()}</span>
                </div>
                {incident.status !== 'resolved' && incident.status !== 'closed' && (
                    <button
                        onClick={handleResolve}
                        className="btn"
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <CheckCircle size={18} /> Resolver Incidencia
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Descripción</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>{incident.description}</p>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Registro de Actividad</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {incident.logs.map((log, index) => (
                                <div key={index} style={{ padding: '1rem', background: 'var(--bg-offset)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <strong>{log.author}</strong>
                                        <span>{new Date(log.date).toLocaleString()}</span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-main)' }}>{log.text}</p>
                                </div>
                            ))}
                        </div>

                        {incident.status !== 'resolved' && incident.status !== 'closed' && (
                            <form onSubmit={handleAddLog} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={newLog}
                                    onChange={(e) => setNewLog(e.target.value)}
                                    placeholder="Añadir nota o actualización..."
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                                />
                                <button type="submit" disabled={sendingLog} className="btn" style={{ background: 'var(--accent)', color: 'var(--text-main)', border: 'none' }}>
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ marginTop: 0, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Detalles</h4>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Estado</label>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{incident.status.toUpperCase()}</span>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Prioridad</label>
                            <span style={{
                                fontWeight: 'bold',
                                color: incident.priority === 'critical' ? 'red' : incident.priority === 'high' ? 'orange' : 'var(--text-main)'
                            }}>
                                {incident.priority.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Electrodoméstico</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <AlertTriangle size={16} /> {incident.machine_id}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Reportado por</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <User size={16} /> {incident.reported_by}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetail;
