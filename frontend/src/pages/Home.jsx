import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Wrench, FileText, ArrowRight, Settings, Mic, Bot, Cloud, Database, Info } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import Modal from '../components/Modal';
import UseCaseSchema, { schemaData } from '../components/UseCaseSchema';

const modules = [
    {
        id: 'chat',
        title: 'Asistente IA',
        description: 'Conversa con nuestra IA generativa para resolver dudas.',
        icon: MessageSquare,
        path: '/chat',
        color: '#F85900'
    },
    {
        id: 'audio',
        title: 'Transcripción Audio',
        description: 'Graba o sube audio para transcribir y analizar sentimientos.',
        icon: Mic,
        path: '/audio',
        color: '#d63384'
    },
    {
        id: 'ocr',
        title: 'Digitalización OCR',
        description: 'Captura y digitaliza documentos al instante.',
        icon: FileText,
        path: '/ocr',
        color: '#28a745'
    },
    {
        id: 'sat',
        title: 'Soporte Técnico',
        description: 'Simulación de proceso de asistencia técnica inteligente.',
        icon: Wrench,
        path: '/sat',
        color: '#003366'
    },
    {
        id: 'swarm',
        title: 'Sala de Brainstorming',
        description: 'Observa a un equipo de IAs debatiendo y resolviendo retos en tiempo real.',
        icon: MessageSquare,
        path: '/swarm',
        color: '#1a4b8c'
    }
];

const Home = () => {
    const { modulesStatus } = useConfig();
    const activeModules = modules.filter(mod => modulesStatus[mod.id]);
    const [schemaModal, setSchemaModal] = useState(null);

    const openSchema = (e, moduleId) => {
        e.preventDefault();
        e.stopPropagation();
        setSchemaModal(moduleId);
    };

    return (
        <div className="container" style={{ padding: '1rem 1rem', maxWidth: '95%' }}>
            <div style={{
                display: 'flex',
                gap: '4rem',
                flexWrap: 'wrap',
                alignItems: 'flex-start'
            }}>
                {/* Main Content */}
                <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
                    <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        LKS NEXT<span style={{ color: 'var(--text-main)' }}> Tech Day</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1rem', maxWidth: '600px', margin: '0 auto 1rem' }}>
                        Explora nuestros demostradores de Inteligencia Artificial Generativa.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        padding: '1rem'
                    }}>
                        {activeModules.map((mod) => (
                            <Link to={mod.path} key={mod.id} className="card" style={{
                                padding: '2rem',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                borderTop: `4px solid ${mod.color}`,
                                position: 'relative'
                            }}>
                                <button
                                    className="info-button"
                                    onClick={(e) => openSchema(e, mod.id)}
                                    title="Ver esquema técnico"
                                    style={{ color: mod.color, background: `${mod.color}10` }}
                                >
                                    <Info size={18} />
                                </button>
                                <div style={{
                                    marginBottom: '1.5rem',
                                    color: mod.color,
                                    background: `${mod.color}15`,
                                    width: 'fit-content',
                                    padding: '1rem',
                                    borderRadius: '50%'
                                }}>
                                    <mod.icon size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{mod.title}</h3>
                                <p style={{ color: 'var(--text-muted)', flex: 1, marginBottom: '1.5rem' }}>
                                    {mod.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', color: mod.color, fontWeight: 600 }}>
                                    Probar Demo <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{
                    width: '240px',
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '1.5rem',
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem'
                }}>
                    <div className="banner-group" style={{ alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, fontSize: '0.7rem' }}>SOCIOS TECNOLÓGICOS</h4>
                        <div className="logo-grid" style={{ flexDirection: 'column', gap: '1rem' }}>
                            <div className="logo-badge" style={{ width: '100%' }}>
                                <a href="http://mattin.ai" target="_blank" rel="noopener noreferrer">
                                    <img src="/mattin_logo.svg" alt="Mattin AI" />
                                </a>
                            </div>
                            <div className="logo-badge" style={{ width: '100%' }}>
                                <a href="https://azure.microsoft.com/" target="_blank" rel="noopener noreferrer">
                                    <img src="/azure_logo.png" alt="Microsoft Azure" />
                                </a>
                            </div>
                            <div className="logo-badge" style={{ width: '100%' }}>
                                <a href="https://aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer">
                                    <img src="/bedrock_logo.png" alt="AWS Bedrock" />
                                </a>
                            </div>
                            <div className="logo-badge" style={{ width: '100%' }}>
                                <a href="https://www.dell.com" target="_blank" rel="noopener noreferrer">
                                    <img src="/dell_logo.svg" alt="Dell Technologies" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="banner-group" style={{ alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, fontSize: '0.7rem' }}>IMPULSADO POR</h4>
                        <div className="logo-grid" style={{ flexDirection: 'column', gap: '1rem' }}>
                            <div className="logo-badge" style={{ width: '100%' }}>
                                <img src="/gitlab_duo.png" alt="GitLab Duo" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Link to="/config" style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                color: 'var(--text-muted)',
                opacity: 0.5,
                padding: '0.5rem',
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                title="Configuración"
            >
                <Settings size={20} />
            </Link>

            {schemaModal && schemaData[schemaModal] && (
                <Modal
                    isOpen={true}
                    onClose={() => setSchemaModal(null)}
                    title={schemaData[schemaModal].title}
                    icon={schemaData[schemaModal].icon}
                    color={schemaData[schemaModal].color}
                >
                    <UseCaseSchema moduleId={schemaModal} />
                </Modal>
            )}
        </div>
    );
};

export default Home;
