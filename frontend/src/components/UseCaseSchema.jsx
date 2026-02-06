import React from 'react';
import { MessageSquare, Mic, FileText, Wrench, Users, Cloud, Cpu, Database, Zap, GitBranch } from 'lucide-react';

const schemaData = {
    chat: {
        title: 'Asistente IA',
        icon: MessageSquare,
        color: '#F85900',
        description: 'Asistente conversacional potenciado por IA generativa capaz de mantener conversaciones contextuales y resolver consultas en tiempo real.',
        techStack: [
            { icon: Cloud, label: 'Claude API', desc: 'Modelo de lenguaje de Anthropic' },
            { icon: Zap, label: 'Streaming', desc: 'Respuestas en tiempo real' },
            { icon: Database, label: 'Mattin.ai', desc: 'Plataforma de orquestación' }
        ],
        flowSteps: [
            'Usuario envía mensaje',
            'Procesamiento contextual',
            'Generación de respuesta',
            'Streaming al cliente'
        ]
    },
    audio: {
        title: 'Transcripción Audio',
        icon: Mic,
        color: '#d63384',
        description: 'Sistema de transcripción de audio con análisis de sentimientos integrado. Convierte voz a texto y extrae insights emocionales.',
        techStack: [
            { icon: Mic, label: 'Azure Speech', desc: 'Speech-to-Text de Microsoft' },
            { icon: Cpu, label: 'Análisis NLP', desc: 'Procesamiento de lenguaje natural' },
            { icon: Zap, label: 'Real-time', desc: 'Procesamiento en streaming' }
        ],
        flowSteps: [
            'Captura de audio',
            'Transcripción STT',
            'Análisis de sentimientos',
            'Visualización de resultados'
        ]
    },
    ocr: {
        title: 'Digitalización OCR',
        icon: FileText,
        color: '#28a745',
        description: 'Extracción inteligente de texto desde imágenes y documentos. Utiliza visión por computador para digitalizar contenido.',
        techStack: [
            { icon: FileText, label: 'Vision AI', desc: 'Reconocimiento óptico de caracteres' },
            { icon: Cpu, label: 'Claude Vision', desc: 'Análisis multimodal' },
            { icon: Database, label: 'Estructuración', desc: 'Extracción de datos estructurados' }
        ],
        flowSteps: [
            'Captura de imagen',
            'Preprocesamiento',
            'Extracción OCR',
            'Estructuración de datos'
        ]
    },
    sat: {
        title: 'Soporte Técnico',
        icon: Wrench,
        color: '#003366',
        description: 'Sistema inteligente de gestión de incidencias con búsqueda semántica en base de conocimiento y asistencia guiada por IA.',
        techStack: [
            { icon: Database, label: 'Vector DB', desc: 'Búsqueda semántica de incidencias' },
            { icon: Cpu, label: 'RAG', desc: 'Retrieval Augmented Generation' },
            { icon: GitBranch, label: 'Workflows', desc: 'Flujos de resolución guiados' }
        ],
        flowSteps: [
            'Registro de incidencia',
            'Búsqueda de similares',
            'Análisis con IA',
            'Propuesta de solución'
        ]
    },
    swarm: {
        title: 'Sala de Brainstorming',
        icon: Users,
        color: '#1a4b8c',
        description: 'Multi-agente colaborativo donde varios modelos de IA debaten y resuelven problemas de forma autónoma con moderación inteligente.',
        techStack: [
            { icon: Users, label: 'Multi-Agent', desc: 'Sistema de agentes colaborativos' },
            { icon: Cpu, label: 'Moderador IA', desc: 'Orquestación de debate' },
            { icon: Zap, label: 'Real-time', desc: 'Debate en tiempo real' }
        ],
        flowSteps: [
            'Planteamiento del reto',
            'Debate multi-agente',
            'Síntesis de ideas',
            'Conclusión moderada'
        ]
    }
};

const UseCaseSchema = ({ moduleId }) => {
    const data = schemaData[moduleId];

    if (!data) {
        return <p>Schema no disponible para este módulo.</p>;
    }

    const Icon = data.icon;

    return (
        <div className="usecase-schema">
            {/* Visual Flow Diagram */}
            <div className="schema-diagram" style={{ borderColor: `${data.color}30` }}>
                <div className="schema-flow">
                    {data.flowSteps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="flow-step" style={{
                                background: `${data.color}10`,
                                borderColor: data.color
                            }}>
                                <span className="step-number" style={{ background: data.color }}>
                                    {index + 1}
                                </span>
                                <span className="step-text">{step}</span>
                            </div>
                            {index < data.flowSteps.length - 1 && (
                                <div className="flow-arrow" style={{ color: data.color }}>→</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="schema-section">
                <h3>Descripción</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{data.description}</p>
            </div>

            {/* Tech Stack */}
            <div className="schema-section">
                <h3>Stack Tecnológico</h3>
                <div className="tech-stack-grid">
                    {data.techStack.map((tech, index) => {
                        const TechIcon = tech.icon;
                        return (
                            <div key={index} className="tech-item">
                                <div className="tech-icon" style={{
                                    color: data.color,
                                    background: `${data.color}10`
                                }}>
                                    <TechIcon size={20} />
                                </div>
                                <div className="tech-info">
                                    <strong>{tech.label}</strong>
                                    <span>{tech.desc}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { schemaData };
export default UseCaseSchema;
