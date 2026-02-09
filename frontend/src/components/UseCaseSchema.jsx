import React, { useMemo } from 'react';
import { MessageSquare, Mic, FileText, Wrench, Users, Cloud, Cpu, Database, Zap, GitBranch } from 'lucide-react';
import { ReactFlow, Background, Controls, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { flows } from './UseCaseFlows';

const schemaData = {
    chat: {
        title: 'Asistente IA',
        icon: MessageSquare,
        color: '#F85900',
        height: '300px',
        description: 'Asistente conversacional potenciado por IA generativa capaz de mantener conversaciones contextuales y resolver consultas en tiempo real.',
        techStack: [
            { icon: Cloud, label: 'Claude API', desc: 'Modelo de lenguaje de Anthropic' },
            { icon: Zap, label: 'Streaming', desc: 'Respuestas en tiempo real' },
            { icon: Database, label: 'Mattin.ai', desc: 'Plataforma de orquestación' }
        ]
    },
    audio: {
        title: 'Transcripción Audio',
        icon: Mic,
        color: '#d63384',
        height: '300px',
        description: 'Sistema de transcripción de audio con análisis de sentimientos integrado. Convierte voz a texto y extrae insights emocionales.',
        techStack: [
            { icon: Mic, label: 'Azure Speech', desc: 'Speech-to-Text de Microsoft' },
            { icon: Cpu, label: 'Análisis NLP', desc: 'Procesamiento de lenguaje natural' },
            { icon: Zap, label: 'Real-time', desc: 'Procesamiento en streaming' }
        ]
    },
    ocr: {
        title: 'Digitalización OCR',
        icon: FileText,
        color: '#28a745',
        height: '300px',
        description: 'Extracción inteligente de texto desde imágenes y documentos. Utiliza visión por computador para digitalizar contenido.',
        techStack: [
            { icon: FileText, label: 'Vision AI', desc: 'Reconocimiento óptico de caracteres' },
            { icon: Cpu, label: 'Claude Vision', desc: 'Análisis multimodal' },
            { icon: Database, label: 'Estructuración', desc: 'Extracción de datos estructurados' }
        ]
    },
    sat: {
        title: 'Soporte Técnico',
        icon: Wrench,
        color: '#003366',
        height: '450px',
        description: 'Sistema inteligente de gestión de incidencias con búsqueda semántica en base de conocimiento y asistencia guiada por IA.',
        techStack: [
            { icon: Database, label: 'Vector DB', desc: 'Búsqueda semántica de incidencias' },
            { icon: Cpu, label: 'RAG', desc: 'Retrieval Augmented Generation' },
            { icon: GitBranch, label: 'Workflows', desc: 'Flujos de resolución guiados' }
        ]
    },
    swarm: {
        title: 'Sala de Brainstorming',
        icon: Users,
        color: '#1a4b8c',
        height: '500px',
        description: 'Multi-agente colaborativo donde varios modelos de IA debaten y resuelven problemas de forma autónoma con moderación inteligente.',
        techStack: [
            { icon: Users, label: 'Multi-Agent', desc: 'Sistema de agentes colaborativos' },
            { icon: Cpu, label: 'Moderador IA', desc: 'Orquestación de debate' },
            { icon: Zap, label: 'Real-time', desc: 'Debate en tiempo real' }
        ]
    }
};

const GroupNode = ({ data, style }) => (
    <div style={{
        ...style,
        padding: '10px',
        position: 'relative',
        height: '100%',
        width: '100%',
    }}>
        <div style={{
            position: 'absolute',
            top: -25,
            left: 0,
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {data.label}
        </div>
    </div>
);

const ModuleNode = ({ data, style }) => (
    <div style={style}>
        {/* Connection Handles (Hidden) */}
        <Handle type="target" position={Position.Top} id="t" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Bottom} id="b" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Right} id="r" style={{ opacity: 0 }} />

        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.label}
        </div>

        <Handle type="source" position={Position.Top} id="st" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Bottom} id="sb" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Left} id="sl" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="sr" style={{ opacity: 0 }} />
    </div>
);

const nodeTypes = {
    group: GroupNode,
    module: ModuleNode
};

export default function UseCaseSchema({ moduleId, height }) {
    const data = schemaData[moduleId];
    const flowData = flows[moduleId];

    if (!data || !flowData) {
        return <p>Schema no disponible para este módulo.</p>;
    }

    const Icon = data.icon;

    // Enhance nodes with colors (skip groups or nodes with specific styles)
    const nodes = useMemo(() => flowData.nodes.map(node => {
        if (node.type === 'group') return node;

        return {
            ...node,
            type: 'module',
            style: {
                background: `${data.color}05`,
                border: `2px solid ${data.color}`,
                borderRadius: '12px',
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                width: 150,
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px',
                ...node.style
            }
        };
    }), [flowData.nodes, data.color]);

    const edges = useMemo(() => flowData.edges.map(edge => ({
        ...edge,
        style: { stroke: data.color, strokeWidth: 2, ...edge.style },
        type: edge.type || 'smoothstep',
        labelStyle: { fill: edge.style?.stroke || data.color, fontWeight: '700', fontSize: '10px' },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: 'var(--white)', fillOpacity: 0.8 }
    })), [flowData.edges, data.color]);

    return (
        <div className="usecase-schema">
            {/* Visual Flow Diagram */}
            <div className="schema-diagram" style={{
                height: height || data.height || '400px',
                background: 'var(--white)',
                borderColor: `${data.color}30`,
                position: 'relative'
            }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    panOnDrag={true}
                    zoomOnScroll={true}
                    attributionPosition="bottom-right"
                >
                    <Background color="#f0f0f0" gap={20} />
                    <Controls showInteractive={false} />
                </ReactFlow>
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
}

export { schemaData };
