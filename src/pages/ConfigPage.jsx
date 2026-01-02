import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Save, ArrowLeft, Settings, MessageSquare, Wrench, FileText, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfigPage = () => {
    const { chatConfig, updateChatConfig } = useConfig();
    const [formData, setFormData] = useState(chatConfig);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('chat');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setStatus('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateChatConfig(formData);
        setStatus('success');
        setTimeout(() => setStatus(''), 2000);
    };

    const tabs = [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--accent)' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
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
                borderTopLeftRadius: 0 // Align visually with tabs
            }}>
                {activeTab === 'chat' && (
                    <>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Chat Module</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Configuración de conexión y apariencia para el asistente virtual.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                                    Título del Chat
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ej: Asistente IA"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--accent)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                                    Application ID
                                </label>
                                <input
                                    type="number"
                                    name="appId"
                                    value={formData.appId}
                                    onChange={handleChange}
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

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                                    Agent ID
                                </label>
                                <input
                                    type="number"
                                    name="agentId"
                                    value={formData.agentId}
                                    onChange={handleChange}
                                    placeholder="Ej: 42"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--accent)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                {status === 'success' && (
                                    <span style={{ color: 'green', fontSize: '0.9rem', fontWeight: '500' }}>
                                        ¡Configuración guardada!
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    <Save size={18} />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab !== 'chat' && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <p>Configuración para <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> próximamente.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfigPage;
