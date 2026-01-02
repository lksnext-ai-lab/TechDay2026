
export const MACHINES = [
    { id: 'APP001', type: 'Lavadora', brand: 'Fagor', model: '3KB-8800', serial: 'FGR-W-8800-01', location: 'Cocina', available: true },
    { id: 'APP002', type: 'Frigorífico', brand: 'Samsung', model: 'RF260', serial: 'SMG-F-260-22', location: 'Cocina', available: true },
    { id: 'APP003', type: 'Secadora', brand: 'Bosch', model: 'Serie 6', serial: 'BSC-D-600-99', location: 'Lavandería', available: true },
    { id: 'APP004', type: 'Horno', brand: 'Beko', model: 'BIE22300', serial: 'BKO-O-223-11', location: 'Cocina', available: false }, // En mantenimiento
    { id: 'APP005', type: 'Lavavajillas', brand: 'Fagor', model: 'LVF-13', serial: 'FGR-D-13-55', location: 'Cocina', available: true }
];

export const INCIDENTS = [
    {
        id: 'INC-001',
        machineId: 'APP001',
        title: 'Centrifugado ruidoso',
        description: 'La lavadora hace un ruido muy fuerte al centrifugar a altas revoluciones.',
        status: 'open', // open, in_progress, resolved, closed
        priority: 'high', // low, medium, high, critical
        reportedBy: 'Cliente Final',
        createdAt: '2024-05-10T09:30:00Z',
        logs: [
            { date: '2024-05-10T09:35:00Z', author: 'Sistema', text: 'Incidencia creada.' },
            { date: '2024-05-10T10:00:00Z', author: 'Téc. Maria', text: 'Solicitada visita técnica.' }
        ]
    },
    {
        id: 'INC-002',
        machineId: 'APP004',
        title: 'No calienta',
        description: 'El horno enciende pero no alcanza la temperatura deseada.',
        status: 'in_progress',
        priority: 'critical',
        reportedBy: 'Cliente Final',
        createdAt: '2024-05-11T08:00:00Z',
        logs: [
            { date: '2024-05-11T08:00:00Z', author: 'Sistema', text: 'Incidencia creada.' },
            { date: '2024-05-11T09:15:00Z', author: 'Téc. Pedro', text: 'Resistencia quemada. Repuesto solicitado.' }
        ]
    },
    {
        id: 'INC-003',
        machineId: 'APP002',
        title: 'Fuga de agua',
        description: 'Pequeño charco de agua bajo el frigorífico.',
        status: 'resolved',
        priority: 'medium',
        reportedBy: 'Cliente Final',
        createdAt: '2024-05-08T14:20:00Z',
        logs: [
            { date: '2024-05-08T14:20:00Z', author: 'Sistema', text: 'Incidencia creada.' },
            { date: '2024-05-09T11:00:00Z', author: 'Téc. Maria', text: 'Desagüe desatascado.' }
        ],
        closedAt: '2024-05-09T11:05:00Z'
    }
];

// Helper functions to simulate API calls
export const getMachines = () => Promise.resolve([...MACHINES]);

export const getIncidents = () => {
    // In a real app we would fetch from DB. Here we use a window variable to persist edits in memory during session
    if (!window.MOCK_INCIDENTS) {
        window.MOCK_INCIDENTS = [...INCIDENTS];
    }
    // Return a copy to avoid direct mutation issues
    return Promise.resolve([...window.MOCK_INCIDENTS]);
};

export const createIncident = (newIncident) => {
    if (!window.MOCK_INCIDENTS) {
        window.MOCK_INCIDENTS = [...INCIDENTS];
    }
    const incident = {
        ...newIncident,
        id: `INC-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'open',
        logs: [{ date: new Date().toISOString(), author: 'Sistema', text: 'Incidencia creada.' }]
    };
    window.MOCK_INCIDENTS.unshift(incident);
    return Promise.resolve(incident);
};

export const updateIncident = (id, updates) => {
    if (!window.MOCK_INCIDENTS) {
        window.MOCK_INCIDENTS = [...INCIDENTS];
    }
    const index = window.MOCK_INCIDENTS.findIndex(inc => inc.id === id);
    if (index !== -1) {
        window.MOCK_INCIDENTS[index] = { ...window.MOCK_INCIDENTS[index], ...updates };
        return Promise.resolve(window.MOCK_INCIDENTS[index]);
    }
    return Promise.reject('Incident not found');
};

export const addLog = (id, logEntry) => {
    if (!window.MOCK_INCIDENTS) {
        window.MOCK_INCIDENTS = [...INCIDENTS];
    }
    const index = window.MOCK_INCIDENTS.findIndex(inc => inc.id === id);
    if (index !== -1) {
        const updatedLogs = [...window.MOCK_INCIDENTS[index].logs, { ...logEntry, date: new Date().toISOString() }];
        window.MOCK_INCIDENTS[index] = { ...window.MOCK_INCIDENTS[index], logs: updatedLogs };
        return Promise.resolve(window.MOCK_INCIDENTS[index]);
    }
    return Promise.reject('Incident not found');
}
