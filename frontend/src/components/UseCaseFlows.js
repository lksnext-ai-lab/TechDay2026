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
            { id: 'incident', data: { label: 'Registro Incidencia' }, position: { x: 0, y: 150 }, type: 'input' },
            { id: 'search', data: { label: 'Búsqueda Semántica' }, position: { x: 180, y: 150 } },
            {
                id: 'satGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 360, y: 40 },
                style: { width: 380, height: 220, border: '2px dashed #003366', borderRadius: '16px', background: 'rgba(0, 51, 102, 0.03)' },
                type: 'group'
            },
            { id: 'vector', data: { label: 'Vector DB' }, position: { x: 20, y: 110 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'rag', data: { label: 'RAG Engine' }, position: { x: 210, y: 110 }, parentId: 'satGroup', extent: 'parent' },
            { id: 'solution', data: { label: 'Propuesta Solución' }, position: { x: 800, y: 150 }, type: 'output' }
        ],
        edges: [
            { id: 'e1', source: 'incident', target: 'search', animated: true },
            { id: 'e2', source: 'search', target: 'vector', label: 'Consulta', animated: true },
            { id: 'e3', source: 'vector', target: 'rag', label: 'Contexto', animated: true },
            { id: 'e4', source: 'rag', target: 'solution', label: 'Respuesta', animated: true }
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
