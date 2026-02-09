export const flows = {
    chat: {
        nodes: [
            { id: 'user', data: { label: 'Usuario' }, position: { x: 0, y: -140 }, type: 'input' },
            { id: 'demoApp', data: { label: 'Demo App' }, position: { x: 80, y: -50 } },

            {
                id: 'platformGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 250, y: -20 },
                style: { width: 380, height: 220, border: '2px dashed #F85900', borderRadius: '16px', background: 'rgba(248, 89, 0, 0.03)' },
                type: 'group'
            },
            { id: 'agent', data: { label: 'Agente' }, position: { x: 20, y: 60 }, parentId: 'platformGroup', extent: 'parent' },
            { id: 'ragSilo', data: { label: 'RAG / Silo' }, position: { x: 210, y: 150 }, parentId: 'platformGroup', extent: 'parent', type: 'output' },
            { id: 'webDomain', data: { label: 'Web / Dominio' }, position: { x: 650, y: 80 } }
        ],
        edges: [
            { id: 'e1', source: 'user', target: 'demoApp', animated: true, sourceHandle: 'sb' },
            { id: 'e2', source: 'demoApp', target: 'agent', animated: true, label: 'API', sourceHandle: 'sb' },
            { id: 'e4', source: 'agent', target: 'ragSilo', animated: true, label: 'RAG/Tool', sourceHandle: 'sb' },
            { id: 'e5', source: 'webDomain', target: 'ragSilo', label: 'Indexado', animated: true, style: { strokeDasharray: '5,5' } }
        ]
    },
    audio: {
        nodes: [
            { id: 'audioInput', data: { label: 'Audio (Captura/Subida)' }, position: { x: 50, y: -140 }, type: 'input' },
            {
                id: 'audioGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 250, y: -50 },
                style: { width: 380, height: 240, border: '2px dashed #d63384', borderRadius: '16px', background: 'rgba(214, 51, 132, 0.03)' },
                type: 'group'
            },
            { id: 'audioAgent', data: { label: 'Agente Audio' }, position: { x: 100, y: 120 }, parentId: 'audioGroup', extent: 'parent' },
            { id: 'mcpSTT', data: { label: 'MCP Tool (STT)' }, position: { x: 250, y: 30 }, parentId: 'audioGroup', extent: 'parent' },
            { id: 'ddStructureAudio', data: { label: 'ddStructure (JSON)' }, position: { x: 10, y: 20 }, parentId: 'audioGroup', extent: 'parent' },
            { id: 'sentimentLLM', data: { label: 'LLM Sentiment' }, position: { x: 700, y: 150 } }
        ],
        edges: [
            { id: 'e1', source: 'audioInput', target: 'audioAgent', targetHandle: 'l', animated: true, sourceHandle: 'sb' },
            { id: 'e2', source: 'audioAgent', target: 'mcpSTT', sourceHandle: 'sr', targetHandle: 'l', label: 'Audio', animated: true },
            { id: 'e3', source: 'mcpSTT', target: 'audioAgent', sourceHandle: 'sb', targetHandle: 'r', label: 'Texto', animated: true, type: 'smoothstep' },
            { id: 'e4', source: 'audioAgent', target: 'sentimentLLM', sourceHandle: 'sb', targetHandle: 'l', label: 'Analizar', animated: true },
            { id: 'e5', source: 'ddStructureAudio', target: 'audioAgent', sourceHandle: 'sb', targetHandle: 't', label: 'Config', animated: false }
        ]
    },
    ocr: {
        nodes: [
            { id: 'capture', data: { label: 'Captura Imagen' }, position: { x: 180, y: -50 } },
            {
                id: 'ocrGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 360, y: -60 },
                style: { width: 380, height: 220, border: '2px dashed #28a745', borderRadius: '16px', background: 'rgba(40, 167, 69, 0.03)' },
                type: 'group'
            },
            { id: 'ocrAgent', data: { label: 'Agente OCR' }, position: { x: 100, y: 110 }, parentId: 'ocrGroup', extent: 'parent' },
            { id: 'ddStructure', data: { label: 'Dynamic Data Structure' }, position: { x: 200, y: 20 }, parentId: 'ocrGroup', extent: 'parent' },
            { id: 'multimodalLLM', data: { label: 'LLM Multimodal' }, position: { x: 810, y: 170 } }
        ],
        edges: [
            { id: 'e2', source: 'capture', target: 'ocrAgent', targetHandle: 'l', label: 'Imagen', animated: true, sourceHandle: 'sb' },
            { id: 'e3', source: 'ocrAgent', target: 'multimodalLLM', sourceHandle: 'sb', label: 'Texto', animated: true },
            { id: 'e4', source: 'ddStructure', target: 'ocrAgent', sourceHandle: 'sb', targetHandle: 'r', label: 'Estructura', animated: false, type: 'smoothstep' }
        ]
    },
    sat: {
        nodes: [
            // Incident Creation Path (Left)
            { id: 'userCall', data: { label: 'Usuario (Call Center)' }, position: { x: 0, y: -60 }, type: 'input' },

            // Mattin.ai Platform Group
            {
                id: 'satGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 180, y: -30 },
                style: { width: 500, height: 300, border: '2px dashed #003366', borderRadius: '16px', background: 'rgba(0, 51, 102, 0.03)' },
                type: 'group'
            },
            { id: 'satAgent', data: { label: 'Agente SAT' }, position: { x: 30, y: 50 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'mcpTools', data: { label: 'MCP Tools' }, position: { x: 30, y: 160 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'ragEngine', data: { label: 'RAG Engine' }, position: { x: 200, y: 100 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'siloInc', data: { label: 'Silo Incidencias' }, position: { x: 350, y: 50 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'siloDocs', data: { label: 'Silo Documentación' }, position: { x: 350, y: 160 }, parentId: 'satGroup', extent: 'parent' },

            // External Components
            { id: 'database', data: { label: 'Base de Datos' }, position: { x: 200, y: 370 } },
            { id: 'technician', data: { label: 'Técnico' }, position: { x: 750, y: 320 } },
            { id: 'output', data: { label: 'Sugerencias' }, position: { x: 750, y: 220 }, type: 'output' }
        ],
        edges: [
            // Incident Creation Flow (User → Agent → MCP → DB)
            { id: 'e1', source: 'userCall', target: 'satAgent', animated: true, sourceHandle: 'sb', targetHandle: 'l', label: 'Abre Inc.' },
            { id: 'e2', source: 'satAgent', target: 'mcpTools', sourceHandle: 'sb', targetHandle: 't', label: 'Tool Call', animated: true },
            { id: 'e3', source: 'mcpTools', target: 'database', sourceHandle: 'sb', targetHandle: 't', label: 'Crear Inc.', animated: true },

            // Technician Resolution Flow (Tech → DB → RAG → Silos → Suggestions)
            { id: 'e4', source: 'technician', target: 'database', sourceHandle: 'sb', targetHandle: 'r', label: 'Selecciona Inc.' },
            { id: 'e5', source: 'database', target: 'ragEngine', label: 'Buscar', animated: true, targetHandle: 'sb', sourceHandle: 'sr' },
            { id: 'e6', source: 'ragEngine', target: 'siloInc', sourceHandle: 'sr', targetHandle: 'l', label: 'Query' },
            { id: 'e7', source: 'ragEngine', target: 'siloDocs', sourceHandle: 'sr', targetHandle: 'l', label: 'Query' },
            { id: 'e8', source: 'siloInc', target: 'output', sourceHandle: 'sr', targetHandle: 't', label: 'Similares', animated: true, type: 'smoothstep' },
            { id: 'e9', source: 'siloDocs', target: 'output', sourceHandle: 'sr', targetHandle: 'b', label: 'Manuales', animated: true, type: 'smoothstep' },
            { id: 'e12', source: 'technician', target: 'ragEngine', sourceHandle: 'sl', targetHandle: 'b', label: 'Cerrar Inc.', animated: false, type: 'smoothstep', style: { strokeWidth: 3, stroke: '#c41432' } },
            { id: 'e13', source: 'output', target: 'technician', sourceHandle: 'sr', targetHandle: 'r', label: 'Info+', animated: true, type: 'smoothstep' },
            { id: 'e14', source: 'ragEngine', target: 'siloInc', sourceHandle: 'sr', targetHandle: 'b', label: 'Index', animated: false, type: 'smoothstep', style: { strokeWidth: 3, stroke: '#c41432' } },
            { id: 'e15', source: 'ragEngine', target: 'siloDocs', sourceHandle: 'sr', targetHandle: 't', label: 'Index', animated: false, type: 'smoothstep', style: { strokeWidth: 3, stroke: '#c41432' } },


        ]
    },
    swarm: {
        nodes: [
            { id: 'input', data: { label: 'Reto planteado' }, position: { x: 0, y: 150 }, type: 'input' },
            {
                id: 'swarmGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 180, y: 20 },
                style: { width: 450, height: 280, border: '2px dashed #1a4b8c', borderRadius: '16px', background: 'rgba(26, 75, 140, 0.03)' },
                type: 'group'
            },
            { id: 'agentA', data: { label: 'Agente Estrategia' }, position: { x: 20, y: 40 }, parentId: 'swarmGroup' },
            { id: 'agentB', data: { label: 'Agente Creativo' }, position: { x: 20, y: 110 }, parentId: 'swarmGroup' },
            { id: 'agentC', data: { label: 'Agente Crítico' }, position: { x: 20, y: 180 }, parentId: 'swarmGroup' },
            { id: 'mod', data: { label: 'Moderador IA' }, position: { x: 250, y: 110 }, parentId: 'swarmGroup' },
            { id: 'output', data: { label: 'Conclusión' }, position: { x: 680, y: 150 }, type: 'output' }
        ],
        edges: [
            { id: 'e1', source: 'input', target: 'agentA', animated: true },
            { id: 'e2', source: 'input', target: 'agentB', animated: true },
            { id: 'e3', source: 'input', target: 'agentC', animated: true },
            { id: 'e4', source: 'agentA', target: 'mod', label: 'Argumentos' },
            { id: 'e5', source: 'agentB', target: 'mod', label: 'Ideas' },
            { id: 'e6', source: 'agentC', target: 'mod', label: 'Feedback' },
            { id: 'e7', source: 'mod', target: 'output', label: 'Síntesis', animated: true }
        ]
    }
};
