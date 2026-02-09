export const flows = {
    chat: {
        nodes: [
            { id: 'user', data: { label: 'Usuario' }, position: { x: 0, y: -40 }, type: 'input' },
            { id: 'demoApp', data: { label: 'Demo App' }, position: { x: 80, y: 50 } },

            {
                id: 'platformGroup',
                data: { label: 'Mattin.ai Platform' },
                position: { x: 250, y: 80 },
                style: { width: 380, height: 220, border: '2px dashed #F85900', borderRadius: '16px', background: 'rgba(248, 89, 0, 0.03)' },
                type: 'group'
            },
            { id: 'agent', data: { label: 'Agente' }, position: { x: 20, y: 60 }, parentId: 'platformGroup', extent: 'parent' },
            { id: 'ragSilo', data: { label: 'RAG / Silo' }, position: { x: 210, y: 150 }, parentId: 'platformGroup', extent: 'parent', type: 'output' },
            { id: 'webDomain', data: { label: 'Web / Dominio' }, position: { x: 650, y: 80 } }
        ],
        edges: [
            { id: 'e1', source: 'user', target: 'demoApp', animated: true },
            { id: 'e2', source: 'demoApp', target: 'agent', animated: true, label: 'API' },
            { id: 'e4', source: 'agent', target: 'ragSilo', animated: true, label: 'RAG/Tool' },
            { id: 'e5', source: 'webDomain', target: 'ragSilo', label: 'Indexado', animated: true, style: { strokeDasharray: '5,5' } }
        ]
    },
    audio: {
        nodes: [
            { id: '1', data: { label: 'Captura de audio' }, position: { x: 0, y: 100 }, type: 'input' },
            { id: '2', data: { label: 'Azure STT' }, position: { x: 200, y: 40 } },
            { id: '3', data: { label: 'Análisis NLP' }, position: { x: 200, y: 160 } },
            { id: '4', data: { label: 'Sintetizador' }, position: { x: 400, y: 100 } },
            { id: '5', data: { label: 'Resultados e Insights' }, position: { x: 600, y: 100 }, type: 'output' }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e1-3', source: '1', target: '3', animated: true },
            { id: 'e2-4', source: '2', target: '4' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5' }
        ]
    },
    ocr: {
        nodes: [
            { id: '1', data: { label: 'Captura Imagen' }, position: { x: 0, y: 100 }, type: 'input' },
            { id: '2', data: { label: 'Preprocesamiento' }, position: { x: 200, y: 100 } },
            { id: '3', data: { label: 'Vision AI OCR' }, position: { x: 400, y: 40 } },
            { id: '4', data: { label: 'Claude Vision' }, position: { x: 400, y: 160 } },
            { id: '5', data: { label: 'Datos Estructurados' }, position: { x: 600, y: 100 }, type: 'output' }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e2-4', source: '2', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
            { id: 'e4-5', source: '4', target: '5' }
        ]
    },
    sat: {
        nodes: [
            { id: '1', data: { label: 'Registro Incidencia' }, position: { x: 0, y: 100 }, type: 'input' },
            { id: '2', data: { label: 'Búsqueda Semántica' }, position: { x: 200, y: 100 } },
            { id: '3', data: { label: 'Vector DB' }, position: { x: 400, y: 40 } },
            { id: '4', data: { label: 'RAG Engine' }, position: { x: 400, y: 160 } },
            { id: '5', data: { label: 'Propuesta Solución' }, position: { x: 600, y: 100 }, type: 'output' }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e2-4', source: '2', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
            { id: 'e4-5', source: '4', target: '5' }
        ]
    },
    swarm: {
        nodes: [
            { id: '1', data: { label: 'Reto planteado' }, position: { x: 0, y: 150 }, type: 'input' },
            { id: '2', data: { label: 'Agente A' }, position: { x: 250, y: 50 } },
            { id: '3', data: { label: 'Agente B' }, position: { x: 250, y: 150 } },
            { id: '4', data: { label: 'Agente C' }, position: { x: 250, y: 250 } },
            { id: '5', data: { label: 'Moderador IA' }, position: { x: 500, y: 150 } },
            { id: '6', data: { label: 'Conclusión Final' }, position: { x: 750, y: 150 }, type: 'output' }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e1-3', source: '1', target: '3', animated: true },
            { id: 'e1-4', source: '1', target: '4', animated: true },
            { id: 'e2-5', source: '2', target: '5' },
            { id: 'e3-5', source: '3', target: '5' },
            { id: 'e4-5', source: '4', target: '5' },
            { id: 'e5-6', source: '5', target: '6', animated: true }
        ]
    }
};
