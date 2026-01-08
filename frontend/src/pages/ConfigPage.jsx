import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Save, ArrowLeft, Settings, MessageSquare, Wrench, FileText, Gift, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfigPage = () => {
    const {
        globalAppId, setGlobalAppId,
        chatConfig, updateChatConfig,
        swarmConfig, updateSwarmConfig,
        satConfig, updateSatConfig
    } = useConfig();

    const [appIdInput, setAppIdInput] = useState(globalAppId);
    const [chatFormData, setChatFormData] = useState(chatConfig);
    const [swarmFormData, setSwarmFormData] = useState(swarmConfig);
    const [satFormData, setSatFormData] = useState(satConfig);

    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('global');

    const handleAppIdSave = (e) => {
        e.preventDefault();
        setGlobalAppId(appIdInput);
        setStatus('success');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        updateChatConfig(chatFormData);
        setStatus('success');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleSwarmSubmit = (e) => {
        e.preventDefault();
        updateSwarmConfig(swarmFormData);
        setStatus('success');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleSatSubmit = (e) => {
        e.preventDefault();
        updateSatConfig(satFormData);
        setStatus('success');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleSwarmAgentChange = (index, field, value) => {
        const newAgents = [...swarmFormData.agents];
        newAgents[index] = { ...newAgents[index], [field]: value };
        setSwarmFormData(prev => ({ ...prev, agents: newAgents }));
    };

    const tabs = [
        { id: 'global', label: 'Global', icon: Settings },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'swarm', label: 'Swarm Room', icon: MessageSquare },
        { id: 'audio', label: 'Audio', icon: Mic },
        { id: 'sat', label: 'SAT', icon: Wrench },
        { id: 'ocr', label: 'OCR', icon: FileText },
        { id: 'sorteo', label: 'Sorteo', icon: Gift },
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="btn" style={{ background: 'var(--accent)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} color="var(--text-main)" />
                </Link>
                <h2 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={28} />
                    Configuración
                </h2>
            </div>

            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--accent)',
                overflowX: 'auto',
                paddingBottom: '2px'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.75rem 1rem',
                            background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderTopLeftRadius: 'var(--radius-sm)',
                            borderTopRightRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                borderTopLeftRadius: 0
            }}>
                {activeTab === 'global' && (
                    <>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Configuración Global</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Ajustes compartidos por todos los módulos.
                            </p>
                        </div>

                        <form onSubmit={handleAppIdSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                                    Application ID (Mattin API)
                                </label>
                                <input
                                    type="number"
                                    value={appIdInput}
                                    onChange={(e) => setAppIdInput(e.target.value)}
                                    placeholder="Ej: 1"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--accent)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                {status === 'success' && <span style={{ color: 'green', fontSize: '0.9rem' }}>¡Guardado!</span>}
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                                    <Save size={18} /> Guardar Application ID
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'chat' && (
                    <>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Módulo de Chat</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Configuración para el asistente virtual individual.
                            </p>
                        </div>

                        <form onSubmit={handleChatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Título del Chat</label>
                                <input
                                    type="text"
                                    value={chatFormData.title}
                                    onChange={(e) => setChatFormData({ ...chatFormData, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Agent ID</label>
                                <input
                                    type="number"
                                    value={chatFormData.agentId}
                                    onChange={(e) => setChatFormData({ ...chatFormData, agentId: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                {status === 'success' && <span style={{ color: 'green', fontSize: '0.9rem' }}>¡Guardado!</span>}
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                                    <Save size={18} /> Guardar Config Chat
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'swarm' && (
                    <>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Módulo Swarm (Brainstorming)</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Gestiona los participantes y el moderador de la sala.
                            </p>
                        </div>

                        <form onSubmit={handleSwarmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: '#f0f4f8', borderRadius: 'var(--radius-md)', border: '1px solid #d1d9e0' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--secondary)' }}>
                                    Moderator Agent ID
                                </label>
                                <input
                                    type="number"
                                    value={swarmFormData.moderatorAgentId || ''}
                                    onChange={(e) => setSwarmFormData({ ...swarmFormData, moderatorAgentId: e.target.value })}
                                    placeholder="ID del agente moderador (JSON output)"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #ccc' }}
                                />
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Este agente decidirá quién habla a continuación basándose en el contexto.
                                </p>
                            </div>

                            <div style={{ fontWeight: '700', marginTop: '1rem', color: 'var(--text-main)' }}>Expertos Disponibles:</div>

                            {swarmFormData.agents.map((agent, index) => (
                                <div key={agent.id} style={{
                                    padding: '1.25rem',
                                    border: '1px solid var(--accent)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    backgroundColor: agent.isActive ? '#fff' : '#f9f9f9',
                                    borderLeft: `4px solid ${agent.color}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '600', color: agent.color }}>{agent.name}</div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={agent.isActive}
                                                onChange={(e) => handleSwarmAgentChange(index, 'isActive', e.target.checked)}
                                            />
                                            Activo
                                        </label>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Agent ID</label>
                                            <input
                                                type="number"
                                                value={agent.agentId}
                                                onChange={(e) => handleSwarmAgentChange(index, 'agentId', e.target.value)}
                                                placeholder="ID"
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Descripción (para el Moderador)</label>
                                            <input
                                                type="text"
                                                value={agent.description || ''}
                                                onChange={(e) => handleSwarmAgentChange(index, 'description', e.target.value)}
                                                placeholder="Ej: Experto en arquitectura..."
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                {status === 'success' && <span style={{ color: 'green', fontSize: '0.9rem' }}>¡Guardado!</span>}
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                                    <Save size={18} /> Guardar Config Swarm
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'sat' && (
                    <>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Módulo SAT (Soporte Técnico)</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Configuración para el auto-servicio de diagnóstico e indexado.
                            </p>
                        </div>

                        <form onSubmit={handleSatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Silo ID (Mattin Knowledge Base)</label>
                                <input
                                    type="text"
                                    value={satFormData.siloId}
                                    onChange={(e) => setSatFormData({ ...satFormData, siloId: e.target.value })}
                                    placeholder="ID del silo para indexar incidencias"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)' }}
                                />
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Las incidencias resueltas se indexarán automáticamente en este silo.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                {status === 'success' && <span style={{ color: 'green', fontSize: '0.9rem' }}>¡Guardado!</span>}
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                                    <Save size={18} /> Guardar Config SAT
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {['audio', 'ocr', 'sorteo'].includes(activeTab) && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <p>Configuración para <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> próximamente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfigPage;
