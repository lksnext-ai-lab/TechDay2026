import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Wrench, FileText, Gift, ArrowRight, Settings } from 'lucide-react';

const modules = [
    {
        id: 'swarm',
        title: 'Sala de Brainstorming',
        description: 'Observa a un equipo de IAs debatiendo y resolviendo retos en tiempo real.',
        icon: MessageSquare,
        path: '/swarm',
        color: '#1a4b8c'
    },
    {
        id: 'chat',
        title: 'Asistente IA',
        description: 'Conversa con nuestra IA generativa para resolver dudas.',
        icon: MessageSquare,
        path: '/chat',
        color: '#F85900'
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
        id: 'ocr',
        title: 'Digitalización OCR',
        description: 'Captura y digitaliza documentos al instante.',
        icon: FileText,
        path: '/ocr',
        color: '#28a745'
    },
    {
        id: 'sorteo',
        title: 'Sorteo & Feedback',
        description: 'Participa en nuestro sorteo Tech Day.',
        icon: Gift,
        path: '/sorteo',
        color: '#6f42c1'
    }
];

const Home = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                LKS <span style={{ color: 'var(--text-main)' }}>Tech Day</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
                Explora nuestros demostradores de Inteligencia Artificial Generativa.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                padding: '1rem'
            }}>
                {modules.map((mod) => (
                    <Link to={mod.path} key={mod.id} className="card" style={{
                        padding: '2rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderTop: `4px solid ${mod.color}`
                    }}>
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
        </div>
    );
};

export default Home;
