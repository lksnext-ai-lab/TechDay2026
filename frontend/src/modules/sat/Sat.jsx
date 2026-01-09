import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, AlertTriangle, Activity, Database, Plus, List, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateIncident from './components/CreateIncident';
import ManageIncidents from './components/ManageIncidents';
import IncidentDetail from './components/IncidentDetail';
import ManageMachines from './components/ManageMachines';
import MachineDetail from './components/MachineDetail';

const Sat = () => {
    // view: 'dashboard', 'create', 'manage', 'detail'
    const [view, setView] = useState('dashboard');
    const [selectedIncidentId, setSelectedIncidentId] = useState(null);
    const [selectedMachineId, setSelectedMachineId] = useState(null);

    const navigateToDetail = (id) => {
        setSelectedIncidentId(id);
        setView('detail');
    };

    const navigateToMachine = (mode, id = null) => {
        setSelectedMachineId(id);
        setView(mode === 'create' || mode === 'edit' ? 'machine_detail' : 'machines');
    };

    const renderDashboard = () => (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Centro de Soporte Técnico</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestión de incidencias de electrodomésticos.</p>
                </div>
                <div style={{ flex: 1 }}></div>
                <button
                    onClick={() => setView('machines')}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}
                >
                    <Database size={18} />
                    <span>Modelos</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                {/* Create Incident Card */}
                <div
                    onClick={() => setView('create')}
                    className="card-hover"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'transform 0.2s',
                        borderTop: '5px solid var(--primary)'
                    }}
                >
                    <div style={{ background: 'var(--bg-offset)', padding: '1rem', borderRadius: '50%' }}>
                        <Plus size={32} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Nueva Incidencia</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Reportar un nuevo problema técnico.</p>
                </div>

                {/* Manage Incidents Card */}
                <div
                    onClick={() => setView('manage')}
                    className="card-hover"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'transform 0.2s',
                        borderTop: '5px solid orange'
                    }}
                >
                    <div style={{ background: 'var(--bg-offset)', padding: '1rem', borderRadius: '50%' }}>
                        <List size={32} color="orange" />
                    </div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Gestionar Incidencias</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Ver estado y responder tickets.</p>
                </div>

            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px' }}>
            {view === 'dashboard' && renderDashboard()}
            {view === 'create' && <CreateIncident onBack={() => setView('dashboard')} onCreated={() => setView('manage')} />}
            {view === 'manage' && <ManageIncidents onBack={() => setView('dashboard')} onSelectIncident={navigateToDetail} />}
            {view === 'machines' && <ManageMachines onBack={() => setView('dashboard')} onNavigate={navigateToMachine} />}
            {view === 'machine_detail' && <MachineDetail machineId={selectedMachineId} onBack={() => setView('machines')} />}
            {view === 'detail' && <IncidentDetail incidentId={selectedIncidentId} onBack={() => setView('manage')} />}

            <style>{`
                .card-hover:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg) !important; }
                .fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Sat;
