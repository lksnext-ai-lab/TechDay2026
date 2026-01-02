const API_BASE_URL = 'http://localhost:8001/api/sat';

export const satService = {
    getMachines: async () => {
        const response = await fetch(`${API_BASE_URL}/machines`);
        if (!response.ok) throw new Error('Failed to fetch machines');
        return response.json();
    },

    getIncidents: async () => {
        const response = await fetch(`${API_BASE_URL}/incidents`);
        if (!response.ok) throw new Error('Failed to fetch incidents');
        return response.json();
    },

    createIncident: async (incidentData) => {
        const response = await fetch(`${API_BASE_URL}/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incidentData),
        });
        if (!response.ok) throw new Error('Failed to create incident');
        return response.json();
    },

    updateIncident: async (id, updates) => {
        const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update incident');
        return response.json();
    },

    addLog: async (incidentId, logData) => {
        const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });
        if (!response.ok) throw new Error('Failed to add log');
        return response.json();
    }
};
